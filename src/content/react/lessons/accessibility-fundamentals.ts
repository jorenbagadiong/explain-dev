import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-it-means",
      heading: "What accessibility means",
      paragraphs: [
        "Accessibility means that as many people as possible can use what you build, whatever their abilities and however they interact. Some people use a screen reader, a keyboard, voice control, or a switch device. Others zoom in, or have low vision, color blindness, or difficulty with fine movement. Anyone can also be temporarily limited, such as by a broken wrist or a bright screen outdoors.",
        "React does not make a page accessible or inaccessible by itself. Assistive technology reads the DOM, so what matters is what your components finally produce, and how they behave.",
      ],
      list: [
        "Perceivable: people can detect the information, by whatever senses they use.",
        "Operable: controls can be used in different ways, including with a keyboard.",
        "Understandable: content and behavior make sense and are predictable.",
        "Robust: it works with browsers and with assistive technologies.",
      ],
      closing: "Those four principles organize the Web Content Accessibility Guidelines, known as WCAG.",
    },
    {
      id: "names-and-roles",
      heading: "Every control needs a name and a role",
      paragraphs: [
        "Assistive technology announces what a thing is, what it is called, and what state it is in. Native HTML elements provide the role and much of the state for free. The name usually comes from text content or a label, and an icon-only control needs one to be added.",
      ],
      examples: [
        {
          id: "icon-button",
          classification: "complete",
          title: "Naming an icon-only button",
          language: "tsx",
          code: `export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" aria-label="Close dialog" onClick={onClose}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" />
      </svg>
    </button>
  );
}`,
          description: "The button provides the role and the keyboard behavior, and aria-label provides the name. aria-hidden stops the icon itself from being announced.",
        },
      ],
    },
    {
      id: "text-alternatives",
      heading: "Text alternatives and color",
      paragraphs: [
        "Images that carry information need alternative text serving the same purpose. Purely decorative images should be ignorable by assistive technology, so give them an empty alt attribute. Leaving alt out entirely is different, because some screen readers may then read out the file name.",
        "Color cannot be the only way to convey something. A field shown only with a red border gives no signal to someone who cannot distinguish that color, so add text or an icon as well.",
      ],
      examples: [
        {
          id: "error-not-color-only",
          classification: "complete",
          title: "An error that does not rely on color",
          language: "tsx",
          code: `export function EmailField({ error }: { error?: string }) {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" aria-invalid={error ? true : undefined} aria-describedby={error ? "email-error" : undefined} />
      {error && <p id="email-error">Error: {error}</p>}
    </div>
  );
}`,
          description: "The message states the problem in words, and it is connected to the field, so that it is available when the field has focus. Styling can add red as well.",
        },
      ],
    },
    {
      id: "contrast",
      heading: "Contrast",
      paragraphs: [
        "WCAG 2.2 Level AA asks for a contrast ratio of at least 4.5:1 for normal text, and 3:1 for large text. Low contrast affects people with low vision, and it also affects anyone reading in bright light.",
        "Disabled controls and purely decorative text are exempt from this requirement. Check both light and dark themes, as a color pair that works in one may not work in the other.",
      ],
    },
    {
      id: "dynamic-updates",
      heading: "Announcing changes",
      paragraphs: [
        "In a React app, content often changes with no page load, and a screen reader user may not know that anything happened. Live regions announce changes without moving focus. The region must already be in the DOM before its content changes, so render the container and update what is inside it.",
      ],
      examples: [
        {
          id: "status-region",
          classification: "client",
          title: "Announcing a result",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

export function SaveButton() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <button type="button" onClick={() => setMessage("Draft saved.")}>
        Save draft
      </button>
      <p role="status">{message}</p>
    </div>
  );
}`,
          description: "role=\"status\" is a polite live region, which is present from the first render. Its text changing is what gets announced.",
        },
      ],
    },
    {
      id: "how-to-check",
      heading: "How to check your work",
      paragraphs: [
        "No single tool can prove a page accessible. Automated checkers catch problems such as missing names and low contrast, but they cannot judge whether alternative text is useful, or whether a flow makes sense. So combine them with manual checks.",
      ],
      list: [
        "Use the whole page with only a keyboard.",
        "Zoom the browser to 200 percent, and see whether anything is lost.",
        "Try a screen reader on the main flows.",
        "Run an automated checker, and treat a clean result as a start.",
        "Where possible, get feedback from people who use assistive technology.",
      ],
    },
  ],
  mistakes: [
    {
      id: "aria-instead-of-html",
      heading: "Adding ARIA instead of using HTML",
      problem: "role=\"button\" on a div only changes what is announced. It adds no keyboard support, so the element looks like a button to a screen reader, but it cannot be focused or activated like one.",
      correction: "Use the native element, here a button, and add ARIA only when HTML has no equivalent.",
    },
    {
      id: "color-only",
      heading: "Using color as the only signal",
      problem: "A red border for an error, or green text for success, tells nothing to people who cannot perceive those colors. Sufficient contrast between the two colors does not solve this, since the meaning still depends on color.",
      correction: "Add text or an icon, so that the information has another visual cue.",
    },
    {
      id: "missing-alt",
      heading: "Writing poor alternative text",
      problem: "An alt such as “image” or a file name gives no information, and describing a decorative image only adds noise. Leaving alt out entirely may lead some screen readers to read the file name instead.",
      correction: "Describe the image’s purpose, or use alt=\"\" for purely decorative images.",
    },
    {
      id: "live-region-added-late",
      heading: "Adding a live region at the same time as its message",
      problem: "A role=\"status\" element rendered only once there is a message may not be announced, because assistive technology has to know about the region before its content changes.",
      correction: "Render the empty region from the start, and update its contents.",
    },
    {
      id: "automated-only",
      heading: "Trusting an automated score",
      problem: "A clean automated report only means no detectable issue was found. It cannot tell whether a flow can be completed by keyboard, whether a label makes sense, or whether focus goes to a useful place.",
      correction: "Combine automated tools with keyboard and screen reader checks.",
    },
  ],
  interview: [
    {
      id: "af-what",
      question: "What does web accessibility mean?",
      answer: "Making sites usable by as many people as possible, whatever their abilities and whatever way they interact. That includes screen readers, keyboards, voice control, zoom, and low vision. It also helps people in temporary situations, such as having one hand free.",
    },
    {
      id: "af-react",
      question: "Is accessibility different in React than in plain HTML?",
      answer: "The target is the same, since assistive technology reads the DOM that React produces. The differences lie in dynamic behavior: managing focus when content changes, announcing updates, and making sure custom components keep native semantics. Also, a few attributes have different names, such as htmlFor.",
    },
    {
      id: "af-aria",
      question: "When should you use ARIA?",
      answer: "When HTML has no native way to express what you need. A native element includes the semantics and keyboard behavior, while ARIA only changes what is exposed to assistive technology. So incorrect ARIA can make things worse than having none at all.",
    },
    {
      id: "af-contrast",
      question: "What contrast does WCAG Level AA require?",
      answer: "At least 4.5:1 for normal text and 3:1 for large text, with exceptions such as disabled controls and decoration. I check the actual colors in every theme, since a pair that passes in light mode can easily fail in dark mode.",
    },
    {
      id: "af-live",
      question: "How do you announce dynamic changes to screen readers?",
      answer: "With a live region, such as role=\"status\" for polite updates, or role=\"alert\" for important ones. The element should already exist before its content changes. Alternatively, you can move focus when the change requires attention, such as opening a dialog.",
    },
    {
      id: "af-test",
      question: "How do you test accessibility?",
      answer: "With a mix of methods. Automated tools catch detectable issues, and I use the page with only a keyboard, zoom it, and try a screen reader. No tool can prove a page accessible, so feedback from people who use assistive technology is especially valuable.",
    },
  ],
  takeaways: [
    "Assistive technology reads the DOM that your components produce.",
    "Use native elements, and add ARIA only when HTML cannot do the job.",
    "Do not rely on color alone, and check contrast.",
    "Combine automated tools with manual checks.",
  ],
  quickReview: {
    definition: "Accessibility means making an interface usable across different abilities, assistive technologies, and ways of interacting.",
    keyPoints: [
      "Every control needs a name and a role.",
      "Normal text needs 4.5:1 contrast at Level AA.",
      "Color cannot be the only signal.",
      "A live region must exist before its content changes.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A named icon button",
      language: "tsx",
      code: `export function MenuButton() {
  return (
    <button type="button" aria-label="Open menu">
      <span aria-hidden="true">☰</span>
    </button>
  );
}`,
      description: "The native button supplies the role and keyboard use, and aria-label supplies the name.",
    },
    commonMistakes: [
      "Using ARIA instead of a native element.",
      "Using color as the only signal.",
      "Trusting an automated score alone.",
    ],
    interviewTrap: "“Does role=\"button\" make a div a button?” Only for what is announced. It adds no focus or keyboard behavior.",
    takeaway: "If people can only use it one way, it is not finished yet.",
  },
  sources: [
    { label: "MDN: What is accessibility?", href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility" },
    { label: "WCAG 2.2: Contrast (Minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" },
    { label: "WCAG 2.2: Use of Color", href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
    { label: "WCAG 2.2: Non-text Content", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html" },
    { label: "ARIA Authoring Practices: Read Me First", href: "https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/" },
  ],
};
