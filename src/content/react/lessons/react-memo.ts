import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-memo-does",
      heading: "What memo does",
      paragraphs: [
        "memo wraps a component so that React can skip re-rendering it when its parent re-renders, as long as its props have not changed. It returns a new component that otherwise behaves the same way as the original.",
        "It is a performance optimization, not a guarantee. React may still re-render a memoized component, so your code must work correctly without memo.",
      ],
      examples: [
        {
          id: "basic-memo",
          classification: "complete",
          title: "Skipping a render with memo",
          language: "tsx",
          code: `import { memo, useState } from "react";

const Greeting = memo(function Greeting({ name }: { name: string }) {
  return <h2>Hello, {name}</h2>;
});

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Greeting name="Ana" />
      <button type="button" onClick={() => setCount(previous => previous + 1)}>
        Clicked {count} times
      </button>
    </>
  );
}`,
          description: "Clicking re-renders Page, but Greeting’s name is unchanged, so React can skip it.",
        },
      ],
    },
    {
      id: "what-still-renders",
      heading: "What memo does not stop",
      paragraphs: [
        "memo only concerns props from the parent. A memoized component still re-renders when its own state changes, and when a context it reads changes.",
      ],
      list: [
        "Its own state or reducer updates.",
        "A context it reads gets a new value.",
        "Any prop that differs under Object.is, including a new object, array, or function.",
      ],
      closing: "To limit a context-driven update to part of a component, read the context in an outer component and pass only what is needed to a memoized child.",
    },
    {
      id: "comparison",
      heading: "How props are compared",
      paragraphs: [
        "By default, React compares each prop shallowly with Object.is. Object.is(3, 3) is true, while Object.is({}, {}) is false, so a new object or inline function on each render counts as a change. One always-new prop defeats memo for the whole component.",
      ],
      examples: [
        {
          id: "stable-props",
          classification: "complete",
          title: "Keeping props stable",
          language: "tsx",
          code: `import { memo, useCallback, useMemo, useState } from "react";

const Profile = memo(function Profile({ person, onSave }: { person: { name: string }; onSave: () => void }) {
  return (
    <button type="button" onClick={onSave}>
      Save {person.name}
    </button>
  );
});

export default function Page({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  const person = useMemo(() => ({ name }), [name]);
  const handleSave = useCallback(() => console.log("Saved", name), [name]);

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>{count}</button>
      <Profile person={person} onSave={handleSave} />
    </>
  );
}`,
          description: "Without useMemo and useCallback, both props would be new on each click, and memo would achieve nothing. Passing a plain name string would be simpler still.",
        },
      ],
    },
    {
      id: "when-worthwhile",
      heading: "When it is worthwhile",
      paragraphs: [
        "memo helps when a component re-renders often with the same props and its rendering is expensive. It adds little for coarse interactions, such as replacing a whole page, or where nothing feels slow, or where props are always new.",
        "If a specific interaction lags, use the React DevTools Profiler to find the components that would benefit. Other approaches often remove the need altogether: pass JSX as children, keep state lower, and pass primitives or derived values that change less often.",
      ],
      comparison: [
        {
          id: "good-fit",
          title: "Often worthwhile",
          items: ["A slow chart beside a fast-changing input.", "List rows, when a parent updates frequently.", "Something a Profiler recording shows as a real cost."],
        },
        {
          id: "poor-fit",
          title: "Rarely worthwhile",
          items: ["Components that always get new props.", "Cheap components, such as a label.", "A page that fully changes on each interaction."],
        },
      ],
    },
    {
      id: "custom-comparison",
      heading: "Custom comparison functions",
      paragraphs: [
        "memo accepts a second argument, a function that returns true when the old and new props produce the same output. It carries risks. You must compare every prop, including functions. Returning true when onClick has changed leaves handlers reading stale values. Avoid deep equality unless the data’s depth is known and limited, because it can become very slow.",
      ],
      examples: [
        {
          id: "are-props-equal",
          classification: "complete",
          title: "A custom comparison",
          language: "tsx",
          code: `import { memo } from "react";

interface Point {
  x: number;
  y: number;
}

interface ChartProps {
  points: readonly Point[];
  label: string;
}

function arePropsEqual(previous: ChartProps, next: ChartProps) {
  return (
    previous.label === next.label &&
    previous.points.length === next.points.length &&
    previous.points.every((point, index) => point.x === next.points[index].x && point.y === next.points[index].y)
  );
}

export const Chart = memo(function Chart({ points, label }: ChartProps) {
  return <p>{label}: {points.length} points</p>;
}, arePropsEqual);`,
          description: "Every prop is compared. Confirm with measurement that this is actually faster than simply re-rendering.",
        },
      ],
    },
    {
      id: "react-compiler",
      heading: "With the React Compiler",
      paragraphs: [
        "With the React Compiler enabled, you typically do not need memo, since it automatically caches JSX and values whose inputs have not changed, and that goes further than memo does by memoizing intermediate values too. The compiler is opt-in tooling, so in projects without it, these manual tools still apply.",
      ],
    },
  ],
  mistakes: [
    {
      id: "guarantee",
      heading: "Treating memo as a guarantee",
      problem: "Relying on a memoized component never re-rendering, such as by putting side effects in it, breaks when React re-renders it anyway. Fast Refresh, state, and context can each cause a render.",
      correction: "Keep rendering pure, so that an extra render never changes behavior.",
    },
    {
      id: "always-new-props",
      heading: "Passing new objects or functions",
      problem: "style={{ color: \"red\" }} or an inline handler creates a new value on each render, so the shallow comparison always fails, and memo adds its comparison cost with no benefit at all.",
      correction: "Stabilize those props with useMemo or useCallback, or pass primitives.",
    },
    {
      id: "everything-memo",
      heading: "Wrapping every component in memo",
      problem: "Used everywhere, it makes code harder to read, adds comparison work to each render, and encourages stabilizing every prop through more Hooks. Most components gain nothing from it.",
      correction: "Add it where a recorded profile shows a genuine cost.",
    },
    {
      id: "incomplete-compare",
      heading: "Leaving a prop out of a custom comparison",
      problem: "Ignoring onClick because the data is the same seems safe, but that function closes over parent values. React then keeps the old one, so the click uses stale props and state.",
      correction: "Compare every prop, or do not write a custom function.",
    },
    {
      id: "children-prop",
      heading: "Passing children to a memoized component",
      problem: "JSX creates new elements on each render, so a children prop is new every time, unless the parent’s elements are themselves stable. memo then re-renders on every parent update.",
      correction: "Move the memo to the expensive child itself, or lift that element so it does not get re-created.",
    },
  ],
  interview: [
    {
      id: "rm-what",
      question: "What does React.memo do?",
      answer: "It lets React skip re-rendering a component when its parent renders and its props are unchanged, using a shallow Object.is comparison. It is an optimization rather than a guarantee, so correct behavior must not depend on it.",
    },
    {
      id: "rm-still",
      question: "When does a memoized component still re-render?",
      answer: "When its own state changes, when a context it reads changes, or when any prop differs under Object.is, including new objects and functions. React may also choose to re-render it, so it cannot be relied on for correctness.",
    },
    {
      id: "rm-why-not-usememo",
      question: "Why is memo often paired with useMemo and useCallback?",
      answer: "memo compares by reference, so a new object or function each render always looks changed. useMemo and useCallback keep those references stable. Without them, memo does its comparison and then renders anyway. On their own, those Hooks do not stop a child from rendering.",
    },
    {
      id: "rm-when",
      question: "When is memo worth using?",
      answer: "When a component is expensive, re-renders often, and usually gets the same props, as a Profiler recording can confirm. I would first check whether moving state down or passing children removes the problem, since those need no extra Hooks.",
    },
    {
      id: "rm-custom",
      question: "What are the risks of a custom comparison function?",
      answer: "Leaving out a prop can freeze a stale function, so handlers read old data. Deep comparisons can be slower than rendering and can become very expensive as data grows. The comparison also has to be measured, and it needs maintenance whenever props change.",
    },
    {
      id: "rm-compiler",
      question: "How does the React Compiler change the use of memo?",
      answer: "When enabled, it caches JSX and intermediate values automatically, so you typically do not need memo. It requires build configuration, so it does not apply just because a project uses React 19. Existing memo calls can generally stay in place.",
    },
  ],
  takeaways: [
    "memo skips re-renders for unchanged props, and it is not a guarantee.",
    "State and context changes still render a memoized component.",
    "One always-new prop defeats the comparison.",
    "Add it where profiling shows a real cost.",
  ],
  quickReview: {
    definition: "memo lets React skip rendering a component when its parent renders and its props are shallowly unchanged.",
    keyPoints: [
      "Comparison uses Object.is, prop by prop.",
      "New objects and functions count as changes.",
      "Own state and read contexts still cause renders.",
      "The React Compiler reduces the need for it, where enabled.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A memoized component",
      language: "tsx",
      code: `import { memo } from "react";

export const Row = memo(function Row({ label }: { label: string }) {
  return <li>{label}</li>;
});`,
      description: "It can be skipped when label is unchanged, and it must still work if it is not.",
    },
    commonMistakes: [
      "Passing inline objects and functions to it.",
      "Wrapping every component by default.",
      "Omitting props in a custom comparison.",
    ],
    interviewTrap: "“Does memo guarantee a component will not re-render?” No. Its own state, context, and React itself can all still cause a render.",
    takeaway: "Treat memo as a measured optimization, and never as behavior your code relies on.",
  },
  sources: [
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
    { label: "useCallback reference", href: "https://react.dev/reference/react/useCallback" },
    { label: "React Compiler introduction", href: "https://react.dev/learn/react-compiler/introduction" },
  ],
};
