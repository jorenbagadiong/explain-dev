import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "a-method",
      heading: "Debug by narrowing things down",
      paragraphs: [
        "Random changes rarely fix a bug, and they can hide it. A steady method works better: reproduce the problem reliably, find where the actual value first differs from what you expected, understand why, then fix that cause and check that the symptom has gone.",
        "React’s data flow helps. Since UI is calculated from props and state, a wrong screen has a limited number of explanations. Either the data reaching the component is wrong, or the component renders correct data wrongly, or something outside React changed the DOM.",
      ],
      list: [
        "Read the whole error message and its component stack before changing anything.",
        "Reproduce it with the fewest possible steps.",
        "Follow the data upward, from the wrong output to where the value comes from.",
        "Change one thing at a time, and write a test for the bug once you understand it.",
      ],
    },
    {
      id: "devtools",
      heading: "React Developer Tools",
      paragraphs: [
        "React Developer Tools is a browser extension. Its Components tab shows the component tree, along with the props and state of each component, and you can edit values to see how the UI responds. That quickly answers a basic question: did the right data reach this component?",
        "Its Profiler tab records an interaction, then shows which components rendered and how long they took. Use it when something is slow, or when you suspect extra rendering, instead of guessing. Chrome’s Performance panel also shows React’s own tracks, which place React work in context with the rest of the browser’s work.",
      ],
      comparison: [
        {
          id: "components-tab",
          title: "Components tab",
          items: ["Why does this show the wrong thing?", "Inspect props, state, and Hooks.", "Find which parent supplied a value."],
        },
        {
          id: "profiler-tab",
          title: "Profiler tab",
          items: ["Why is this slow?", "Records rendering during an interaction.", "Measure, so that you fix the right component."],
        },
      ],
    },
    {
      id: "state-snapshots",
      heading: "Logging, and the snapshot surprise",
      paragraphs: [
        "A targeted console.log is still useful, especially to see when something renders and with what values. One frequent surprise is logging straight after calling a state setter. It prints the old value, because state is a snapshot for this render, and the new value arrives in the next one.",
      ],
      examples: [
        {
          id: "log-snapshot",
          classification: "client",
          title: "Where to log an updated value",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  // Runs for each render, with that render's value.
  console.log("rendering with", count);

  function handleClick() {
    const next = count + 1;
    setCount(next);
    // count is still the old value here, so log next.
    console.log("changing to", next);
  }

  return <button onClick={handleClick}>{count}</button>;
}`,
          description: "This is not a bug in React. A log in the render body shows the new value once the next render happens.",
        },
      ],
    },
    {
      id: "strict-mode-clues",
      heading: "Strict Mode as a diagnostic",
      paragraphs: [
        "In development, Strict Mode calls components twice and runs an extra Effect setup and cleanup cycle on mount, along with an extra cycle for callback refs. If a bug only appears under Strict Mode, it is usually revealing impure rendering or missing cleanup, so treat that as the bug. None of these checks run in production.",
      ],
    },
    {
      id: "common-symptoms",
      heading: "Common symptoms and what they usually mean",
      paragraphs: ["Many React bugs fall into familiar patterns, so it is worth recognizing them."],
      list: [
        "The UI does not update after a change: state was probably mutated, so React saw the same object.",
        "An Effect uses an old value: a dependency is missing, so it is a stale closure.",
        "State appears on the wrong list item: keys are unstable or based on position.",
        "State resets unexpectedly: a component changed position or type, or it is defined inside another component.",
        "A hydration mismatch: server and client produced different output, often from time, random values, or browser-only checks.",
        "Too many re-renders: state is being set during rendering, with no condition stopping it.",
      ],
      examples: [
        {
          id: "stale-mutation",
          classification: "complete",
          title: "Why mutating state looks like no update",
          language: "typescript",
          code: `const items = ["Tea"];

const mutated = items;
mutated.push("Milk");
console.log(Object.is(items, mutated)); // true: React sees no change

const copied = [...items, "Sugar"];
console.log(Object.is(items, copied)); // false: React sees a new value`,
          description: "React compares state with Object.is. A mutated array is still the same array, so setting it again does not cause a re-render.",
        },
      ],
    },
    {
      id: "isolating",
      heading: "Isolating a problem",
      paragraphs: [
        "When the cause is not clear, reduce the problem. Remove features until the bug goes away, since the last thing removed is a strong clue. Using git bisect on recent commits can find exactly which change introduced it. Building a small reproduction takes time, but it often reveals the cause, and it makes it easy to ask others for help.",
      ],
    },
  ],
  mistakes: [
    {
      id: "skip-message",
      heading: "Not reading the error message",
      problem: "React’s development errors usually name the component and describe the problem, and many include a link. Skipping straight to code changes throws that information away, and it leads to fixing the wrong thing.",
      correction: "Read the full message and the component stack first.",
    },
    {
      id: "random-changes",
      heading: "Changing things until it works",
      problem: "A random change that seems to fix a bug may only hide it, and you have no idea why it worked. The bug can return in another form, and now the code contains a change nobody understands.",
      correction: "Find the cause first, and be able to explain why the fix works.",
    },
    {
      id: "log-after-set",
      heading: "Logging state straight after setting it",
      problem: "A log straight after the setter prints the old value, which suggests that the update failed. This sends people looking for a bug that does not exist, because state only changes for the next render.",
      correction: "Log in the render body, or log the new value you computed.",
    },
    {
      id: "disable-strict",
      heading: "Removing Strict Mode to make a bug go away",
      problem: "Removing it hides a bug that it was revealing, such as missing cleanup or impure rendering. The same problem can still happen in production, where it is much harder to reproduce.",
      correction: "Keep Strict Mode, and fix what it reveals.",
    },
    {
      id: "optimize-by-guess",
      heading: "Guessing at performance problems",
      problem: "Adding memo everywhere because something feels slow adds code without showing that any of it helped. The real cost may lie elsewhere, such as one expensive calculation or a large list.",
      correction: "Record the interaction with the Profiler, then fix what it shows.",
    },
  ],
  interview: [
    {
      id: "rd-approach",
      question: "How do you approach debugging a React issue?",
      answer: "Reproduce it, read the full error, then follow the data: check whether props and state are right in DevTools, and trace wrong values upward. I change one thing at a time, and fix the cause rather than the symptom. Then I add a test, so that it stays fixed.",
    },
    {
      id: "rd-devtools",
      question: "What do React Developer Tools give you?",
      answer: "The Components tab shows the tree with each component’s props and state, and lets you edit values. The Profiler records an interaction and shows which components rendered and how long they took. So they answer what the data is, and where the time went.",
    },
    {
      id: "rd-not-updating",
      question: "Why might the UI not update after a state change?",
      answer: "The usual cause is mutation: changing an object or array in place, then setting that same reference. React compares with Object.is, so it sees no change. The fix is to create a new object or array. Reading the old value in the same render is a different and related confusion.",
    },
    {
      id: "rd-stale",
      question: "How do you recognize a stale closure?",
      answer: "An Effect or callback keeps using an old value, typically because a dependency was left out, or a function from an earlier render is still in use. The linter flags most of these. The fix is correct dependencies, or an updater function for state updates.",
    },
    {
      id: "rd-hydration",
      question: "How would you debug a hydration mismatch?",
      answer: "Read React’s message, which shows what differed. Then look for anything that differs between server and client: time, random values, locale formatting, or checks for window during rendering. Move that value into an Effect or make it deterministic, and also check for invalid HTML nesting.",
    },
    {
      id: "rd-slow",
      question: "How do you investigate a slow interaction?",
      answer: "Record it in the Profiler, on a production-like build when possible, since development builds are slower. See which components render and how long they take, and then target the actual cost. Afterward, measure again, to confirm that the change helped.",
    },
  ],
  takeaways: [
    "Reproduce the bug, read the error, and follow the data.",
    "DevTools shows the data, and the Profiler shows the time.",
    "Treat what Strict Mode reveals as real bugs.",
    "Understand why a fix works before moving on.",
  ],
  quickReview: {
    definition: "Debugging React means tracing data flow and rendering behavior, using targeted diagnostics and DevTools to find the actual cause.",
    keyPoints: [
      "Wrong UI means wrong data, or wrong rendering of it.",
      "State does not change until the next render.",
      "A mutated value looks unchanged to React.",
      "Measure before optimizing.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Logging during rendering",
      language: "tsx",
      code: `export function Price({ amount }: { amount: number }) {
  console.log("Price rendered with", amount);

  return <p>{amount}</p>;
}`,
      description: "This shows when the component renders, and with what data. Remove it once you are done.",
    },
    commonMistakes: [
      "Skipping the error message.",
      "Changing things until the symptom disappears.",
      "Removing Strict Mode to hide a bug.",
    ],
    interviewTrap: "“I logged state right after setting it, and it was old. Is React broken?” No. State is a snapshot, and the new value arrives on the next render.",
    takeaway: "Find where reality first differs from what you expected, and the bug is nearby.",
  },
  sources: [
    { label: "React Developer Tools", href: "https://react.dev/learn/react-developer-tools" },
    { label: "React Performance tracks", href: "https://react.dev/reference/dev-tools/react-performance-tracks" },
    { label: "StrictMode reference", href: "https://react.dev/reference/react/StrictMode" },
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "Updating Objects in State", href: "https://react.dev/learn/updating-objects-in-state" },
    { label: "hydrateRoot reference", href: "https://react.dev/reference/react-dom/client/hydrateRoot" },
  ],
};
