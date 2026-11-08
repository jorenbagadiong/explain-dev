import type { ChallengeId } from "./grading";
import type { ReferenceSolution } from "./types";
// Literal imports keep each trusted reference separate and lazy; no learner-controlled path.
export async function loadReferenceSolution(id: ChallengeId): Promise<ReferenceSolution> {
  switch (id) {
    case "react-use-state-counter": return (await import("@/content/labs/react/use-state-counter-solution")).counterSolution;
    case "react-controlled-input": return (await import("@/content/labs/react/controlled-input-solution")).controlledInputSolution;
    case "react-list-filtering": return (await import("@/content/labs/react/list-filtering-solution")).listFilteringSolution;
    case "react-conditional-rendering": return (await import("@/content/labs/react/conditional-rendering-solution")).conditionalRenderingSolution;
    case "react-effect-cleanup": return (await import("@/content/labs/react/effect-cleanup-solution")).effectCleanupSolution;
  }
}
