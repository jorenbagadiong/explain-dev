import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-it-does",
      heading: "What useId does",
      paragraphs: [
        "useId generates a unique ID string for use with accessibility attributes, such as connecting a label or a hint to an input. It takes no parameters. Call it at the top level of a component or custom Hook.",
        "It exists because hard-coded IDs break when a component appears more than once. Two instances would both render id=\"hint\", which makes the page’s IDs invalid and connects the wrong elements together.",
      ],
      examples: [
        {
          id: "password-hint",
          classification: "complete",
          title: "Connecting an input and its hint",
          language: "tsx",
          code: `import { useId } from "react";

function PasswordField({ label }: { label: string }) {
  const hintId = useId();

  return (
    <>
      <label>
        {label}
        <input type="password" aria-describedby={hintId} />
      </label>
      <p id={hintId}>Use at least 12 characters.</p>
    </>
  );
}

export default function SignupForm() {
  return (
    <form>
      <PasswordField label="Password" />
      <PasswordField label="Confirm password" />
    </form>
  );
}`,
          description: "Each instance gets its own ID, so screen readers read the correct hint for each field.",
        },
      ],
    },
    {
      id: "multiple-related-ids",
      heading: "Several related IDs",
      paragraphs: [
        "If a component needs several IDs, call useId once and add suffixes. That avoids one Hook call per element while keeping every ID unique.",
      ],
      examples: [
        {
          id: "suffixes",
          classification: "complete",
          title: "One prefix, several IDs",
          language: "tsx",
          code: `import { useId } from "react";

export default function NameFields() {
  const id = useId();

  return (
    <form>
      <label htmlFor={id + "-first"}>First name</label>
      <input id={id + "-first"} type="text" />
      <label htmlFor={id + "-last"}>Last name</label>
      <input id={id + "-last"} type="text" />
    </form>
  );
}`,
          description: "The two IDs share a prefix that is unique to this instance.",
        },
      ],
    },
    {
      id: "why-not-counter",
      heading: "Why not an incrementing counter?",
      paragraphs: [
        "A module-level counter such as nextId++ seems simple, and it works in a purely client-rendered app. The problem appears with server rendering. The server emits HTML, and the client hydrates it later, and the order in which Client Components hydrate may not match the order the server emitted them.",
        "useId derives its value from the component’s parent path in the tree, so the result stays consistent regardless of render order, provided the server and client trees match exactly.",
      ],
    },
    {
      id: "what-not-to-use-it-for",
      heading: "What not to use it for",
      paragraphs: [
        "useId has a narrow purpose, and it should not be stretched to fit others.",
      ],
      list: [
        "Do not generate list keys with it. Keys should come from your data.",
        "Do not use it as a cache key for the use API, since the ID may change during rendering.",
        "Do not call it in loops or conditions, because it follows the Rules of Hooks. Extract a child component for per-item IDs.",
      ],
      closing: "If several independent React apps share a page, pass identifierPrefix to createRoot or hydrateRoot, so that IDs from different apps cannot clash. With one app, you do not need this.",
    },
  ],
  mistakes: [
    {
      id: "hardcoded-id",
      heading: "Hard-coding an ID in a reusable component",
      problem: "id=\"email\" works until the component is rendered twice. Duplicate IDs are invalid HTML, and a label can end up pointing to the wrong input, which breaks the experience for assistive technology.",
      correction: "Generate the ID with useId.",
    },
    {
      id: "use-id-keys",
      heading: "Using useId for list keys",
      problem: "A key is meant to identify a data item, but useId is tied to a component’s position. It also cannot be called in a loop, so this approach is not possible without misusing the Hook.",
      correction: "Use a stable ID from your data for keys.",
    },
    {
      id: "counter-ssr",
      heading: "Using a counter in server-rendered components",
      problem: "A global counter can give different numbers on the server and on the client, because hydration order may differ from the order the server emitted. The result is a hydration mismatch that is hard to reproduce.",
      correction: "Use useId, which stays stable across server and client.",
    },
    {
      id: "tree-mismatch",
      heading: "Letting server and client trees differ",
      problem: "useId requires an identical component tree on both sides. Rendering something different on the client during hydration, such as based on window, means the generated IDs will not match.",
      correction: "Render the same tree during hydration, and change the output after mount if you must.",
    },
  ],
  interview: [
    {
      id: "uid-what",
      question: "What is useId for?",
      answer: "It generates a unique string for connecting accessibility attributes, such as aria-describedby, within a component. A reusable component cannot hard-code an ID, because rendering it twice would produce duplicates and connect the wrong elements.",
    },
    {
      id: "uid-counter",
      question: "Why not use an incrementing counter instead?",
      answer: "With server rendering, hydration order may not match the order the server produced HTML, so a counter can give different IDs on each side. useId derives its value from the component’s position in the tree, which stays consistent if the trees match.",
    },
    {
      id: "uid-keys",
      question: "Can useId generate keys for a list?",
      answer: "No. Keys should identify the data, and they should come from it. useId is tied to the component’s position, and it cannot be called in a loop either. For new client-side items, an ID created along with the data is the right approach.",
    },
    {
      id: "uid-multiple",
      question: "How do you handle several IDs in one component?",
      answer: "Call useId once and add a suffix for each element, as in id + \"-first\". That gives each a unique ID while sharing one prefix. Calling the Hook once per element also works, but it is more verbose.",
    },
    {
      id: "uid-prefix",
      question: "What is identifierPrefix for?",
      answer: "When several independent React apps run on one page, their generated IDs could collide. Passing identifierPrefix to createRoot or hydrateRoot gives each app’s IDs a distinct start. For server rendering, the server API must use the same prefix.",
    },
  ],
  takeaways: [
    "useId generates unique IDs for accessibility attributes.",
    "It stays consistent across server rendering, unlike a counter.",
    "Use suffixes for several related IDs.",
    "Do not use it for list keys.",
  ],
  quickReview: {
    definition: "useId returns a unique ID string for connecting accessibility attributes, stable across server and client rendering.",
    keyPoints: [
      "It takes no parameters.",
      "Add suffixes for several IDs.",
      "Server and client trees must match.",
      "identifierPrefix separates multiple apps on one page.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A generated ID",
      language: "tsx",
      code: `import { useId } from "react";

export default function Field({ label }: { label: string }) {
  const id = useId();

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}`,
      description: "Each instance has its own ID, so its label points to the right input.",
    },
    commonMistakes: [
      "Hard-coding IDs in reusable components.",
      "Using it to generate list keys.",
      "Using a counter in server-rendered code.",
    ],
    interviewTrap: "“Is useId a good source of list keys?” No. Keys should come from the data, and the Hook cannot be called in a loop.",
    takeaway: "Use it to connect elements for accessibility, and nothing else.",
  },
  sources: [
    { label: "useId reference", href: "https://react.dev/reference/react/useId" },
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
  ],
};
