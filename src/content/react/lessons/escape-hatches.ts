import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-they-are",
      heading: "What escape hatches are",
      paragraphs: [
        "Escape hatches let you step outside React’s normal data flow, to work with things it does not manage, such as browser APIs, third-party widgets, or remote servers. Refs, Effects, direct DOM access, and portals are all examples.",
        "The docs’ main guidance is that most of your application logic and data flow should not rely on them. They belong at the edges of an application, where React meets outside systems. Reach for one when React has no built-in way to do the job.",
      ],
    },
    {
      id: "decision-guide",
      heading: "Choosing the right one",
      paragraphs: [
        "Start by asking what you actually need. Very often, what seemed to need an escape hatch can be expressed through state and rendering.",
      ],
      list: [
        "A value calculated from other values: calculate during rendering, with no escape hatch at all.",
        "Something caused by a user action: use an event handler, again with no escape hatch.",
        "A value to remember that does not affect output: use a ref.",
        "Focus, scrolling, or measuring: use a ref to the node.",
        "Staying in sync with an outside system: use an Effect, with cleanup.",
        "Content that must escape its container’s clipping: use a portal.",
        "A subscription to a mutable outside value: use useSyncExternalStore.",
      ],
    },
    {
      id: "containing-effects",
      heading: "Containing what they do",
      paragraphs: [
        "When you do use one, keep it small and well contained, ideally in a custom Hook with a clear name. The rest of the application then reads declaratively, and if a better tool arrives later, there is one place to change.",
      ],
      examples: [
        {
          id: "hook-wrapper",
          classification: "complete",
          title: "Wrapping an Effect in a named Hook",
          language: "tsx",
          code: `import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    return () => {
      document.title = previous;
    };
  }, [title]);
}

export default function InboxPage({ unread }: { unread: number }) {
  useDocumentTitle(unread > 0 ? "Inbox (" + unread + ")" : "Inbox");

  return <h1>Inbox</h1>;
}`,
          description: "The component says what it wants, and the Effect’s details are in one place. React 19 can also render a title element directly, which may remove the need for this Hook altogether.",
        },
      ],
    },
    {
      id: "safe-dom-changes",
      heading: "Touching the DOM safely",
      paragraphs: [
        "Direct DOM access splits into two kinds. Non-destructive actions such as focusing and scrolling are fine. Changing nodes that React manages is not, because it can lead to inconsistent results or crashes.",
        "If a third-party library must control DOM content, give it a node whose contents React never renders, such as an empty div. React then has no reason to touch that node’s children, so the two do not collide.",
      ],
      examples: [
        {
          id: "third-party-node",
          classification: "client",
          title: "Giving a widget a node React leaves alone",
          language: "tsx",
          code: `"use client";

import { useEffect, useRef } from "react";

interface ChartWidget {
  setData(data: readonly number[]): void;
  destroy(): void;
}

declare function createChartWidget(container: HTMLElement): ChartWidget;

export default function Chart({ data }: { data: readonly number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ChartWidget | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const widget = createChartWidget(containerRef.current);
    widgetRef.current = widget;

    return () => {
      widget.destroy();
      widgetRef.current = null;
    };
  }, []);

  useEffect(() => {
    widgetRef.current?.setData(data);
  }, [data]);

  return <div ref={containerRef} />;
}`,
          description: "The declare block stands in for a real library. React renders an empty div and never touches its contents. Creating the widget and updating its data are separate Effects, because they synchronize different things.",
        },
      ],
    },
    {
      id: "warning-signs",
      heading: "Signs you are overusing them",
      paragraphs: ["A few patterns suggest that an escape hatch is doing a job React could do itself."],
      list: [
        "An Effect that only calls a state setter.",
        "A chain of Effects, each triggering the next.",
        "A ref holding a value that appears on screen.",
        "querySelector being used to find your own components’ output.",
        "A suppressed dependency lint rule.",
      ],
      closing: "As an application grows, you should find yourself writing fewer Effects by hand, because you can reuse custom Hooks you have already written.",
    },
  ],
  mistakes: [
    {
      id: "effect-for-everything",
      heading: "Reaching for an Effect by default",
      problem: "Many developers learn useEffect early, and then apply it to everything that changes. Using it to derive state or respond to clicks adds extra renders, and it makes the code’s cause and effect harder to see.",
      correction: "Calculate during rendering, handle events in handlers, and keep Effects for outside systems.",
    },
    {
      id: "dom-for-state",
      heading: "Using the DOM to change what React renders",
      problem: "Adding a class with classList or removing a node directly appears to work, until React re-renders and overwrites it, or fails because a node it expects has gone.",
      correction: "Describe the change through state and JSX.",
    },
    {
      id: "suppressing-lint",
      heading: "Suppressing the dependency lint rule",
      problem: "An eslint-disable comment silences a warning by telling React something untrue about what the Effect reads. The Effect then uses stale values, a bug that only appears later, far from that comment.",
      correction: "Change the code so that the dependency is no longer needed, and treat the lint error like a compile error.",
    },
    {
      id: "unwrapped-effects",
      heading: "Scattering low-level Effects through components",
      problem: "Subscriptions and timers repeated in many components are easy to get subtly wrong, and each must be fixed separately. The components also become harder to read, because the mechanics hide their purpose.",
      correction: "Wrap them in small, purpose-named custom Hooks.",
    },
    {
      id: "portal-overuse",
      heading: "Using a portal for a layout problem",
      problem: "A portal adds separate concerns for events, focus, and styling. Using one because of a single z-index issue adds real complexity, when a change in CSS or structure might be all it needs.",
      correction: "Fix the layout first, and use a portal when content really has to escape its container.",
    },
  ],
  interview: [
    {
      id: "eh-what",
      question: "What are escape hatches in React?",
      answer: "Tools for stepping outside React’s normal data flow to work with things it does not manage: refs, Effects, direct DOM access, and portals. They belong at the edges of an application. Most logic and data flow should not rely on them.",
    },
    {
      id: "eh-need-effect",
      question: "How do you decide whether you need an Effect?",
      answer: "If no outside system is involved, you probably do not. Derived values are calculated during rendering, and things caused by a user action go in handlers. An Effect fits when code must run because the component is displayed, to stay in sync with something external.",
    },
    {
      id: "eh-dom",
      question: "When is direct DOM manipulation acceptable?",
      answer: "For non-destructive actions such as focusing, scrolling, and measuring. Also for nodes whose contents React never renders, which is how third-party widgets can be integrated. Changing nodes React manages risks being overwritten, or a crash.",
    },
    {
      id: "eh-contain",
      question: "Why wrap escape hatches in custom Hooks?",
      answer: "The component’s intent becomes clear, the mechanics live in one place, and bugs are fixed once. It also leaves room to change the implementation later, such as moving a manual subscription to useSyncExternalStore, without touching any callers.",
    },
    {
      id: "eh-lint",
      question: "Is it ever acceptable to suppress the exhaustive-deps lint rule?",
      answer: "The docs advise treating it like a compile error. Suppressing it hides a mismatch between what the code reads and what it declares. The fix is changing the code: move logic into a handler, split the Effect, use an updater, or use an Effect Event.",
    },
    {
      id: "eh-signs",
      question: "What suggests that a codebase is overusing Effects?",
      answer: "Effects that only call setters, chains of Effects triggering each other, and suppressed lint rules. Each usually points to logic that could be calculated during rendering or put into an event handler. Removing them makes code faster and easier to follow.",
    },
  ],
  takeaways: [
    "Escape hatches are for the edges, where React meets outside systems.",
    "Many apparent needs disappear with calculation and event handlers.",
    "Keep them small, and contain them in custom Hooks.",
    "Do not change nodes React manages.",
  ],
  quickReview: {
    definition: "Escape hatches let code step outside React’s data flow to work with outside systems, and they should be used sparingly.",
    keyPoints: [
      "Refs, Effects, direct DOM access, and portals are the main ones.",
      "No outside system usually means no Effect.",
      "Give third-party widgets a node React leaves empty.",
      "Never suppress the dependency lint rule.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "An Effect with a clear purpose",
      language: "tsx",
      code: `useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]);`,
      typecheckContext: { before: `import { useEffect } from "react";\ndeclare function createConnection(roomId: string): { connect(): void; disconnect(): void };\nexport function useRoom(roomId: string) {`, after: "}" },
      description: "This synchronizes with a real outside system, and it says how to stop.",
    },
    commonMistakes: [
      "Using Effects to derive state.",
      "Changing React-managed DOM directly.",
      "Suppressing the exhaustive-deps rule.",
    ],
    interviewTrap: "“Should a click that sends a request go in an Effect?” No. The user caused it, so it belongs in the event handler.",
    takeaway: "If React can do it, let React do it, and keep the exits small and clearly labeled.",
  },
  sources: [
    { label: "Escape Hatches", href: "https://react.dev/learn/escape-hatches" },
    { label: "Manipulating the DOM with Refs", href: "https://react.dev/learn/manipulating-the-dom-with-refs" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "Removing Effect Dependencies", href: "https://react.dev/learn/removing-effect-dependencies" },
  ],
};
