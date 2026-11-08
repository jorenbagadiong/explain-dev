import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GradingResults, type GradingState } from "./grading-results";
import { COUNTER_CHALLENGE_ID, COUNTER_TESTS, type GradingResult } from "@/lib/lab/grading";
const result: GradingResult = { challengeId: COUNTER_CHALLENGE_ID, runId: 1, completed: false, durationMs: 20, results: COUNTER_TESTS.map((test, index) => ({ id: test.id, status: index ? "failed" : "passed", feedback: index ? "After Increment → Increment, the displayed value was 1 instead of 2." : "The counter started at zero.", durationMs: 2 })) };
const render = (state: GradingState) => renderToStaticMarkup(createElement(GradingResults, { state, onRetry: () => {} }));
describe("grading feedback presentation", () => {
  it("shows all authoritative requirement titles, textual statuses and actionable feedback", () => {
    const html = render({ kind: "finished", result });
    expect(html).toContain("1 of 7 tests passed.");
    for (const test of COUNTER_TESTS) expect(html).toContain(test.title);
    expect(html).toContain("instead of 2.");
    expect(html).toContain("Passed ·"); expect(html).toContain("Failed ·");
    expect(html).toContain("Retry tests");
    expect(html.match(/role="status"/g)).toHaveLength(1);
    expect(html).toContain('aria-atomic="true"');
  });
  it("renders all feedback as escaped text", () => {
    const html = render({ kind: "finished", result: { ...result, results: result.results.map((row) => ({ ...row, feedback: '<img src=x onerror="alert(1)">' })) } });
    expect(html).not.toContain("<img"); expect(html).toContain("&lt;img");
  });
  it("announces completion only when all validated results pass", () => {
    const html = render({ kind: "finished", result: { ...result, completed: true, results: result.results.map((row) => ({ ...row, status: "passed" })) } });
    expect(html).toContain("7 of 7 tests passed. Challenge complete.");
    expect(html).toContain("not tamper-proof assessment");
  });
  it.each<GradingState>([{ kind: "idle" }, { kind: "running" }, { kind: "blocked", message: "Compile error. No tests were executed.", timeout: false }, { kind: "blocked", message: "Check for loops.", timeout: true }])("announces $kind without stale rows", (state) => {
    const html = render(state);
    expect(html).not.toContain("data-test-id"); expect(html.match(/role="status"/g)).toHaveLength(1);
    if (state.kind === "idle") expect(html).toContain("fresh check of the current draft");
    if (state.kind === "blocked") { expect(html).toContain(state.message); expect(html).toContain("Retry tests"); }
  });
});
