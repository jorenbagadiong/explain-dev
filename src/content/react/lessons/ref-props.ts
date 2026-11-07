import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "ref-as-a-prop",
      heading: "ref is a prop in React 19",
      paragraphs: [
        "In React 19, a function component receives ref like any other prop. To let a parent reach a DOM node inside your component, take ref and attach it to the element. A parent’s ref stays null unless you do this, because refs do not reach inside components automatically.",
        "In TypeScript, type it as Ref with the element type. Marking it optional keeps the component usable when no parent needs a ref.",
      ],
      examples: [
        {
          id: "ref-prop-input",
          classification: "complete",
          title: "Forwarding a ref in React 19",
          language: "tsx",
          code: `import { useRef, type ComponentProps } from "react";

function LabeledInput({ label, ref, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label>
      {label}
      <input {...props} ref={ref} />
    </label>
  );
}

export default function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <form>
      <LabeledInput label="Email" type="email" ref={emailRef} />
      <button type="button" onClick={() => emailRef.current?.focus()}>
        Edit email
      </button>
    </form>
  );
}`,
          description: "ComponentProps of an input already includes a correctly typed ref, so the wrapper forwards it along with everything else.",
        },
      ],
    },
    {
      id: "older-pattern",
      heading: "The older forwardRef pattern",
      paragraphs: [
        "Before React 19, a plain function component could not receive ref, so forwardRef wrapped it and passed the ref as a second argument. You will still see this widely in existing code and in libraries.",
        "forwardRef is no longer necessary in React 19, and the docs say it will be deprecated in a future release. It still works today, so existing code does not have to change at once, but new components should take ref as a prop.",
      ],
      comparison: [
        {
          id: "before",
          title: "React 18 and earlier",
          items: ["Wrap the component in forwardRef.", "Receive ref as a second argument.", "Required for any function component."],
        },
        {
          id: "after",
          title: "React 19",
          items: ["Take ref from props.", "No wrapper is needed.", "forwardRef still works, but it is on its way out."],
        },
      ],
      examples: [
        {
          id: "forward-ref-old",
          classification: "complete",
          title: "The older pattern, for recognition",
          language: "tsx",
          code: `import { forwardRef } from "react";

export const OldInput = forwardRef<HTMLInputElement, { label: string }>(function OldInput({ label }, ref) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
});`,
          description: "This still compiles and runs, and it is shown so you can recognize it. Do not use it in new code on React 19.",
        },
      ],
    },
    {
      id: "ref-callbacks",
      heading: "Callback refs",
      paragraphs: [
        "A ref can also be a function. React calls it with the DOM node when it attaches, and in React 19, the function can return a cleanup that runs when the node is removed. This suits work tied to a node’s existence, such as measuring an element that appears conditionally.",
      ],
      examples: [
        {
          id: "callback-ref",
          classification: "complete",
          title: "A callback ref that cleans up",
          language: "tsx",
          code: `import { useState } from "react";

export default function MeasuredBox() {
  const [width, setWidth] = useState(0);

  return (
    <>
      <div
        ref={node => {
          if (!node) return;
          const observer = new ResizeObserver(() => setWidth(node.offsetWidth));
          observer.observe(node);

          return () => observer.disconnect();
        }}
      >
        Resize me
      </div>
      <p>Width: {width}px</p>
    </>
  );
}`,
          description: "The observer is set up when the node attaches and removed when it detaches. An inline callback runs on each render, so a stable function is better if that setup is costly.",
        },
      ],
    },
    {
      id: "when-to-forward",
      heading: "When to expose a ref",
      paragraphs: [
        "Reusable low-level components such as inputs and buttons commonly forward refs, since callers may need to focus or measure them. Higher-level components usually should not. If a Page exposes a DOM node, callers begin depending on its internals.",
        "If callers need only one or two actions, useImperativeHandle can expose those without revealing the node. And if something can be expressed as a prop, such as isOpen, prefer the prop over a ref.",
      ],
    },
  ],
  mistakes: [
    {
      id: "not-attached",
      heading: "Accepting ref but not attaching it",
      problem: "A component that takes ref in its props and forgets to pass it down leaves the parent’s current as null. Calling focus then throws a cannot read properties of null error, which looks like a timing problem.",
      correction: "Pass ref to the DOM element, or to useImperativeHandle.",
    },
    {
      id: "new-forward-ref",
      heading: "Writing new forwardRef wrappers in React 19",
      problem: "Copying forwardRef from older examples still works, but it adds a wrapper layer that React 19 no longer needs, and you will have to change it when forwardRef is deprecated.",
      correction: "Take ref as a prop in new components.",
    },
    {
      id: "ref-as-custom-name",
      heading: "Reading props.ref on React 18",
      problem: "On older versions, ref was stripped from props, so a component reading it gets undefined. Code written for React 19 can fail silently when it is used in a project still on React 18.",
      correction: "Check the installed version, and use forwardRef in projects below React 19.",
    },
    {
      id: "over-exposing",
      heading: "Exposing refs from high-level components",
      problem: "A ref on a whole page or feature lets outside code reach into its DOM. Refactoring its markup then breaks callers, even though no prop has changed, so the component’s real interface is hidden.",
      correction: "Expose refs from low-level parts, and use props or a small imperative handle elsewhere.",
    },
    {
      id: "callback-ref-return",
      heading: "Returning a value from a callback ref by accident",
      problem: "An arrow function such as node => (ref.current = node) implicitly returns a value. In React 19, a returned value is treated as a cleanup, so TypeScript rejects this, and React expects a function there.",
      correction: "Use a block body so nothing is returned, unless you mean to return a cleanup.",
    },
  ],
  interview: [
    {
      id: "rp-how-19",
      question: "How do you pass a ref to a function component in React 19?",
      answer: "Accept ref as an ordinary prop and attach it to an element inside. No wrapper is needed. Before React 19, ref was not in props, so you wrapped the component in forwardRef to receive it as a second argument.",
    },
    {
      id: "rp-forward-status",
      question: "Is forwardRef deprecated?",
      answer: "It is no longer necessary in React 19, and the docs say it will be deprecated in a future release. It still works, so existing code keeps running. New components should take ref as a prop, and libraries supporting older React may still need forwardRef.",
    },
    {
      id: "rp-callback",
      question: "What is a callback ref, and when would you use one?",
      answer: "A function passed as ref, which React calls with the node on attach. In React 19 it can return a cleanup. It suits work tied to a node’s lifetime, such as observing an element that appears conditionally, where an Effect would not know when the node arrives.",
    },
    {
      id: "rp-when-expose",
      question: "Which components should expose a ref?",
      answer: "Low-level, reusable ones such as inputs and buttons, whose callers may need to focus or measure them. High-level components usually should not, because that exposes internals. A small imperative handle or props are better there.",
    },
    {
      id: "rp-null-ref",
      question: "Why is my ref’s current null after passing it to a custom component?",
      answer: "Refs do not reach inside components automatically. Unless the component passes ref down to a DOM element, or sets it through useImperativeHandle, current stays null. It is also null before mounting, so read it in handlers or Effects.",
    },
  ],
  takeaways: [
    "In React 19, ref is a regular prop for function components.",
    "forwardRef still works, but new code does not need it.",
    "Callback refs can return a cleanup in React 19.",
    "Expose refs from low-level components, and prefer props elsewhere.",
  ],
  quickReview: {
    definition: "Ref props let a parent reach a DOM node inside a child, which in React 19 only requires forwarding ref like any other prop.",
    keyPoints: [
      "A ref stays null if the child does not attach it.",
      "forwardRef is the older pattern.",
      "A callback ref can return a cleanup.",
      "Check the React version before relying on this.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Forwarding a ref",
      language: "tsx",
      code: `import type { Ref } from "react";

export function Field({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} />;
}`,
      description: "No wrapper is needed, and the ref reaches the input.",
    },
    commonMistakes: [
      "Taking ref as a prop without attaching it.",
      "Writing new forwardRef wrappers in React 19.",
      "Exposing DOM nodes from high-level components.",
    ],
    interviewTrap: "“Do you still need forwardRef in React 19?” No, though it still works, and libraries supporting older React may keep it.",
    takeaway: "Forward refs only from the low-level parts that genuinely need it.",
  },
  sources: [
    { label: "forwardRef reference", href: "https://react.dev/reference/react/forwardRef" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
    { label: "useImperativeHandle reference", href: "https://react.dev/reference/react/useImperativeHandle" },
    { label: "Common components: ref callbacks", href: "https://react.dev/reference/react-dom/components/common" },
    { label: "React 19 release notes", href: "https://react.dev/blog/2024/12/05/react-19" },
  ],
};
