import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "who-relies",
      heading: "Who relies on the keyboard",
      paragraphs: [
        "Many people navigate without a mouse. That includes people with motor impairments and blind people using screen readers, as well as those who simply prefer a keyboard. Voice control and switch devices often act through the same interface, so WCAG requires all functionality to be operable through a keyboard.",
        "Native interactive elements already work: Tab reaches them, and Enter or Space activates them. Problems tend to appear with custom widgets, and when React moves or removes things that have focus.",
      ],
      list: [
        "Tab and Shift+Tab move forward and backward between controls.",
        "Enter activates links and buttons, and Space activates buttons.",
        "Escape commonly closes a dialog or a popup.",
        "Arrow keys commonly move within a composite widget, such as a menu or tabs.",
      ],
    },
    {
      id: "focus-order-visible",
      heading: "Focus order and visible focus",
      paragraphs: [
        "Focus moves in DOM order, and that order should preserve meaning. If CSS visually rearranges content, focus can jump around the screen in a confusing way. Keep the source order logical. Avoid a positive tabIndex, which overrides that order and is hard to maintain.",
        "People also need to see where focus is. Removing the outline with no replacement leaves keyboard users guessing. Using :focus-visible lets you style focus for keyboard users, while avoiding a ring after each mouse click. A sticky header must not cover the focused element either.",
      ],
      comparison: [
        {
          id: "tabindex-zero",
          title: "tabIndex={0}",
          items: ["Adds an element to the Tab order.", "Follows the DOM order.", "Rarely needed if you use native controls."],
        },
        {
          id: "tabindex-negative",
          title: "tabIndex={-1}",
          items: ["Not reachable with Tab.", "Focusable from code.", "Useful for moving focus to a heading or a panel."],
        },
      ],
      closing: "A positive tabIndex is almost always a mistake, because it jumps ahead of the normal order.",
      examples: [
        {
          id: "focus-style",
          classification: "snippet",
          title: "Styling focus without removing it",
          language: "text",
          code: `button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}`,
          description: "This is plain CSS. The outline appears for keyboard focus, and it uses the text color, so that it follows the theme.",
        },
      ],
    },
    {
      id: "managing-focus",
      heading: "Managing focus when things change",
      paragraphs: [
        "When React removes the element that has focus, the browser usually falls back to the body, which puts the user back at the start of the page. So when content changes because of an action, decide where focus should go. A ref gives you the DOM node, and you can call focus on it after the update has happened.",
      ],
      examples: [
        {
          id: "return-focus",
          classification: "client",
          title: "Moving focus after a deletion",
          language: "tsx",
          code: `"use client";

import { useRef, useState } from "react";

export function LessonRow() {
  const [isDeleted, setIsDeleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function handleDelete() {
    setIsDeleted(true);
    headingRef.current?.focus();
  }

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1}>
        Your lessons
      </h2>
      {isDeleted ? <p>Lesson deleted.</p> : <button onClick={handleDelete}>Delete lesson</button>}
    </section>
  );
}`,
          description: "The button is about to disappear, so focus moves to the heading rather than being lost. tabIndex={-1} makes the heading focusable from code, without adding it to the Tab order.",
        },
      ],
    },
    {
      id: "dialogs",
      heading: "Dialogs and keyboard traps",
      paragraphs: [
        "A keyboard trap is a place that focus can enter but not leave, and WCAG forbids it. A modal dialog deliberately keeps focus inside while it is open, which is fine because Escape or a close button provides the way out. On closing, focus should return to whatever opened it.",
        "The native dialog element, opened with showModal, handles much of this. It makes the rest of the page inert, and it supports Escape.",
      ],
      examples: [
        {
          id: "native-dialog",
          classification: "client",
          title: "Using the native dialog",
          language: "tsx",
          code: `"use client";

import { useRef } from "react";

export function ConfirmDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Delete account
      </button>
      <dialog ref={dialogRef} aria-labelledby="confirm-title">
        <h2 id="confirm-title">Delete your account?</h2>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
      </dialog>
    </>
  );
}`,
          description: "showModal puts focus in the dialog, makes the page behind it inert, and enables Escape. When the dialog closes, focus returns to the element that had it before.",
        },
      ],
    },
    {
      id: "custom-widgets",
      heading: "Custom widgets",
      paragraphs: [
        "If no native element fits, the ARIA Authoring Practices Guide describes the expected keyboard behavior for patterns such as tabs and menus. Following it means implementing the whole pattern, not only the roles. Because this is considerable work, a well-tested component library can be a sensible choice, and you should still test it with a keyboard.",
        "Single-character shortcuts need care too, because voice control users can trigger them by accident. WCAG asks for such shortcuts to be turned off, or remapped, or active only when the relevant control has focus.",
      ],
    },
  ],
  mistakes: [
    {
      id: "outline-none",
      heading: "Removing focus outlines",
      problem: "outline: none with nothing in its place makes focus invisible, so keyboard users cannot tell where they are on the page. It is often added to remove a ring that appeared on mouse click.",
      correction: "Use :focus-visible to style keyboard focus clearly.",
    },
    {
      id: "positive-tabindex",
      heading: "Using a positive tabIndex",
      problem: "A positive value moves an element ahead of everything else in the Tab order. The order stops matching the page, and each such element makes the next one harder to fit in without renumbering.",
      correction: "Fix the DOM order, and use only 0 or -1.",
    },
    {
      id: "losing-focus",
      heading: "Losing focus when content is removed",
      problem: "When a focused button is removed, as after deleting a row, focus falls back to the body. A keyboard user then finds themselves back at the top of the page, and must tab all the way back.",
      correction: "Move focus to a sensible nearby element as part of the same action.",
    },
    {
      id: "dialog-no-return",
      heading: "Not returning focus after a dialog closes",
      problem: "A hand-built dialog that does not restore focus leaves the person lost when it closes. If it does not contain focus either, Tab reaches the page behind it while the page is visually covered.",
      correction: "Use the native dialog, or contain focus and restore it on close.",
    },
    {
      id: "hover-only",
      heading: "Showing content only on hover",
      problem: "Menus and tooltips revealed only by :hover or mouse events cannot be reached with a keyboard, so the links inside them effectively do not exist for those users.",
      correction: "Show them on focus as well, or use a button that toggles them.",
    },
  ],
  interview: [
    {
      id: "ka-test",
      question: "How do you test keyboard accessibility?",
      answer: "Put the mouse aside and use the page with Tab, Shift+Tab, Enter, Space, and Escape. Check that everything is reachable, that the order makes sense, that focus is always visible, and that nothing traps focus. Automated tools cannot judge most of that.",
    },
    {
      id: "ka-tabindex",
      question: "What do the tabIndex values mean?",
      answer: "0 adds an element to the Tab order in its DOM position. -1 removes it from the order, but allows focusing it from code, which is useful for headings and panels. Positive values jump ahead of the normal order, which is almost always a mistake.",
    },
    {
      id: "ka-focus-visible",
      question: "What is :focus-visible for?",
      answer: "It applies when the browser decides that focus should be visibly indicated, typically with a keyboard and not after a mouse click. That lets you provide a clear focus style for those who need it, without simply removing outlines altogether.",
    },
    {
      id: "ka-remove",
      question: "What happens to focus when React removes the focused element?",
      answer: "It generally falls back to the document body, so a keyboard user loses their place. So I handle it deliberately, by moving focus to a sensible element, such as a heading or the next item, using a ref. A tabIndex of -1 makes a non-interactive target focusable.",
    },
    {
      id: "ka-trap",
      question: "What is a keyboard trap, and is a modal one?",
      answer: "A trap is where focus can enter but cannot leave, which WCAG forbids. A modal keeps focus inside on purpose, but it is not a trap, since Escape or a close button offers a way out. On closing, focus should go back to whatever opened it.",
    },
    {
      id: "ka-custom",
      question: "How do you make a custom widget keyboard accessible?",
      answer: "First check whether a native element will do. If not, follow the ARIA Authoring Practices pattern, including keys, roles, and focus movement, or use a well-tested library. Adding roles alone is not enough, because they do not add any behavior.",
    },
  ],
  takeaways: [
    "Everything must be operable from a keyboard.",
    "Keep the DOM order logical and focus visible.",
    "Decide where focus goes when content changes.",
    "Prefer native controls, and test with the mouse put aside.",
  ],
  quickReview: {
    definition: "Keyboard accessibility means that everything can be reached and operated without a mouse, with a logical order and visible focus.",
    keyPoints: [
      "Use tabIndex 0 or -1, and never positive values.",
      ":focus-visible styles keyboard focus.",
      "Removing a focused element loses focus.",
      "showModal contains focus and enables Escape.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A heading that can receive focus",
      language: "tsx",
      code: `export function Results() {
  return <h2 tabIndex={-1}>Results</h2>;
}`,
      description: "-1 allows focusing from code, without adding the heading to the Tab order.",
    },
    commonMistakes: [
      "Removing outlines with no replacement.",
      "Using a positive tabIndex.",
      "Losing focus when content is removed.",
    ],
    interviewTrap: "“Is a modal that keeps focus inside a keyboard trap?” No, as long as Escape or a button provides a way out.",
    takeaway: "Put your mouse aside for five minutes, and you will find most of the problems.",
  },
  sources: [
    { label: "WCAG 2.2: Keyboard", href: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html" },
    { label: "WCAG 2.2: No Keyboard Trap", href: "https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html" },
    { label: "WCAG 2.2: Focus Order", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html" },
    { label: "WCAG 2.2: Focus Visible", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" },
    { label: "WCAG 2.2: Focus Not Obscured", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html" },
    { label: "WCAG 2.2: Character Key Shortcuts", href: "https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html" },
    { label: "ARIA Authoring Practices: keyboard interfaces", href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/" },
    { label: "ARIA Authoring Practices: modal dialog", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
  ],
};
