import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "state-has-a-cost",
      heading: "Every piece of state has a cost",
      paragraphs: [
        "Each state variable adds something to update and something that can go wrong. Unnecessary state usually shows up as values that drift out of step with their source, and as extra renders to correct them.",
        "A useful habit is to challenge each useState before you write it. Thinking in React gives three questions: does it remain unchanged over time, is it passed from a parent, and can you compute it from existing state or props? If any answer is yes, it is not state.",
      ],
    },
    {
      id: "calculate-during-render",
      heading: "Calculate instead of storing",
      paragraphs: [
        "Most unnecessary state is a value derived from something else. The Effect version below is a common sight: it stores the value and copies it whenever its inputs change. React first renders and commits the stale value, then runs the Effect, then renders again.",
        "Calculating during rendering removes both the variable and the extra pass.",
      ],
      examples: [
        {
          id: "calculate-not-store",
          classification: "complete",
          title: "Remove the state and the Effect",
          language: "tsx",
          code: `import { useState } from "react";

// Avoid:
// const [fullName, setFullName] = useState("");
// useEffect(() => { setFullName(first + " " + last); }, [first, last]);

export default function NameForm() {
  const [first, setFirst] = useState("Ana");
  const [last, setLast] = useState("Reyes");
  const fullName = first + " " + last;

  return (
    <form>
      <label>
        First name
        <input value={first} onChange={event => setFirst(event.target.value)} />
      </label>
      <label>
        Last name
        <input value={last} onChange={event => setLast(event.target.value)} />
      </label>
      <p>{fullName}</p>
    </form>
  );
}`,
          description: "fullName is a plain constant, so it is correct on every render without any extra work.",
        },
      ],
      closing: "If the calculation is genuinely expensive, wrap it in useMemo rather than moving it into state. The React Compiler can also add such caching automatically in projects that enable it.",
    },
    {
      id: "other-alternatives",
      heading: "What to use instead",
      paragraphs: [
        "When state is not the right tool, one of these usually is.",
      ],
      list: [
        "A value that follows other values: a constant calculated during rendering.",
        "A value from the parent: the prop itself.",
        "A value that never changes: a constant outside the component.",
        "A value remembered but not displayed: a ref, such as for a timer ID.",
        "A form value read only on submit: an uncontrolled input and FormData.",
      ],
    },
    {
      id: "derived-from-events",
      heading: "Avoiding state set from Effects",
      paragraphs: [
        "An Effect that only sets state is a warning sign. Three patterns replace most of them.",
      ],
      list: [
        "Derived data: calculate it during rendering.",
        "Responding to an interaction: do it in the event handler, since you already know what happened.",
        "Resetting when an ID changes: give the component a key rather than clearing fields in an Effect.",
      ],
      examples: [
        {
          id: "handler-not-effect",
          classification: "complete",
          title: "Handling an event directly",
          language: "tsx",
          code: `import { useState } from "react";

export default function Cart() {
  const [items, setItems] = useState<readonly string[]>([]);
  const [notice, setNotice] = useState("");

  function handleAdd(item: string) {
    setItems([...items, item]);
    setNotice(item + " added");
  }

  return (
    <>
      <button type="button" onClick={() => handleAdd("Book")}>
        Add book
      </button>
      <p role="status">{notice}</p>
      <p>{items.length} items</p>
    </>
  );
}`,
          description: "The notice is set where the event happens. An Effect watching items would also fire on restored or externally changed data, not just on this action.",
        },
      ],
    },
    {
      id: "when-state-is-right",
      heading: "When state really is right",
      paragraphs: [
        "None of this means state is bad. If something changes over time because of user input, cannot be calculated, and appears on screen, it is exactly what state is for. The aim is to find the smallest set of state, not to avoid it.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effect-to-derive",
      heading: "Using an Effect to derive a value",
      problem: "Effect-and-setState pairs read as responding to change. They render once with a stale value, then again with the right one, so the page can flash incorrect data and do twice the work.",
      correction: "Calculate the value in the component body.",
    },
    {
      id: "filtered-list-state",
      heading: "Storing a filtered or sorted list",
      problem: "Keeping both items and visibleItems means every change must update both. Missing one case, such as editing an item, leaves the visible list showing old data, which is hard to notice.",
      correction: "Keep items and the filter, and calculate the visible list while rendering.",
    },
    {
      id: "state-for-non-visual",
      heading: "Using state for values that do not affect output",
      problem: "A timer ID or a previous value kept in state causes a needless render each time it changes, even though nothing on screen depends on it.",
      correction: "Keep it in a ref, which persists between renders without requesting one.",
    },
    {
      id: "constants-in-state",
      heading: "Putting a constant in state",
      problem: "useState(OPTIONS) with no setter usage adds a Hook for a value that never changes. It suggests to readers that the value may change, and it hides the fact that it does not.",
      correction: "Declare it as a constant outside the component, or pass it as a prop.",
    },
  ],
  interview: [
    {
      id: "identify-unnecessary",
      question: "How do you identify unnecessary state?",
      answer: "I check whether it stays constant, comes from a prop, or can be computed from existing state or props. Any of those means it should not be state. An Effect that only calls a setter is also a strong signal.",
    },
    {
      id: "derive-performance",
      question: "Isn’t recalculating a value on every render wasteful compared to storing it?",
      answer: "Usually no. Most calculations are cheap, and storing them through an Effect costs an extra render. If one is measurably expensive, useMemo caches it while keeping it derived, so it still cannot drift out of sync.",
    },
    {
      id: "ref-or-state-q",
      question: "How do you choose between state and a ref?",
      answer: "If changing the value should update what is on screen, it is state. If the value only needs to be remembered, such as a timer ID, a ref fits because it does not request a render. Reading a ref during rendering is also discouraged.",
    },
    {
      id: "effect-smell",
      question: "Why is an Effect that only sets state considered a warning sign?",
      answer: "It usually means the value could have been calculated while rendering or set in an event handler. The Effect path renders with stale data first, then renders again. Effects are meant for synchronizing with things outside React.",
    },
    {
      id: "minimal-state-benefit",
      question: "What are the practical benefits of minimal state?",
      answer: "There is less to keep in sync, so fewer stale-data bugs. Handlers become simpler because they change one source. Rendering also does less, since there are no correction passes, and new features can read from one trustworthy value.",
    },
  ],
  takeaways: [
    "Challenge every piece of state before adding it.",
    "Calculate what you can during rendering.",
    "An Effect that only sets state is usually unnecessary.",
    "Use refs for remembered values that do not affect output.",
  ],
  quickReview: {
    definition: "Unnecessary state is any stored value that is constant, passed in, or calculable from what you already have.",
    keyPoints: [
      "Calculate derived values in the component body.",
      "Handle interactions in event handlers rather than Effects.",
      "Use keys to reset, rather than clearing state in Effects.",
      "Use refs for values that do not affect output.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Derived during rendering",
      language: "tsx",
      code: `export default function Total({ prices }: { prices: readonly number[] }) {
  const total = prices.reduce((sum, price) => sum + price, 0);

  return <p>Total: {total}</p>;
}`,
      description: "There is no state and no Effect, and the result is always correct.",
    },
    commonMistakes: [
      "Copying inputs to state through an Effect.",
      "Storing a filtered list next to its source.",
      "Using state for a timer ID.",
    ],
    interviewTrap: "“Should you store a calculated value to avoid recalculating it?” Generally no. Storing it adds a stale render. Use useMemo if it is truly expensive.",
    takeaway: "The best state is the state you found you did not need.",
  },
  sources: [
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Choosing the State Structure", href: "https://react.dev/learn/choosing-the-state-structure" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
  ],
};
