// Serializable requirements shared by the sandbox and the Practice results UI. No execution here.
export const COUNTER_CHALLENGE_ID = "react-use-state-counter";
// Bump when required behavior/interaction contract changes; persisted completion is scoped to this revision.
export const COUNTER_GRADING_REVISION = "counter-behavior-v1";
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

export const INPUT_TESTS = [
  { id: "input-initial", title: "Name input initially has an empty value" },
  { id: "greeting-initial", title: "An empty name shows Hello, stranger!" },
  { id: "typing", title: "The text input accepts a name" },
  { id: "greeting-update", title: "Typing updates the live greeting" },
  { id: "clearing", title: "Clearing restores the default greeting" },
  { id: "repeated-edits", title: "Repeated edits always update the greeting" },
  { id: "empty-string", title: "Empty-string behavior remains correct after edits" },
] as const;
export const FILTER_ITEMS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Pineapple"] as const;
export const FILTER_TESTS = [
  { id: "all-items", title: "All seven fruits appear initially in dataset order" },
  { id: "query", title: "Typing filters the visible results" },
  { id: "case-insensitive", title: "Matching ignores letter case" },
  { id: "partial", title: "Partial matches return every matching fruit" },
  { id: "empty-results", title: "No matches shows No fruits found." },
  { id: "clear-query", title: "Clearing restores every fruit" },
  { id: "fresh-results", title: "Repeated queries never leave stale or hardcoded results" },
] as const;
export const CONDITIONAL_TESTS = [
  { id: "initial-hidden", title: "The panel is absent initially" },
  { id: "first-toggle", title: "First activation mounts the content" },
  { id: "second-toggle", title: "Second activation removes the content" },
  { id: "repeated-toggle", title: "Repeated activations keep toggling" },
  { id: "dom-removal", title: "Hidden content is removed from the DOM" },
  { id: "button-accessibility", title: "The toggle is an enabled native button with an accurate state" },
  { id: "consistent-state", title: "Panel content and button state stay consistent" },
] as const;
export const CLEANUP_TESTS = [
  { id: "effect-setup", title: "Mount registers one 1,000 ms interval and starts at zero" },
  { id: "mounted-ticks", title: "Each mounted interval tick updates the display" },
  { id: "unmount-cleanup", title: "Unmount cancels the interval" },
  { id: "no-lingering", title: "No interval callback runs after unmount" },
  { id: "remount", title: "Remount creates exactly one fresh interval" },
  { id: "repeated-cycles", title: "Repeated mount/unmount cycles leave no subscriptions" },
  { id: "interval-contract", title: "Tick cadence and state remain correct across longer intervals" },
] as const;
export const GRADING_CONTRACTS = {
  [COUNTER_CHALLENGE_ID]: COUNTER_TESTS,
  "react-controlled-input": INPUT_TESTS,
  "react-list-filtering": FILTER_TESTS,
  "react-conditional-rendering": CONDITIONAL_TESTS,
  "react-effect-cleanup": CLEANUP_TESTS,
} as const;
export type ChallengeId = keyof typeof GRADING_CONTRACTS;
export type CounterChallengeId = typeof COUNTER_CHALLENGE_ID;
export const isChallengeId = (value: unknown): value is ChallengeId => typeof value === "string" && Object.hasOwn(GRADING_CONTRACTS, value);
export const getGradingTests = (id: ChallengeId) => GRADING_CONTRACTS[id];
export type TestStatus = "passed" | "failed" | "error" | "timeout";
export interface TestResult { id: string; status: TestStatus; feedback: string; durationMs: number }
export interface GradingResult { challengeId: ChallengeId; runId: number; results: TestResult[]; completed: boolean; durationMs: number }

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
  if (!isChallengeId(value.challengeId) || !Number.isSafeInteger(value.runId) || (value.runId as number) < 1 || !duration(value.durationMs)) return false;
  const definitions = getGradingTests(value.challengeId as ChallengeId);
  const results = value.results;
  if (!Array.isArray(results) || results.length !== definitions.length) return false;
  if (!results.every((row, i) => record(row) && keys(row, ["id", "status", "feedback", "durationMs"])
    && row.id === definitions[i].id && STATUSES.includes(row.status as TestStatus)
    && typeof row.feedback === "string" && row.feedback.length > 0 && row.feedback.length <= MAX_GRADING_FEEDBACK && duration(row.durationMs))) return false;
  return typeof value.completed === "boolean" && value.completed === results.every((row) => row.status === "passed");
}
