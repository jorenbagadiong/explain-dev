import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useLayoutEffect does",
      paragraphs: [
        "useLayoutEffect is a version of useEffect that fires before the browser repaints. React runs it after committing to the DOM, so you can measure layout and correct it before the user sees anything.",
        "It has the same shape as useEffect, with setup, cleanup, and dependencies. The difference is timing, and that timing has a cost: its code and any state updates it schedules block the browser from painting.",
      ],
      comparison: [
        {
          id: "use-effect",
          title: "useEffect",
          items: ["Runs after paint in most cases.", "Does not block painting.", "The intermediate render may be briefly visible.", "The default choice."],
        },
        {
          id: "use-layout-effect",
          title: "useLayoutEffect",
          items: ["Runs after commit and before paint.", "Blocks painting while it works.", "The user never sees the intermediate render.", "Only when you need a measurement applied before paint."],
        },
      ],
    },
    {
      id: "tooltip-example",
      heading: "The classic case: measuring before paint",
      paragraphs: [
        "A tooltip must decide whether to appear above or below its target, but it cannot know its own height until it is in the DOM. So it renders once, measures, and renders again. With useLayoutEffect, both happen before the browser paints.",
      ],
      visual: {
        heading: "Two renders, one paint",
        context: "This follows the tooltip from its first render until it is drawn.",
        steps: [
          { id: "first-render", title: "Render with a guessed height", description: "The height is unknown, so placement may be wrong." },
          { id: "commit", title: "React commits to the DOM", description: "The node now exists, but nothing has been painted." },
          { id: "measure", title: "The layout Effect measures", description: "It reads the height and sets state, which re-renders synchronously." },
          { id: "paint", title: "The browser paints", description: "Only the final, correct position is ever shown." },
        ],
        note: "With useEffect instead, the browser could paint the wrong position first, which appears as a flicker.",
      },
      examples: [
        {
          id: "tooltip",
          classification: "client",
          title: "Positioning based on a measurement",
          language: "tsx",
          code: `"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export default function Tooltip({ targetTop, children }: { targetTop: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  const fitsAbove = targetTop - height >= 0;

  return (
    <div ref={ref} role="tooltip" style={{ position: "absolute", top: fitsAbove ? targetTop - height : targetTop + 24 }}>
      {children}
    </div>
  );
}`,
          description: "The user only ever sees the final placement. A production tooltip has more to handle, such as width and scrolling.",
        },
      ],
    },
    {
      id: "performance",
      heading: "The performance cost",
      paragraphs: [
        "Because it blocks painting, useLayoutEffect can hurt performance. Rendering in two passes with a blocking measurement adds work before anything appears, and if you set state in it, React also immediately runs all remaining Effects.",
        "Prefer useEffect, and only switch if you actually see a flicker that matters. Most Effects, such as subscriptions and data fetching, have no reason to block the screen.",
      ],
    },
    {
      id: "server-rendering",
      heading: "Server rendering",
      paragraphs: [
        "Effects do not run during server rendering, and layout does not exist on a server, so a component that depends on measurement cannot produce its final HTML there. The server HTML shows the first-pass guess until hydration runs the Effect.",
      ],
      list: [
        "Switch to useEffect, if a brief visual change is acceptable.",
        "Render the component only after mount, using state set in a useEffect, with a fallback before that.",
        "If you are synchronizing with an external store rather than measuring layout, consider useSyncExternalStore instead.",
      ],
      closing: "As with other Effects, Strict Mode runs an extra setup and cleanup cycle in development, which checks that your cleanup undoes your setup.",
    },
  ],
  mistakes: [
    {
      id: "default-layout-effect",
      heading: "Using it by default to be safe",
      problem: "useLayoutEffect can feel more reliable because it runs sooner. But every use blocks painting, so applying it widely makes the interface feel slower for no benefit.",
      correction: "Use useEffect by default, and switch only for a visible flicker caused by a measurement.",
    },
    {
      id: "expensive-work",
      heading: "Doing slow work inside it",
      problem: "Parsing data or making heavy calculations here delays the paint for as long as they take. The user sees a frozen page, and performance tools report a long blocking task.",
      correction: "Keep it to reading layout and setting the result. Move other work to useEffect or event handlers.",
    },
    {
      id: "fetching",
      heading: "Fetching data in it",
      problem: "Requests do not need to happen before paint, and the response would arrive long after anyway. Using this Hook only adds blocking work for the setup, and it gives no better result.",
      correction: "Fetch through your framework’s data tools, or useEffect with proper cleanup.",
    },
    {
      id: "ssr-mismatch",
      heading: "Assuming layout effects run on the server",
      problem: "A component that relies on a measurement renders its initial guess in server HTML, so users without hydrated JavaScript see the wrong layout. React can warn in this situation too.",
      correction: "Provide a sensible first render, or render the dependent part only after mount.",
    },
  ],
  interview: [
    {
      id: "ule-vs-ue",
      question: "What is the difference between useEffect and useLayoutEffect?",
      answer: "Both run after a commit. useLayoutEffect runs before the browser repaints and blocks it, while useEffect usually runs after paint. The first suits measurements you must apply before anything is visible, and the second suits everything else.",
    },
    {
      id: "ule-when",
      question: "When would you use useLayoutEffect?",
      answer: "When you need to read layout and synchronously change the result before the user sees it, such as positioning a tooltip from its measured size. If using useEffect does not cause a visible flicker, I would keep useEffect.",
    },
    {
      id: "ule-state",
      question: "What happens if you set state inside useLayoutEffect?",
      answer: "React re-renders synchronously, before the browser paints, so users never see the intermediate state. It also runs all remaining Effects immediately. This is the mechanism that prevents flicker, and also the reason it can be costly.",
    },
    {
      id: "ule-ssr",
      question: "How does useLayoutEffect behave with server rendering?",
      answer: "It does not run on the server. Layout information is not available there, so the HTML reflects the initial guess. Alternatives include useEffect, or rendering the dependent component after mount, with a fallback shown until then.",
    },
    {
      id: "ule-perf",
      question: "Why can useLayoutEffect hurt performance?",
      answer: "The browser cannot paint until it finishes, including any state updates it schedules. Slow code directly delays what the user sees. The two-pass render also does extra work, so it should be limited to cases where the flicker truly matters.",
    },
  ],
  takeaways: [
    "useLayoutEffect runs after commit and before paint, and it blocks painting.",
    "Use it to measure and correct layout without a visible flicker.",
    "useEffect remains the default for almost everything.",
    "It does not run on the server, so plan for the first render.",
  ],
  quickReview: {
    definition: "useLayoutEffect is an Effect that runs after commit but before the browser paints, blocking the paint until it finishes.",
    keyPoints: [
      "Same API as useEffect, with different timing.",
      "State set inside it re-renders before paint.",
      "It can hurt performance, so use it sparingly.",
      "It does not run during server rendering.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Measuring before paint",
      language: "tsx",
      code: `useLayoutEffect(() => {
  setHeight(ref.current?.getBoundingClientRect().height ?? 0);
}, []);`,
      typecheckContext: { before: `import { useLayoutEffect, useRef, useState } from "react";\nexport function Example() {\nconst ref = useRef<HTMLDivElement>(null);\nconst [height, setHeight] = useState(0);`, after: "return <div ref={ref}>{height}</div>;\n}" },
      description: "This measures the node and re-renders before anything is shown.",
    },
    commonMistakes: [
      "Using it everywhere as a safer useEffect.",
      "Doing slow work that delays paint.",
      "Fetching data inside it.",
    ],
    interviewTrap: "“Is useLayoutEffect faster because it runs sooner?” No. It runs earlier by blocking paint, which usually makes things slower.",
    takeaway: "Use it only when the user would otherwise see a flicker you cannot accept.",
  },
  sources: [
    { label: "useLayoutEffect reference", href: "https://react.dev/reference/react/useLayoutEffect" },
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
  ],
};
