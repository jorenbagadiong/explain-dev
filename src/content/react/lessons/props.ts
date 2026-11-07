import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-props-are",
      heading: "What props are",
      paragraphs: [
        "Props are the information a parent passes to a child through JSX attributes. They look like HTML attributes, but they can hold any JavaScript value, including objects, arrays, and functions.",
        "Think of props as the arguments to a component. React collects them into one object and passes it as the function’s single parameter, which is why you usually destructure them in the signature.",
      ],
      examples: [
        {
          id: "typed-props",
          classification: "complete",
          title: "Passing and reading typed props",
          language: "tsx",
          code: `interface BadgeProps {
  label: string;
  tone?: "info" | "warning";
}

function Badge({ label, tone = "info" }: BadgeProps) {
  return <span className={"badge badge-" + tone}>{label}</span>;
}

export default function Toolbar() {
  return (
    <div>
      <Badge label="Draft" />
      <Badge label="Expiring soon" tone="warning" />
    </div>
  );
}`,
          description: "The interface documents the inputs, and TypeScript checks each use. The default value applies only when tone is missing or undefined, not when it is null or an empty string.",
        },
      ],
    },
    {
      id: "read-only-snapshots",
      heading: "Props are read-only snapshots",
      paragraphs: [
        "A component may receive different props over time, but it cannot change the ones it was given. Each render receives a new props object, which is a read-only snapshot for that moment, and the parent decides what the next one contains.",
        "This is what makes data flow easy to trace: to find out why a value changed, you look at the parent. When a component needs to change something itself in response to input, it uses state.",
      ],
      comparison: [
        {
          id: "props",
          title: "Props",
          items: ["Supplied by the parent.", "Read-only for the component receiving them.", "Change when the parent passes something new."],
        },
        {
          id: "state",
          title: "State",
          items: ["Owned by the component that declares it.", "Changed through its setter function.", "Remembered by React between renders."],
        },
      ],
    },
    {
      id: "children-and-forwarding",
      heading: "The children prop and forwarding props",
      paragraphs: [
        "Content nested inside a tag arrives in a prop called children. This lets a component act as a frame around content it knows nothing about, such as a card or a panel.",
        "Spread syntax, as in {...props}, forwards every prop to a child. It is useful for thin wrappers, but use it with restraint. If you spread everywhere, it becomes hard to see what a component actually receives, and splitting the component or passing children is often clearer.",
      ],
      examples: [
        {
          id: "children-prop",
          classification: "complete",
          title: "Wrapping arbitrary content with children",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function Dashboard() {
  return (
    <Card title="This week">
      <p>Three lessons finished.</p>
    </Card>
  );
}`,
          description: "Card decides the frame, and Dashboard decides what goes inside it. ReactNode is the type for anything React can render.",
        },
      ],
    },
    {
      id: "passing-functions",
      heading: "Passing functions as props",
      paragraphs: [
        "Data flows down through props, so a child cannot write to its parent’s values. When a child needs to report something, the parent passes a function, and the child calls it. By convention these props start with on, such as onSelect.",
      ],
      examples: [
        {
          id: "callback-prop",
          classification: "complete",
          title: "A child reporting up through a callback",
          language: "tsx",
          code: `import { useState } from "react";

function ChoiceButton({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}>
      {label}
    </button>
  );
}

export default function PlanPicker() {
  const [plan, setPlan] = useState("Free");

  return (
    <div>
      <p>Current plan: {plan}</p>
      <ChoiceButton label="Choose Pro" onSelect={() => setPlan("Pro")} />
    </div>
  );
}`,
          description: "The parent owns the state and decides what selecting means, and the button only announces that it was pressed.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "mutating-props",
      heading: "Assigning to a prop",
      problem: "Writing props.count += 1 treats a parent’s input as a local variable. Props are read-only, so this breaks the assumption that rendering is pure, and no render is requested, so the screen stays out of date.",
      correction: "Calculate a new local value, or call a callback so the parent can pass a different prop.",
    },
    {
      id: "copying-props-to-state",
      heading: "Copying a prop into state without a reason",
      problem: "useState(props.color) only reads the prop on the first render. If the parent later passes a different color, the child keeps showing the old one, and the two values have silently drifted apart.",
      correction: "Read the prop directly, which keeps it current. Copy it only when it is meant as an initial value, and name it to say so, such as initialColor.",
    },
    {
      id: "wrong-default",
      heading: "Expecting defaults to replace every empty value",
      problem: "A default such as size = 100 looks like a fallback for anything falsy. It only applies when the prop is missing or undefined, so size={null} and size={0} both skip it and can produce a surprising result.",
      correction: "Pass undefined when you want the default, or handle null and zero explicitly in the component.",
    },
    {
      id: "key-as-prop",
      heading: "Trying to read key or a misspelled prop",
      problem: "A child that reads props.key always gets undefined, because React reserves key for itself and does not pass it down. The failure is silent in plain JavaScript and looks like missing data.",
      correction: "Pass the value under a second name, as in <Row key={id} rowId={id} />. TypeScript props also catch misspelled names at compile time.",
    },
  ],
  interview: [
    {
      id: "what-are-props",
      question: "What are props, and how does a component receive them?",
      answer: "Props are inputs a parent passes through JSX attributes. React gathers them into a single object and passes it as the function’s only argument, and they can hold any value, including functions and JSX. Destructuring in the signature is the usual way to read them.",
    },
    {
      id: "why-immutable",
      question: "Why are props read-only?",
      answer: "The parent owns them. If children could change them, the same props could no longer produce the same output, and you could not trace a value from a single place. A child that needs to change something asks through a callback or keeps its own state.",
    },
    {
      id: "props-over-time",
      question: "If props are immutable, how can they change over time?",
      answer: "A component receives a new props object on each render. No individual object is modified. The parent renders with different values, and the child sees a new snapshot, so props are read-only per render rather than fixed forever.",
    },
    {
      id: "children-use",
      question: "What is the children prop, and when would you use it?",
      answer: "It holds whatever is nested inside a component’s tag. It is useful for frames such as cards, dialogs, and layouts, which render content without knowing what it is. This often removes the need to pass data through several layers.",
    },
    {
      id: "child-to-parent",
      question: "How does a child send information to its parent?",
      answer: "The parent passes a function as a prop, and the child calls it, often with a value. React has no built-in upward data flow, so this explicit callback is how a change travels up while state stays in the parent.",
    },
    {
      id: "spread-tradeoff",
      question: "What is the tradeoff of spreading props with {...props}?",
      answer: "It keeps thin wrappers short, but it hides what a component accepts and can forward attributes to a DOM element by accident. I use it for genuine pass-through wrappers and name the props explicitly everywhere else.",
    },
  ],
  takeaways: [
    "Props are inputs from a parent, and they can hold any JavaScript value.",
    "They are read-only snapshots, and a new render brings new props.",
    "Nested content arrives through the children prop.",
    "Children report upward by calling a function passed down as a prop.",
  ],
  quickReview: {
    definition: "Props are read-only inputs a parent passes to a child, received as a single object argument.",
    keyPoints: [
      "They can hold objects, functions, and JSX, not only strings.",
      "Defaults apply only to missing or undefined values.",
      "The children prop holds nested content.",
      "key is reserved by React and never reaches the component.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A typed prop with a default",
      language: "tsx",
      code: `export default function Price({ amount, currency = "PHP" }: { amount: number; currency?: string }) {
  return <p>{currency} {amount}</p>;
}`,
      description: "Destructured props with a type and a default value.",
    },
    commonMistakes: [
      "Mutating a prop instead of calculating a new value.",
      "Copying a prop into state, which stops following the parent.",
      "Assuming a default covers null or 0.",
    ],
    interviewTrap: "“Can props change?” A component cannot change the props it holds, but it can receive different ones on a later render. Read-only does not mean constant.",
    takeaway: "Treat props like function arguments: read them freely, and never write to them.",
  },
  sources: [
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
  ],
};
