import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-separate",
      heading: "Why separate them at all",
      paragraphs: [
        "A component mixes three things: what it looks like, how it behaves, and the rules behind that behavior. When they are tangled, reading the markup means wading through calculations, and testing a rule means rendering a whole component.",
        "The aim is readable presentation with behavior organized close to its purpose. It is not a strict layering rule. React deliberately keeps markup and logic in one component, and splitting them for its own sake only creates files to jump between.",
      ],
    },
    {
      id: "three-tools",
      heading: "Three places to move logic",
      paragraphs: [
        "Different kinds of logic have different natural homes. Moving each to the simplest place that fits usually solves the readability problem.",
      ],
      comparison: [
        {
          id: "plain-functions",
          title: "Plain functions",
          items: ["Calculations with no React in them.", "Formatting, validation, sorting.", "The easiest to test and reuse."],
        },
        {
          id: "custom-hooks",
          title: "Custom Hooks and reducers",
          items: ["Logic that uses state or Effects.", "Reusable across components.", "Reducers isolate transitions too."],
        },
      ],
      closing: "Child components are the third option, when a piece of UI deserves its own name and logic together.",
    },
    {
      id: "before-and-after",
      heading: "Moving rules into plain functions",
      paragraphs: [
        "A business rule rarely needs React. Pulled out into a plain function, it can be tested with ordinary inputs and outputs, reused on a server, and read without any markup around it.",
      ],
      examples: [
        {
          id: "plain-rule",
          classification: "complete",
          title: "A rule with no React in it",
          language: "tsx",
          code: `interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function getCartTotal(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function canCheckOut(items: readonly CartItem[]): boolean {
  return items.length > 0 && getCartTotal(items) >= 100;
}

export default function CartSummary({ items }: { items: readonly CartItem[] }) {
  return (
    <section>
      <p>Total: PHP {getCartTotal(items).toFixed(2)}</p>
      <button type="button" disabled={!canCheckOut(items)}>
        Check out
      </button>
    </section>
  );
}`,
          description: "The component reads as presentation. The rules can be tested without rendering anything.",
        },
      ],
    },
    {
      id: "extracting-hook",
      heading: "Moving stateful behavior into a Hook",
      paragraphs: [
        "When logic involves state, a custom Hook keeps the component focused on what it displays. Even with one caller, this can be worthwhile if the logic is substantial, though for a few lines it may just move code around.",
      ],
      examples: [
        {
          id: "use-search",
          classification: "complete",
          title: "Separating search behavior from its markup",
          language: "tsx",
          code: `import { useMemo, useState } from "react";

export function useFilteredList(items: readonly string[]) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => item.toLowerCase().includes(normalized));
  }, [items, query]);

  return { query, setQuery, results };
}

export default function LessonSearch({ lessons }: { lessons: readonly string[] }) {
  const { query, setQuery, results } = useFilteredList(lessons);

  return (
    <>
      <label>
        Search lessons
        <input value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <ul>
        {results.map(lesson => (
          <li key={lesson}>{lesson}</li>
        ))}
      </ul>
    </>
  );
}`,
          description: "The Hook owns how filtering works, and the component owns how it looks. A different component could present the same behavior differently.",
        },
      ],
    },
    {
      id: "container-presentational",
      heading: "A note on container and presentational components",
      paragraphs: [
        "An older pattern split each feature into a container that held data and a presentational component that rendered it. Hooks removed the main reason for it, since logic can now be reused without a wrapper. A strict split into two files for every component adds work and little else.",
        "A related idea is still useful, however. A component that only takes props and renders is easy to test and to preview, so making some components purely presentational can pay off, particularly in a shared library.",
      ],
    },
  ],
  mistakes: [
    {
      id: "rules-in-jsx",
      heading: "Burying rules inside JSX",
      problem: "Long conditions and calculations written inline make markup hard to scan. The rule can only be tested by rendering the component, and the same rule is often copied elsewhere with small differences.",
      correction: "Give it a name, and move it above the return or into a plain function.",
    },
    {
      id: "hook-for-pure-logic",
      heading: "Writing a Hook for logic that uses no Hooks",
      problem: "A useCartTotal that only calculates a number adds a Rules of Hooks restriction for no reason. It cannot be called conditionally, and it suggests state that does not exist.",
      correction: "Use a plain function, such as getCartTotal.",
    },
    {
      id: "strict-layers",
      heading: "Forcing every component into two files",
      problem: "Splitting a simple component into a container and a view means two files and one set of props passed between them. For small components, this adds indirection without making anything easier.",
      correction: "Keep logic and markup together until a concrete reason appears for separating them.",
    },
    {
      id: "hook-returning-jsx",
      heading: "Hiding markup inside a Hook",
      problem: "A Hook that returns JSX blurs the separation you were trying to create. Its returned element is hard to customize, and readers cannot tell what a component renders from its own return statement.",
      correction: "Return data and handlers from the Hook, and keep JSX in components.",
    },
    {
      id: "over-extraction",
      heading: "Extracting everything away from the component",
      problem: "When each line of behavior lives in another file, a component reads as a list of calls, and understanding it needs five tabs open. The logic was never tangled in the first place.",
      correction: "Keep simple logic close to where it is used, and extract only when it has weight or repeats.",
    },
  ],
  interview: [
    {
      id: "sep-why",
      question: "Why separate UI from logic in React?",
      answer: "So markup stays readable and rules can be tested and reused independently. It does not need to be a rigid layering. React keeps logic and markup together on purpose, so I separate where it improves clarity rather than by default.",
    },
    {
      id: "sep-where",
      question: "Where would you put business logic in a React application?",
      answer: "In plain functions when it needs no React, since they are the simplest to test and can be reused anywhere. In custom Hooks or reducers when it needs state or Effects. Components are then left with what to display and which handlers to call.",
    },
    {
      id: "sep-container",
      question: "Is the container and presentational pattern still relevant?",
      answer: "Hooks removed most of its need, because logic can be reused without wrapper components. The underlying idea still helps: components that only take props are easy to test. I would not enforce a two-file split across a whole codebase, though.",
    },
    {
      id: "sep-testing",
      question: "How does this separation help testing?",
      answer: "Plain functions need only inputs and outputs, and reducers work the same way. Those cover most rules cheaply. Component tests can then focus on behavior from a user’s point of view rather than rechecking every calculation through the UI.",
    },
    {
      id: "sep-hook-one-user",
      question: "Is it worth extracting a Hook used by only one component?",
      answer: "It can be, if the logic is substantial and the component becomes easier to read, or the Hook gives the logic a clear name. For a few lines, it just moves code around. Reuse is not the only reason, but there should be a clear benefit.",
    },
  ],
  takeaways: [
    "Separate for readability and testing, not as a strict layer.",
    "Rules without React belong in plain functions.",
    "Stateful behavior can move to Hooks and reducers.",
    "Keep simple logic close to the markup it serves.",
  ],
  quickReview: {
    definition: "Separating UI and logic means moving rules and behavior to where they are easiest to read and test, without forcing layers.",
    keyPoints: [
      "Plain functions for rules with no React.",
      "Custom Hooks for logic that uses state or Effects.",
      "Hooks return data and handlers, not JSX.",
      "Container and view splits are rarely needed now.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A named rule",
      language: "tsx",
      code: `function isOverdue(dueDate: Date, now: Date) {
  return dueDate < now;
}

export default function DueLabel({ dueDate, now }: { dueDate: Date; now: Date }) {
  return <p>{isOverdue(dueDate, now) ? "Overdue" : "On time"}</p>;
}`,
      description: "Passing the current time in keeps the function and the component pure, which makes both easy to test.",
    },
    commonMistakes: [
      "Long conditions inline in JSX.",
      "Writing a Hook when a plain function would do.",
      "Splitting every component into two files.",
    ],
    interviewTrap: "“Should components contain no logic?” No. React puts logic and markup together by design. Move logic out when that makes things clearer.",
    takeaway: "Move logic to the simplest home that makes the component easier to read.",
  },
  sources: [
    { label: "Reusing Logic with Custom Hooks", href: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
    { label: "Extracting State Logic into a Reducer", href: "https://react.dev/learn/extracting-state-logic-into-a-reducer" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
  ],
};
