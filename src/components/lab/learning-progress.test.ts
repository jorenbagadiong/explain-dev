import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useStateCounterChallenge as challenge } from "@/content/labs/react/use-state-counter";
import { counterSolution } from "@/content/labs/react/use-state-counter-solution";
import { initialProgress, revealHint, revealSolution, type ProgressDefinition } from "@/lib/lab/progress";
import { ChallengeProgressSession, type ProgressSnapshot } from "@/lib/storage/challenge-progress";
import { LearningProgress } from "./learning-progress";
const definition: ProgressDefinition = { challengeId: challenge.id, gradingRevision: challenge.gradingRevision, starterRevision: challenge.starterRevision, starterCode: challenge.starterFiles[0].code, totalTests: 7, hintCount: 3 };
const session = new ChallengeProgressSession(definition);
const render = (data = initialProgress(definition)) => renderToStaticMarkup(createElement(LearningProgress, { session, snapshot: { ready: true, data, dirty: false, owner: true, saveState: "idle", error: null, notice: null, generation: 0 } satisfies ProgressSnapshot, hints: challenge.hints, onReset: () => {}, onClear: () => {}, onLoad: () => {} }));
describe("progress and learning assistance presentation", () => {
  it("starts without revealing hints or a reference and offers explicit actions", () => {
    const html = render();
    expect(html).toContain("Not Started"); expect(html).toContain("Not verified.");
    expect(html).toContain("Reveal hint 1 of 3"); expect(html).toContain("View reference solution"); expect(html).toContain("Clear Progress");
    for (const hint of challenge.hints) expect(html).not.toContain(hint);
    expect(html).not.toContain("<pre"); expect(html).not.toContain(counterSolution.code);
  });
  it("shows only the trusted revealed hint prefix and the next sequential action", () => {
    const html = render(revealHint(initialProgress(definition), 3));
    expect(html).toContain(challenge.hints[0]); expect(html).not.toContain(challenge.hints[1]); expect(html).toContain("Reveal hint 2 of 3");
  });
  it("records prior solution viewing without automatically displaying code or claiming completion", () => {
    const html = render(revealSolution(initialProgress(definition)));
    expect(html).toContain("You previously viewed this solution."); expect(html).toContain("In Progress"); expect(html).not.toContain("<pre");
  });
  it("defines a reference with the same accessible behavioral contract and explanatory coverage", () => {
    expect(counterSolution.code).toContain("Count: {count}");
    for (const label of ["Increment", "Decrement", "Reset"]) expect(counterSolution.code).toContain(`>${label}</button>`);
    expect(counterSolution.explanation.map((item) => item.title)).toEqual(["Remember the number with useState", "Update from the previous value", "Pass event handlers", "Render the new state"]);
  });
});
