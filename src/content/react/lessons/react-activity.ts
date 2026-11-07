import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-activity-does",
      heading: "What Activity does",
      paragraphs: [
        "Activity hides and restores a part of the UI while keeping its state. Its mode prop can be visible or hidden, defaulting to visible. It is a component from react, added in React 19.2.",
        "Conceptually, hidden children are unmounted but their state is kept. Compare this with a condition, which destroys state, and with CSS alone, which leaves Effects running. Activity sits between them.",
      ],
      examples: [
        {
          id: "sidebar",
          classification: "client",
          title: "Keeping a sidebar’s state when hidden",
          language: "tsx",
          code: `"use client";

import { Activity, useState } from "react";

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav aria-label="Lessons">
      <button type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
        Overview
      </button>
      {isExpanded && <p>Three lessons</p>}
    </nav>
  );
}

export default function Layout() {
  const [isShowing, setIsShowing] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setIsShowing(!isShowing)}>
        Toggle sidebar
      </button>
      <Activity mode={isShowing ? "visible" : "hidden"}>
        <Sidebar />
      </Activity>
    </>
  );
}`,
          description: "An expanded section stays expanded after toggling the sidebar closed and open. With {isShowing && <Sidebar />}, it would reset.",
        },
      ],
    },
    {
      id: "what-happens-when-hidden",
      heading: "What happens when hidden",
      paragraphs: [
        "Hiding does several specific things, and it is worth knowing each one, because they affect how your components should be written.",
      ],
      list: [
        "State is saved, and restored when the boundary becomes visible again.",
        "The DOM is preserved, and hidden with display: none, so a textarea’s draft survives.",
        "Effects are destroyed, which cleans up subscriptions, and they are re-created when visible again.",
        "Children still re-render when their props change, but at a lower priority than visible content.",
      ],
      comparison: [
        {
          id: "conditional",
          title: "A condition",
          items: ["Destroys state and DOM.", "Stops Effects.", "Costs nothing while hidden."],
        },
        {
          id: "activity-mode",
          title: "Activity, hidden",
          items: ["Keeps state and DOM.", "Stops Effects.", "Updates at low priority, and holds memory."],
        },
      ],
    },
    {
      id: "pre-rendering",
      heading: "Pre-rendering what comes next",
      paragraphs: [
        "A boundary that starts hidden still renders its children, at low priority, without mounting their Effects. So a likely next view can load its code and data before it appears, making the switch feel instant.",
        "This only covers data read from a source that activates Suspense, such as a Promise read with use. Activity cannot detect data fetched inside an Effect, because Effects do not run while hidden.",
      ],
      examples: [
        {
          id: "prerender-tabs",
          classification: "client",
          title: "Pre-rendering a tab",
          language: "tsx",
          code: `"use client";

import { Activity, useState, type ReactNode } from "react";

export default function Tabs({ home, posts }: { home: ReactNode; posts: ReactNode }) {
  const [tab, setTab] = useState<"home" | "posts">("home");

  return (
    <>
      <button type="button" onClick={() => setTab("home")}>
        Home
      </button>
      <button type="button" onClick={() => setTab("posts")}>
        Posts
      </button>
      <Activity mode={tab === "home" ? "visible" : "hidden"}>{home}</Activity>
      <Activity mode={tab === "posts" ? "visible" : "hidden"}>{posts}</Activity>
    </>
  );
}`,
          description: "The hidden tab renders in the background, so it can be ready when someone opens it, and each tab keeps its state when it is switched away from.",
        },
      ],
    },
    {
      id: "hydration",
      heading: "Activity and server rendering",
      paragraphs: [
        "Activity boundaries divide a tree into independent units for hydration, so React can hydrate the rest of the page first. In a tabs page, the tab buttons can become interactive before each tab’s content. Suspense could do this too, but it would show a fallback on the initial render, which an always-visible Activity avoids.",
      ],
    },
    {
      id: "caveats",
      heading: "Caveats",
      paragraphs: [
        "Because hidden DOM is not destroyed, side effects that come from the DOM itself continue. A video or audio element keeps playing, and an iframe keeps running, unless you stop them. A cleanup in useLayoutEffect ties that to the moment the UI is hidden.",
        "Also, a hidden component that only returns a string renders nothing, as there is no element to hide. And any Effect that needed to clean something up should do so in its returned cleanup function, which Strict Mode helps to reveal.",
      ],
      examples: [
        {
          id: "pause-video",
          classification: "client",
          title: "Pausing media when hidden",
          language: "tsx",
          code: `"use client";

import { useLayoutEffect, useRef } from "react";

export default function VideoTab({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const video = videoRef.current;

    return () => {
      video?.pause();
    };
  }, []);

  return <video ref={videoRef} src={src} controls />;
}`,
          description: "The cleanup runs when the boundary is hidden. useLayoutEffect keeps that tied to the UI being hidden, rather than delayed by Suspense or View Transitions.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "older-versions",
      heading: "Using Activity on an older React",
      problem: "Activity was added in React 19.2, so on older versions the export does not exist, and the import fails. Older experimental builds also exposed it under a different name, which appears in some examples.",
      correction: "Check your version, and import Activity from react on 19.2 or newer.",
    },
    {
      id: "effect-keeps-running",
      heading: "Expecting Effects to run while hidden",
      problem: "Effects are destroyed when a boundary is hidden. So a subscription that was expected to keep updating in the background stops, and data could be out of date when the boundary is shown again.",
      correction: "Lift what must keep running above the boundary, and refresh data on becoming visible.",
    },
    {
      id: "media-keeps-playing",
      heading: "Forgetting that hidden media keeps playing",
      problem: "A hidden tab’s video keeps playing audio, because the DOM is kept and only hidden with CSS. People hear sound from something they cannot see, and they have no obvious way of stopping it.",
      correction: "Pause it in a useLayoutEffect cleanup.",
    },
    {
      id: "effect-fetch-prerender",
      heading: "Expecting pre-rendering to run Effect-based fetching",
      problem: "A hidden boundary renders without mounting Effects, so a fetch in useEffect does not run until it becomes visible. The pre-rendering appears to do nothing for that data.",
      correction: "Read data through a source that activates Suspense, such as use with a cached Promise.",
    },
    {
      id: "everything-activity",
      heading: "Keeping everything alive in Activity",
      problem: "Wrapping every route so that it can be restored instantly keeps all of that DOM and state in memory, along with low-priority updates. That cost builds up, especially on smaller devices.",
      correction: "Use it for views people are likely to return to, and let others unmount.",
    },
  ],
  interview: [
    {
      id: "ac-what",
      question: "What does Activity do?",
      answer: "It hides and restores UI while preserving state. A hidden boundary keeps its state and DOM, hides content with display none, destroys Effects, and updates at low priority. It is a component from react, added in React 19.2.",
    },
    {
      id: "ac-vs-conditional",
      question: "How does Activity differ from conditional rendering?",
      answer: "A condition removes the component, destroying its state and DOM. Activity keeps both and stops only Effects, so returning to it is instant and keeps its state. The cost is holding that memory, plus low-priority updates while it is hidden.",
    },
    {
      id: "ac-vs-css",
      question: "How does it differ from hiding with CSS?",
      answer: "CSS alone leaves Effects running, along with subscriptions and timers, and updates run at normal priority. Activity also uses display none, but it destroys Effects while hidden, and it deprioritizes updates, so hidden content costs less.",
    },
    {
      id: "ac-prerender",
      question: "What is pre-rendering with Activity?",
      answer: "A boundary starting as hidden renders its children at low priority, without mounting Effects. Code and data can then load in advance, so showing it feels immediate. It only works for data read from a source that activates Suspense.",
    },
    {
      id: "ac-media",
      question: "What should you watch out for with media in a hidden Activity?",
      answer: "The DOM is preserved, so a video keeps playing. Pause it in a useLayoutEffect cleanup, which runs when the boundary hides. The same applies to iframes. The docs recommend the layout version, so it is tied to the visual hiding.",
    },
    {
      id: "ac-hydration",
      question: "How does Activity help hydration?",
      answer: "Boundaries divide the tree into separately hydratable units, so the rest of the page can become interactive first. Unlike Suspense, an always-visible Activity shows no fallback on the initial render, so it can improve hydration without changing what appears.",
    },
  ],
  takeaways: [
    "Activity hides UI, keeping its state and DOM while destroying Effects.",
    "Hidden boundaries render at low priority, and can pre-render future views.",
    "DOM side effects such as media need manual cleanup.",
    "It needs React 19.2 or newer, and it uses memory while hidden.",
  ],
  quickReview: {
    definition: "Activity hides part of the UI while preserving its state and DOM, destroying its Effects until it becomes visible again.",
    keyPoints: [
      "Its mode is visible or hidden.",
      "Hidden content uses display: none.",
      "Updates continue at low priority.",
      "Available from react since 19.2.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Hiding with Activity",
      language: "tsx",
      code: `<Activity mode={isOpen ? "visible" : "hidden"}>
  <Panel />
</Activity>`,
      typecheckContext: { before: `import { Activity, type ReactNode } from "react";\ndeclare const isOpen: boolean;\ndeclare function Panel(): ReactNode;\nexport const element = (`, after: ");" },
      description: "Panel keeps its state while closed, and its Effects stop.",
    },
    commonMistakes: [
      "Expecting Effects to keep running while hidden.",
      "Letting hidden media keep playing.",
      "Wrapping everything, and holding on to too much memory.",
    ],
    interviewTrap: "“Do Effects keep running inside a hidden Activity?” No. They are destroyed when hidden, and re-created when visible again.",
    takeaway: "Use Activity when returning to a view should feel as if you never left.",
  },
  sources: [
    { label: "Activity reference", href: "https://react.dev/reference/react/Activity" },
    { label: "React 19.2 release notes", href: "https://react.dev/blog/2025/10/01/react-19-2" },
  ],
};
