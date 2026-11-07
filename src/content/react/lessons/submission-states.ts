import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-it-matters",
      heading: "Why pending states matter",
      paragraphs: [
        "Between pressing Submit and getting a response, a user sees nothing unless you show it. They may wonder whether anything happened and press again, which can send a duplicate order or message.",
        "A good pending state answers three questions: did my action register, is it still running, and what can I do now? Declarative state makes this simple, because each situation is a value you can render.",
      ],
      visual: {
        heading: "The states of a submission",
        context: "Indentation shows which state can follow which.",
        root: {
          id: "typing",
          title: "Typing",
          description: "The form is ready, and the submit button is enabled.",
          children: [
            {
              id: "submitting",
              title: "Submitting",
              description: "Show progress, and prevent a duplicate submission.",
              children: [
                { id: "success", title: "Success", description: "Confirm the result, or show what comes next." },
                { id: "error", title: "Error", description: "Explain what went wrong, keep the input, and allow a retry." },
              ],
            },
          ],
        },
        note: "Success and Error are alternatives. Keep one status value, so that a form can never be in two of these at once.",
      },
    },
    {
      id: "reading-status",
      heading: "Three ways to read pending status",
      paragraphs: [
        "React 19 offers tools that fit different situations, and you do not need all of them. Choose based on where the code that needs to know is located.",
      ],
      comparison: [
        {
          id: "form-status",
          title: "useFormStatus",
          items: ["In a child of the form.", "Comes from react-dom.", "Ideal for reusable submit buttons."],
        },
        {
          id: "action-state",
          title: "useActionState",
          items: ["In the component owning the form.", "Also holds the Action’s result.", "Ideal when you also need errors."],
        },
      ],
      closing: "useTransition gives isPending for Actions started from something other than a form, and a plain status state works in any React version.",
      examples: [
        {
          id: "submit-button-status",
          classification: "client",
          title: "A reusable pending button",
          language: "tsx",
          code: `"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

async function save(formData: FormData) {
  await fetch("/api/profile", { method: "POST", body: formData });
}

export default function ProfileForm() {
  return (
    <form action={save}>
      <label>
        Name
        <input name="name" />
      </label>
      <SubmitButton label="Save" pendingLabel="Saving…" />
    </form>
  );
}`,
          description: "The button works in any form with no props for status. The label changes, so progress is not conveyed by appearance alone.",
        },
      ],
    },
    {
      id: "duplicates",
      heading: "Preventing duplicate submissions",
      paragraphs: [
        "Disabling the submit button while pending is the common approach, and it stops repeat clicks and Enter presses from the button. It is not complete on its own, since a request could still be retried by a network or by another tab.",
        "If a duplicate would be harmful, such as a payment, the server has to deal with it too, for example by using an idempotency key. The client’s part is to make accidental repeats unlikely.",
      ],
    },
    {
      id: "announcing",
      heading: "Announcing progress and results",
      paragraphs: [
        "A spinner that only appears visually tells screen reader users nothing. Use text in a live region, and keep that region mounted, because content added together with a new live region may not be announced.",
        "Be careful with disabling a focused button: focus can be lost in some browsers when that happens. aria-disabled keeps it focusable, in which case your handler has to ignore activation while pending.",
      ],
      examples: [
        {
          id: "status-region",
          classification: "client",
          title: "A status region that stays mounted",
          language: "tsx",
          code: `"use client";

import { useActionState } from "react";

type Result = { status: "idle" | "saved" | "failed"; message: string };

const initialResult: Result = { status: "idle", message: "" };

async function saveNote(_previous: Result, formData: FormData): Promise<Result> {
  const response = await fetch("/api/notes", { method: "POST", body: formData });
  return response.ok ? { status: "saved", message: "Note saved." } : { status: "failed", message: "The note could not be saved. Try again." };
}

export default function NoteForm() {
  const [result, formAction, isPending] = useActionState(saveNote, initialResult);

  return (
    <form action={formAction}>
      <label>
        Note
        <textarea name="note" />
      </label>
      <button type="submit" aria-disabled={isPending}>
        Save
      </button>
      <p role="status">{isPending ? "Saving…" : result.message}</p>
    </form>
  );
}`,
          description: "The paragraph is always rendered, so changes to its text are announced. Here, aria-disabled keeps the button focusable, although dispatches are queued rather than dropped, so a repeat would still run. If that matters, also guard against it.",
        },
      ],
    },
    {
      id: "slow-and-fast",
      heading: "Handling very fast and very slow responses",
      paragraphs: [
        "A spinner that flashes for 50ms can feel like a glitch, while a long wait with no extra information feels broken. Consider delaying a spinner very briefly with CSS, and adding a message for long waits. Do not invent a fake progress bar, because a percentage should reflect real progress.",
      ],
    },
  ],
  mistakes: [
    {
      id: "no-feedback",
      heading: "Showing no feedback at all",
      problem: "A form that gives no sign of submitting looks broken on a slow connection. People press again, which can create duplicates, or they leave the page and lose their work.",
      correction: "Change the button’s text and show progress as soon as submission starts.",
    },
    {
      id: "booleans-status",
      heading: "Tracking status with several booleans",
      problem: "isSubmitting, isSuccess, and isError can disagree, for example after a forgotten reset, and the page then shows a spinner and a success message at the same time.",
      correction: "Use one status value, or the results from useActionState.",
    },
    {
      id: "form-status-wrong-place",
      heading: "Reading useFormStatus in the form’s own component",
      problem: "Calling it in the component that renders the form gives pending false forever, because it only reads a parent form. The button never shows progress, with no error to explain why.",
      correction: "Put the call in a child component rendered inside the form.",
    },
    {
      id: "spinner-only",
      heading: "Using only a visual spinner",
      problem: "An animated icon gives no information to assistive technology and may be missed by others. If the icon also replaces the button’s text, the button has no accessible name while it is pending.",
      correction: "Keep a text label, and announce status changes through a live region.",
    },
    {
      id: "clearing-on-error",
      heading: "Clearing the form when the request fails",
      problem: "Resetting fields before knowing the result means a failed request loses the user’s work. Having to retype a long message because of a brief network error is a good reason to give up.",
      correction: "Keep the values until success, and give a clear way to retry.",
    },
  ],
  interview: [
    {
      id: "ss-how",
      question: "How do you show a pending state on a form in React 19?",
      answer: "For a child inside the form, use useFormStatus, which comes from react-dom. For the component owning the form, useActionState gives isPending as well as the result. For Actions started elsewhere, useTransition provides isPending too.",
    },
    {
      id: "ss-duplicate",
      question: "How do you prevent double submission?",
      answer: "On the client, disable or guard the submit control while pending. That only reduces accidental repeats, so for operations where a duplicate is harmful, the server must also protect itself, such as with an idempotency key.",
    },
    {
      id: "ss-a11y",
      question: "How do you make submission status accessible?",
      answer: "Use text rather than only a spinner, and announce changes with a live region that stays mounted. Keep focus somewhere sensible, since disabling a focused button can lose it, and aria-disabled is an option when focus must stay.",
    },
    {
      id: "ss-status-shape",
      question: "How would you model submission state?",
      answer: "With a single status value, such as idle, submitting, success, or error, instead of several booleans that could disagree. Anything else, such as whether the button is disabled, is calculated from it, so impossible combinations cannot occur.",
    },
    {
      id: "ss-errors",
      question: "What should happen to the form when a submission fails?",
      answer: "Keep what the user typed, explain what went wrong in plain language, and make retrying easy. Return expected failures as state rather than throwing, so the form stays on screen rather than being replaced by an Error Boundary’s fallback.",
    },
  ],
  takeaways: [
    "Show progress immediately, so that people know their action registered.",
    "Choose useFormStatus or useActionState depending on where you need the status.",
    "Use a single status value, and calculate the rest.",
    "Announce results with text, and keep the user’s input on failure.",
  ],
  quickReview: {
    definition: "Pending and submission states communicate what a form is doing, from typing through submitting to success or error.",
    keyPoints: [
      "useFormStatus works in children of the form.",
      "useActionState works in the form’s owner.",
      "Disabling only reduces duplicates, so servers must protect themselves too.",
      "Use text and a mounted live region.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "client",
      title: "A pending label",
      language: "tsx",
      code: `"use client";

import { useFormStatus } from "react-dom";

export default function Save() {
  const { pending } = useFormStatus();

  return <button disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}`,
      description: "Render this inside a form, and it follows that form’s submission.",
    },
    commonMistakes: [
      "Showing nothing while a request runs.",
      "Tracking status with several booleans.",
      "Clearing the fields when a request fails.",
    ],
    interviewTrap: "“Does disabling the button fully prevent duplicate orders?” No. It reduces accidents, while the server has to handle repeats for anything that matters.",
    takeaway: "Treat every submission as a small state machine, and show each state clearly.",
  },
  sources: [
    { label: "useFormStatus reference", href: "https://react.dev/reference/react-dom/hooks/useFormStatus" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
    { label: "Reacting to Input with State", href: "https://react.dev/learn/reacting-to-input-with-state" },
    { label: "W3C: Forms tutorial", href: "https://www.w3.org/WAI/tutorials/forms/" },
  ],
};
