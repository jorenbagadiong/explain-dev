import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-use-memo-does",
      heading: "What useMemo does",
      paragraphs: [
        "useMemo caches the result of a calculation between renders. On the first render, React calls your function and returns its result. On later renders, it returns the cached result if the dependencies have not changed, and otherwise it recalculates.",
        "React compares each dependency with its previous value using Object.is. The function takes no arguments, must return a value, and must be pure.",
      ],
      examples: [
        {
          id: "basic-memo",
          classification: "complete",
          title: "Caching a filtered list",
          language: "tsx",
          code: `import { useMemo, useState } from "react";

interface Todo {
  id: number;
  title: string;
  isDone: boolean;
}

export default function TodoList({ todos, showDone }: { todos: readonly Todo[]; showDone: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const visibleTodos = useMemo(() => todos.filter(todo => showDone || !todo.isDone), [todos, showDone]);

  return (
    <div className={isDark ? "dark" : "light"}>
      <button type="button" onClick={() => setIsDark(previous => !previous)}>
        Toggle theme
      </button>
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
          description: "Toggling the theme re-renders the component, but filtering is skipped because neither dependency changed. For a small list like this, the filter is cheap, so the caching would matter only if measurement showed a cost.",
        },
      ],
    },
    {
      id: "when-it-helps",
      heading: "When it is worth using",
      paragraphs: [
        "Most calculations are fast enough that caching gains nothing. useMemo tends to be worthwhile in three situations.",
      ],
      list: [
        "The calculation is noticeably slow, and its dependencies rarely change. Measure it with console.time in a production build, ideally with a throttled CPU.",
        "The value is passed to a child wrapped in memo, so an unchanged reference lets the child skip rendering.",
        "The value is a dependency of another Hook, where a new object each render would re-run it.",
      ],
      examples: [
        {
          id: "memo-for-child",
          classification: "complete",
          title: "Keeping a prop stable for a memoized child",
          language: "tsx",
          code: `import { memo, useMemo } from "react";

const Chart = memo(function Chart({ points }: { points: readonly number[] }) {
  return <p>{points.length} points</p>;
});

export default function Dashboard({ values, label }: { values: readonly number[]; label: string }) {
  const points = useMemo(() => values.map(value => value * 2), [values]);

  return (
    <section>
      <h2>{label}</h2>
      <Chart points={points} />
    </section>
  );
}`,
          description: "Without useMemo, map creates a new array on every render, so a change to label alone would defeat memo.",
        },
      ],
    },
    {
      id: "what-it-does-not-do",
      heading: "What it does not do",
      paragraphs: [
        "useMemo is a performance optimization, not a semantic guarantee. React may discard the cache, such as when you edit the file in development or when a component suspends during its first mount. If your code needs a value to persist for correctness, use state or a ref.",
        "It also does not speed up the first render, since it only skips work on later ones, and the calculation still has to run once.",
        "In Strict Mode, React calls the calculation twice in development and ignores one result, to help you spot impurities.",
      ],
    },
    {
      id: "alternatives",
      heading: "Often there is a simpler fix",
      paragraphs: [
        "Before adding useMemo, see if the structure can remove the need. These often help more than caching does, and they keep the code simpler.",
      ],
      list: [
        "Accept JSX as children, so a state change in the wrapper does not re-render the content.",
        "Keep state local rather than lifting it further than necessary.",
        "Keep rendering pure, and remove Effects that only update state.",
        "If the React Compiler is enabled, it memoizes values automatically, which reduces the need for manual calls.",
      ],
      examples: [
        {
          id: "object-in-effect",
          classification: "complete",
          title: "Moving an object into the Effect instead",
          language: "tsx",
          code: `import { useEffect } from "react";

export default function Analytics({ page }: { page: string }) {
  useEffect(() => {
    const payload = { page, sentAt: Date.now() };
    navigator.sendBeacon("/analytics", JSON.stringify(payload));
  }, [page]);

  return null;
}`,
          description: "The object is created inside the Effect, so it is not a dependency and needs no memoizing.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "memo-everything",
      heading: "Wrapping every calculation",
      problem: "useMemo on simple values seems like harmless insurance. It adds noise and a dependency list to maintain, it still creates a function each render, and for a cheap calculation the comparison can cost about as much as the work.",
      correction: "Add it where you have measured a cost, or where a stable reference is actually needed.",
    },
    {
      id: "impure-memo",
      heading: "Mutating data inside useMemo",
      problem: "Calling todos.sort() inside the calculation changes the prop itself. Strict Mode’s double call may hide or expose this inconsistently, and other components now see a reordered array.",
      correction: "Copy first, or use toSorted. Mutating objects created during the calculation is fine.",
    },
    {
      id: "semantic-guarantee",
      heading: "Relying on useMemo for correctness",
      problem: "Treating it as run-exactly-once logic, such as creating a connection, breaks when React discards the cache. The connection is then re-created at a time your code never planned for.",
      correction: "Use state or a ref when a value must persist, and an Effect for connections.",
    },
    {
      id: "memo-without-memo",
      heading: "Memoizing a prop for a child not wrapped in memo",
      problem: "A stable reference only helps if something compares it. An ordinary child re-renders with its parent regardless, so the useMemo adds code and saves nothing.",
      correction: "Wrap the child in memo if that is the goal, after measuring that its render is worth skipping.",
    },
    {
      id: "missing-dependency",
      heading: "Leaving a dependency out",
      problem: "Omitting a value used in the calculation makes the cache return a stale result when that value changes. Everything appears fine until that exact sequence happens, and the bug is hard to reproduce.",
      correction: "List every reactive value, and let the lint rule check it.",
    },
  ],
  interview: [
    {
      id: "what-memo-does",
      question: "What does useMemo do?",
      answer: "It caches a calculation’s result between renders and only recalculates when a dependency changes under Object.is. It saves work on updates, not on the first render, and it should not be relied on for correctness.",
    },
    {
      id: "when-memo-q",
      question: "When would you use useMemo?",
      answer: "When a calculation is measurably slow and its inputs rarely change, when a value is passed to a memoized child, or when it is a dependency of another Hook. Otherwise I would leave it out, because it adds complexity without a clear gain.",
    },
    {
      id: "memo-semantic",
      question: "Can you rely on useMemo to keep a value across renders?",
      answer: "No. It is only an optimization. React may drop the cache, for example when a component suspends during its initial mount or when you edit the file in development. If something must persist, state or a ref is the right tool.",
    },
    {
      id: "memo-vs-state",
      question: "What is the difference between useMemo and storing the value in state?",
      answer: "useMemo keeps a value derived, recalculated from its inputs when they change, so it cannot drift out of sync. State holds independent information you update yourself. Storing a derived value in state creates a second source of truth.",
    },
    {
      id: "memo-compiler",
      question: "How does the React Compiler change the use of useMemo?",
      answer: "When a project enables it, the compiler memoizes values and functions automatically at build time, so manual calls are needed less often. It is opt-in tooling rather than something the runtime does for you, so existing manual calls remain relevant elsewhere.",
    },
    {
      id: "double-call",
      question: "Why might your useMemo calculation run twice?",
      answer: "In development, Strict Mode calls it twice and ignores one result to expose impure code. A pure calculation is not affected, and this does not happen in production. So it should not be seen as a bug in itself.",
    },
  ],
  takeaways: [
    "useMemo caches a result until a dependency changes.",
    "Use it for measured slowness or for stable references that something compares.",
    "It is an optimization, so never rely on it for correctness.",
    "Structural fixes often remove the need for it.",
  ],
  quickReview: {
    definition: "useMemo caches a calculation’s result between renders, recalculating only when its dependencies change.",
    keyPoints: [
      "Dependencies are compared with Object.is.",
      "The calculation must be pure.",
      "It does not speed up the first render.",
      "React may discard the cache at any time.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Caching a calculation",
      language: "tsx",
      code: `const visible = useMemo(() => items.filter(isVisible), [items]);`,
      typecheckContext: { before: `import { useMemo } from "react";\ndeclare const isVisible: (item: string) => boolean;\nexport function Example({ items }: { items: readonly string[] }) {`, after: "return <p>{visible.length}</p>;\n}" },
      description: "This re-runs only when items changes. isVisible here is defined outside the component, so it is not a dependency.",
    },
    commonMistakes: [
      "Wrapping every value by default.",
      "Sorting a prop in place inside the calculation.",
      "Relying on the cache for correctness.",
    ],
    interviewTrap: "“Does useMemo guarantee the function runs once per dependency change?” No. React may discard the cache and recalculate, so the code must not depend on that.",
    takeaway: "Measure first, and treat useMemo as an optimization your code would still work without.",
  },
  sources: [
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
  ],
};
