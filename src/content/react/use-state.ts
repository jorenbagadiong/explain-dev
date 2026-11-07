export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: "tsx" | "typescript";
  code: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
}

interface UseStateArticle {
  heading: string;
  overview: ArticleSection & { syntax: CodeExample };
  usage: ArticleSection & { useCases: readonly string[]; alternatives: readonly string[] };
  updates: ArticleSection & { comparison: readonly CodeExample[]; conclusion: string };
  examples: ArticleSection & { items: readonly CodeExample[] };
  mistakes: ArticleSection & { items: readonly { id: string; heading: string; problem: string; correction: string }[] };
  interview: ArticleSection & { questions: readonly InterviewQuestion[] };
  takeaways: ArticleSection & { items: readonly string[] };
  sources: readonly { label: string; href: string }[];
}

// Educational content only: topic identity, summary, availability, and route
// remain in the React topic registry. These examples are displayed, never run.
export const useStateArticle: UseStateArticle = {
  heading: "Understanding React useState",
  overview: {
    id: "what-is-use-state",
    heading: "What is useState?",
    paragraphs: [
      "useState is a React Hook that gives a component memory between renders. It returns two things: the current state value and a setter function. Calling the setter requests an update; it does not rewrite the variable in the code that is already running.",
      "Think of each render as a fresh view of the component, with its own state snapshot and event handlers. React retains the state for that component instance and supplies the next snapshot when it renders again. Separate instances have separate state. This is not browser persistence: a page reload starts the component afresh.",
    ],
    syntax: {
      id: "basic-syntax",
      title: "Declare a state value",
      language: "tsx",
      code: "const [count, setCount] = useState(0);",
      description: "After importing useState from React, array destructuring names the returned pair. count is this render’s value; setCount requests a new one. The initial value, 0, is used when this state is first created. Later renders use the retained state rather than resetting it to 0.",
    },
  },
  usage: {
    id: "when-to-use-state",
    heading: "When should you use useState?",
    paragraphs: ["Reach for state when a user interaction changes information that the interface needs to display."],
    useCases: [
      "A form input’s current text, with validation or a preview.",
      "Whether a menu or dialog is visible.",
      "A counter, a selected tab, or another local UI selection.",
    ],
    alternatives: [
      "Calculate derived values from props or existing state during rendering. Storing both a list and its length as state creates two values to keep in sync.",
      "Use a regular variable for a value that does not need to survive a render. Use a ref for a mutable value retained between renders that does not drive the UI, such as a timer ID.",
    ],
  },
  updates: {
    id: "how-updates-work",
    heading: "How state updates work",
    paragraphs: [
      "A setter queues work for a subsequent render. Reading count immediately afterward still reads the snapshot captured by the current render’s handler. React can batch updates and process them together after that handler finishes; do not depend on an immediate render after each setter call.",
      "Imagine count is 0 and the following two calls run in the same click handler. Both expressions read the same 0, so both request the replacement value 1. With no other updates, the next value is 1, not 2.",
    ],
    comparison: [
      {
        id: "replacement-updates",
        title: "Two replacements from one snapshot",
        language: "tsx",
        code: "setCount(count + 1);\nsetCount(count + 1);",
        description: "Inside the same handler, count does not change between these lines. Both calls request the same next value.",
      },
      {
        id: "functional-updates",
        title: "Two transformations of pending state",
        language: "tsx",
        code: "setCount(previous => previous + 1);\nsetCount(previous => previous + 1);",
        description: "Each updater receives the pending result of the preceding update. Starting at 0, the queue computes 1 and then 2.",
      },
    ],
    conclusion: "A direct value is useful when you already know the next value, such as new input text. An updater is useful when the next value depends on pending state. Keep updaters pure: React may invoke them twice in development Strict Mode to detect impurities, discarding one result. That check does not mean one click should increment twice. React can also skip an update when the next value equals the current value under Object.is; setter calls are not a count of committed renders.",
  },
  examples: {
    id: "practical-examples",
    heading: "Practical TypeScript examples",
    paragraphs: ["Each block is a complete TSX component. The client directive is needed when using these interactive components in the Next.js App Router. The code is shown for reading; it does not execute on this page."],
    items: [
      {
        id: "counter-component",
        title: "1. Count in either direction",
        language: "tsx",
        description: "Both buttons calculate their next value from pending state. TypeScript infers number from the initial 0.",
        code: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section aria-label="Counter">
      <p>Count: {count}</p>
      <button
        type="button"
        onClick={() => setCount(previous => previous - 1)}
      >
        Decrease
      </button>
      <button
        type="button"
        onClick={() => setCount(previous => previous + 1)}
      >
        Increase
      </button>
    </section>
  );
}`,
      },
      {
        id: "controlled-input-component",
        title: "2. Control a text input",
        language: "tsx",
        description: "The value prop comes from string state, and onChange supplies the next text. The greeting is derived during rendering. useId gives each component instance its own label/input association.",
        code: `"use client";

import { useId, useState } from "react";

export function DisplayNameInput() {
  const inputId = useId();
  const [name, setName] = useState("");

  return (
    <div>
      <label htmlFor={inputId}>Display name</label>
      <input
        id={inputId}
        type="text"
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <p>Hello, {name.trim() || "visitor"}!</p>
    </div>
  );
}`,
      },
      {
        id: "object-state-component",
        title: "3. Update a typed task object",
        language: "tsx",
        description: "The setter creates a new object, preserving title while changing completed. Mutating task.completed directly would change an existing snapshot without requesting an update. Object spread is shallow; copy each changed level for nested data. For arrays, create a new array with operations such as map or filter instead of mutating the existing one.",
        code: `"use client";

import { useState } from "react";

interface Task {
  title: string;
  completed: boolean;
}

export function TaskCard() {
  const [task, setTask] = useState<Task>({
    title: "Review a pull request",
    completed: false,
  });

  return (
    <section aria-label="Task">
      <h2>{task.title}</h2>
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => setTask(previous => ({
            ...previous,
            completed: !previous.completed,
          }))}
        />
        Completed
      </label>
      <p>Status: {task.completed ? "Done" : "To do"}</p>
    </section>
  );
}`,
      },
    ],
  },
  mistakes: {
    id: "common-mistakes",
    heading: "Common mistakes",
    paragraphs: [],
    items: [
      {
        id: "mutating-state",
        heading: "Mutating an existing object or array",
        problem: "Changing a field and passing the same object back can leave the UI unchanged because its identity has not changed. It can also alter data referenced by an older render.",
        correction: "Create the next object or array and pass it to the setter. The task example spreads the previous object before changing one field.",
      },
      {
        id: "expecting-immediate-change",
        heading: "Expecting the current variable to change immediately",
        problem: "Logging count after setCount still logs the value held by that handler. Waiting inside the same closure does not turn its captured value into a new render’s snapshot.",
        correction: "Calculate a local next value if the handler needs it, or use the value supplied by a subsequent render when rendering UI. A setter does not mutate the current variable.",
      },
      {
        id: "stale-dependent-updates",
        heading: "Calculating several dependent updates from one snapshot",
        problem: "Repeatedly requesting count + 1 in the same handler repeats one replacement value, so the intended increments do not accumulate.",
        correction: "Pass an updater for each dependent increment. React then applies each transformation to the pending value in queue order.",
      },
      {
        id: "redundant-state",
        heading: "Keeping derived information in separate state",
        problem: "Saving a full name alongside first and last names creates another value that can become inconsistent when either input changes.",
        correction: "Build the full name from the existing names during rendering. Keep only the changing source data in state.",
      },
      {
        id: "conditional-hooks",
        heading: "Calling useState conditionally",
        problem: "Putting useState after a conditional return or inside a branch changes the sequence of Hook calls. React relies on a consistent sequence to associate state with calls.",
        correction: "Call useState at the top level of a function component or custom Hook, before early returns. Put the condition in the rendered output or extract a component for the conditional branch.",
      },
    ],
  },
  interview: {
    id: "interview-questions",
    heading: "Interview questions and answers",
    paragraphs: [],
    questions: [
      {
        id: "returned-pair",
        question: "What does useState return?",
        answer: "A two-item array: this render’s state value and a setter. The initial argument determines the first value; later renders receive retained state. The setter requests a next value or accepts a pure updater.",
      },
      {
        id: "snapshot-timing",
        question: "Why doesn’t the variable change immediately after its setter?",
        answer: "The handler belongs to a particular render and reads that render’s snapshot. The setter queues an update for React to process; a subsequent render receives the new value. It does not assign to the handler’s local variable.",
      },
      {
        id: "replacement-vs-updater",
        question: "What is the difference between direct and functional updates?",
        answer: "A direct value requests a replacement already calculated by your code. An updater lets React calculate from pending state, including earlier queued updates. Use the latter for dependent updates; neither form should be treated as an instruction to synchronously change the screen.",
      },
      {
        id: "immutable-state",
        question: "Why treat React state as immutable?",
        answer: "A render should retain a reliable snapshot. Mutating shared objects can corrupt older snapshots, while keeping the same reference can prevent React from detecting a changed value. New objects and arrays preserve previous values and make updates explicit.",
      },
      {
        id: "ref-or-state",
        question: "When would you choose useRef instead of useState?",
        answer: "For a mutable value that must survive renders but should not drive rendering, such as an interval ID or a DOM reference. Changing ref.current does not request a render. Information shown in the UI generally belongs in state instead.",
      },
      {
        id: "hook-order",
        question: "Why can’t useState be called conditionally?",
        answer: "React associates Hook calls with state by their consistent order within a component. Skipping a call can shift the remaining calls. Keep useState at the top level of a component or custom Hook, before conditional returns.",
      },
      {
        id: "same-value",
        question: "Does every setter call produce another visible render?",
        answer: "No. Updates may be batched, and equal next/current values under Object.is allow React to skip rendering the component and its children. React may still call the component before discarding its result. Write pure render logic rather than relying on an exact number of calls.",
      },
    ],
  },
  takeaways: {
    id: "key-takeaways",
    heading: "Key takeaways",
    paragraphs: [],
    items: [
      "Each render reads a state snapshot; setters request future updates.",
      "Use a functional updater when the next value depends on pending state, and keep the updater pure.",
      "Replace objects and arrays immutably instead of changing an existing snapshot.",
      "Derive values you can calculate; reserve refs for retained data that does not drive rendering.",
      "Follow the Rules of Hooks: call useState at the top level of components or custom Hooks.",
    ],
  },
  sources: [
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
    { label: "State as a snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "Queueing state updates", href: "https://react.dev/learn/queueing-a-series-of-state-updates" },
    { label: "Updating objects in state", href: "https://react.dev/learn/updating-objects-in-state" },
    { label: "Rules of Hooks", href: "https://react.dev/reference/rules/rules-of-hooks" },
    { label: "Choosing the state structure", href: "https://react.dev/learn/choosing-the-state-structure" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
    { label: "Preserving and resetting state", href: "https://react.dev/learn/preserving-and-resetting-state" },
  ],
};
