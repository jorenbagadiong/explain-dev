import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-prop-drilling-is",
      heading: "What prop drilling is",
      paragraphs: [
        "Prop drilling is passing a prop through components that do not use it, only to reach one further down. It happens naturally when state lifts high up, because the nearest common parent may be far from what needs the value.",
        "It is not automatically a problem. Explicit props make it obvious which components use which data, and that clarity is valuable. It becomes a problem when the layers are many, or when refactoring means editing every component on the path.",
      ],
      examples: [
        {
          id: "drilling-example",
          classification: "complete",
          title: "A prop travelling through a layer",
          language: "tsx",
          code: `function Avatar({ userName }: { userName: string }) {
  return <p>{userName}</p>;
}

function Header({ userName }: { userName: string }) {
  // Header only passes this along.
  return (
    <header>
      <Avatar userName={userName} />
    </header>
  );
}

export default function Page({ userName }: { userName: string }) {
  return <Header userName={userName} />;
}`,
          description: "Header does nothing with userName except forward it. One layer like this is fine, and the question is what happens as more appear.",
        },
      ],
    },
    {
      id: "try-composition-first",
      heading: "Try composition first",
      paragraphs: [
        "Often the real issue is the component structure. If an intermediate component only forwards data, let it accept children instead. The value then goes directly from where it lives to where it is used, with no new concepts involved.",
      ],
      examples: [
        {
          id: "composition-fix",
          classification: "complete",
          title: "Removing the layer with children",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Avatar({ userName }: { userName: string }) {
  return <p>{userName}</p>;
}

function Header({ children }: { children: ReactNode }) {
  return <header>{children}</header>;
}

export default function Page({ userName }: { userName: string }) {
  return (
    <Header>
      <Avatar userName={userName} />
    </Header>
  );
}`,
          description: "Header no longer knows about userName at all. The data flow is still explicit, and adding a second value there would not touch Header.",
        },
      ],
    },
    {
      id: "when-context-fits",
      heading: "When context fits",
      paragraphs: [
        "Context suits data needed by many components at different depths, such as a theme or the current account. It removes the passing, but it adds an implicit dependency: a component reading context needs a provider, and reading its code alone will not show where the value comes from.",
      ],
      examples: [
        {
          id: "context-fix",
          classification: "complete",
          title: "Context for widely used data",
          language: "tsx",
          code: `import { createContext, useContext } from "react";

const UserContext = createContext("Guest");

function Avatar() {
  const userName = useContext(UserContext);

  return <p>{userName}</p>;
}

function Header() {
  return (
    <header>
      <Avatar />
    </header>
  );
}

export default function Page({ userName }: { userName: string }) {
  return (
    <UserContext value={userName}>
      <Header />
    </UserContext>
  );
}`,
          description: "This suits values many components need. For one value in one place, composition or a prop is simpler.",
        },
      ],
    },
    {
      id: "choosing",
      heading: "Choosing an approach",
      paragraphs: [
        "Work through the options from simplest to most indirect, and stop at the first that works well.",
      ],
      visual: {
        heading: "From simple to indirect",
        context: "Each step adds more indirection than the one before it.",
        steps: [
          { id: "props", title: "Pass props", description: "Clear and explicit. Fine for a few levels." },
          { id: "compose", title: "Use children or slots", description: "Removes layers that only forward data." },
          { id: "move", title: "Move the state", description: "State may be lifted too high, so it could live closer to its users." },
          { id: "context", title: "Use context", description: "For values many components need across the tree." },
          { id: "store", title: "Use an external store", description: "For complex, frequently changing shared state with subscriptions." },
        ],
        note: "These are not ranked by quality. Each trades explicitness for less wiring, and many applications use several.",
      },
    },
  ],
  mistakes: [
    {
      id: "context-reflex",
      heading: "Using context as soon as drilling appears",
      problem: "Two levels of forwarding feel repetitive, so context seems cleaner. But it hides the dependency, and a component now needs a provider to work, which makes it harder to reuse and to test on its own.",
      correction: "Pass props or restructure with children, and adopt context when those stop working well.",
    },
    {
      id: "global-store-reflex",
      heading: "Adding a global store to avoid passing props",
      problem: "A state library removes drilling, but it brings its own concepts and makes local state global. Many values that seemed to need sharing could have lived lower in the tree all along.",
      correction: "Check state placement first, and add a store when the problem is genuinely shared, changing state.",
    },
    {
      id: "spread-to-hide",
      heading: "Hiding drilling with prop spreading",
      problem: "{...props} removes the visible wiring, but the data still flows through every layer. Now readers cannot see what is passed, and unrelated props can reach a DOM element by accident.",
      correction: "Name what each component needs, or remove the layer through composition.",
    },
    {
      id: "state-too-high-drilling",
      heading: "Keeping state too high",
      problem: "State lifted further than needed forces it through components that never use it. The drilling is a symptom here, and it is often accompanied by whole-page re-renders on small changes.",
      correction: "Move the state down to the lowest common parent of the components that read it.",
    },
    {
      id: "fearing-all-props",
      heading: "Treating all prop passing as a problem",
      problem: "Treating two or three levels as a code smell leads to premature indirection. Explicit props are simple to follow in an editor, and they make a component’s needs visible in its signature.",
      correction: "Accept some prop passing, and act only when it actually slows you down.",
    },
  ],
  interview: [
    {
      id: "pd-what",
      question: "What is prop drilling?",
      answer: "Passing props through components that do not use them, in order to reach a component deeper in the tree. It often appears when state is lifted high. It is not always bad, because explicit props are easy to trace, but many layers make changes tedious.",
    },
    {
      id: "pd-alternatives",
      question: "What are the alternatives to prop drilling?",
      answer: "Composition with children or slots, which skips forwarding layers. Moving state closer to where it is used. Context for values many components read. An external store for complex shared state. I work through those in roughly that order.",
    },
    {
      id: "pd-composition-why",
      question: "Why try composition before context?",
      answer: "It solves the problem without adding a new dependency, so data flow stays explicit and components stay reusable. Context adds an implicit requirement for a provider and re-renders every reader on a change. Composition has neither cost.",
    },
    {
      id: "pd-context-when",
      question: "When is context the right answer?",
      answer: "When many components at different depths need the same value, such as a theme or the current user, and passing it through every layer would touch much of the tree. Rapidly changing values need more care, because each change re-renders all readers.",
    },
    {
      id: "pd-downside-context",
      question: "What are the downsides of replacing props with context?",
      answer: "Dependencies become hidden, because a component’s signature no longer shows what it needs. It requires a provider, which affects reuse and testing. Updates re-render every reader, so one big context can cause broad re-rendering.",
    },
    {
      id: "pd-symptom",
      question: "Can prop drilling be a symptom of something else?",
      answer: "Yes. It often points to state placed higher than necessary, or to intermediate components that should accept children instead. Fixing that structure removes the drilling and sometimes improves rendering too, without any new tool.",
    },
  ],
  takeaways: [
    "Prop drilling is forwarding props through components that do not use them.",
    "Some prop passing is healthy, because it is explicit.",
    "Try composition and moving state before context.",
    "Each step up adds convenience in exchange for less visible data flow.",
  ],
  quickReview: {
    definition: "Prop drilling is passing a prop through layers that do not use it, to reach a deeper component.",
    keyPoints: [
      "It is a tradeoff rather than an automatic flaw.",
      "children can remove forwarding layers entirely.",
      "Context adds an implicit dependency on a provider.",
      "Drilling may mean state is placed too high.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Skipping a layer",
      language: "tsx",
      code: `import type { ReactNode } from "react";

function Shell({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}

export default function App({ user }: { user: string }) {
  return (
    <Shell>
      <p>Hello, {user}</p>
    </Shell>
  );
}`,
      description: "Shell never receives user, because App passes it straight to where it is used.",
    },
    commonMistakes: [
      "Adopting context at the first sign of forwarding.",
      "Hiding drilling behind prop spreading.",
      "Keeping state higher than it needs to be.",
    ],
    interviewTrap: "“Is prop drilling always bad?” No. Explicit props are easy to trace. The cost grows with depth and how often that path changes.",
    takeaway: "Start with props, restructure next, and add indirection only when it earns its place.",
  },
  sources: [
    { label: "Passing Data Deeply with Context", href: "https://react.dev/learn/passing-data-deeply-with-context" },
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
  ],
};
