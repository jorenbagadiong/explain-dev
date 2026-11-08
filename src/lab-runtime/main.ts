// Coding Lab preview runtime. Bundled by Vite into public/lab-runtime/runtime.js and loaded only by
// public/lab-runtime/preview.html inside <iframe sandbox="allow-scripts">, which the CSP `sandbox` header also enforces.
//
// Trust: this file is ours, but after learner code runs it shares this realm and may tamper with it.
// The parent therefore treats every message from here as untrusted input.

import * as React from "react";
import { createElement, Fragment, useEffect, type ComponentType } from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as JsxDevRuntime from "react/jsx-dev-runtime";
import * as JsxRuntime from "react/jsx-runtime";

import { compileLearnerModule, wrapModule } from "@/lib/lab/compiler";
import { findModuleLine, summarizeComponentStack } from "@/lib/lab/diagnostics";
import {
  isInitMessage,
  isParentPortMessage,
  LAB_CHANNEL,
  LAB_PROTOCOL_VERSION,
  toDiagnostic,
  type HelloMessage,
  type InitMessage,
  type LabTheme,
  type PreviewEvent,
  type RuntimeErrorKind,
} from "@/lib/lab/protocol";
import { gradeChallenge } from "./challenge-grader";
import { createExecutionGuard, ExecutionLimitError } from "./execution-guard";

/** Exact parent origins compiled in by the dedicated-host build; null in the same-origin fallback build. */
declare const __LAB_PARENT_ORIGINS__: readonly string[] | null;

const HEARTBEAT_MS = 1_000;
const MAX_REPORTED_ERRORS = 10;

const MODULES = new Map<string, unknown>([
  ["react", React],
  ["react-dom", ReactDOM],
  ["react-dom/client", ReactDOMClient],
  ["react/jsx-runtime", JsxRuntime],
  ["react/jsx-dev-runtime", JsxDevRuntime],
]);

type Factory = (require: (name: string) => unknown, module: { exports: Record<string, unknown> }, exports: Record<string, unknown>, guard: () => void) => void;

function showNotice(text: string) {
  const root = document.getElementById("root");
  if (root) root.textContent = text;
}

function applyTheme(theme: LabTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function safeText(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value) ?? String(value);
  } catch {
    return "a value that could not be displayed";
  }
}

function isComponent(value: unknown): value is ComponentType {
  return typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value);
}

function RenderedSignal({ onRendered }: { onRendered: () => void }) {
  useEffect(onRendered, [onRendered]);
  return null;
}

