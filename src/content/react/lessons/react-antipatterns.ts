import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-makes-one",
      heading: "What makes something an anti-pattern",
      paragraphs: [
        "An anti-pattern is a habit that seems reasonable, and even works at first, but causes problems later. In React, most of them come from working against its model, where UI is calculated from props and state, rendering is pure, and data flows down.",
        "Recognizing the pattern is more valuable than memorizing a list. Each one below can be traced back to one question: is this working with how React thinks about data, or around it?",
      ],
    },
    {
      id: "mutation",
      heading: "Mutating state and props",
      paragraphs: [
        "React decides whether state has changed by comparing it with Object.is, and an object changed in place is still the same object. So a mutation may not trigger an update, and it can also corrupt the values captured by earlier renders. Props belong to the parent, so they should never be changed either.",
      ],
      examples: [
        {
          id: "mutation-fix",
          classification: "client",
          title: "Creating a new array instead of changing it",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

export function Tags() {
  const [tags, setTags] = useState(["react"]);

  function addTag() {
    // Avoid: tags.push("hooks"); setTags(tags);
    setTags([...tags, "hooks"]);
  }

  return (
    <button onClick={addTag}>
      {tags.length} tags: {tags.join(", ")}
    </button>
  );
}`,
          description: "The new array has a different identity, so React sees a change. Earlier renders keep their own untouched array.",
        },
      ],
    },
    {
      id: "redundant-state",
      heading: "Redundant and duplicated state",
      paragraphs: [
        "If a value can be calculated from what you already have, it should not be state. Storing it means two sources of truth, and an update can then change one and forget the other. Keep the smallest state that can represent the situation, and calculate the rest during rendering.",
        "Copying a prop into state has a similar problem. useState only uses its initial value on the first render, so later prop changes are ignored. Name such a prop initialSomething if that is really what you intend.",
      ],
      examples: [
        {
          id: "derived",
          classification: "client",
          title: "Calculating instead of storing",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

const lessons = ["Hooks", "Keys", "Refs"];

export function LessonSearch() {
  const [query, setQuery] = useState("");
  const matches = lessons.filter(lesson => lesson.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <input aria-label="Search lessons" value={query} onChange={event => setQuery(event.target.value)} />
      <p>{matches.length} matches</p>
    </div>
  );
}`,
          description: "matches cannot fall out of step with query, because it is not stored. There is no matches state and no Effect to keep it updated.",
        },
      ],
    },
    {
      id: "effect-misuse",
      heading: "Effects that chain and synchronize state",
      paragraphs: [
        "An Effect that watches state and then sets other state is usually a sign of derived data or event logic in the wrong place. It causes an extra render with stale values, and chains of them become difficult to follow. Calculate during rendering, handle events in event handlers, and keep Effects for external systems.",
      ],
    },
    {
      id: "nested-components",
      heading: "Defining components inside components",
      paragraphs: [
        "A component function created inside another one is a new function on each render. React treats a different type at the same position as a different component, so it removes the old one and creates a new one, with all its state reset. Typing in an input inside it can lose focus after each keystroke.",
      ],
      examples: [
        {
          id: "top-level-component",
          classification: "client",
          title: "Keeping components at the top level",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

function NameInput({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  return <input aria-label="Name" value={name} onChange={event => onChange(event.target.value)} />;
}

export function Profile() {
  const [name, setName] = useState("");

  return <NameInput name={name} onChange={setName} />;
}`,
          description: "NameInput is defined once, so it has the same identity on every render, and it keeps its DOM node and focus.",
        },
      ],
    },
    {
      id: "more-patterns",
      heading: "More patterns to watch for",
      paragraphs: ["These are also common, and they each have a straightforward alternative."],
      list: [
        "Array index as a key in a list that can reorder: use a stable ID from the data.",
        "Writing a ref’s current value during rendering: refs are for handlers and Effects.",
        "Side effects while rendering, such as fetching: rendering must be pure.",
        "A component doing many unrelated jobs: split it by responsibility.",
        "Passing props through many levels only to reach one child: use composition or context.",
        "One large context for everything: every consumer re-renders on any change, so split it.",
        "Suppressing lint rules: they usually indicate a real problem.",
      ],
      closing: "Some of these are acceptable in context. An index key is fine for a static list that never reorders, for example. The problem is using them without considering why they can go wrong.",
    },
  ],
  mistakes: [
    {
      id: "memo-everywhere",
      heading: "Memoizing everything by default",
      problem: "Wrapping every value in useMemo or useCallback adds code, and it often has no benefit. If the child is not memoized, a stable function changes nothing. It also hides the real data flow from anyone reading the code.",
      correction: "Measure first, or use React Compiler, and optimize where it has an effect.",
    },
    {
      id: "fetch-in-render",
      heading: "Starting work during rendering",
      problem: "Rendering can happen more than once, and a render may be discarded. A request or subscription started there can run repeatedly, or never be cleaned up, and it breaks the rule that rendering must be pure.",
      correction: "Use event handlers, Effects, or framework data fetching.",
    },
    {
      id: "state-as-instance",
      heading: "Using state for values that do not affect rendering",
      problem: "A timer ID or a previous value kept in state causes a re-render every time it changes, with no visible result. It wastes work, and it can cause loops when an Effect depends on that value.",
      correction: "Use a ref for values that do not affect the output.",
    },
    {
      id: "contradictory-flags",
      heading: "Using several booleans for one status",
      problem: "isLoading, isError, and isSuccess allow combinations that should be impossible, such as loading and error together. Each update has to set them all correctly, and one mistake leaves the UI contradicting itself.",
      correction: "Use a single status value, or a discriminated union.",
    },
    {
      id: "overusing-context",
      heading: "Reaching for context to avoid passing props",
      problem: "Context makes data flow harder to see, and it ties components to a provider. Passing a prop through two levels is often clearer, and much of the drilling can be solved by composing children instead.",
      correction: "Start with props or composition, and use context for widely needed values.",
    },
  ],
  interview: [
    {
      id: "ap-common",
      question: "What are some common React anti-patterns?",
      answer: "Mutating state, storing derived values in state, chaining Effects to sync state, defining components inside components, unstable keys, and side effects during rendering. Most of them work against the model where UI is calculated from props and state.",
    },
    {
      id: "ap-derived",
      question: "Why is storing derived values in state a problem?",
      answer: "It creates two sources of truth that must be kept in step, and any update can forget one. Synchronizing with an Effect adds a render with stale data. Calculating during rendering is simpler and always correct, and useMemo can cache it if it is truly expensive.",
    },
    {
      id: "ap-nested",
      question: "What happens if you define a component inside another?",
      answer: "It is a new function on each render, so React sees a different type at that position. It removes the old instance and creates a new one, resetting state and DOM, which can lose input focus. Define components at the top level and pass what they need as props.",
    },
    {
      id: "ap-prop-state",
      question: "What is wrong with copying props into state?",
      answer: "useState only uses its initial value on the first render, so the state stops following the prop. Usually you should read the prop directly. If you do want an initial value, name it initialValue to be clear, and use a key to reset it when necessary.",
    },
    {
      id: "ap-index-key",
      question: "When is an array index an acceptable key?",
      answer: "When the list is static, never reorders or filters, and its items have no state of their own. Otherwise, the index moves with the position rather than the item, so state and DOM can end up on the wrong item. A stable ID from the data is the safer default.",
    },
    {
      id: "ap-ref-render",
      question: "Why shouldn’t you read or write a ref during rendering?",
      answer: "React does not track refs, so changing one does not trigger a render, and reading one makes output depend on something React does not know about. That breaks the purity of rendering. Use refs in handlers and Effects, and use state for what affects output.",
    },
  ],
  takeaways: [
    "Most anti-patterns work against how React models data.",
    "Do not mutate, and do not store what you can calculate.",
    "Define components at the top level.",
    "Effects are for outside systems, not for syncing state.",
  ],
  quickReview: {
    definition: "React anti-patterns are habits that seem to work at first, but which conflict with React’s model, such as mutation and redundant state.",
    keyPoints: [
      "Mutated state keeps the same identity.",
      "Calculate derived values during rendering.",
      "Nested component definitions reset state.",
      "Use a stable ID as a key.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A derived value",
      language: "tsx",
      code: `export function Total({ prices }: { prices: number[] }) {
  const total = prices.reduce((sum, price) => sum + price, 0);

  return <p>Total: {total}</p>;
}`,
      description: "total is calculated on each render, so it can never disagree with prices.",
    },
    commonMistakes: [
      "Using state and an Effect for a derived value.",
      "Defining a component inside a component.",
      "Mutating state, then setting the same reference.",
    ],
    interviewTrap: "“Is an index key always wrong?” No. It is fine for a static list with no reordering, although a stable ID is the safer default.",
    takeaway: "When code feels like it is fighting React, it probably is.",
  },
  sources: [
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "Choosing the State Structure", href: "https://react.dev/learn/choosing-the-state-structure" },
    { label: "Updating Arrays in State", href: "https://react.dev/learn/updating-arrays-in-state" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
  ],
};
