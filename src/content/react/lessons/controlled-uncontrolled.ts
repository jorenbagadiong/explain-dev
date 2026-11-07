import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "two-ways-to-hold-a-value",
      heading: "Who owns the value?",
      paragraphs: [
        "Any component that holds a value faces one design question: does it keep that value itself, or does its parent provide it? A component is called uncontrolled when it keeps the value in its own state, and controlled when the value comes from props.",
        "These are useful design terms, not strict technical categories. Most real components mix the two, with some values driven by props and others kept locally.",
      ],
      comparison: [
        {
          id: "uncontrolled",
          title: "Uncontrolled",
          items: ["Keeps its own state.", "Easy to use, with little configuration.", "A parent cannot coordinate or reset it directly."],
        },
        {
          id: "controlled",
          title: "Controlled",
          items: ["Gets its value and a change handler through props.", "The parent fully decides its behavior.", "Requires more wiring, but it is more flexible."],
        },
      ],
    },
    {
      id: "custom-components",
      heading: "Controlled and uncontrolled custom components",
      paragraphs: [
        "The terms apply to any component, not only form inputs. An accordion panel with its own open flag is uncontrolled. Give it isOpen and onToggle props, and it becomes controlled, which lets its parent enforce a rule such as only one panel open at a time.",
      ],
      examples: [
        {
          id: "panel-both",
          classification: "complete",
          title: "The same panel, in both styles",
          language: "tsx",
          code: `import { useState, type ReactNode } from "react";

// Uncontrolled: the panel owns its flag.
export function UncontrolledPanel({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(previous => !previous)}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </section>
  );
}

// Controlled: the parent owns the flag.
interface PanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function ControlledPanel({ title, isOpen, onToggle, children }: PanelProps) {
  return (
    <section>
      <button type="button" aria-expanded={isOpen} onClick={onToggle}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </section>
  );
}`,
          description: "The markup is the same. Only the owner of isOpen differs, and that decides who can coordinate it.",
        },
      ],
    },
    {
      id: "form-inputs",
      heading: "How this applies to form inputs",
      paragraphs: [
        "Native inputs show the idea clearly. With value, React state decides what the input shows, and you must also supply onChange. With defaultValue, or nothing at all, the browser holds the current value, and you read it when you need it.",
      ],
      examples: [
        {
          id: "inputs-both",
          classification: "complete",
          title: "Controlled and uncontrolled inputs",
          language: "tsx",
          code: `import { useState } from "react";

export default function NameFields() {
  const [controlled, setControlled] = useState("");

  return (
    <form>
      <label>
        Controlled
        <input value={controlled} onChange={event => setControlled(event.target.value)} />
      </label>
      <p>{controlled.length} characters</p>
      <label>
        Uncontrolled
        <input name="nickname" defaultValue="Ana" />
      </label>
    </form>
  );
}`,
          description: "The controlled input can drive live output such as the character count. The uncontrolled one is simpler, and its current value can be read from the form when it submits.",
        },
      ],
    },
    {
      id: "choosing",
      heading: "How to choose",
      paragraphs: [
        "Start with the simplest thing that meets the need. Choose controlled when something else depends on the value as it changes, or when a parent must be able to set it. Choose uncontrolled when nothing else cares until the end, such as a simple form read on submit.",
      ],
      list: [
        "Live validation, formatting, or conditional UI points to controlled.",
        "Two components that must agree point to controlled, with state in their parent.",
        "A simple form read on submit can be uncontrolled.",
        "File inputs are uncontrolled, because browsers do not let code set their value.",
      ],
    },
    {
      id: "supporting-both",
      heading: "Letting a component support both",
      paragraphs: [
        "A reusable library component sometimes accepts either style: value and onChange for controlled use, or defaultValue for uncontrolled use. It can pick its behavior by checking whether value was provided.",
        "Only add this when real callers need both. It is extra surface area to test, and most application components need only one style. Avoid switching a single instance from one style to the other during its life, since the ownership of its value would change midway.",
      ],
    },
  ],
  mistakes: [
    {
      id: "value-without-onchange",
      heading: "Passing value without onChange",
      problem: "An input with value but no onChange cannot be edited, because React keeps restoring it to the given value. React warns about it in development, but it can look like the input is simply broken.",
      correction: "Add an onChange handler, use readOnly if it is meant to be fixed, or use defaultValue for an uncontrolled input.",
    },
    {
      id: "undefined-to-value",
      heading: "Switching from uncontrolled to controlled",
      problem: "useState() with no initial value gives undefined, so the input starts uncontrolled. When state later becomes a string, it turns controlled, and React warns that a component changed from uncontrolled to controlled.",
      correction: "Initialize with an empty string, so the input is controlled from the first render.",
    },
    {
      id: "default-value-updates",
      heading: "Expecting defaultValue to update",
      problem: "Changing defaultValue after mounting does not change what the input shows, since it only sets the starting value. Passing a new record’s data this way leaves the old text on screen.",
      correction: "Control the input, or give the component a new key so it remounts with the new default.",
    },
    {
      id: "controlled-everything",
      heading: "Controlling every input by default",
      problem: "Controlling a large form means state for every field and a re-render on each keystroke, even if nothing reads the values until submit. It adds code and work with no benefit in that case.",
      correction: "Use uncontrolled inputs and read the values from the form when nothing needs them sooner.",
    },
    {
      id: "duplicate-owner",
      heading: "Holding a copy in both parent and child",
      problem: "A child with its own state and a parent passing the same value creates two owners. They drift apart as soon as one changes without the other, which shows up as a value that seems to reset or lag.",
      correction: "Pick one owner. If the parent needs it, make the child fully controlled.",
    },
  ],
  interview: [
    {
      id: "controlled-vs-uncontrolled",
      question: "What is the difference between a controlled and an uncontrolled component?",
      answer: "A controlled component gets its value and change handler from props, so its parent decides what it shows. An uncontrolled component keeps its value in its own state, or in the DOM for an input, and the parent reads it when needed.",
    },
    {
      id: "when-controlled",
      question: "When would you choose a controlled input?",
      answer: "When something depends on the value as it changes, such as live validation, formatting, enabling a button, or another component that must stay in step. If nothing needs the value until submit, an uncontrolled input is simpler.",
    },
    {
      id: "uncontrolled-warning",
      question: "What causes the warning about changing from uncontrolled to controlled?",
      answer: "The value prop was undefined on an earlier render and is defined later, usually because state was not given an initial value. React treats undefined as uncontrolled, so the ownership changes. Initializing with an empty string prevents it.",
    },
    {
      id: "not-only-forms",
      question: "Do controlled and uncontrolled only apply to forms?",
      answer: "No. They describe who owns any value. A tab group or accordion can keep its active item internally, or receive it from a parent with a change callback. The same tradeoff applies: simpler to use versus easier to coordinate.",
    },
    {
      id: "file-input",
      question: "Why are file inputs always uncontrolled?",
      answer: "Browsers do not let scripts set a file input’s value, for security reasons. A program cannot choose a file on the user’s behalf, so you read the selected files from the input or the form rather than setting them from state.",
    },
    {
      id: "reset-uncontrolled",
      question: "How do you reset an uncontrolled component from outside?",
      answer: "Change its key, which remounts it with its initial state. For a native form, calling reset on the form also works. If the parent needs to reset it often, that is a good sign it should be controlled instead.",
    },
  ],
  takeaways: [
    "The question is who owns the value: the component, or its parent.",
    "Controlled components are easier to coordinate, and uncontrolled ones are easier to use.",
    "value needs onChange, and defaultValue only sets the start.",
    "Pick one owner, and do not change it during a component’s life.",
  ],
  quickReview: {
    definition: "Controlled means the value comes from props, and uncontrolled means the component or DOM keeps it.",
    keyPoints: [
      "The terms apply to any component, not only inputs.",
      "value with onChange makes an input controlled.",
      "defaultValue sets only the initial value.",
      "File inputs can only be uncontrolled.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A controlled input",
      language: "tsx",
      code: `import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");

  return (
    <label>
      Search
      <input value={query} onChange={event => setQuery(event.target.value)} />
    </label>
  );
}`,
      description: "State is initialized to a string, so the input stays controlled.",
    },
    commonMistakes: [
      "Providing value with no onChange.",
      "Starting state as undefined, then setting a string.",
      "Expecting a new defaultValue to update the input.",
    ],
    interviewTrap: "“Are controlled components always better?” No. They cost wiring and renders. If nothing needs the value until submit, uncontrolled is a fine choice.",
    takeaway: "Decide who owns the value first, and the rest of the design follows.",
  },
  sources: [
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
  ],
};
