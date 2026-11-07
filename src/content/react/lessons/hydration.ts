import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-hydration-is",
      heading: "What hydration is",
      paragraphs: [
        "Hydration is how React attaches to HTML that was generated on a server. React renders your components in the browser, matches the result to the existing DOM, and attaches event handlers and state, which turns the static snapshot into an interactive application. No new DOM needs to be created.",
        "An application built fully with React usually makes one hydrateRoot call at startup, and frameworks do this for you. If there is no server-rendered HTML, use createRoot instead, since hydrateRoot is not meant for that case.",
      ],
      examples: [
        {
          id: "hydrate-root",
          classification: "client",
          title: "Hydrating a server-rendered app",
          language: "tsx",
          code: `import { hydrateRoot } from "react-dom/client";

function App() {
  return <button type="button">Interactive once hydrated</button>;
}

const root = document.getElementById("root");

if (root) {
  hydrateRoot(root, <App />);
}`,
          description: "The button is already visible from the server’s HTML. This call attaches its behavior, and it must produce the same output.",
        },
      ],
    },
    {
      id: "must-match",
      heading: "The output must match",
      paragraphs: [
        "The tree passed to hydrateRoot has to produce the same output as on the server. The server’s HTML is what people see first, so showing something different afterward breaks the experience. Treat mismatches as bugs.",
        "Some are recoverable, but the best case is a slowdown. In the worst case, event handlers can attach to the wrong elements.",
      ],
      list: [
        "typeof window checks in rendering logic.",
        "Browser-only APIs during rendering, such as window.matchMedia.",
        "Data that differs between environments, such as a timestamp or Math.random.",
        "Extra whitespace around the React-generated HTML in the root.",
        "Invalid HTML nesting, such as a div inside a p, which the browser’s parser rewrites.",
      ],
      closing: "Browser extensions that change the page can also cause mismatches. That is not a bug in your code, but it may appear in the same error reports.",
    },
    {
      id: "fixing-mismatches",
      heading: "Rendering different content on purpose",
      paragraphs: [
        "If the client genuinely must show something different, render what the server rendered first, and switch after mount. The first pass matches the server’s HTML, and a second pass runs right after hydration.",
        "The tradeoff is that hydration is slower, because components render twice, and that the UI can change noticeably if JavaScript loads late. So use this sparingly.",
      ],
      examples: [
        {
          id: "two-pass",
          classification: "complete",
          title: "Two-pass rendering",
          language: "tsx",
          code: `import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export default function LocalTime({ iso }: { iso: string }) {
  const isClient = useIsClient();
  const date = new Date(iso);

  return <time dateTime={iso}>{isClient ? date.toLocaleString() : date.toISOString()}</time>;
}`,
          description: "The server and first client render use one stable format, then the user’s locale takes over. useSyncExternalStore’s separate server snapshot provides that switch, and useState with useEffect is another common way.",
        },
      ],
    },
    {
      id: "suppressing",
      heading: "When a difference is unavoidable",
      paragraphs: [
        "For a single element whose text is unavoidably different, such as a timestamp, suppressHydrationWarning silences the development warning. It only works one level deep, and it is an escape hatch, not a fix. React will not patch the mismatched text, so the server’s version stays until something updates it.",
      ],
      examples: [
        {
          id: "suppress",
          classification: "complete",
          title: "Silencing one known difference",
          language: "tsx",
          code: `export default function Copyright() {
  return <p suppressHydrationWarning={true}>Rendered on {new Date().toLocaleDateString()}</p>;
}`,
          description: "Use this rarely. It hides the warning for this element only, and React will not correct the text.",
        },
      ],
    },
    {
      id: "selective-hydration",
      heading: "Hydrating a piece at a time",
      paragraphs: [
        "Suspense boundaries let React hydrate parts of a page independently, rather than making everything wait. React can also prioritize what the user interacts with first. An Activity boundary divides the tree in a similar way, and it does not show a fallback on the initial render.",
        "Report errors with the onRecoverableError option on hydrateRoot, since recoverable hydration errors would otherwise only appear in a user’s console. Options belong in hydrateRoot, not in root.render.",
      ],
    },
  ],
  mistakes: [
    {
      id: "window-check",
      heading: "Branching on typeof window while rendering",
      problem: "A check for window seems like the correct way to handle two environments. It guarantees different output on each, which is precisely the mismatch that hydration cannot accept.",
      correction: "Render the same thing first, then update after mount, or use a server snapshot.",
    },
    {
      id: "date-in-render",
      heading: "Rendering dates and random values directly",
      problem: "new Date() and Math.random give different results on the server and in the browser, and locale formatting can differ between them too. The text mismatches, even though the code looks entirely harmless.",
      correction: "Pass one value from the server as a prop, or format it after mount.",
    },
    {
      id: "invalid-nesting",
      heading: "Writing invalid HTML nesting",
      problem: "A div inside a p, or nested a tags, renders in React, but the browser’s parser restructures the HTML from the server. The DOM then no longer matches what React expects, and it reports an error.",
      correction: "Use valid HTML structure, and check the nesting that React’s warning describes.",
    },
    {
      id: "suppress-everything",
      heading: "Using suppressHydrationWarning as a general fix",
      problem: "It silences the warning, but it does not fix the underlying difference, and React will not patch the text. Used broadly, it hides real bugs that might lead to incorrect content.",
      correction: "Fix the cause, and keep this for one-level, truly unavoidable cases.",
    },
    {
      id: "render-before-hydrate",
      heading: "Calling root.render before hydration finishes",
      problem: "Updating through the root during hydration makes React clear the server’s HTML and switch the whole root to client rendering, which throws away the benefit of having rendered on the server.",
      correction: "Trigger updates through state, once the app has hydrated.",
    },
  ],
  interview: [
    {
      id: "hy-what",
      question: "What is hydration?",
      answer: "React attaching to server-rendered HTML. It renders in the browser, matches the result to the existing DOM, and attaches event handlers and state. The DOM is reused rather than re-created, which turns the static snapshot into an interactive page.",
    },
    {
      id: "hy-mismatch",
      question: "What causes a hydration mismatch?",
      answer: "Rendering something different on the client from the server: typeof window checks, browser APIs during rendering, timestamps or random values, invalid HTML nesting, or extra whitespace in the root. Browser extensions changing the page can also cause one.",
    },
    {
      id: "hy-consequence",
      question: "What happens when hydration does not match?",
      answer: "React warns in development, and it can recover from some cases, perhaps by re-rendering on the client. At best, that costs time. At worst, handlers attach to the wrong elements. It does not guarantee patching attributes, so mismatches should be treated as bugs.",
    },
    {
      id: "hy-fix",
      question: "How do you show client-only content without a mismatch?",
      answer: "Render the same output as the server on the first pass, then switch after mount, such as with state set in an Effect or useSyncExternalStore’s server snapshot. A Suspense boundary with use(browser()) in React 19.3, or a framework’s client-only option, is another approach.",
    },
    {
      id: "hy-cost",
      question: "Why is hydration sometimes expensive?",
      answer: "React has to run your components again in the browser to attach to the HTML, so you pay for the JavaScript as well as for the markup. Until it finishes, the page looks ready without responding. Sending less client code reduces that, and so does hydrating progressively.",
    },
    {
      id: "hy-selective",
      question: "What is selective hydration?",
      answer: "With Suspense boundaries, React can hydrate parts of the page independently rather than all at once, and it can prioritize what someone interacts with. So a slow part of the page does not keep a nearby button from becoming usable.",
    },
    {
      id: "hy-report",
      question: "How would you find hydration errors in production?",
      answer: "Pass onRecoverableError, along with the other error options, to hydrateRoot, and send the details to a reporting service. Otherwise, recoverable errors only appear in each user’s console. Frameworks may have their own hook for this.",
    },
  ],
  takeaways: [
    "Hydration attaches React to server-rendered HTML.",
    "The first client render must match the server’s output.",
    "Render matching output first when content must differ.",
    "suppressHydrationWarning is a narrow escape hatch.",
  ],
  quickReview: {
    definition: "Hydration is React attaching state and event handlers to existing server-rendered HTML, without re-creating it.",
    keyPoints: [
      "Use hydrateRoot only when there is server HTML.",
      "The first client render must match it.",
      "Checks for window, dates, and invalid nesting cause mismatches.",
      "Suspense enables hydrating in parts.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Switching after hydration",
      language: "tsx",
      code: `const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);`,
      typecheckContext: { before: `import { useEffect, useState } from "react";\nexport function useExample() {`, after: "return isClient;\n}" },
      description: "The first render matches the server, then the client’s version takes over.",
    },
    commonMistakes: [
      "Branching on typeof window while rendering.",
      "Rendering new Date() directly.",
      "Nesting a div inside a p.",
    ],
    interviewTrap: "“Does suppressHydrationWarning fix a mismatch?” No. It hides the warning for one element, and React will not correct the text.",
    takeaway: "Make the first client render identical to the server’s, and change it only afterward.",
  },
  sources: [
    { label: "hydrateRoot reference", href: "https://react.dev/reference/react-dom/client/hydrateRoot" },
    { label: "web.dev: Rendering on the Web", href: "https://web.dev/articles/rendering-on-the-web" },
    { label: "Activity reference", href: "https://react.dev/reference/react/Activity" },
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
  ],
};
