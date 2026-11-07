import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-focus-matters",
      heading: "Why focus needs managing",
      paragraphs: [
        "Keyboard focus marks where the next key press goes. Normally the browser handles it, and you should let it. The problem comes when your interface changes around the focused element: a dialog opens, a list item is deleted, or new content replaces old.",
        "If a focused element is removed, focus can fall back to the page’s body, and a keyboard user gets sent back to the start. So when an interaction changes what is on screen, decide where focus should go. The rule is to move it deliberately and rarely.",
      ],
    },
    {
      id: "moving-focus",
      heading: "Moving focus with a ref",
      paragraphs: [
        "Focus is imperative, since there is no prop that means focus this now. Use a ref and call focus, usually from an event handler. If the element has only just been created by a state update, it does not exist yet, so focus it from an Effect or a ref callback after the commit.",
      ],
      examples: [
        {
          id: "focus-after-reveal",
          classification: "complete",
          title: "Focusing a field that just appeared",
          language: "tsx",
          code: `import { useEffect, useRef, useState } from "react";

export default function EditableName({ name }: { name: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <label>
        Name
        <input ref={inputRef} defaultValue={name} onBlur={() => setIsEditing(false)} />
      </label>
    );
  }

  return (
    <button type="button" onClick={() => setIsEditing(true)}>
      Edit {name}
    </button>
  );
}`,
          description: "The Effect runs after the commit, when the input exists. Calling focus in the click handler would be too early, because nothing has been rendered yet.",
        },
      ],
    },
    {
      id: "dialogs",
      heading: "Dialogs",
      paragraphs: [
        "Modal dialogs are the classic case, with well-defined expectations from the WAI-ARIA dialog pattern.",
      ],
      list: [
        "When it opens, focus moves inside, usually to the first focusable element. For long content, focus a heading with tabIndex={-1}. For irreversible actions, focus the least destructive option.",
        "Tab and Shift+Tab cycle within the dialog.",
        "Escape closes it.",
        "When it closes, focus returns to the element that opened it, unless that element is gone or another target makes more sense.",
      ],
      examples: [
        {
          id: "native-dialog",
          classification: "client",
          title: "The native dialog element",
          language: "tsx",
          code: `"use client";

import { useRef } from "react";

export default function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Delete file
      </button>
      <dialog ref={dialogRef} aria-labelledby="confirm-title">
        <h2 id="confirm-title">Delete this file?</h2>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          Delete
        </button>
      </dialog>
    </>
  );
}`,
          description: "showModal keeps focus within the dialog, makes the page behind it inert, handles Escape, and returns focus on close in current browsers. Cancel comes first in the markup, so it receives focus. A hard-coded id is shown for brevity, so use useId if the component may appear more than once.",
        },
      ],
    },
    {
      id: "removed-content",
      heading: "When the focused content is removed",
      paragraphs: [
        "If someone deletes a list item using a button inside it, that button disappears. Focus should go somewhere logical, not to the body. Usually that is the next item, or the previous one if there is no next, or a heading if the list is now empty.",
      ],
      examples: [
        {
          id: "focus-after-delete",
          classification: "complete",
          title: "Moving focus after deleting an item",
          language: "tsx",
          code: `import { useRef, useState } from "react";

export default function TagList({ initialTags }: { initialTags: readonly string[] }) {
  const [tags, setTags] = useState(initialTags);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function remove(tag: string) {
    setTags(tags.filter(item => item !== tag));
    // Moves focus to a stable element that survives the update.
    headingRef.current?.focus();
  }

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1}>
        Tags ({tags.length})
      </h2>
      <ul>
        {tags.map(tag => (
          <li key={tag}>
            {tag}
            <button type="button" onClick={() => remove(tag)}>
              Remove {tag}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}`,
          description: "tabIndex={-1} makes the heading focusable from code without adding it to the tab order. Each button also names its item, so its purpose is clear out of context.",
        },
      ],
    },
    {
      id: "route-changes",
      heading: "Route changes and new content",
      paragraphs: [
        "A full page load resets focus, but client-side navigation does not, unless a framework or your code handles it. Many apps move focus to the new page’s heading or main region, and frameworks differ in what they provide, so check yours.",
        "Do not steal focus for things that merely appear. A toast or a loaded result does not need focus, and moving it there interrupts what someone is doing. Announce those with a live region instead.",
      ],
      comparison: [
        {
          id: "move",
          title: "Move focus when",
          items: ["A dialog opens or closes.", "The focused element is removed.", "A failed form needs attention.", "The user navigated to new content."],
        },
        {
          id: "do-not-move",
          title: "Do not move focus when",
          items: ["A toast or status message appears.", "Data loads in the background.", "Something updates elsewhere on the page."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "lost-to-body",
      heading: "Letting focus fall back to the body",
      problem: "When a focused element is removed, keyboard users are sent back to the start of the page, and must tab through everything again. Sighted mouse users never notice, so it is often missed in testing.",
      correction: "Move focus to a logical remaining element before or as the content disappears.",
    },
    {
      id: "focus-too-early",
      heading: "Focusing before the element exists",
      problem: "Calling ref.current.focus() right after a setter fails because React has not rendered yet. current is null or still points to the old node, and the focus never moves.",
      correction: "Focus from an Effect after the commit, or use a ref callback.",
    },
    {
      id: "outline-removed",
      heading: "Removing the focus outline",
      problem: "outline: none makes a design cleaner for mouse users, and keyboard users can no longer tell where they are. Removing outlines with no replacement is a named WCAG failure.",
      correction: "Keep the outline, or replace it with a clearly visible style using :focus-visible.",
    },
    {
      id: "stealing-focus",
      heading: "Moving focus when something merely appears",
      problem: "Focusing a toast or newly loaded panel interrupts typing, and it can scroll the page unexpectedly. Someone in the middle of a task finds their next key press going somewhere else.",
      correction: "Use a live region for announcements, and only move focus in response to the user’s action.",
    },
    {
      id: "positive-tabindex",
      heading: "Using positive tabIndex values",
      problem: "tabIndex={3} forces a custom order that breaks away from the DOM, and it is hard to maintain, since other elements then need numbers too. The W3C guidance strongly advises against it.",
      correction: "Fix the DOM order, and use only 0 or -1.",
    },
  ],
  interview: [
    {
      id: "fm-when",
      question: "When should you move focus programmatically?",
      answer: "When an interaction changes the UI around the focused element: a dialog opens or closes, a focused item is removed, a failed form needs attention, or the user navigates. Otherwise, I leave it to the browser, because unexpected focus changes disorient people.",
    },
    {
      id: "fm-new-element",
      question: "How do you focus an element that was just rendered by a state update?",
      answer: "Wait until after the commit, because it does not exist before then. Use an Effect keyed on the state that reveals it, or a ref callback. flushSync is an option if you must do it in the handler, but it is rarely needed.",
    },
    {
      id: "fm-dialog",
      question: "What is the expected focus behavior for a modal dialog?",
      answer: "Focus moves inside on open, Tab and Shift+Tab cycle within it, and Escape closes it. On close, focus returns to the element that opened it. The native dialog element with showModal provides most of this, which is why I would consider it first.",
    },
    {
      id: "fm-tabindex",
      question: "What do tabIndex values 0 and -1 mean?",
      answer: "0 puts an element in the normal tab order. -1 makes it focusable from code but leaves it out of the tab order, which suits headings or containers you need to focus programmatically. Positive values reorder tabbing and should be avoided.",
    },
    {
      id: "fm-delete",
      question: "Where should focus go after deleting the focused list item?",
      answer: "To something logical that survives, such as the next item, the previous one if it was last, or the list’s heading if it is now empty. Without this, focus falls to the body, and a keyboard user loses their place in the page.",
    },
    {
      id: "fm-toast",
      question: "Should a toast notification receive focus?",
      answer: "Generally no, because moving focus interrupts whatever someone was doing. Announce it with a live region instead. If it contains something that needs a response, a persistent dialog or inline message is more appropriate than a toast.",
    },
  ],
  takeaways: [
    "Let the browser handle focus, unless your interaction changes the UI around it.",
    "Focus new elements after the commit, not right after a setter.",
    "Never let focus fall to the body, and keep the focus indicator visible.",
    "Announce status changes without moving focus.",
  ],
  quickReview: {
    definition: "Focus management is deliberately moving or restoring keyboard focus when an interaction changes what is on screen.",
    keyPoints: [
      "Refs and focus are the imperative tool.",
      "tabIndex={-1} allows focus from code only.",
      "Dialogs move focus in, contain it, and return it.",
      "Use live regions for announcements.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Focus after the commit",
      language: "tsx",
      code: `useEffect(() => {
  if (isOpen) panelRef.current?.focus();
}, [isOpen]);`,
      typecheckContext: { before: `import { useEffect, useRef } from "react";\nexport function useExample(isOpen: boolean) {\nconst panelRef = useRef<HTMLDivElement>(null);`, after: "return panelRef;\n}" },
      description: "This runs after the panel exists, which a click handler would not have waited for.",
    },
    commonMistakes: [
      "Letting focus fall to the body after a removal.",
      "Calling focus before React has rendered the element.",
      "Removing outlines with no replacement.",
    ],
    interviewTrap: "“Why doesn’t ref.current.focus() work right after setIsOpen(true)?” The element has not been rendered yet, so wait for the commit.",
    takeaway: "Ask where someone’s next key press should go whenever the screen changes.",
  },
  sources: [
    { label: "ARIA APG: Keyboard interface", href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/" },
    { label: "ARIA APG: Modal dialog", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
    { label: "WCAG: Focus Visible", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" },
    { label: "Manipulating the DOM with Refs", href: "https://react.dev/learn/manipulating-the-dom-with-refs" },
  ],
};
