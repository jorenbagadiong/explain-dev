import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "element-vs-component",
      heading: "Elements and components are different things",
      paragraphs: [
        "A component is a function you write. An element is the small object that describes what to render. When you write <Greeting name=\"Maria\" />, you are not calling Greeting. You are creating a description that says: render Greeting with these props.",
        "React decides when to call the function. Keeping this separation in mind explains a lot of React’s behavior, including why creating elements is cheap and why rendering can be skipped or restarted.",
      ],
      comparison: [
        {
          id: "component",
          title: "Component",
          items: ["A function you define, such as Greeting.", "Called by React while rendering.", "Returns elements."],
        },
        {
          id: "element",
          title: "Element",
          items: ["A plain object created by JSX.", "Holds a type, props, and optional key.", "Is an immutable description, not a DOM node."],
        },
      ],
    },
    {
      id: "what-jsx-creates",
      heading: "What JSX creates",
      paragraphs: [
        "JSX compiles to calls that create element objects. <Something /> refers to a value in scope, while <something /> refers to a built-in element named by a string. The resulting object’s type field records which of those it is.",
        "Creating an element does not call the component and does not create a DOM node. It only records an instruction, so React can look at it later. React also treats elements as immutable, and in development it freezes them to catch accidental changes.",
      ],
      examples: [
        {
          id: "create-element",
          classification: "complete",
          title: "JSX and createElement are equivalent",
          language: "tsx",
          code: `import { createElement } from "react";

function Greeting({ name }: { name: string }) {
  return <h2>Hello, {name}</h2>;
}

export const withJsx = <Greeting name="Maria" />;
export const withoutJsx = createElement(Greeting, { name: "Maria" });

// Neither line above has called Greeting yet.
export default function Page() {
  return <main>{withJsx}</main>;
}`,
          description: "Both constants hold an element whose type is the Greeting function. Greeting runs only if React renders that element, which here happens when Page is rendered.",
        },
      ],
    },
    {
      id: "from-element-to-screen",
      heading: "From an element to the screen",
      paragraphs: [
        "React starts from the element you hand to the root. It looks at the type. If the type is a component, React calls it and looks at the elements it returned, repeating the process. If the type is a built-in such as \"h2\", React knows what DOM node it needs.",
      ],
      visual: {
        heading: "How React resolves elements",
        context: "This follows one element until React knows what the screen should contain.",
        steps: [
          { id: "element", title: "You create an element", description: "JSX produces an object describing a component and its props." },
          { id: "call", title: "React calls the component", description: "While rendering, React calls the function with those props." },
          { id: "more-elements", title: "The component returns more elements", description: "React repeats the process until only built-in types remain." },
          { id: "dom", title: "React commits to the DOM", description: "The result determines which DOM changes are needed." },
        ],
        note: "This is a simplified model of a single render. React may call components at other times, and it may skip work it knows is unnecessary.",
      },
    },
    {
      id: "elements-as-values",
      heading: "Elements are ordinary values",
      paragraphs: [
        "Because an element is a value, you can store it in a variable, pass it as a prop, or return it conditionally. This is what makes composition through children and slot props possible.",
        "Elements can be nested inside other elements without being rendered yet. A parent can receive an element, decide where to place it, or decide not to use it at all.",
      ],
      examples: [
        {
          id: "elements-as-props",
          classification: "complete",
          title: "Passing an element as a prop",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Layout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

export default function Page() {
  const sidebar = <nav aria-label="Lessons">Lessons</nav>;

  return <Layout sidebar={sidebar}>Welcome</Layout>;
}`,
          description: "The nav element is created by Page and placed by Layout, which never needs to know what it contains.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "element-is-dom",
      heading: "Assuming an element is a DOM node",
      problem: "Treating <div /> as a real node leads to attempts to read its size or call DOM methods on it. The element is only a plain description, and no DOM node exists for it at the point it is created.",
      correction: "Use a ref when you genuinely need the DOM node, and read it after React has committed.",
    },
    {
      id: "jsx-calls-component",
      heading: "Assuming JSX calls the component immediately",
      problem: "It is easy to expect a log inside a component to run when its JSX line runs. It runs later, when React renders the element, and it does not run at all if that element is never placed in the output.",
      correction: "Think of JSX as describing work for React. If you need to confirm a component ran, check what was actually rendered.",
    },
    {
      id: "mutating-elements",
      heading: "Changing an element after creating it",
      problem: "Assigning to element.props looks like a quick way to adjust output. Elements are meant to be immutable, and React freezes them in development, so the change fails or leads to inconsistent results.",
      correction: "Create a new element with the values you want, usually by passing different props when you write the JSX.",
    },
  ],
  interview: [
    {
      id: "element-vs-component-q",
      question: "What is the difference between a React element and a component?",
      answer: "A component is a function you define. An element is a lightweight, immutable object describing what to render, with a type and props. Writing JSX creates an element, and React later calls the component named by its type.",
    },
    {
      id: "does-jsx-render",
      question: "Does writing <Greeting /> run the Greeting function?",
      answer: "No. It creates an element object. React calls Greeting only when that element is part of what it renders, and it controls the timing. An element you create but never return will never cause the function to run.",
    },
    {
      id: "element-shape",
      question: "What does a React element contain?",
      answer: "Conceptually, its type, its props, and an optional key and ref. The type is either a string for a built-in element or a reference to a component. Treat it as opaque in application code, because you only need to render it, not inspect it.",
    },
    {
      id: "why-cheap",
      question: "Should you avoid creating elements for performance reasons?",
      answer: "Generally no. Creating an element only allocates a small object. Calling components and committing changes is where the work happens, so avoiding JSX on its own rarely helps. Any optimization should follow a measurement.",
    },
    {
      id: "element-as-prop",
      question: "Why is it useful that elements are ordinary values?",
      answer: "You can store them, pass them as props, or choose between them with normal JavaScript. That enables composition patterns such as children and named slots, where a parent places content that another component created.",
    },
  ],
  takeaways: [
    "A component is a function, and an element is a description produced by JSX.",
    "Creating an element does not call the component or touch the DOM.",
    "Elements are immutable values that can be stored and passed around.",
    "React resolves elements recursively to determine the UI.",
  ],
  quickReview: {
    definition: "An element is an immutable object describing what to render, and a component is the function that may produce more of them.",
    keyPoints: [
      "JSX creates elements, not DOM nodes.",
      "React decides when to call the component named by an element.",
      "Elements can be stored and passed as props.",
      "Creating elements is cheap, and rendering is where work happens.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "An element stored in a variable",
      language: "tsx",
      code: `export default function Notice({ isUrgent }: { isUrgent: boolean }) {
  const icon = isUrgent ? <strong>Urgent</strong> : null;

  return <p>{icon} Your session will end soon.</p>;
}`,
      description: "The element is an ordinary value, chosen with ordinary JavaScript.",
    },
    commonMistakes: [
      "Trying to read DOM properties from an element.",
      "Expecting JSX to run the component immediately.",
    ],
    interviewTrap: "“Does <Greeting /> call Greeting?” No. It creates a description, and React calls the function later if that element is rendered.",
    takeaway: "You describe with elements, and React decides when to do the work.",
  },
  sources: [
    { label: "createElement reference", href: "https://react.dev/reference/react/createElement" },
    { label: "Writing Markup with JSX", href: "https://react.dev/learn/writing-markup-with-jsx" },
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
  ],
};
