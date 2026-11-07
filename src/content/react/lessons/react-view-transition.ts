import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What ViewTransition does",
      paragraphs: [
        "ViewTransition animates elements when they enter, exit, update, or are shared between locations. It is a component from react, and it is stable as of React 19.3. It is built on the browser’s View Transition API, and React calls startViewTransition for you, so you should not call it yourself.",
        "It currently works only in the DOM. The release notes give no table of supported browsers, and the underlying browser API has its own support to check, so treat these animations as an enhancement that your interface does not depend on.",
      ],
      examples: [
        {
          id: "basic-transition",
          classification: "client",
          title: "Animating an element in and out",
          language: "tsx",
          code: `"use client";

import { startTransition, useState, ViewTransition } from "react";

export default function Reveal() {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <>
      <button type="button" onClick={() => startTransition(() => setIsShowing(!isShowing))}>
        Toggle details
      </button>
      {isShowing && (
        <ViewTransition>
          <p>The details animate in with a cross-fade.</p>
        </ViewTransition>
      )}
    </>
  );
}`,
          description: "startTransition is what makes this animate, since an ordinary state update would apply immediately. The default animation is a cross-fade.",
        },
      ],
    },
    {
      id: "only-transitions",
      heading: "Only Transitions animate",
      paragraphs: [
        "This is the rule that most often surprises people. A plain setState applies immediately, and it does not activate ViewTransition. Only updates inside one of these do.",
      ],
      list: [
        "startTransition or useTransition.",
        "A Suspense boundary revealing its content.",
        "useDeferredValue.",
      ],
      closing: "A flushSync in the middle of the sequence also makes React skip the Transition, and animations are skipped for legacy popstate back-button navigations.",
    },
    {
      id: "animation-types",
      heading: "The four kinds of animation",
      paragraphs: [
        "React chooses the kind automatically, based on what happened in the Transition. Each can be customized through a prop with the same name.",
      ],
      visual: {
        heading: "How React chooses an animation",
        context: "These are alternatives, chosen by what happened to a ViewTransition during a Transition. Indentation shows the options, not a sequence.",
        root: {
          id: "boundary",
          title: "A ViewTransition in a Transition",
          description: "React picks one of these for it.",
          children: [
            { id: "enter", title: "enter", description: "It is the first component inserted in the Transition." },
            { id: "exit", title: "exit", description: "It is the first component deleted in the Transition." },
            { id: "update", title: "update", description: "DOM inside it changes, or its boundary changes size or position." },
            { id: "share", title: "share", description: "A named one is deleted, and another with the same name is inserted." },
          ],
        },
        note: "Only one event fires per ViewTransition per Transition, and share takes precedence over enter and exit.",
      },
    },
    {
      id: "customizing",
      heading: "Customizing with CSS",
      paragraphs: [
        "Each prop accepts auto for the browser default, none to disable that animation, or a CSS class name. React applies that class to the animated children, and you target it with view-transition pseudo-selectors.",
      ],
      examples: [
        {
          id: "class-props",
          classification: "client",
          title: "Custom classes for enter and exit",
          language: "tsx",
          code: `"use client";

import { ViewTransition, type ReactNode } from "react";

export default function SlidingPanel({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="slide-in" exit="slide-out">
      {children}
    </ViewTransition>
  );
}`,
          description: "default=\"none\" turns off anything not listed. The classes are then styled in CSS, as shown next.",
        },
        {
          id: "css-classes",
          classification: "snippet",
          title: "The matching CSS",
          language: "text",
          code: `::view-transition-new(.slide-in) {
  animation: slide-in 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-new(.slide-in) {
    animation: none;
  }
}`,
          description: "This is CSS, shown for reference, and it assumes a slide-in keyframes rule. React does not disable animations for reduced motion, so your CSS has to.",
        },
      ],
    },
    {
      id: "shared-elements",
      heading: "Shared element transitions",
      paragraphs: [
        "Giving a ViewTransition a name creates a shared element: when one with that name is removed, and another with the same name appears, the element appears to move between them. This suits a thumbnail growing into a detail view.",
        "Only one mounted ViewTransition may use a given name at a time, and duplicates raise an error in development, so include an ID in the name when rendering lists. A pair does not form if either side is outside the viewport.",
      ],
      examples: [
        {
          id: "shared-name",
          classification: "client",
          title: "A shared element between two views",
          language: "tsx",
          code: `"use client";

import { ViewTransition } from "react";

export default function Thumbnail({ photoId, src, alt }: { photoId: string; src: string; alt: string }) {
  return (
    <ViewTransition name={"photo-" + photoId}>
      <img src={src} alt={alt} />
    </ViewTransition>
  );
}`,
          description: "A detail page using the same name would animate from this position to its own. The ID keeps each name unique.",
        },
      ],
    },
    {
      id: "rules-and-accessibility",
      heading: "Rules and accessibility",
      paragraphs: [
        "It animates an image snapshot, moved, scaled, and cross-faded, rather than each child individually. Enter and exit only trigger if the ViewTransition comes before any DOM node, so a div above it breaks them.",
        "Motion can make some people unwell, and React does not disable animations for prefers-reduced-motion. So handle that in your CSS, as shown above. Your interface must work the same way with the animations removed.",
      ],
    },
  ],
  mistakes: [
    {
      id: "plain-setstate",
      heading: "Expecting a plain state update to animate",
      problem: "Wrapping an element in ViewTransition and calling setState shows no animation, which looks like a bug. Urgent updates apply immediately, and only updates inside a Transition activate it.",
      correction: "Wrap the update in startTransition.",
    },
    {
      id: "dom-above",
      heading: "Putting a DOM node above the ViewTransition",
      problem: "Enter and exit only apply when the ViewTransition comes before any DOM node in the affected subtree. With a div wrapped around it, the animation silently does not happen, and no error points to why.",
      correction: "Place it at the outer edge of what is inserted or removed.",
    },
    {
      id: "duplicate-names",
      heading: "Reusing a name across a list",
      problem: "A hard-coded name inside a mapped list means several mounted boundaries share one name, which raises an error in development. Shared element transitions need exactly one on each side.",
      correction: "Include a unique ID in the name.",
    },
    {
      id: "no-reduced-motion",
      heading: "Forgetting reduced motion",
      problem: "React does not turn these animations off for people who ask for less motion. Large slides or zooms can make someone feel unwell, and they have no way to avoid them, apart from your CSS.",
      correction: "Add a prefers-reduced-motion media query that disables or simplifies them.",
    },
    {
      id: "calling-browser-api",
      heading: "Calling startViewTransition yourself",
      problem: "Mixing the browser API with this component causes conflicts, because React interrupts other view transitions to run its own. Your manual animation can be cancelled at an unpredictable moment.",
      correction: "Let React call it, and customize with props and CSS.",
    },
    {
      id: "relying-on-animation",
      heading: "Relying on the animation for meaning",
      problem: "If an animation is the only sign that something changed, those with animations off or in an unsupported browser miss it. A screen reader also gets nothing from a moving snapshot.",
      correction: "Make sure the change is clear without any motion.",
    },
  ],
  interview: [
    {
      id: "vt-what",
      question: "What is React’s ViewTransition component?",
      answer: "A component that animates elements as they enter, exit, update, or move between locations, built on the browser’s View Transition API. React calls startViewTransition for you. It is stable as of React 19.3, and it only works in the DOM.",
    },
    {
      id: "vt-trigger",
      question: "What triggers a ViewTransition?",
      answer: "Updates inside startTransition or useTransition, Suspense reveals, and useDeferredValue. A plain state update applies immediately, and it does not animate. flushSync during the sequence, or a legacy back-button navigation, also skips it.",
    },
    {
      id: "vt-types",
      question: "How does React decide which animation to run?",
      answer: "Based on what happened in the Transition. Enter when it is the first inserted, exit when it is first deleted, update when DOM inside it changes or its boundary moves, and share when a named pair is removed and inserted. share takes precedence.",
    },
    {
      id: "vt-shared",
      question: "How do shared element transitions work?",
      answer: "Give a ViewTransition a name. When one with that name is removed and another inserted in the same Transition, the element appears to move between them. Each name can only be on one mounted boundary, and it does not form if either side is outside the viewport.",
    },
    {
      id: "vt-a11y",
      question: "How do you make view transitions accessible?",
      answer: "Respect prefers-reduced-motion in CSS, since React does not do it for you. Avoid conveying meaning only through motion, and make sure focus and content are correct with animations disabled. They should enhance an interface that already works.",
    },
    {
      id: "vt-compat",
      question: "What should you check before depending on ViewTransition?",
      answer: "Your React version, which must be 19.3 or newer, and browser support for the underlying API. It works only in the DOM at present. Your router also matters, because legacy popstate navigations skip animations, and the Navigation API avoids that.",
    },
  ],
  takeaways: [
    "ViewTransition animates enter, exit, update, and shared elements.",
    "Only Transitions activate it, and plain updates do not.",
    "React does not handle reduced motion, so your CSS must.",
    "It requires React 19.3 or newer, and it should enhance a working interface.",
  ],
  quickReview: {
    definition: "ViewTransition is a stable React 19.3 component that animates changes through the browser’s View Transition API, when they happen inside a Transition.",
    keyPoints: [
      "Triggers: startTransition, Suspense reveals, and useDeferredValue.",
      "Props accept auto, none, or a CSS class.",
      "A name creates a shared element.",
      "Enter and exit need it placed before any DOM node.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Activating an animation",
      language: "tsx",
      code: `startTransition(() => setPage(nextPage));`,
      typecheckContext: { before: `import { startTransition } from "react";\ndeclare const nextPage: string;\ndeclare const setPage: (page: string) => void;` },
      description: "Without the Transition, the update would apply with no animation.",
    },
    commonMistakes: [
      "Expecting a plain setState to animate.",
      "Placing a div above the ViewTransition.",
      "Forgetting prefers-reduced-motion.",
    ],
    interviewTrap: "“Does React turn off view transitions for reduced motion?” No. You need to handle that in your CSS.",
    takeaway: "Add motion to an interface that already works, and let people opt out of it.",
  },
  sources: [
    { label: "ViewTransition reference", href: "https://react.dev/reference/react/ViewTransition" },
    { label: "React 19.3 release notes", href: "https://react.dev/blog/2026/09/09/react-19-3" },
    { label: "startTransition reference", href: "https://react.dev/reference/react/startTransition" },
  ],
};
