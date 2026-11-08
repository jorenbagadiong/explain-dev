import type { LabChallenge } from "./types";
import { getGradingTests } from "./grading";
import type { ProgressDefinition } from "./progress";
export function challengeProgressDefinition(challenge: LabChallenge): ProgressDefinition {
  return { challengeId: challenge.id, gradingRevision: challenge.revision === "v1" ? challenge.gradingRevision : `${challenge.revision}.${challenge.gradingRevision}`, starterRevision: challenge.starterRevision, starterCode: challenge.starterFiles[0].code, totalTests: getGradingTests(challenge.id).length, hintCount: challenge.hints.length };
}
