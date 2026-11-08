"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { GRADING_TIMEOUT_MS, type CounterChallengeId, type GradingResult } from "@/lib/lab/grading";
import { LAB_PREVIEW_TARGET } from "@/lib/lab/preview-target";
import {
  isHelloMessage,
  isIncompatibleHello,
  isPreviewMessage,
  LAB_CHANNEL,
  LAB_PREVIEW_SANDBOX,
  LAB_PROTOCOL_VERSION,
  type CompileErrorKind,
  type InitMessage,
  type LabDiagnostic,
  type LabFile,
  type LabTheme,
  type ParentPortMessage,
  type RuntimeErrorKind,
} from "@/lib/lab/protocol";

export const HELLO_TIMEOUT_MS = 10_000;
export const RENDER_TIMEOUT_MS = 8_000;
export const HEARTBEAT_TIMEOUT_MS = 5_000;
/** Unexpected messages tolerated per frame before the preview is closed as misbehaving. */
export const MAX_REJECTED_MESSAGES = 50;

export type PreviewFrameEvent =
  | { type: "grading-result"; result: GradingResult }
  | { type: "connected"; readyMs: number }
  | { type: "rendered"; renderMs: number }
  | { type: "compile-error"; kind: CompileErrorKind; diagnostic: LabDiagnostic }
  | { type: "runtime-error"; kind: RuntimeErrorKind; diagnostic: LabDiagnostic }
  | { type: "stopped"; reason: "loop-guard" | "timeout" | "unresponsive" | "navigated" | "protocol-violation"; diagnostic?: LabDiagnostic }
  | { type: "failed"; reason: "unavailable" | "incompatible" };

