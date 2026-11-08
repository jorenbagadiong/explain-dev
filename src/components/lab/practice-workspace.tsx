"use client";

import { Component, useCallback, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { CircleCheck, FileCode2, LoaderCircle, ListChecks, Play, RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COUNTER_CHALLENGE_ID, COUNTER_TESTS } from "@/lib/lab/grading";
import { LearningProgress } from "./learning-progress";
import { useChallengeProgress } from "./use-challenge-progress";
import type { ChallengeProgressSession, ProgressSnapshot } from "@/lib/storage/challenge-progress";
import { GradingResults, type GradingState } from "./grading-results";
import { createCodeFrame } from "@/lib/lab/diagnostics";
import type { CompileErrorKind, LabDiagnostic, LabFile, LabTheme, RuntimeErrorKind } from "@/lib/lab/protocol";
import { CodeEditor } from "./code-editor";
import { PreviewFrame, RENDER_TIMEOUT_MS, type PreviewFrameEvent } from "./preview-frame";
import styles from "./lab.module.css";

export type PreviewStatus =
  | { kind: "starting" }
  | { kind: "rendering" }
  | { kind: "ready" }
  | { kind: "compile-error"; errorKind: CompileErrorKind; diagnostic: LabDiagnostic }
  | { kind: "runtime-error" }
  | { kind: "stopped"; reason: "loop-guard" | "timeout" | "unresponsive" | "navigated" | "protocol-violation"; diagnostic?: LabDiagnostic }
  | { kind: "failed"; reason: "unavailable" | "incompatible" };

interface RuntimeProblem {
  id: number;
  kind: RuntimeErrorKind;
  diagnostic: LabDiagnostic;
}

const MAX_PROBLEMS = 5;

const RUNTIME_KIND_LABEL: Record<RuntimeErrorKind, string> = {
  module: "While loading your module",
  render: "While rendering",
  event: "In an event handler or timer",
  promise: "In an unhandled promise",
  "loop-guard": "Execution limit",
  navigation: "Navigation blocked",
};

const STOPPED_MESSAGE: Record<Extract<PreviewStatus, { kind: "stopped" }>["reason"], string> = {
  "loop-guard": "The preview was stopped because your code ran for more than one second without pausing. Look for an infinite loop or endless recursion.",
  timeout: `The preview didn't finish rendering within ${RENDER_TIMEOUT_MS / 1000} seconds, so it was closed.`,
  unresponsive: "The preview stopped responding, so it was closed. Code that never pauses can freeze the preview.",
  navigated: "The preview tried to open another page. Navigation is disabled in the Coding Lab, so the preview was closed.",
  "protocol-violation": "The preview sent too many unexpected messages, so it was closed.",
};

const FAILED_MESSAGE: Record<Extract<PreviewStatus, { kind: "failed" }>["reason"], string> = {
  unavailable: "The preview couldn't start. Check your connection, then run again.",
  incompatible: "The preview service is a different version from this page. Reload the page; if this persists, the Coding Lab is being updated.",
};

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);
}

export function statusLabel(status: PreviewStatus, dirty: boolean): string {
  switch (status.kind) {
    case "starting": return "Starting preview…";
    case "rendering": return "Rendering…";
    case "ready": return dirty ? "Code changed. Run to update the preview." : "Preview is up to date.";
    case "compile-error": return status.diagnostic.line ? `Compile error on line ${status.diagnostic.line}.` : "Compile error.";
    case "runtime-error": return "Runtime error. See Problems.";
    case "stopped": return status.reason === "loop-guard" ? "Stopped: possible infinite loop." : status.reason === "navigated" ? "Stopped: navigation blocked." : status.reason === "protocol-violation" ? "Stopped: unexpected messages." : "Stopped: the preview didn't respond.";
    case "failed": return status.reason === "incompatible" ? "Preview unavailable: version mismatch." : "The preview couldn't start.";
  }
}

