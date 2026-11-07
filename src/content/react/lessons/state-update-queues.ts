import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "react-batches",
      heading: "React batches state updates",
      paragraphs: [
        "React waits until all the code in an event handler has run before processing its state updates. Think of a waiter who takes your whole order rather than walking to the kitchen after each dish.",
        "Batching lets you update several state variables without triggering a render for each one, and it avoids half-finished renders in which only some variables have changed.",
        "React does not batch across separate intentional events. Each click is handled on its own, so if a first click disables a form, a second click cannot submit it again.",
      ],
    },
    {
      id: "updater-functions",
      heading: "Updater functions build on the queue",
      paragraphs: [
        "Passing a function to a setter queues a calculation instead of a value. During the next render, React goes through the queue in order, passing each updater the result of the one before.",
        "This is what makes repeated updates accumulate. It is useful when the next value depends on the previous one, and especially when you do not want to depend on the snapshot in the current render.",
      ],
      examples: [
        {
          id: "updater-queue",
          classification: "complete",
          title: "Three updates that do accumulate",
          language: "tsx",
          code: `import { useState } from "react";

export default function PlusThree() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(previous => previous + 1);
    setCount(previous => previous + 1);
    setCount(previous => previous + 1);
  }

  return (
    <button type="button" onClick={handleClick}>
      Count: {count}
    </button>
  );
}`,
          description: "Each updater receives the pending result: 0 becomes 1, then 2, then 3. One click produces one render, with the count at 3.",
        },
      ],
    },
    {
      id: "mixing-values-and-updaters",
      heading: "Mixing values and updaters",
      paragraphs: [
        "The queue can hold both. A plain value acts as an instruction to replace whatever came before. An updater builds on whatever came before. Working through the queue line by line gives you the answer.",
      ],
      visual: {
        heading: "Processing a queue, starting from count 0",
        context: "These three calls ran in one handler, with count as 0 in that render: setCount(count + 5), then setCount(previous => previous + 1), then setCount(42).",
        steps: [
          { id: "replace-five", title: "Replace with 5", description: "count + 5 was already evaluated from the snapshot, so the result so far is 5." },
          { id: "add-one", title: "Updater adds 1", description: "It receives 5 and returns 6." },
          { id: "replace-final", title: "Replace with 42", description: "This discards the earlier result, so the final value is 42." },
        ],
        note: "React stores the final result and uses it in the next render. The queue belongs to that one state variable.",
      },
    },
    {
      id: "updater-rules",
      heading: "Rules for updater functions",
      paragraphs: [
        "Updaters run during rendering, so they must be pure. They should only calculate and return a value, without setting other state or changing anything outside. In Strict Mode, React calls them twice in development to help reveal mistakes.",
        "A short name based on the state variable is a common convention, such as count => count + 1, or a name like previous when that reads better.",
      ],
      examples: [
        {
          id: "pure-updater",
          classification: "complete",
          title: "A pure updater for an array",
          language: "tsx",
          code: `import { useState } from "react";

export default function Tags() {
  const [tags, setTags] = useState<readonly string[]>(["react"]);

  function addTag(tag: string) {
    setTags(previous => (previous.includes(tag) ? previous : [...previous, tag]));
  }

  return (
    <button type="button" onClick={() => addTag("hooks")}>
      Tags: {tags.join(", ")}
    </button>
  );
}`,
          description: "The updater only reads its argument and returns a result. Returning the same array when nothing changes lets React skip the update.",
        },
      ],
    },
    {
      id: "when-to-use-which",
      heading: "Choosing between a value and an updater",
      paragraphs: [
        "Use whichever states your intent. If you know the next value outright, such as text from an input, pass the value. If it is calculated from the previous value, an updater is the safer choice, though a value is also fine for a single update per event.",
      ],
      comparison: [
        {
          id: "plain-value",
          title: "Pass a value",
          items: ["The next value does not depend on the previous one.", "You are replacing state with input text or a server response.", "Each event makes only one update to this state."],
        },
        {
          id: "updater",
          title: "Pass an updater",
          items: ["Several updates to the same state may happen in one event.", "A callback may run later, from an older render.", "You want the calculation independent of the current snapshot."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "impure-updater",
      heading: "Doing side effects inside an updater",
      problem: "Setting another state or sending a request from inside an updater seems convenient because the next value is available there. But updaters run during rendering, and Strict Mode runs them twice, so the side effect can fire twice.",
      correction: "Keep updaters pure. Do side effects in the event handler, and calculate the value there if needed.",
    },
    {
      id: "expecting-render-per-setter",
      heading: "Expecting a render after each setter",
      problem: "A developer might put three setters in a handler and expect the screen to step through each. Batching means React runs the whole handler first, so intermediate values are never shown.",
      correction: "If you truly need the DOM updated before continuing, use flushSync sparingly. Otherwise, design for one combined result.",
    },
    {
      id: "state-sequence-for-steps",
      heading: "Relying on state changes for sequential logic",
      problem: "Writing setStep(2) and then checking step === 2 on the next line fails, because step is still the old snapshot. The logic appears to skip a stage.",
      correction: "Calculate the next value locally, make your decision from it, and then call the setter.",
    },
    {
      id: "plain-value-in-timer",
      heading: "Using a value-based setter in a long-running callback",
      problem: "setCount(count + 1) inside an interval reads the count from the render that created the interval. Every tick asks for the same number, so the counter stops after one step.",
      correction: "Use setCount(previous => previous + 1) so each tick builds on the latest queued value.",
    },
    {
      id: "mutating-in-updater",
      heading: "Mutating previous state in an updater",
      problem: "previous.push(item) followed by return previous looks like a shortcut. It mutates the old state and returns the same reference, so React may decide nothing changed and skip the render entirely.",
      correction: "Return a new array or object, built without touching the previous one.",
    },
  ],
  interview: [
    {
      id: "what-is-batching",
      question: "What is batching in React?",
      answer: "React collects the state updates made during an event and processes them together after the handler finishes, usually producing one render. It avoids unnecessary renders and half-updated UI. It does not merge separate intentional events such as two different clicks.",
    },
    {
      id: "updater-why",
      question: "When should you use an updater function instead of a value?",
      answer: "When the next value depends on the previous one and may be updated more than once, or from a callback that could be running with an older snapshot. Each updater receives the pending result, so several of them accumulate correctly.",
    },
    {
      id: "queue-puzzle",
      question: "With count at 0, what does setCount(count + 1) followed by setCount(c => c + 1) produce?",
      answer: "2. The first call replaces with 0 + 1, so the pending value is 1. The updater then receives 1 and returns 2. Reading the queue in order, value calls replace and updaters transform.",
    },
    {
      id: "updater-pure",
      question: "Why must updater functions be pure?",
      answer: "They run during the render phase, not when you call the setter. React may call them twice in Strict Mode to surface problems. A side effect there would happen at an unpredictable time, possibly more than once.",
    },
    {
      id: "flush-sync",
      question: "How would you force a state update to apply to the DOM immediately?",
      answer: "flushSync from react-dom makes React process the update synchronously, so the DOM is updated when it returns. It suits rare cases, such as scrolling to a newly added item, and it should be used sparingly, because it bypasses batching and can hurt performance.",
    },
    {
      id: "batching-async",
      question: "Does batching stop if a handler has await in it?",
      answer: "Updates made together in the same tick are still batched. But the code before and after an await run at different times, so updates on each side of it are processed separately. Each portion can produce its own render, so intermediate states may be visible.",
    },
  ],
  takeaways: [
    "React runs the whole handler, then processes queued updates together.",
    "Updaters receive the pending result, so they accumulate.",
    "A plain value replaces whatever came before it in the queue.",
    "Updaters run during rendering, so they must stay pure.",
  ],
  quickReview: {
    definition: "State updates go into a queue per variable, and React processes them in order during the next render.",
    keyPoints: [
      "Batching waits for the handler to finish.",
      "Separate intentional events are not batched together.",
      "Values replace, and updaters transform.",
      "Updaters must be pure, and Strict Mode calls them twice in development.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "An updater",
      language: "tsx",
      code: `setCount(previous => previous + 1);`,
      typecheckContext: { before: `import { useState } from "react";\nexport function Example() {\nconst [, setCount] = useState(0);`, after: "return null;\n}" },
      description: "This queues a calculation based on the pending value rather than this render’s snapshot.",
    },
    commonMistakes: [
      "Sending requests from inside an updater.",
      "Expecting a separate render for each setter call.",
      "Using a value-based setter inside an interval.",
    ],
    interviewTrap: "“Does React batch two separate clicks?” No. It batches updates within an event, while each intentional event is handled on its own.",
    takeaway: "Read the queue in order: a value replaces it, and a function builds on it.",
  },
  sources: [
    { label: "Queueing a Series of State Updates", href: "https://react.dev/learn/queueing-a-series-of-state-updates" },
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
    { label: "Manipulating the DOM with Refs", href: "https://react.dev/learn/manipulating-the-dom-with-refs" },
  ],
};
