import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-makes-an-antipattern",
      heading: "What makes something a performance anti-pattern",
      paragraphs: [
        "A performance anti-pattern adds complexity without a measured gain, or actually makes things slower. Most come from good intentions: applying a technique everywhere rather than where it helps. Recognizing them saves both performance and maintenance effort.",
      ],
    },
    {
      id: "premature-caching",
      heading: "Premature caching",
      paragraphs: [
        "Wrapping values in useMemo and handlers in useCallback by default is the most common example. It adds dependency lists that can cause stale-value bugs, and comparisons on each render. If the child is not memoized and the calculation is cheap, nothing has been gained.",
      ],
      examples: [
        {
          id: "premature-memo",
          classification: "complete",
          title: "Removing caching that does nothing",
          language: "tsx",
          code: `interface User {
  firstName: string;
  lastName: string;
}

function Label({ text }: { text: string }) {
  return <span>{text}</span>;
}

// Avoid: const fullName = useMemo(() => user.firstName + " " + user.lastName, [user]);
// A string concatenation is cheap, and Label is not memoized.
export default function UserName({ user }: { user: User }) {
  const fullName = user.firstName + " " + user.lastName;

  return <Label text={fullName} />;
}`,
          description: "The plain version is shorter, has no dependency list to get wrong, and performs the same or better.",
        },
      ],
    },
    {
      id: "common-patterns",
      heading: "Patterns that make rendering slower",
      paragraphs: [
        "Some patterns cause genuine extra work. Each has a simple alternative.",
      ],
      comparison: [
        {
          id: "anti",
          title: "Anti-pattern",
          items: ["Setting derived state in an Effect.", "Defining components inside components.", "Using index or random keys.", "One giant context for everything."],
        },
        {
          id: "better",
          title: "Usually better",
          items: ["Calculate during rendering.", "Declare them at module level.", "Use stable keys from the data.", "Separate, focused contexts."],
        },
      ],
      examples: [
        {
          id: "effect-chain",
          classification: "complete",
          title: "Replacing an Effect with a calculation",
          language: "tsx",
          code: `import { useState } from "react";

const products = ["Tea", "Coffee", "Cocoa"];

// Avoid: const [visible, setVisible] = useState(products);
//        useEffect(() => setVisible(products.filter(...)), [query]);
// That renders stale data, commits, and then renders again.
export default function ProductFilter() {
  const [query, setQuery] = useState("");
  const visible = products.filter(product => product.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <label>
        Filter
        <input value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <p>{visible.join(", ")}</p>
    </>
  );
}`,
          description: "Each keystroke produces one render and one correct result.",
        },
      ],
    },
    {
      id: "not-only-rendering",
      heading: "Anti-patterns beyond rendering",
      paragraphs: [
        "Many performance problems have nothing to do with React’s rendering. Focusing only on renders can miss the largest costs on a page.",
      ],
      list: [
        "Shipping too much JavaScript, such as importing a whole library for one function.",
        "Rendering thousands of DOM nodes when a user only sees a few dozen.",
        "Unoptimized images, which often dominate how much a page downloads.",
        "Frequent state updates from scroll or pointer events driving large trees.",
        "Reading layout in loops, which forces repeated recalculation.",
      ],
      examples: [
        {
          id: "throttle-updates",
          classification: "client",
          title: "Coalescing frequent events into frames",
          language: "tsx",
          code: `"use client";

import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let frame = 0;

    function handleResize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(window.innerWidth));
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
}`,
          description: "Several resize events within one frame cause only one state update, and the cleanup cancels any frame still waiting.",
        },
      ],
    },
    {
      id: "fixing-the-right-thing",
      heading: "Focusing on the right thing",
      paragraphs: [
        "Before fixing an anti-pattern for performance reasons, ask if it matters here. Defining a component inside another is worth fixing anyway, because it causes bugs. A useCallback on a small handler might be harmless, and removing it across a large codebase might not be a good use of time.",
        "Measure, and go after whatever affects a real interaction. Keep code simple by default, and add complexity only when it has earned its place.",
      ],
    },
  ],
  mistakes: [
    {
      id: "usememo-everything",
      heading: "useMemo and useCallback on everything",
      problem: "Treating these as good hygiene adds code that nobody can easily verify, and each dependency list is a place for stale-value bugs. Most of these calls never skip any meaningful work at all.",
      correction: "Keep code plain, and add caching where measurement shows a benefit.",
    },
    {
      id: "memo-with-unstable-props",
      heading: "memo on a component with unstable props",
      problem: "Wrapping a component in memo while passing inline objects or functions means the comparison always fails. You pay for comparing on every render, and the component re-renders anyway.",
      correction: "Stabilize the props or remove the memo. Either way, do not keep a comparison that never succeeds.",
    },
    {
      id: "custom-deep-compare",
      heading: "Deep comparing in memo or dependencies",
      problem: "Deep equality on large data can take longer than the render it was meant to avoid. It also grows silently, because the cost depends on the data’s size, which can change over time.",
      correction: "Use immutable updates, so a reference check is enough, or compare only specific fields.",
    },
    {
      id: "giant-lists",
      heading: "Rendering everything in very long lists",
      problem: "Thousands of rows mean thousands of components and DOM nodes, whatever you memoize. The browser’s work on layout and memory can dominate, so memo on each row does little to help.",
      correction: "Paginate or virtualize, so that only what is visible gets rendered.",
    },
    {
      id: "bundle-blindness",
      heading: "Ignoring what you ship",
      problem: "Teams can spend weeks reducing renders, while a heavy dependency adds seconds to load time on a mobile connection. Rendering improvements cannot make up for code that has to download and parse first.",
      correction: "Check bundle size, split rarely used features, and remove unused dependencies.",
    },
  ],
  interview: [
    {
      id: "pa-examples",
      question: "What are some common React performance anti-patterns?",
      answer: "Blanket useMemo and useCallback, memo with unstable props, derived state set in Effects, components defined inside components, unstable keys, one huge context, and rendering very long lists in full. Most add complexity, and some cause more work.",
    },
    {
      id: "pa-usecallback-everywhere",
      question: "Is wrapping every function in useCallback good practice?",
      answer: "No. It only helps if something compares that function, such as a memoized child or a dependency array. Otherwise it adds code and a dependency list for no benefit. The docs advise against adding it everywhere.",
    },
    {
      id: "pa-premature",
      question: "What does premature optimization look like in React?",
      answer: "Adding memoization or restructuring code before knowing there is a problem. It costs readability, and it can add bugs, all for a benefit that may not exist. The alternative is to write clear code, measure real interactions, and then fix what matters.",
    },
    {
      id: "pa-effect-state",
      question: "Why is setting derived state in an Effect a performance issue?",
      answer: "React first renders and commits with the stale value, then runs the Effect, whose update renders again. That is two commits for one change, and a brief display of incorrect data. Calculating during rendering does it in one pass.",
    },
    {
      id: "pa-large-lists",
      question: "How would you handle a list of 50,000 items?",
      answer: "Not by rendering them all and memoizing rows, since the DOM itself becomes the cost. I would paginate or virtualize, so that only visible rows exist, and consider filtering on the server. Then I would measure scrolling and interaction on a slower device.",
    },
    {
      id: "pa-beyond",
      question: "What performance problems have nothing to do with re-renders?",
      answer: "Large JavaScript bundles, unoptimized images, slow network requests, third-party scripts, expensive layout and paint, and huge DOM trees. Re-renders get a lot of attention, but these often matter more, so I would look at the whole page first.",
    },
  ],
  takeaways: [
    "Techniques applied everywhere often add cost without benefit.",
    "Plain code is the default, and caching has to earn its place.",
    "Many real costs lie outside React’s rendering.",
    "Fix what affects a real interaction, and leave the rest.",
  ],
  quickReview: {
    definition: "A performance anti-pattern adds complexity without a measured gain, or it makes the application do more work.",
    keyPoints: [
      "Blanket memoization rarely helps.",
      "memo with unstable props only adds comparisons.",
      "Derived state in Effects means extra renders.",
      "Bundles, images, and DOM size often matter more.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Plain by default",
      language: "tsx",
      code: `export default function Total({ prices }: { prices: readonly number[] }) {
  const total = prices.reduce((sum, price) => sum + price, 0);

  return <p>{total}</p>;
}`,
      description: "No useMemo, until measurement says it is needed.",
    },
    commonMistakes: [
      "Wrapping everything in useCallback.",
      "Using memo with inline object props.",
      "Ignoring bundle size while reducing renders.",
    ],
    interviewTrap: "“Isn’t more memoization always safer?” No. It adds dependency lists, comparison costs, and possible stale values for no certain gain.",
    takeaway: "Make it simple, then measure, then make it fast where it matters.",
  },
  sources: [
    { label: "useCallback reference", href: "https://react.dev/reference/react/useCallback" },
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "web.dev: Rendering performance", href: "https://web.dev/articles/rendering-performance" },
  ],
};