class EditorBoundary extends Component<{ onRecover: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex h-full flex-col items-start justify-center gap-3 p-6 text-sm">
        <p className="font-medium">The editor stopped working.</p>
        <p className="text-muted-foreground">Your code is kept. Reload the editor to continue.</p>
        <Button type="button" variant="outline" onClick={() => { this.setState({ failed: false }); this.props.onRecover(); }}>Reload editor</Button>
      </div>
    );
  }
}

function DiagnosticView({ diagnostic, source }: { diagnostic: LabDiagnostic; source: string }) {
  const frame = createCodeFrame(source, diagnostic.line);
  return (
    <div className="min-w-0">
      <p className="text-sm leading-6"><span className="font-semibold">{diagnostic.name}:</span> {diagnostic.message}</p>
      {diagnostic.line ? <p className="mt-1 text-xs text-muted-foreground">Line {diagnostic.line}{diagnostic.column ? `, column ${diagnostic.column}` : ""}</p> : null}
      {frame.length ? (
        <pre className={styles.codeFrame} aria-label={`Code around line ${diagnostic.line}`}>
          {frame.map((line) => (
            <span key={line.number} className={line.highlighted ? styles.codeFrameHighlight : undefined}>
              <span className={styles.codeFrameNumber} aria-hidden="true">{line.number}</span>{line.text || " "}{"\n"}
            </span>
          ))}
        </pre>
      ) : null}
      {diagnostic.detail ? <pre className={styles.componentStack}>{diagnostic.detail}</pre> : null}
    </div>
  );
}

export interface PracticeWorkspaceProps {
  challengeId: string;
  gradingRevision: string;
  starterRevision: string;
  hints: readonly string[];
  challengeTitle: string;
  starterFile: LabFile;
  onMetric?: (name: "editor-init" | "preview-ready" | "preview-render", ms: number) => void;
}

export function PracticeWorkspace(props: PracticeWorkspaceProps) {
  const { session, snapshot } = useChallengeProgress({ challengeId: props.challengeId, gradingRevision: props.gradingRevision, starterRevision: props.starterRevision, starterCode: props.starterFile.code, totalTests: COUNTER_TESTS.length, hintCount: props.hints.length });
  if (!snapshot.ready) return <p role="status" className="mt-8 text-sm text-muted-foreground">Loading local draft…</p>;
  return <WorkspaceEditor {...props} session={session} snapshot={snapshot} />;
}

