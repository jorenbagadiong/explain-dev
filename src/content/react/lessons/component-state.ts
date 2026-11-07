import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "why-state-exists",
      heading: "Why regular variables are not enough",
      paragraphs: [
        "A component often needs to remember something: the current slide, the text in a field, or whether a menu is open. A local variable cannot do this, for two reasons. It is created fresh on every render, so changes are lost, and changing it does not tell React to render again.",
        "State solves both problems. It gives a component memory that lasts between renders, and updating it asks React to render with the new value.",
      ],
      examples: [
        {
          id: "gallery-state",
          classification: "complete",
          title: "Remembering a value between renders",
          language: "tsx",
          code: `import { useState } from "react";

const slides = ["Mountains", "Rivers", "Islands"];

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const hasNext = index < slides.length - 1;

  return (
    <section>
      <h2>{slides[index]}</h2>
      <button type="button" disabled={!hasNext} onClick={() => setIndex(index + 1)}>
        Next
      </button>
    </section>
  );
}`,
          description: "The index survives between renders, and setIndex requests the next one. hasNext is calculated from state rather than being stored, because it can always be worked out.",
        },
      ],
    },
    {
      id: "what-belongs-in-state",
      heading: "What belongs in state",
      paragraphs: [
        "Not every value needs to be state. A short test helps: state is information that changes over time, cannot be worked out from anything else, and affects what the component displays.",
      ],
      comparison: [
        {
          id: "is-state",
          title: "Usually state",
          items: ["Text the user has typed.", "Which tab or row is selected.", "Whether a panel is open."],
        },
        {
          id: "not-state",
          title: "Usually not state",
          items: ["Values that never change.", "Anything received as a prop.", "Anything calculable from existing props or state, such as a list’s length."],
        },
      ],
      closing: "A value that must be remembered but does not affect the output, such as a timer ID, fits a ref better than state.",
    },
    {
      id: "state-is-local",
      heading: "State is private to each instance",
      paragraphs: [
        "State belongs to one instance of a component at one position on the screen. Render the same component twice, and each has its own independent copy. A parent cannot read or change a child’s state.",
        "To keep two components in step, you do not synchronize their state. You move it up to their closest shared parent and pass it down.",
      ],
      examples: [
        {
          id: "independent-instances",
          classification: "complete",
          title: "Two independent copies",
          language: "tsx",
          code: `import { useState } from "react";

function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(previous => previous + 1)}>
      {label}: {count}
    </button>
  );
}

export default function Scoreboard() {
  return (
    <>
      <Counter label="Home" />
      <Counter label="Away" />
    </>
  );
}`,
          description: "Clicking Home does not affect Away, because each instance holds its own count.",
        },
      ],
    },
    {
      id: "how-react-tracks-state",
      heading: "How React knows which state is which",
      paragraphs: [
        "useState receives no name. React identifies each call by its order within the component, keeping a list of state values for each instance and moving through that list as each Hook is called during a render.",
        "This is why Hooks have to be called at the top level, in the same order every time. A useState inside a condition would shift every later call onto the wrong value. The Rules of Hooks and the lint rule that enforces them exist because of this design.",
      ],
    },
  ],
  mistakes: [
    {
      id: "local-variable",
      heading: "Using a local variable for a value that changes",
      problem: "let count = 0 with count += 1 in a handler looks reasonable, and the variable really does change. But no render is requested, so the screen does not update, and the next render resets it to 0 anyway.",
      correction: "Use useState for any value that must persist and appear on screen.",
    },
    {
      id: "state-for-everything",
      heading: "Putting every value in state",
      problem: "Storing a filtered list or a full name as state adds a second copy of information you already have. Each handler then has to keep them in step, and one missed update shows stale data.",
      correction: "Keep the minimum state, and calculate the rest while rendering.",
    },
    {
      id: "conditional-hook",
      heading: "Calling useState conditionally",
      problem: "Declaring state only when it seems needed changes the order of Hook calls between renders. React then matches values to the wrong calls, and it reports an error such as rendered fewer hooks than expected.",
      correction: "Call every Hook at the top level, above any early return, and vary what you do with the value instead.",
    },
    {
      id: "assuming-shared",
      heading: "Assuming two instances share state",
      problem: "A developer may expect two copies of a component to stay in step because they have the same code. They do not, since each instance holds its own state, so one can change while the other stays as it was.",
      correction: "Lift the value to their common parent when they must agree.",
    },
  ],
  interview: [
    {
      id: "what-is-state",
      question: "What is state in React?",
      answer: "State is a component instance’s memory. It persists between renders, and updating it through the setter requests a new render with the new value. It is private to that instance and is used for information that changes and affects the output.",
    },
    {
      id: "state-vs-variable",
      question: "Why can’t a regular variable replace state?",
      answer: "A local variable is re-created on each render, so its changes do not last. Changing it also does not notify React, so nothing re-renders. State addresses both by being retained by React and by requesting a render when set.",
    },
    {
      id: "state-or-not",
      question: "How do you decide whether something should be state?",
      answer: "I ask three things. Does it change over time? Is it not passed in as a prop? Is it impossible to calculate from existing state or props? Only if the answers are yes should it be state, and if it does not affect output, a ref may fit better.",
    },
    {
      id: "hook-order",
      question: "How does React match a useState call to its value without a name?",
      answer: "By call order. For each instance, React keeps a list of Hook values and advances through it during a render. This is the reason Hooks must be called unconditionally at the top level, so the order stays the same across renders.",
    },
    {
      id: "two-instances",
      question: "What happens to state if you render a component twice?",
      answer: "Each instance gets independent state tied to its position in the tree. Changing one has no effect on the other, and a parent cannot reach into either one. Coordinating them means moving the state to a shared parent.",
    },
  ],
  takeaways: [
    "State is memory that lasts between renders and requests a new render when changed.",
    "Keep only what changes and cannot be calculated from something else.",
    "Each component instance has its own private state.",
    "React matches state by call order, so Hooks stay at the top level.",
  ],
  quickReview: {
    definition: "State is per-instance memory, retained by React, whose updates request a new render.",
    keyPoints: [
      "useState returns the current value and a setter.",
      "State is private, and each instance has its own.",
      "Derived values do not belong in state.",
      "Hook order must be the same on every render.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Declaring state",
      language: "tsx",
      code: `import { useState } from "react";

export default function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button type="button" aria-pressed={isOn} onClick={() => setIsOn(previous => !previous)}>
      {isOn ? "On" : "Off"}
    </button>
  );
}`,
      description: "One piece of state, with the output calculated from it.",
    },
    commonMistakes: [
      "Using let for a value that should persist and update the screen.",
      "Storing values that could be calculated.",
      "Calling useState inside a condition.",
    ],
    interviewTrap: "“Can a parent read its child’s state?” No. State is private to the instance. Move it to the parent if both need it.",
    takeaway: "Ask what the component truly has to remember, and store only that.",
  },
  sources: [
    { label: "State: A Component’s Memory", href: "https://react.dev/learn/state-a-components-memory" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Choosing the State Structure", href: "https://react.dev/learn/choosing-the-state-structure" },
  ],
};
