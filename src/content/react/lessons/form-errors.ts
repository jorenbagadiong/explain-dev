import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "kinds-of-failure",
      heading: "Different failures need different handling",
      paragraphs: [
        "Not all submission failures are the same. A wrong password is an expected outcome that the user can fix, and a server crash is not. Treating them alike leads either to an unhelpful full-page error or to a bug being shown as if it were the user’s mistake.",
      ],
      comparison: [
        {
          id: "expected",
          title: "Expected failures",
          items: ["Validation problems, or an email already in use.", "Return them as data.", "Show them in the form, and keep the input."],
        },
        {
          id: "unexpected",
          title: "Unexpected failures",
          items: ["A bug, or a broken response.", "Let them throw, and log them.", "An Error Boundary provides a fallback."],
        },
      ],
      closing: "Network failures sit in between. They are not the user’s fault, but they can often be retried, so they usually deserve a message in the form and a way to try again.",
    },
    {
      id: "returning-errors",
      heading: "Returning field errors",
      paragraphs: [
        "Have the Action return a result describing what went wrong, keyed by field. The form can then show each message beside its input. Because returning does not stop React resetting uncontrolled fields, include the submitted values too, and use them as defaultValue.",
      ],
      examples: [
        {
          id: "field-errors",
          classification: "client",
          title: "Field errors from an Action",
          language: "tsx",
          code: `"use client";

import { useActionState, useId } from "react";

interface SignupState {
  errors: { email?: string; password?: string };
  values: { email: string };
}

const initialState: SignupState = { errors: {}, values: { email: "" } };

async function signup(_previous: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const errors: SignupState["errors"] = {};

  if (!email.includes("@")) errors.email = "Enter an email address that includes @.";
  if (password.length < 12) errors.password = "Use at least 12 characters.";

  return { errors, values: { email: Object.keys(errors).length > 0 ? email : "" } };
}

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);
  const emailErrorId = useId();
  const passwordErrorId = useId();

  return (
    <form action={formAction} noValidate>
      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue={state.values.email}
          aria-invalid={Boolean(state.errors.email)}
          aria-describedby={state.errors.email ? emailErrorId : undefined}
        />
      </label>
      {state.errors.email && <p id={emailErrorId}>{state.errors.email}</p>}
      <label>
        Password
        <input
          name="password"
          type="password"
          aria-invalid={Boolean(state.errors.password)}
          aria-describedby={state.errors.password ? passwordErrorId : undefined}
        />
      </label>
      {state.errors.password && <p id={passwordErrorId}>{state.errors.password}</p>}
      <button type="submit">Create account</button>
    </form>
  );
}`,
          description: "The email is kept, while the password is deliberately not sent back, since passwords should not be echoed into the page.",
        },
      ],
    },
    {
      id: "summary-and-focus",
      heading: "Telling people something went wrong",
      paragraphs: [
        "A message next to a field can be missed if it is off-screen. After a failed submit, tell people what happened: put a summary above the form with a clear heading, in which each item names the field, describes the problem, and links to the control. When errors appear without a page load, a container with role=\"alert\" announces the summary to assistive technology.",
        "Moving focus also helps. After a failed submission, the W3C tutorial suggests moving focus to the first field with an error, so that people can begin fixing it straight away.",
      ],
      examples: [
        {
          id: "error-summary",
          classification: "complete",
          title: "An error summary with links",
          language: "tsx",
          code: `interface FieldError {
  fieldId: string;
  label: string;
  message: string;
}

export default function ErrorSummary({ errors }: { errors: readonly FieldError[] }) {
  if (errors.length === 0) return null;

  return (
    <div role="alert">
      <h2>
        {errors.length === 1 ? "There is 1 problem" : "There are " + errors.length + " problems"} with this form
      </h2>
      <ul>
        {errors.map(error => (
          <li key={error.fieldId}>
            <a href={"#" + error.fieldId}>
              {error.label}: {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
          description: "Each link takes the user to the field that needs attention. Note that the role=\"alert\" container here is added with its content, and announcement support for that can vary, so test with real assistive technology.",
        },
      ],
    },
    {
      id: "wording",
      heading: "Writing useful error messages",
      paragraphs: [
        "A good message says what is wrong and what to do, in plain language. It does not blame the user, and it does not expose internal details such as stack traces or database errors.",
      ],
      list: [
        "Say what to do: Use at least 12 characters, rather than Invalid password.",
        "Name the field in summaries, so a message makes sense on its own.",
        "For failures you cannot explain, offer a next step, such as Try again in a moment.",
        "Keep the same message style across the application.",
      ],
    },
    {
      id: "preserving-input",
      heading: "Never lose what the user typed",
      paragraphs: [
        "Failed submissions should keep input, because retyping a long form is a common reason people give up. For controlled inputs, this is automatic, as long as you do not clear state before success. For uncontrolled inputs under a form Action, pass values back and use them as defaultValue.",
        "A thrown error is different, because an Error Boundary’s fallback replaces the form, and the input goes with it. That is one more reason to return expected failures rather than throw them.",
      ],
    },
  ],
  mistakes: [
    {
      id: "throwing-expected",
      heading: "Throwing for expected failures",
      problem: "Throwing when an email is already taken sends the user to an Error Boundary’s fallback, replacing the form and losing their input, for something they could have fixed in a moment.",
      correction: "Return expected failures as data, and reserve throwing for unexpected ones.",
    },
    {
      id: "generic-error",
      heading: "Showing only something went wrong",
      problem: "A single generic message after a failed submit leaves the person searching the form, or giving up. If the server knew which field was wrong, this throws away the information they need.",
      correction: "Report errors per field, with a summary at the top when there are several.",
    },
    {
      id: "leaking-details",
      heading: "Showing raw server errors",
      problem: "Passing a database or stack-trace message straight to the page confuses people, and it can expose internal details such as table names. It also ties the UI’s wording to implementation.",
      correction: "Map failures to user-facing messages on the server, and log the details privately.",
    },
    {
      id: "errors-disappearing",
      heading: "Clearing errors at the wrong time",
      problem: "An error that vanishes after a few seconds can be gone before someone reads it, particularly with a screen reader or when reading slowly. Errors that never clear after being fixed are equally confusing.",
      correction: "Keep an error until the field changes or the form is submitted again.",
    },
    {
      id: "unconnected-message",
      heading: "Not connecting the message to the field",
      problem: "A paragraph placed visually near an input has no programmatic link to it. A screen reader user focusing the field does not hear the problem, and may not know that the error exists.",
      correction: "Use aria-describedby and aria-invalid on the field.",
    },
  ],
  interview: [
    {
      id: "fe-return-vs-throw",
      question: "When should a form Action return an error rather than throw?",
      answer: "Return when failure is expected and actionable, such as validation or a taken username, so the form stays on screen with its input. Throw for unexpected failures, which go to an Error Boundary. Throwing for expected cases loses the form and the user’s work.",
    },
    {
      id: "fe-keep-input",
      question: "How do you keep input after a failed form Action?",
      answer: "Controlled inputs keep it, as long as state is not cleared early. Uncontrolled inputs reset even after a returned error, so return the submitted values and pass them to defaultValue. Passwords should generally not be echoed back.",
    },
    {
      id: "fe-a11y",
      question: "How do you make form errors accessible?",
      answer: "Provide a summary with links to each field, in a container announced with role alert. Connect each message with aria-describedby, set aria-invalid, and consider moving focus to the first invalid field. Text must convey the problem rather than color alone.",
    },
    {
      id: "fe-server-errors",
      question: "How should server-side validation errors reach the form?",
      answer: "As structured data, such as a map from field name to message, so that each appears by its field. Unknown failures get a general message and a way to retry. Internal details stay in server logs, and the client never sees them.",
    },
    {
      id: "fe-focus",
      question: "Where should focus go after a failed submission?",
      answer: "The W3C tutorial suggests the first field with an error, which lets people start fixing it straight away. An alternative is focusing an error summary at the top, which gives an overview. Either way, focus should not be left somewhere unrelated.",
    },
    {
      id: "fe-network",
      question: "How would you handle a network failure during submission?",
      answer: "Catch it, keep the input, and explain that the request could not complete, with a clear retry. It is not the user’s fault, so the wording should reflect that. I would make sure repeating the request is safe, and handle duplicates on the server.",
    },
  ],
  takeaways: [
    "Return expected failures as data, and let unexpected ones throw.",
    "Show errors per field, and add a linked summary for longer forms.",
    "Connect messages to fields with aria-describedby and aria-invalid.",
    "Never lose what the user typed.",
  ],
  quickReview: {
    definition: "Good form error handling explains what went wrong, connects it to the right field, and preserves the user’s input.",
    keyPoints: [
      "Expected failures are data, and bugs are thrown errors.",
      "Returned errors still reset uncontrolled fields.",
      "Summaries link to the fields with problems.",
      "Internal details stay out of user-facing messages.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Connecting a message to its field",
      language: "tsx",
      code: `<input name="email" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />`,
      typecheckContext: { before: `declare const error: string | undefined;\ndeclare const errorId: string;\nexport const element = (`, after: ");" },
      description: "Assistive technology then reads the error along with the field.",
    },
    commonMistakes: [
      "Throwing for a taken username.",
      "Showing only a generic failure message.",
      "Passing raw server errors to the page.",
    ],
    interviewTrap: "“Does returning an error keep the form’s fields?” Not for uncontrolled fields, which still reset, so the values have to be passed back.",
    takeaway: "When a submission fails, the user’s work and their next step are what matter.",
  },
  sources: [
    { label: "W3C: User notifications", href: "https://www.w3.org/WAI/tutorials/forms/notifications/" },
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
  ],
};
