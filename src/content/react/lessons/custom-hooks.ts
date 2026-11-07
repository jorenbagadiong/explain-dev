import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-custom-hooks-are",
      heading: "What a custom Hook is",
      paragraphs: [
        "A custom Hook is a JavaScript function you write that calls other Hooks. It lets several components reuse the same stateful logic, such as tracking network status, without repeating it. Custom Hooks are developer-created, so they are separate from React’s built-in APIs.",
        "Think of the code inside as part of the calling component’s body. It re-runs on every render, it always receives the latest props and state, and it must stay pure.",
      ],
      examples: [
        {
          id: "use-online-status",
          classification: "complete",
          title: "Extracting repeated logic",
          language: "tsx",
          code: `import { useEffect, useState } from "react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function update() {
      setIsOnline(navigator.onLine);
    }

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return isOnline;
}

export default function SaveButton() {
  const isOnline = useOnlineStatus();

  return (
    <button type="button" disabled={!isOnline}>
      {isOnline ? "Save" : "Reconnecting…"}
    </button>
  );
}`,
          description: "The component says what it wants, not how it is done. Later, this Hook could switch to useSyncExternalStore, and no component would have to change.",
        },
      ],
    },
    {
      id: "naming-rules",
      heading: "The naming rule",
      paragraphs: [
        "A custom Hook’s name must start with use, followed by a capital letter. This lets people and the linter see at a glance that a function may contain state or Effects, and the linter enforces the Rules of Hooks on it.",
        "If a function does not call any Hooks, drop the prefix. useSorted(items) should be getSorted(items), which also means it can be called conditionally.",
      ],
    },
    {
      id: "logic-not-state",
      heading: "Hooks share logic, not state",
      paragraphs: [
        "This is the most important thing to understand. Each call to a custom Hook creates its own independent state and Effects. Two components calling useOnlineStatus get two separate variables, which only agree because they watch the same external source.",
        "To share state itself, lift it up and pass it down, or use context.",
      ],
      examples: [
        {
          id: "independent-state",
          classification: "complete",
          title: "Two calls, two independent states",
          language: "tsx",
          code: `import { useState, type ChangeEvent } from "react";

function useFormInput(initial: string) {
  const [value, setValue] = useState(initial);

  return {
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
  };
}

export default function NameForm() {
  const firstName = useFormInput("Ana");
  const lastName = useFormInput("Reyes");

  return (
    <form>
      <label>
        First name
        <input {...firstName} />
      </label>
      <label>
        Last name
        <input {...lastName} />
      </label>
    </form>
  );
}`,
          description: "The Hook is called twice, so there are two pieces of state with no connection between them.",
        },
      ],
    },
    {
      id: "effects-and-callbacks",
      heading: "Wrapping Effects and accepting callbacks",
      paragraphs: [
        "Effects are the best reason to write a custom Hook. They step outside React, so a well-named Hook makes the intent clear and hides the mechanics. Reactive values passed in keep it up to date, because the Effect re-synchronizes when they change.",
        "If a Hook takes a callback that should not restart the Effect, wrap it in an Effect Event, so it reads the latest version without being a dependency.",
      ],
      examples: [
        {
          id: "hook-with-callback",
          classification: "complete",
          title: "A Hook that takes a reactive value and a callback",
          language: "tsx",
          code: `import { useEffect, useEffectEvent } from "react";

export function useInterval(delayMs: number, onTick: () => void) {
  const handleTick = useEffectEvent(onTick);

  useEffect(() => {
    const id = window.setInterval(() => handleTick(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}`,
          description: "A new delay restarts the timer. A new onTick function does not, yet the latest one is what gets called.",
        },
      ],
    },
    {
      id: "when-to-extract",
      heading: "When to extract, and when not to",
      paragraphs: [
        "You do not need a Hook for every bit of duplication, and wrapping a single useState is rarely worthwhile. Consider one when you write an Effect, or when logic with a clear name appears in several components.",
        "Avoid lifecycle-style Hooks such as useMount or useEffectOnce. They do not fit React’s model, and they hide dependencies from the linter. useMount can silently ignore a changed roomId, and nothing warns you. Prefer high-level, purpose-named Hooks such as useChatRoom.",
      ],
      comparison: [
        {
          id: "good-hooks",
          title: "Purpose-named",
          items: ["useOnlineStatus", "useChatRoom(roomId)", "useMediaQuery(query)"],
        },
        {
          id: "bad-hooks",
          title: "Lifecycle-named",
          items: ["useMount(fn)", "useEffectOnce(fn)", "useUpdateEffect(fn)"],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "expecting-shared-state",
      heading: "Expecting a Hook to share state",
      problem: "Calling useCart in two components and expecting them to stay in step is a common error, because the Hook’s state looks global. Each call has its own copy, so one component’s change does not reach the other.",
      correction: "Lift the state to a common parent, or provide it through context, and read it with a Hook.",
    },
    {
      id: "use-prefix-without-hooks",
      heading: "Using the prefix on an ordinary function",
      problem: "useFormatDate that calls no Hooks tells readers and the linter something untrue. It then has to follow Rules of Hooks for no reason, so it cannot be called in a condition or loop.",
      correction: "Name it without the prefix, such as formatDate.",
    },
    {
      id: "lifecycle-hook",
      heading: "Writing lifecycle wrappers",
      problem: "useMount(() => connect(roomId)) looks tidy, but it ignores changes to roomId. The dependency linter only checks direct useEffect calls, so it cannot warn you, and the bug stays hidden.",
      correction: "Write useEffect directly or create a purpose-named Hook that takes roomId as an input.",
    },
    {
      id: "conditional-hook-call",
      heading: "Calling a custom Hook conditionally",
      problem: "A custom Hook contains other Hooks, so a call inside an if changes the Hook order between renders. React reports an error, or it attaches values to the wrong calls.",
      correction: "Call it at the top level, and pass a parameter that makes it do nothing when not needed.",
    },
    {
      id: "impure-hook-body",
      heading: "Doing side effects in the Hook’s body",
      problem: "Because a Hook feels like a separate module, it is easy to fetch or write to storage in its body. That code runs during rendering, exactly as if it were written in the component.",
      correction: "Put side effects in an Effect or an event handler, and keep the body pure.",
    },
  ],
  interview: [
    {
      id: "ch-what",
      question: "What is a custom Hook?",
      answer: "A function whose name starts with use and that calls other Hooks, used to reuse stateful logic across components. It is written by developers rather than provided by React, and it runs as part of the calling component’s render.",
    },
    {
      id: "ch-state-shared",
      question: "If two components call the same custom Hook, do they share state?",
      answer: "No. Each call gets independent state and Effects. They can agree only if they read from the same external source. To truly share state, lift it to a common parent or provide it through context.",
    },
    {
      id: "ch-naming",
      question: "Why must custom Hooks start with use?",
      answer: "It signals that the function may contain state or Effects, and it lets the linter enforce the Rules of Hooks on it and on its callers. Conversely, a function that does not call Hooks should not use the prefix.",
    },
    {
      id: "ch-when",
      question: "When should you extract a custom Hook?",
      answer: "When logic has a clear name and repeats, and especially when wrapping an Effect, because it makes the intent clear and leaves room to change the implementation later. I would not wrap a single useState, because that adds a name with no real benefit.",
    },
    {
      id: "ch-lifecycle",
      question: "Why are Hooks like useMount discouraged?",
      answer: "They do not fit React’s synchronization model, and they hide dependencies from the linter. A useMount call quietly ignores later prop changes. Purpose-named Hooks that accept the values they depend on are safer and more descriptive.",
    },
    {
      id: "ch-callback",
      question: "How would you pass a callback to a custom Hook without restarting its Effect?",
      answer: "Wrap the callback with useEffectEvent inside the Hook, so the Effect always calls the latest version without listing it as a dependency. On older versions, a ref holding the latest callback is the usual approach.",
    },
    {
      id: "ch-vs-hoc",
      question: "How do custom Hooks compare with render props or higher-order components?",
      answer: "They share logic without changing the component tree, so there are no wrapper layers, and it is clear where each value comes from. Render props remain useful when a component should also control the structure. For logic alone, Hooks are usually simplest.",
    },
  ],
  takeaways: [
    "Custom Hooks reuse stateful logic, and each call has its own state.",
    "Use the use prefix only for functions that call Hooks.",
    "Wrap Effects in purpose-named Hooks to show intent.",
    "Avoid lifecycle-style wrappers such as useMount.",
  ],
  quickReview: {
    definition: "A custom Hook is a developer-written function, named with use, that calls other Hooks to reuse stateful logic.",
    keyPoints: [
      "It shares logic, not state.",
      "It runs during rendering, so its body must stay pure.",
      "Reactive inputs re-synchronize its Effects.",
      "Name it for its purpose, not for a lifecycle.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A small custom Hook",
      language: "tsx",
      code: `import { useState } from "react";

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  return { count, increment: () => setCount(previous => previous + 1) };
}`,
      description: "Each component calling this gets its own independent count.",
    },
    commonMistakes: [
      "Expecting two calls to share state.",
      "Naming ordinary functions with use.",
      "Writing useMount-style wrappers.",
    ],
    interviewTrap: "“Do custom Hooks share state between components?” No. They share the logic, and each call creates its own state.",
    takeaway: "Extract logic you can name, and let components read like what they do.",
  },
  sources: [
    { label: "Reusing Logic with Custom Hooks", href: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
    { label: "useEffectEvent reference", href: "https://react.dev/reference/react/useEffectEvent" },
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
  ],
};
