import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-they-do",
      heading: "What an error boundary does",
      paragraphs: [
        "By default, an error thrown while rendering removes the whole React tree from the screen. An error boundary is a component that catches errors from rendering its descendants and shows a fallback instead, so one broken widget does not take down the page.",
        "There is no Hook or function component equivalent yet. A boundary is a class component that defines getDerivedStateFromError or componentDidCatch. You can write one once and reuse it, or use the react-error-boundary package, which is a separate install and not part of React.",
      ],
      examples: [
        {
          id: "boundary-class",
          classification: "complete",
          title: "A reusable error boundary",
          language: "tsx",
          code: `import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}`,
          description: "getDerivedStateFromError switches to the fallback, and it must be pure. componentDidCatch is for side effects such as reporting. Use both together.",
        },
      ],
    },
    {
      id: "what-they-catch",
      heading: "What boundaries catch, and what they do not",
      paragraphs: [
        "This is the most important thing to understand, because many errors in real applications are not rendering errors.",
      ],
      comparison: [
        {
          id: "caught",
          title: "Caught",
          items: ["Errors thrown while rendering children, including distant descendants.", "Errors thrown in descendants’ lifecycle methods or synchronous Effect setup and cleanup.", "Errors thrown or rejected by an Action passed to the startTransition returned by useTransition."],
        },
        {
          id: "not-caught",
          title: "Not caught",
          items: ["Ordinary event handlers.", "Detached asynchronous callbacks such as setTimeout.", "Server-side rendering.", "Errors in the boundary itself."],
        },
      ],
      examples: [
        {
          id: "event-handler-errors",
          classification: "complete",
          title: "Handling an event handler’s error",
          language: "tsx",
          code: `import { useState } from "react";

async function deleteFile(id: string) {
  const response = await fetch("/api/files/" + id, { method: "DELETE" });
  if (!response.ok) throw new Error("The file could not be deleted.");
}

export default function DeleteButton({ fileId }: { fileId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    try {
      await deleteFile(fileId);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong.");
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick}>
        Delete
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}`,
          description: "A boundary would not see this failure, so it is caught and stored in state. The page stays intact, and the user sees a useful message.",
        },
      ],
    },
    {
      id: "placement",
      heading: "Where to place boundaries",
      paragraphs: [
        "You do not need one around every component. Put them where a failure can sensibly be contained, and where the fallback helps the user. A boundary around each major section keeps the rest of the page working when one part fails.",
        "A failure is contained to the nearest boundary above it, so boundaries can nest, with a top-level one acting as a last resort.",
      ],
      examples: [
        {
          id: "boundary-usage",
          classification: "complete",
          title: "Containing a failure to one section",
          language: "tsx",
          code: `import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function RevenueChart(): ReactNode {
  throw new Error("Chart data was malformed.");
}

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <ErrorBoundary fallback={<p role="alert">The chart could not be displayed.</p>}>
        <RevenueChart />
      </ErrorBoundary>
    </main>
  );
}`,
          description: "The heading and the rest of the page stay on screen. Only the chart’s area shows the fallback.",
        },
      ],
    },
    {
      id: "recovery",
      heading: "Recovering",
      paragraphs: [
        "A boundary stays in its error state until something resets it. A simple approach is to give the boundary a key that changes, such as the current route or a retry count. A new key remounts it and the content inside, which tries again from a clean state.",
        "In production, component names are minified, so decode the stack from componentDidCatch with source maps. React.captureOwnerStack is available for extra detail in development.",
      ],
    },
  ],
  mistakes: [
    {
      id: "expects-event-catch",
      heading: "Expecting a boundary to catch event handler errors",
      problem: "Wrapping a button in a boundary does not catch an error thrown directly by an ordinary click handler. A boundary’s coverage of descendant rendering, lifecycle methods, and synchronous Effects does not extend to that handler.",
      correction: "Use try and catch in the handler, and store the error in state to display it.",
    },
    {
      id: "async-errors",
      heading: "Expecting a boundary to catch detached async errors",
      problem: "A rejection in detached async work, such as an unhandled request started by an ordinary event handler, or an error in a detached setTimeout callback, does not reach a boundary automatically. This differs from an Action passed to the startTransition returned by useTransition, whose thrown errors and rejections can reach the boundary.",
      correction: "Handle detached failures where they happen. To surface one through a boundary, store the error and throw it during rendering; useTransition Actions already provide tracked error handling.",
    },
    {
      id: "one-global-boundary",
      heading: "Using only one boundary at the root",
      problem: "A single top-level boundary turns any small failure into a full-page error. It is better than a blank screen, but a broken sidebar widget should not remove the main content.",
      correction: "Add boundaries around independent sections, and keep the root one as a last resort.",
    },
    {
      id: "side-effects-in-derive",
      heading: "Logging from getDerivedStateFromError",
      problem: "It runs during rendering, so it must be pure. Reporting from there can fire more than once, or at the wrong time, and it also breaks the expectations React has of that method.",
      correction: "Report from componentDidCatch, and only return state from getDerivedStateFromError.",
    },
    {
      id: "fallback-throws",
      heading: "Assuming a boundary catches its own errors",
      problem: "A fallback that itself throws, or a boundary with a bug in its own render, is not caught by that boundary. The error moves to the next boundary up, or removes the tree.",
      correction: "Keep fallbacks simple, and keep a boundary above them.",
    },
  ],
  interview: [
    {
      id: "eb-what",
      question: "What is an error boundary?",
      answer: "A component that catches errors from rendering its descendants and shows a fallback instead of letting the whole tree be removed. It defines getDerivedStateFromError or componentDidCatch, and it must currently be a class, since no Hook equivalent exists.",
    },
    {
      id: "eb-not-catch",
      question: "What don’t error boundaries catch?",
      answer: "Errors thrown directly in ordinary event handlers, detached async callbacks such as setTimeout, server-side rendering, and errors in the boundary itself. Handle detached failures yourself; Actions passed to useTransition’s startTransition are a separate, tracked case.",
    },
    {
      id: "eb-methods",
      question: "What is the difference between getDerivedStateFromError and componentDidCatch?",
      answer: "getDerivedStateFromError runs during rendering, returns state for the fallback, and must be pure. componentDidCatch runs in the commit phase and is meant for side effects such as reporting, and it receives the component stack.",
    },
    {
      id: "eb-function",
      question: "Can you write an error boundary as a function component?",
      answer: "Not currently. There is no function equivalent of those lifecycle methods. You can write a small class once and reuse it, or use the react-error-boundary package, which provides a ready-made one. It is a separate install rather than part of React.",
    },
    {
      id: "eb-placement-q",
      question: "How do you decide where to place error boundaries?",
      answer: "Around parts that can fail independently, where a fallback still leaves the page useful, such as a widget, a route, or a list section. I keep one near the root as a last resort. A boundary around every small component adds noise.",
    },
    {
      id: "eb-reset",
      question: "How do you recover after an error boundary has caught something?",
      answer: "It stays in its error state until reset. Changing its key is a simple way: a new key remounts it with clean state, such as on navigation or after a Try again button. react-error-boundary also offers reset helpers.",
    },
    {
      id: "eb-transition",
      question: "Do error boundaries catch errors thrown inside startTransition?",
      answer: "Yes, for useTransition’s startTransition. If its function throws or returns a rejected promise, the nearest boundary around the calling component shows its fallback. That is a useful exception, because ordinary async code would not reach a boundary.",
    },
  ],
  takeaways: [
    "Boundaries cover descendant rendering, lifecycle methods, synchronous Effect setup/cleanup, and useTransition Actions.",
    "They do not catch ordinary event-handler or async-callback errors, or server rendering errors.",
    "A boundary is a class today, or comes from a separate package.",
    "Place them where a failure can be contained usefully.",
  ],
  quickReview: {
    definition: "An error boundary catches errors from rendering its descendants and shows fallback UI in place of the failed part.",
    keyPoints: [
      "It needs a class with getDerivedStateFromError or componentDidCatch.",
      "Fallbacks should be set in the first, and reporting done in the second.",
      "Ordinary event handlers and detached async callbacks need their own handling.",
      "A changed key resets it.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Using a boundary",
      language: "tsx",
      code: `<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <Profile />
</ErrorBoundary>`,
      typecheckContext: { before: `import type { ReactNode } from "react";\ndeclare function ErrorBoundary(props: { fallback: ReactNode; children: ReactNode }): ReactNode;\ndeclare function Profile(): ReactNode;\nexport const element = (`, after: ");" },
      description: "If Profile throws while rendering, the paragraph appears in its place.",
    },
    commonMistakes: [
      "Expecting a boundary to catch click handler errors.",
      "Having only one boundary at the root.",
      "Reporting from getDerivedStateFromError.",
    ],
    interviewTrap: "“Do error boundaries catch all errors?” No. They cover descendant rendering, lifecycle methods, synchronous Effect setup/cleanup, and Actions passed to useTransition’s startTransition. Ordinary event handlers and detached async callbacks need their own handling.",
    takeaway: "Use boundaries for descendant rendering, lifecycle, synchronous Effect, and useTransition Action failures; handle ordinary event and detached async failures where they happen.",
  },
  sources: [
    { label: "Component reference: error boundaries", href: "https://react.dev/reference/react/Component" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
