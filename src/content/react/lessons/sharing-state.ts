import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "the-problem",
      heading: "When components must agree",
      paragraphs: [
        "Each component instance has its own state, which is usually what you want. It becomes a problem when two components need to show or change the same information, such as a filter input and the list it filters, or two accordion panels where only one may be open.",
        "Trying to keep two copies in sync is fragile. The fix is to give that information a single owner.",
      ],
    },
    {
      id: "single-source-of-truth",
      heading: "A single source of truth",
      paragraphs: [
        "A single source of truth means every piece of information has one component that owns it. It does not mean all state lives in one place. Different pieces of state live in different components, each at the level where it is needed.",
        "Everything else receives that value through props, or calculates from it. There is then only one value to update, and no way for the copies to disagree.",
      ],
      visual: {
        heading: "One owner, several readers",
        context: "SearchPage owns the query. Its children receive what they need through props, and indentation shows which component renders which.",
        root: {
          id: "search-page",
          title: "SearchPage",
          description: "Owns the query state, the source of truth.",
          children: [
            { id: "search-input", title: "SearchInput", description: "Receives the query and a handler to change it." },
            { id: "results-list", title: "ResultsList", description: "Receives the query, and shows the matching results." },
          ],
        },
        note: "Data flows down as props, and changes travel back up through the handler the parent passed down.",
      },
    },
    {
      id: "connecting-components",
      heading: "Connecting two components through a parent",
      paragraphs: [
        "Here, a search box and a results list stay in step because neither one owns the query. Their parent does.",
      ],
      examples: [
        {
          id: "shared-query",
          classification: "complete",
          title: "A shared filter",
          language: "tsx",
          code: `import { useState } from "react";

const lessons = ["Props", "State", "Effects", "Refs"];

function SearchInput({ query, onQueryChange }: { query: string; onQueryChange: (next: string) => void }) {
  return (
    <label>
      Search
      <input value={query} onChange={event => onQueryChange(event.target.value)} />
    </label>
  );
}

function ResultsList({ query }: { query: string }) {
  const results = lessons.filter(lesson => lesson.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ul>
      {results.map(lesson => (
        <li key={lesson}>{lesson}</li>
      ))}
    </ul>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchInput query={query} onQueryChange={setQuery} />
      <ResultsList query={query} />
    </>
  );
}`,
          description: "Typing updates the parent’s state, which re-renders both children with the new query. The results are calculated rather than stored.",
        },
      ],
    },
    {
      id: "where-state-should-live",
      heading: "Deciding where state should live",
      paragraphs: [
        "Find every component that renders based on the state, then find their closest common parent. That parent, or something above it, is the natural owner. If no sensible component exists, it is fine to add one just to hold the state.",
        "State placement is not permanent. It is normal for state to move up and back down as an application develops. Keep state as low as it can go, because a state update re-renders the owner and its subtree by default.",
      ],
      comparison: [
        {
          id: "keep-local",
          title: "Keep it local when",
          items: ["Only one component reads it.", "It describes transient UI, such as hover or a draft.", "Resetting it on unmount is fine."],
        },
        {
          id: "move-up",
          title: "Move it up when",
          items: ["Two or more components read or change it.", "A sibling’s output depends on it.", "It must outlive the component that displays it."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "syncing-with-effects",
      heading: "Keeping two copies in sync with Effects",
      problem: "Each component holds its own copy, and an Effect copies changes across. It seems to work, but there is an extra render with stale values, and the copies can fall out of step or even trigger each other in a loop.",
      correction: "Remove the duplicates, and put one copy in a common parent.",
    },
    {
      id: "everything-global",
      heading: "Moving all state to the top of the app",
      problem: "A single global store seems to end every sharing problem. But state unrelated to most of the tree then re-renders far more than needed, and local concerns such as a dropdown’s open flag become everyone’s concern.",
      correction: "Place each piece of state at the lowest common parent of the components that use it.",
    },
    {
      id: "copying-into-child",
      heading: "Copying a prop into a child’s state",
      problem: "A child initializing its own state from a prop stops following the parent after the first render. The screen then shows two different values for what should be one fact.",
      correction: "Read the prop directly. If the child must edit a draft, make that explicit and decide how it resets.",
    },
  ],
  interview: [
    {
      id: "single-source",
      question: "What does single source of truth mean in React?",
      answer: "Each piece of information has one component that owns it, and others read it through props or calculate from it. It does not mean one global store. It means no duplicates that have to be kept in sync.",
    },
    {
      id: "sibling-communication",
      question: "How do two sibling components share data?",
      answer: "Move the state to their closest common parent. The parent passes the value down to both and passes a handler to whichever one changes it. Siblings never talk to each other directly, which keeps the data flow easy to trace.",
    },
    {
      id: "where-to-put",
      question: "How do you decide where a piece of state should live?",
      answer: "List every component that renders from it, then find their closest common parent. Place the state there. If that placement forces passing through many layers, composition or context might help, but I would start with the simplest option.",
    },
    {
      id: "low-as-possible",
      question: "Why keep state as low in the tree as possible?",
      answer: "An update re-renders the owner and, by default, everything inside it. Keeping state close to where it is used limits that work and also keeps unrelated components from knowing about it, which makes each one easier to change.",
    },
    {
      id: "avoid-effect-sync",
      question: "Why is syncing two state variables with an Effect a problem?",
      answer: "The Effect runs after a commit, so the UI first renders with mismatched values and then renders again. It is extra work, and the sync logic can miss cases. A single source of truth makes the problem disappear rather than managing it.",
    },
  ],
  takeaways: [
    "Each piece of information should have one owner.",
    "Siblings share by moving state to their closest common parent.",
    "Keep state as low as it can go.",
    "Avoid duplicating state and syncing it with Effects.",
  ],
  quickReview: {
    definition: "Components share state by having their closest common parent own it and pass it down.",
    keyPoints: [
      "One owner for each fact, though not one global place.",
      "Values flow down, and changes go up through handlers.",
      "Finding the common parent shows where state belongs.",
      "State can move as the application changes.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Parent owns, children receive",
      language: "tsx",
      code: `import { useState } from "react";

function Display({ value }: { value: number }) {
  return <p>{value}</p>;
}

export default function Parent() {
  const [value, setValue] = useState(0);

  return (
    <>
      <Display value={value} />
      <button type="button" onClick={() => setValue(previous => previous + 1)}>
        Add
      </button>
    </>
  );
}`,
      description: "The display and the button stay in step, because there is only one value.",
    },
    commonMistakes: [
      "Using an Effect to keep two copies in sync.",
      "Moving everything to a global store by default.",
      "Copying a prop into a child’s state.",
    ],
    interviewTrap: "“Does single source of truth mean one store for the app?” No. It means each fact has one owner, and those owners live throughout the tree.",
    takeaway: "Do not synchronize copies. Remove them, and give the fact one home.",
  },
  sources: [
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
  ],
};
