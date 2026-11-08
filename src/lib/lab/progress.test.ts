import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { useStateCounterChallenge as challenge } from "@/content/labs/react/use-state-counter";
import { COUNTER_CHALLENGE_ID, COUNTER_GRADING_REVISION, COUNTER_TESTS, type GradingResult } from "./grading";
import { attemptGrading, challengeStatus, decodeProgress, editProgress, initialProgress, isStoredProgress, MAX_DRAFT_LENGTH, reconcileProgress, recordGrading, resetCode, revealHint, revealSolution, type ProgressDefinition } from "./progress";
const now = "2026-11-08T10:00:00.000Z";
const definition: ProgressDefinition = { challengeId: challenge.id, gradingRevision: challenge.gradingRevision, starterRevision: challenge.starterRevision, starterCode: challenge.starterFiles[0].code, totalTests: 7, hintCount: 3 };
const initial = () => initialProgress(definition);
const saved = () => ({ ...editProgress(initial(), "draft", now), savedAt: now, writeRevision: 1 });
const grade = (passed = 7): GradingResult => ({ challengeId: COUNTER_CHALLENGE_ID, runId: 1, results: COUNTER_TESTS.map((test, i) => ({ id: test.id, status: i < passed ? "passed" : "failed", feedback: "Observed behavior.", durationMs: 1 })), completed: passed === 7, durationMs: 7 });

