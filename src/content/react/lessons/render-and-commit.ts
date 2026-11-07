import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "three-steps",
      heading: "Three steps from request to screen",
      paragraphs: [
        "Every screen update goes through three steps. Something triggers a render, React renders your components, and React commits the result to the DOM. Afterwards, the browser paints, which is a separate step of its own.",
        "Imagine a restaurant: a customer’s order is the trigger, the kitchen preparing the dish is rendering, and placing it on the table is the commit. Keeping these steps apart makes much of React’s behavior easy to predict.",
      ],
      visual: {
        heading: "The path of an update",
        context: "This follows a single update, in order.",
        steps: [
          { id: "trigger", title: "Trigger", description: "The initial render, or a state update in a component or one of its ancestors." },
          { id: "render", title: "Render", description: "React calls components to calculate what should be on screen." },
          { id: "commit", title: "Commit", description: "React applies the necessary changes to the DOM." },
          { id: "paint", title: "Browser paint", description: "The browser draws the updated page." },
        ],
        note: "This is a simplified model. React may batch several updates into one render, and a commit may change nothing in the DOM.",
      },
    },
    {
      id: "triggers-and-rendering",
      heading: "What triggers a render, and what rendering does",
      paragraphs: [
        "There are two triggers. The first is the initial render, when the app starts through a call such as createRoot(node).render(<App />). The second is a state update, which automatically queues a render.",
        "Rendering means React calling your components. On the first render it starts at the root. On later renders it calls the component whose state changed. The process is recursive: if that component returns other components, React renders those too, by default, until nothing nested remains.",
      ],
      examples: [
        {
          id: "root-render",
          classification: "client",
          title: "Starting the initial render",
          language: "tsx",
          code: `import { createRoot } from "react-dom/client";

function App() {
  return <h1>Hello</h1>;
}

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(<App />);
}`,
          description: "This is how an app without a framework starts, and createRoot comes from react-dom rather than react. Frameworks such as Next.js handle this step for you, so you do not write it there.",
        },
      ],
    },
    {
      id: "committing",
      heading: "What committing does",
      paragraphs: [
        "On the initial render, React creates the DOM nodes and adds them to the page. On a re-render, it applies the minimal necessary operations to make the DOM match the latest output.",
        "If the output is the same as last time, React leaves the DOM alone. This is why an input keeps its typed text when its parent re-renders, as long as the input stays in the same place in the tree.",
      ],
      examples: [
        {
          id: "clock-commit",
          classification: "complete",
          title: "A render that changes only one node",
          language: "tsx",
          code: `import { useState } from "react";

export default function Clicker() {
  const [clicks, setClicks] = useState(0);

  return (
    <div>
      <label>
        Your name
        <input />
      </label>
      <p>Clicks: {clicks}</p>
      <button type="button" onClick={() => setClicks(previous => previous + 1)}>
        Click
      </button>
    </div>
  );
}`,
          description: "Each click renders Clicker again, but the commit only updates the paragraph’s text. The uncontrolled input is untouched, so what you typed into it stays.",
        },
      ],
    },
    {
      id: "practical-consequences",
      heading: "What this means in practice",
      paragraphs: [
        "A render is not a DOM update, so a component running more often than you expected is not automatically a problem. Conversely, rendering can be expensive if a component does heavy calculation or if a component near the root renders a large subtree.",
        "When investigating performance, separate the two: the React Profiler shows render and commit work, while the browser’s performance tools show layout and painting costs. Avoid optimizing until you have measured which one matters.",
      ],
    },
  ],
  mistakes: [
    {
      id: "render-means-dom",
      heading: "Treating a render as a DOM update",
      problem: "If a re-render seems to mean the page was rebuilt, you may try to prevent renders that were never a problem. Rendering only calculates a result, and the commit may find nothing to change.",
      correction: "Look at what actually changed in the DOM, and profile before trying to reduce renders.",
    },
    {
      id: "children-skip",
      heading: "Assuming children only render when their props change",
      problem: "It seems logical that unchanged props would mean no render. By default, though, rendering a component also renders the components nested inside it, whether or not their props changed.",
      correction: "Accept this default, since rendering is usually cheap. Where a measured cost exists, use memo or restructure state.",
    },
    {
      id: "state-changes-mid-render",
      heading: "Expecting the screen to change immediately after a setter",
      problem: "A setter only queues a render. The state variable in the running code keeps its old value, and the DOM does not change until React has rendered and committed, so reading the DOM right after a setter shows old content.",
      correction: "Calculate the next value in a local variable if you need it now, and use an Effect or a ref callback for work that must follow the commit.",
    },
    {
      id: "side-effects-in-render-phase",
      heading: "Doing DOM work while rendering",
      problem: "Writing to a DOM node during a render can seem efficient. But the commit has not happened yet, the node may not exist, and rendering must stay pure because React might call it again or discard the result.",
      correction: "Describe the change in JSX. For work that really must touch the DOM, use an event handler or an Effect.",
    },
  ],
  interview: [
    {
      id: "render-vs-commit-q",
      question: "What is the difference between the render and commit phases?",
      answer: "During render, React calls components to work out what the UI should be, and this must stay free of side effects. During commit, it applies the differences to the DOM. Render can happen without any DOM changes, and only commit touches the page.",
    },
    {
      id: "what-triggers",
      question: "What triggers a React render?",
      answer: "The initial mount through the root, and state updates afterwards. A state update can be in the component or an ancestor, and a nested component renders by default when its parent does. New props are not a separate trigger, because they arrive through the parent rendering.",
    },
    {
      id: "initial-vs-rerender",
      question: "How does committing differ between the initial render and a re-render?",
      answer: "On the initial render, React adds all created DOM nodes to the page. On a re-render, it applies only the minimal operations needed to match the new output, and it does nothing if the output is unchanged.",
    },
    {
      id: "input-keeps-text",
      question: "Why does an uncontrolled input keep its text when its parent re-renders?",
      answer: "Because the input appears in the same position in each render’s output with nothing different about it. React finds no change to apply, so the DOM node stays as it is, and so does whatever the user typed into it.",
    },
    {
      id: "paint-difference",
      question: "Is React’s rendering the same as the browser’s rendering?",
      answer: "No. React’s rendering means calling components. The browser’s step is usually called painting, and it happens after React updates the DOM. Keeping the words separate matters when diagnosing whether a slowdown comes from React’s work or from layout and paint.",
    },
    {
      id: "use-layout-timing",
      question: "How would you run code after the DOM has been updated?",
      answer: "An Effect runs after commit, and useLayoutEffect runs after commit but before paint, which suits measuring layout. A ref callback also runs when a node attaches. Reading the DOM right after calling a setter will not work, because the commit has not happened yet.",
    },
  ],
  takeaways: [
    "Trigger, render, and commit are separate steps, and paint comes after them.",
    "Rendering means React calling components, which must stay pure.",
    "Committing applies only the DOM changes that are needed.",
    "By default, rendering a component also renders the components inside it.",
  ],
  quickReview: {
    definition: "React updates the screen by rendering, which calculates the UI, and committing, which applies the differences to the DOM.",
    keyPoints: [
      "Triggers are the initial render and state updates.",
      "Rendering is recursive through nested components by default.",
      "Unchanged output means no DOM changes.",
      "Painting is the browser’s step, after the commit.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "The state variable keeps its snapshot",
      language: "tsx",
      code: `setClicks(clicks + 1);
console.log(clicks); // still the value from this render`,
      typecheckContext: {
        before: `declare const clicks: number;\ndeclare const setClicks: (next: number) => void;`,
      },
      description: "The setter requests a render, so neither the variable nor the DOM has changed yet.",
    },
    commonMistakes: [
      "Equating a re-render with rebuilding the DOM.",
      "Expecting unchanged props to skip a child’s render by default.",
      "Reading the DOM right after a setter.",
    ],
    interviewTrap: "“If a component re-renders, does its DOM change?” Not necessarily. React compares the output and commits only what differs, which may be nothing.",
    takeaway: "Ask two separate questions: did React render, and did the commit change anything?",
  },
  sources: [
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
  ],
};
