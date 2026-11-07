import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "rendering-takes-a-snapshot",
      heading: "Each render takes a snapshot",
      paragraphs: [
        "State feels like a variable you can read and write, but it behaves more like a snapshot. When React calls your component, it hands over the state for that render. The props, handlers, and local variables you create are all calculated from that value, and they stay that way.",
        "Setting state does not change the variable you already have. It asks React for a new render, and that render gets a new snapshot.",
      ],
      visual: {
        heading: "What happens on one update",
        context: "This follows a click when count is currently 0.",
        steps: [
          { id: "handler", title: "The handler runs with count as 0", description: "It belongs to the render where count was 0." },
          { id: "setter", title: "setCount(1) queues a render", description: "The variable count in this handler is still 0." },
          { id: "render", title: "React renders with count as 1", description: "A new snapshot, with new handlers that see 1." },
          { id: "commit", title: "React updates the screen", description: "The DOM is changed to match the new output." },
        ],
        note: "This is simplified. React may batch several updates from one event into a single render.",
      },
    },
    {
      id: "why-three-sets-add-one",
      heading: "Why setting state three times adds one",
      paragraphs: [
        "A classic example makes the snapshot idea concrete. All three calls below read the same count from the same render, so each one asks for the same next value.",
      ],
      examples: [
        {
          id: "three-sets",
          classification: "complete",
          title: "Three identical requests",
          language: "tsx",
          code: `import { useState } from "react";

export default function PlusThree() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return (
    <button type="button" onClick={handleClick}>
      Count: {count}
    </button>
  );
}`,
          description: "On the first click, count is 0 in all three lines, so each asks for 1. The result is 1, not 3. Replacing the variable with its value makes this clear: setCount(0 + 1) three times.",
        },
      ],
      closing: "If the next value depends on pending updates, use an updater function such as setCount(previous => previous + 1), which the next lesson covers.",
    },
    {
      id: "state-over-time",
      heading: "A handler keeps its snapshot, even later",
      paragraphs: [
        "A state variable’s value never changes within a render, including inside code that runs later. A delayed callback sees the state from the render that created it, not the latest one.",
        "This is often helpful. If a user presses Send and then edits the recipient, the delayed send still uses the recipient they were looking at when they pressed the button.",
      ],
      examples: [
        {
          id: "delayed-read",
          classification: "client",
          title: "A delayed callback sees its own render",
          language: "tsx",
          code: `import { useState } from "react";

export default function DelayedGreeting() {
  const [name, setName] = useState("Ana");

  function handleSend() {
    window.setTimeout(() => {
      window.alert("Hello, " + name);
    }, 3000);
  }

  return (
    <>
      <label>
        Recipient
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      <button type="button" onClick={handleSend}>
        Send in 3 seconds
      </button>
    </>
  );
}`,
          description: "Edit the name after pressing the button, and the alert still shows the name from the moment you pressed it.",
        },
      ],
    },
    {
      id: "when-you-need-latest",
      heading: "When you actually need the latest value",
      paragraphs: [
        "Most of the time, the snapshot is what you want. There are two common exceptions, and each has its own tool.",
      ],
      list: [
        "The next value depends on the previous one: pass an updater function to the setter.",
        "You need the next value right away in the same handler: calculate it into a local variable, use it, and pass it to the setter.",
        "A long-lived callback must read the newest value without restarting: keep that value in a ref.",
      ],
    },
  ],
  mistakes: [
    {
      id: "reading-after-set",
      heading: "Reading state right after setting it",
      problem: "A log after setName(\"Robin\") still prints the old name, which looks like the setter failed. The setter only affects the next render, and the running code keeps this render’s snapshot.",
      correction: "Calculate the next value into a local variable if you need it immediately.",
      examples: [
        {
          id: "next-value",
          classification: "complete",
          title: "Using the next value in the same handler",
          language: "tsx",
          code: `import { useState } from "react";

export default function StepCounter({ onChange }: { onChange: (next: number) => void }) {
  const [step, setStep] = useState(1);

  function handleNext() {
    const nextStep = step + 1;
    setStep(nextStep);
    onChange(nextStep);
  }

  return (
    <button type="button" onClick={handleNext}>
      Step {step}
    </button>
  );
}`,
          description: "The local variable holds the value, so nothing depends on state having already changed.",
        },
      ],
    },
    {
      id: "expecting-multiple-increments",
      heading: "Expecting repeated setters to accumulate",
      problem: "Calling setCount(count + 1) several times looks like it should add several times. Every call reads the same snapshot, so the requests all ask for the same value.",
      correction: "Use updater functions, which each receive the pending result of the one before.",
    },
    {
      id: "stale-closure-surprise",
      heading: "Being surprised by old values in timers",
      problem: "A setInterval created once keeps reading the state from the render that created it, so a counter it updates may appear stuck. This is called a stale closure, and it follows directly from each render having its own values.",
      correction: "Use an updater function in the callback, or include the value in the Effect’s dependencies, so a fresh callback is created when it changes.",
    },
  ],
  interview: [
    {
      id: "snapshot-meaning",
      question: "What does it mean that state is a snapshot?",
      answer: "Each render has its own fixed state value, and everything created during that render closes over it. Setting state requests a new render with a new value. It does not change the variable in the code that is already running.",
    },
    {
      id: "three-sets-result",
      question: "If count is 0 and you call setCount(count + 1) three times in one click, what is the result?",
      answer: "One. Each call reads the same count of 0 from the current render, so all three ask for 1. To add three, use updater functions, which build on the pending value in the queue.",
    },
    {
      id: "log-after-set",
      question: "Why does console.log show the old value right after a setter?",
      answer: "The setter queues a render rather than mutating the variable. The handler is still running within the old render’s snapshot, so reading the variable returns the value it had when that render happened.",
    },
    {
      id: "timeout-value",
      question: "What value does a setTimeout callback see if state changes before it fires?",
      answer: "The value from the render that created it. The closure captured that render’s variable. This prevents race-like surprises, such as a delayed send using text the user edited later, and a ref is the way to read something newer.",
    },
    {
      id: "where-state-lives",
      question: "If variables are re-created each render, where does state actually live?",
      answer: "React holds it outside your function, associated with the component instance. On each render, React gives the function the current value. That is why state lasts between renders, even though the function’s local variables do not.",
    },
  ],
  takeaways: [
    "Each render has its own fixed state, props, and handlers.",
    "Setters request a new render and do not change the current variable.",
    "Code that runs later still sees the snapshot from its own render.",
    "Use updaters, local variables, or refs when you need something else.",
  ],
  quickReview: {
    definition: "State acts as a snapshot: a render’s value stays fixed, and setting state asks for a new render with a new one.",
    keyPoints: [
      "A setter affects the next render only.",
      "Handlers and timers close over their render’s values.",
      "Repeated value-based setters do not accumulate.",
      "React stores state outside your function.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Substitute the snapshot",
      language: "tsx",
      code: `// With count as 0 in this render:
setCount(count + 1); // setCount(0 + 1)
setCount(count + 1); // setCount(0 + 1)`,
      typecheckContext: { before: "declare const count: number;\ndeclare const setCount: (next: number) => void;" },
      description: "Reading each line with the value substituted shows why the result is 1.",
    },
    commonMistakes: [
      "Logging state right after setting it and expecting the new value.",
      "Chaining setCount(count + 1) to add several times.",
    ],
    interviewTrap: "“Does a timeout read the latest state?” No. It reads the render that created it, unless you use a ref or an updater function.",
    takeaway: "When state seems wrong, ask which render this code belongs to.",
  },
  sources: [
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "Queueing a Series of State Updates", href: "https://react.dev/learn/queueing-a-series-of-state-updates" },
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
  ],
};
