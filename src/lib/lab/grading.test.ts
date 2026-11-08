import { describe, expect, it } from "vitest";
import { COUNTER_CHALLENGE_ID, COUNTER_TESTS, isGradingResult, MAX_GRADING_FEEDBACK } from "./grading";
import { isInitMessage, isPreviewMessage, LAB_CHANNEL, LAB_PROTOCOL_VERSION } from "./protocol";
const envelope = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, session: "00000000-0000-4000-8000-000000000001", runId: 2 };
const valid = () => ({ challengeId: COUNTER_CHALLENGE_ID, runId: 2, results: COUNTER_TESTS.map((test) => ({ id: String(test.id), status: "passed", feedback: "Matched.", durationMs: 2 })), completed: true, durationMs: 20 });
describe("untrusted grading result validation", () => {
  it("accepts complete passes and mixed outcomes with consistent completion", () => {
    expect(isGradingResult(valid())).toBe(true);
    for (const status of ["failed", "error", "timeout"]) {
      const result = valid(); result.results[1].status = status; result.completed = false;
      expect(isGradingResult(result)).toBe(true);
    }
  });
  it.each([
    ["wrong challenge", () => ({ ...valid(), challengeId: "invented" })],
    ["wrong type", () => ({ ...valid(), runId: "2" })],
    ["zero run", () => ({ ...valid(), runId: 0 })],
    ["unsafe run", () => ({ ...valid(), runId: Number.MAX_SAFE_INTEGER + 1 })],
    ["missing tests", () => ({ ...valid(), results: [] })],
    ["duplicate test", () => { const r = valid(); r.results[1] = r.results[0]; return r; }],
    ["unknown test", () => { const r = valid(); r.results[0].id = "invented"; return r; }],
    ["reordered tests", () => { const r = valid(); r.results.reverse(); return r; }],
    ["too many tests", () => { const r = valid(); r.results.push(r.results[0]); return r; }],
    ["contradictory completion", () => ({ ...valid(), completed: false })],
    ["unknown fields", () => ({ ...valid(), html: "<script>" })],
    ["nonboolean", () => ({ ...valid(), completed: "true" })],
    ["oversized feedback", () => { const r = valid(); r.results[0].feedback = "x".repeat(MAX_GRADING_FEEDBACK + 1); return r; }],
    ["empty feedback", () => { const r = valid(); r.results[0].feedback = ""; return r; }],
    ["fake title", () => { const r = valid(); return { ...r, results: [{ ...r.results[0], title: "replace requirement" }, ...r.results.slice(1)] }; }],
    ["unknown status", () => { const r = valid(); r.results[0].status = "complete"; return r; }],
    ["NaN", () => ({ ...valid(), durationMs: NaN })],
    ["Infinity", () => ({ ...valid(), durationMs: Infinity })],
    ["negative time", () => ({ ...valid(), durationMs: -1 })],
    ["huge time", () => ({ ...valid(), durationMs: 60_001 })],
    ["bad row time", () => { const r = valid(); r.results[0].durationMs = -1; return r; }],
    ["null", () => null],
    ["array", () => [valid()]],
    ["custom prototype", () => Object.assign(Object.create({ inherited: true }), valid())],
  ])("rejects %s", (_name, create) => expect(isGradingResult(create())).toBe(false));
  it("binds grading results to the envelope run and exact schema", () => {
    const message = { ...envelope, type: "grading-result", result: valid() };
    expect(isPreviewMessage(message)).toBe(true);
    expect(isPreviewMessage({ ...message, result: { ...valid(), runId: 1 } })).toBe(false);
    expect(isPreviewMessage({ ...message, html: "<b>" })).toBe(false);
    expect(isPreviewMessage({ ...message, version: LAB_PROTOCOL_VERSION - 1 })).toBe(false);
    expect(isPreviewMessage({ ...message, session: "spoofed" })).toBe(false);
  });
  it("permits only the supported challenge in grading init", () => {
    const init = { ...envelope, type: "init", theme: "dark", file: { name: "App.tsx", code: "" } };
    expect(isInitMessage(init)).toBe(true);
    expect(isInitMessage({ ...init, gradingChallengeId: COUNTER_CHALLENGE_ID })).toBe(true);
    expect(isInitMessage({ ...init, gradingChallengeId: "unknown" })).toBe(false);
    expect(isInitMessage({ ...init, tests: "execute arbitrary tests" })).toBe(false);
  });
});
