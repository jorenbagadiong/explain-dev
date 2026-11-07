import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-the-directive-does",
      heading: "What \"use client\" does",
      paragraphs: [
        "\"use client\" is a directive for React Server Components. It marks a module as client code, and compatible bundlers and frameworks treat importing it as a boundary between server-run and client-run code. Without it, a module is server code in an RSC app.",
        "It applies to modules, not to individual components. It marks that module and all of its transitive dependencies as client code, so you do not add it to every interactive file, only to the entry points of the client tree.",
      ],
      examples: [
        {
          id: "client-module",
          classification: "client",
          title: "A client module",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <button type="button" onClick={() => setLikes(previous => previous + 1)}>
      {likes} likes
    </button>
  );
}`,
          description: "The directive sits at the very top of the file, above any imports, with single or double quotes rather than backticks. Comments above it are fine.",
        },
      ],
    },
    {
      id: "does-not-mean-browser-only",
      heading: "It does not mean browser-only",
      paragraphs: [
        "This is the most common misunderstanding. \"use client\" says the component’s code must be sent to the client. It does not say that the component is never rendered on a server.",
        "In Next.js, for example, Client Components are also prerendered to HTML on the server for the first load, and then hydrated in the browser. On later navigations, they render entirely on the client. So a Client Component body can run on a server, and reading window during rendering will fail there. How this works depends on the framework.",
      ],
      visual: {
        heading: "A Client Component’s first load, in Next.js",
        context: "This shows Next.js behavior, which other frameworks may handle differently.",
        steps: [
          { id: "prerender", title: "Prerendered on the server", description: "The Client Component runs on the server, producing HTML." },
          { id: "html", title: "HTML arrives", description: "The user sees a fast, non-interactive preview." },
          { id: "js", title: "JavaScript loads", description: "The component’s code reaches the browser." },
          { id: "hydrate", title: "Hydration", description: "React attaches event handlers, and the component becomes interactive." },
        ],
        note: "Effects and event handlers only run in the browser, so that is where browser APIs belong.",
      },
    },
    {
      id: "module-tree",
      heading: "The boundary is in the module tree",
      paragraphs: [
        "The boundary follows imports, not the render tree. A component’s environment depends on where its module is imported. The same component definition with no directive can be a Server Component in one place, and a Client Component in another. These terms describe usage, not definitions.",
        "So what a Client Component imports becomes client code. But a Server Component passed to it as children stays on the server, because the parent created it, and the Client Component never imported it.",
      ],
      examples: [
        {
          id: "children-slot",
          classification: "client",
          title: "A client wrapper with server content",
          language: "tsx",
          code: `"use client";

import { useState, type ReactNode } from "react";

