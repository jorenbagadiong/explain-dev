import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "structure-first",
      heading: "Structure before caching",
      paragraphs: [
        "When too much renders, the instinct is to add memo and useMemo. There is usually a better starting point: change the structure, so that the update never reaches components that do not care. A structural fix has no dependency lists, no comparison cost, and it keeps working as the code changes.",
        "This only matters where rendering is actually slow, so measure first. Unnecessary renders are not a bug by themselves.",
      ],
      list: [
        "Move state down, closer to where it is used.",
        "Pass JSX as children, so a wrapper’s state does not re-render its content.",
        "Split contexts, so that a change only reaches relevant readers.",
        "Remove Effects that set state, which cause extra render passes.",
      ],
    },
    {
      id: "moving-state-down",
      heading: "Moving state down",
      paragraphs: [
        "State that only one part of a page uses should live in that part. Otherwise each change re-renders everything beside it for no reason.",
      ],
      examples: [
        {
          id: "state-down",
          classification: "complete",
          title: "Extracting the part that changes",
          language: "tsx",
          code: `import { useState } from "react";

function ColorPicker() {
  const [color, setColor] = useState("#ff0000");

  return (
    <label>
      Color
      <input type="color" value={color} onChange={event => setColor(event.target.value)} />
      <span>{color}</span>
    </label>
  );
}

function ExpensiveGallery() {
  return <section>Hundreds of images</section>;
}

export default function Page() {
  return (
    <>
      <ColorPicker />
      <ExpensiveGallery />
    </>
  );
}`,
          description: "Dragging the picker only re-renders ColorPicker. With the state in Page, every small change would also render the gallery.",
        },
      ],
    },
    {
      id: "lifting-content-up",
      heading: "Lifting content up through children",
      paragraphs: [
        "Sometimes the state cannot move down, because the wrapper itself needs it to style or position something. In that case, have the wrapper accept its content as children. Those elements are created by the parent, so they do not change when the wrapper’s own state does, and React can skip them.",
      ],
      examples: [
        {
          id: "children-up",
          classification: "complete",
          title: "State in a wrapper, with content passed in",
          language: "tsx",
          code: `import { useState, type ReactNode } from "react";

function ScrollTracker({ children }: { children: ReactNode }) {
  const [scrollTop, setScrollTop] = useState(0);

  return (
    <div style={{ height: 300, overflow: "auto" }} onScroll={event => setScrollTop(event.currentTarget.scrollTop)}>
      <p>Scrolled: {Math.round(scrollTop)}px</p>
      {children}
    </div>
  );
}

function LongArticle() {
  return <article>Long article text</article>;
}

export default function Page() {
  return (
    <ScrollTracker>
      <LongArticle />
    </ScrollTracker>
  );
}`,
          description: "Scrolling updates ScrollTracker on every event, yet LongArticle does not render, because Page did not re-render and its element is unchanged.",
        },
      ],
    },
    {
      id: "contexts-and-values",
      heading: "Narrowing context and props",
      paragraphs: [
        "A large context re-renders all its readers on any change. Splitting by concern reaches fewer components. Likewise, passing a derived primitive such as hasItems instead of the whole list means a memoized child only updates when that answer changes.",
        "Reducing what props carry is often all it takes for memo to become effective, where it is needed.",
      ],
      comparison: [
        {
          id: "broad",
          title: "Broad inputs",
          items: ["One context holding everything.", "Passing whole objects down.", "Readers update on unrelated changes."],
        },
        {
          id: "narrow",
          title: "Narrow inputs",
          items: ["Focused contexts.", "Passing primitives, or just what is needed.", "Readers update only for what they use."],
        },
      ],
    },
    {
      id: "when-to-add-caching",
      heading: "When to add caching after all",
      paragraphs: [
        "If the structure is already sensible and a recorded profile still shows an expensive component rendering needlessly, then memo is the right tool. Add it at that boundary, keep its props stable, and record again to confirm that it helped. In projects using the React Compiler, much of this happens automatically.",
      ],
    },
  ],
  mistakes: [
    {
      id: "memo-first",
      heading: "Reaching for memo first",
      problem: "Wrapping a component in memo treats the symptom. The update still reaches it, and now you also have props to keep stable, when moving one state variable might have removed the problem completely.",
      correction: "Look at where state lives first, and add memo only if the structure cannot solve it.",
    },
    {
      id: "state-high",
      heading: "Keeping transient state at the top",
      problem: "Hover, scroll position, or a draft’s text held in a page component re-renders the whole page for changes that only one small part ever displays, which can make simple interactions feel slow.",
      correction: "Move it into the smallest component that needs it.",
    },
    {
      id: "effect-renders",
      heading: "Setting derived state in Effects",
      problem: "An Effect that copies a calculated value into state causes a second render for each change. It adds work to the very page you may be trying to speed up, and it shows stale data for one commit.",
      correction: "Calculate during rendering, and remove the Effect and the state.",
    },
    {
      id: "context-for-fast-state",
      heading: "Putting rapidly changing values in context",
      problem: "A pointer position in context re-renders every reader many times per second, whatever part of it they use. Readers cannot subscribe to a part, so the cost grows with each new one.",
      correction: "Keep fast-changing state local, or use a store that supports subscribing to a slice.",
    },
    {
      id: "removing-cheap-renders",
      heading: "Optimizing renders that were never slow",
      problem: "Time spent preventing renders of a small label is wasted, since it adds complexity without changing anything people can feel. Meanwhile, the real slowness may be somewhere else entirely.",
      correction: "Use a profile to find what is expensive, and leave the rest alone.",
    },
  ],
  interview: [
    {
      id: "ar-first",
      question: "What would you try before using memo to reduce renders?",
      answer: "Moving state closer to where it is used, passing JSX as children, splitting contexts, and removing Effects that set state. These stop the update reaching components that do not care, with no comparison cost or dependency lists to maintain.",
    },
    {
      id: "ar-children",
      question: "How does passing children avoid re-renders?",
      answer: "The elements in children are created by the parent. If a wrapper’s own state changes but the parent does not re-render, those elements are the same, so React can skip rendering them. It is a simple alternative to memoizing the content.",
    },
    {
      id: "ar-are-renders-bad",
      question: "Are unnecessary re-renders a problem?",
      answer: "Only if they cost something measurable. Most are cheap. They matter when an expensive component renders often enough to affect an interaction. So I would profile first, and I would not try to remove renders just because a tool displays them.",
    },
    {
      id: "ar-context",
      question: "How can you reduce re-renders from context?",
      answer: "Split it by concern, so a change reaches only relevant readers, separate state from dispatch, and memoize the provider’s value if its parent re-renders often. Reading the context in an outer component, and passing primitives to a memoized child, also helps.",
    },
    {
      id: "ar-derived-props",
      question: "How can changing what you pass as props help?",
      answer: "Passing a derived primitive, such as isLoggedIn instead of a whole user object, means a memoized child only updates when that answer changes. Objects created during rendering are always new, so they defeat memo, while primitives compare by value.",
    },
    {
      id: "ar-verify",
      question: "How do you know your optimization worked?",
      answer: "Record the same interaction before and after, under the same conditions, ideally with a production or profiling build and a throttled CPU. If the numbers do not improve in a way a person could notice, I would undo the change, since it adds complexity.",
    },
  ],
  takeaways: [
    "Change the structure before adding caching.",
    "Move state down, and pass content through children.",
    "Narrow contexts and props, so that updates reach less.",
    "Only optimize what measurement shows to be slow.",
  ],
  quickReview: {
    definition: "Avoiding unnecessary renders starts with structure: stopping updates from reaching components that do not need them.",
    keyPoints: [
      "State belongs as low as it can go.",
      "children skip re-rendering when only the wrapper changes.",
      "Effects that set state add extra renders.",
      "memo comes after these, and only if measured.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A wrapper with stable content",
      language: "tsx",
      code: `import { useState, type ReactNode } from "react";

export default function Collapsible({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </>
  );
}`,
      description: "Toggling only renders Collapsible. Its children were created by its parent.",
    },
    commonMistakes: [
      "Adding memo before checking where state lives.",
      "Keeping hover or scroll state in a page component.",
      "Optimizing renders that were never slow.",
    ],
    interviewTrap: "“Should you eliminate all unnecessary renders?” No. Most are cheap. Remove the ones that cost something measurable.",
    takeaway: "The cheapest render is the one that the update never reached.",
  },
  sources: [
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
