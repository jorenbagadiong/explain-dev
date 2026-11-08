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
  id: "react-use-state-counter",
  slug: "use-state-counter",
  technologyId: "react",
  lessonId: "use-state",
  title: "Build a Counter",
  description: "Turn a static counter into an interactive component by storing the count in state.",
  difficulty: "beginner",
  instructions: [
    "The starter component renders a count and three buttons, but nothing happens when you click them.",
    "Replace the constant with a state variable created by useState, starting at 0.",
    "Complete the three event handlers so that each one calls the state setter.",
    "Select Run (or press Ctrl+Enter / ⌘+Enter in the editor) to render your code in the preview, then try the buttons.",
  ],
  requirements: [
    "The preview initially shows “Count: 0”.",
    "Increment increases the count by one.",
    "Decrement decreases the count by one.",
    "Reset returns the count to zero.",
  ],
  hints: [
    "useState returns a pair: the current value and a function that schedules an update.",
    "Calling setCount(count + 1) asks React to render again with the new value.",
    "Reset does not need the previous value: setCount(0) is enough.",
  ],
  starterFiles: [{ name: "App.tsx", language: "tsx", code: starterCode }],
} as const satisfies LabChallenge;
