import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "the-big-picture",
      heading: "Putting the pieces together",
      paragraphs: [
        "Earlier lessons cover triggering, rendering, committing, and scheduling separately. This one connects them. An update goes through a pipeline, and each stage has its own rules about what your code may do, and when it may run.",
        "Knowing which stage you are in answers many practical questions: why rendering must be pure, why an Effect can read the DOM, and why a slow update feels the way that it does.",
      ],
      visual: {
        heading: "The path of a single update",
        context: "This follows a state update through React’s stages. It is a conceptual model rather than a description of internal code.",
        steps: [
          { id: "update", title: "Update", description: "A setter queues an update, with a priority such as blocking or Transition." },
          { id: "schedule", title: "Schedule", description: "React decides when to work on it, based on its priority." },
          { id: "render", title: "Render", description: "React calls components to calculate the UI. This can be paused or thrown away for Transitions." },
          { id: "commit", title: "Commit", description: "React applies DOM changes and runs layout Effects. This cannot be interrupted." },
          { id: "paint", title: "Paint", description: "The browser draws the result." },
          { id: "effects", title: "Remaining Effects", description: "React runs useEffect, usually after paint, and sometimes before it for discrete events like clicks." },
        ],
        note: "React’s internal implementation can change between versions, and only documented behavior is safe to rely on.",
      },
    },
    {
      id: "what-runs-when",
      heading: "What code runs in which stage",
      paragraphs: [
        "Your code runs at specific points in this pipeline, and that determines what is safe in each place.",
      ],
      comparison: [
        {
          id: "render-phase",
          title: "During rendering",
          items: ["Component bodies, and updater functions.", "useMemo calculations, and reducers.", "Must be pure, as they may be repeated or discarded."],
        },
        {
          id: "commit-phase",
          title: "During and after commit",
          items: ["Ref attachment, and useLayoutEffect, before paint.", "useEffect, usually after paint.", "Side effects are safe, and the DOM is up to date."],
        },
      ],
      closing: "Event handlers run outside this pipeline, in response to user input, and they often start the next update.",
    },
    {
      id: "priorities",
      heading: "Scheduling and priorities",
      paragraphs: [
        "Not every update is scheduled the same way. React’s Performance tracks show scheduling in four groups: blocking for synchronous updates, often from user interactions; Transition for non-blocking background work; Suspense for fallbacks and reveals; and idle for the lowest-priority work.",
        "Blocking updates run to completion, while Transition work can be interrupted. Since the render stage is pure and has no visible output, React can abandon it at no visible cost. That is why purity and scheduling go hand in hand.",
      ],
      examples: [
        {
          id: "stage-order",
          classification: "client",
          title: "Observing the order",
          language: "tsx",
          code: `"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export default function StageLogger() {
  const [count, setCount] = useState(0);
  console.log("render", count);

  useLayoutEffect(() => {
    console.log("layout effect, before paint", count);
  }, [count]);

  useEffect(() => {
    console.log("effect", count);
  }, [count]);

  return (
    <button type="button" onClick={() => setCount(previous => previous + 1)}>
      {count}
    </button>
  );
}`,
          description: "Each click logs render, then the layout Effect, and then the Effect. In development, Strict Mode adds extra calls, so remember that when counting logs.",
        },
      ],
    },
    {
      id: "cascading-updates",
      heading: "Cascading updates",
      paragraphs: [
        "Setting state during a layout Effect, or during rendering, schedules more work before the browser can paint. React’s development Performance tracks flag these as cascading updates, because they can discard completed work and restart rendering.",
        "They are sometimes justified, such as for measuring a tooltip. But they are a common hidden cost, and an Effect that only sets state is usually one that can be replaced by a calculation.",
      ],
    },
    {
      id: "server-in-the-picture",
      heading: "Where the server fits",
      paragraphs: [
        "In a server-rendered application, a similar pipeline runs earlier and elsewhere. Server Components render first, then their output and Client Components can produce HTML, and the browser hydrates that. After that, client updates follow the stages above.",
        "Keep in mind that these stages come from the documented behavior of React, while how a server pipeline is wired together is largely a framework’s decision.",
      ],
    },
    {
      id: "using-this-model",
      heading: "Using this model day to day",
      paragraphs: ["The model turns vague questions into specific ones."],
      list: [
        "Why did the screen not change? Check whether the update ran, then whether rendering produced different output.",
        "Why is it slow? Find which stage: scheduling, rendering, committing, or the browser’s layout and paint.",
        "Where should this code go? Decide whether it calculates, or causes something to happen.",
        "Is this safe? Check whether it would still work if React repeated or discarded that render.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effects-before-paint",
      heading: "Assuming useEffect always runs after paint",
      problem: "It usually does, but for discrete events such as clicks, React may run it before paint. Code that relies on a frame having been shown can behave differently depending on what triggered the update.",
      correction: "Use useLayoutEffect when something must happen before paint, and do not rely on exact timing otherwise.",
    },
    {
      id: "impure-render-stage",
      heading: "Doing work in the render stage that belongs later",
      problem: "A DOM write or request in a component body runs while React is only calculating. It may run several times, or for a result that never appears, and the DOM may not even contain the node yet.",
      correction: "Keep rendering as calculation, and use Effects or event handlers for the rest.",
    },
    {
      id: "cascades",
      heading: "Creating cascading updates",
      problem: "State set from a layout Effect forces another synchronous pass before paint. Done in several components, this becomes a chain of renders on every update, which can take a surprisingly long time.",
      correction: "Calculate during rendering where possible, and keep this for real measurement needs.",
    },
    {
      id: "internals-reliance",
      heading: "Relying on React’s internal order",
      problem: "Code that depends on exactly when React yields or how it batches internally may break in a later version, because those details are not guaranteed, even when they appear stable today.",
      correction: "Depend on documented behavior, such as purity and the order of Effects.",
    },
    {
      id: "framework-pipeline",
      heading: "Treating a framework’s pipeline as React’s",
      problem: "Caching, prerendering, and data-loading stages vary between frameworks. Assuming they are part of React leads to wrong expectations, particularly when moving between setups.",
      correction: "Separate what React guarantees from what your framework adds, and read both sets of docs.",
    },
  ],
  interview: [
    {
      id: "ra-phases",
      question: "What are the main phases of a React update?",
      answer: "An update is queued, then scheduled by priority. Rendering calculates the UI and can be interrupted for Transitions. The commit applies DOM changes and runs layout Effects, and it cannot be interrupted. The browser paints, and remaining Effects usually run after that.",
    },
    {
      id: "ra-pure-commit",
      question: "Why can rendering be interrupted but committing cannot?",
      answer: "Rendering is pure calculation with no visible output, so it can be repeated or dropped safely. Committing changes the DOM, so stopping partway through would leave the screen in an inconsistent state. So it runs all at once.",
    },
    {
      id: "ra-effect-order",
      question: "In what order do render, layout Effects, and Effects run?",
      answer: "Render first, then the commit with useLayoutEffect, then paint, and then useEffect, usually. For discrete events such as clicks, useEffect can run before paint. In development, Strict Mode adds extra calls, so logs alone can be misleading.",
    },
    {
      id: "ra-priority",
      question: "How does React prioritize work?",
      answer: "Updates have priorities, such as blocking for interactions, and Transition for marked updates. Higher-priority work can interrupt Transition rendering, which restarts afterward. The Performance tracks in browser tools show this as separate Scheduler subtracks.",
    },
    {
      id: "ra-cascading",
      question: "What is a cascading update?",
      answer: "An update scheduled during a render pass or layout Effect, which forces more work before paint and may discard what was done. It is occasionally needed for measuring. Often it signals an Effect that could be replaced by a calculation during rendering.",
    },
    {
      id: "ra-debug",
      question: "How does this model help with debugging?",
      answer: "It splits a vague problem into stages. Did the update run? Did rendering produce different output? Did the commit change the DOM? Was the browser slow? The Profiler and Performance panel can each answer parts of that, so it directs which tool to use.",
    },
  ],
  takeaways: [
    "Updates move through scheduling, rendering, committing, and painting.",
    "Rendering can be repeated or discarded, while committing cannot.",
    "Where code runs determines what it may safely do.",
    "Rely on documented behavior, not on internal details.",
  ],
  quickReview: {
    definition: "React’s rendering architecture moves each update through scheduling, an interruptible render, an atomic commit, and then Effects.",
    keyPoints: [
      "Render-phase code must be pure.",
      "Layout Effects run before paint.",
      "useEffect usually runs after paint.",
      "Priorities decide what React works on first.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Two Effects, two timings",
      language: "tsx",
      code: `useLayoutEffect(() => measure(), []);
useEffect(() => subscribe(), []);`,
      typecheckContext: { before: `import { useEffect, useLayoutEffect } from "react";\ndeclare const measure: () => void;\ndeclare const subscribe: () => () => void;\nexport function useExample() {`, after: "}" },
      description: "The first runs before paint, and the second usually runs after it.",
    },
    commonMistakes: [
      "Assuming useEffect always follows paint.",
      "Doing side effects in the render stage.",
      "Depending on React’s internal scheduling.",
    ],
    interviewTrap: "“Can React interrupt a commit?” No. Rendering can be interrupted, while committing runs all at once, so the screen stays consistent.",
    takeaway: "For any piece of code, ask which stage it runs in, and everything else follows.",
  },
  sources: [
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "React Performance tracks", href: "https://react.dev/reference/dev-tools/react-performance-tracks" },
    { label: "useLayoutEffect reference", href: "https://react.dev/reference/react/useLayoutEffect" },
    { label: "React 18 release notes", href: "https://react.dev/blog/2022/03/29/react-v18" },
  ],
};