function start(init: InitMessage, port: MessagePort) {
  // Capture before learner code exists.
  const post = port.postMessage.bind(port);
  const send = (event: PreviewEvent) => post({ channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, session: init.session, runId: init.runId, ...event });
  let moduleUrl = "";
  let reported = 0;
  let stopped = false;
  let rendered = false;
  let gradingErrorHandler: ((error: unknown) => void) | null = null;

  const report = (kind: RuntimeErrorKind, error: unknown, detail?: string) => {
    if ((stopped && kind !== "loop-guard") || reported >= MAX_REPORTED_ERRORS) return;
    if (init.gradingChallengeId && gradingErrorHandler && kind !== "loop-guard") {
      gradingErrorHandler(error);
      return;
    }
    reported++;
    let diagnostic;
    try {
      diagnostic = error instanceof Error
        ? toDiagnostic({ name: error.name, message: error.message, line: findModuleLine(error.stack, moduleUrl), detail })
        : toDiagnostic({ name: "Error", message: `A non-Error value was thrown: ${safeText(error)}`, detail });
    } catch {
      diagnostic = toDiagnostic({ name: "Error", message: "An error was thrown that could not be described." });
    }
    send({ type: "runtime-error", kind, diagnostic });
  };

  // Block link navigation before learner code exists. In an opaque-origin document the Navigation API fires no events,
  // so location.assign/replace/href and meta refresh cannot be cancelled here; the parent detects those by the frame's
  // second load event and removes the frame (one request may still leave; see docs/ed-019/security.md).
  addEventListener("click", (event) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest("a[href], area[href]") : null;
    if (!link || (link.getAttribute("href") ?? "").startsWith("#")) return;
    event.preventDefault();
    report("navigation", new Error("Links to other pages are disabled in the Coding Lab preview."));
  }, true);

  port.onmessage = (event) => {
    const data: unknown = event.data;
    if (isParentPortMessage(data) && data.session === init.session && data.runId === init.runId) applyTheme(data.theme);
  };
  applyTheme(init.theme);
  send({ type: "heartbeat" });
  setInterval(() => send({ type: "heartbeat" }), HEARTBEAT_MS);

  const result = compileLearnerModule(init.file);
  if (!result.ok) {
    send({ type: "compile-error", kind: result.kind, diagnostic: result.diagnostic });
    return;
  }

  const resetChannel = new MessageChannel();
  let pendingReset: (() => void) | null = null;
  resetChannel.port1.onmessage = () => {
    const reset = pendingReset;
    pendingReset = null;
    reset?.();
  };
  const { guard } = createExecutionGuard({
    now: () => performance.now(),
    scheduleReset: (reset) => {
      pendingReset = reset;
      resetChannel.port2.postMessage(null);
    },
    onTrip: (error) => {
      report("loop-guard", error);
      stopped = true;
    },
  });

  window.addEventListener("error", (event) => {
    if (init.gradingChallengeId) event.preventDefault();
    if (event.error instanceof ExecutionLimitError) return;
    report(rendered ? "event" : "module", event.error ?? new Error(event.message || "Script error"));
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (init.gradingChallengeId) event.preventDefault();
    if (event.reason instanceof ExecutionLimitError) return;
    report("promise", event.reason);
  });

  const requireModule = (name: string) => {
    if (!MODULES.has(name)) throw new Error(`"${name}" can't be imported in the Coding Lab.`);
    return MODULES.get(name);
  };

  const mount = (factory: Factory) => {
    const createApp = () => {
      const learnerModule = { exports: {} as Record<string, unknown> };
      factory(requireModule, learnerModule, learnerModule.exports, guard);
      const App = learnerModule.exports.default;
      if (!isComponent(App)) throw new TypeError("The default export is not a React component. Export a function component.");
      return App;
    };
    if (init.gradingChallengeId) {
      void gradeChallenge({ challengeId: init.gradingChallengeId, createApp, runId: init.runId, setErrorHandler: (handler) => { gradingErrorHandler = handler; } })
        .then((result) => { if (!stopped) send({ type: "grading-result", result }); })
        .catch((error) => report("render", error));
      return;
    }
    const learnerModule = { exports: {} as Record<string, unknown> };
    try {
      factory(requireModule, learnerModule, learnerModule.exports, guard);
    } catch (error) {
      report("module", error);
      return;
    }
    const App = learnerModule.exports.default;
    if (!isComponent(App)) {
      report("module", new TypeError("The default export is not a React component. Export a function component, for example: export default function App() { … }"));
      return;
    }
    const container = document.getElementById("root");
    if (!container) return;
    const root = ReactDOMClient.createRoot(container, {
      onUncaughtError: (error, info) => {
        console.error(error);
        report("render", error, summarizeComponentStack(info.componentStack));
      },
    });
    const onRendered = () => {
      if (rendered || stopped) return;
      rendered = true;
      send({ type: "rendered" });
    };
    root.render(createElement(Fragment, null, createElement(App), createElement(RenderedSignal, { onRendered })));
  };

  const random = crypto.getRandomValues(new Uint32Array(2));
  const callbackName = `labModule${random[0].toString(36)}${random[1].toString(36)}`;
  const scope = self as unknown as Record<string, unknown>;
  scope[callbackName] = (factory: Factory) => {
    delete scope[callbackName];
    mount(factory);
  };
  moduleUrl = URL.createObjectURL(new Blob([wrapModule(callbackName, result.code)], { type: "text/javascript" }));
  const script = document.createElement("script");
  script.src = moduleUrl;
  script.onerror = () => report("module", new Error("The compiled module could not be loaded."));
  document.head.append(script);
}

/**
 * WebRTC is not governed by CSP (connect-src does not apply and the proposed `webrtc` directive is not implemented),
 * so a peer connection can send STUN/TURN traffic to any host. Remove the constructors before learner code exists.
 * Defense in depth only: the other RTC interfaces cannot be constructed, and new realms (frames, workers) are blocked by CSP.
 */
function disableWebRtc() {
  const scope = self as unknown as Record<string, unknown>;
  for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection", "mozRTCPeerConnection"]) {
    try {
      delete scope[name];
    } catch {
      // Not deletable in this engine; the definition below still shadows it.
    }
    try {
      Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false, enumerable: false });
    } catch {
      // Already locked.
    }
  }
}

function boot() {
  disableWebRtc();
  // Refuse to run unless the browser isolated this document into an opaque origin inside a frame.
  if (self.origin !== "null") {
    showNotice("This preview only runs inside the Explain Dev Coding Lab sandbox.");
    return;
  }
  if (window.parent === window) {
    showNotice("Open the Coding Lab to use this preview.");
    return;
  }

  const parentOrigins = __LAB_PARENT_ORIGINS__ ?? [new URL(location.href).origin];
  let initialized = false;
  const onMessage = (event: MessageEvent) => {
    if (initialized || event.source !== window.parent || !parentOrigins.includes(event.origin)) return;
    if (!isInitMessage(event.data) || event.ports.length !== 1) return;
    initialized = true;
    window.removeEventListener("message", onMessage);
    start(event.data, event.ports[0]);
  };
  window.addEventListener("message", onMessage);
  const hello: HelloMessage = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "hello" };
  // Only a parent whose origin is allowlisted receives the hello; other targets are dropped by the browser.
  for (const origin of parentOrigins) window.parent.postMessage(hello, origin);
}

boot();
