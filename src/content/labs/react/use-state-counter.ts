import { COUNTER_CHALLENGE_ID, COUNTER_GRADING_REVISION, COUNTER_TESTS } from "@/lib/lab/grading";
import type { LabChallenge } from "@/lib/lab/types";

const starterCode = `import { useState } from "react";

export default function Counter() {
  // TODO: Replace this constant with state that starts at 0.
  // Hint: const [count, setCount] = useState(0);
  const count = 0;

  function decrement() {
    // TODO: Decrease the count by one.
  }

  function increment() {
    // TODO: Increase the count by one.
  }

  function reset() {
    // TODO: Set the count back to zero.
  }

  return (
    <main>
      <p aria-live="polite">Count: {count}</p>
      <div>
        <button type="button" onClick={decrement}>Decrement</button>
        <button type="button" onClick={increment}>Increment</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
    </main>
  );
}
`;

export const useStateCounterChallenge = {
  id: COUNTER_CHALLENGE_ID,
  slug: "use-state-counter",
  technologyId: "react",
  lessonId: "use-state",
  revision: "v1",
  concept: "useState",
  objectives: ["Store a number in component state", "Update from the previous value", "Connect events to rerendered output"],
  gradingRevision: COUNTER_GRADING_REVISION,
  starterRevision: "counter-starter-v1",
  title: "Build a Counter",
  description: "Turn a static counter into an interactive component by storing the count in state.",
  difficulty: "beginner",
  instructions: [
    "The starter component renders a count and three buttons, but nothing happens when you click them.",
    "Replace the constant with a state variable created by useState, starting at 0.",
    "Complete the three event handlers so that each one calls the state setter.",
    "Select Run (or press Ctrl+Enter / ⌘+Enter in the editor) to render your code in the preview, then try the buttons.",
    "Keep one readable Count: number display and enabled buttons named Increment, Decrement and Reset. You may change the markup and state variable names.",
    "Select Run Tests to check the current code. Each test starts with a fresh counter; the interactive preview is kept as it is.",
  ],
  requirements: COUNTER_TESTS.map((test) => test.title),
  hints: [
    "A plain variable is recreated when a component renders. Which React Hook lets a component remember a value between renders?",
    "Calling a state setter schedules a render. Read the stored number in the count display, and call the setter from each button’s event handler.",
    "When the next count depends on the previous count, use a functional updater such as previous => previous + 1. Decrement needs the opposite change; Reset can set a known value directly.",
  ],
  starterFiles: [{ name: "App.tsx", language: "tsx", code: starterCode }],
} as const satisfies LabChallenge;
