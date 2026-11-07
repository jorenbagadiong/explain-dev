import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-structure-matters",
      heading: "Why the shape of state matters",
      paragraphs: [
        "A component can often be written with several different state shapes, and all of them work at first. The difference shows up over time. A poorly shaped state allows contradictions, needs several variables updated together, and hides bugs in the gaps between them.",
        "The goal is simple: make state as small as it can be while still holding everything you cannot calculate. Fewer pieces of state mean fewer ways for them to disagree.",
      ],
    },
    {
      id: "principles",
      heading: "Five principles",
      paragraphs: ["These principles come up repeatedly when choosing a structure."],
      list: [
        "Group related state. If two values always change together, such as x and y, keep them in one variable.",
        "Avoid contradictions. Replace booleans that could disagree with a single status value.",
        "Avoid redundant state. If you can calculate something during rendering, do not store it.",
        "Avoid duplication. Do not keep the same object in two places. Store its ID and look it up.",
        "Avoid deep nesting. Flat state is much easier to update than a deep tree.",
      ],
    },
    {
      id: "avoid-contradictions",
      heading: "Avoiding contradictions",
      paragraphs: [
        "Two booleans such as isSending and isSent allow a combination that should never happen: both true. A single status holds one value at a time, so the impossible state cannot be represented.",
        "You can still define booleans for readability. They are constants calculated from status, so they can never fall out of step.",
      ],
      examples: [
        {
          id: "status-value",
          classification: "complete",
          title: "One status value",
          language: "tsx",
          code: `import { useState } from "react";

type Status = "typing" | "sending" | "sent";

export default function FeedbackForm() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("typing");
  const isSending = status === "sending";

  if (status === "sent") {
    return <p>Thanks for your feedback.</p>;
  }

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        setStatus("sending");
        window.setTimeout(() => setStatus("sent"), 500);
      }}
    >
      <label>
        Feedback
        <textarea value={text} disabled={isSending} onChange={event => setText(event.target.value)} />
      </label>
      <button type="submit" disabled={isSending}>
        Send
      </button>
    </form>
  );
}`,
          description: "The timeout stands in for a real request. isSending is a calculated constant rather than a second piece of state.",
        },
      ],
    },
    {
      id: "derived-values",
      heading: "Calculating derived values",
      paragraphs: [
        "If a value can be worked out from props or state, calculate it during rendering. There is nothing to keep in sync, because it is recomputed from fresh data each time.",
      ],
      examples: [
        {
          id: "derive-total",
          classification: "complete",
          title: "Counts derived from a list",
          language: "tsx",
          code: `import { useState } from "react";

const initialItems = [
  { id: 1, label: "Passport", isPacked: true },
  { id: 2, label: "Charger", isPacked: false },
];

export default function PackingSummary() {
  const [items, setItems] = useState(initialItems);
  const packed = items.filter(item => item.isPacked).length;

  return (
    <>
      <p>
        {packed} of {items.length} packed
      </p>
      <button type="button" onClick={() => setItems(items.map(item => ({ ...item, isPacked: true })))}>
        Pack everything
      </button>
    </>
  );
}`,
          description: "Neither count is stored. A handler that changes items does not need to remember to update anything else.",
        },
      ],
      closing: "If a calculation is genuinely expensive, useMemo can cache it, but it remains derived data rather than state.",
    },
    {
      id: "avoid-duplication",
      heading: "Storing IDs instead of duplicates",
      paragraphs: [
        "Storing a selected item as a whole object creates a second copy of something already in your list. Edit the list, and the selection goes stale. Only the selected ID is essential, and the rest can be looked up during rendering.",
      ],
      examples: [
        {
          id: "selected-id",
          classification: "complete",
          title: "Keeping only the selected ID",
          language: "tsx",
          code: `import { useState } from "react";

const plans = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
];

export default function PlanSelect() {
  const [selectedId, setSelectedId] = useState("free");
  const selected = plans.find(plan => plan.id === selectedId);

  return (
    <>
      <p>Selected: {selected?.name}</p>
      {plans.map(plan => (
        <button key={plan.id} type="button" aria-pressed={plan.id === selectedId} onClick={() => setSelectedId(plan.id)}>
          {plan.name}
        </button>
      ))}
    </>
  );
}`,
          description: "The selected plan is always current, because it is looked up from the source each render.",
        },
      ],
    },
    {
      id: "flatten-nesting",
      heading: "Flattening nested state",
      paragraphs: [
        "Deeply nested state makes each update copy many levels. A common fix is to normalize it, as in a database: store items in a flat object keyed by ID, with each item listing its children’s IDs. A change then only touches the items involved.",
        "Do not flatten by reflex. If updates are simple, or the nested data never changes, the tree may be fine. Move toward a flatter shape when updates become awkward.",
      ],
    },
  ],
  mistakes: [
    {
      id: "contradictory-flags",
      heading: "Using booleans that can contradict each other",
      problem: "Adding isLoading, isError, and isSuccess as separate state seems natural as needs appear. But nothing prevents two from being true, so one missed setter leaves the UI in a state you never designed.",
      correction: "Use one status value, and calculate any booleans from it.",
    },
    {
      id: "storing-derived",
      heading: "Storing what you can calculate",
      problem: "Keeping fullName in state alongside firstName and lastName means every handler must update three values. Missing one displays stale data, and the extra state adds no information.",
      correction: "Calculate it during rendering, as in const fullName = firstName + \" \" + lastName.",
    },
    {
      id: "mirror-prop",
      heading: "Mirroring a prop in state",
      problem: "useState(messageColor) only uses the prop on the first render, so later changes from the parent are ignored. The component appears stuck on its first value, which is a confusing bug to find.",
      correction: "Use the prop directly. If you do want only the initial value, name it initialColor so the intent is clear.",
    },
    {
      id: "duplicate-object",
      heading: "Keeping the same object in two state variables",
      problem: "Storing a list and also a selected item object means an edit to the list leaves the selection holding old data. The screen then shows two different versions of one thing.",
      correction: "Store the selected ID, and look up the object during rendering.",
    },
    {
      id: "separate-related",
      heading: "Splitting state that always changes together",
      problem: "Separate x and y variables work, but every handler has to update both, and a forgotten one leaves them mismatched. The reverse mistake also exists: a single object holding unrelated values forces extra copying on each update.",
      correction: "Group values that change together, and keep unrelated values in separate variables.",
    },
  ],
  interview: [
    {
      id: "good-structure",
      question: "What makes a good state structure?",
      answer: "It holds the minimum needed, so nothing can be calculated from anything else, and no values can contradict each other. Related values are grouped, data is not duplicated, and nesting is shallow enough that updates stay simple.",
    },
    {
      id: "derived-state-q",
      question: "What is derived state, and how should you handle it?",
      answer: "It is any value calculable from existing state or props. Calculate it during rendering instead of storing it, so it cannot get out of sync. If the calculation is genuinely slow, wrap it in useMemo, which caches it but does not make it state.",
    },
    {
      id: "booleans-vs-status",
      question: "Why prefer a single status over several booleans?",
      answer: "Independent booleans allow impossible combinations, such as sending and sent both being true. A single status can only be one value at a time. You can still calculate readable booleans from it, and those can never disagree.",
    },
    {
      id: "selected-object",
      question: "Should you store a selected item as an object or as an ID?",
      answer: "As an ID. The object already exists in the list, so storing it again creates a duplicate that goes stale when the list changes. Looking it up during rendering always gives the current version.",
    },
    {
      id: "normalize",
      question: "How would you handle deeply nested state?",
      answer: "I would normalize it: a flat object keyed by ID, with each entry holding its children’s IDs. Updates then touch only the affected entries. If the nesting is rarely updated, I might leave it as is, and Immer can also reduce the boilerplate.",
    },
    {
      id: "mirror-prop-ok",
      question: "Is copying a prop into state ever acceptable?",
      answer: "Yes, when you deliberately want to ignore later updates, as with an initial value. The convention is to name it initialThing or defaultThing so readers understand. If the state should follow the prop, use the prop directly.",
    },
  ],
  takeaways: [
    "Keep state minimal, and calculate everything you can.",
    "Make impossible states unrepresentable with a single status value.",
    "Store IDs rather than duplicate objects.",
    "Flatten deep nesting when updates become awkward.",
  ],
  quickReview: {
    definition: "Good state structure keeps only what cannot be calculated, in a shape that cannot contradict itself.",
    keyPoints: [
      "Group what changes together, and separate what does not.",
      "One status value beats several booleans.",
      "Derived values are calculated during rendering.",
      "Store a selected ID, not a copy of the item.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Calculated, not stored",
      language: "tsx",
      code: `import { useState } from "react";

export default function Name() {
  const [first, setFirst] = useState("Ana");
  const fullName = first + " Reyes";

  return <button type="button" onClick={() => setFirst("Ben")}>{fullName}</button>;
}`,
      description: "fullName is recalculated each render, so it can never be out of date.",
    },
    commonMistakes: [
      "Using separate isLoading and isError flags.",
      "Storing totals or filtered lists in state.",
      "Holding a selected object alongside its list.",
    ],
    interviewTrap: "“Should a filtered list be in state, since it changes?” No. It changes because its inputs do, so calculate it from them.",
    takeaway: "For every piece of state, ask whether it could be calculated or could contradict something else.",
  },
  sources: [
    { label: "Choosing the State Structure", href: "https://react.dev/learn/choosing-the-state-structure" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
  ],
};
