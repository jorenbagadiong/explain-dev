import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-reconciliation-is",
      heading: "What reconciliation is",
      paragraphs: [
        "Each render produces a tree of elements. Reconciliation is React working out how the new tree relates to the previous one, so that it can keep what still applies and change only what differs.",
        "The central question at each position is whether this is the same component as last time. If it is, React keeps its state and its DOM and updates what changed. If not, React destroys the old one and creates a new one. Three things answer the question: type, position, and key.",
      ],
    },
    {
      id: "type-and-position",
      heading: "Type and position",
      paragraphs: [
        "If the same type appears at the same position, React treats it as the same instance. Position means position in the tree, not in your source file, so two branches of a conditional can produce the same instance.",
        "A different type at a position means a new instance, and everything beneath it is discarded too. A change of wrapper from section to div is enough to reset all the state inside.",
      ],
      visual: {
        heading: "Comparing a position between renders",
        context: "React asks these questions for each child, working down the tree.",
        steps: [
          { id: "type", title: "Same type?", description: "If not, the old subtree is destroyed and a new one is created." },
          { id: "key", title: "Same key?", description: "If the key differs, it is a different instance, even with the same type." },
          { id: "update", title: "Update the instance", description: "State is kept, and the component renders with its new props." },
          { id: "children", title: "Repeat for children", description: "The same questions apply at each level below." },
        ],
        note: "This is a simplified model of the behavior you can rely on. React’s internal algorithm is an implementation detail that can change.",
      },
    },
    {
      id: "keys-in-lists",
      heading: "Keys and reordering",
      paragraphs: [
        "In a list, position changes whenever items are inserted or moved. A key tells React which item is which, so it matches children by key among their siblings rather than by order. That is what allows a reorder to move existing instances instead of re-creating them.",
        "This also has a performance side. With stable keys, inserting at the top of a long list keeps the existing DOM nodes. With index keys, each row appears to change its content.",
      ],
      examples: [
        {
          id: "key-matching",
          classification: "complete",
          title: "Keys tell React what moved",
          language: "tsx",
          code: `import { useState } from "react";

const initial = [
  { id: "a", name: "Ana" },
  { id: "b", name: "Ben" },
];

export default function Roster() {
  const [people, setPeople] = useState(initial);

  return (
    <>
      <button type="button" onClick={() => setPeople(previous => [{ id: "c" + previous.length, name: "Cara" }, ...previous])}>
        Add to top
      </button>
      <ul>
        {people.map(person => (
          <li key={person.id}>
            <label>
              {person.name}
              <input />
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}`,
          description: "Text typed into Ana’s input stays with Ana when someone is added above. With key={index}, it would stay at the first row and appear to belong to Cara.",
        },
      ],
    },
    {
      id: "identity-tools",
      heading: "Using identity deliberately",
      paragraphs: [
        "Once you see identity as something you control, a few patterns follow. You can reset a component by changing its key, and you can keep one across a layout change by making sure its type and position stay the same.",
      ],
      list: [
        "Reset a form when its record changes, with key={record.id}.",
        "Keep state across branches by keeping the structure the same, and changing only props or classes.",
        "Separate instances in two branches by giving each a different key.",
        "Never define components inside others, because that creates a new type on every render.",
      ],
      examples: [
        {
          id: "accidental-remount",
          classification: "complete",
          title: "An accidental remount, and its fix",
          language: "tsx",
          code: `import { useState } from "react";

function SearchField() {
  const [text, setText] = useState("");

  return (
    <label>
      Search
      <input value={text} onChange={event => setText(event.target.value)} />
    </label>
  );
}

// Avoid defining SearchField inside Page, which would remount it on every render.
export default function Page({ isWide }: { isWide: boolean }) {
  return (
    <div className={isWide ? "wide" : "narrow"}>
      <SearchField />
    </div>
  );
}`,
          description: "Only the class changes when isWide does, so SearchField keeps its text. Switching the wrapper from div to section would remount it.",
        },
      ],
    },
    {
      id: "virtual-dom-note",
      heading: "A note on the Virtual DOM",
      paragraphs: [
        "You may hear this comparison described as diffing the Virtual DOM, and it is a reasonable mental model. It does not guarantee an application is fast. Comparing has a cost, and it is often the amount of rendering, not the DOM changes, that determines how fast a React page feels. The model’s real value is that it lets you write declarative code.",
      ],
    },
  ],
  mistakes: [
    {
      id: "changing-wrapper",
      heading: "Changing element types across a conditional",
      problem: "Rendering a Card in one branch and an Article in the other looks like a small visual change. Because the type differs, React throws away the subtree, including its state, focus, and scroll position.",
      correction: "Keep the same type and change props, or accept that this is a deliberate reset.",
    },
    {
      id: "nested-types",
      heading: "Creating a component type during rendering",
      problem: "A function or lazy component declared inside a component is a new type each render, so React sees a different component at that position, and it remounts it every time, losing state and DOM.",
      correction: "Declare components at the module level.",
    },
    {
      id: "index-reorder",
      heading: "Using index keys on reorderable lists",
      problem: "React matches by key, so an index means each position keeps its instance while the data moves. Inputs keep their text at the old position, and every row re-renders with different content.",
      correction: "Use a stable ID from the data.",
    },
    {
      id: "random-keys-identity",
      heading: "Generating keys during rendering",
      problem: "New keys each render tell React that nothing is the same, so it destroys and re-creates every item. That wipes state, loses focus, and costs far more than a normal update.",
      correction: "Keep keys with the data, and create them only once.",
    },
    {
      id: "algorithm-reliance",
      heading: "Depending on internal diffing details",
      problem: "Code written around how the algorithm happens to behave today, such as relying on a particular reuse, can break in a later version, because the details are not a guaranteed API.",
      correction: "Rely on the documented rules of type, position, and key.",
    },
  ],
  interview: [
    {
      id: "ri-what",
      question: "What is reconciliation?",
      answer: "It is how React compares the new element tree with the previous result to decide what to keep and what to change. At each position it asks whether this is the same component, using type, position, and key, and it updates or replaces accordingly.",
    },
    {
      id: "ri-type-change",
      question: "What happens when a component’s type changes at the same position?",
      answer: "React destroys the old instance and its whole subtree, including state and DOM, and creates a new one. This also applies when a wrapper element changes, such as section to div, which resets all the state beneath it.",
    },
    {
      id: "ri-keys",
      question: "How do keys affect reconciliation?",
      answer: "Among siblings, React matches children by key instead of order. So moved items keep their instances and DOM. A different key at one position means a new instance. That is why keys must be stable and unique among siblings.",
    },
    {
      id: "ri-identity",
      question: "How can you use identity deliberately?",
      answer: "Change a key to reset a component, which is often better than clearing state in an Effect. Keep the same type and position to preserve state across layout changes. And keep component definitions at module level, so types stay stable.",
    },
    {
      id: "ri-vdom",
      question: "Does the Virtual DOM make React fast?",
      answer: "Not by itself. It enables declarative code by letting React work out the changes, but comparing has a cost. Direct DOM updates can be faster for a specific case. Real performance depends on how much you render and how much code you ship.",
    },
    {
      id: "ri-remount",
      question: "A component keeps losing its state on every keystroke. What would you check?",
      answer: "Whether it is defined inside another component, which creates a new type on each render. Then whether its key changes, or whether a parent’s element type or position is changing across renders. Each of those makes React see a different instance.",
    },
    {
      id: "ri-perf-keys",
      question: "How can keys affect performance?",
      answer: "Stable keys let React reuse existing DOM when items move, while unstable ones force it to re-create them. Index keys cause each row to re-render with new content after an insert at the start. On a long list, that can be a significant cost.",
    },
  ],
  takeaways: [
    "Reconciliation decides what to keep by comparing type, position, and key.",
    "A different type discards the whole subtree.",
    "Keys match siblings by identity rather than order.",
    "The Virtual DOM enables declarative code, and it does not guarantee speed.",
  ],
  quickReview: {
    definition: "Reconciliation is how React matches each new element to the previous tree, using type, position, and key.",
    keyPoints: [
      "Same type and position means the same instance.",
      "A different type resets everything beneath it.",
      "A different key means a different instance.",
      "Internal algorithm details are not part of the API.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Identity through a key",
      language: "tsx",
      code: `function Editor({ docId }: { docId: string }) {
  return <p>Editing {docId}</p>;
}

export default function Page({ docId }: { docId: string }) {
  return <Editor key={docId} docId={docId} />;
}`,
      description: "A new docId means a new instance, so its state starts fresh.",
    },
    commonMistakes: [
      "Switching element types across branches.",
      "Defining components during rendering.",
      "Using index keys on reorderable lists.",
    ],
    interviewTrap: "“Does the Virtual DOM guarantee good performance?” No. It makes declarative code practical, while comparing still has a cost.",
    takeaway: "Think in identity: same type, same place, same key, same instance.",
  },
  sources: [
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
  ],
};
