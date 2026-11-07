import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-happens-on-submit",
      heading: "What happens when a form submits",
      paragraphs: [
        "By default, a browser sends a form to a URL and loads a new page. In a React app, you usually want to handle submission yourself. A submit can be triggered by clicking a submit button, or by pressing Enter in a text field, which is why using a real form matters more than attaching onClick to a button.",
        "There are two main approaches in React 19: an onSubmit handler, and a function passed to the action prop.",
      ],
      comparison: [
        {
          id: "on-submit",
          title: "onSubmit handler",
          items: ["Receives an event.", "You call preventDefault yourself.", "Works with controlled or uncontrolled inputs."],
        },
        {
          id: "action",
          title: "action function",
          items: ["Receives FormData directly.", "React runs it in a Transition.", "Resets uncontrolled fields after success."],
        },
      ],
    },
    {
      id: "with-on-submit",
      heading: "Using onSubmit",
      paragraphs: [
        "Call event.preventDefault to stop the page from reloading, then read the values. FormData collects every named input, and Object.fromEntries turns it into an object when that is more convenient.",
      ],
      examples: [
        {
          id: "on-submit-example",
          classification: "complete",
          title: "Handling submit with FormData",
          language: "tsx",
          code: `import type { SubmitEvent } from "react";

export default function ContactForm({ onSend }: { onSend: (values: Record<string, FormDataEntryValue>) => void }) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onSend(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Message
        <textarea name="message" required />
      </label>
      <button type="submit">Send</button>
    </form>
  );
}`,
          description: "currentTarget is the form, whichever element triggered the event. onSubmit only fires if built-in validation such as required has passed.",
        },
      ],
    },
    {
      id: "with-action",
      heading: "Using a form action",
      paragraphs: [
        "When action is a function, React handles the submission. The function may be async, it receives FormData, and you do not need preventDefault. It is covered in depth in the React form Actions lesson.",
      ],
      examples: [
        {
          id: "action-example",
          classification: "complete",
          title: "A function as the form’s action",
          language: "tsx",
          code: `async function subscribe(formData: FormData) {
  const email = formData.get("email");
  await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
}

export default function NewsletterForm() {
  return (
    <form action={subscribe}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <button type="submit">Subscribe</button>
    </form>
  );
}`,
          description: "This is shorter, and the input stays uncontrolled. A real form would also show pending and error states, and those lessons follow.",
        },
      ],
    },
    {
      id: "buttons-inside-forms",
      heading: "Buttons inside forms",
      paragraphs: [
        "A button inside a form with no type attribute submits the form. This is a frequent source of bugs, when a Cancel or Show password button unexpectedly sends the form. Always set the type explicitly.",
        "A submit button can also override the form’s behavior with formAction, which lets one form offer two different actions, such as Save and Save as draft.",
      ],
      examples: [
        {
          id: "two-actions",
          classification: "complete",
          title: "Two buttons with different actions",
          language: "tsx",
          code: `async function publish(formData: FormData) {
  console.log("Publishing", formData.get("title"));
}

async function saveDraft(formData: FormData) {
  console.log("Saving draft", formData.get("title"));
}

export default function PostEditor() {
  return (
    <form action={publish}>
      <label>
        Title
        <input name="title" />
      </label>
      <button type="submit">Publish</button>
      <button type="submit" formAction={saveDraft}>
        Save draft
      </button>
      <button type="reset">Clear</button>
    </form>
  );
}`,
          description: "The second button overrides the form’s action, and the third restores fields to their defaults.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "no-prevent-default",
      heading: "Forgetting preventDefault in onSubmit",
      problem: "Without it, the browser sends the form to the current URL and reloads the page. React state is lost and the handler’s async work is cut off, and it can look as if the code ran and then vanished.",
      correction: "Call event.preventDefault first, or use a function as the form’s action.",
    },
    {
      id: "click-instead-of-submit",
      heading: "Handling submission with onClick on a button",
      problem: "An onClick on the button misses pressing Enter in a field, and it skips the browser’s built-in validation, so required fields can be sent empty. The form works for mouse users only.",
      correction: "Use a real form with a submit button, and handle it in onSubmit or action.",
    },
    {
      id: "default-button-type",
      heading: "Forgetting a button’s type",
      problem: "A plain button inside a form acts as a submit button. A Cancel or toggle button without a type will submit the form when clicked, which is a surprising and hard-to-spot behavior.",
      correction: "Set type=\"button\" on any button that should not submit.",
    },
    {
      id: "missing-names",
      heading: "Reading FormData from unnamed inputs",
      problem: "new FormData(form) only includes inputs with a name. A field relying on id alone is silently missing from the data, which often appears as a backend validation error instead.",
      correction: "Add a name attribute to every field you need.",
    },
    {
      id: "target-vs-current",
      heading: "Confusing target and currentTarget",
      problem: "event.target is the element that triggered the event, while currentTarget is the element the handler is attached to. For a submit event, using currentTarget makes the intent clear and gives TypeScript the form type.",
      correction: "Use event.currentTarget to get the form element.",
    },
  ],
  interview: [
    {
      id: "fs-prevent",
      question: "Why call preventDefault in a submit handler?",
      answer: "Browsers submit forms by sending a request and loading a new page, which would discard React’s state and interrupt your code. preventDefault stops that so you can handle submission yourself. With a function action, React handles this for you.",
    },
    {
      id: "fs-form-vs-button",
      question: "Why use a form element instead of a button with onClick?",
      answer: "A form handles Enter to submit, runs built-in validation, and gives assistive technology the right semantics. It also collects values with FormData. An onClick on a button loses all of this, so it serves only pointer users.",
    },
    {
      id: "fs-read-values",
      question: "How do you read values from a form?",
      answer: "With FormData on the form element, using named inputs. In an action function, it is passed directly. For controlled inputs, you already have the values in state. Object.fromEntries converts it to an object, though repeated names need getAll.",
    },
    {
      id: "fs-button-default",
      question: "What is the default type of a button inside a form?",
      answer: "Submit. So any button without a type will submit the form when clicked. I always set type explicitly, and a shared Button component should default to button, to prevent Cancel-style buttons from submitting by accident.",
    },
    {
      id: "fs-action-vs-submit",
      question: "When would you use onSubmit rather than a function action?",
      answer: "When you need the event itself, such as to validate first and call preventDefault conditionally, or you are on an older React version. Function actions are shorter, they run in a Transition, and they reset uncontrolled fields, so I would start there in React 19.",
    },
  ],
  takeaways: [
    "Use a real form, so Enter and built-in validation work.",
    "onSubmit needs preventDefault, and action functions do not.",
    "Give each field a name, so that FormData can read it.",
    "Set each button’s type explicitly.",
  ],
  quickReview: {
    definition: "Form submission in React is handled through an onSubmit handler or a function passed to the action prop.",
    keyPoints: [
      "FormData collects named inputs.",
      "A button’s default type inside a form is submit.",
      "formAction lets a button override the form’s action.",
      "Function actions run in a Transition.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Reading values on submit",
      language: "tsx",
      code: `function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  console.log(values);
}`,
      typecheckContext: { before: `import type { SubmitEvent } from "react";` },
      description: "Stop the reload, then read every named field.",
    },
    commonMistakes: [
      "Forgetting preventDefault in onSubmit.",
      "Using onClick on a button instead of a form.",
      "Leaving a Cancel button with no type.",
    ],
    interviewTrap: "“Why did my Cancel button submit the form?” Because a button in a form defaults to type submit. Set type=\"button\".",
    takeaway: "Start with the platform’s form behavior, and take over only what you need to.",
  },
  sources: [
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
    { label: "input reference", href: "https://react.dev/reference/react-dom/components/input" },
    { label: "Responding to Events", href: "https://react.dev/learn/responding-to-events" },
  ],
};
