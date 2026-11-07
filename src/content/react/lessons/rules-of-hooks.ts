import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "the-rules",
      heading: "The rules",
      paragraphs: [
        "Hooks are functions whose names start with use. React’s rules say where they may be called: at the top level of a function component, or at the top level of a custom Hook. Calling them anywhere else is not supported.",
      ],
      comparison: [
        {
          id: "allowed",
          title: "Allowed",
          items: ["At the top level of a function component.", "At the top level of a custom Hook."],
        },
        {
          id: "forbidden",
          title: "Not allowed",
          items: ["Inside conditions or loops.", "After a conditional return.", "In event handlers, or in functions passed to useMemo, useReducer, or useEffect.", "In class components, and inside try/catch/finally blocks."],
        },
      ],
    },
    {
      id: "why-order",
      heading: "Why call order matters",
      paragraphs: [
        "Hooks have no names that React can use. When you call useState twice, React knows which state is which by the order of the calls. Each Hook call takes the next position in a list kept for that component. So the list has to match on every render.",
        "If a condition skips a Hook in one render, every later Hook reads the wrong position. A value could silently end up in the wrong place, which is why React checks the order and reports a mismatch in development.",
      ],
      examples: [
        {
          id: "conditional-wrong",
          classification: "snippet",
          title: "A conditional Hook, which is not allowed",
          language: "tsx",
          code: `export function Profile({ isSignedIn }: { isSignedIn: boolean }) {
  if (!isSignedIn) {
    return <p>Please sign in.</p>;
  }

  // Wrong: this call is skipped whenever the early return runs.
  const [name, setName] = useState("");

  return <input value={name} onChange={event => setName(event.target.value)} />;
}`,
          description: "It compiles, but it breaks the rules, because the number of Hook calls differs between renders. The linter reports this.",
          typecheckContext: { before: `import { useState } from "react";` },
        },
        {
          id: "conditional-fixed",
          classification: "client",
          title: "Keeping Hook order stable",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

function ProfileForm() {
  const [name, setName] = useState("");

  return <input aria-label="Name" value={name} onChange={event => setName(event.target.value)} />;
}

export function Profile({ isSignedIn }: { isSignedIn: boolean }) {
  if (!isSignedIn) {
    return <p>Please sign in.</p>;
  }

  return <ProfileForm />;
}`,
          description: "Moving the Hook into its own component keeps each component’s Hook order stable. ProfileForm always calls it, and it is simply rendered or not.",
        },
      ],
    },
    {
      id: "fixing-violations",
      heading: "Moving conditions inside",
      paragraphs: [
        "Often the fix is to always call the Hook, and put the condition inside it. An Effect can check something and return early, and a value can be computed by testing a condition after the call. If a list needs a Hook per item, extract a component for each item, so that each has its own Hook calls.",
      ],
      examples: [
        {
          id: "condition-inside",
          classification: "client",
          title: "A condition inside an Effect",
          language: "tsx",
          code: `"use client";

import { useEffect } from "react";

export function PageTitle({ title }: { title: string | null }) {
  useEffect(() => {
    if (title === null) return;
    document.title = title;
  }, [title]);

  return null;
}`,
          description: "useEffect is called on every render, so the order stays stable, and the condition decides what the Effect does.",
        },
      ],
    },
    {
      id: "the-use-api",
      heading: "How use is different",
      paragraphs: [
        "The use API reads a Promise or a context. Unlike the Hooks above, it can be called inside conditions and loops. It still has to be called from within a component or a Hook, and it cannot be called inside a try/catch block. To handle a rejected Promise, use an Error Boundary, or the Promise’s own catch method to provide another value.",
      ],
      examples: [
        {
          id: "use-conditional",
          classification: "client",
          title: "Conditionally reading context with use",
          language: "tsx",
          code: `"use client";

import { createContext, use } from "react";

const ThemeContext = createContext("light");

export function Badge({ isThemed, label }: { isThemed: boolean; label: string }) {
  if (!isThemed) {
    return <span>{label}</span>;
  }

  const theme = use(ThemeContext);

  return <span data-theme={theme}>{label}</span>;
}`,
          description: "useContext could not appear after this early return, but use can. Every other Hook in the component still has to follow the normal rules.",
        },
      ],
    },
    {
      id: "enforcement",
      heading: "Let the linter enforce it",
      paragraphs: [
        "eslint-plugin-react-hooks reports violations through its rules-of-hooks rule as you write, and its exhaustive-deps rule validates dependency arrays. Its recommended preset also includes diagnostics from React Compiler. Treat those as bugs to fix. Silencing them usually hides a real problem that will reappear later.",
        "Naming matters as well. Tools recognize a Hook by the use prefix followed by a capital letter, so a custom Hook needs a name such as useOnlineStatus. A function that does not call any Hooks should not have that prefix.",
      ],
    },
  ],
  mistakes: [
    {
      id: "conditional-hook",
      heading: "Calling a Hook inside a condition",
      problem: "When the condition changes, the sequence of Hook calls changes too, and later Hooks can read positions intended for other Hooks. In development React reports it, and the results can be incorrect state and crashes.",
      correction: "Call the Hook unconditionally, and put the condition inside or after it.",
    },
    {
      id: "after-early-return",
      heading: "Calling a Hook after an early return",
      problem: "An early return for a loading state looks harmless, but Hooks after it are skipped on some renders. This is a conditional Hook call in a different form, and it is easy to introduce when adding a guard.",
      correction: "Move Hooks above the return, or extract the rest into its own component.",
    },
    {
      id: "hook-in-handler",
      heading: "Calling a Hook in an event handler",
      problem: "A click handler runs outside of rendering, so calling useState or useContext there is invalid. It usually comes from wanting a value at click time, and it fails with an invalid Hook call message.",
      correction: "Call the Hook at the top level, and use its result in the handler.",
    },
    {
      id: "hook-in-loop",
      heading: "Calling a Hook in a loop",
      problem: "A loop over a changing list means the number of Hook calls changes with the list. Adding an item shifts positions, so the state no longer corresponds to the right item.",
      correction: "Extract a component for each item, and give each a key.",
    },
    {
      id: "disable-lint",
      heading: "Disabling the rule to make it pass",
      problem: "Suppressing rules-of-hooks removes the warning, and it leaves the problem. The bug then appears only when the condition changes, which might be rare enough to reach production.",
      correction: "Restructure the code so that the rule is satisfied.",
    },
    {
      id: "use-in-try",
      heading: "Wrapping use in try/catch",
      problem: "use cannot be called inside a try/catch block. A try/catch looks like the obvious way to handle a rejected Promise, and React reports an error instead of letting the code work as written.",
      correction: "Use an Error Boundary, or provide another value with the Promise’s catch method.",
    },
  ],
  interview: [
    {
      id: "rh-what",
      question: "What are the Rules of Hooks?",
      answer: "Call Hooks only at the top level of function components and custom Hooks. Do not call them in conditions, loops, after a conditional return, in event handlers, in class components, or in functions passed to useMemo, useReducer, or useEffect.",
    },
    {
      id: "rh-why",
      question: "Why must Hooks be called in the same order each time?",
      answer: "React identifies each Hook by its position in the sequence of calls, as they have no names. With a stable order, the first useState call always gets the first state. If a call is skipped, the later ones read the wrong positions, and values get mixed up.",
    },
    {
      id: "rh-conditional",
      question: "How do you run a Hook conditionally?",
      answer: "You cannot skip the call, so you put the condition inside it. An Effect can return early, for example. Alternatively, extract a component containing the Hook, and render that component conditionally, which is often the cleanest option.",
    },
    {
      id: "rh-use",
      question: "How is use different from other Hooks?",
      answer: "It can be called in conditions and loops, unlike useState or useContext. It must still be called within a component or a Hook, and not inside try/catch. It reads a Promise or a context, and a rejected Promise goes to an Error Boundary.",
    },
    {
      id: "rh-loop",
      question: "How do you use a Hook for each item in a list?",
      answer: "Extract a component for each item, render it with a key, and call the Hook inside. Each instance then has its own fixed sequence of Hook calls, regardless of how many items there are, and the key connects its state to the right item.",
    },
    {
      id: "rh-lint",
      question: "How are these rules enforced?",
      answer: "eslint-plugin-react-hooks has a rules-of-hooks rule that catches violations at build time, and exhaustive-deps checks dependency arrays. It relies on the use prefix to recognize Hooks, which is one reason why a custom Hook needs that name.",
    },
  ],
  takeaways: [
    "Call Hooks at the top level of components and custom Hooks.",
    "React tracks Hooks by call order.",
    "Put conditions inside Hooks, or extract a component.",
    "use can be conditional, but it cannot go in try/catch.",
  ],
  quickReview: {
    definition: "The Rules of Hooks require calling Hooks at the top level of components and custom Hooks, so that their order is the same on every render.",
    keyPoints: [
      "No Hooks in conditions, loops, or handlers.",
      "No Hooks after a conditional return.",
      "React identifies Hooks by their position.",
      "use may be called conditionally.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "client",
      title: "Hooks first, conditions after",
      language: "tsx",
      code: `"use client";

import { useState } from "react";

export function Notice({ isVisible }: { isVisible: boolean }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isVisible || isDismissed) return null;

  return <button onClick={() => setIsDismissed(true)}>Dismiss</button>;
}`,
      description: "useState runs on every render, and the early return comes after it.",
    },
    commonMistakes: [
      "Calling a Hook after an early return.",
      "Calling a Hook inside a loop.",
      "Disabling the lint rule.",
    ],
    interviewTrap: "“Can no Hook ever be conditional?” use can be called conditionally. The restriction applies to the other Hooks.",
    takeaway: "Call Hooks in the same order every time, and React can keep track of them.",
  },
  sources: [
    { label: "Rules of Hooks", href: "https://react.dev/reference/rules/rules-of-hooks" },
    { label: "use reference", href: "https://react.dev/reference/react/use" },
    { label: "State: A Component’s Memory", href: "https://react.dev/learn/state-a-components-memory" },
    { label: "eslint-plugin-react-hooks", href: "https://react.dev/reference/eslint-plugin-react-hooks" },
  ],
};
