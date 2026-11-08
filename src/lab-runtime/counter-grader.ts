// Runs only inside the ED-019 sandbox. Never import this module into the parent application.
import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { COUNTER_CHALLENGE_ID, COUNTER_TESTS, MAX_GRADING_FEEDBACK, TEST_TIMEOUT_MS, type GradingResult, type TestResult } from "@/lib/lab/grading";

class BehaviorFailure extends Error {}
class TestTimeout extends Error {}
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
function readable(element: Element) {
  return element.getClientRects().length > 0 && !element.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(element).visibility !== "hidden";
}
function name(element: Element): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) return normalize(labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" "));
  return normalize(element.getAttribute("aria-label") ?? (element instanceof HTMLInputElement ? element.value : element.textContent ?? ""));
}
function button(container: HTMLElement, label: string): HTMLElement {
  const matches = [...container.querySelectorAll<HTMLElement>('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]')]
    .filter((el) => readable(el) && name(el).toLowerCase() === label.toLowerCase());
  if (matches.length !== 1) throw new BehaviorFailure(`Provide one visible button with the accessible name ${label}. Found ${matches.length}.`);
  const result = matches[0];
  if (result.matches(":disabled") || result.getAttribute("aria-disabled") === "true") throw new BehaviorFailure(`${label} is disabled. Enable it so the counter can be tested.`);
  return result;
}
function count(container: HTMLElement): number {
  const parse = (el: Element) => {
    const text = normalize(el.textContent ?? "");
    const match = /^Count:\s*(-?\d+)$/i.exec(text)
      ?? ((el.matches('output, [role="status"], [aria-live]') && name(el).toLowerCase() === "count") ? /^(-?\d+)$/.exec(text) : null);
    const value = match ? Number(match[1]) : NaN;
    return Number.isSafeInteger(value) ? value : null;
  };
  const matches = [...container.querySelectorAll("*")].filter((el) => readable(el) && parse(el) !== null && ![...el.children].some((child) => parse(child) !== null));
  if (matches.length !== 1) throw new BehaviorFailure(`Expose one readable “Count: number” display (or a status/output named Count). Found ${matches.length}.`);
  return parse(matches[0])!;
}
function feedback(error: unknown): string {
  const message = error instanceof Error ? error.message : "The component threw an unexpected value.";
  return message.slice(0, MAX_GRADING_FEEDBACK) || "The component could not be tested.";
}

export async function gradeCounter({ createApp, runId, setErrorHandler }: {
  createApp: () => ComponentType;
  runId: number;
  setErrorHandler: (handler: ((error: unknown) => void) | null) => void;
}): Promise<GradingResult> {
  (self as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const started = performance.now();
  const results: TestResult[] = [];
  let aborted = false;
  for (const definition of COUNTER_TESTS) {
    if (aborted) {
      results.push({ id: definition.id, status: "timeout", feedback: "Not run because the previous test did not finish. Fix the nonresponsive code, then retry.", durationMs: 0 });
      continue;
    }
    const began = performance.now();
    const container = document.createElement("div");
    document.getElementById("root")!.append(container);
    let root: Root | undefined;
    let error: unknown;
    let errored = false;
    const capture = (value: unknown) => { errored = true; error = value; };
    setErrorHandler(capture);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: MutationObserver | undefined;
    const work = async () => {
      root = createRoot(container, { onUncaughtError: capture, onCaughtError: capture });
      await act(async () => { root!.render(createElement(createApp())); });
      if (errored) throw error;
      // Suspended roots can finish act() without committing any output. Wait on DOM readiness,
      // bounded by the test deadline, rather than asserting early or sleeping for a guessed delay.
      if (!container.childElementCount) await new Promise<void>((resolve) => {
        observer = new MutationObserver(() => { if (container.childElementCount) resolve(); });
        observer.observe(container, { childList: true, subtree: true });
      });
      if (errored) throw error;
      let actual = count(container);
      if (actual !== 0) throw new BehaviorFailure(`On a fresh mount, the displayed value was ${actual} instead of 0.`);
      const sequence: string[] = [];
      for (const step of definition.steps) {
        sequence.push(step.button);
        await act(async () => { button(container, step.button).click(); });
        if (errored) throw error;
        actual = count(container);
        if (actual !== step.expected) throw new BehaviorFailure(`After ${sequence.join(" → ")}, the displayed value was ${actual} instead of ${step.expected}.`);
      }
      await act(async () => { root!.unmount(); });
      root = undefined;
      if (errored) throw error;
    };
    let status: TestResult["status"] = "passed";
    let message = definition.steps.length ? "Every interaction produced the expected count." : "The counter started at zero.";
    try {
      await Promise.race([work(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new TestTimeout("The test did not finish. Check for unresolved async work or a component that never settles.")), TEST_TIMEOUT_MS); })]);
    } catch (caught) {
      status = caught instanceof TestTimeout ? "timeout" : caught instanceof BehaviorFailure ? "failed" : "error";
      message = status === "error" ? `Runtime error: ${feedback(caught)}`.slice(0, MAX_GRADING_FEEDBACK) : feedback(caught);
      aborted = status === "timeout";
    } finally {
      clearTimeout(timer);
      observer?.disconnect();
      if (root && !aborted) {
        try { await act(async () => root!.unmount()); } catch { /* The test's primary error is already reported. */ }
      }
      setErrorHandler(null);
      container.remove();
    }
    results.push({ id: definition.id, status, feedback: message, durationMs: Math.max(0, performance.now() - began) });
  }
  return { challengeId: COUNTER_CHALLENGE_ID, runId, results, completed: results.every((result) => result.status === "passed"), durationMs: Math.max(0, performance.now() - started) };
}
