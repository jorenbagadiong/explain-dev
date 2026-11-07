import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "why-keys-exist",
      heading: "Why keys exist",
      paragraphs: [
        "When a list changes, React needs to work out which item is which between renders. Items can be inserted, removed, or reordered, and position alone cannot tell React that the third item is now the second.",
        "A key gives each item an identity. Think of files in a folder: you refer to a file by name rather than by its position, because the position changes as the folder changes. With keys, React can move, keep, or remove the right component and its state.",
      ],
    },
    {
      id: "rules-of-keys",
      heading: "The rules of keys",
      paragraphs: ["Two rules cover nearly all key decisions."],
      list: [
        "Unique among siblings. Keys only need to be unique within one array, so the same key can appear in a different list.",
        "Stable across renders. A key must stay with its item, which means it cannot be generated while rendering.",
      ],
      closing: "Good sources are database IDs, or for data created locally, a counter or crypto.randomUUID() called when the item is created.",
    },
    {
      id: "index-as-key",
      heading: "Why the array index is usually a poor key",
      paragraphs: [
        "If you pass no key, React falls back to the index. That is fine for a static list that never changes order. When items can be inserted or reordered, though, the index follows the position rather than the item, so React matches the wrong components together.",
        "The result is a subtle bug: state such as typed text stays at its position while the data moves. Random keys are worse, because every render produces a new key, so React destroys and re-creates everything, losing input and doing unnecessary work.",
      ],
      examples: [
        {
          id: "stable-keys",
          classification: "complete",
          title: "Stable keys keep state with the right item",
          language: "tsx",
          code: `import { useState } from "react";

interface Note {
  id: string;
  title: string;
}

function NoteRow({ title }: { title: string }) {
  const [draft, setDraft] = useState("");

  return (
    <li>
      <label>
        {title}
        <input value={draft} onChange={event => setDraft(event.target.value)} />
      </label>
    </li>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState<readonly Note[]>([
    { id: "groceries", title: "Groceries" },
    { id: "errands", title: "Errands" },
  ]);

  return (
    <>
      <button type="button" onClick={() => setNotes(previous => [...previous].reverse())}>
        Reverse
      </button>
      <ul>
        {notes.map(note => (
          <NoteRow key={note.id} title={note.title} />
        ))}
      </ul>
    </>
  );
}`,
          description: "The IDs belong to the data and never change. Reversing the list moves each row with its draft text. With key={index}, the text would stay in place while the titles swapped.",
        },
      ],
    },
    {
      id: "keys-and-identity",
      heading: "Keys are identity, not only a list requirement",
      paragraphs: [
        "A key is not passed to your component as a prop. React reads it for its own bookkeeping, so if the component needs the value, pass it separately, as in <Row key={id} rowId={id} />.",
        "Keys also work outside lists. Because a different key means a different identity, you can use one to reset a component on purpose. Giving a form key={userId} makes React create a fresh form when the user changes.",
      ],
      examples: [
        {
          id: "key-reset",
          classification: "complete",
          title: "Resetting state with a key",
          language: "tsx",
          code: `import { useState } from "react";

function MessageDraft({ recipient }: { recipient: string }) {
  const [text, setText] = useState("");

  return (
    <label>
      Message to {recipient}
      <textarea value={text} onChange={event => setText(event.target.value)} />
    </label>
  );
}

export default function Chat({ recipient }: { recipient: string }) {
  return <MessageDraft key={recipient} recipient={recipient} />;
}`,
          description: "Changing the recipient changes the key, so React discards the old draft instead of carrying it over to the wrong person.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "index-on-dynamic-list",
      heading: "Using the index as a key on a list that changes",
      problem: "It silences the warning, so it seems solved. But after a reorder or an insert, the index points to a different item, and any state or focus inside the row stays with the position rather than the data.",
      correction: "Use an ID from the data. Keep the index only for static lists that never reorder or change length.",
    },
    {
      id: "random-keys",
      heading: "Generating keys during rendering",
      problem: "key={Math.random()} also removes the warning, but the key differs on every render. React sees all new items each time, so it destroys and re-creates the components and DOM, which is slow and loses input.",
      correction: "Generate an ID once, when the item is created, and store it with the data.",
    },
    {
      id: "globally-unique",
      heading: "Assuming keys must be globally unique",
      problem: "Teams sometimes prefix keys with list names or add libraries to guarantee global uniqueness. This is unnecessary, because a key only identifies a child within its parent, and two different lists can reuse the same one.",
      correction: "Make sure keys are unique among siblings, and use your data’s natural identifiers.",
    },
    {
      id: "reading-key-prop",
      heading: "Reading key inside the child",
      problem: "props.key is always undefined in the child, because React keeps key for itself. Code that relies on it fails quietly, often showing as missing IDs in event handlers.",
      correction: "Pass the same value again under a different prop name.",
    },
  ],
  interview: [
    {
      id: "what-keys-do",
      question: "What does a key do in React?",
      answer: "It gives an element an identity among its siblings, so React can match it to the previous render. That lets React keep, move, or remove the right component with its state and DOM when a list changes, rather than comparing by position.",
    },
    {
      id: "index-bug",
      question: "Why can using the array index as a key cause bugs?",
      answer: "The index describes position rather than identity. If you insert or reorder items, each position now holds different data, but React reuses the component that was there, so state such as input text appears attached to the wrong row.",
    },
    {
      id: "when-index-ok",
      question: "Is it ever acceptable to use the index as a key?",
      answer: "Yes, when the list is static: it never reorders, has nothing inserted or removed in the middle, and items have no state of their own. In that situation position and identity never diverge, so index keys cause no problem.",
    },
    {
      id: "random-key-effect",
      question: "What happens if you use Math.random() as a key?",
      answer: "Each render produces new keys, so React treats every item as new. It unmounts the old components and mounts new ones, losing state and focus and re-creating DOM nodes. It hides the warning while making the behavior worse.",
    },
    {
      id: "key-reset-use",
      question: "How can a key be used outside of a list?",
      answer: "To reset a component deliberately. Changing its key gives it a new identity, so React discards the old instance’s state and DOM. A common case is keying a form by the record it edits, which is simpler than resetting fields in an Effect.",
    },
    {
      id: "key-scope",
      question: "Do keys have to be unique across the whole application?",
      answer: "No, only among siblings in the same array or parent. Different lists can use the same key values, because React only compares a child against other children of that parent.",
    },
  ],
  takeaways: [
    "Keys give list items an identity across renders.",
    "A key must be unique among siblings and stable over time.",
    "Index keys are safe only for static lists.",
    "Changing a key deliberately resets a component.",
  ],
  quickReview: {
    definition: "A key is a stable identifier that lets React match a child to the same child in the previous render.",
    keyPoints: [
      "Unique among siblings, not globally.",
      "Created with the data, never generated during rendering.",
      "Not passed to the component as a prop.",
      "A new key means a new instance, with fresh state.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A key from the data",
      language: "tsx",
      code: `export default function Rows({ rows }: { rows: readonly { id: string; label: string }[] }) {
  return <ol>{rows.map(row => <li key={row.id}>{row.label}</li>)}</ol>;
}`,
      description: "The key comes from the item, so it stays with the item when order changes.",
    },
    commonMistakes: [
      "Using the index on a list that reorders.",
      "Calling Math.random() or crypto.randomUUID() while rendering a key.",
      "Expecting to read props.key in the child.",
    ],
    interviewTrap: "“Does a key fix the warning, so any unique value will do?” No. It must also be stable, because a key that changes each render forces React to re-create the item.",
    takeaway: "A key answers one question for React: is this the same item as last time?",
  },
  sources: [
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
  ],
};
