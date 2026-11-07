import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-use-does",
      heading: "What use does",
      paragraphs: [
        "use reads a resource during rendering and returns its value: const value = use(resource). The resource can be a context or a Promise. React 19.3 also lets it take the result of browser() from react-dom, for browser-only content.",
        "Despite its name, use is not a Hook, and its rules differ from those of ordinary Hooks. It must still be called inside a component or a Hook, but it can be called in loops and conditionals.",
      ],
      comparison: [
        {
          id: "ordinary-hooks",
          title: "Ordinary Hooks",
          items: ["Top level only.", "Same order on every render.", "Not inside conditions or loops."],
        },
        {
          id: "use-api",
          title: "use",
          items: ["Inside a component or Hook.", "Allowed in conditions and loops.", "Not allowed in try and catch."],
        },
      ],
    },
    {
      id: "reading-context",
      heading: "Reading context",
      paragraphs: [
        "With a context, use returns the value from the closest provider above, just as useContext does. The difference is that it can be called conditionally, such as after an early return. Providers inside the same component are not considered, and reading context in Server Components is not supported.",
      ],
      examples: [
        {
          id: "conditional-context",
          classification: "complete",
          title: "Reading a context only when needed",
          language: "tsx",
          code: `import { createContext, use } from "react";

const ThemeContext = createContext("light");

export default function Divider({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  const theme = use(ThemeContext);

  return <hr className={"divider-" + theme} />;
}`,
          description: "This would break the Rules of Hooks with useContext, because the Hook would come after an early return.",
        },
      ],
    },
    {
      id: "reading-promises",
      heading: "Reading Promises",
      paragraphs: [
        "With a Promise, use returns the resolved value. While it is pending, the component suspends, and the closest Suspense fallback is shown. If it rejects, the nearest Error Boundary’s fallback is shown.",
        "This pairs well with Server Components. A Server Component can start a request and pass the Promise to a Client Component, which reads it with use inside a boundary. Its resolved value must be serializable. A Server Component itself can simply await, while a Client Component cannot.",
      ],
      examples: [
        {
          id: "promise-read",
          classification: "client",
          title: "Reading a Promise passed from a parent",
          language: "tsx",
          code: `"use client";

import { Suspense, use } from "react";

function Message({ messagePromise }: { messagePromise: Promise<string> }) {
  const message = use(messagePromise);

  return <p>{message}</p>;
}

export default function Inbox({ messagePromise }: { messagePromise: Promise<string> }) {
  return (
    <Suspense fallback={<p>Waiting for message…</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}`,
          description: "The Promise comes from outside, such as from a Server Component, a router, or a cache. Wrap the area in an Error Boundary as well, for rejected Promises.",
        },
      ],
    },
    {
      id: "uncached-promises",
      heading: "The uncached Promise problem",
      paragraphs: [
        "Promises passed to use must be cached, so that the same instance is reused across renders. A Promise created during rendering is new each time. React shows the fallback, retries, gets another new Promise, and the content never appears. React reports this as a component being suspended by an uncached promise.",
        "Ideally, create Promises before rendering: in an event handler, a route loader, or a Server Component. Frameworks usually provide their own caching. Adding .then or calling an uncached async function during rendering creates new Promises in the same way.",
      ],
      examples: [
        {
          id: "cached-fetch",
          classification: "complete",
          title: "A basic Promise cache",
          language: "tsx",
          code: `const cache = new Map<string, Promise<unknown>>();

export function fetchData(url: string): Promise<unknown> {
  let promise = cache.get(url);

  if (!promise) {
    promise = fetch(url).then(response => response.json());
    cache.set(url, promise);
  }

  return promise;
}`,
          description: "Calling this with the same URL returns the same Promise, so use(fetchData(url)) is stable. This simple version never expires entries, so a real application needs a proper data library or framework cache.",
        },
      ],
    },
    {
      id: "rules-and-errors",
      heading: "Rules and error handling",
      paragraphs: [
        "use cannot be called inside a try and catch block, because it throws internally to integrate with Suspense. Handle rejected Promises with an Error Boundary instead, or catch inside the Promise itself, so that it resolves with a fallback value.",
        "Do not read promise.status or promise.value directly to get around it, as that can break Suspense optimizations and DevTools.",
      ],
      examples: [
        {
          id: "catch-in-promise",
          classification: "complete",
          title: "Resolving with a fallback value",
          language: "tsx",
          code: `export function loadMessage(url: string): Promise<string> {
  return fetch(url)
    .then(response => response.text())
    .catch(() => "The message could not be loaded.");
}`,
          description: "The Promise now always resolves, so no Error Boundary is needed for this case. Create it outside of rendering, and cache it as above.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "promise-in-render",
      heading: "Creating a Promise during rendering",
      problem: "use(fetch(url)) looks like the natural way to use this API, but each render makes a new Promise. React keeps showing the fallback, and it can loop without the content ever appearing.",
      correction: "Create Promises outside rendering, or use a cache, framework, or data library.",
    },
    {
      id: "try-catch-use",
      heading: "Wrapping use in try and catch",
      problem: "A try and catch seems the obvious way to handle a rejected Promise. But use throws as part of how it suspends, so catching it interferes with that mechanism, and React does not allow it.",
      correction: "Use an Error Boundary, or catch within the Promise itself.",
    },
    {
      id: "thinks-hook",
      heading: "Assuming use follows all Hook rules",
      problem: "Its name suggests a Hook, so developers avoid calling it conditionally, sometimes restructuring code for no reason. The reverse mistake is assuming it works anywhere, when it still has to be called inside a component or Hook.",
      correction: "Remember it may be conditional, and it must still be called during rendering of a component or Hook.",
    },
    {
      id: "use-fetching",
      heading: "Treating use as a data-fetching library",
      problem: "use only reads a Promise that already exists. It does not cache, deduplicate, refetch, or revalidate anything, so building all data loading on it alone means writing that machinery yourself.",
      correction: "Use a framework or data library for caching, and let use read the result.",
    },
    {
      id: "context-in-rsc",
      heading: "Reading context in a Server Component",
      problem: "Because use works with context, it may seem to work anywhere. Reading context in Server Components is not supported, and a framework will report an error.",
      correction: "Read the context in a Client Component, and pass data as props from the server.",
    },
  ],
  interview: [
    {
      id: "ua-what",
      question: "What is the use API?",
      answer: "A React API that reads a resource during rendering: a context, or a Promise. With a Promise, the component suspends until it resolves, and a rejection goes to an Error Boundary. It can be called conditionally, which is unusual, and it is not a Hook.",
    },
    {
      id: "ua-vs-usecontext",
      question: "How does use differ from useContext?",
      answer: "Both read the nearest provider, and use also accepts Promises. The practical difference is that use may be called in conditions and loops, such as after an early return, while useContext has to be at the top level. Otherwise, useContext remains fine.",
    },
    {
      id: "ua-uncached",
      question: "Why does use(fetch(url)) not work?",
      answer: "A new Promise is created on every render. React suspends, retries, and gets a different Promise, so the content never appears, and React warns about an uncached promise. Promises should be created outside rendering, or returned from a cache.",
    },
    {
      id: "ua-errors",
      question: "How do you handle errors with use?",
      answer: "With an Error Boundary around the component, because a rejection is thrown during rendering. You cannot wrap use in try and catch, as it uses throwing internally. Alternatively, catch inside the Promise, so that it resolves to a fallback value.",
    },
    {
      id: "ua-server-client",
      question: "How does use help with server-to-client data?",
      answer: "A Server Component can start a request without awaiting, and pass the Promise to a Client Component, which reads it with use inside Suspense. The rest of the page does not have to wait. The resolved value must be serializable.",
    },
    {
      id: "ua-vs-await",
      question: "When would a component use await rather than use?",
      answer: "A Server Component can be async, so it simply awaits. Client Components cannot await during rendering, so they use use. In a Server Component, awaiting essential data blocks that subtree, so lower-priority data can be passed along as a Promise instead.",
    },
  ],
  takeaways: [
    "use reads a context or a Promise during rendering.",
    "It can be conditional, but it cannot be inside try and catch.",
    "Promises must be cached, or created outside rendering.",
    "It reads data, and something else has to fetch and cache it.",
  ],
  quickReview: {
    definition: "use reads a context or a Promise during rendering, suspending while a Promise is pending.",
    keyPoints: [
      "It is not a Hook, though it must be in a component or Hook.",
      "Conditions and loops are allowed.",
      "Rejections go to an Error Boundary.",
      "Uncached Promises keep it suspended.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Reading a stable Promise",
      language: "tsx",
      code: `const user = use(userPromise);`,
      typecheckContext: { before: `import { use } from "react";\nexport function Profile({ userPromise }: { userPromise: Promise<string> }) {`, after: "return <p>{user}</p>;\n}" },
      description: "The Promise is a prop, so it stays the same between renders.",
    },
    commonMistakes: [
      "Calling use(fetch(url)) directly.",
      "Wrapping it in try and catch.",
      "Reading context with it in a Server Component.",
    ],
    interviewTrap: "“Is use a Hook?” No. It can be called conditionally, although it still has to be called within a component or Hook.",
    takeaway: "use only reads a resource, and the resource has to be stable before you read it.",
  },
  sources: [
    { label: "use reference", href: "https://react.dev/reference/react/use" },
    { label: "React 19 release notes", href: "https://react.dev/blog/2024/12/05/react-19" },
    { label: "Server Components reference", href: "https://react.dev/reference/rsc/server-components" },
    { label: "React 19.3 release notes", href: "https://react.dev/blog/2026/09/09/react-19-3" },
  ],
};
