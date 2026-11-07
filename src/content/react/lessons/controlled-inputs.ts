import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-controlled-means",
      heading: "What a controlled input is",
      paragraphs: [
        "A controlled input gets its value from React state. You pass value for text, or checked for a checkbox or radio, along with an onChange handler that updates that state. React then forces the input to show exactly what you passed.",
        "Your state is the source of truth, so anything can read it while the user types: validation, a character count, a preview, or another field.",
      ],
      examples: [
        {
          id: "controlled-basics",
          classification: "complete",
          title: "A controlled text input and checkbox",
          language: "tsx",
          code: `import { useState } from "react";

export default function SignupFields() {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <form>
      <label>
        Name
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} />
        I agree to the terms
      </label>
      <p>{name.length} characters</p>
    </form>
  );
}`,
          description: "Text reads event.target.value, and a checkbox reads event.target.checked. Both start with a defined value, so they are controlled from the first render.",
        },
      ],
    },
    {
      id: "rules",
      heading: "The rules",
      paragraphs: ["Controlled inputs have a few requirements that produce confusing symptoms when they are broken."],
      list: [
        "Always pass a string to value, and a boolean to checked.",
        "Every controlled input needs an onChange that updates its value. Without one, it is effectively read-only.",
        "An input cannot switch between controlled and uncontrolled during its life.",
        "If a value comes from an API and may be null, use value={apiValue ?? \"\"}.",
      ],
    },
    {
      id: "caret-jumps",
      heading: "Why the caret sometimes jumps",
      paragraphs: [
        "If the value you set in onChange does not match what is in the DOM, the caret can jump to the start of the field. There are three common causes.",
      ],
      list: [
        "Transforming the value, as in setName(event.target.value.toUpperCase()).",
        "Updating asynchronously, as in setTimeout(() => setName(value), 100).",
        "Remounting the input on each keystroke, because of a changing key or a component defined inside another component.",
      ],
      closing: "So update state synchronously, with the exact value. If you need a formatted version, calculate it separately for display, or apply it when the field loses focus.",
      examples: [
        {
          id: "format-on-blur",
          classification: "complete",
          title: "Formatting after the user finishes",
          language: "tsx",
          code: `import { useState } from "react";

export default function CodeField() {
  const [code, setCode] = useState("");

  return (
    <label>
      Promo code
      <input
        value={code}
        onChange={event => setCode(event.target.value)}
        onBlur={() => setCode(previous => previous.trim().toUpperCase())}
      />
    </label>
  );
}`,
          description: "Typing stays exact, so the caret behaves. The cleanup happens when focus leaves the field.",
        },
      ],
    },
    {
      id: "many-fields",
      heading: "Handling several fields",
      paragraphs: [
        "A form with many fields can use an object in state with one shared handler. The input’s name selects which key to update, and spreading keeps the others.",
      ],
      examples: [
        {
          id: "shared-handler",
          classification: "complete",
          title: "One handler for several inputs",
          language: "tsx",
          code: `import { useState, type ChangeEvent } from "react";

const initialValues = { email: "", city: "" };

export default function AddressForm() {
  const [values, setValues] = useState(initialValues);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues(previous => ({ ...previous, [name]: value }));
  }

  return (
    <form>
      <label>
        Email
        <input name="email" type="email" value={values.email} onChange={handleChange} />
      </label>
      <label>
        City
        <input name="city" value={values.city} onChange={handleChange} />
      </label>
    </form>
  );
}`,
          description: "The name attribute connects each input to its key. Reading name and value first keeps the event out of the updater.",
        },
      ],
    },
    {
      id: "performance",
      heading: "Performance on large forms",
      paragraphs: [
        "A controlled input re-renders its owner on each keystroke. Usually that is fine. If a form is slow, the cause tends to be the state being too high, or expensive content in the same component.",
        "Move each input’s state as low as possible, split the form into smaller components, and wrap expensive parts in memo after measuring. If nothing reads a field until submit, consider making it uncontrolled.",
      ],
    },
  ],
  mistakes: [
    {
      id: "no-onchange",
      heading: "Passing value without onChange",
      problem: "The field appears on screen but does not accept typing, because React keeps restoring the value you passed. It can look like a broken input, although React logs a warning in development.",
      correction: "Add onChange, use readOnly for a fixed value, or use defaultValue for an uncontrolled input.",
    },
    {
      id: "undefined-start",
      heading: "Starting with undefined",
      problem: "useState() with no argument gives undefined, so the input starts uncontrolled. When a string arrives, React warns that a component is changing an uncontrolled input to be controlled.",
      correction: "Initialize state with an empty string, or use value ?? \"\" for data that might be missing.",
    },
    {
      id: "checkbox-value",
      heading: "Reading value from a checkbox",
      problem: "event.target.value on a checkbox gives a string such as on, whether or not it is ticked. Storing that makes the state always truthy, so the box appears to do nothing useful.",
      correction: "Read event.target.checked for checkboxes and radios.",
    },
    {
      id: "transform-in-change",
      heading: "Transforming the value during onChange",
      problem: "Uppercasing or formatting as the user types makes the state differ from what the browser has, and that can make the caret jump to the start of the field in the middle of typing.",
      correction: "Set the exact value, and format on blur or in a separate display value.",
    },
    {
      id: "async-update",
      heading: "Updating state asynchronously",
      problem: "A debounced setter for the input’s own value means the field does not show what was typed until later. It feels laggy, can drop characters, and it also causes caret jumps.",
      correction: "Update the input’s state synchronously, and debounce whatever depends on it instead.",
    },
  ],
  interview: [
    {
      id: "ci-what",
      question: "What is a controlled input?",
      answer: "An input whose value comes from React state through value or checked, with onChange updating that state. React forces it to display what you pass, which makes the state the single source of truth for validation, formatting, and other UI.",
    },
    {
      id: "ci-warning",
      question: "What causes the uncontrolled to controlled warning?",
      answer: "value was undefined or null at first and later became a string, so React cannot tell which kind it is. Initialize with an empty string, and for values from an API that may be missing, use value ?? \"\".",
    },
    {
      id: "ci-caret",
      question: "Why does an input’s caret jump to the beginning?",
      answer: "The value set during onChange does not match the DOM. That can come from transforming the value, updating asynchronously, or remounting the input on each keystroke. Set the exact value synchronously, and keep the input’s identity stable.",
    },
    {
      id: "ci-slow",
      question: "What would you do if typing in a controlled form felt slow?",
      answer: "Find out what re-renders. Often state is too high or expensive content sits in the same component. I would move state down, split the form, and memoize measured expensive parts. If nothing needs the value until submit, an uncontrolled input is simpler.",
    },
    {
      id: "ci-debounce",
      question: "How would you debounce a search box with a controlled input?",
      answer: "Keep the input’s own state synchronous, so typing stays correct, then debounce the search based on that value, for example in an Effect with a timer and cleanup. useDeferredValue can also keep rendering of results from blocking the input.",
    },
    {
      id: "ci-readonly",
      question: "How do you show a value in an input that cannot be edited?",
      answer: "Pass value along with readOnly, which silences the missing onChange warning, keeps it focusable, and includes it in form submission. disabled is different, as a disabled input is not focusable, and its value is not submitted.",
    },
  ],
  takeaways: [
    "A controlled input takes its value from state, and updates it through onChange.",
    "Always pass a defined string or boolean.",
    "Update synchronously with the exact value to keep the caret correct.",
    "Move state low, or go uncontrolled, if keystrokes become expensive.",
  ],
  quickReview: {
    definition: "A controlled input’s displayed value always comes from React state, updated by its onChange handler.",
    keyPoints: [
      "Use value for text, and checked for checkboxes and radios.",
      "Initialize with \"\" rather than undefined.",
      "Never transform or delay the value in onChange.",
      "value without onChange makes the field read-only.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A controlled input",
      language: "tsx",
      code: `import { useState } from "react";

export default function Field() {
  const [text, setText] = useState("");

  return (
    <label>
      Note
      <input value={text} onChange={event => setText(event.target.value)} />
    </label>
  );
}`,
      description: "State starts as a string, and every keystroke updates it synchronously.",
    },
    commonMistakes: [
      "Using useState() with no initial value.",
      "Reading value instead of checked on a checkbox.",
      "Uppercasing the value inside onChange.",
    ],
    interviewTrap: "“Why not format the phone number in onChange?” Because a mismatch between state and the DOM can make the caret jump. Format separately or on blur.",
    takeaway: "Let state hold exactly what the user typed, and derive everything else.",
  },
  sources: [
    { label: "input reference", href: "https://react.dev/reference/react-dom/components/input" },
    { label: "Reacting to Input with State", href: "https://react.dev/learn/reacting-to-input-with-state" },
  ],
};
