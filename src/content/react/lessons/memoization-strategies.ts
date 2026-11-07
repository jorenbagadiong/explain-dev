import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "the-three-tools",
      heading: "Three tools with three jobs",
      paragraphs: [
        "Memoization in React means reusing a previous result when the inputs have not changed. There are three manual tools, and they work together. Using one without understanding the others often achieves nothing.",
      ],
      list: [
        "useMemo caches a calculated value between renders.",
        "useCallback caches a function’s identity between renders.",
        "memo lets a component skip rendering when its props are unchanged.",
      ],
      closing: "Each of these is an optimization and not a guarantee, so correct behavior must never depend on them.",
    },
    {
      id: "how-they-work-together",
      heading: "How they work together",
      paragraphs: [
        "A common goal is keeping an expensive child from re-rendering when its parent updates. That takes two things: the child must be wrapped in memo, and every prop it receives must stay stable. Leave out either one, and the optimization does nothing.",
      ],
      visual: {
        heading: "What it takes to skip a child’s render",
        context: "All three steps have to hold for React to skip the child.",
        steps: [
          { id: "wrap", title: "Wrap the child in memo", description: "Otherwise it renders with its parent and never compares props." },
          { id: "stable-values", title: "Keep object and array props stable", description: "useMemo, or passing primitives instead." },
          { id: "stable-functions", title: "Keep function props stable", description: "useCallback, or declaring them outside the component." },
        ],
        note: "A context the child reads, or its own state, can still cause it to render.",
      },
    },
    {
      id: "choosing-boundaries",
      heading: "Choosing where to cache",
      paragraphs: [
        "Caching has a cost: extra code, dependency lists to keep accurate, and comparisons on each render. So place it at boundaries where a lot of work can be skipped, not on everything. One memo around a slow subtree usually beats a hundred on small leaves.",
        "Stable inputs matter as much as the placement. A cache whose input changes on every render never hits, and it still costs you the comparison.",
      ],
      examples: [
        {
          id: "good-boundary",
          classification: "complete",
          title: "A cache at a meaningful boundary",
          language: "tsx",
          code: `import { memo, useMemo, useState } from "react";

interface Sale {
  id: string;
  amount: number;
}

const SalesReport = memo(function SalesReport({ total, count }: { total: number; count: number }) {
  return (
    <section>
      <h2>Report</h2>
      <p>
        {count} sales, total {total}
      </p>
    </section>
  );
});

export default function Dashboard({ sales }: { sales: readonly Sale[] }) {
  const [note, setNote] = useState("");
  const total = useMemo(() => sales.reduce((sum, sale) => sum + sale.amount, 0), [sales]);

  return (
    <>
      <label>
        Note
        <input value={note} onChange={event => setNote(event.target.value)} />
      </label>
      <SalesReport total={total} count={sales.length} />
    </>
  );
}`,
          description: "Typing skips the calculation and the report. The props are primitives, so they compare easily, without needing to stabilize an object.",
        },
      ],
    },
    {
      id: "before-memoizing",
      heading: "Try these before memoizing",
      paragraphs: [
        "Structural changes often solve the same problem with no extra Hooks, and they stay effective as code changes. They are worth trying first.",
      ],
      list: [
        "Move state down, so that updates affect a smaller subtree.",
        "Pass JSX as children, so that a wrapper’s state does not re-render the content.",
        "Pass primitives or derived values that change less often.",
        "Remove Effects that set state, which cause extra renders.",
        "Keep rendering pure, and avoid expensive work during rendering.",
      ],
      examples: [
        {
          id: "move-state-instead",
          classification: "complete",
          title: "Moving state instead of memoizing",
          language: "tsx",
          code: `import { useState } from "react";

function NoteField() {
  const [note, setNote] = useState("");

  return (
    <label>
      Note
      <input value={note} onChange={event => setNote(event.target.value)} />
    </label>
  );
}

function SalesReport() {
  return <section>Report</section>;
}

export default function Dashboard() {
  return (
    <>
      <NoteField />
      <SalesReport />
    </>
  );
}`,
          description: "Typing now only renders NoteField, so the report needs no memo. This also keeps working with no dependency lists to maintain.",
        },
      ],
    },
    {
      id: "the-compiler",
      heading: "The React Compiler changes the default",
      paragraphs: [
        "The React Compiler, when enabled, memoizes components and calculations automatically at build time. The docs suggest relying on it for new code and using manual tools only where you need precise control, such as a value used as an Effect dependency. In existing code, leave memoization in place, because removing it can change the compiler’s output, or else test carefully.",
        "It only works on code that follows the Rules of React, and it requires build configuration, so it is not automatic with React 19. Its memoization is not shared across components, and it does not memoize plain functions.",
      ],
    },
  ],
  mistakes: [
    {
      id: "half-strategy",
      heading: "Using only part of the strategy",
      problem: "useCallback for a handler passed to a child that is not in memo does nothing, as the child renders with its parent regardless. The reverse, memo with an unstable prop, fails in the same way, and both add code.",
      correction: "Decide what you are trying to skip, and make sure each required piece is in place.",
    },
    {
      id: "memo-by-default",
      heading: "Memoizing by default",
      problem: "Writing useMemo and useCallback around everything feels safe, but it adds noise, and each dependency list is a place to introduce stale-value bugs. Most values were never expensive in the first place.",
      correction: "Start without it, and add it when measurement points to a specific cost.",
    },
    {
      id: "unstable-deps",
      heading: "Using dependencies that change on every render",
      problem: "A useMemo that depends on an object created in the same render recalculates every time, so the cache never hits. It looks optimized, but it costs more than the plain calculation.",
      correction: "Stabilize the dependency, depend on primitives, or move the object inside the calculation.",
    },
    {
      id: "correctness-on-cache",
      heading: "Depending on the cache for correctness",
      problem: "Creating a resource in useMemo and assuming it stays is unsafe, since React may discard the cache, for example when a component suspends during its first mount. The object is then silently re-created.",
      correction: "Use state or a ref for anything that must persist.",
    },
    {
      id: "removing-all-for-compiler",
      heading: "Removing all manual memoization when adopting the compiler",
      problem: "Deleting existing useMemo calls when turning on the compiler seems tidy, but it can change compiler output, and an Effect that relied on a stable value may start firing more often.",
      correction: "Leave existing calls in place, or remove them carefully, with testing.",
    },
  ],
  interview: [
    {
      id: "ms-together",
      question: "How do memo, useMemo, and useCallback work together?",
      answer: "memo makes a component compare props, and useMemo and useCallback keep object and function props stable so the comparison can succeed. A child needs memo and stable props for React to skip it. useMemo also stands alone for caching an expensive calculation.",
    },
    {
      id: "ms-when",
      question: "How do you decide what to memoize?",
      answer: "I start from a measured problem, then find which components account for the time. I would try moving state down or passing children first. Memoization goes at boundaries where it skips significant work, with inputs that actually stay stable.",
    },
    {
      id: "ms-cost",
      question: "What are the costs of memoization?",
      answer: "More code to read, dependency lists that can produce stale-value bugs when wrong, and comparison work on every render. If inputs change each time, you pay for the comparison and get nothing. That is why applying it everywhere is rarely a net gain.",
    },
    {
      id: "ms-alternatives",
      question: "What can you do before reaching for memoization?",
      answer: "Move state closer to where it is used, pass JSX as children, pass primitives instead of objects, and remove Effects that set state. These reduce rendering through structure, keep working as the code changes, and need no dependency lists.",
    },
    {
      id: "ms-compiler-q",
      question: "Does the React Compiler make manual memoization obsolete?",
      answer: "Mostly for new code, where the docs recommend relying on it. Manual tools are still useful for precise control, and for code the compiler skips because it breaks the Rules of React. It also has to be enabled in the build, so it is not automatic.",
    },
    {
      id: "ms-semantics",
      question: "Why can’t you rely on memoization for correctness?",
      answer: "React treats it as an optimization and may discard a cache, or re-render a memoized component. If behavior changes depending on whether a cache was hit, that is a bug waiting to appear. State and refs are the tools for values that must persist.",
    },
  ],
  takeaways: [
    "memo needs stable props, and stable props only matter with memo.",
    "Place caches at boundaries that skip significant work.",
    "Structural fixes usually come first.",
    "The React Compiler automates much of this, where it is enabled.",
  ],
  quickReview: {
    definition: "A memoization strategy decides where caching actually saves work, using memo, useMemo, and useCallback together.",
    keyPoints: [
      "Skipping a child takes memo and stable props.",
      "A cache whose inputs always change never helps.",
      "Move state and pass children before caching.",
      "All of it is optimization, not guaranteed behavior.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "The stable-prop pair",
      language: "tsx",
      code: `const handleSave = useCallback(() => save(id), [id]);

return <SlowForm onSave={handleSave} />;`,
      typecheckContext: { before: `import { memo, useCallback, type ReactNode } from "react";\ndeclare const save: (id: string) => void;\nconst SlowForm = memo(function SlowForm(props: { onSave: () => void }): ReactNode { return <button onClick={props.onSave} />; });\nexport function Example({ id }: { id: string }) {`, after: "}" },
      description: "SlowForm must also be wrapped in memo for this to skip anything.",
    },
    commonMistakes: [
      "Using useCallback for a child that is not in memo.",
      "Memoizing everything by default.",
      "Depending on values that change each render.",
    ],
    interviewTrap: "“Does useCallback alone stop a child re-rendering?” No. The child must also be wrapped in memo, and all its other props must be stable.",
    takeaway: "Decide what you want to skip, and check that every piece needed to skip it is in place.",
  },
  sources: [
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
    { label: "useCallback reference", href: "https://react.dev/reference/react/useCallback" },
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "React Compiler introduction", href: "https://react.dev/learn/react-compiler/introduction" },
  ],
};
