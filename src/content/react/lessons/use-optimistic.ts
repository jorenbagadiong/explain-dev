import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useOptimistic does",
      paragraphs: [
        "useOptimistic shows an anticipated result while an Action is running, so the interface responds before the server does. It returns the state to display and a function to set the temporary value: const [optimisticState, setOptimistic] = useOptimistic(value, reducer).",
        "Optimistic state is temporary. While no Action is pending, optimisticState simply equals value. It only differs during an Action, and when that Action ends, React goes back to showing the real value.",
      ],
      examples: [
        {
          id: "like-button",
          classification: "client",
          title: "An optimistic like button",
          language: "tsx",
          code: `"use client";

import { startTransition, useOptimistic, useState } from "react";

async function saveLike(next: boolean): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return next;
}

export default function LikeButton() {
  const [isLiked, setIsLiked] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(isLiked);

  function handleClick() {
    startTransition(async () => {
      const next = !optimisticLiked;
      setOptimisticLiked(next);
      const saved = await saveLike(next);
      startTransition(() => setIsLiked(saved));
    });
  }

  return (
    <button type="button" aria-pressed={optimisticLiked} onClick={handleClick}>
      {optimisticLiked ? "Liked" : "Like"}
    </button>
  );
}`,
          description: "The label changes at once. The timeout stands in for a real request. A state update after await needs its own startTransition, because the first one no longer tracks it.",
        },
      ],
    },
    {
      id: "lifecycle",
      heading: "The lifecycle of an optimistic update",
      paragraphs: [
        "Because the value and the optimistic state commit together in one render, no extra render is needed to clear the optimistic value.",
      ],
      visual: {
        heading: "From click to settled",
        context: "This follows one optimistic update through an Action.",
        steps: [
          { id: "immediate", title: "React renders the optimistic value", description: "setOptimistic(next) shows the anticipated result straight away." },
          { id: "waiting", title: "The Action awaits", description: "React keeps showing the optimistic value during the wait." },
          { id: "real-update", title: "The real state is set", description: "Your code schedules the update with what the server returned." },
          { id: "converge", title: "Both commit together", description: "value and the optimistic state show the same result." },
        ],
        note: "If the server returned something different, that is what appears, since the optimistic value was only ever temporary.",
      },
    },
    {
      id: "failure",
      heading: "What happens when the Action fails",
      paragraphs: [
        "If the Action throws, the Transition still ends, and React renders the current value. If your code only updates the real state on success, the interface reverts on its own to what it showed before. There is no rollback code to write.",
        "That automatic revert is silent, though. Users need to know their change did not stick, so catch the error and show a message.",
      ],
      examples: [
        {
          id: "failure-message",
          classification: "client",
          title: "Reporting a failed save",
          language: "tsx",
          code: `"use client";

import { startTransition, useOptimistic, useState } from "react";

async function saveName(name: string): Promise<string> {
  if (name.trim() === "") throw new Error("A name is required.");
  return name.trim();
}

export default function NameEditor() {
  const [name, setName] = useState("Ana");
  const [error, setError] = useState<string | null>(null);
  const [optimisticName, setOptimisticName] = useOptimistic(name);

  function formAction(formData: FormData) {
    const next = String(formData.get("name") ?? "");
    setError(null);
    setOptimisticName(next);

    return saveName(next).then(
      saved => startTransition(() => setName(saved)),
      (failure: Error) => startTransition(() => setError(failure.message)),
    );
  }

  return (
    <form action={formAction}>
      <p>Your name is: {optimisticName}</p>
      <label>
        New name
        <input name="name" />
      </label>
      <button type="submit">Save</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}`,
          description: "A form action already runs in a Transition, so it can set the optimistic value directly. On failure, the name reverts and the message explains why.",
        },
      ],
    },
    {
      id: "reducers",
      heading: "Using a reducer for lists",
      paragraphs: [
        "With an optional reducer, the value you pass to the setter becomes the reducer’s second argument. This suits adding to a list. The reducer must be pure, and it re-runs with the latest base value if that changes while the Action is pending.",
      ],
      examples: [
        {
          id: "optimistic-list",
          classification: "client",
          title: "Adding to a list optimistically",
          language: "tsx",
          code: `"use client";

import { useOptimistic } from "react";

interface Comment {
  id: string;
  text: string;
  isPending?: boolean;
}

export default function Comments({ comments, addComment }: { comments: readonly Comment[]; addComment: (text: string) => Promise<void> }) {
  const [optimisticComments, addOptimistic] = useOptimistic(comments, (current: readonly Comment[], pending: { id: string; text: string }) => [
    ...current,
    { ...pending, isPending: true },
  ]);

  async function formAction(formData: FormData) {
    const text = String(formData.get("text") ?? "");
    addOptimistic({ id: "pending-" + crypto.randomUUID(), text });
    await addComment(text);
  }

  return (
    <>
      <ul>
        {optimisticComments.map(comment => (
          <li key={comment.id}>
            {comment.text} {comment.isPending && <em>(Sending…)</em>}
          </li>
        ))}
      </ul>
      <form action={formAction}>
        <label>
          Comment
          <input name="text" />
        </label>
        <button type="submit">Post</button>
      </form>
    </>
  );
}`,
          description: "The Action creates each temporary ID before calling the pure reducer, so identical pending comments still have distinct keys. The pending label uses text rather than only color. addComment must update the parent’s confirmed comments before it resolves.",
        },
      ],
    },
    {
      id: "when-to-use",
      heading: "When an optimistic update is the wrong choice",
      paragraphs: [
        "Optimistic updates suit actions that nearly always succeed and are easy to undo, such as a like. They fit poorly when failure is common, or when a false success would matter.",
      ],
      list: [
        "Payments, deletions of important data, or anything irreversible should show real progress and a confirmed result.",
        "If the server’s answer often differs from the guess, the correction may confuse users.",
        "Interfaces must still make failure visible, since a silent revert looks like a bug.",
      ],
    },
  ],
  mistakes: [
    {
      id: "outside-action",
      heading: "Calling the setter outside an Action",
      problem: "Calling setOptimistic from an ordinary click handler logs a warning that an optimistic update occurred outside a Transition or Action. The value flashes and reverts, because nothing holds it while the work runs.",
      correction: "Call it inside startTransition, or inside a function passed to an Action prop such as form action.",
    },
    {
      id: "during-render",
      heading: "Calling the setter during rendering",
      problem: "Setting an optimistic value in the component body throws an error saying React cannot update optimistic state while rendering. It is a simple mistake when deriving a value feels like the goal.",
      correction: "Call it only from event handlers, Effects, or Actions. If the value can be calculated, calculate it without this Hook.",
    },
    {
      id: "no-real-update",
      heading: "Forgetting to update the real state",
      problem: "An optimistic value that never gets a real update disappears when the Action finishes, so the interface snaps back and looks as if the save failed, even when it worked.",
      correction: "Set the real state, or update the parent, with the returned result before the Action ends.",
    },
    {
      id: "hardcoded-base",
      heading: "Using a hard-coded base value",
      problem: "useOptimistic(false) always returns to false after the Action, whatever really happened. The button looks correct while saving and then resets, and the actual state is never reflected.",
      correction: "Pass a prop or state value as the base, so the result follows what the parent sets.",
    },
    {
      id: "silent-failure",
      heading: "Letting failures revert silently",
      problem: "The automatic revert handles the display but explains nothing. A user sees their change vanish with no message, and they may assume the application is broken or try the action again.",
      correction: "Catch the error, and show a clear message alongside the reverted value.",
    },
  ],
  interview: [
    {
      id: "uo-what",
      question: "What does useOptimistic do?",
      answer: "It displays an anticipated value while an Action is pending, then returns to the real value. It takes the real value and an optional reducer, and it returns the state to show and a setter. Outside an Action, the returned state equals the real value.",
    },
    {
      id: "uo-rollback",
      question: "How does rollback work if the request fails?",
      answer: "No rollback code is needed. When the Action ends, the optimistic value is discarded and React renders the current real value. If that was only updated on success, the UI reverts. You should still catch the error and tell the user.",
    },
    {
      id: "uo-transition",
      question: "Why must the setter be called inside an Action?",
      answer: "The Action is what defines how long the optimistic value lives. Outside one, nothing holds it during the async work, so it flashes and reverts, and React logs a warning. startTransition or an Action prop provides that scope.",
    },
    {
      id: "uo-after-await",
      question: "Why is another startTransition needed after an await?",
      answer: "JavaScript cannot carry the Transition’s context across an await. Updates after that point are not tracked as part of it. Wrapping them in a new startTransition keeps them together, which is a current limitation of React’s Actions.",
    },
    {
      id: "uo-when",
      question: "When would you avoid an optimistic update?",
      answer: "When failure is common or costly, such as payments or irreversible actions, where showing a false success could mislead someone. I would show real progress there. Optimism fits frequent, low-risk, easily undone actions such as likes.",
    },
    {
      id: "uo-reconcile",
      question: "What if the server returns a different value from the optimistic one?",
      answer: "The real value wins. The optimistic state was temporary, so when the Action ends, both show what the server returned. That can look like a correction, which is another reason to use it only where the guess is usually right.",
    },
  ],
  takeaways: [
    "useOptimistic shows a temporary value while an Action is pending.",
    "It must be set inside an Action or a Transition.",
    "Failure reverts on its own, but users still need an explanation.",
    "Use it for low-risk actions that usually succeed.",
  ],
  quickReview: {
    definition: "useOptimistic shows a temporary anticipated value during an Action, then returns to the real value.",
    keyPoints: [
      "Outside an Action, the optimistic state equals the real value.",
      "An Action prop or startTransition is required.",
      "Real and optimistic values commit together.",
      "A pure reducer can merge updates into lists.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Setting a temporary value",
      language: "tsx",
      code: `startTransition(async () => {
  setOptimisticName(next);
  await saveName(next);
});`,
      typecheckContext: { before: `import { startTransition } from "react";\ndeclare const next: string;\ndeclare const setOptimisticName: (value: string) => void;\ndeclare const saveName: (value: string) => Promise<void>;` },
      description: "The value stays optimistic until the async function finishes.",
    },
    commonMistakes: [
      "Setting it outside an Action, so it flashes and reverts.",
      "Never updating the real state afterwards.",
      "Reverting on failure with no message.",
    ],
    interviewTrap: "“Do you have to write rollback code?” No. When the Action ends, React shows the real value again, although you should still report the failure.",
    takeaway: "Show the likely result now, keep the real value in charge, and be honest when it fails.",
  },
  sources: [
    { label: "useOptimistic reference", href: "https://react.dev/reference/react/useOptimistic" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
  ],
};
