// Serializable requirements shared by the sandbox and the Practice results UI. No execution here.
export const COUNTER_CHALLENGE_ID = "react-use-state-counter";
// Bump when required behavior/interaction contract changes; persisted completion is scoped to this revision.
export const COUNTER_GRADING_REVISION = "counter-behavior-v1";
export type CounterChallengeId = typeof COUNTER_CHALLENGE_ID;
export type TestStatus = "passed" | "failed" | "error" | "timeout";
export interface TestResult { id: string; status: TestStatus; feedback: string; durationMs: number }
export interface GradingResult {
  challengeId: CounterChallengeId;
  runId: number;
  results: TestResult[];
  completed: boolean;
  durationMs: number;
}
export interface CounterTest {
  id: string;
  title: string;
  steps: readonly { button: "Increment" | "Decrement" | "Reset"; expected: number }[];
}
export const COUNTER_TESTS = [
  { id: "initial-zero", title: "The counter initially displays zero", steps: [] },
  { id: "increment", title: "Increment increases the count by one", steps: [{ button: "Increment", expected: 1 }] },
  { id: "repeated-increment", title: "Repeated increments update on every click", steps: [{ button: "Increment", expected: 1 }, { button: "Increment", expected: 2 }, { button: "Increment", expected: 3 }] },
  { id: "decrement", title: "Decrement decreases the count by one", steps: [{ button: "Increment", expected: 1 }, { button: "Increment", expected: 2 }, { button: "Decrement", expected: 1 }] },
  { id: "reset", title: "Reset returns a changed count to zero", steps: [{ button: "Increment", expected: 1 }, { button: "Increment", expected: 2 }, { button: "Reset", expected: 0 }] },
  { id: "negative-values", title: "The counter supports negative values", steps: [{ button: "Decrement", expected: -1 }, { button: "Decrement", expected: -2 }] },
  { id: "combined-interactions", title: "Combined increments, decrements and resets stay correct", steps: [{ button: "Increment", expected: 1 }, { button: "Increment", expected: 2 }, { button: "Decrement", expected: 1 }, { button: "Reset", expected: 0 }, { button: "Decrement", expected: -1 }, { button: "Increment", expected: 0 }, { button: "Increment", expected: 1 }] },
] as const satisfies readonly CounterTest[];

export const MAX_GRADING_FEEDBACK = 500;
export const GRADING_TIMEOUT_MS = 12_000;
export const TEST_TIMEOUT_MS = 1_500;
const STATUSES: readonly TestStatus[] = ["passed", "failed", "error", "timeout"];
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function keys(value: Record<string, unknown>, expected: string[]) {
  return Object.keys(value).length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}
function duration(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 60_000; }
/** Reject missing, duplicate, reordered, invented, oversized and contradictory results before displaying anything. */
export function isGradingResult(value: unknown): value is GradingResult {
  if (!record(value) || !keys(value, ["challengeId", "runId", "results", "completed", "durationMs"])) return false;
  if (value.challengeId !== COUNTER_CHALLENGE_ID || !Number.isSafeInteger(value.runId) || (value.runId as number) < 1 || !duration(value.durationMs)) return false;
  const results = value.results;
  if (!Array.isArray(results) || results.length !== COUNTER_TESTS.length) return false;
  if (!results.every((row, i) => record(row) && keys(row, ["id", "status", "feedback", "durationMs"])
    && row.id === COUNTER_TESTS[i].id && STATUSES.includes(row.status as TestStatus)
    && typeof row.feedback === "string" && row.feedback.length > 0 && row.feedback.length <= MAX_GRADING_FEEDBACK && duration(row.durationMs))) return false;
  return typeof value.completed === "boolean" && value.completed === results.every((row) => row.status === "passed");
}
