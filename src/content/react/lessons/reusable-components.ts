import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-makes-reusable",
      heading: "What makes a component reusable",
      paragraphs: [
        "A reusable component has decisions separated into two groups: those that belong to the component everywhere it is used, and those that belong to a particular screen. A Button can decide its focus styles, but a specific page decides what clicking it does.",
        "Reuse is not free. Every shared component is a dependency, so changing it affects every caller. Reuse pays off when the same decision truly repeats, not merely when two pieces of markup happen to look alike.",
      ],
      comparison: [
        {
          id: "shared",
          title: "Usually belongs in the component",
          items: ["Accessibility behavior.", "Consistent visual states.", "Structure of its own parts."],
        },
        {
          id: "caller",
          title: "Usually belongs to the caller",
          items: ["What actions do.", "Which data is shown.", "Business rules for a given screen."],
        },
      ],
    },
    {
      id: "presentational-example",
      heading: "Accepting what a caller needs",
      paragraphs: [
        "A good reusable component accepts native attributes where it wraps a native element. Callers can then add aria-label, disabled, or type without you needing a new prop for each.",
      ],
      examples: [
        {
          id: "button-wrapper",
          classification: "complete",
          title: "A button that passes native attributes through",
          language: "tsx",
          code: `import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={"button button-" + variant + " " + className} {...props} />;
}

export default function Toolbar() {
  return (
    <Button variant="secondary" aria-label="Close panel" onClick={() => window.history.back()}>
      Close
    </Button>
  );
}`,
          description: "The component owns variant styling and a safer default type, while everything else passes through. Spreading is appropriate here, because this is a genuine wrapper around one element.",
        },
      ],
    },
    {
      id: "separating-behavior",
      heading: "Separating reusable behavior",
      paragraphs: [
        "Sometimes the logic repeats while the look does not. Extract that logic into a custom Hook, so each component keeps its own markup. Sometimes the structure repeats instead, in which case a component with children or slots is the right shape.",
      ],
      examples: [
        {
          id: "toggle-hook",
          classification: "complete",
          title: "Sharing logic and leaving markup free",
          language: "tsx",
          code: `import { useCallback, useState } from "react";

function useToggle(initial = false) {
  const [isOn, setIsOn] = useState(initial);
  const toggle = useCallback(() => setIsOn(previous => !previous), []);

  return [isOn, toggle] as const;
}

export default function Faq({ question, answer }: { question: string; answer: string }) {
  const [isOpen, toggle] = useToggle();

  return (
    <div>
      <button type="button" aria-expanded={isOpen} onClick={toggle}>
        {question}
      </button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
}`,
          description: "Other components can use useToggle with entirely different markup.",
        },
      ],
    },
    {
      id: "when-to-extract",
      heading: "When to extract",
      paragraphs: [
        "A common guideline is to wait until a pattern has appeared a few times. By then you can see which parts truly repeat, and the abstraction fits real needs instead of guesses. Two things that look the same today may need to change for different reasons tomorrow, and sharing them would then get in the way.",
        "If a shared component keeps gaining options for one caller, consider copying it back. Removing the wrong abstraction is often better than extending it.",
      ],
      list: [
        "Extract when the same decision repeats, and you would want a fix to reach every use.",
        "Keep duplication when the similarity is accidental.",
        "Prefer fewer, more flexible parts over one component with many options.",
      ],
    },
  ],
  mistakes: [
    {
      id: "business-logic-in-shared",
      heading: "Putting screen-specific logic in a shared component",
      problem: "A shared Card that fetches its own data or knows about a specific page cannot be used anywhere else without bringing all of that along. Tests also need to set up that page’s world.",
      correction: "Keep shared components generic, and pass data and callbacks from the screen that owns them.",
    },
    {
      id: "missing-rest-props",
      heading: "Not forwarding native attributes",
      problem: "A Button that accepts only label and onClick cannot receive aria-label or disabled. Callers either work around it or you keep adding one prop at a time, and accessibility is often the part that gets missed.",
      correction: "Accept the element’s native props and spread them onto the element.",
    },
    {
      id: "wrong-abstraction",
      heading: "Forcing different things into one abstraction",
      problem: "Two pieces of UI that merely look alike may change for different reasons. Sharing one component then needs flags for each case, and each change risks breaking the other screen.",
      correction: "Keep them separate until they prove to change together.",
    },
    {
      id: "default-submit",
      heading: "Forgetting a button’s default type",
      problem: "A plain button inside a form defaults to type submit. A shared Button used for Cancel inside a form will submit that form when clicked, which is a confusing bug far from the component.",
      correction: "Default to type button in your shared component, and let callers override it.",
    },
    {
      id: "no-style-escape",
      heading: "Blocking all customization",
      problem: "Dropping className when wrapping an element means callers cannot adjust spacing or layout. They then add wrapper divs or copy the component, which is how a design system loses its value.",
      correction: "Merge a caller’s className with your own, so spacing and layout stay adjustable.",
    },
  ],
  interview: [
    {
      id: "reuse-what",
      question: "What makes a component truly reusable?",
      answer: "It makes only the decisions that apply everywhere it is used, and it leaves screen-specific ones to its caller through props and children. It is also accessible by default and accepts native attributes, so callers rarely need to work around it.",
    },
    {
      id: "reuse-when",
      question: "When should you extract a shared component?",
      answer: "When the same decision repeats and a fix should reach every use, usually after seeing it a few times. Things that merely look alike may need to change for different reasons, so some duplication is better than the wrong abstraction.",
    },
    {
      id: "hook-or-component",
      question: "How do you decide between a shared component and a custom Hook?",
      answer: "If markup and appearance repeat, use a component. If only the logic repeats and the markup varies, use a custom Hook. Sometimes you want both, with a Hook for the behavior and a component built on top of it.",
    },
    {
      id: "spread-props-q",
      question: "Why spread native props onto a wrapped element?",
      answer: "Callers can add aria-label, disabled, or data attributes without you adding a prop for each. ComponentProps gives you the right types. I limit spreading to real wrappers of one element, because it can otherwise hide what a component accepts.",
    },
    {
      id: "generic-limits",
      question: "What are the risks of making components too generic?",
      answer: "Options multiply, and combinations go untested. The component becomes hard to change, since every caller depends on it. Over-general APIs also tend to be harder to use than a simple specific component, so I would generalize only for real, repeated needs.",
    },
    {
      id: "undo-abstraction",
      question: "What would you do with a shared component that keeps gaining special cases?",
      answer: "I would consider splitting it, or copying it back into the callers that diverged. If special cases accumulate, it is a sign those uses are not really the same thing, and a duplicated component can be simpler than a heavily conditional shared one.",
    },
  ],
  takeaways: [
    "Separate decisions that apply everywhere from those of a specific screen.",
    "Forward native attributes when wrapping an element.",
    "Share logic with Hooks, and structure with components.",
    "Wait for real repetition, and undo abstractions that stop fitting.",
  ],
  quickReview: {
    definition: "A reusable component owns only the decisions shared by all its uses, and leaves the rest to its callers.",
    keyPoints: [
      "ComponentProps types a wrapper’s native attributes.",
      "Default buttons to type button.",
      "Merge callers’ className with your own.",
      "Duplication can be cheaper than a wrong abstraction.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A typed wrapper",
      language: "tsx",
      code: `import type { ComponentProps } from "react";

export function TextInput({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={"text-input " + className} {...props} />;
}`,
      description: "All native input attributes pass through with correct types.",
    },
    commonMistakes: [
      "Fetching data inside a shared component.",
      "Dropping aria attributes and className.",
      "Sharing things that only look similar.",
    ],
    interviewTrap: "“Should you remove all duplication?” No. Duplication that is accidental should stay, since sharing it couples things that change for different reasons.",
    takeaway: "Share a decision only when you want it to change everywhere at once.",
  },
  sources: [
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Reusing Logic with Custom Hooks", href: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
  ],
};
