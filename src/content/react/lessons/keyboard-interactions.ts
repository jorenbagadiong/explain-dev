import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "native-first",
      heading: "Native controls already work",
      paragraphs: [
        "WCAG requires all functionality to be operable through a keyboard. This helps people with no vision or low vision, and those using speech software, switch devices, or on-screen keyboards. Native controls meet the requirement automatically: a button handles Enter and Space, a link handles Enter, and a checkbox handles Space.",
        "So the first rule is to use the right element. Most keyboard bugs come from replacing a native control with a div, which then needs focus and key handling written by hand.",
      ],
      comparison: [
        {
          id: "native",
          title: "A native button",
          items: ["Focusable with no extra code.", "Enter and Space activate it.", "Announced as a button."],
        },
        {
          id: "div-button",
          title: "A div with onClick",
          items: ["Not focusable without tabIndex.", "No key handling without onKeyDown.", "Not announced as a button without a role."],
        },
      ],
    },
    {
      id: "conventions",
      heading: "Tab moves between components, and arrows move within them",
      paragraphs: [
        "Tab and Shift+Tab move between components. Arrow keys move within composite widgets such as radio groups, menus, tabs, and grids, which contribute only one stop to the tab sequence. That keeps long menus from requiring dozens of Tab presses.",
        "People expect these conventions, because they match desktop interfaces and native controls. Inventing your own bindings makes an interface harder to learn, so follow the WAI-ARIA Authoring Practices pattern for the widget you are building.",
      ],
      list: [
        "Enter activates a link or button, and Space activates a button or checkbox.",
        "Escape closes a dialog, menu, or popover.",
        "Arrow keys move through options in a composite widget.",
        "Home and End often jump to the first and last items.",
      ],
    },
    {
      id: "roving-tabindex",
      heading: "Building a composite with roving tabindex",
      paragraphs: [
        "A custom composite widget usually needs a roving tabindex. One element has tabIndex={0}, and the others have -1. Arrow keys move that 0 to the next element and call focus on it. Tab then leaves the widget instead of walking through each item.",
      ],
      examples: [
        {
          id: "toolbar",
          classification: "complete",
          title: "A toolbar with roving tabindex",
          language: "tsx",
          code: `import { useRef, useState, type KeyboardEvent } from "react";

const tools = ["Bold", "Italic", "Underline"];

export default function Toolbar() {
  const [active, setActive] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next = (active + offset + tools.length) % tools.length;
    setActive(next);
    buttonsRef.current[next]?.focus();
  }

  return (
    <div role="toolbar" aria-label="Text formatting" onKeyDown={handleKeyDown}>
      {tools.map((tool, index) => (
        <button
          key={tool}
          ref={node => {
            buttonsRef.current[index] = node;
          }}
          type="button"
          tabIndex={index === active ? 0 : -1}
          onFocus={() => setActive(index)}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}`,
          description: "Tab enters the toolbar once, arrows move within it, and Tab leaves. The buttons stay native, so Enter and Space still work. The active button is updated on focus too, so clicking stays in step.",
        },
      ],
    },
    {
      id: "custom-shortcuts",
      heading: "Custom keyboard shortcuts",
      paragraphs: [
        "Shortcuts add to standard navigation, and they must never replace it. Avoid clashing with operating system keys, assistive technology modifiers such as Caps Lock and Insert, and common browser shortcuts.",
        "Single-letter shortcuts deserve care, since speech input can trigger them by accident. WCAG asks that they can be turned off, remapped, or apply only when the relevant control has focus. Shortcuts should also be discoverable, because nobody can use what they do not know about.",
      ],
      examples: [
        {
          id: "global-shortcut",
          classification: "client",
          title: "A shortcut with cleanup",
          language: "tsx",
          code: `"use client";

import { useEffect, useEffectEvent } from "react";

export function useSaveShortcut(onSave: () => void) {
  const handleSave = useEffectEvent(onSave);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}`,
          description: "The listener is added once and removed on unmount, and it uses a modifier key. This overrides the browser’s save command, so only do so where saving is an obvious part of the page.",
        },
      ],
    },
    {
      id: "disabled-and-traps",
      heading: "Disabled controls and keyboard traps",
      paragraphs: [
        "A native disabled control leaves the tab order, which is usually right. When a control should stay discoverable, such as Copy in a toolbar, use aria-disabled=\"true\", and make your handler ignore activation.",
        "Keyboard focus must always be able to leave a component. A modal dialog keeps focus inside on purpose, with Escape or a close button as the way out. Any other place where focus cannot get out is a serious bug, because keyboard users are stuck there.",
      ],
    },
  ],
  mistakes: [
    {
      id: "click-only",
      heading: "Making controls that only respond to clicks",
      problem: "A clickable div or an icon with only onClick cannot be reached or activated from the keyboard, so anyone not using a pointer simply cannot perform that action.",
      correction: "Use a button or link, which handle focus and activation for you.",
    },
    {
      id: "enter-only",
      heading: "Handling only Enter in a custom control",
      problem: "A custom button with a keydown check for Enter misses Space, which people expect to work on buttons. It also tends to miss the need to prevent Space from scrolling the page.",
      correction: "Use a native button. If you truly cannot, implement both keys and prevent scrolling on Space.",
    },
    {
      id: "many-tab-stops",
      heading: "Adding a tab stop for every item in a composite",
      problem: "A menu with fifty items that all have tabIndex={0} forces fifty Tab presses to get past it. Keyboard users have to walk through it every time they cross that part of the page.",
      correction: "Use a single tab stop, with arrow keys moving inside the widget.",
    },
    {
      id: "conflicting-shortcuts",
      heading: "Overriding common shortcuts",
      problem: "Taking over Ctrl+F or a screen reader’s keys breaks things that people rely on everywhere. A single-letter shortcut can also fire accidentally when someone uses speech input.",
      correction: "Avoid browser and assistive technology keys, and make single-key shortcuts possible to disable.",
    },
    {
      id: "hover-only",
      heading: "Revealing actions only on hover",
      problem: "Buttons that appear on hover are invisible to keyboard users until they are somehow focused, so they either cannot find them or tab onto something they cannot see.",
      correction: "Also reveal them on focus, using focus-within in CSS, or keep them visible.",
    },
  ],
  interview: [
    {
      id: "ki-native",
      question: "Why are native elements important for keyboard support?",
      answer: "They come with focus, key handling, and semantics. A button responds to Enter and Space, and it is announced correctly. Rebuilding that on a div requires tabIndex, onKeyDown for both keys, and a role, and it still has more ways to go wrong.",
    },
    {
      id: "ki-tab-arrow",
      question: "When do you use Tab, and when do you use arrow keys?",
      answer: "Tab moves between components, and arrows move within a composite widget such as a menu, tablist, or radio group. A composite should be just one stop in the tab sequence, so that a long list does not become dozens of Tab presses.",
    },
    {
      id: "ki-roving",
      question: "What is roving tabindex?",
      answer: "In a composite, one item has tabIndex 0 and the others have -1. Arrow keys move that 0 and focus the new item. It gives one tab stop for the whole widget, and it remembers where the user was. aria-activedescendant is an alternative approach.",
    },
    {
      id: "ki-trap",
      question: "What is a keyboard trap?",
      answer: "A place where keyboard focus enters but cannot leave, so the person is stuck. Custom widgets and embedded content can cause this. A modal dialog deliberately keeps focus inside, but it still has to offer a clear way out, such as Escape.",
    },
    {
      id: "ki-shortcuts",
      question: "What should you consider when adding keyboard shortcuts?",
      answer: "They must add to standard navigation rather than replace it. Avoid conflicts with browser, OS, and assistive technology keys. Single-character shortcuts need a way to be disabled or remapped, as speech input could trigger them. They also need to be discoverable.",
    },
    {
      id: "ki-disabled",
      question: "When would you use aria-disabled instead of disabled?",
      answer: "When a control should remain discoverable to keyboard users, as with toolbar items or menu options. Native disabled removes it from the tab order. With aria-disabled it stays focusable, so you have to ignore activation yourself.",
    },
  ],
  takeaways: [
    "All functionality must work from the keyboard, and native controls give you that.",
    "Tab moves between components, and arrows move within them.",
    "Use roving tabindex for custom composite widgets.",
    "Shortcuts add to standard navigation, and they must not cause conflicts.",
  ],
  quickReview: {
    definition: "Keyboard interaction means every feature works without a pointer, following conventions people already know.",
    keyPoints: [
      "Buttons take Enter and Space, and links take Enter.",
      "A composite is one tab stop, with arrows inside.",
      "Focus must always be able to leave a component.",
      "Use modifiers for shortcuts, and avoid reserved keys.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "The right element",
      language: "tsx",
      code: `export default function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close">
      ×
    </button>
  );
}`,
      description: "Focus, Enter, and Space all work, with no key handling written at all.",
    },
    commonMistakes: [
      "Using a clickable div.",
      "Giving every item in a menu a tab stop.",
      "Overriding browser or screen reader shortcuts.",
    ],
    interviewTrap: "“Does onClick work with the keyboard?” On a native button, yes, since Enter and Space trigger it. On a div, no.",
    takeaway: "Use the right element first, then follow the established keyboard patterns.",
  },
  sources: [
    { label: "ARIA APG: Keyboard interface", href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/" },
    { label: "WCAG: Keyboard", href: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html" },
    { label: "WCAG: Character Key Shortcuts", href: "https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html" },
    { label: "Responding to Events", href: "https://react.dev/learn/responding-to-events" },
  ],
};
