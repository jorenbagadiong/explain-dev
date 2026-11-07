import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-it-does",
      heading: "What useDebugValue does",
      paragraphs: [
        "useDebugValue adds a label to a custom Hook in React DevTools. Call it at the top level of a custom Hook, and a component using that Hook displays the label when inspected. It returns nothing, and it has no effect on what your application renders.",
        "Without it, DevTools shows the Hook’s underlying data, such as a bare true. With it, the same Hook can read as OnlineStatus: \"Online\", which is much easier to scan.",
      ],
      examples: [
        {
          id: "online-label",
          classification: "complete",
          title: "Labeling a custom Hook",
          language: "tsx",
          code: `import { useDebugValue, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  useDebugValue(isOnline ? "Online" : "Offline");

  return isOnline;
}`,
          description: "The label only appears in DevTools. Components calling this Hook still get a plain boolean.",
        },
      ],
    },
    {
      id: "deferred-formatting",
      heading: "Deferring expensive formatting",
      paragraphs: [
        "The optional second argument is a format function. It receives the value and returns what to display, and it runs only when the component is actually inspected in DevTools, not on every render.",
        "So if creating the label costs something, pass the raw value and a formatter. Everyday users of your application never pay for it.",
      ],
      examples: [
        {
          id: "format-function",
          classification: "complete",
          title: "Formatting only when inspected",
          language: "tsx",
          code: `import { useDebugValue, useState } from "react";

export function useLastSaved() {
  const [savedAt, setSavedAt] = useState(() => new Date());
  useDebugValue(savedAt, date => date.toDateString());

  return { savedAt, markSaved: () => setSavedAt(new Date()) };
}`,
          description: "toDateString is not called on normal renders, only when DevTools needs to show the value.",
        },
      ],
    },
    {
      id: "when-to-use",
      heading: "When to use it",
      paragraphs: [
        "It is most valuable for custom Hooks in shared libraries with complex internal data that is hard to inspect. Do not add it to every custom Hook. A simple Hook is often clear enough on its own, and a label there just adds a line to read.",
      ],
    },
  ],
  mistakes: [
    {
      id: "every-hook",
      heading: "Adding it to every custom Hook",
      problem: "Labels everywhere look thorough, but most small Hooks already show readable data in DevTools. The extra line adds noise to the code and gives little in return for the people debugging it.",
      correction: "Use it selectively, where a label meaningfully helps someone debugging the component.",
    },
    {
      id: "expensive-label",
      heading: "Computing an expensive label inline",
      problem: "useDebugValue(formatLargeObject(value)) runs the formatter on every render, including for users who never open DevTools. The label costs real time, even though only developers ever see it.",
      correction: "Pass the raw value and a format function, so formatting only happens on inspection.",
    },
    {
      id: "in-components",
      heading: "Calling it directly in a component",
      problem: "The Hook is meant to label custom Hooks. Used directly in a component body, it adds little, since DevTools already shows that component’s own state and props.",
      correction: "Call it inside a custom Hook, where it labels something that would otherwise be opaque.",
    },
  ],
  interview: [
    {
      id: "udv-debug-what",
      question: "What does useDebugValue do?",
      answer: "It adds a label to a custom Hook in React DevTools, shown when you inspect a component using that Hook. It does not affect rendering or the Hook’s return value, so it only exists to help with debugging.",
    },
    {
      id: "udv-format",
      question: "What is the second argument for?",
      answer: "It is an optional format function that receives the value and returns the display form. It runs only when the component is inspected, so an expensive conversion, such as formatting a date, does not add cost to normal renders.",
    },
    {
      id: "udv-when",
      question: "When is useDebugValue worth adding?",
      answer: "For custom Hooks in shared libraries with internal data that is hard to read in DevTools. For most application Hooks it adds little, and the docs advise against adding it everywhere. I would add it when someone debugging would clearly benefit.",
    },
    {
      id: "udv-production",
      question: "Does useDebugValue change how a Hook behaves for users?",
      answer: "No. It only provides information to DevTools, and the Hook’s logic and return value stay the same. The one thing to watch is a label computed inline, since that calculation still runs during rendering if no format function is used.",
    },
    {
      id: "udv-rules",
      question: "Do the Rules of Hooks apply to useDebugValue?",
      answer: "Yes. It must be called at the top level of a custom Hook, not inside conditions or loops. For a conditional label, call it unconditionally and let the value or the format function decide what appears.",
    },
  ],
  takeaways: [
    "useDebugValue labels a custom Hook in React DevTools.",
    "A format function defers expensive formatting until inspection.",
    "Use it selectively, mainly in shared libraries.",
    "It does not change what your application renders.",
  ],
  quickReview: {
    definition: "useDebugValue adds a label to a custom Hook in React DevTools, with optional deferred formatting.",
    keyPoints: [
      "useDebugValue(value, format).",
      "It returns nothing.",
      "The format function runs only when inspected.",
      "It is most useful in shared libraries.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A lazily formatted label",
      language: "tsx",
      code: `useDebugValue(date, value => value.toDateString());`,
      typecheckContext: { before: `import { useDebugValue } from "react";\nexport function useExample(date: Date) {`, after: "}" },
      description: "The date is formatted only when DevTools displays it.",
    },
    commonMistakes: [
      "Adding it to every custom Hook.",
      "Formatting expensively inline, on every render.",
    ],
    interviewTrap: "“Does useDebugValue affect production behavior?” It does not change the output, but an inline formatting call still runs, which is why the format function exists.",
    takeaway: "Add a label when it saves someone real debugging time, and skip it otherwise.",
  },
  sources: [
    { label: "useDebugValue reference", href: "https://react.dev/reference/react/useDebugValue" },
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
  ],
};
