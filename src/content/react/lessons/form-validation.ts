import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "two-kinds",
      heading: "Client validation and server validation do different jobs",
      paragraphs: [
        "Client-side validation is an initial check that improves the experience, since people can fix errors immediately. It is not a security measure. It is easy to bypass, and someone can always alter the network request directly.",
        "So every rule that protects your data must also run on the server. Never trust data just because the form validated it.",
      ],
      comparison: [
        {
          id: "client",
          title: "Client-side",
          items: ["Fast feedback, with no round trip.", "Guides the user toward valid input.", "Can be bypassed."],
        },
        {
          id: "server",
          title: "Server-side",
          items: ["The real enforcement.", "Can check things the client cannot, such as whether an email is taken.", "Must always run."],
        },
      ],
    },
    {
      id: "built-in",
      heading: "Start with built-in constraints",
      paragraphs: [
        "HTML can do a lot with no JavaScript. Attributes such as required, minLength, maxLength, min, max, and pattern, along with input types such as email and url, are checked by the browser before submit. An empty field that is not required is not considered invalid.",
      ],
      examples: [
        {
          id: "html-constraints",
          classification: "complete",
          title: "Built-in validation",
          language: "tsx",
          code: `export default function SignupForm({ onSubmit }: { onSubmit: (formData: FormData) => void }) {
  return (
    <form action={onSubmit}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Username
        <input name="username" required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+" />
      </label>
      <button type="submit">Create account</button>
    </form>
  );
}`,
          description: "The browser blocks an invalid submit and shows its own message, and it focuses the first invalid field. Attributes in JSX are camelCase, such as minLength.",
        },
      ],
    },
    {
      id: "custom-messages",
      heading: "Showing your own messages",
      paragraphs: [
        "Native messages cannot be styled, and they use the browser’s language rather than your page’s. Adding noValidate to a form turns off those automatic bubbles, while the Constraint Validation API keeps working, so you can use the browser’s rules with your own display.",
        "An error tied to its field should be connected with aria-describedby and marked with aria-invalid, so assistive technology can find it.",
      ],
      examples: [
        {
          id: "custom-display",
          classification: "complete",
          title: "Browser rules with custom messages",
          language: "tsx",
          code: `import { useId, useState, type FocusEvent } from "react";

export default function EmailField() {
  const [error, setError] = useState("");
  const errorId = useId();

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const { validity } = event.target;

    if (validity.valueMissing) setError("Enter your email address.");
    else if (validity.typeMismatch) setError("Include an @ in the address.");
    else setError("");
  }

  return (
    <>
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          aria-invalid={error !== ""}
          aria-describedby={error ? errorId : undefined}
          onBlur={handleBlur}
        />
      </label>
      <p id={errorId} aria-live="polite">
        {error}
      </p>
    </>
  );
}`,
          description: "The validity object reports which rule failed, and the message is your own. The live region announces changes, and the paragraph stays mounted so that this works reliably.",
        },
      ],
    },
    {
      id: "when-to-validate",
      heading: "When to show errors",
      paragraphs: [
        "Timing matters as much as wording. Showing an error while someone is still typing their first character feels hostile, while waiting until submit can mean a long list of corrections. A common balance is to validate when a field loses focus, then re-check as the user fixes an existing error.",
      ],
      list: [
        "While typing: only to clear an existing error, or for live guidance such as password rules.",
        "On blur: a good default for most fields.",
        "On submit: always, because people can skip fields without ever focusing them.",
      ],
    },
    {
      id: "rules-as-functions",
      heading: "Keeping rules testable",
      paragraphs: [
        "Rules beyond HTML’s constraints, such as comparing two passwords, are plain functions. Keeping them outside the component makes them easy to test, and it lets you share them with server code when your framework allows it.",
      ],
      examples: [
        {
          id: "validation-function",
          classification: "complete",
          title: "Validation as a plain function",
          language: "tsx",
          code: `export interface PasswordErrors {
  password?: string;
  confirm?: string;
}

export function validatePassword(password: string, confirm: string): PasswordErrors {
  const errors: PasswordErrors = {};

  if (password.length < 12) errors.password = "Use at least 12 characters.";
  if (password !== confirm) errors.confirm = "The passwords do not match.";

  return errors;
}`,
          description: "This needs no React, so it can be tested with plain inputs and outputs. Errors can then be stored or calculated during rendering.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "client-only",
      heading: "Relying on client validation for security",
      problem: "Disabling a submit button or setting required feels like enforcement. Anyone can send a request directly with any data, so a server that trusts the client accepts invalid or malicious input.",
      correction: "Validate again on the server, and treat client checks purely as help for the user.",
    },
    {
      id: "too-eager",
      heading: "Showing errors before the user has finished",
      problem: "An email field that says invalid after one keystroke is correct but unhelpful, and it can make people feel they did something wrong while they are only partway through typing.",
      correction: "Wait until the field loses focus, and clear errors as soon as they are fixed.",
    },
    {
      id: "color-only",
      heading: "Marking errors with color alone",
      problem: "A red border tells some people nothing, including those with color vision differences or using a screen reader. Without text, they do not know that a problem exists or what to change.",
      correction: "Show a text message, connect it with aria-describedby, and set aria-invalid.",
    },
    {
      id: "vague-messages",
      heading: "Writing vague messages",
      problem: "Invalid input does not say what is wrong or how to fix it. People then guess at the rule, try several times, and may give up, which the form could have prevented with one specific sentence.",
      correction: "Say what is needed, as in: Use at least 12 characters.",
    },
    {
      id: "disabled-submit",
      heading: "Disabling submit until the form is valid",
      problem: "A disabled button gives no reason why it cannot be pressed, and it is often unreachable by keyboard. People can get stuck with no clue which field is the problem.",
      correction: "Keep it enabled, and show specific errors when it is pressed.",
    },
  ],
  interview: [
    {
      id: "fv-client-server",
      question: "Why do you need server validation if the client already validates?",
      answer: "Client validation is only for user experience, and it can be bypassed by anyone sending a request directly. The server is the only place you can enforce rules, and it can also check things the client cannot know, such as whether a username is taken.",
    },
    {
      id: "fv-builtin",
      question: "What can browsers validate without JavaScript?",
      answer: "Required fields, length limits, numeric ranges, patterns, and types such as email and url. The browser blocks submission and focuses the first invalid field. The Constraint Validation API then exposes those results to your code through validity.",
    },
    {
      id: "fv-novalidate",
      question: "What does noValidate do?",
      answer: "It turns off the browser’s automatic validation bubbles on submit, so you can show your own errors. Constraints still apply, and the validity API and CSS states such as :invalid keep working, so you do not have to rewrite the rules.",
    },
    {
      id: "fv-timing",
      question: "When should validation errors appear?",
      answer: "I generally validate when a field loses focus, and re-check as the user corrects an existing error. Validate everything on submit as well, since untouched fields never blur. Showing an error during first-time typing tends to feel premature.",
    },
    {
      id: "fv-a11y",
      question: "How do you make validation errors accessible?",
      answer: "Provide text, not only color. Connect the message with aria-describedby, set aria-invalid on the field, and use a live region or move focus so that the error is announced. Messages should state what to do, and required fields should be marked.",
    },
    {
      id: "fv-where-rules",
      question: "Where should validation rules live?",
      answer: "In plain functions, ideally shared with the server when possible, so one rule does not drift across two places. They can be tested without rendering. The component only decides when to run them and how to display the result.",
    },
  ],
  takeaways: [
    "Client validation helps users, and server validation enforces rules.",
    "Start with built-in constraints before writing JavaScript.",
    "Validate on blur and on submit, and show specific text messages.",
    "Connect errors to fields for assistive technology.",
  ],
  quickReview: {
    definition: "Form validation checks input against rules, with client checks giving fast feedback and server checks providing real enforcement.",
    keyPoints: [
      "Client validation is never a security measure.",
      "required, pattern, and type work with no JavaScript.",
      "noValidate keeps the rules but hides native messages.",
      "Connect errors with aria-describedby and aria-invalid.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Constraints in JSX",
      language: "tsx",
      code: `export default function AgeField() {
  return (
    <label>
      Age
      <input name="age" type="number" required min={18} max={120} />
    </label>
  );
}`,
      description: "The browser enforces these before submit, with no JavaScript needed.",
    },
    commonMistakes: [
      "Treating client validation as enforcement.",
      "Marking errors only with color.",
      "Disabling submit with no explanation.",
    ],
    interviewTrap: "“If the form validates, can the server trust the data?” No. Requests can be sent directly, so the server must validate again.",
    takeaway: "Help the honest user on the client, and defend against everyone else on the server.",
  },
  sources: [
    { label: "MDN: Client-side form validation", href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation" },
    { label: "W3C: Forms tutorial", href: "https://www.w3.org/WAI/tutorials/forms/" },
    { label: "input reference", href: "https://react.dev/reference/react-dom/components/input" },
  ],
};
