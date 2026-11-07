import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-portals-do",
      heading: "What a portal does",
      paragraphs: [
        "createPortal renders children into a different place in the DOM. It comes from react-dom, not react, and its form is createPortal(children, domNode, key). The target node must already exist.",
        "A portal only changes where the DOM nodes are physically placed. In every other way, the JSX behaves as a child of the component that rendered it.",
      ],
      examples: [
        {
          id: "basic-portal",
          classification: "client",
          title: "Rendering into document.body",
          language: "tsx",
          code: `"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function NoticeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ overflow: "hidden" }}>
      <button type="button" onClick={() => setIsOpen(true)}>
        Show notice
      </button>
      {isOpen &&
        createPortal(
          <div role="status">
            <p>Your changes were saved.</p>
            <button type="button" onClick={() => setIsOpen(false)}>
              Dismiss
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}`,
          description: "The notice escapes the parent’s overflow, but its state and handlers still belong to NoticeButton. It reads document.body only after a click, so it never runs during server rendering.",
        },
      ],
    },
    {
      id: "react-tree-versus-dom-tree",
      heading: "The React tree and the DOM tree differ",
      paragraphs: [
        "Although the DOM nodes move, the portal’s children stay in the parent’s React tree. So they can read context from it, and their state works as normal.",
        "Events are the surprising part: they bubble according to the React tree, not the DOM tree. A click inside a portal fires onClick on a wrapping element in the React tree, even though that element is nowhere near it in the DOM.",
      ],
      comparison: [
        {
          id: "follows-react",
          title: "Follows the React tree",
          items: ["Context from parents.", "State and props.", "Event bubbling."],
        },
        {
          id: "follows-dom",
          title: "Follows the DOM position",
          items: ["CSS inheritance and stacking.", "Overflow and clipping.", "Native DOM queries and focus order."],
        },
      ],
      examples: [
        {
          id: "bubbling",
          classification: "client",
          title: "Stopping an event from reaching the React parent",
          language: "tsx",
          code: `"use client";

import { createPortal } from "react-dom";

export default function Row({ onRowClick, target }: { onRowClick: () => void; target: HTMLElement }) {
  return (
    <div onClick={onRowClick}>
      <p>Row content</p>
      {createPortal(
        <button type="button" onClick={event => event.stopPropagation()}>
          Menu item
        </button>,
        target,
      )}
    </div>
  );
}`,
          description: "Without stopPropagation, clicking the button would also fire onRowClick, because the row is its parent in the React tree.",
        },
      ],
    },
    {
      id: "when-to-use",
      heading: "When portals help",
      paragraphs: [
        "The classic use is a modal, tooltip, or menu that must escape a container with overflow: hidden or its own stacking context. Portals also let React render into parts of a page it does not manage.",
      ],
      list: [
        "Modals and dialogs that need to appear above everything else.",
        "Tooltips and menus that a clipping container would otherwise cut off.",
        "Server-rendered or static pages, where React renders into an existing container, while sharing one React tree.",
        "Non-React widgets, such as a map popup, where you keep the widget’s node in state and render into it once it exists.",
      ],
      closing: "Before reaching for a portal in a modal, check the native dialog element, which handles top-layer placement and much of the focus behavior.",
    },
    {
      id: "accessibility",
      heading: "Accessibility needs care",
      paragraphs: [
        "A portal moves content away from where a keyboard or screen reader user would expect it, so you must manage focus yourself. Move focus in when the content opens, keep it there for a modal, and return it when it closes. The WAI-ARIA Modal Authoring Practices describe the expected behavior, and any community package you use should meet them.",
      ],
    },
  ],
  mistakes: [
    {
      id: "wrong-package",
      heading: "Importing createPortal from react",
      problem: "Because most React APIs come from react, this is an easy guess. createPortal is in react-dom, because it depends on the DOM, so importing it from react fails.",
      correction: "Import it from react-dom, as in import { createPortal } from \"react-dom\".",
    },
    {
      id: "document-during-render",
      heading: "Reading document during server rendering",
      problem: "Calling createPortal(children, document.body) on the first render throws on a server, because document does not exist there. A framework that server-renders your component reveals this immediately.",
      correction: "Only render the portal after a user action or after mount, with the target available on the client.",
    },
    {
      id: "unexpected-bubbling",
      heading: "Being surprised by event bubbling",
      problem: "A click inside a modal can trigger an onClick on a parent row or card in the React tree. The DOM shows no relation between them, so the cause is hard to find by inspecting the page.",
      correction: "Stop propagation inside the portal, or render it higher in the React tree.",
    },
    {
      id: "missing-focus",
      heading: "Forgetting focus management",
      problem: "A dialog that appears at the end of the body leaves keyboard focus behind on the trigger, so a keyboard user may tab through the page beneath it and never reach the dialog.",
      correction: "Move focus into the dialog, keep it there while open, and restore it on close.",
    },
    {
      id: "portal-for-styling",
      heading: "Using a portal to work around simple CSS",
      problem: "A portal adds a second structure to think about for events and focus. If the real problem is one overflow style or z-index value, this is a heavy solution with its own bugs to handle.",
      correction: "Try fixing the layout first, and use a portal when content truly must escape its container.",
    },
  ],
  interview: [
    {
      id: "portal-what",
      question: "What is a React portal?",
      answer: "A way to render children into a different DOM node while keeping them in the same React tree. You call createPortal from react-dom with the children and a target node. It is commonly used for modals and tooltips that must escape clipping containers.",
    },
    {
      id: "portal-events",
      question: "How do events behave inside a portal?",
      answer: "They bubble along the React tree, not the DOM tree. So a parent in the React tree receives a click from inside the portal, even though the DOM nodes are elsewhere. This can be useful, but it can also cause unexpected handler calls.",
    },
    {
      id: "portal-context",
      question: "Does a portal’s content have access to context?",
      answer: "Yes. Portal children stay in the parent’s React tree, so context, state, and props work as normal. Only the physical DOM position changes, which is why CSS inheritance follows the DOM position instead.",
    },
    {
      id: "portal-ssr",
      question: "How do portals interact with server rendering?",
      answer: "The target DOM node must exist, and document is not available on the server. So a portal should render only on the client, such as after a user interaction or once mounted. Otherwise the render throws on the server.",
    },
    {
      id: "portal-a11y",
      question: "What accessibility issues do portals raise?",
      answer: "The content is away from its logical position, so you must manage focus: move it in, contain it for a modal, and return it on close. Screen reader semantics, such as a dialog role and a label, also matter. The native dialog element helps with several of these.",
    },
    {
      id: "portal-vs-dialog",
      question: "Would you use a portal or the native dialog element for a modal?",
      answer: "I would consider dialog first, since showModal uses the top layer and handles focus and inert background behavior. A portal is still useful for tooltips, menus, or integrations. If I use a package for modals, I would check it follows the ARIA guidelines.",
    },
  ],
  takeaways: [
    "createPortal comes from react-dom and places DOM nodes elsewhere.",
    "Portal children stay in the React tree for context, state, and events.",
    "Events bubble along the React tree, not the DOM tree.",
    "Manage focus yourself, and only render portals on the client.",
  ],
  quickReview: {
    definition: "createPortal renders children into another DOM node while keeping them in the same React tree.",
    keyPoints: [
      "It is from react-dom, and the target must already exist.",
      "Context and state work as normal.",
      "Events bubble through React parents.",
      "CSS follows the DOM position.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Creating a portal",
      language: "tsx",
      code: `createPortal(<ModalContent />, document.body);`,
      typecheckContext: { before: `import { createPortal } from "react-dom";\nimport type { ReactNode } from "react";\ndeclare function ModalContent(): ReactNode;` },
      description: "Return this from a component on the client. React places the content in the body.",
    },
    commonMistakes: [
      "Importing createPortal from react.",
      "Using document while rendering on a server.",
      "Forgetting that events reach React parents.",
    ],
    interviewTrap: "“Does a click inside a portal bubble to its DOM parent or its React parent?” Its React parent, as far as React’s handlers go.",
    takeaway: "Think of a portal as moving the pixels, not the component’s place in React.",
  },
  sources: [
    { label: "createPortal reference", href: "https://react.dev/reference/react-dom/createPortal" },
  ],
};
