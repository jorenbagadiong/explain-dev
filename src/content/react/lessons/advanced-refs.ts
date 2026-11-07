import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "beyond-the-basics",
      heading: "Refs for imperative resources",
      paragraphs: [
        "Refs hold values that do not affect rendering, which makes them a natural home for imperative resources: a third-party map, a media player, or an observer. The docs treat refs as an escape hatch. They are useful at the edges of an application, and if much of your data flow depends on them, it is worth rethinking the design.",
        "Unlike state, a ref’s current changes synchronously. That makes them handy in callbacks, and it also means nothing re-renders when they change.",
      ],
    },
    {
      id: "lazy-resources",
      heading: "Creating a resource once",
      paragraphs: [
        "A resource should be created once per component instance. useRef(new Player()) constructs a new one on every render and discards all but the first. Starting with null and checking it is the accepted exception to the rule against touching refs during rendering, because the result is always the same.",
      ],
      examples: [
        {
          id: "lazy-player",
          classification: "client",
          title: "Lazily creating a resource",
          language: "tsx",
          code: `"use client";

import { useRef } from "react";

class AudioQueue {
  private items: string[] = [];

  add(item: string) {
    this.items.push(item);
  }
}

export default function Playlist() {
  const queueRef = useRef<AudioQueue | null>(null);

  function getQueue() {
    if (queueRef.current === null) {
      queueRef.current = new AudioQueue();
    }
    return queueRef.current;
  }

  return (
    <button type="button" onClick={() => getQueue().add("Track 1")}>
      Add track
    </button>
  );
}`,
          description: "A small helper avoids repeated null checks, and it satisfies the type checker. This version creates the queue on first use, in an event handler.",
        },
      ],
    },
    {
      id: "callback-refs-cleanup",
      heading: "Callback refs with cleanup",
      paragraphs: [
        "A ref can be a function. React calls it with the DOM node when it attaches, and since React 19, the function can return a cleanup that runs on detach. That ties a resource directly to a node’s lifetime, which suits nodes that appear conditionally.",
        "If the function’s identity changes, React cleans up the previous one, then calls the new one. An inline arrow is new on each render, so that cycle runs every time. Define it outside the component or stabilize it with useCallback when setup is costly.",
      ],
      examples: [
        {
          id: "observed-node",
          classification: "client",
          title: "Observing a node with a stable callback ref",
          language: "tsx",
          code: `"use client";

import { useCallback, useState } from "react";

export default function LazySection({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  const observe = useCallback((node: HTMLElement) => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return <section ref={observe}>{isVisible ? children : <p>Scroll to load this section.</p>}</section>;
}`,
          description: "The observer starts when the node attaches, and it disconnects when the node is removed. useCallback keeps it from restarting on every render.",
        },
      ],
    },
    {
      id: "keeping-render-pure",
      heading: "Keeping rendering pure",
      paragraphs: [
        "React cannot see when a ref changes, so output that depends on one is unpredictable. Write refs in event handlers and Effects, and read them there too. If the screen depends on a value, it belongs in state.",
      ],
      comparison: [
        {
          id: "ok-places",
          title: "Safe places for refs",
          items: ["Event handlers.", "Effects.", "Callback refs.", "Lazy initialization, as a single exception."],
        },
        {
          id: "bad-places",
          title: "Not during rendering",
          items: ["Reading current to decide output.", "Writing current in the component body.", "Using a ref for a value that is displayed."],
        },
      ],
    },
    {
      id: "fragment-refs",
      heading: "Refs to groups of nodes",
      paragraphs: [
        "React 19.3 adds stable Fragment Refs. A ref on a Fragment gives you an instance with a limited set of methods that act on a group of sibling nodes, with no wrapper element. It offers focus, event listeners, observers, and scrollIntoView, but it is not a full DOM node.",
      ],
      examples: [
        {
          id: "fragment-ref",
          classification: "client",
          title: "A ref to several siblings",
          language: "tsx",
          code: `"use client";

import { Fragment, useRef, type FragmentInstance } from "react";

export default function HeadingGroup({ titles }: { titles: readonly string[] }) {
  const groupRef = useRef<FragmentInstance>(null);

  return (
    <>
      <button type="button" onClick={() => groupRef.current?.focus()}>
        Focus the first item
      </button>
      <Fragment ref={groupRef}>
        {titles.map(title => (
          <a key={title} href={"#" + title}>
            {title}
          </a>
        ))}
      </Fragment>
    </>
  );
}`,
          description: "Focus goes to the first focusable element inside, with no extra element around the links. Fragment Refs are available from React 19.3.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "expensive-argument",
      heading: "Constructing a resource in the useRef argument",
      problem: "useRef(new VideoPlayer()) runs the constructor on every render, keeping only the first result. For a resource with real setup costs or side effects, this repeats that work again and again, for nothing.",
      correction: "Start with null, and create it once, either lazily or in an Effect.",
    },
    {
      id: "missing-resource-cleanup",
      heading: "Forgetting to clean up a resource",
      problem: "A map or observer held in a ref keeps running after the component unmounts. React does not know about it, so listeners and memory leak, and old callbacks can fire against something that is gone.",
      correction: "Dispose of it in an Effect’s cleanup, or return a cleanup from a callback ref.",
    },
    {
      id: "inline-callback-churn",
      heading: "Using an inline callback ref for costly setup",
      problem: "An inline function is new on every render, so React cleans up and re-attaches each time. For a focus call that is harmless, while for a new observer or third-party widget it can be expensive, and it may cause flicker.",
      correction: "Keep the function stable, by declaring it outside or using useCallback.",
    },
    {
      id: "ref-as-state",
      heading: "Using a ref to avoid a re-render",
      problem: "Storing a displayed value in a ref stops the re-render, which can seem like an optimization. The screen then shows stale information until something else happens to render, which is a bug and not a performance gain.",
      correction: "Use state for what is on screen, and optimize elsewhere.",
    },
    {
      id: "stale-latest-ref",
      heading: "Updating a latest-value ref during rendering",
      problem: "Writing latestRef.current = value in the component body is a common pattern, but it is a write during rendering. In a concurrent render that gets discarded, the ref holds a value that never reached the screen.",
      correction: "Update it in an Effect, or use useEffectEvent where it fits.",
    },
  ],
  interview: [
    {
      id: "ar-resources",
      question: "How would you hold a third-party widget’s instance in a component?",
      answer: "In a ref, created once and disposed of in an Effect’s cleanup or a ref callback’s cleanup. The widget’s methods can then be called from handlers. If props change, an Effect with the right dependencies can push them to the widget.",
    },
    {
      id: "ar-callback-cleanup",
      question: "What changed with ref callbacks in React 19?",
      answer: "They can return a cleanup function, which React calls on detach. Previously, React called the callback with null. If no cleanup is returned, the null call still happens for compatibility, although the docs say that will be removed in a future version.",
    },
    {
      id: "ar-render-rule",
      question: "Why shouldn’t refs be read or written during rendering?",
      answer: "React cannot track them, so output based on a ref can be stale or inconsistent. A write may also come from a render that is later discarded. Lazy initialization is the exception, since it always produces the same result.",
    },
    {
      id: "ar-sync",
      question: "How do ref updates differ from state updates?",
      answer: "A ref’s current changes synchronously and immediately, while a state update takes effect on the next render, with each render having its own snapshot. That makes refs useful inside callbacks, and it also means they never cause a re-render.",
    },
    {
      id: "ar-callback-vs-effect",
      question: "When would you choose a ref callback over useEffect?",
      answer: "When work is tied to a specific node’s lifetime, especially a conditional one. An Effect does not re-run when a node appears unless a dependency changes. A callback runs exactly on attach and detach, so it is a closer fit for observers on such nodes.",
    },
    {
      id: "ar-fragment",
      question: "What are Fragment Refs?",
      answer: "A React 19.3 feature, documented as stable, where a ref on a Fragment gives an instance that acts on a group of sibling nodes, with methods such as focus and observeUsing. It avoids adding a wrapper element, though it is not a complete DOM node.",
    },
  ],
  takeaways: [
    "Refs suit imperative resources, created once and cleaned up.",
    "Ref callbacks can return a cleanup in React 19.",
    "Keep ref reads and writes out of rendering.",
    "Refs are an escape hatch, and heavy use signals a design problem.",
  ],
  quickReview: {
    definition: "Advanced ref patterns coordinate imperative resources and node lifetimes, while keeping rendering pure.",
    keyPoints: [
      "Create resources lazily, not in the useRef argument.",
      "Return a cleanup from ref callbacks.",
      "Stable callbacks avoid repeated attach and detach.",
      "Fragment Refs act on a group of siblings, from React 19.3.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A ref callback with cleanup",
      language: "tsx",
      code: `export default function Video({ src }: { src: string }) {
  return (
    <video
      src={src}
      ref={node => {
        return () => node?.pause();
      }}
    />
  );
}`,
      description: "The cleanup runs when the node detaches. An inline callback also re-runs on each render, so keep setup cheap.",
    },
    commonMistakes: [
      "Using useRef(new Thing()).",
      "Forgetting to dispose of resources.",
      "Storing displayed values in a ref.",
    ],
    interviewTrap: "“Is writing latestRef.current = value in the component body safe?” Not strictly. It is a write during rendering, and that render may be discarded.",
    takeaway: "Use refs at the edges, and always say how each resource gets cleaned up.",
  },
  sources: [
    { label: "Referencing Values with Refs", href: "https://react.dev/learn/referencing-values-with-refs" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
    { label: "Common components: ref callbacks", href: "https://react.dev/reference/react-dom/components/common" },
    { label: "React 19.3 release notes", href: "https://react.dev/blog/2026/09/09/react-19-3" },
  ],
};
