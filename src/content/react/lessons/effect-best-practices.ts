import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "effects-are-for",
      heading: "First, check you need an Effect",
      paragraphs: [
        "Effects keep a component synchronized with something outside React: a network connection, a browser API, or a third-party widget. Many Effects written in real code do not do this, and removing them makes the code simpler and faster, and reduces bugs.",
      ],
      comparison: [
        {
          id: "no-effect",
          title: "No Effect needed",
          items: ["Calculating a value from props or state: do it during rendering.", "Responding to a click: use the event handler.", "Resetting state when a prop changes: use a key."],
        },
        {
          id: "needs-effect",
          title: "An Effect fits",
          items: ["Subscribing to a browser event or a store.", "Connecting to a server or a chat room.", "Controlling a non-React widget."],
        },
      ],
    },
    {
      id: "cleanup",
      heading: "Match every setup with a cleanup",
      paragraphs: [
        "If an Effect starts something, its cleanup should stop or undo it. React runs cleanup before re-running the Effect with new values, and after the component is removed. In development, Strict Mode also runs one extra setup and cleanup cycle on mount, to expose cleanup that is missing.",
        "A correct Effect behaves the same whether it runs once or goes through setup, cleanup, and setup again. To a user, that sequence should be indistinguishable from one setup.",
      ],
      examples: [
        {
          id: "subscription",
          classification: "client",
          title: "A subscription with matching cleanup",
          language: "tsx",
          code: `"use client";

import { useEffect, useState } from "react";

export function WindowWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <p>{width === null ? "Resize the window to measure it." : "Width: " + width}</p>;
}`,
          description: "The same function is added and removed, so no listener is left behind. window is only read in the browser, after an event, so the server and client markup match.",
        },
      ],
    },
    {
      id: "dependencies",
      heading: "Be truthful about dependencies",
      paragraphs: [
        "The dependency array is not a list you choose. It must include every reactive value that the Effect’s code reads: props, state, and anything computed from them. When the linter asks for a dependency you do not want, the fix is to change the code so that the Effect no longer needs it, rather than suppressing the warning.",
      ],
      list: [
        "Move a function or object inside the Effect, if only the Effect uses it.",
        "Move something outside the component, if it uses no reactive values.",
        "Use an updater, such as setCount(c => c + 1), so the Effect does not read count.",
        "Move logic triggered by an interaction into an event handler.",
        "Use useEffectEvent for non-reactive logic that needs the latest values.",
      ],
      examples: [
        {
          id: "moved-inside",
          classification: "client",
          title: "Moving an object into the Effect",
          language: "tsx",
          code: `"use client";

import { useEffect, useState } from "react";

declare function connect(options: { roomId: string; serverUrl: string }): { close(): void };

export function ChatStatus({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const options = { roomId, serverUrl: "https://chat.example.com" };
    const connection = connect(options);

    return () => connection.close();
  }, [roomId]);

  return <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Hide" : "Show"} members</button>;
}`,
          description: "An options object created during rendering would be new each time, so the connection would restart on every render. Created inside the Effect, it is only rebuilt when roomId changes. connect stands in for your own connection code.",
        },
      ],
    },
    {
      id: "races",
      heading: "Avoiding race conditions when fetching",
      paragraphs: [
        "If a prop changes quickly, two requests can be in flight, and the older one may finish last. Without protection, stale data overwrites the correct result. A flag set in cleanup ignores anything that belongs to an outdated Effect. Frameworks and data libraries handle this and other concerns such as caching, so prefer them where you can.",
      ],
      examples: [
        {
          id: "ignore-flag",
          classification: "client",
          title: "Ignoring an outdated response",
          language: "tsx",
          code: `"use client";

import { useEffect, useState } from "react";

export function UserName({ id }: { id: string }) {
  const [loaded, setLoaded] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      const response = await fetch("/api/users/" + id);
      const user: { name: string } = await response.json();
      if (isCurrent) setLoaded({ id, name: user.name });
    }

    void load();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  return <p>{loaded?.id === id ? loaded.name : "Loading…"}</p>;
}`,
          description: "Each run has its own isCurrent. When id changes, cleanup marks the old run as outdated, so its late response changes nothing, and comparing IDs shows Loading until the right result arrives. Real code would also handle a failed request.",
        },
      ],
    },
    {
      id: "strict-mode",
      heading: "What Strict Mode is telling you",
      paragraphs: [
        "If something misbehaves because of the extra development cycle, such as a duplicate connection, the usual problem is missing cleanup. Do not try to prevent it with a ref guard that stops the second run, because that hides the same bug that appears later when a component remounts. These checks only run in development, and they do not affect production.",
      ],
    },
  ],
  mistakes: [
    {
      id: "derived-effect",
      heading: "Using an Effect for derived values",
      problem: "Calculating a filtered list in an Effect and storing it in state renders once with stale data, then again with the right result. It adds extra rendering, and state that can fall out of step.",
      correction: "Calculate it during rendering, with useMemo if it proves to be expensive.",
    },
    {
      id: "event-effect",
      heading: "Putting event logic in an Effect",
      problem: "Sending a request from an Effect that watches a “submitted” flag separates cause from effect. It can run again on a remount, because the Effect knows only about the state, and has no idea that a click occurred.",
      correction: "Do the work in the event handler that caused it.",
    },
    {
      id: "suppressed-deps",
      heading: "Suppressing the dependency warning",
      problem: "Leaving out a dependency means that the Effect keeps reading the value from an old render. These stale closures are hard to find, because the code looks right, while behavior is wrong in only some situations.",
      correction: "Change the code so that the Effect does not need that dependency.",
    },
    {
      id: "no-cleanup",
      heading: "Forgetting cleanup",
      problem: "A listener, timer, or connection that is never removed stays active after the component has gone, and more accumulate as it remounts. Leaks and duplicate work build up gradually and can be hard to trace.",
      correction: "Return a cleanup function that undoes the setup.",
    },
    {
      id: "object-deps",
      heading: "Using objects created during rendering as dependencies",
      problem: "An object or function created in the component is new on every render, so an Effect depending on it re-runs every time. A connection may then reconnect on every keystroke, for no visible reason.",
      correction: "Create it inside the Effect, or depend on the primitive values it uses.",
    },
    {
      id: "ref-guard",
      heading: "Using a ref to stop the second Effect run",
      problem: "A hasRun ref silences the extra development cycle, but the Effect still has no proper cleanup. The underlying bug comes back whenever a component really does remount, such as after navigating away and back.",
      correction: "Add a cleanup that makes setup, cleanup, setup behave correctly.",
    },
  ],
  interview: [
    {
      id: "eb-when",
      question: "When should you use an Effect?",
      answer: "To synchronize with something outside React, such as a subscription, a connection, or a non-React widget. Not for calculating values, which belongs in rendering, or for responding to clicks, which belongs in handlers. Many bugs come from Effects that were not needed.",
    },
    {
      id: "eb-cleanup",
      question: "When does Effect cleanup run?",
      answer: "Before the Effect re-runs with changed dependencies, and when the component is removed. In development, Strict Mode adds one extra setup and cleanup cycle on mount. So cleanup should fully undo setup, leaving things ready for another run.",
    },
    {
      id: "eb-deps",
      question: "How should you deal with a dependency you do not want?",
      answer: "Change the code so that the Effect no longer reads it, rather than suppressing the linter. Options include moving it inside the Effect, using an updater function, moving logic to an event handler, or using useEffectEvent for non-reactive logic.",
    },
    {
      id: "eb-double",
      question: "Why does my Effect run twice in development?",
      answer: "Strict Mode deliberately runs an extra setup and cleanup cycle, to reveal missing cleanup. It only happens in development. The right response is to make that sequence harmless, rather than using a ref to block the second run, since real remounts would still cause problems.",
    },
    {
      id: "eb-race",
      question: "How do you avoid race conditions when fetching in an Effect?",
      answer: "Use a flag local to each run that cleanup sets, and ignore responses when it says the run is outdated. An AbortController can also cancel the request. In production apps, I would prefer framework data fetching or a library, as they handle caching and more.",
    },
    {
      id: "eb-object",
      question: "Why does an object dependency cause an Effect to re-run?",
      answer: "Dependencies are compared with Object.is, and an object created during rendering is a new one every time. So the Effect sees a change on each render. Creating it inside the Effect, or depending on primitive values, resolves this without suppressing anything.",
    },
  ],
  takeaways: [
    "Effects synchronize with outside systems, so check that you need one.",
    "Every setup needs a matching cleanup.",
    "Dependencies describe what the code reads, so change the code, not the list.",
    "Handle races, and prefer framework data fetching where available.",
  ],
  quickReview: {
    definition: "Good Effects synchronize with external systems, list every reactive value they read, and clean up what they started.",
    keyPoints: [
      "Derived values belong in rendering.",
      "Interaction logic belongs in event handlers.",
      "Cleanup runs before a re-run, and on removal.",
      "A local flag handles fetch races.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "client",
      title: "Setup and cleanup",
      language: "tsx",
      code: `"use client";

import { useEffect } from "react";

export function Clock({ onTick }: { onTick: () => void }) {
  useEffect(() => {
    const timer = setInterval(onTick, 1000);

    return () => clearInterval(timer);
  }, [onTick]);

  return null;
}`,
      description: "The cleanup clears exactly what the setup started, and onTick is listed since the Effect reads it.",
    },
    commonMistakes: [
      "Using an Effect for derived values.",
      "Suppressing the dependency warning.",
      "Blocking the second run with a ref.",
    ],
    interviewTrap: "“How do I stop my Effect running twice in development?” Do not. Add the cleanup, because the extra run reveals a bug that also matters in production.",
    takeaway: "An Effect should stay correct no matter how many times it is set up and cleaned up.",
  },
  sources: [
    { label: "Synchronizing with Effects", href: "https://react.dev/learn/synchronizing-with-effects" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "Removing Effect Dependencies", href: "https://react.dev/learn/removing-effect-dependencies" },
    { label: "Lifecycle of Reactive Effects", href: "https://react.dev/learn/lifecycle-of-reactive-effects" },
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
    { label: "StrictMode reference", href: "https://react.dev/reference/react/StrictMode" },
  ],
};
