import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-use-ref-does",
      heading: "What useRef does",
      paragraphs: [
        "useRef lets a component hold on to a value that is not needed for rendering. It returns a plain object with one property, current, set to the initial value you pass. React gives back the same object on every render, and it ignores the argument after the first one.",
        "Unlike state, you can change current directly, and doing so does not trigger a render, because React is not told about it. Each instance of a component gets its own ref, unlike a variable declared outside the component, which would be shared.",
      ],
      comparison: [
        {
          id: "ref",
          title: "A ref",
          items: ["Persists between renders.", "Changing it does not re-render.", "Changed directly through current.", "Not for values shown on screen."],
        },
        {
          id: "state",
          title: "State",
          items: ["Persists between renders.", "Changing it requests a render.", "Changed through a setter.", "For anything displayed."],
        },
      ],
    },
    {
      id: "storing-values",
      heading: "Remembering values without rendering",
      paragraphs: [
        "Refs suit information your handlers need but your output does not. A timer ID is the classic example: starting and stopping a timer needs the ID, but nothing displays it.",
      ],
      examples: [
        {
          id: "stopwatch",
          classification: "complete",
          title: "A timer ID in a ref",
          language: "tsx",
          code: `import { useRef, useState } from "react";

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function handleStart() {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds(previous => previous + 1);
    }, 1000);
  }

  function handleStop() {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <>
      <p>{seconds} seconds</p>
      <button type="button" onClick={handleStart}>
        Start
      </button>
      <button type="button" onClick={handleStop}>
        Stop
      </button>
    </>
  );
}`,
          description: "seconds is displayed, so it is state. The interval ID is not displayed, so it is a ref. A real component would also clear the timer when it unmounts.",
        },
      ],
    },
    {
      id: "dom-refs",
      heading: "Reaching a DOM node",
      paragraphs: [
        "The most common use is getting a real DOM node. Initialize the ref to null and pass it as the ref attribute. React sets current to the node during the commit, and sets it back to null when the node is removed.",
        "Use this for things the DOM can do that JSX cannot express, such as focusing, scrolling, or playing a video. In TypeScript, pass the element type as the type argument.",
      ],
      examples: [
        {
          id: "focus-input",
          classification: "complete",
          title: "Focusing an input",
          language: "tsx",
          code: `import { useRef } from "react";

export default function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <label>
        Search
        <input ref={inputRef} />
      </label>
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus the search box
      </button>
    </>
  );
}`,
          description: "The optional chaining handles the moment when current is null, before mounting or after removal.",
        },
      ],
    },
    {
      id: "passing-refs",
      heading: "Passing a ref to your own component",
      paragraphs: [
        "Refs do not reach inside your components automatically. In React 19, ref is accepted as an ordinary prop, so a component can forward it to the DOM element it renders. Without that forwarding, the parent’s current stays null.",
      ],
      examples: [
        {
          id: "ref-prop",
          classification: "complete",
          title: "Forwarding a ref as a prop",
          language: "tsx",
          code: `import { useRef, type Ref } from "react";

function TextField({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}

export default function Signup() {
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <TextField label="Email" ref={emailRef} />
      <button type="button" onClick={() => emailRef.current?.focus()}>
        Fix email
      </button>
    </>
  );
}`,
          description: "Older code used forwardRef for this. New components can simply take ref as a prop.",
        },
      ],
    },
    {
      id: "rendering-rule",
      heading: "Do not read or write refs during rendering",
      paragraphs: [
        "A component body should behave like a pure function, and React expects that. A ref read during rendering can produce output that changes without React knowing, and a write can have effects that depend on how many times the component was called.",
        "Read and write refs in event handlers and Effects. If you need a value while rendering, it belongs in state. The one exception is lazy initialization: checking for null and creating an object once, because the result is always the same.",
      ],
      examples: [
        {
          id: "lazy-init",
          classification: "client",
          title: "Creating an object once",
          language: "tsx",
          code: `import { useRef } from "react";

class AudioMeter {
  level = 0;
}

export default function Meter() {
  const meterRef = useRef<AudioMeter | null>(null);

  if (meterRef.current === null) {
    meterRef.current = new AudioMeter();
  }

  return <p>Meter ready</p>;
}`,
          description: "Writing useRef(new AudioMeter()) would construct a new object on every render and discard all but the first.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "ref-for-display",
      heading: "Using a ref for a value shown on screen",
      problem: "Incrementing ref.current and rendering it looks simple, but changing a ref does not request a render, so the screen shows an old number until something else happens to render it.",
      correction: "Use state for anything displayed.",
    },
    {
      id: "read-during-render",
      heading: "Reading or writing current during rendering",
      problem: "Rendering {ref.current} or assigning to it in the component body makes output depend on something React cannot track. It may work for now, but it breaks purity, and behavior can change with Strict Mode or future features.",
      correction: "Move reads and writes to event handlers or Effects, or use state.",
    },
    {
      id: "ref-not-forwarded",
      heading: "Passing a ref to a component that ignores it",
      problem: "<MyInput ref={inputRef} /> leaves current as null if MyInput does not pass ref to a DOM element, which produces a cannot read properties of null error when you call a method on it.",
      correction: "Accept ref as a prop and attach it to the element inside.",
    },
    {
      id: "expensive-initial",
      heading: "Creating an expensive object in the argument",
      problem: "useRef(new VideoPlayer()) constructs a player on every render, though only the first is kept. The waste is invisible, but the constructor may have a real cost, or side effects you did not expect to repeat.",
      correction: "Start with null and create it once, using the null check in the component body.",
    },
    {
      id: "dom-mutation-through-ref",
      heading: "Changing React-managed DOM through a ref",
      problem: "Having the node makes it tempting to remove it or edit its children. React still believes the node matches its last output, so a later update can overwrite your change or crash.",
      correction: "Use refs for non-destructive actions such as focus and scroll, and express other changes through state.",
    },
  ],
  interview: [
    {
      id: "ref-vs-state",
      question: "What is the difference between useRef and useState?",
      answer: "Both persist between renders, but changing a ref does not trigger a render, while setting state does. A ref is changed directly through current, and it is meant for values that do not affect output. Anything on screen belongs in state.",
    },
    {
      id: "when-use-ref",
      question: "What are good uses for useRef?",
      answer: "Holding DOM nodes for focus, scrolling, or measuring. Holding values such as timer IDs or a previous value used only in handlers. Holding instances of non-React objects. In all of these, nothing needs to re-render when the value changes.",
    },
    {
      id: "ref-render-rule",
      question: "Why shouldn’t you read a ref during rendering?",
      answer: "React expects rendering to be pure. A ref can change without React knowing, so output based on it could be stale or inconsistent, and writes could depend on how often the component runs. Lazy initialization is the accepted exception, since its result is stable.",
    },
    {
      id: "ref-null-when",
      question: "When is a DOM ref’s current null?",
      answer: "Before the node has mounted, and after it has been removed. React sets current during the commit, so it is null during the first render. That is why ref access belongs in handlers or Effects, and why TypeScript makes you handle null.",
    },
    {
      id: "ref-as-prop",
      question: "How do you pass a ref to a custom component in React 19?",
      answer: "Accept ref as a normal prop and attach it to the inner DOM element. forwardRef was the older way, and it is no longer needed for new components in React 19, though you will still find it in existing code.",
    },
    {
      id: "ref-vs-module-variable",
      question: "Why not use a variable outside the component instead of a ref?",
      answer: "A module-level variable is shared by every instance of the component, so two instances would overwrite each other’s values. Each instance has its own ref, which keeps the same persistence without the sharing.",
    },
  ],
  takeaways: [
    "A ref is a mutable box that persists without causing renders.",
    "Use refs for DOM nodes and for values not shown on screen.",
    "Do not read or write refs during rendering, except for lazy initialization.",
    "In React 19, ref can be passed as an ordinary prop.",
  ],
  quickReview: {
    definition: "useRef returns one stable object per instance, whose current property you can change without causing a render.",
    keyPoints: [
      "The initial value is ignored after the first render.",
      "React sets DOM refs during commit, and clears them on removal.",
      "Use state instead for anything displayed.",
      "Each instance has its own ref.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A typed DOM ref",
      language: "tsx",
      code: `const inputRef = useRef<HTMLInputElement>(null);`,
      typecheckContext: { before: `import { useRef } from "react";\nexport function Example() {`, after: "return <input ref={inputRef} />;\n}" },
      description: "Attach it with ref={inputRef}, and it holds the node after commit.",
    },
    commonMistakes: [
      "Displaying a ref’s value and expecting updates.",
      "Reading current while rendering.",
      "Passing a ref to a component that does not attach it.",
    ],
    interviewTrap: "“Does updating ref.current re-render?” No. Its whole purpose is to hold a value without doing so, which is why it should not drive output.",
    takeaway: "If the screen depends on it, use state. If only your code depends on it, a ref may fit.",
  },
  sources: [
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
    { label: "Manipulating the DOM with Refs", href: "https://react.dev/learn/manipulating-the-dom-with-refs" },
  ],
};
