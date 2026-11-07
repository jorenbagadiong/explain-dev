import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-it-does",
      heading: "What useFormStatus does",
      paragraphs: [
        "useFormStatus returns status information about the last submission of a parent form. It is a Hook from react-dom, not from react, because it depends on the DOM’s form element: import { useFormStatus } from \"react-dom\".",
        "This is the Hook that most clearly shows that not all Hooks come from the react package. It takes no parameters and returns an object with four fields.",
      ],
      list: [
        "pending: true while the parent form is submitting an Action, or running a Transition started from onSubmit.",
        "data: the FormData being submitted, or null when there is no active submission or no parent form.",
        "method: the form’s HTTP method, either get or post.",
        "action: the function passed to the form’s action prop, or null if there is none or it is a URL string.",
      ],
    },
    {
      id: "must-be-inside",
      heading: "It must be rendered inside the form",
      paragraphs: [
        "The calling component has to be rendered inside a form, and the Hook only reports on a parent form. It does not track a form rendered in the same component or in that component’s children. This is the most common mistake with this Hook, and it fails silently, with pending simply staying false.",
      ],
      examples: [
        {
          id: "submit-button",
          classification: "client",
          title: "A submit button that knows its form’s status",
          language: "tsx",
          code: `"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

async function saveProfile(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Saved", formData.get("name"));
}

export default function ProfileForm() {
  return (
    <form action={saveProfile}>
      <label>
        Name
        <input name="name" />
      </label>
      <SubmitButton />
    </form>
  );
}`,
          description: "SubmitButton is a separate component rendered inside the form, which is what makes this work. It can be reused in any form without receiving props.",
        },
      ],
    },
    {
      id: "reading-submitted-data",
      heading: "Reading what is being submitted",
      paragraphs: [
        "data holds the FormData during a submission, which lets you show useful feedback without passing anything through props.",
      ],
      examples: [
        {
          id: "status-data",
          classification: "client",
          title: "Showing the submitted value",
          language: "tsx",
          code: `"use client";

import { useFormStatus } from "react-dom";

export default function SubmissionNotice() {
  const { data } = useFormStatus();
  const name = data?.get("username");

  return <p role="status">{typeof name === "string" ? "Requesting " + name + "…" : ""}</p>;
}`,
          description: "FormData.get can return a string, a File, or null, so the check keeps the output a string.",
        },
      ],
    },
    {
      id: "with-on-submit",
      heading: "Using it with onSubmit",
      paragraphs: [
        "It also works with an onSubmit handler. Call event.preventDefault and start a Transition in the same handler, and components inside the form can read pending. Forms handled this way are not reset automatically, unlike those using the action prop.",
      ],
      examples: [
        {
          id: "on-submit",
          classification: "client",
          title: "A Transition started from onSubmit",
          language: "tsx",
          code: `"use client";

import { startTransition, type SubmitEvent } from "react";

async function submitAction(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(formData.get("email"));
}

export function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  startTransition(async () => {
    await submitAction(formData);
  });
}`,
          description: "The form data is read before the Transition starts, while the event’s current target is available.",
        },
      ],
    },
    {
      id: "choosing-between",
      heading: "How it relates to useActionState",
      paragraphs: [
        "Both can report pending status, and they answer different questions. useFormStatus suits a small reusable component deep inside a form. useActionState suits the component that owns the form and needs the Action’s result.",
      ],
      comparison: [
        {
          id: "form-status",
          title: "useFormStatus",
          items: ["From react-dom.", "Read by a child of the form.", "Reports status only, with no result."],
        },
        {
          id: "action-state",
          title: "useActionState",
          items: ["From react.", "Called in the component that owns the form.", "Holds the Action’s returned state too."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "same-component",
      heading: "Calling it in the component that renders the form",
      problem: "useFormStatus above <form> in one component looks natural, but it only reads a parent form. There is none above it, so pending stays false, and no error tells you why.",
      correction: "Move the call into a child component rendered inside the form.",
    },
    {
      id: "wrong-package",
      heading: "Importing it from react",
      problem: "Most Hooks come from react, so importing this one from there is a natural guess. It does not exist there, because it depends on the DOM, and the import fails at build time.",
      correction: "Import it from react-dom, as in import { useFormStatus } from \"react-dom\".",
    },
    {
      id: "url-action",
      heading: "Expecting pending with a plain form submission",
      problem: "A form with a URL action or no action prop submits with a browser navigation. There is no Action or Transition to track, so pending does not report the wait.",
      correction: "Use a function as the action, or start a Transition from onSubmit.",
    },
    {
      id: "use-form-state",
      heading: "Confusing it with useFormState",
      problem: "useFormState was an earlier name for what is now useActionState in react. Older examples use it, and mixing the two up leads you to look for fields or arguments that do not apply.",
      correction: "Use useActionState for an Action’s result, and useFormStatus for a form’s status.",
    },
  ],
  interview: [
    {
      id: "ufs-where-from",
      question: "Where does useFormStatus come from, and why?",
      answer: "It comes from react-dom, because it is tied to the DOM’s form element. It is a good reminder that not all Hooks are in the react package, and that a platform-specific renderer can provide its own Hooks.",
    },
    {
      id: "ufs-placement",
      question: "Why might pending always be false?",
      answer: "The component is probably not inside the form. The Hook only reports on a parent form, so calling it in the component that renders the form never sees a submission. It could also be that the form has no function action or Transition to track.",
    },
    {
      id: "ufs-fields",
      question: "What information does it return?",
      answer: "pending, whether a submission is running; data, the FormData being sent; method, either get or post; and action, the function passed to the form. Outside an active submission, data is null and pending is false.",
    },
    {
      id: "ufs-vs-uas",
      question: "When would you use useFormStatus instead of useActionState?",
      answer: "When a child component only needs to know about the submission, such as a reusable submit button. It needs no props, so any form can use it. If a component needs the Action’s returned result, useActionState is the right tool.",
    },
    {
      id: "ufs-benefit",
      question: "What is the design benefit of reading status this way?",
      answer: "It avoids prop drilling for a common need. A submit button works in any form without being told about pending state, and it behaves a bit like reading a context that the form provides to its descendants.",
    },
  ],
  takeaways: [
    "useFormStatus comes from react-dom, not react.",
    "It must be called in a component rendered inside the form.",
    "It reports pending, data, method, and action.",
    "It suits reusable children such as submit buttons.",
  ],
  quickReview: {
    definition: "useFormStatus is a React DOM Hook that reports the status of a parent form’s submission.",
    keyPoints: [
      "Import it from react-dom.",
      "It only reads a parent form.",
      "Returns pending, data, method, and action.",
      "It needs a function action or a Transition to track.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "client",
      title: "A status-aware button",
      language: "tsx",
      code: `"use client";

import { useFormStatus } from "react-dom";

export default function Submit() {
  const { pending } = useFormStatus();

  return <button disabled={pending}>Save</button>;
}`,
      description: "Render this inside a form, and it follows that form’s submission.",
    },
    commonMistakes: [
      "Calling it in the component that renders the form.",
      "Importing it from react.",
      "Expecting pending for a plain URL submission.",
    ],
    interviewTrap: "“Do all Hooks come from react?” No. useFormStatus comes from react-dom, because it depends on the DOM’s form.",
    takeaway: "Put it in a child of the form, and that child never needs a pending prop.",
  },
  sources: [
    { label: "useFormStatus reference", href: "https://react.dev/reference/react-dom/hooks/useFormStatus" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
  ],
};
