import { isGradingResult, type GradingResult } from "./grading";

export const MAX_DRAFT_LENGTH = 50_000;
export const MAX_PROGRESS_LENGTH = MAX_DRAFT_LENGTH * 6 + 4_000;
export interface ProgressDefinition {
  challengeId: string;
  gradingRevision: string;
  starterRevision: string;
  starterCode: string;
  totalTests: number;
  hintCount: number;
}
export interface ChallengeProgress {
  version: 1;
  challengeId: string;
  gradingRevision: string;
  starterRevision: string;
  draftCode: string;
  started: boolean;
  completion: { revision: string; at: string } | null;
  verification: { passedCount: number; at: string } | null;
  bestPassedCount: number;
  totalTests: number;
  revealedHintCount: number;
  solutionRevealed: boolean;
  lastEditedAt: string | null;
  savedAt: string | null;
  writeRevision: number;
}
export interface ClearedProgress { version: 1; challengeId: string; cleared: true; writeRevision: number }
export type StoredProgress = ChallengeProgress | ClearedProgress;
export type ChallengeStatus = "not-started" | "in-progress" | "completed";
export const progressKey = (id: string) => `explain-dev:v1:challenge-progress:${id}`;

export function initialProgress(definition: ProgressDefinition): ChallengeProgress {
  return { version: 1, challengeId: definition.challengeId, gradingRevision: definition.gradingRevision, starterRevision: definition.starterRevision,
    draftCode: definition.starterCode, started: false, completion: null, verification: null, bestPassedCount: 0, totalTests: definition.totalTests,
    revealedHintCount: 0, solutionRevealed: false, lastEditedAt: null, savedAt: null, writeRevision: 0 };
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function exact(value: Record<string, unknown>, keys: string[]) { return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)); }
function integer(value: unknown, min: number, max: number) { return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max; }
function revision(value: unknown): value is string { return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(value); }
function date(value: unknown): value is string { return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value; }
export function isStoredProgress(value: unknown, definition: ProgressDefinition): value is StoredProgress {
  if (!record(value) || value.version !== 1 || value.challengeId !== definition.challengeId || !integer(value.writeRevision, 1, Number.MAX_SAFE_INTEGER)) return false;
  if (value.cleared === true) return exact(value, ["version", "challengeId", "cleared", "writeRevision"]);
  const keys = ["version", "challengeId", "gradingRevision", "starterRevision", "draftCode", "started", "completion", "verification", "bestPassedCount", "totalTests", "revealedHintCount", "solutionRevealed", "lastEditedAt", "savedAt", "writeRevision"];
  if (!exact(value, keys) || !revision(value.gradingRevision) || !revision(value.starterRevision) || typeof value.draftCode !== "string" || value.draftCode.length > MAX_DRAFT_LENGTH
    || typeof value.started !== "boolean" || typeof value.solutionRevealed !== "boolean" || !integer(value.totalTests, 1, 100)
    || !integer(value.bestPassedCount, 0, value.totalTests as number) || !integer(value.revealedHintCount, 0, definition.hintCount)
    || !(value.lastEditedAt === null || date(value.lastEditedAt)) || !date(value.savedAt)) return false;
  if (value.gradingRevision === definition.gradingRevision && value.totalTests !== definition.totalTests) return false;
  const completion = value.completion, verification = value.verification;
  if (completion !== null && (!record(completion) || !exact(completion, ["revision", "at"]) || !revision(completion.revision) || !date(completion.at))) return false;
  if (verification !== null && (!record(verification) || !exact(verification, ["passedCount", "at"]) || !integer(verification.passedCount, 0, value.totalTests as number) || !date(verification.at))) return false;
  if (record(verification) && (verification.passedCount as number) > (value.bestPassedCount as number)) return false;
  if (record(completion) && completion.revision === value.gradingRevision && value.bestPassedCount !== value.totalTests) return false;
  if (record(verification) && verification.passedCount === value.totalTests && (!record(completion) || completion.revision !== value.gradingRevision)) return false;
  if (!value.started && (completion !== null || verification !== null || value.bestPassedCount !== 0 || value.revealedHintCount !== 0 || value.solutionRevealed || value.lastEditedAt !== null)) return false;
  return true;
}
export type DecodedProgress = { kind: "empty" } | { kind: "valid"; data: StoredProgress } | { kind: "invalid" | "unsupported" };
export function decodeProgress(raw: string | null, definition: ProgressDefinition): DecodedProgress {
  if (raw === null) return { kind: "empty" };
  if (raw.length > MAX_PROGRESS_LENGTH) return { kind: "invalid" };
  try {
    const value: unknown = JSON.parse(raw);
    if (record(value) && typeof value.version === "number" && value.version > 1) return { kind: "unsupported" };
    return isStoredProgress(value, definition) ? { kind: "valid", data: value } : { kind: "invalid" };
  } catch { return { kind: "invalid" }; }
}
export function reconcileProgress(saved: ChallengeProgress, definition: ProgressDefinition): ChallengeProgress {
  if (saved.gradingRevision === definition.gradingRevision) return saved;
  return { ...saved, gradingRevision: definition.gradingRevision, totalTests: definition.totalTests, bestPassedCount: 0, verification: null };
}
export function challengeStatus(data: ChallengeProgress): ChallengeStatus {
  return data.completion?.revision === data.gradingRevision ? "completed" : data.started ? "in-progress" : "not-started";
}
export function editProgress(data: ChallengeProgress, code: string, now: string): ChallengeProgress {
  return code === data.draftCode ? data : { ...data, draftCode: code, started: true, lastEditedAt: now, verification: null };
}
export function resetCode(data: ChallengeProgress, definition: ProgressDefinition, now: string): ChallengeProgress {
  const edited = editProgress(data, definition.starterCode, now);
  return { ...edited, starterRevision: definition.starterRevision, verification: null };
}
export function attemptGrading(data: ChallengeProgress): ChallengeProgress { return { ...data, started: true, verification: null }; }
export function recordGrading(data: ChallengeProgress, result: GradingResult, source: string, now: string): ChallengeProgress {
  if (!isGradingResult(result) || result.challengeId !== data.challengeId || source !== data.draftCode || result.results.length !== data.totalTests) return data;
  const passedCount = result.results.filter((test) => test.status === "passed").length;
  return { ...data, started: true, bestPassedCount: Math.max(data.bestPassedCount, passedCount), verification: { passedCount, at: now },
    completion: result.completed ? (data.completion?.revision === data.gradingRevision ? data.completion : { revision: data.gradingRevision, at: now }) : data.completion };
}
export function revealHint(data: ChallengeProgress, count: number): ChallengeProgress { return { ...data, started: true, revealedHintCount: Math.min(count, data.revealedHintCount + 1) }; }
export function revealSolution(data: ChallengeProgress): ChallengeProgress { return { ...data, started: true, solutionRevealed: true }; }
