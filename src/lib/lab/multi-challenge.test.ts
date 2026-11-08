import { describe, expect, it } from "vitest";
import type { LabChallenge } from "./types";
import { labChallenges } from "./challenges";
import { getGradingTests, isGradingResult, type GradingResult } from "./grading";
import { challengeProgressDefinition } from "./progress-definition";
import { challengeStatus, decodeProgress, editProgress, initialProgress, reconcileProgress, recordGrading } from "./progress";
import { loadReferenceSolution } from "./reference-solutions";
import { compileLearnerModule } from "./compiler";
const now = '2026-11-08T14:00:00.000Z';
describe('five-challenge contracts and isolated evidence', () => {
  it('publishes the exact five challenge IDs in learning order', () => {
    expect(labChallenges.map(challenge => challenge.id)).toEqual(['react-use-state-counter', 'react-controlled-input', 'react-list-filtering', 'react-conditional-rendering', 'react-effect-cleanup']);
  });
  it.each(labChallenges)('$id has three hints, objectives, bounded revisions and a compiling explained reference', async (challenge: LabChallenge) => {
    expect(challenge.hints).toHaveLength(3); expect(challenge.objectives.length).toBeGreaterThan(0);
    const definition = challengeProgressDefinition(challenge); expect(definition.gradingRevision.length).toBeLessThanOrEqual(64);
    const reference = await loadReferenceSolution(challenge.id); expect(reference.explanation.length).toBeGreaterThanOrEqual(3);
    expect(compileLearnerModule({ name: 'App.tsx', code: reference.code }).ok).toBe(true);
    expect(new Set(getGradingTests(challenge.id).map(test => test.id)).size).toBe(7);
  });
  it.each(labChallenges)('$id accepts only its complete behavioral suite and keeps history separate', (challenge: LabChallenge) => {
    const definition = challengeProgressDefinition(challenge), data = editProgress(initialProgress(definition), 'draft text', now);
    const result: GradingResult = { challengeId: challenge.id, runId: 1, results: getGradingTests(challenge.id).map(test => ({ id: test.id, status: 'passed' as const, feedback: 'Matched.', durationMs: 1 })), completed: true, durationMs: 7 };
    expect(isGradingResult(result)).toBe(true);
    for (const other of labChallenges.filter(other => other.id !== challenge.id)) {
      const forged = { ...result, challengeId: other.id }; expect(isGradingResult(forged)).toBe(false);
      expect(recordGrading(initialProgress(challengeProgressDefinition(other)), result, 'draft text', now).completion).toBeNull();
    }
    const complete = recordGrading(data, result, 'draft text', now); expect(challengeStatus(complete)).toBe('completed');
    const edited = editProgress(complete, 'new draft', now); expect(edited.verification).toBeNull(); expect(edited.completion).toEqual(complete.completion);
    for (const changed of [{ ...challenge, revision: 'v2' }, { ...challenge, gradingRevision: challenge.gradingRevision + '.next' }]) {
      const migrated = reconcileProgress(complete, challengeProgressDefinition(changed)); expect(challengeStatus(migrated)).toBe('in-progress'); expect(migrated.verification).toBeNull(); expect(migrated.completion).toEqual(complete.completion);
    }
    const stored = JSON.stringify({ ...complete, savedAt: now, writeRevision: 1 });
    expect(decodeProgress(stored, definition).kind).toBe('valid');
    for (const other of labChallenges.filter(other => other.id !== challenge.id)) expect(decodeProgress(stored, challengeProgressDefinition(other)).kind).toBe('invalid');
  });
});