/** Per-frame capability. crypto.randomUUID needs a secure context, so fall back to getRandomValues. */
export function createSession(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface PreviewFrameProps {
  runId: number;
  file: LabFile;
  theme: LabTheme;
  title: string;
  gradingChallengeId?: CounterChallengeId;
  ownsPolicyViolations?: () => boolean;
  onInteractiveFocus?: () => void;
  onEvent: (event: PreviewFrameEvent) => void;
}

/**
 * One sandboxed preview document for one run. Mount with `key={runId}` so every run gets a fresh browsing context.
 * Accepts exactly one hello from its own frame, then talks only over a private MessagePort bound to a random session.
 */
export function PreviewFrame({ runId, file, theme, title, gradingChallengeId, ownsPolicyViolations, onInteractiveFocus, onEvent }: PreviewFrameProps) {
  const [active, setActive] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onEventRef = useRef(onEvent);
  const themeRef = useRef(theme);
  const policyOwnerRef = useRef(ownsPolicyViolations);
  const interactiveFocusRef = useRef(onInteractiveFocus);
  const connection = useRef<{ port: MessagePort; session: string } | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
    policyOwnerRef.current = ownsPolicyViolations;
    interactiveFocusRef.current = onInteractiveFocus;
  }, [onEvent, ownsPolicyViolations, onInteractiveFocus]);

  useEffect(() => {
    themeRef.current = theme;
    const current = connection.current;
    if (!current) return;
    const message: ParentPortMessage = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, session: current.session, runId, type: "theme", theme };
    current.port.postMessage(message);
  }, [theme, runId]);

  // Layout effect: listeners exist before the frame can load or post anything.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const session = createSession();
    const mountedAt = performance.now();
    let phase: "loading" | "connected" | "settled" | "closed" = "loading";
    let loads = 0;
    let rejected = 0;
    let lastBeat = mountedAt;
    let port: MessagePort | null = null;
    let renderTimer: number | undefined;
    let lastAppFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const rememberAppFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target !== frame && event.target !== document.body) lastAppFocus = event.target;
    };
    const restoreGradingFocus = () => {
      // Browsers can focus an inner autofocus control even in an inert iframe. Never let a
      // disposable test document take focus from the learner's latest app control.
      if (gradingChallengeId && document.activeElement === frame && lastAppFocus?.isConnected) {
        frame.blur();
        lastAppFocus.focus({ preventScroll: true });
      }
    };


    const onFrameFocus = () => {
      if (document.activeElement !== frame) return;
      if (gradingChallengeId) restoreGradingFocus();
      else interactiveFocusRef.current?.();
    };

    const emit = (event: PreviewFrameEvent) => {
      if (phase !== "closed") onEventRef.current(event);
    };
    const markRejected = () => {
      rejected++;
      if (wrapperRef.current) wrapperRef.current.dataset.rejectedMessages = String(rejected);
      if (rejected > MAX_REJECTED_MESSAGES && phase !== "closed") terminate({ type: "stopped", reason: "protocol-violation" });
    };
    const close = () => {
      phase = "closed";
      window.clearTimeout(helloTimer);
      window.clearTimeout(renderTimer);
      window.clearInterval(watchdog);
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("blur", onFrameFocus);
      document.removeEventListener("focusin", rememberAppFocus);
      restoreGradingFocus();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("securitypolicyviolation", onPolicyViolation);
      frame.removeEventListener("load", onLoad);
      if (port) {
        port.onmessage = null;
        port.close();
      }
      connection.current = null;
    };
    // Report, then remove the iframe so its document and timers are discarded.
    const terminate = (event: PreviewFrameEvent) => {
      emit(event);
      close();
      setActive(false);
    };

    const onPortMessage = (event: MessageEvent) => {
      const data: unknown = event.data;
      if (phase === "closed") return;
      if (!isPreviewMessage(data) || data.session !== session || data.runId !== runId) {
        markRejected();
        return;
      }
      lastBeat = performance.now();
      switch (data.type) {
        case "heartbeat":
          return;
        case "grading-result":
          if (!gradingChallengeId || phase !== "connected" || data.result.challengeId !== gradingChallengeId) { markRejected(); return; }
          terminate({ type: "grading-result", result: data.result });
          return;
        case "rendered":
          if (gradingChallengeId) { markRejected(); return; }
          if (phase === "connected") {
            phase = "settled";
            window.clearTimeout(renderTimer);
            emit({ type: "rendered", renderMs: performance.now() - mountedAt });
          }
          return;
        case "compile-error":
          terminate({ type: "compile-error", kind: data.kind, diagnostic: data.diagnostic });
          return;
        case "runtime-error":
          if (data.kind === "loop-guard") {
            terminate({ type: "stopped", reason: "loop-guard", diagnostic: data.diagnostic });
            return;
          }
          if (phase === "connected") {
            phase = "settled";
            window.clearTimeout(renderTimer);
          }
          emit({ type: "runtime-error", kind: data.kind, diagnostic: data.diagnostic });
      }
    };

    const onWindowMessage = (event: MessageEvent) => {
      // Messages from other windows are not addressed to this frame.
      if (event.source !== frame.contentWindow) return;
      if (phase === "loading" && event.origin === "null" && isIncompatibleHello(event.data)) {
        // App and preview host were built for different protocol versions: fail closed, never run.
        terminate({ type: "failed", reason: "incompatible" });
        return;
      }
      // The runtime is a deferred script, so its hello may arrive before or after the first load event (engine-dependent);
      // any later load is a navigation and is handled by onLoad.
      if (phase !== "loading" || loads > 1 || event.origin !== "null" || !isHelloMessage(event.data)) {
        markRejected();
        return;
      }
      phase = "connected";
      window.clearTimeout(helloTimer);
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = onPortMessage;
      connection.current = { port, session };
      const init: InitMessage = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "init", session, runId, theme: themeRef.current, file: { name: file.name, code: file.code }, ...(gradingChallengeId ? { gradingChallengeId } : {}) };
      // An opaque-origin document can only be addressed with "*". The private port is transferred to this frame only.
      frame.contentWindow?.postMessage(init, "*", [channel.port2]);
      lastBeat = performance.now();
      renderTimer = window.setTimeout(() => {
        if (phase === "connected") terminate({ type: "stopped", reason: "timeout" });
      }, gradingChallengeId ? GRADING_TIMEOUT_MS : RENDER_TIMEOUT_MS);
      emit({ type: "connected", readyMs: performance.now() - mountedAt });
    };

    const onLoad = () => {
      loads++;
      // A second load means the preview navigated itself. Remove it instead of trusting the new document.
      if (loads > 1) terminate({ type: "stopped", reason: "navigated" });
    };
    // The Practice page's CSP frame-src refuses navigations of the preview to other origins before any request is sent.
    // Chromium then loads an error page (a second load event); Firefox keeps the current document, so the violation event
    // on this document is the signal. Either way, the learner is told and the preview is removed.
    const onPolicyViolation = (event: SecurityPolicyViolationEvent) => {
      // Browsers report frame-src violations on the parent document, without a frame ID.
      // Let the workspace nominate the active grading frame while it exists, so a test's
      // blocked navigation cannot tear down the unrelated interactive preview.
      if (event.timeStamp < mountedAt || policyOwnerRef.current?.() === false) return;
      const directive = event.effectiveDirective || event.violatedDirective;
      if (phase !== "closed" && (directive === "frame-src" || directive === "child-src")) terminate({ type: "stopped", reason: "navigated" });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") lastBeat = performance.now();
    };

    const helloTimer = window.setTimeout(() => {
      if (phase === "loading") terminate({ type: "failed", reason: "unavailable" });
    }, HELLO_TIMEOUT_MS);
    // Hidden tabs throttle timers in both documents, so only judge responsiveness while visible.
    const watchdog = window.setInterval(() => {
      if ((phase === "connected" || phase === "settled") && document.visibilityState === "visible" && performance.now() - lastBeat > HEARTBEAT_TIMEOUT_MS) {
        terminate({ type: "stopped", reason: "unresponsive" });
      }
    }, 1_000);

    window.addEventListener("message", onWindowMessage);
    window.addEventListener("blur", onFrameFocus);
    if (gradingChallengeId) {
      document.addEventListener("focusin", rememberAppFocus);
    }
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("securitypolicyviolation", onPolicyViolation);
    frame.addEventListener("load", onLoad);
    return close;
  }, [runId, file, gradingChallengeId]);

  return (
    <div ref={wrapperRef} data-preview-frame="" data-grading-frame={gradingChallengeId ? "" : undefined} data-preview-mode={LAB_PREVIEW_TARGET.mode} data-run-id={runId} className="h-full">
      {active ? (
        <iframe
          ref={frameRef}
          src={LAB_PREVIEW_TARGET.url}
          sandbox={LAB_PREVIEW_SANDBOX}
          referrerPolicy="no-referrer"
          title={title}
          tabIndex={gradingChallengeId ? -1 : undefined}
          aria-hidden={gradingChallengeId ? true : undefined}
          className="block h-full w-full border-0 bg-transparent"
        />
      ) : null}
    </div>
  );
}