describe("strict learner progress schema", () => {
  it("round-trips inert source, including an empty draft, without executing it", () => {
    for (const draftCode of ["", "globalThis.shouldNeverRun = true; <script>bad</script>", "x".repeat(MAX_DRAFT_LENGTH)]) {
      const data = { ...saved(), draftCode };
      expect(decodeProgress(JSON.stringify(data), definition)).toEqual({ kind: "valid", data });
    }
    expect(globalThis).not.toHaveProperty("shouldNeverRun");
  });
  it("accepts only a data-free clear marker for this challenge", () => {
    const marker = { version: 1, challengeId: challenge.id, cleared: true, writeRevision: 2 };
    expect(isStoredProgress(marker, definition)).toBe(true);
    expect(isStoredProgress({ ...marker, draftCode: "old" }, definition)).toBe(false);
  });
  it.each([
    ["wrong challenge", () => ({ ...saved(), challengeId: "other" })],
    ["oversize draft", () => ({ ...saved(), draftCode: "x".repeat(MAX_DRAFT_LENGTH + 1) })],
    ["missing fields", () => ({ version: 1, challengeId: challenge.id })],
    ["extra privileged fields", () => ({ ...saved(), session: "secret", runId: 2 })],
    ["fractional revision", () => ({ ...saved(), writeRevision: 1.5 })],
    ["unsafe revision", () => ({ ...saved(), writeRevision: Number.MAX_SAFE_INTEGER + 1 })],
    ["bad date", () => ({ ...saved(), savedAt: "today" })],
    ["invalid calendar date", () => ({ ...saved(), savedAt: "2026-02-30T10:00:00.000Z" })],
    ["negative score", () => ({ ...saved(), bestPassedCount: -1 })],
    ["too many tests", () => ({ ...saved(), totalTests: 999 })],
    ["wrong current contract total", () => ({ ...saved(), totalTests: 6 })],
    ["hint skipped out of range", () => ({ ...saved(), revealedHintCount: 4 })],
    ["bad solution flag", () => ({ ...saved(), solutionRevealed: "yes" })],
    ["fake completion", () => ({ ...saved(), completion: { revision: definition.gradingRevision, at: now } })],
    ["score greater than best", () => ({ ...saved(), verification: { passedCount: 3, at: now } })],
    ["unearned verification completion", () => ({ ...saved(), bestPassedCount: 7, verification: { passedCount: 7, at: now } })],
    ["false activity flag", () => ({ ...saved(), started: false })],
    ["prototype", () => Object.assign(Object.create({ inherited: true }), saved())],
  ])("rejects %s", (_name, value) => expect(isStoredProgress(value(), definition)).toBe(false));
  it.each(["not JSON", "{broken", "null", "[]", JSON.stringify({ ...saved(), version: 0 })])("recovers safely from %s without restoring source", (raw) => expect(decodeProgress(raw, definition)).toEqual({ kind: "invalid" }));
  it("refuses future schemas and bounds JSON parsing before interpretation", () => {
    expect(decodeProgress(JSON.stringify({ ...saved(), version: 2 }), definition)).toEqual({ kind: "unsupported" });
    expect(decodeProgress("x".repeat(400_000), definition)).toEqual({ kind: "invalid" });
    expect(decodeProgress(null, definition)).toEqual({ kind: "empty" });
  });
});
describe("learning progress transitions", () => {
  it("records meaningful edits and grading attempts, not a mere visit", () => {
    expect(challengeStatus(initial())).toBe("not-started");
    expect(editProgress(initial(), definition.starterCode, now)).toEqual(initial());
    expect(challengeStatus(editProgress(initial(), "", now))).toBe("in-progress");
    expect(challengeStatus(attemptGrading(initial()))).toBe("in-progress");
  });
  it("requires every validated behavioral test and exact current source for completion", () => {
    const data = saved();
    expect(challengeStatus(recordGrading(data, grade(6), data.draftCode, now))).toBe("in-progress");
    expect(recordGrading(data, grade(), "stale code", now)).toBe(data);
    expect(recordGrading(data, { ...grade(), completed: false }, data.draftCode, now)).toBe(data);
    expect(challengeStatus(recordGrading(data, grade(), data.draftCode, now))).toBe("completed");
  });
  it("preserves historical completion through edits, partial attempts and Reset Code", () => {
    const complete = recordGrading(saved(), grade(), "draft", now);
    const edited = editProgress(complete, "changed", now);
    expect(edited.verification).toBeNull(); expect(edited.completion).toEqual(complete.completion);
    const partial = recordGrading(edited, grade(2), "changed", now);
    expect(partial.bestPassedCount).toBe(7); expect(partial.verification?.passedCount).toBe(2); expect(challengeStatus(partial)).toBe("completed");
    const reset = resetCode(partial, definition, now);
    expect(reset.draftCode).toBe(definition.starterCode); expect(reset.completion).toEqual(complete.completion); expect(reset.verification).toBeNull();
  });
  it("invalidates outdated completion evidence while retaining source and historical revision", () => {
    const old = recordGrading(saved(), grade(), "draft", now);
    const next = reconcileProgress(old, { ...definition, gradingRevision: "counter-behavior-v2" });
    expect(next.draftCode).toBe("draft"); expect(next.completion).toEqual(old.completion);
    expect(next.bestPassedCount).toBe(0); expect(next.verification).toBeNull(); expect(challengeStatus(next)).toBe("in-progress");
  });
  it("keeps old-starter drafts until explicit Reset", () => {
    const next = { ...definition, starterRevision: "counter-starter-v2", starterCode: "new starter" };
    expect(reconcileProgress(saved(), next).draftCode).toBe("draft");
    expect(resetCode(saved(), next, now)).toMatchObject({ draftCode: "new starter", starterRevision: next.starterRevision });
  });
  it("reveals hints as an ordered prefix and viewing a solution is not completion", () => {
    let data = initial();
    for (const count of [1, 2, 3, 3]) { data = revealHint(data, 3); expect(data.revealedHintCount).toBe(count); }
    expect(challengeStatus(revealSolution(data))).toBe("in-progress");
    expect(revealSolution(data).completion).toBeNull(); expect(revealSolution(data).solutionRevealed).toBe(true);
  });
  it("binds the persisted grading revision to the seven required behavior sequences", () => {
    const contract = COUNTER_TESTS.map(({ id, steps }) => ({ id, steps }));
    expect(COUNTER_GRADING_REVISION).toBe("counter-behavior-v1");
    // Changing this contract requires an intentional revision bump and migration review.
    expect(createHash("sha256").update(JSON.stringify(contract)).digest("hex")).toBe("aef279ef52669dce051e28cf9d76fe77b1356699261c74ebf5d687ef20bcdf6d");
  });
});
