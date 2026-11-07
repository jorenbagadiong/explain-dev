import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "containment",
      heading: "Containing failure",
      paragraphs: [
        "In a small app, a single error boundary at the root might be enough. In a larger one, that turns any failure in a side widget into a full-page error. The goal is containment: a failure should take away only what it has to, while leaving the rest usable.",
        "Each boundary is a decision about what can fail independently. A good boundary leaves enough context on screen that a person knows where they are and what to do next.",
      ],
      visual: {
        heading: "Layers of error boundaries",
        context: "Indentation shows boundaries nested inside each other. A failure goes to the nearest one above it.",
        root: {
          id: "root",
          title: "App boundary",
          description: "A last resort, offering to reload the page.",
          children: [
            {
              id: "route",
              title: "Route boundary",
              description: "Keeps the navigation, so people can go somewhere else.",
              children: [
                { id: "widget-chart", title: "Chart boundary", description: "One failed widget, with the rest of the page intact." },
                { id: "widget-feed", title: "Feed boundary", description: "Fails independently of the chart." },
              ],
            },
          ],
        },
        note: "This is one common arrangement, and the right layers depend on how your application’s parts relate to each other.",
      },
    },
    {
      id: "where-to-place",
      heading: "Choosing recovery boundaries",
      paragraphs: [
        "Too few boundaries, and small failures become big ones. Too many, and you hide important context, or show a page full of small error messages. Place them around things that can be useful on their own.",
      ],
      comparison: [
        {
          id: "good-spots",
          title: "Good places",
          items: ["Each route’s content, below the navigation.", "Independent widgets on a dashboard.", "Third-party or user-generated content."],
        },
        {
          id: "poor-spots",
          title: "Poor places",
          items: ["Each small component.", "Parts that are meaningless without their neighbors.", "A form’s fields, where one failure means the whole form cannot work."],
        },
      ],
    },
    {
      id: "recovery",
      heading: "Offering a way forward",
      paragraphs: [
        "A fallback should say what happened and offer something to do. A boundary stays in its error state until something resets it, so a Try again button needs to reset the boundary. Changing a key remounts the content from a clean state, which is a simple way to do this.",
        "Automatic reset on navigation is also useful, so that moving to another page clears the error rather than leaving it visible. Keying the boundary by the route gives you this.",
      ],
      examples: [
        {
          id: "retry-boundary",
          classification: "complete",
          title: "A boundary with a retry",
          language: "tsx",
          code: `import { Component, useState, type ReactNode } from "react";

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function RetryBoundary({ title, children }: { title: string; children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);

  return (
    <Boundary
      key={attempt}
      fallback={
        <div role="alert">
          <p>{title} could not be displayed.</p>
          <button type="button" onClick={() => setAttempt(previous => previous + 1)}>
            Try again
          </button>
        </div>
      }
    >
      {children}
    </Boundary>
  );
}`,
          description: "Each retry changes the key, which remounts the boundary and its children from scratch. The separate package react-error-boundary also offers reset helpers, if you would rather not write your own.",
        },
      ],
      closing: "A retry only helps with something temporary, such as a network problem. If the cause is a bug, it will fail again, so do not loop automatically, and always give people another way forward.",
    },
    {
      id: "reporting",
      heading: "Reporting what happened",
      paragraphs: [
        "A contained failure is easy to overlook, because the page still works. Report it. componentDidCatch receives the component stack, and createRoot and hydrateRoot accept onCaughtError, onUncaughtError, and onRecoverableError, so you can send everything to your reporting service in one place.",
        "In production, component names are minified, so decode stacks using source maps. A caught error should still reach your monitoring, since users are affected even when nothing crashes visibly.",
      ],
      examples: [
        {
          id: "root-reporting",
          classification: "client",
          title: "Reporting from the root",
          language: "tsx",
          code: `import { createRoot } from "react-dom/client";

function report(kind: string, error: unknown, stack?: string) {
  navigator.sendBeacon("/errors", JSON.stringify({ kind, message: String(error), stack }));
}

function App() {
  return <main>Application</main>;
}

const container = document.getElementById("root");

if (container) {
  createRoot(container, {
    onCaughtError: (error, info) => report("caught", error, info.componentStack),
    onUncaughtError: (error, info) => report("uncaught", error, info.componentStack),
    onRecoverableError: (error, info) => report("recoverable", error, info.componentStack),
  }).render(<App />);
}`,
          description: "This replaces React’s default console logging. Pass the options to createRoot, not to render.",
        },
      ],
    },
    {
      id: "what-is-not-covered",
      heading: "What boundaries will not catch",
      paragraphs: [
        "A larger application still has errors that never reach a boundary: event handlers, asynchronous callbacks, and server rendering. A boundary strategy has to be combined with ordinary error handling in those places, so that a failed save is reported as clearly as a failed render.",
      ],
    },
  ],
  mistakes: [
    {
      id: "root-only",
      heading: "Relying on one boundary at the root",
      problem: "One root boundary means a broken sidebar widget replaces the entire application with an error page. People lose their context and any unsaved work, for a failure that affected one small corner.",
      correction: "Add boundaries at route and feature levels, and keep the root one as a last resort.",
    },
    {
      id: "hiding-context",
      heading: "Placing a boundary where it hides needed context",
      problem: "A boundary around a whole form’s page can replace it with a generic message, including the navigation and any way to go back. People can see that something failed, but they have nowhere to go.",
      correction: "Keep the navigation outside the boundary, and offer a clear next step in the fallback.",
    },
    {
      id: "no-reset",
      heading: "Leaving a boundary stuck in its error state",
      problem: "A boundary stays in error until it is reset. Navigating to another route may keep showing the same error, if the boundary sits above the route and nothing changes, which looks as if the whole application is broken.",
      correction: "Key the boundary by route, or offer a reset that changes its key.",
    },
    {
      id: "silent-containment",
      heading: "Not reporting contained errors",
      problem: "A neatly contained failure may never be noticed, because there is no crash and no complaint. Meanwhile, a feature can be broken for many people, and the team has no idea at all.",
      correction: "Send caught errors to your monitoring, not only uncaught ones.",
    },
    {
      id: "retry-forever",
      heading: "Retrying automatically in a loop",
      problem: "Retrying as soon as something fails can repeat a request that will never succeed, adding load on an already struggling service, and the page can flicker between loading and error forever.",
      correction: "Let the person retry, or use a limited number of attempts with increasing delays.",
    },
  ],
  interview: [
    {
      id: "er-where",
      question: "How would you structure error boundaries in a large application?",
      answer: "In layers: one at the root as a last resort, one per route that preserves the navigation, and others around independent widgets or third-party content. Each should contain a failure while leaving enough context for people to carry on.",
    },
    {
      id: "er-too-many",
      question: "Can you have too many error boundaries?",
      answer: "Yes. Boundaries around tiny components can show fragments of a page with several small errors, which is confusing, or hide context that a fallback needs. I place them around units that are useful independently, and I let connected parts fail together.",
    },
    {
      id: "er-recover",
      question: "How do you let users recover from an error?",
      answer: "Provide a fallback that explains the problem and offers an action, such as Try again. Resetting requires clearing the boundary’s state, and changing its key is a simple way, since this remounts the content. Keying by route also clears errors on navigation.",
    },
    {
      id: "er-report",
      question: "How should errors be reported in production?",
      answer: "Through onCaughtError, onUncaughtError, and onRecoverableError on the root, or componentDidCatch, sent to a monitoring service along with the component stack. Use source maps for minified names. Contained errors should be reported too, because users are still affected.",
    },
    {
      id: "er-not-caught",
      question: "What does a boundary strategy not cover?",
      answer: "Event handlers, async callbacks, and server-side rendering. Those need try and catch, or state that carries the error into rendering. A complete strategy covers both, so that a failed save is communicated as clearly as a failed render.",
    },
    {
      id: "er-retry",
      question: "Is automatically retrying a failed render a good idea?",
      answer: "Only with limits. Failures caused by a bug will repeat, so an endless retry can flicker and add load. I prefer a user-initiated retry, or a limited number of attempts with backoff for transient network failures, plus another way forward.",
    },
  ],
  takeaways: [
    "Use layers of boundaries to contain failure.",
    "Keep enough context on screen for people to carry on.",
    "Offer a retry, and reset with a key.",
    "Report contained errors, because users are still affected.",
  ],
  quickReview: {
    definition: "Recovery boundaries contain failures to a useful unit of the page, and give people a way forward.",
    keyPoints: [
      "Root, route, and widget layers are a common shape.",
      "A boundary stays in error until reset.",
      "A changed key remounts and resets it.",
      "Report caught errors through root options.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Resetting on navigation",
      language: "tsx",
      code: `<ErrorBoundary key={pathname} fallback={<RouteError />}>
  <RouteContent />
</ErrorBoundary>`,
      typecheckContext: { before: `import type { ReactNode } from "react";\ndeclare const pathname: string;\ndeclare function ErrorBoundary(props: { fallback: ReactNode; children: ReactNode }): ReactNode;\ndeclare function RouteError(): ReactNode;\ndeclare function RouteContent(): ReactNode;\nexport const element = (`, after: ");" },
      description: "Moving to another route gives a new key, which clears the error state.",
    },
    commonMistakes: [
      "Having only one boundary at the root.",
      "Leaving a boundary stuck after navigation.",
      "Not reporting errors that were contained.",
    ],
    interviewTrap: "“If a boundary caught it, do you still need to report it?” Yes. People are still affected, and otherwise nobody knows.",
    takeaway: "Fail in the smallest useful unit, and always leave people a next step.",
  },
  sources: [
    { label: "Component reference: error boundaries", href: "https://react.dev/reference/react/Component" },
    { label: "createRoot reference", href: "https://react.dev/reference/react-dom/client/createRoot" },
  ],
};
