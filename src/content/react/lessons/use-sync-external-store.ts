import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useSyncExternalStore does",
      paragraphs: [
        "useSyncExternalStore subscribes a component to a store that lives outside React, such as a third-party state library or a browser API with mutable values and change events. It returns the store’s current snapshot: const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).",
        "When possible, use useState and useReducer instead. This Hook is mostly useful for integrating with existing non-React code.",
      ],
      examples: [
        {
          id: "online-status",
          classification: "complete",
          title: "Subscribing to a browser API",
          language: "tsx",
          code: `import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export default function ConnectionStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return <p>{isOnline ? "Online" : "Disconnected"}</p>;
}`,
          description: "subscribe is defined outside the component, so React does not re-subscribe on each render. The server snapshot assumes online for the HTML.",
        },
      ],
    },
    {
      id: "the-contract",
      heading: "The contract for each function",
      paragraphs: ["Each argument has a specific job, and bugs usually come from breaking one of these rules."],
      list: [
        "subscribe receives a callback, subscribes it to the store, and returns a cleanup function. The store calls the callback whenever it changes.",
        "getSnapshot returns the current data. While the store has not changed, repeated calls must return the same value, because React compares results with Object.is.",
        "getServerSnapshot provides the initial snapshot. It runs only during server rendering and client hydration, and it must return the same data in both places. Omitting it makes server rendering throw an error.",
      ],
    },
    {
      id: "snapshots-must-be-stable",
      heading: "Snapshots must be stable and immutable",
      paragraphs: [
        "Returning a new object from getSnapshot means React sees a change on every call, which leads to an infinite loop and an error saying the result of getSnapshot should be cached.",
        "The snapshot must also be immutable. If the store’s data is mutable, build a new immutable snapshot only when the data changes, and return the cached one otherwise.",
      ],
      examples: [
        {
          id: "simple-store",
          classification: "complete",
          title: "A small external store",
          language: "tsx",
          code: `import { useSyncExternalStore } from "react";

let tasks: readonly string[] = [];
let listeners: readonly (() => void)[] = [];

export const taskStore = {
  add(task: string) {
    tasks = [...tasks, task];
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(item => item !== listener);
    };
  },
  getSnapshot() {
    return tasks;
  },
};

export default function TaskCount() {
  const current = useSyncExternalStore(taskStore.subscribe, taskStore.getSnapshot, taskStore.getSnapshot);

  return (
    <button type="button" onClick={() => taskStore.add("Task")}>
      {current.length} tasks
    </button>
  );
}`,
          description: "add replaces the array, so getSnapshot returns one stable reference until the data actually changes. Module-level stores like this one are shared across requests on a server, so a real server-rendered app needs more care.",
        },
      ],
    },
    {
      id: "subscribe-identity",
      heading: "Keep subscribe stable",
      paragraphs: [
        "React re-subscribes whenever a render passes a different subscribe function. An inline function is new each render, which means unsubscribing and subscribing every time. Define it outside the component, or memoize it with useCallback if it depends on props.",
      ],
      examples: [
        {
          id: "custom-hook",
          classification: "complete",
          title: "A custom Hook around the store",
          language: "tsx",
          code: `import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}`,
          description: "Components usually call this Hook through a custom Hook like this one. subscribe changes only when query does. The snapshot functions return booleans, which compare equal by value, so inline versions are safe here.",
        },
      ],
    },
    {
      id: "transitions-and-suspense",
      heading: "Limits with Transitions and Suspense",
      paragraphs: [
        "Store updates cannot be non-blocking. If the store changes during a non-blocking Transition, React restarts the update as blocking, so that every component shows the same version of the store. This prevents tearing, where parts of the screen show different values.",
        "Do not suspend based on store values, such as passing a promise that depends on one to use, or conditionally rendering a lazy component from one. Because store mutations cannot be marked as Transitions, this activates the nearest Suspense fallback, which typically replaces visible content with a spinner.",
      ],
    },
  ],
  mistakes: [
    {
      id: "new-snapshot",
      heading: "Returning a new object from getSnapshot",
      problem: "return { todos: store.todos } looks harmless, but it creates a new reference on every call. React sees a change each time, producing an infinite loop and an error about caching the result.",
      correction: "Return existing immutable data, or cache the snapshot until the store changes.",
    },
    {
      id: "inline-subscribe",
      heading: "Defining subscribe inline",
      problem: "An inline subscribe is a new function on each render, so React resubscribes every time. It works, but it causes needless churn, and it may be expensive for a real store or a network connection.",
      correction: "Define it outside the component, or use useCallback when it depends on props.",
    },
    {
      id: "no-server-snapshot",
      heading: "Omitting getServerSnapshot in server-rendered code",
      problem: "Without it, server rendering throws an error, and it can force client-only rendering up to a Suspense boundary. Reading browser APIs there is impossible, so the component has no initial value.",
      correction: "Provide a server snapshot that matches what the client uses during hydration.",
    },
    {
      id: "instead-of-state",
      heading: "Using it for state React could own",
      problem: "A hand-written store for local UI state looks clean, but it gives up Transitions for those updates and adds subscription code that useState does not need.",
      correction: "Use useState or useReducer unless the state truly lives outside React.",
    },
    {
      id: "mismatched-server-value",
      heading: "Returning different data at hydration",
      problem: "A server snapshot that reads something different on the client produces a hydration mismatch. This appears when the function reads live browser data rather than what the server used.",
      correction: "Serialize the server’s data for the client, or use a fixed value during hydration.",
    },
  ],
  interview: [
    {
      id: "uses-what",
      question: "What is useSyncExternalStore for?",
      answer: "It subscribes a component to data outside React, such as a browser API or a third-party store, and it keeps the rendered output consistent with that data. State that React can own should use useState or useReducer instead.",
    },
    {
      id: "uses-why-not-effect",
      question: "Why not subscribe with useEffect and useState?",
      answer: "That can work, but with concurrent rendering, different parts of the tree could read different values from a mutable store during one render, which is called tearing. This Hook guarantees a consistent snapshot, and it handles server snapshots too.",
    },
    {
      id: "uses-snapshot-rule",
      question: "What is the rule for getSnapshot?",
      answer: "While the store is unchanged, repeated calls must return the same value, compared with Object.is, and the value must be immutable. Returning a new object each time causes an infinite loop and an error about caching.",
    },
    {
      id: "uses-server",
      question: "What does getServerSnapshot do?",
      answer: "It provides the snapshot during server rendering and hydration, and it must return the same data in both. Without it, server rendering throws. A common approach is to send the server’s data to the client through the page and read it back.",
    },
    {
      id: "uses-transition",
      question: "How does it behave during a Transition?",
      answer: "Store updates cannot be non-blocking. If the store changes during a Transition, React restarts the update as blocking, so every component shows the same store version. So suspending on store values can bring up fallbacks, which harms the experience.",
    },
    {
      id: "uses-resubscribe",
      question: "When does React re-subscribe?",
      answer: "Whenever a render passes a different subscribe function. An inline definition does this every time, so it should be defined outside the component or memoized with useCallback if it depends on props.",
    },
  ],
  takeaways: [
    "Use this Hook for data that lives outside React.",
    "Snapshots must be stable and immutable until the store changes.",
    "Keep subscribe stable, and provide a server snapshot for server rendering.",
    "Prefer useState and useReducer when React can own the state.",
  ],
  quickReview: {
    definition: "useSyncExternalStore subscribes a component to an external store and returns a consistent snapshot of its data.",
    keyPoints: [
      "Arguments are subscribe, getSnapshot, and getServerSnapshot.",
      "getSnapshot is compared with Object.is.",
      "Store updates cannot be non-blocking Transitions.",
      "Usually wrapped in a custom Hook.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Subscribing",
      language: "tsx",
      code: `const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);`,
      typecheckContext: { before: `import { useSyncExternalStore } from "react";\ndeclare const store: { subscribe: (callback: () => void) => () => void; getSnapshot: () => number };\nexport function useExample() {`, after: "return value;\n}" },
      description: "React reads the snapshot when rendering and re-renders when it changes.",
    },
    commonMistakes: [
      "Returning a new object from getSnapshot.",
      "Writing subscribe inline in the component.",
      "Leaving out getServerSnapshot with server rendering.",
    ],
    interviewTrap: "“Can store updates be marked as Transitions?” No. A store change forces a blocking update to keep all components consistent.",
    takeaway: "Reach for it only at the boundary with non-React data, and keep its snapshots stable.",
  },
  sources: [
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