export default function Tabs({ overview, details }: { overview: ReactNode; details: ReactNode }) {
  const [tab, setTab] = useState<"overview" | "details">("overview");

  return (
    <section>
      <button type="button" onClick={() => setTab("overview")}>
        Overview
      </button>
      <button type="button" onClick={() => setTab("details")}>
        Details
      </button>
      {tab === "overview" ? overview : details}
    </section>
  );
}`,
          description: "A Server Component can render <Tabs overview={<Overview />} details={<Details />} />. Those two stay Server Components, while only the tab switching ships to the browser.",
        },
      ],
    },
    {
      id: "what-crosses",
      heading: "What can cross the boundary",
      paragraphs: [
        "Props passed from a Server Component to a Client Component must be serializable, because they travel over the network.",
      ],
      comparison: [
        {
          id: "supported",
          title: "Supported",
          items: ["Primitives, Date, and plain objects.", "Arrays, Map, and Set of supported values.", "JSX elements.", "Promises.", "Server Functions."],
        },
        {
          id: "not-supported",
          title: "Not supported",
          items: ["Ordinary functions, such as an inline onClick.", "Classes and class instances.", "Objects with a null prototype.", "Symbols not registered with Symbol.for."],
        },
      ],
    },
    {
      id: "where-to-place-it",
      heading: "Where to draw the boundary",
      paragraphs: [
        "Add the directive when a component needs Hooks and state, event handlers, or browser APIs. Keep it as low in the tree as you can, because all code in the client module subtree is sent to and run by the client. A large page marked as client ships everything it imports.",
        "Third-party libraries that use state or Effects must run on the client as well. If a library is not ready for Server Components, wrap it in your own client file.",
      ],
      list: [
        "Prefer a small client leaf, such as a search box, over marking the whole layout.",
        "Pass server-rendered content in as children.",
        "If a client module is imported by another client module, its directive has no effect, and is not needed there.",
      ],
    },
  ],
  mistakes: [
    {
      id: "browser-only-belief",
      heading: "Assuming \"use client\" means browser-only",
      problem: "Reading localStorage or window during rendering in a Client Component seems safe, given the name. In frameworks that prerender, that code also runs on a server, so it throws, or else the HTML differs and hydration fails.",
      correction: "Read browser APIs in Effects or event handlers, or use useSyncExternalStore with a server snapshot.",
    },
    {
      id: "client-at-top",
      heading: "Marking a high-level component as client",
      problem: "Adding the directive to a page to fix one Hook error moves everything it imports into the client bundle. The application still works, and the benefit of Server Components quietly disappears for that whole subtree.",
      correction: "Extract only the interactive part into its own client module.",
    },
    {
      id: "directive-everywhere",
      heading: "Adding the directive to every client file",
      problem: "It is only needed at the boundary. Components imported by a client module are already client code, so repeating it adds noise, and suggests that each is a separate entry point when it is not.",
      correction: "Mark the entry points of the client tree, and leave the rest unmarked.",
    },
    {
      id: "import-server-into-client",
      heading: "Importing a Server Component into a Client Component",
      problem: "A Client Component that imports a server module turns it into client code, or fails if it uses server-only features such as a database. The module is now in the client bundle, which can include code you meant to keep private.",
      correction: "Pass the Server Component in as children or another JSX prop from a server parent.",
    },
    {
      id: "passing-handlers",
      heading: "Passing event handlers from server to client",
      problem: "onClick={() => doThing()} on a client component rendered by a Server Component fails, because ordinary functions cannot be serialized. It is a natural pattern from client-only React that no longer applies at this boundary.",
      correction: "Define the handler inside the Client Component, or pass a Server Function.",
    },
  ],
  interview: [
    {
      id: "cb-what",
      question: "What does the use client directive do?",
      answer: "It marks a module and its dependencies as client code, creating a boundary in the module tree for bundlers and frameworks. It is not per component. Without it, modules in an RSC app are server code. It is what makes hooks and event handlers usable.",
    },
    {
      id: "cb-ssr",
      question: "Does use client mean a component only renders in the browser?",
      answer: "No. It means its code is sent to the client. In Next.js, Client Components are also prerendered to HTML on the server for the first load, then hydrated. So rendering code must not assume browser APIs, while Effects and handlers can use them.",
    },
    {
      id: "cb-tree",
      question: "Is the boundary in the render tree or the module tree?",
      answer: "The module tree. What a client module imports becomes client code. But elements passed as children are created by the parent, so a Server Component passed into a Client Component stays on the server. That is why children is such a useful pattern here.",
    },
    {
      id: "cb-props",
      question: "What can be passed from a Server Component to a Client Component?",
      answer: "Serializable values: primitives, plain objects, arrays, Map, Set, Date, JSX, Promises, and Server Functions. Not ordinary functions, classes, or class instances. They have to travel over the network, so anything with behavior needs to be defined on the client.",
    },
    {
      id: "cb-where",
      question: "Where should you place use client?",
      answer: "As low as possible, on the components that actually need interactivity. The whole client subtree ships to the browser, so marking a page at the top loses the benefit. I would extract a small interactive leaf, and pass server content through children.",
    },
    {
      id: "cb-third-party",
      question: "How do you use a third-party component that relies on useState in a Server Component?",
      answer: "Wrap it in your own module marked with use client, and re-export it. Then a Server Component can render that wrapper. Library authors can also add the directive at their entry points, so that users do not have to.",
    },
  ],
  takeaways: [
    "use client marks a module boundary, not a single component.",
    "It does not mean browser-only, since frameworks may prerender Client Components.",
    "Keep client boundaries low, and pass server content as children.",
    "Props across the boundary must be serializable.",
  ],
  quickReview: {
    definition: "\"use client\" marks a module and its dependencies as client code, creating a boundary between server-run and client-run code.",
    keyPoints: [
      "It belongs at the very top of the file.",
      "The boundary follows imports, not the render tree.",
      "Client Components can still be prerendered on a server.",
      "Server Components passed as children stay on the server.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "client",
      title: "A small client leaf",
      language: "tsx",
      code: `"use client";

export default function Toggle({ onLabel }: { onLabel: string }) {
  return <button type="button" onClick={() => console.log(onLabel)}>{onLabel}</button>;
}`,
      description: "Only this leaf and what it imports need to ship to the browser.",
    },
    commonMistakes: [
      "Reading window while rendering a Client Component.",
      "Marking a whole page as client.",
      "Passing an inline handler from a Server Component.",
    ],
    interviewTrap: "“Are Client Components never rendered on the server?” They can be. In Next.js they are prerendered to HTML, then hydrated in the browser.",
    takeaway: "Read it as ship this code to the client, not as run this only in the browser.",
  },
  sources: [
    { label: "use client reference", href: "https://react.dev/reference/rsc/use-client" },
    { label: "Next.js: Server and Client Components", href: "https://nextjs.org/docs/app/getting-started/server-and-client-components" },
    { label: "Server Components reference", href: "https://react.dev/reference/rsc/server-components" },
  ],
};
