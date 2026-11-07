import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-uncontrolled-means",
      heading: "What an uncontrolled input is",
      paragraphs: [
        "An uncontrolled input lets the browser hold its current value. You can give it a starting value with defaultValue, or defaultChecked for a checkbox or radio, and after that, the DOM tracks what the user does.",
        "You read the value when you need it, usually from the form when it is submitted. This means less code and no re-render on each keystroke, which suits forms where nothing needs the value until the end.",
      ],
      examples: [
        {
          id: "read-on-submit",
          classification: "complete",
          title: "Reading values with FormData",
          language: "tsx",
          code: `import type { SubmitEvent } from "react";

export default function FeedbackForm({ onSend }: { onSend: (message: string, subscribe: boolean) => void }) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSend(String(formData.get("message") ?? ""), formData.get("subscribe") === "on");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Message
        <textarea name="message" defaultValue="" />
      </label>
      <label>
        <input type="checkbox" name="subscribe" defaultChecked />
        Send me updates
      </label>
      <button type="submit">Send</button>
    </form>
  );
}`,
          description: "No state is involved. Each input’s name becomes its key in the form data, and an unticked checkbox simply has no entry.",
        },
      ],
    },
    {
      id: "choosing",
      heading: "When uncontrolled is the better choice",
      paragraphs: [
        "Uncontrolled does not mean old-fashioned. It works directly with the platform, including FormData and form actions, and it works before JavaScript loads when combined with Server Functions.",
      ],
      comparison: [
        {
          id: "fits",
          title: "Uncontrolled fits",
          items: ["Values are read only on submit.", "Simple forms with no interdependent fields.", "Form actions that receive FormData.", "File inputs, which are always uncontrolled."],
        },
        {
          id: "does-not-fit",
          title: "Controlled fits better",
          items: ["Live validation or formatting.", "One field affects another.", "A parent must set or reset the value.", "The value drives other UI as the user types."],
        },
      ],
    },
    {
      id: "reading-with-refs",
      heading: "Reading a single value with a ref",
      paragraphs: [
        "FormData is the usual way to read a form. For a single input outside a form, a ref works. Read it in an event handler, not during rendering, because a ref’s value is not something React tracks.",
      ],
      examples: [
        {
          id: "ref-read",
          classification: "complete",
          title: "Reading one input from a ref",
          language: "tsx",
          code: `import { useRef } from "react";

export default function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const input = inputRef.current;
    if (!input || input.value.trim() === "") return;

    onAdd(input.value.trim());
    input.value = "";
    input.focus();
  }

  return (
    <>
      <label>
        New task
        <input ref={inputRef} defaultValue="" />
      </label>
      <button type="button" onClick={handleAdd}>
        Add
      </button>
    </>
  );
}`,
          description: "Writing to value is safe here, because React is not controlling it. A controlled input must not be written to this way.",
        },
      ],
    },
    {
      id: "resetting",
      heading: "Resetting and changing defaults",
      paragraphs: [
        "defaultValue only sets the starting value, so changing it later does nothing to a mounted input. There are three ways to reset, depending on your situation.",
      ],
      list: [
        "A button with type reset, or calling reset on the form, restores the default values in the browser.",
        "Function form actions reset uncontrolled fields automatically after they succeed.",
        "Changing the component’s key remounts it, which picks up a new default.",
      ],
    },
  ],
  mistakes: [
    {
      id: "missing-name",
      heading: "Forgetting the name attribute",
      problem: "An input with no name does not appear in FormData, even though the user filled it in. The submitted data is missing that field, with no error to point at the cause.",
      correction: "Give every input you want to read a name, which becomes its key.",
    },
    {
      id: "default-updates",
      heading: "Expecting defaultValue to update",
      problem: "Passing a new defaultValue when a different record loads leaves the old text in the field, because the input already has its own value. The form then shows stale data alongside the new record.",
      correction: "Add a key based on the record’s ID, so the input remounts, or make the field controlled.",
    },
    {
      id: "value-without-state",
      heading: "Using value instead of defaultValue",
      problem: "value=\"Ana\" with no onChange gives a read-only field, because value makes an input controlled. It looks like an uncontrolled input with a starting value, but typing does nothing.",
      correction: "Use defaultValue for a starting value on an uncontrolled input.",
    },
    {
      id: "checkbox-formdata",
      heading: "Misreading checkboxes in FormData",
      problem: "An unticked checkbox has no entry in form data, and a ticked one defaults to the string on. Code checking for true or false gets it wrong, and may treat every submission the same.",
      correction: "Test for presence, as in formData.get(\"subscribe\") === \"on\", or set a value attribute and compare to it.",
    },
    {
      id: "reading-ref-render",
      heading: "Reading the input during rendering",
      problem: "Displaying inputRef.current?.value while rendering shows stale text, because typing does not request a render and the ref may not be set yet. The screen looks partly updated at random.",
      correction: "If the screen depends on the value, make the input controlled.",
    },
  ],
  interview: [
    {
      id: "ui-what",
      question: "What is an uncontrolled input?",
      answer: "One where the browser holds the current value, with defaultValue or defaultChecked setting only where it starts. You read it when needed, usually through FormData on submit or a ref. Typing causes no React renders.",
    },
    {
      id: "ui-read",
      question: "How do you read values from uncontrolled inputs?",
      answer: "On submit, create a FormData from the form, or receive it directly in a form action. Each named input appears under its name. Object.fromEntries can turn it into an object. For a single input, a ref works, read in an event handler.",
    },
    {
      id: "ui-when",
      question: "When would you prefer an uncontrolled input over a controlled one?",
      answer: "When nothing needs the value until submit, because that means less code and no render per keystroke. It also pairs well with form actions and works before JavaScript loads with Server Functions. Live validation or dependent fields favor controlled.",
    },
    {
      id: "ui-reset",
      question: "How do you reset an uncontrolled form?",
      answer: "Use a reset button or call reset on the form, which restores defaults. Successful function form actions also reset uncontrolled fields automatically. Changing a key remounts the component, which also applies a new defaultValue.",
    },
    {
      id: "ui-file",
      question: "Why can’t a file input be controlled?",
      answer: "Browsers do not let scripts set its value for security reasons, because otherwise a page could choose files on your behalf. So you read the selected files from the input or from FormData, and it stays uncontrolled.",
    },
    {
      id: "ui-switch",
      question: "Can you switch an input between controlled and uncontrolled?",
      answer: "No. An input should stay one or the other for its whole life, and React warns if value changes between undefined and a defined value. If you truly need both behaviors, change its key to create a new input.",
    },
  ],
  takeaways: [
    "The browser holds an uncontrolled input’s value.",
    "defaultValue only sets the starting point.",
    "Read values with FormData, and give each input a name.",
    "Choose uncontrolled when nothing needs the value until submit.",
  ],
  quickReview: {
    definition: "An uncontrolled input keeps its own value in the DOM, which you read when you need it.",
    keyPoints: [
      "Use defaultValue and defaultChecked for starting values.",
      "FormData collects values by name.",
      "Writing to a ref’s value is safe only for uncontrolled inputs.",
      "Successful form actions reset these fields automatically.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A form action with an uncontrolled input",
      language: "tsx",
      code: `export default function Search({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <form action={formData => onSearch(String(formData.get("query") ?? ""))}>
      <label>
        Search
        <input name="query" />
      </label>
      <button type="submit">Go</button>
    </form>
  );
}`,
      description: "There is no state and no preventDefault, because the action receives the form data directly.",
    },
    commonMistakes: [
      "Leaving out name, so the field never appears in FormData.",
      "Expecting a new defaultValue to update the field.",
      "Using value when defaultValue was intended.",
    ],
    interviewTrap: "“Is uncontrolled an anti-pattern?” No. It is a good fit when nothing needs the value until submit, and it works naturally with form actions.",
    takeaway: "If nothing is watching the value, let the browser look after it.",
  },
  sources: [
    { label: "input reference", href: "https://react.dev/reference/react-dom/components/input" },
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
  ],
};
