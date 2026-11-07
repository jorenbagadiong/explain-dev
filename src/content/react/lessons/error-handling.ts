import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "kinds-of-failure",
      heading: "Different failures need different handling",
      paragraphs: [
        "Not all errors reach React in the same way, and where one happens decides how you can handle it. An Error Boundary only catches errors thrown while React is rendering. A failure in a click handler or a request happens outside rendering, so you handle it in your own code.",
      ],
      comparison: [
        {
          id: "render-errors",
          title: "Handled by an Error Boundary",
          items: ["Errors thrown during rendering.", "Errors in lifecycle methods and Effects.", "Rejected Promises read with use, or thrown in an Action’s transition."],
        },
        {
          id: "own-errors",
          title: "Handled by your own code",
          items: ["Errors in event handlers.", "Errors in asynchronous callbacks, such as setTimeout.", "Failed requests, which are not exceptions at all until you check them."],
        },
      ],
      closing: "Error Boundaries do not catch errors during server rendering, or errors thrown by the boundary itself.",
    },
    {
      id: "handlers-and-async",
      heading: "Handling errors in events and requests",
      paragraphs: [
        "For errors outside rendering, catch them where they happen, and put a description into state. fetch only rejects for network failures. A 404 or 500 response resolves normally, so you must check response.ok yourself.",
      ],
      examples: [
        {
          id: "handler-errors",
          classification: "client",
          title: "Recovering from a failed save",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

export function SaveNote({ text }: { text: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", { method: "POST", body: text });
      if (!response.ok) throw new Error("Save failed: " + response.status);
    } catch {
      setError("Your note could not be saved. Check your connection, then try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <button onClick={handleSave} disabled={isSaving}>
        {error ? "Try again" : "Save"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}`,
          description: "The user’s text is untouched, they get a clear message with a way to retry, and role=\"alert\" announces it.",
        },
      ],
    },
    {
      id: "error-boundaries",
      heading: "Error Boundaries for rendering failures",
      paragraphs: [
        "With no boundary, an error during rendering removes the whole React tree from the screen. A boundary shows a fallback instead, and limits the damage to that part of the page. There is no Hook version, so a boundary is written as a class, implementing getDerivedStateFromError for the fallback, and optionally componentDidCatch for logging.",
      ],
      examples: [
        {
          id: "boundary",
          classification: "client",
          title: "A boundary with a retry",
          language: "tsx",
          code: `"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class SectionBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div role="alert">
        <p>This section could not be displayed.</p>
        <button onClick={() => this.setState({ hasError: false })}>Try again</button>
      </div>
    );
  }
}`,
          description: "Try again renders the children again, which helps if the problem was temporary. Replace console.error with your reporting service in production.",
        },
      ],
    },
    {
      id: "placement",
      heading: "Where to place boundaries",
      paragraphs: [
        "One boundary around the entire app prevents a blank page, but it replaces everything when a small widget fails. Placing boundaries around independent sections means that a failed chart leaves the navigation and the rest of the page working. There is no need to wrap every component, since a fallback only helps where it makes sense to a user.",
      ],
      visual: {
        heading: "Layers of boundaries",
        context: "Indentation shows nesting. An error is caught by the closest boundary above it.",
        root: {
          id: "root-boundary",
          title: "App-level boundary",
          description: "A last resort, with a message and a way to reload.",
          children: [
            {
              id: "page-boundary",
              title: "Page-level boundary",
              description: "Keeps the navigation, so the person can go elsewhere.",
              children: [{ id: "widget-boundary", title: "Widget-level boundary", description: "Contains a failure in one independent section." }],
            },
          ],
        },
        note: "React looks for the closest boundary above the component that threw. A boundary cannot catch its own errors.",
      },
    },
    {
      id: "reporting",
      heading: "Reporting what went wrong",
      paragraphs: [
        "You cannot fix what you do not know about. createRoot and hydrateRoot accept onCaughtError, onUncaughtError, and onRecoverableError options, which suit sending errors to a reporting service. onCaughtError covers those a boundary caught, onUncaughtError covers those it did not, and onRecoverableError covers those React recovered from on its own.",
      ],
      examples: [
        {
          id: "root-options",
          classification: "complete",
          title: "Reporting from the root",
          language: "typescript",
          code: `import { createRoot } from "react-dom/client";

declare function report(kind: string, error: unknown): void;

export function startApp(container: HTMLElement) {
  return createRoot(container, {
    onCaughtError: error => report("caught", error),
    onUncaughtError: error => report("uncaught", error),
    onRecoverableError: error => report("recoverable", error),
  });
}`,
          description: "report stands in for your own reporting code. Frameworks such as Next.js create the root for you, and have their own reporting mechanisms.",
        },
      ],
    },
    {
      id: "good-recovery",
      heading: "What good recovery looks like",
      paragraphs: ["An error message is part of the interface, so it deserves as much thought as the rest."],
      list: [
        "Say what happened in plain language, without stack traces or codes alone.",
        "Offer a next step, such as trying again or going back.",
        "Keep what the person entered, so that they do not have to redo it.",
        "Announce it to assistive technology, and do not rely on color.",
        "Record details for developers, and keep sensitive details away from users.",
      ],
    },
  ],
  mistakes: [
    {
      id: "boundary-for-events",
      heading: "Expecting a boundary to catch event errors",
      problem: "An error thrown in a click handler does not reach an Error Boundary, because it does not happen during rendering. The screen stays as it was, the person sees nothing, and the error goes only to the console.",
      correction: "Use try/catch in the handler, and put a message into state.",
    },
    {
      id: "not-checking-ok",
      heading: "Assuming fetch rejects on server errors",
      problem: "A 500 response resolves normally, so try/catch alone never sees it. The code then tries to use an error page as data, and the failure shows up later as something confusing or as a parse error.",
      correction: "Check response.ok, and treat other statuses as failures.",
    },
    {
      id: "swallowing",
      heading: "Catching errors and doing nothing",
      problem: "An empty catch block makes a failure invisible. The person thinks their action succeeded, developers receive no report, and the real problem may surface much later, looking like something else entirely.",
      correction: "Show a message or report it, and rethrow what you cannot handle.",
    },
    {
      id: "single-boundary",
      heading: "Using only one top-level boundary",
      problem: "When a small widget fails, the entire page gets replaced by a fallback, including navigation. A contained problem then becomes a complete outage for that person, with no way to continue.",
      correction: "Add boundaries around independent sections.",
    },
    {
      id: "technical-messages",
      heading: "Showing technical messages to users",
      problem: "A raw message such as a failed JSON parse helps nobody, and a stack trace can expose internal details. The person learns neither what happened nor what they can do about it now.",
      correction: "Show plain language and a next step, and send details to your logs.",
    },
    {
      id: "reset-without-cause",
      heading: "Retrying with nothing changed",
      problem: "A retry that renders the same broken data simply throws again, which leaves the person in a loop. Boundaries around data need to refetch or change what caused the failure for a retry to help.",
      correction: "Reset the cause as well, using a key or by reloading the data.",
    },
  ],
  interview: [
    {
      id: "eh-boundaries",
      question: "What do Error Boundaries catch, and what don’t they?",
      answer: "They catch errors during rendering, in lifecycle methods, and in Effects of the tree below them. They do not catch errors in event handlers, in code such as setTimeout, during server rendering, or thrown in the boundary itself.",
    },
    {
      id: "eh-events",
      question: "How do you handle errors in event handlers?",
      answer: "With try/catch in the handler, usually storing a message in state so that the UI can show it. Async handlers need the await inside the try. If you want a boundary to handle it, an Action wrapped in a transition can throw into the nearest boundary.",
    },
    {
      id: "eh-fetch",
      question: "Does fetch throw on a 500 response?",
      answer: "No. fetch rejects only when the request cannot complete, such as a network failure. HTTP errors resolve as a normal Response, so you must check response.ok or status. Forgetting this is a common bug, because a try/catch alone misses those failures.",
    },
    {
      id: "eh-class",
      question: "Why are Error Boundaries class components?",
      answer: "They need getDerivedStateFromError or componentDidCatch, and React has no Hook equivalent for those at present. Most projects write one class and reuse it, or they use a library or a framework’s convention, such as an error file in the Next.js App Router.",
    },
    {
      id: "eh-placement",
      question: "Where should you place Error Boundaries?",
      answer: "Around parts that can fail independently, such as a page’s main content or a widget, with a top-level one as a last resort. The choice is about what stays usable. Wrapping every component adds noise, and leaves fallbacks that make no sense to a user.",
    },
    {
      id: "eh-report",
      question: "How do you report errors in production?",
      answer: "With componentDidCatch in a boundary, and the root options onCaughtError, onUncaughtError, and onRecoverableError, which send details to a monitoring service. Events and async code report from their own catch blocks. Users get a plain message, with details kept for developers.",
    },
  ],
  takeaways: [
    "Error Boundaries only catch rendering-phase errors.",
    "Handle event and async errors in your own code, and check response.ok.",
    "Place boundaries so that useful parts of the page keep working.",
    "Explain the problem, offer a next step, and report the details.",
  ],
  quickReview: {
    definition: "Error handling means separating rendering failures from event and async errors, then offering useful recovery for each.",
    keyPoints: [
      "Boundaries do not catch event handler errors.",
      "fetch does not reject on a 500 response.",
      "Boundaries are written as classes.",
      "Root options can report errors.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Checking a response",
      language: "typescript",
      code: `export async function loadNotes() {
  const response = await fetch("/api/notes");
  if (!response.ok) throw new Error("Request failed: " + response.status);
  return response.text();
}`,
      description: "Without the ok check, an error response would be treated as a success.",
    },
    commonMistakes: [
      "Expecting a boundary to catch click handler errors.",
      "Not checking response.ok.",
      "Leaving a catch block empty.",
    ],
    interviewTrap: "“Will an Error Boundary catch an error from my onClick?” No. Handlers run outside rendering, so use try/catch there.",
    takeaway: "Every failure needs a place to be caught, and a way forward for the person.",
  },
  sources: [
    { label: "Component reference: error boundaries", href: "https://react.dev/reference/react/Component" },
    { label: "createRoot reference", href: "https://react.dev/reference/react-dom/client/createRoot" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
    { label: "use reference", href: "https://react.dev/reference/react/use" },
    { label: "React 19 release post", href: "https://react.dev/blog/2024/12/05/react-19" },
    { label: "WCAG 2.2: Use of Color", href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
  ],
};