// The editor mounts after restore, so a restored draft is its initial document, not a reset transaction.
function WorkspaceEditor({ challengeId, challengeTitle, starterFile, hints, onMetric, session, snapshot }: PracticeWorkspaceProps & { session: ChallengeProgressSession; snapshot: ProgressSnapshot }) {
  const baseId = useId();
  const editorHelpId = `${baseId}-editor-help`;
  const isDesktop = useIsDesktop();
  const { resolvedTheme } = useTheme();
  const theme: LabTheme = resolvedTheme === "light" ? "light" : "dark";

  const code = snapshot.data.draftCode;
  // Only trusted static starter text is automatically sent to the initial preview. Never initialize this from the draft.
  const [run, setRun] = useState<{ id: number; file: LabFile }>(() => ({ id: 1, file: { name: starterFile.name, code: starterFile.code } }));
  const [status, setStatus] = useState<PreviewStatus>({ kind: "starting" });
  const [problems, setProblems] = useState<RuntimeProblem[]>([]);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"code" | "preview">("code");
  const [editorKey, setEditorKey] = useState(0);
  const tabRefs = useRef<Record<"code" | "preview", HTMLButtonElement | null>>({ code: null, preview: null });
  const problemId = useRef(0);
  const dirty = code !== run.file.code;
  const [gradingJob, setGradingJob] = useState<{ id: number; file: LabFile } | null>(null);
  const [grading, setGrading] = useState<GradingState>({ kind: "idle" });
  const gradingSequence = useRef(0);
  const activeGrading = useRef<number | null>(null);
  // Keep completed/cancelled grading ownership until an explicit preview Run/focus.
  // Firefox can deliver document-wide CSP reports after the grading frame was removed.
  const policyOwner = useRef<"preview" | number>("preview");
  const invalidateGrading = useCallback(() => {
    activeGrading.current = null;
    setGradingJob(null);
    setGrading({ kind: "idle" });
  }, []);
  const changeCode = useCallback((next: string) => {
    invalidateGrading();
    session.edit(next);
  }, [invalidateGrading, session]);
  const runTests = useCallback(() => {
    if (challengeId !== COUNTER_CHALLENGE_ID) return;
    session.attempt();
    const id = ++gradingSequence.current;
    activeGrading.current = id;
    policyOwner.current = id;
    setGrading({ kind: "running" });
    setGradingJob({ id, file: { name: starterFile.name, code } });
  }, [challengeId, code, starterFile.name, session]);
  const onGradingEvent = useCallback((event: PreviewFrameEvent, id: number, source: string) => {
    if (activeGrading.current !== id || event.type === "connected" || event.type === "rendered") return;
    activeGrading.current = null;
    setGradingJob(null);
    if (event.type === "grading-result") {
      session.record(event.result, source);
      setGrading({ kind: "finished", result: event.result });
    } else if (event.type === "compile-error") {
      setGrading({ kind: "blocked", timeout: false, message: `Compile error${event.diagnostic.line ? ` on line ${event.diagnostic.line}` : ""}: ${event.diagnostic.message} No tests were executed. Fix the code, then retry.` });
    } else if (event.type === "stopped") {
      const timeout = ["timeout", "unresponsive", "loop-guard"].includes(event.reason);
      setGrading({ kind: "blocked", timeout, message: timeout ? "The grading preview stopped responding or exceeded its execution limit. Check for loops or unfinished async work, then retry. Your interactive preview is unchanged." : STOPPED_MESSAGE[event.reason] });
    } else if (event.type === "runtime-error") {
      setGrading({ kind: "blocked", timeout: false, message: `Runtime error: ${event.diagnostic.message}` });
    } else {
      setGrading({ kind: "blocked", timeout: false, message: FAILED_MESSAGE[event.reason] });
    }
  }, [session]);

  const runCode = useCallback((source: string) => {
    invalidateGrading();
    policyOwner.current = "preview";
    setRun((previous) => ({ id: previous.id + 1, file: { name: starterFile.name, code: source } }));
    setStatus({ kind: "starting" });
    setProblems([]);
    setNotice("");
    if (!window.matchMedia(DESKTOP_QUERY).matches) setPanel("preview");
  }, [starterFile.name, invalidateGrading]);

  const runCurrent = useCallback(() => runCode(code), [runCode, code]);

  const reset = useCallback(() => {
    session.reset();
    runCode(starterFile.code);
    setNotice("Restored the starter code. Press Ctrl+Z (⌘+Z) in the editor to undo the reset.");
  }, [runCode, starterFile.code, session]);

  const clearProgress = () => {
    if (!window.confirm("Permanently clear this challenge’s saved draft, completion history, test progress, hints and solution history, and reset the editor including its undo history? This cannot be undone.")) return;
    if (session.clear()) {
      runCode(starterFile.code);
      setNotice("Progress cleared. The editor has a fresh undo history.");
    }
  };
  const loadSaved = () => {
    if (snapshot.dirty && !window.confirm("Discard this tab’s unsaved changes and load the saved draft?")) return;
    invalidateGrading(); session.loadSaved();
  };

  const onPreviewEvent = useCallback((event: PreviewFrameEvent) => {
    switch (event.type) {
      case "grading-result": return;
      case "connected":
        onMetric?.("preview-ready", event.readyMs);
        setStatus((current) => (current.kind === "starting" ? { kind: "rendering" } : current));
        return;
      case "rendered":
        onMetric?.("preview-render", event.renderMs);
        setStatus({ kind: "ready" });
        return;
      case "compile-error":
        setStatus({ kind: "compile-error", errorKind: event.kind, diagnostic: event.diagnostic });
        return;
      case "runtime-error":
        setStatus({ kind: "runtime-error" });
        setProblems((current) => (current.length >= MAX_PROBLEMS ? current : [...current, { id: ++problemId.current, kind: event.kind, diagnostic: event.diagnostic }]));
        return;
      case "stopped":
        setStatus({ kind: "stopped", reason: event.reason, diagnostic: event.diagnostic });
        return;
      case "failed":
        setStatus({ kind: "failed", reason: event.reason });
    }
  }, [onMetric]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const order = ["code", "preview"] as const;
    const index = order.indexOf(panel);
    const next = event.key === "ArrowRight" ? order[(index + 1) % 2] : event.key === "ArrowLeft" ? order[(index + 1) % 2] : event.key === "Home" ? "code" : event.key === "End" ? "preview" : null;
    if (!next) return;
    event.preventDefault();
    setPanel(next);
    tabRefs.current[next]?.focus();
  };

  const busy = status.kind === "starting" || status.kind === "rendering";
  const label = statusLabel(status, dirty);
  const showProblems = status.kind === "compile-error" || status.kind === "stopped" || status.kind === "failed" || problems.length > 0;
  const tabId = (name: string) => `${baseId}-${name}-tab`;
  const panelId = (name: string) => `${baseId}-${name}-panel`;
  const panelProps = (name: "code" | "preview", heading: string) => isDesktop
    ? { role: "region", "aria-label": heading }
    : { role: "tabpanel", id: panelId(name), "aria-labelledby": tabId(name), hidden: panel !== name };

  return (
    <section aria-label={`${challengeTitle} workspace`} className={styles.workspace} data-lab-workspace="" data-preview-status={status.kind}>
      <div className={styles.toolbar}>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={runCurrent} aria-describedby={`${baseId}-run-shortcut`} data-lab-run="">
            {busy ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Play aria-hidden="true" />}
            Run
          </Button>
          <Button type="button" variant="outline" onClick={reset} data-lab-reset="">
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
          {challengeId === COUNTER_CHALLENGE_ID ? <Button type="button" variant="outline" onClick={runTests} data-lab-tests="">
            <ListChecks aria-hidden="true" />Run Tests
          </Button> : null}
          <span id={`${baseId}-run-shortcut`} className="hidden text-xs text-muted-foreground sm:inline">Ctrl+Enter / ⌘+Enter in the editor</span>
        </div>
        <span className="text-xs text-muted-foreground" data-save-indicator="">{snapshot.saveState === "saving" ? "Saving draft…" : snapshot.saveState === "saved" ? "Draft saved locally" : snapshot.saveState === "error" ? "Draft not saved — see Your progress" : "Local draft saving ready"}</span>
        <p role="status" className={styles.statusText} data-lab-status="">
          {status.kind === "ready" && !dirty ? <CircleCheck aria-hidden="true" className="size-4 text-primary" /> : null}
          {status.kind === "compile-error" || status.kind === "runtime-error" || status.kind === "stopped" || status.kind === "failed" ? <TriangleAlert aria-hidden="true" className="size-4 text-destructive" /> : null}
          <span>{label}</span>
          {notice ? <span className="sr-only"> {notice}</span> : null}
        </p>
      </div>
      {notice ? <p className="px-1 pb-3 text-xs text-muted-foreground" data-lab-notice="">{notice}</p> : null}

      {!isDesktop ? (
        <div role="tablist" aria-label="Workspace views" className={styles.tabs}>
          {(["code", "preview"] as const).map((name) => (
            <button
              key={name}
              ref={(element) => { tabRefs.current[name] = element; }}
              type="button"
              role="tab"
              id={tabId(name)}
              aria-controls={panelId(name)}
              aria-selected={panel === name}
              tabIndex={panel === name ? 0 : -1}
              onClick={() => setPanel(name)}
              onKeyDown={onTabKeyDown}
              className={styles.tab}
            >
              {name === "code" ? "Code" : "Preview"}
              {name === "preview" && (status.kind === "compile-error" || status.kind === "runtime-error" || status.kind === "stopped" || status.kind === "failed") ? <span className="sr-only"> (has problems)</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.panels}>
        <div {...panelProps("code", "Code editor")} className={styles.panel} data-lab-panel="code">
          <div className={styles.panelHeader}>
            <span className="inline-flex items-center gap-2 font-mono text-xs"><FileCode2 aria-hidden="true" className="size-4 text-primary" />{starterFile.name}</span>
            <span className="text-xs text-muted-foreground">TSX · types are not checked</span>
          </div>
          <p id={editorHelpId} className="sr-only">Tab indents. Press Escape, then Tab, to move focus out of the editor. Press Control+Enter or Command+Enter to run.</p>
          <div className={styles.editorHost}>
            <EditorBoundary onRecover={() => setEditorKey((key) => key + 1)}>
              <CodeEditor
                key={`${editorKey}:${snapshot.generation}`}
                value={code}
                onChange={changeCode}
                onRun={runCurrent}
                label={`${starterFile.name} code editor`}
                describedBy={editorHelpId}
                onReady={(ms) => onMetric?.("editor-init", ms)}
              />
            </EditorBoundary>
          </div>
          <p className={styles.panelFootnote}>Tab indents · Esc then Tab leaves the editor</p>
        </div>

        <div {...panelProps("preview", "Preview")} className={styles.panel} data-lab-panel="preview">
          <div className={styles.panelHeader}>
            <span className="text-xs font-medium">Preview</span>
            <span className="text-xs text-muted-foreground">Sandboxed · no network</span>
          </div>
          <div className={styles.previewHost}>
            <PreviewFrame key={run.id} runId={run.id} file={run.file} theme={theme} title={`Preview of ${starterFile.name}`} ownsPolicyViolations={() => policyOwner.current === "preview"}
              onInteractiveFocus={() => { if (activeGrading.current === null) policyOwner.current = "preview"; }} onEvent={onPreviewEvent} />
            {status.kind === "starting" || status.kind === "rendering" ? <div className={styles.previewOverlay} aria-hidden="true"><LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" /></div> : null}
          </div>
          {showProblems ? (
            <div className={styles.problems} data-lab-problems="">
              <h3 className="text-sm font-semibold">Problems</h3>
              <div className="mt-3 grid gap-4">
                {status.kind === "compile-error" ? <DiagnosticView diagnostic={status.diagnostic} source={run.file.code} /> : null}
                {status.kind === "stopped" ? (
                  <div>
                    <p className="text-sm leading-6">{STOPPED_MESSAGE[status.reason]}</p>
                    {status.diagnostic?.line ? <DiagnosticView diagnostic={{ ...status.diagnostic, name: "Stopped", message: `Last instrumented code ran near line ${status.diagnostic.line}.` }} source={run.file.code} /> : null}
                  </div>
                ) : null}
                {status.kind === "failed" ? <p className="text-sm leading-6">{FAILED_MESSAGE[status.reason]}</p> : null}
                {problems.map((problem) => (
                  <div key={problem.id}>
                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{RUNTIME_KIND_LABEL[problem.kind]}</p>
                    <DiagnosticView diagnostic={problem.diagnostic} source={run.file.code} />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={runCurrent}><Play aria-hidden="true" />Run again</Button>
                <Button type="button" variant="outline" onClick={reset}><RotateCcw aria-hidden="true" />Reset to starter</Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {challengeId === COUNTER_CHALLENGE_ID ? <GradingResults state={grading} onRetry={runTests} /> : null}
      <LearningProgress key={snapshot.generation} session={session} snapshot={snapshot} hints={hints} onReset={reset} onClear={clearProgress} onLoad={loadSaved} />
      {gradingJob && challengeId === COUNTER_CHALLENGE_ID ? <div className={styles.gradingFrame} aria-hidden="true" inert>
        <PreviewFrame key={gradingJob.id} runId={gradingJob.id} file={gradingJob.file} theme={theme}
          gradingChallengeId={COUNTER_CHALLENGE_ID} ownsPolicyViolations={() => policyOwner.current === gradingJob.id && activeGrading.current === gradingJob.id} title="Disposable counter test preview"
          onEvent={(event) => onGradingEvent(event, gradingJob.id, gradingJob.file.code)} />
      </div> : null}
    </section>
  );
}
