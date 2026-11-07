import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-they-are",
      heading: "What Server Components are",
      paragraphs: [
        "React Server Components are a type of component that renders ahead of time, before bundling, in an environment separate from your client app or SSR server. That environment is the server in their name. Their code, and the libraries they use, are never sent to the browser. Only the rendered output arrives.",
        "They can run at build time on a CI server, or per request on a web server. So despite the name, a running web server is not always required. A site can read Markdown files during its build, and ship only the resulting HTML.",
      ],
      examples: [
        {
          id: "async-server-component",
          classification: "server",
          title: "An async Server Component",
          language: "tsx",
          code: `interface Note {
  id: string;
  title: string;
}

async function getNote(id: string): Promise<Note> {
  const response = await fetch("https://api.example.com/notes/" + id);
  return response.json();
}

export default async function NotePage({ id }: { id: string }) {
  const note = await getNote(id);

  return (
    <article>
      <h1>{note.title}</h1>
    </article>
  );
}`,
          description: "It can be async, and can await data during rendering, which client components cannot do. In a real Server Component, this could also read a database directly, with no API in between.",
        },
      ],
    },
    {
      id: "not-ssr",
      heading: "Server Components are not the same as SSR",
      paragraphs: [
        "These are separate steps, and they are often confused. Server-side rendering turns your components into HTML for the first page load, and the client later hydrates it, so the components’ code is still sent to the browser. Server Components render to a serialized output, and their code is never sent.",
        "You can use them together, and frameworks usually do. The Server Component output can then optionally be server-side rendered to produce the page’s initial HTML.",
      ],
      comparison: [
        {
          id: "ssr",
          title: "Server-side rendering",
          items: ["Produces HTML for the initial load.", "The components’ code also ships to the client.", "Then hydrates in the browser."],
        },
        {
          id: "rsc",
          title: "Server Components",
          items: ["Render before bundling, on a server or at build time.", "Their code stays out of the client bundle.", "Never hydrate, because they do not run in the browser."],
        },
      ],
    },
    {
      id: "restrictions",
      heading: "What they cannot do",
      paragraphs: [
        "Because they are not sent to the browser, Server Components cannot use interactive APIs. That means no useState or useEffect, and no event handlers such as onClick. They also cannot create or read context, although they can render a provider imported from a client module.",
        "In exchange, they can do things the browser never could, such as reading the filesystem or using secrets, and they add nothing to the client bundle.",
      ],
      comparison: [
        {
          id: "server-can",
          title: "Server Components can",
          items: ["Be async, and await data.", "Read databases and files.", "Use secrets safely.", "Import large libraries at no client cost."],
        },
        {
          id: "server-cannot",
          title: "They cannot",
          items: ["Use state or Effects.", "Attach event handlers.", "Use browser APIs.", "Read context."],
        },
      ],
    },
    {
      id: "adding-interactivity",
      heading: "Adding interactivity",
      paragraphs: [
        "To add interactivity, compose them with Client Components, marked with the \"use client\" directive. A Server Component can render a Client Component and pass it serializable props, including JSX as children. The browser receives the Server Component’s output as those props.",
      ],
      examples: [
        {
          id: "client-island",
          classification: "client",
          title: "A Client Component receiving server output",
          language: "tsx",
          code: `"use client";

import { useState, type ReactNode } from "react";

export default function Expandable({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {title}
      </button>
      {isOpen && children}
    </section>
  );
}`,
          description: "A Server Component can render <Expandable title=\"Note\"><p>Server output</p></Expandable>. The paragraph comes from the server, and only the toggle’s code ships to the browser.",
        },
      ],
    },
    {
      id: "framework-support",
      heading: "Where they run, and what they need",
      paragraphs: [
        "React defines Server Components, but using them requires a bundler or framework that implements them, since code has to be split across environments. Next.js’s App Router is one such framework, in which pages are Server Components by default. A plain client-side React app does not get them automatically.",
        "They are stable in React 19 and will not break between minor versions. The underlying APIs that bundler and framework authors use do not follow semver, so those authors pin a specific React version. As an application developer using a framework, you do not deal with those APIs directly.",
      ],
      list: [
        "Async components are not supported on the client.",
        "A Server Component is made dynamic by re-fetching it from the server, which renders it again with fresh data.",
        "There is no \"use server\" directive for Server Components. That directive is for Server Functions.",
      ],
    },
  ],
  mistakes: [
    {
      id: "same-as-ssr",
      heading: "Treating Server Components as the same thing as SSR",
      problem: "Both involve a server, so they are easily mixed up. SSR still sends the component code to the browser for hydration, while Server Component code never goes there. Confusing them leads to wrong expectations about bundle size and hooks.",
      correction: "Think of SSR as producing HTML, and Server Components as code that stays on the server.",
    },
    {
      id: "use-server-for-rsc",
      heading: "Marking a Server Component with \"use server\"",
      problem: "The name suggests it would mark a component for the server. That directive actually creates Server Functions, which are callable from the client, so applying it to a component does something quite different from what was intended.",
      correction: "Leave Server Components unmarked in a framework where that is the default, and use \"use server\" only for Server Functions.",
    },
    {
      id: "hooks-in-rsc",
      heading: "Using state or handlers in a Server Component",
      problem: "useState or onClick in a Server Component fails, because the component never runs in a browser. In Next.js this appears as an error that may suggest adding a directive, and adding it to a whole page moves too much to the client.",
      correction: "Extract the interactive part into a small Client Component, and render it from the Server Component.",
    },
    {
      id: "non-serializable-props",
      heading: "Passing non-serializable props across the boundary",
      problem: "Functions, classes, and class instances cannot cross from a Server Component to a Client Component, since props have to be serialized. An inline onClick passed down is a common way of hitting this error.",
      correction: "Pass plain data, JSX, or Server Functions, and define handlers inside the Client Component.",
    },
    {
      id: "assumes-available",
      heading: "Assuming every React app has them",
      problem: "Because they are part of React 19, it is easy to assume they work everywhere. A plain client-only app has no server environment or bundler support for them, so an async component there is simply unsupported.",
      correction: "Use a framework or bundler that implements them, and check what your setup provides.",
    },
  ],
  interview: [
    {
      id: "sc-what",
      question: "What are React Server Components?",
      answer: "Components that render ahead of time, in an environment separate from the client, either at build time or per request. Their code is not sent to the browser, only their output. They can be async and read data directly, but they cannot use state, Effects, or event handlers.",
    },
    {
      id: "sc-vs-ssr",
      question: "How do Server Components differ from server-side rendering?",
      answer: "SSR renders components to HTML for the first load, and their code still ships to be hydrated. Server Components produce output that never needs their code on the client, so they reduce the bundle. They are complementary, and frameworks commonly use both.",
    },
    {
      id: "sc-server-required",
      question: "Do Server Components require a running server?",
      answer: "Not necessarily. They can run once at build time, such as on a CI server, to read files or fetch static content. Running per request is the other mode, when you need fresh data. The name refers to an environment separate from the client.",
    },
    {
      id: "sc-interact",
      question: "How do you add interactivity to a Server Component?",
      answer: "Compose it with a Client Component marked with use client. The Server Component renders it, passing serializable props, including JSX as children. Keep the Client Component small, so that the rest stays out of the bundle.",
    },
    {
      id: "sc-benefits",
      question: "What are the benefits of Server Components?",
      answer: "Less JavaScript in the browser, since their code and dependencies never ship. Direct access to server data, without building an API for each need. Secrets can stay on the server. The tradeoff is more to reason about, with two environments and a boundary.",
    },
    {
      id: "sc-framework",
      question: "Can you use Server Components without a framework?",
      answer: "They need a bundler or framework that implements them, because code has to be separated across environments. Next.js’s App Router is the common example. It is possible to build this support yourself, but those lower-level APIs do not follow semver in React 19.",
    },
    {
      id: "sc-promise-pass",
      question: "How can data loading be split between server and client?",
      answer: "A Server Component can await what is essential, and pass a Promise for lower-priority data to a Client Component, which reads it with use inside a Suspense boundary. The important content appears first, while the rest streams in without blocking it.",
    },
  ],
  takeaways: [
    "Server Components render outside the client, and their code never ships.",
    "They are not the same thing as server-side rendering.",
    "They cannot use state, Effects, or event handlers.",
    "They need a bundler or framework, and Next.js’s conventions are not universal.",
  ],
  quickReview: {
    definition: "Server Components render ahead of time in a separate environment and send only their output to the browser, not their code.",
    keyPoints: [
      "They run at build time or per request.",
      "They can be async, and read data directly.",
      "Interactivity comes from Client Components.",
      "Props to Client Components must be serializable.",
      "Stable in React 19, with a framework or bundler required.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "server",
      title: "An async component",
      language: "tsx",
      code: `export default async function Greeting() {
  const response = await fetch("https://api.example.com/user");
  const user: { name: string } = await response.json();

  return <p>Hello, {user.name}</p>;
}`,
      description: "It awaits data during rendering, and its code never reaches the browser.",
    },
    commonMistakes: [
      "Confusing them with server-side rendering.",
      "Using \"use server\" to mark a component.",
      "Passing functions as props to Client Components.",
    ],
    interviewTrap: "“Are Server Components the same as SSR?” No. SSR ships the component code for hydration, while Server Component code never reaches the client.",
    takeaway: "Use the server for what does not need the browser, and small Client Components for the rest.",
  },
  sources: [
    { label: "Server Components reference", href: "https://react.dev/reference/rsc/server-components" },
    { label: "use client reference", href: "https://react.dev/reference/rsc/use-client" },
    { label: "Next.js: Server and Client Components", href: "https://nextjs.org/docs/app/getting-started/server-and-client-components" },
  ],
};
