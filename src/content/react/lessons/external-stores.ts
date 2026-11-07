import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "when-state-lives-outside",
      heading: "When state lives outside React",
      paragraphs: [
        "Most state belongs in useState or useReducer. Sometimes the data lives elsewhere: a third-party state library, a browser API with mutable values and change events, or non-React code in an existing application. React then has to subscribe to that source and read from it safely.",
        "The React docs recommend built-in state whenever possible. External stores are for integrating with existing non-React code, or for cases built-in state handles poorly.",
      ],
      comparison: [
        {
          id: "react-state",
          title: "React state",
          items: ["React owns it.", "Works with Transitions.", "Local to a component, or shared through props and context."],
        },
        {
          id: "external",
          title: "An external store",
          items: ["Something else owns it.", "Updates are always blocking.", "Components can subscribe from anywhere."],
        },
      ],
    },
    {
      id: "tearing",
      heading: "The problem: tearing",
      paragraphs: [
        "React can pause a concurrent render partway through. If a mutable store changes during that pause, components rendered before and after could read different values, and the screen would show two versions of the same thing. This is called tearing.",
        "An Effect that subscribes and copies values into state also has a gap: the value could change between rendering and the Effect running. useSyncExternalStore is designed to handle both problems.",
      ],
      visual: {
        heading: "How a torn render happens",
        context: "This shows what could go wrong when a mutable value is read directly during rendering.",
        steps: [
          { id: "read-first", title: "Component A reads the store", description: "It sees value 1, and React pauses to handle something else." },
          { id: "changes", title: "The store changes", description: "The value becomes 2 during the pause." },
          { id: "read-second", title: "Component B reads the store", description: "It sees value 2." },
          { id: "commit", title: "The result is inconsistent", description: "A shows 1 and B shows 2 on one screen." },
        ],
        note: "useSyncExternalStore prevents this. It checks the snapshot again before applying changes, and restarts as a blocking update if the value differs.",
      },
    },
    {
      id: "building-a-store",
      heading: "Connecting a store",
      paragraphs: [
        "useSyncExternalStore takes a subscribe function and a getSnapshot function, plus getServerSnapshot if the component is server-rendered. Keep subscribe stable, and make sure getSnapshot returns the same value until the store really changes.",
      ],
      examples: [
        {
          id: "create-store",
          classification: "complete",
          title: "A small store with selectors",
          language: "tsx",
          code: `import { useSyncExternalStore } from "react";

export function createStore<State>(initial: State) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState(next: State) {
      state = next;
      listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const cartStore = createStore({ count: 0, coupon: "" });

function useCartCount() {
  return useSyncExternalStore(cartStore.subscribe, () => cartStore.getState().count, () => 0);
}

export default function CartBadge() {
  const count = useCartCount();

  return <span>{count} items</span>;
}`,
          description: "The selector returns a primitive, so this badge only re-renders when count changes, and a coupon change does not affect it. That is something plain context cannot do.",
        },
      ],
    },
    {
      id: "server-rendering-stores",
      heading: "Stores and server rendering",
      paragraphs: [
        "A module-level store is shared by everything in that JavaScript process. In a browser, that is one user. On a server, it may be every user’s requests at once, so one person’s data could leak into another’s page. Create server-side stores per request, or keep user data out of module scope.",
        "getServerSnapshot has to return the same data on the server and during hydration. A common approach is sending the server’s store data within the page, and reading it back on the client.",
      ],
    },
    {
      id: "choosing",
      heading: "Do you need one?",
      paragraphs: [
        "Libraries such as Redux and Zustand use this Hook internally, and offer selectors, middleware, and devtools. Before adding one, check what you truly need. Much of what ends up in global stores is server data, which a data-fetching library or framework cache handles better, and other values can stay local.",
      ],
      list: [
        "Local UI state: useState, kept as low as possible.",
        "Shared, infrequently changing values: context.",
        "Server data: your framework or a data-fetching library.",
        "Frequently changing shared client state, with many readers of different parts: an external store.",
      ],
    },
  ],
  mistakes: [
    {
      id: "read-directly",
      heading: "Reading a mutable store directly during rendering",
      problem: "store.getState() in a component body gives a value, but React is not subscribed, so nothing updates when it changes. In a concurrent render, this can also show inconsistent values across the tree.",
      correction: "Read through useSyncExternalStore, so that React subscribes and checks consistency.",
    },
    {
      id: "unstable-selector",
      heading: "Returning a new object from a selector",
      problem: "A snapshot such as { count, coupon } is a new object every time. React sees a change on every check, which causes an infinite loop, along with an error saying the snapshot should be cached.",
      correction: "Return primitives or existing immutable objects, or memoize the selection.",
    },
    {
      id: "server-shared-store",
      heading: "Sharing a module-level store between server requests",
      problem: "On a server, one module instance serves many requests. A user’s data written to a module-level store can then appear in another user’s response, which is a serious privacy bug that is easy to miss in development.",
      correction: "Create stores per request on the server, and pass initial data to the client.",
    },
    {
      id: "store-for-everything",
      heading: "Putting all state in a global store",
      problem: "Moving local state to a global store makes it available everywhere, and it also makes everything depend on it. A dropdown’s open flag needs no global home, and these stores do not take part in Transitions.",
      correction: "Keep state local until multiple distant components really need it.",
    },
    {
      id: "suspend-on-store",
      heading: "Suspending based on store values",
      problem: "Store updates cannot be marked as Transitions. So a store value that causes a component to suspend activates the nearest fallback, replacing visible content with a spinner, however the update started.",
      correction: "Keep values that drive suspending in React state, so that a Transition can be used.",
    },
  ],
  interview: [
    {
      id: "es-why",
      question: "Why does React need a special Hook for external stores?",
      answer: "With concurrent rendering, a mutable store could change during a paused render, so components would read different values, which is called tearing. useSyncExternalStore subscribes correctly and rechecks snapshots, restarting as a blocking update if the value changed.",
    },
    {
      id: "es-vs-context",
      question: "When would you choose an external store over context?",
      answer: "When state changes often and many components read different parts of it. Context re-renders every reader on any change, while a store with selectors updates only those whose selected value changed. For infrequent values, context is simpler and needs no library.",
    },
    {
      id: "es-tearing-q",
      question: "What is tearing?",
      answer: "An inconsistent UI where different components show different versions of the same data, because a mutable value changed during a render. It can only happen when rendering can be interrupted. React’s own state is protected from this, and useSyncExternalStore protects external ones.",
    },
    {
      id: "es-ssr",
      question: "What should you watch for with stores and server rendering?",
      answer: "A module-level store on a server is shared across requests, so user data can leak between people. Create stores per request instead. Also provide getServerSnapshot, returning the same data on the server and during hydration, to avoid a mismatch.",
    },
    {
      id: "es-limits",
      question: "What are the limits of external stores with concurrent features?",
      answer: "Store updates cannot be non-blocking. If a store changes during a Transition, React falls back to a blocking update. Suspending on store values activates fallbacks, even when you would prefer that a Transition kept content visible. That is one reason to keep state in React.",
    },
    {
      id: "es-need",
      question: "How would you decide whether an application needs a state library?",
      answer: "I would look at what the state is. Server data suits a data library, and local UI state suits useState. Shared values that rarely change suit context. Only frequently changing client state, with many readers of different parts, tends to need a store.",
    },
  ],
  takeaways: [
    "Prefer React state, and use external stores for data that lives outside.",
    "useSyncExternalStore prevents tearing under concurrent rendering.",
    "Selectors should return stable values, ideally primitives.",
    "Module-level stores are shared across requests on a server.",
  ],
  quickReview: {
    definition: "An external store holds state outside React, and components connect to it through subscriptions and consistent snapshots.",
    keyPoints: [
      "Tearing is what useSyncExternalStore prevents.",
      "getSnapshot must be stable until the store changes.",
      "Store updates are always blocking.",
      "Create stores per request on a server.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Subscribing with a selector",
      language: "tsx",
      code: `const count = useSyncExternalStore(store.subscribe, () => store.getState().count);`,
      typecheckContext: { before: `import { useSyncExternalStore } from "react";\ndeclare const store: { subscribe: (listener: () => void) => () => void; getState: () => { count: number } };\nexport function useExample() {`, after: "return count;\n}" },
      description: "A primitive snapshot means this only re-renders when count changes.",
    },
    commonMistakes: [
      "Reading a store directly while rendering.",
      "Returning a new object from a selector.",
      "Sharing a store between server requests.",
    ],
    interviewTrap: "“Can you mark store updates as Transitions?” No. A store change is always a blocking update, which keeps every component consistent.",
    takeaway: "Reach outside React only for state that really lives outside it.",
  },
  sources: [
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
    { label: "React 18 release notes", href: "https://react.dev/blog/2022/03/29/react-v18" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
