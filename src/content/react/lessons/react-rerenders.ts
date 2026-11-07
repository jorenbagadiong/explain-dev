import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-causes-a-render",
      heading: "What causes a component to render",
      paragraphs: [
        "A re-render means React calling a component again to calculate its output. After the first render, the main cause is a state update in that component or in an ancestor. By default, rendering a component also renders everything nested inside it.",
        "That last rule surprises many people. A child renders because its parent rendered, whether or not its props changed. Props changing is not a separate trigger: new props arrive because the parent rendered. A component that reads a context also renders when that context’s value changes.",
      ],
      visual: {
        heading: "What can cause a component to render",
        context: "These are the common causes after a component has mounted.",
        steps: [
          { id: "own-state", title: "Its own state changes", description: "A setter or dispatch requests a new render." },
          { id: "parent", title: "Its parent renders", description: "By default, children render with their parent, even with identical props." },
          { id: "context", title: "A context it reads changes", description: "React compares the provider’s value with Object.is, and updates each reader." },
        ],
        note: "If a setter receives an identical value under Object.is, React skips rendering the component’s children, although it may still need to call the component itself.",
      },
    },
    {
      id: "state-below-parent",
      heading: "An update only affects its subtree",
      paragraphs: [
        "React starts from the component whose state changed and works downward. Its ancestors and siblings do not render. This makes where you keep state the most powerful tool for controlling how much work happens.",
      ],
      examples: [
        {
          id: "render-scope",
          classification: "complete",
          title: "Which components render",
          language: "tsx",
          code: `import { useState } from "react";

function Sibling() {
  return <p>I do not render when the counter changes.</p>;
}

function Child({ label }: { label: string }) {
  return <p>{label}</p>;
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button type="button" onClick={() => setCount(previous => previous + 1)}>
        {count}
      </button>
      <Child label="I render on every click, although my prop never changes." />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Counter />
      <Sibling />
    </>
  );
}`,
          description: "A click renders Counter and Child. Page and Sibling are not involved, since the update starts at Counter and goes down.",
        },
      ],
    },
    {
      id: "render-is-not-dom",
      heading: "A render is not a DOM update",
      paragraphs: [
        "Rendering only calculates. React then compares the result with the previous one and commits what differs, which may be nothing. So a component rendering often is not automatically a problem, and most renders are fast.",
        "Unnecessary rendering only matters when it is measurably slow. A component that renders ten times a second in a few microseconds costs nothing you can feel, while one expensive component rendering once on each keystroke can make typing lag.",
      ],
    },
    {
      id: "why-this-default",
      heading: "Why React renders children by default",
      paragraphs: [
        "It would seem simpler for React to skip children whose props have not changed. But React cannot assume a component is pure unless told, and it cannot tell whether a mutated object has changed. Rendering by default keeps the output correct, and you can opt in to skipping with memo where it helps. The React Compiler can add such skipping automatically, in projects that enable it.",
      ],
    },
    {
      id: "seeing-renders",
      heading: "Seeing what renders",
      paragraphs: [
        "Do not guess. React DevTools can highlight components as they render, and its Profiler records which components rendered in a commit, how long each took, and why. A console.log in a component also works for a quick check, though remember that Strict Mode calls components twice in development.",
      ],
      examples: [
        {
          id: "strict-mode-logs",
          classification: "complete",
          title: "A quick render log",
          language: "tsx",
          code: `export default function Row({ label }: { label: string }) {
  console.log("Row rendered:", label);

  return <li>{label}</li>;
}`,
          description: "Fine for temporary debugging. Seeing two logs per render in development is the Strict Mode check, and does not mean there are two renders in production.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "props-trigger",
      heading: "Thinking children render only when props change",
      problem: "This is the most common belief about React rendering. By default, a child renders whenever its parent does, so wrapping values in useMemo alone does nothing, because the child was never comparing props.",
      correction: "Remember memo is what makes a component compare props, and it is opt-in.",
    },
    {
      id: "all-renders-bad",
      heading: "Treating every render as a problem",
      problem: "Seeing many renders in a tool creates pressure to remove them, which leads to memoization everywhere. Most renders are cheap, so this adds complexity to fix something that users never notice.",
      correction: "Measure, and work on interactions that actually feel slow.",
    },
    {
      id: "mutation-no-render",
      heading: "Mutating state and expecting a render",
      problem: "Changing an object in place and calling the setter with the same reference can skip the update entirely. The data has changed, but the screen has not, which appears as a confusing rendering bug.",
      correction: "Pass a new object or array to the setter.",
    },
    {
      id: "new-context-values",
      heading: "Causing broad renders with a new context value",
      problem: "A provider passing a new object literal updates every reader each time its parent renders. It can look as if context is inherently slow, when the cause is the value’s identity changing for no reason.",
      correction: "Memoize the value when this is measured to matter, or split the context.",
    },
    {
      id: "double-log-confusion",
      heading: "Mistaking Strict Mode’s double call for a double render",
      problem: "Two logs per render in development lead people to look for a duplicate state update. Strict Mode deliberately calls components twice to expose impurity, and this does not happen in production.",
      correction: "Use the Profiler or a production build when counting real renders.",
    },
  ],
  interview: [
    {
      id: "rr-causes",
      question: "What causes a React component to re-render?",
      answer: "A state update in that component or an ancestor, its parent rendering, or a change to a context it reads. By default a child renders with its parent, whatever its props are. New props are not a separate trigger, because they come from the parent rendering.",
    },
    {
      id: "rr-props-same",
      question: "If a parent re-renders and passes the same props, does the child re-render?",
      answer: "Yes, by default. React does not compare props unless the child is wrapped in memo, or the React Compiler has optimized it. That is deliberate, because rendering is usually cheap, and comparing has its own cost.",
    },
    {
      id: "rr-siblings",
      question: "Does a state update re-render a component’s siblings or parents?",
      answer: "No. Rendering starts from the component whose state changed, and it goes down through what that component renders. That is why moving state lower in the tree is such an effective way to limit the work.",
    },
    {
      id: "rr-dom",
      question: "Does a re-render always update the DOM?",
      answer: "No. A render calculates output, and React commits only what differs from the previous result. If nothing differs, the DOM stays untouched. So a frequently rendering component is not necessarily expensive.",
    },
    {
      id: "rr-why-default",
      question: "Why doesn’t React skip rendering children whose props are unchanged by default?",
      answer: "It cannot assume purity, and comparing props has its own cost that would apply everywhere. Rendering by default keeps output correct and predictable. Opting in with memo, or using the compiler, adds skipping where it is useful.",
    },
    {
      id: "rr-same-state",
      question: "What happens if you set state to the same value?",
      answer: "If the new value is identical under Object.is, React skips rendering the component’s children. It may still need to call the component once before bailing out, which should not affect your code. Mutating an object and setting it again triggers this by accident.",
    },
  ],
  takeaways: [
    "State updates render the owner and, by default, its whole subtree.",
    "Children render with their parent, even with identical props.",
    "A render does not imply a DOM change, and most renders are cheap.",
    "Measure before trying to reduce renders.",
  ],
  quickReview: {
    definition: "A re-render is React calling a component again, caused by state changes, a parent rendering, or a context update.",
    keyPoints: [
      "Rendering goes down from the state’s owner.",
      "Props alone do not trigger renders.",
      "memo is opt-in prop comparison.",
      "An identical value under Object.is can skip the update.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Children render with parents",
      language: "tsx",
      code: `import { useState } from "react";

function Label() {
  return <p>Static text</p>;
}

export default function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>{count}</button>
      <Label />
    </>
  );
}`,
      description: "Label has no props, and it still renders on each click.",
    },
    commonMistakes: [
      "Believing children only render when props change.",
      "Treating every render as a performance bug.",
      "Counting Strict Mode’s double calls as real renders.",
    ],
    interviewTrap: "“Does a component re-render because its props changed?” Props change because the parent rendered, and the parent rendering is the cause.",
    takeaway: "Ask where the update started, and everything below that point is in scope.",
  },
  sources: [
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
