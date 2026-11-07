import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-lifting-means",
      heading: "What lifting state up means",
      paragraphs: [
        "Lifting state up means removing state from child components, moving it to their closest common parent, and passing it back down as props. It is how you make two components change together.",
        "Picture an accordion with two panels, each tracking its own open flag. Opening one cannot close the other, because neither one knows about the other. The rule that only one may be open belongs to their parent.",
      ],
    },
    {
      id: "three-steps",
      heading: "The three steps",
      paragraphs: ["Lifting state follows a small, repeatable process."],
      visual: {
        heading: "Lifting state, step by step",
        context: "The accordion moves from independent panels to one owner.",
        steps: [
          { id: "remove", title: "Remove state from the children", description: "isActive stops being state in Panel and becomes a prop." },
          { id: "hardcode", title: "Pass values down from the parent", description: "Hard-coded values first confirm the props are wired correctly." },
          { id: "add-state", title: "Add state to the parent", description: "The parent holds the state and passes it down along with handlers." },
        ],
        note: "A parent can often use a better shape than its children did. One activeIndex enforces the only-one-open rule, which two booleans could not.",
      },
      examples: [
        {
          id: "accordion",
          classification: "complete",
          title: "An accordion with lifted state",
          language: "tsx",
          code: `import { useState, type ReactNode } from "react";

interface PanelProps {
  title: string;
  isActive: boolean;
  onShow: () => void;
  children: ReactNode;
}

function Panel({ title, isActive, onShow, children }: PanelProps) {
  return (
    <section>
      <h3>{title}</h3>
      {isActive ? <p>{children}</p> : (
        <button type="button" onClick={onShow}>
          Show {title}
        </button>
      )}
    </section>
  );
}

export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <Panel title="About" isActive={activeIndex === 0} onShow={() => setActiveIndex(0)}>
        A short introduction.
      </Panel>
      <Panel title="Details" isActive={activeIndex === 1} onShow={() => setActiveIndex(1)}>
        A longer explanation.
      </Panel>
    </>
  );
}`,
          description: "Panel no longer holds state. Its output is decided entirely by props, and it reports clicks through onShow. Storing an index means two panels can never be open at once.",
        },
      ],
    },
    {
      id: "controlled-by-the-parent",
      heading: "What changes for the child",
      paragraphs: [
        "A component driven by its own state is often called uncontrolled, and one driven by props is called controlled. Lifting state makes a child controlled: it becomes simpler but needs its parent to configure it.",
        "These are design terms rather than strict categories. Most components mix local state with props, and you can always change your mind later.",
      ],
      comparison: [
        {
          id: "before-lift",
          title: "Child holds the state",
          items: ["Easier to drop in, with little configuration.", "Cannot be coordinated from outside.", "State resets when the child is removed."],
        },
        {
          id: "after-lift",
          title: "Parent holds the state",
          items: ["Fully coordinated with its siblings.", "Requires props and handlers.", "State survives if the child is removed."],
        },
      ],
    },
    {
      id: "when-not-to-lift",
      heading: "When not to lift",
      paragraphs: [
        "Lifting has a cost. The parent re-renders on each change, and the props add wiring. Do not lift state only because some other component might need it one day. Leave it local until a real need appears.",
        "If lifting means passing a value through many layers that do not use it, consider passing JSX as children first, and consider context when many distant components need the same value.",
      ],
    },
  ],
  mistakes: [
    {
      id: "keeping-both",
      heading: "Leaving state in the child after lifting",
      problem: "Adding state to the parent while the child keeps its own copy creates two sources of truth. The child then shows its local value while the parent believes something else.",
      correction: "Remove the child’s state completely, and read from props.",
    },
    {
      id: "lifting-too-far",
      heading: "Lifting higher than necessary",
      problem: "Moving state all the way to the app root is simple to write, but every keystroke now re-renders a large part of the tree, and many components carry props they do not use.",
      correction: "Lift only to the closest common parent of the components that use the value.",
    },
    {
      id: "passing-setter-blindly",
      heading: "Exposing a raw setter when an action would be clearer",
      problem: "Passing setActiveIndex down lets a child set any value, including invalid ones, and it ties the child to the parent’s state shape. A later change of that shape then breaks every child.",
      correction: "Pass a purpose-named handler, such as onShow, and let the parent decide what it means.",
    },
    {
      id: "lifting-booleans",
      heading: "Lifting state without reconsidering its shape",
      problem: "Moving two independent booleans to the parent keeps the possibility that both are true. The move fixed ownership, but the invalid combination remains representable.",
      correction: "Choose a shape that fits the rule, such as a single activeIndex.",
    },
  ],
  interview: [
    {
      id: "lifting-definition",
      question: "What does it mean to lift state up?",
      answer: "It means moving state from child components to their closest common parent, then passing the value and handlers back down as props. It is how React shares state while keeping one source of truth.",
    },
    {
      id: "lifting-example",
      question: "When would you lift state up?",
      answer: "When two or more components must reflect or change the same information, such as an accordion where only one panel opens, or a filter input and its list. If only one component uses it, I would leave it where it is.",
    },
    {
      id: "child-updates",
      question: "How does a child update state that lives in its parent?",
      answer: "The parent passes a handler as a prop, and the child calls it from its own event handler. The child never touches the state directly. This keeps the logic that decides what changes in the owner.",
    },
    {
      id: "cost-of-lifting",
      question: "What are the downsides of lifting state?",
      answer: "The parent and its subtree re-render on each change, and more props must be passed. Lifting too high can make simple updates costly or lead to prop drilling. Good placement and composition usually address both.",
    },
    {
      id: "controlled-term",
      question: "What does it mean to say a component is controlled?",
      answer: "Its important values come from props rather than its own state, so the parent fully determines its behavior. It is a design description rather than a strict category, and a single component can have both controlled and local parts.",
    },
    {
      id: "better-shape",
      question: "Why might lifted state have a different shape from the original?",
      answer: "The parent sees the whole picture, so it can model the real rule. Two booleans allow both panels open, while one active index makes that impossible. Lifting is a good moment to remove invalid states.",
    },
  ],
  takeaways: [
    "Remove state from the children, add it to the common parent, and pass it down.",
    "Children report changes through handlers from the parent.",
    "Lift only as far as needed, and only when a real need exists.",
    "Reconsider the state’s shape when you lift it.",
  ],
  quickReview: {
    definition: "Lifting state up moves state to the closest common parent, which passes values and handlers down to the children.",
    keyPoints: [
      "Children become controlled by props.",
      "A handler prop lets children ask for changes.",
      "The closest common parent is usually far enough.",
      "A better shape can remove impossible combinations.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A controlled child",
      language: "tsx",
      code: `function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={isOn} onClick={onToggle}>
      {isOn ? "On" : "Off"}
    </button>
  );
}

export default Toggle;`,
      description: "No state inside: the parent decides the value and what toggling does.",
    },
    commonMistakes: [
      "Keeping a copy in the child after lifting.",
      "Lifting all the way to the root by default.",
      "Passing raw setters when a named action would be clearer.",
    ],
    interviewTrap: "“Should you lift state just in case?” No. Lifting has costs, so do it when a real need exists. It is easy to move state later.",
    takeaway: "Lift state to where the rule that governs it lives, and no further.",
  },
  sources: [
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
  ],
};
