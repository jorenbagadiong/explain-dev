import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-means",
      heading: "What an optimistic form is",
      paragraphs: [
        "An optimistic form shows the expected result right after submit, before the server responds. A sent message appears in the conversation at once, marked as sending. If it fails, the message is removed or marked as failed, with a way to retry.",
        "Done well, this makes an interface feel immediate. Done badly, it tells people something succeeded when it did not, so the honesty of the pending and failure states is what makes it acceptable.",
      ],
      visual: {
        heading: "What the user sees",
        context: "Indentation shows which state can follow which.",
        root: {
          id: "submit",
          title: "Submitted",
          description: "The new item appears at once, visibly marked as pending.",
          children: [
            { id: "confirmed", title: "Confirmed", description: "The server’s version replaces the temporary item, and the pending mark goes away." },
            { id: "failed", title: "Failed", description: "The temporary item is gone, and a message explains what happened and allows a retry." },
          ],
        },
        note: "The item never appears as finished until the server has confirmed it.",
      },
    },
    {
      id: "implementing",
      heading: "Implementing it with a form Action",
      paragraphs: [
        "useOptimistic works naturally in a form Action, since Actions already run in a Transition. Set the optimistic value first, await the request, and then update the real state, which replaces the temporary item.",
      ],
      examples: [
        {
          id: "chat-form",
          classification: "client",
          title: "An optimistic message list",
          language: "tsx",
          code: `"use client";

import { startTransition, useOptimistic, useState } from "react";

interface Message {
  id: string;
  text: string;
  isSending?: boolean;
}

async function postMessage(text: string): Promise<Message> {
  const response = await fetch("/api/messages", { method: "POST", body: JSON.stringify({ text }) });
  if (!response.ok) throw new Error("The message could not be sent.");
  return response.json();
}

export default function Chat() {
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, addOptimistic] = useOptimistic(messages, (current: readonly Message[], text: string) => [
    ...current,
    { id: "pending-" + current.length, text, isSending: true },
  ]);

  async function send(formData: FormData) {
    const text = String(formData.get("text") ?? "");
    setError(null);
    addOptimistic(text);

    try {
      const saved = await postMessage(text);
      startTransition(() => setMessages(previous => [...previous, saved]));
    } catch (failure) {
      startTransition(() => setError(failure instanceof Error ? failure.message : "Something went wrong."));
    }
  }

  return (
    <>
      <ul>
        {optimisticMessages.map(message => (
          <li key={message.id}>
            {message.text} {message.isSending && <small>Sending…</small>}
          </li>
        ))}
      </ul>
      <form action={send}>
        <label>
          Message
          <input name="text" required />
        </label>
        <button type="submit">Send</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </>
  );
}`,
          description: "The message appears at once with a text label. On failure, React drops the optimistic item when the Action ends, and the alert explains why.",
        },
      ],
    },
    {
      id: "failure-recovery",
      heading: "Recovering from failure",
      paragraphs: [
        "A form Action resets uncontrolled fields after it finishes, including when you catch an error and return normally. So in the example above, a failed message’s text would vanish from the input as well as from the list. Keep the text so that the person can retry.",
        "One approach is to restore the text as a defaultValue from state on failure. Another is to keep failed items in the list, marked as failed, each with its own retry button.",
      ],
      list: [
        "Say that it failed, clearly and in text.",
        "Keep what the person wrote.",
        "Offer a retry that does not require re-entering anything.",
        "If several submissions can be in flight, tell which one failed.",
      ],
    },
    {
      id: "where-it-fits",
      heading: "Where optimism fits",
      paragraphs: [
        "The question is what happens if the guess is wrong, and how likely that is.",
      ],
      comparison: [
        {
          id: "fits",
          title: "Usually fits",
          items: ["Likes, reactions, and bookmarks.", "Chat messages with a visible sending state.", "Reordering, or toggling a preference."],
        },
        {
          id: "does-not-fit",
          title: "Usually does not",
          items: ["Payments and purchases.", "Deleting something that cannot be restored.", "Anything where validation often fails on the server."],
        },
      ],
    },
    {
      id: "accessibility",
      heading: "Keeping it honest for everyone",
      paragraphs: [
        "A pending state shown only through dimmed color can be invisible to some people. Use a text label, and announce failures with a live region or role=\"alert\". Keep focus somewhere sensible too, because a failed item being removed from a list could take focus with it, if something inside it was focused.",
      ],
    },
  ],
  mistakes: [
    {
      id: "looks-final",
      heading: "Making pending items look final",
      problem: "An optimistic message that looks identical to a sent one implies success. If the request fails or the user closes the tab, they believe something was delivered that never arrived.",
      correction: "Mark pending items visibly, with text, until the server confirms them.",
    },
    {
      id: "silent-revert",
      heading: "Removing failed items without explanation",
      problem: "useOptimistic reverts on its own, so a failed item simply disappears. Without a message, it looks like a glitch, and people may not realize that they need to send it again.",
      correction: "Catch the error, and show what happened with a way to retry.",
    },
    {
      id: "losing-text",
      heading: "Losing the input when a request fails",
      problem: "A form Action resets uncontrolled fields after finishing, even when your code caught the error. The input is empty, and the optimistic item has gone, so the person’s message is lost entirely.",
      correction: "Preserve the text, either through state for defaultValue, or by keeping failed items in the list.",
    },
    {
      id: "risky-actions",
      heading: "Being optimistic about risky actions",
      problem: "Showing a payment as complete before confirmation can lead someone to leave, or to pay twice after a failure. An optimistic update here saves little time, and the cost of being wrong is high.",
      correction: "Show a real pending state and wait for confirmation.",
    },
    {
      id: "temp-id-collision",
      heading: "Reusing the temporary ID as the real one",
      problem: "Keeping a client-made ID for an optimistic item can collide with others, or fail to match the server’s record, which leads to duplicate keys or items that cannot be updated afterwards.",
      correction: "Use a clearly temporary ID, and replace the item with the server’s version when it returns.",
    },
  ],
  interview: [
    {
      id: "of-what",
      question: "What is an optimistic form interaction?",
      answer: "Showing the expected result right after submit, before the server responds, with a clear pending mark. If the request fails, the item is removed or marked as failed, and the user gets an explanation and a way to retry. It trades certainty for responsiveness.",
    },
    {
      id: "of-when",
      question: "When would you avoid optimistic updates in a form?",
      answer: "When a wrong guess is costly or common, such as payments, irreversible deletion, or input that often fails server validation. A false success there could mislead someone. A real pending state is more honest, even if slower.",
    },
    {
      id: "of-failure",
      question: "What should happen when an optimistic submission fails?",
      answer: "The temporary item goes away or is marked as failed. The user is told what happened in text, what they wrote is preserved, and a retry is easy. useOptimistic handles the revert, but the explanation and the preserved input are your responsibility.",
    },
    {
      id: "of-reset",
      question: "Why might a user’s input vanish after a failed optimistic submission?",
      answer: "A function form action resets uncontrolled fields after it finishes, and catching the error counts as finishing. Only a thrown error prevents the reset, and that goes to an Error Boundary. So you have to store the text and restore it.",
    },
    {
      id: "of-ordering",
      question: "What problems appear with several in-flight submissions?",
      answer: "Responses can arrive out of order, and one may fail while others succeed, so the list must not be overwritten by an older response. Items need identities, and failures must point to the right one. useActionState queues dispatches if strict ordering is the priority.",
    },
    {
      id: "of-a11y",
      question: "How do you keep optimistic UI accessible?",
      answer: "Use text for pending status, not only dimming, and announce failures with role alert or a live region. Manage focus if a focused element might be removed. People using assistive technology need to know just as clearly that the action has not finished.",
    },
  ],
  takeaways: [
    "Optimistic forms show the expected result, while marking it as pending.",
    "Failure needs an explanation, preserved input, and a retry.",
    "Use it where a wrong guess is rare and cheap.",
    "Convey pending and failed states in text.",
  ],
  quickReview: {
    definition: "An optimistic form shows the anticipated result immediately, keeps it visibly pending, and recovers clearly if the request fails.",
    keyPoints: [
      "useOptimistic plus a form Action is the React 19 approach.",
      "The revert is automatic, but the explanation is not.",
      "Uncontrolled fields reset after the Action finishes.",
      "Avoid it for payments and irreversible actions.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Inside a form Action",
      language: "tsx",
      code: `async function send(formData: FormData) {
  const text = String(formData.get("text") ?? "");
  addOptimistic(text);
  await postMessage(text);
}`,
      typecheckContext: { before: `declare const addOptimistic: (text: string) => void;\ndeclare const postMessage: (text: string) => Promise<void>;` },
      description: "The optimistic value holds until the function finishes.",
    },
    commonMistakes: [
      "Making pending items look finished.",
      "Letting failed items vanish silently.",
      "Losing the input when the request fails.",
    ],
    interviewTrap: "“Does catching the error keep the form’s text?” No. The Action finished normally, so uncontrolled fields still reset.",
    takeaway: "Be fast, but never claim success you do not have.",
  },
  sources: [
    { label: "useOptimistic reference", href: "https://react.dev/reference/react/useOptimistic" },
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
  ],
};
