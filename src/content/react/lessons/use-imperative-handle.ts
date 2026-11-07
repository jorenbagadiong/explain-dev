import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-it-does",
      heading: "What useImperativeHandle does",
      paragraphs: [
        "useImperativeHandle customizes what a parent gets from a ref. Instead of receiving the DOM node, the parent receives an object you define, usually with a few methods: useImperativeHandle(ref, createHandle, dependencies). It returns undefined.",
        "Starting with React 19, ref is available as a prop, so you do not need forwardRef for this. In React 18 and earlier, forwardRef provided the ref.",
      ],
    },
    {
      id: "limiting-exposure",
      heading: "Exposing less than the whole node",
      paragraphs: [
        "Passing a ref straight to an input gives the parent the entire DOM node, so it can change styles or anything else. A handle keeps the node private and exposes only what you choose.",
      ],
      examples: [
        {
          id: "limited-handle",
          classification: "complete",
          title: "A limited handle",
          language: "tsx",
          code: `import { useImperativeHandle, useRef, type Ref } from "react";

export interface SearchInputHandle {
  focus: () => void;
  clear: () => void;
}

function SearchInput({ label, ref }: { label: string; ref?: Ref<SearchInputHandle> }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      if (inputRef.current) inputRef.current.value = "";
    },
  }), []);

  return (
    <label>
      {label}
      <input ref={inputRef} />
    </label>
  );
}

export default function SearchBar() {
  const searchRef = useRef<SearchInputHandle>(null);

  return (
    <>
      <SearchInput label="Search" ref={searchRef} />
      <button type="button" onClick={() => searchRef.current?.focus()}>
        Focus
      </button>
      <button type="button" onClick={() => searchRef.current?.clear()}>
        Clear
      </button>
    </>
  );
}`,
          description: "The parent can only focus and clear. Writing to value is safe here, because this input is uncontrolled and React does not manage its value.",
        },
      ],
    },
    {
      id: "custom-methods",
      heading: "Exposing methods that are not DOM methods",
      paragraphs: [
        "A handle does not have to mirror DOM methods. It can describe something meaningful for your component, coordinating several internal nodes behind one call.",
        "The dependencies work as in other Hooks. If a dependency changes, or if you omit the array, createHandle runs again and the new handle is assigned to the ref. Compare with Object.is, and list every reactive value it uses.",
      ],
      examples: [
        {
          id: "custom-method",
          classification: "complete",
          title: "One method coordinating two nodes",
          language: "tsx",
          code: `import { useImperativeHandle, useRef, type Ref } from "react";

export interface PostHandle {
  scrollAndFocusComment: () => void;
}

export default function Post({ ref }: { ref?: Ref<PostHandle> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    scrollAndFocusComment() {
      sectionRef.current?.scrollIntoView();
      inputRef.current?.focus({ preventScroll: true });
    },
  }), []);

  return (
    <section ref={sectionRef}>
      <label>
        Add a comment
        <input ref={inputRef} />
      </label>
    </section>
  );
}`,
          description: "The parent asks for an outcome and does not need to know which nodes are involved.",
        },
      ],
    },
    {
      id: "when-to-avoid",
      heading: "Do not overuse it",
      paragraphs: [
        "Use refs only for imperative behaviors you cannot express as props, such as focusing, scrolling, triggering an animation, or selecting text. If something can be a prop, it should be one.",
        "A Modal that exposes open and close through a handle hides its state from React’s data flow. A Modal with an isOpen prop stays declarative, so its parent’s state fully describes the screen.",
      ],
      comparison: [
        {
          id: "good-fit",
          title: "Reasonable uses",
          items: ["Focusing a field.", "Scrolling to a position.", "Playing or pausing media.", "Starting a one-off animation."],
        },
        {
          id: "poor-fit",
          title: "Prefer a prop",
          items: ["Opening or closing a dialog.", "Setting a value.", "Choosing a tab.", "Anything that describes what should be on screen."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "modal-handle",
      heading: "Exposing state changes through a handle",
      problem: "modalRef.current.open() seems convenient, but the parent’s state no longer describes the screen. Other components cannot see whether the modal is open, and the imperative calls have to be kept in step with everything else.",
      correction: "Use a prop such as isOpen, and let the parent’s state drive it.",
    },
    {
      id: "expecting-dom-node",
      heading: "Expecting the ref to hold a DOM node",
      problem: "Once a component uses a handle, the parent’s ref holds your object, not the node. Calling ref.current.getBoundingClientRect() fails unless you exposed it, which is confusing if you expected a normal DOM ref.",
      correction: "Add the method you need to the handle, and describe the handle in a TypeScript interface.",
    },
    {
      id: "missing-deps",
      heading: "Omitting dependencies the handle uses",
      problem: "A handle method that reads a prop but has an empty dependency array keeps seeing the value from its first creation. The stale behavior only appears after that prop changes, so it can be hard to spot.",
      correction: "List every reactive value used by createHandle, and let the lint rule check it.",
    },
    {
      id: "using-forward-ref-new",
      heading: "Reaching for forwardRef in new React 19 code",
      problem: "Many older examples wrap components in forwardRef. That is no longer necessary in React 19 and only adds a layer, though existing code that uses it keeps working.",
      correction: "Accept ref as a prop in new components.",
    },
  ],
  interview: [
    {
      id: "uih-what",
      question: "What does useImperativeHandle do?",
      answer: "It customizes the value a parent receives through a ref. Rather than the DOM node, the parent gets an object you define with chosen methods. That lets a component keep its node private and expose only a small, purposeful interface.",
    },
    {
      id: "uih-why-not-direct",
      question: "Why not just pass the ref to the DOM element?",
      answer: "Often that is fine. But it gives the parent the whole node, which it could use to change anything. A handle limits the interface, so the component can change its internals freely, and it can offer methods that coordinate several nodes.",
    },
    {
      id: "uih-prop-instead",
      question: "When should you use a prop instead?",
      answer: "Whenever the behavior can be described declaratively. Opening a modal should be an isOpen prop, since the parent’s state then fully describes the UI. Handles are for commands with no declarative form, such as focusing or scrolling.",
    },
    {
      id: "uih-react19",
      question: "How did React 19 change how you use this Hook?",
      answer: "ref became a regular prop for function components, so you destructure it and pass it to useImperativeHandle. Before that, you wrapped the component in forwardRef to receive it. Old code still works, but new code does not need the wrapper.",
    },
    {
      id: "uih-deps",
      question: "What happens if you omit the dependencies argument?",
      answer: "createHandle runs again after each render, and the new object is assigned to the ref. With an array, it re-runs only when a dependency changes under Object.is. Listing them correctly keeps methods from reading stale props.",
    },
  ],
  takeaways: [
    "A handle replaces the DOM node with an object you design.",
    "In React 19, take ref as a prop rather than using forwardRef.",
    "Use it only for commands that have no declarative form.",
    "If it can be a prop, make it a prop.",
  ],
  quickReview: {
    definition: "useImperativeHandle defines the object a parent receives through a ref, in place of the DOM node.",
    keyPoints: [
      "useImperativeHandle(ref, createHandle, dependencies).",
      "It suits focus, scroll, animation, and selection.",
      "ref is a prop in React 19.",
      "Type the handle with an interface.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Defining a handle",
      language: "tsx",
      code: `useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
}), []);`,
      typecheckContext: { before: `import { useImperativeHandle, useRef, type Ref } from "react";\nexport function Example({ ref }: { ref?: Ref<{ focus: () => void }> }) {\nconst inputRef = useRef<HTMLInputElement>(null);`, after: "return <input ref={inputRef} />;\n}" },
      description: "The parent gets a focus method and nothing else.",
    },
    commonMistakes: [
      "Exposing open and close instead of an isOpen prop.",
      "Expecting a DOM node from the ref.",
      "Leaving out dependencies that the handle uses.",
    ],
    interviewTrap: "“Is an imperative handle a good way to control a modal?” Usually not. An isOpen prop keeps the state visible and declarative.",
    takeaway: "Keep handles small, and use them only for true commands.",
  },
  sources: [
    { label: "useImperativeHandle reference", href: "https://react.dev/reference/react/useImperativeHandle" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
  ],
};
