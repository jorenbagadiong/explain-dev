import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "state-is-tied-to-position",
      heading: "State is tied to position in the tree",
      paragraphs: [
        "State does not live inside your component function. React holds it and associates it with where that component sits in the UI tree. Two instances at two positions have separate state, and removing a component destroys its state.",
        "So the question for whether state survives is not what your code looks like. It is whether the same component is at the same position after the next render.",
      ],
    },
    {
      id: "when-state-is-preserved",
      heading: "When state is preserved",
      paragraphs: [
        "If the same component type renders at the same position, React keeps its state, even when its props change. This holds across different branches of your code, because position in the tree matters, not position in the file.",
      ],
      examples: [
        {
          id: "same-position",
          classification: "complete",
          title: "Different branches, same position",
          language: "tsx",
          code: `import { useState } from "react";

function Counter({ isFancy }: { isFancy: boolean }) {
  const [score, setScore] = useState(0);

  return (
    <button type="button" className={isFancy ? "fancy" : "plain"} onClick={() => setScore(previous => previous + 1)}>
      Score: {score}
    </button>
  );
}

export default function Scoreboard() {
  const [isFancy, setIsFancy] = useState(false);

  return (
    <div>
      {isFancy ? <Counter isFancy={true} /> : <Counter isFancy={false} />}
      <label>
        <input type="checkbox" checked={isFancy} onChange={event => setIsFancy(event.target.checked)} />
        Use fancy styling
      </label>
    </div>
  );
}`,
          description: "It looks like two different counters, but both are a Counter at the first child position. Toggling the checkbox keeps the score.",
        },
      ],
    },
    {
      id: "when-state-resets",
      heading: "When state is reset",
      paragraphs: [
        "State resets when something at that position changes type, or when the component is removed. A different type at the same position destroys the old state, and that applies to the whole subtree. Changing a wrapper from section to div also resets everything inside it.",
      ],
      visual: {
        heading: "Does this render keep the state?",
        context: "Compare the previous render with the next one at a given position.",
        root: {
          id: "compare",
          title: "Same position in the tree?",
          description: "If not, the instance is new, and its state starts over.",
          children: [
            {
              id: "same-type",
              title: "Same component type?",
              description: "If not, the old instance and its subtree are destroyed.",
              children: [
                { id: "same-key", title: "Same key, or no key?", description: "If yes, state is preserved. If the key differs, the instance is new." },
              ],
            },
          ],
        },
        note: "This is a simplified decision path. List items are matched by key among their siblings rather than by index.",
      },
    },
    {
      id: "resetting-with-keys",
      heading: "Resetting state on purpose",
      paragraphs: [
        "Sometimes preserving is wrong. In a chat, a draft written to one person should not carry over to the next. There are two ways to reset: render at different positions, or give the component a key.",
        "A key gives the component its own identity. Components with different keys never share state, even at the same position. Keys are not globally unique, because they only identify a child within its parent.",
      ],
      examples: [
        {
          id: "reset-with-key",
          classification: "complete",
          title: "Resetting a draft per contact",
          language: "tsx",
          code: `import { useState } from "react";

function Draft({ contact }: { contact: string }) {
  const [text, setText] = useState("");

  return (
    <label>
      Message to {contact}
      <textarea value={text} onChange={event => setText(event.target.value)} />
    </label>
  );
}

export default function Messenger() {
  const [contact, setContact] = useState("Ana");

  return (
    <>
      <button type="button" onClick={() => setContact(contact === "Ana" ? "Ben" : "Ana")}>
        Switch contact
      </button>
      <Draft key={contact} contact={contact} />
    </>
  );
}`,
          description: "Without the key, the draft would carry across contacts. With it, each contact gets a fresh instance.",
        },
      ],
    },
    {
      id: "keeping-reset-state",
      heading: "Keeping state for removed components",
      paragraphs: [
        "If a component must disappear from view but its data should survive, you have a few options.",
      ],
      list: [
        "Lift the state above the component, so it outlives the child.",
        "Render everything and hide the inactive ones with CSS, which keeps the state but keeps the DOM too.",
        "Save it outside React, such as in browser storage, if it must survive a reload.",
      ],
    },
  ],
  mistakes: [
    {
      id: "nested-component-definition",
      heading: "Defining a component inside another",
      problem: "A function declared inside a component is a new function on each render, so React sees a different type at that position and destroys the state. A text field defined this way loses its text on every keystroke.",
      correction: "Declare components at the top level, and pass values through props.",
    },
    {
      id: "wrapper-changes",
      heading: "Changing a wrapper element conditionally",
      problem: "Rendering <section><Counter /></section> in one branch and <div><Counter /></div> in another looks like a harmless styling change. But the parent’s type changed, so the counter and everything below it are destroyed.",
      correction: "Keep the tree structure the same across branches, and change only attributes or classes.",
    },
    {
      id: "expecting-reset-on-prop-change",
      heading: "Expecting a prop change to reset state",
      problem: "A form receiving a new user prop keeps showing the old user’s edits, because the type and position are unchanged. A prop change never resets state on its own, so the old draft stays attached.",
      correction: "Add a key based on the user’s ID, so a new user gets a fresh instance.",
    },
    {
      id: "effect-reset",
      heading: "Resetting state with an Effect",
      problem: "An Effect that clears state when a prop changes works, but it first renders once with the stale state and then renders again. It also has to reset every field, and children’s state is not covered at all.",
      correction: "Use a key to reset the whole subtree in one step.",
    },
  ],
  interview: [
    {
      id: "where-state-tied",
      question: "What determines whether a component keeps its state between renders?",
      answer: "React associates state with a position in the tree. If the same component type stays at the same position, with the same key if any, the state is preserved. A change of type, position, or key destroys it.",
    },
    {
      id: "reset-how",
      question: "How do you reset a component’s state when a prop changes?",
      answer: "Give it a key derived from that prop. A new key tells React this is a different instance, so it discards the state and DOM of the old one and creates new ones. It is simpler and more complete than an Effect.",
    },
    {
      id: "nested-definition-state",
      question: "Why does a component defined inside another keep losing its state?",
      answer: "The inner function is re-created on each render, so React sees a new type at that position. A different type means the old instance is destroyed and a new one is mounted, so state and DOM are lost each time.",
    },
    {
      id: "same-position-puzzle",
      question: "Does {flag ? <Counter a /> : <Counter b />} preserve Counter’s state when flag changes?",
      answer: "Yes. Both branches produce the same type at the same position, and React only sees the result, not the conditional. Adding different keys, or rendering each in a different position, would make them separate.",
    },
    {
      id: "keep-when-hidden",
      question: "How would you keep a tab’s state while it is not displayed?",
      answer: "Lift the state above the tab, or keep the tab mounted and hide it with CSS. The tradeoff is that hidden DOM still costs memory. React’s Activity component can also hide a subtree while preserving its state, starting with React 19.2.",
    },
  ],
  takeaways: [
    "React ties state to position in the tree, not to your code.",
    "Same type at the same position keeps state.",
    "A different type or key destroys the state of the whole subtree.",
    "Use a key to reset state deliberately.",
  ],
  quickReview: {
    definition: "State belongs to a position in the UI tree, and it lasts as long as the same component type and key stay there.",
    keyPoints: [
      "Position in the tree matters, not position in the file.",
      "A prop change alone never resets state.",
      "A changed wrapper resets everything beneath it.",
      "Keys identify a child within its parent.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A key that resets state",
      language: "tsx",
      code: `function Form({ userId }: { userId: string }) {
  return <p>Editing {userId}</p>;
}

export default function Page({ userId }: { userId: string }) {
  return <Form key={userId} userId={userId} />;
}`,
      description: "Changing userId gives Form a fresh identity.",
    },
    commonMistakes: [
      "Declaring a component inside another component.",
      "Switching wrapper elements across branches.",
      "Resetting state with an Effect instead of a key.",
    ],
    interviewTrap: "“Do two <Counter /> tags in an if and an else have separate state?” Not if they render at the same position. React only sees the output.",
    takeaway: "Read state’s lifetime from the tree: same place, same type, same key, same state.",
  },
  sources: [
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
  ],
};
