// Trusted reference text, loaded only after an explicit reveal. Never inserted into the learner editor.
export const counterSolution = {
  code: `import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(previous => previous + 1);
  }

  function decrement() {
    setCount(previous => previous - 1);
  }

  function reset() {
    setCount(0);
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
`,
  explanation: [
    { title: "Remember the number with useState", body: "useState(0) gives this component a stored count and a setter. React preserves that state between renders; a plain local variable would start over." },
    { title: "Update from the previous value", body: "Increment and Decrement pass updater functions to the setter. React applies each updater to the latest pending value, so the next value does not depend on an older render’s captured count." },
    { title: "Pass event handlers", body: "The buttons receive function references. React calls the relevant handler after a click. Reset writes zero directly because it does not depend on the previous value." },
    { title: "Render the new state", body: "A setter schedules another render. React calls the component with the updated count, and the count text changes. Viewing or copying this reference does not verify your draft; Run Tests checks its actual behavior." },
  ],
} as const;
