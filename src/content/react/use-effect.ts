import type { ArticleSection, ArticleSource, CodeExample, CommonMistake, InterviewQuestion } from "./article-types";

interface UseEffectArticle {
  heading: string;
  overview: ArticleSection & { syntax: CodeExample };
  usage: ArticleSection & { useCases: readonly string[]; alternatives: readonly string[] };
  dependencies: ArticleSection & { forms: readonly CodeExample[] };
  cleanup: ArticleSection;
  strictMode: ArticleSection;
  examples: ArticleSection & { items: readonly CodeExample[] };
  mistakes: ArticleSection & { items: readonly CommonMistake[] };
  interview: ArticleSection & { questions: readonly InterviewQuestion[] };
  takeaways: ArticleSection & { items: readonly string[] };
  sources: readonly ArticleSource[];
}

// Original educational content. Topic identity and availability stay in the registry.
// Browser APIs occur only inside displayed code strings, not in this module's execution.
export const useEffectArticle: UseEffectArticle = {
  heading: "Understanding React useEffect",
  overview: {
    id: "what-is-use-effect",
    heading: "What is useEffect?",
    paragraphs: [
      "useEffect is a React Hook for keeping a component synchronized with an external system: a browser event source, timer, network connection, or non-React widget. Rendering describes the UI; an Effect coordinates work outside that description after React commits an update.",
      "Effects run on the client, not during server rendering. After a commit, React decides whether a particular Effect needs to synchronize based on its dependencies. A component can render without that Effect running again. Call useEffect at the top level of a component or custom Hook, not in a condition or event handler.",
      "Commit timing is not a promise about browser paint. React generally lets non-interaction Effects run after paint, but an interaction can cause an Effect to run before paint. useLayoutEffect is a different tool for work that must block paint; useEffect is not a substitute for it.",
    ],
    syntax: {
      id: "effect-syntax",
      title: "Setup with a matching cleanup",
      language: "tsx",
      code: `useEffect(() => {
  // Synchronize with an external system.

  return () => {
    // Undo this setup's work.
  };
}, [dependency]);`,
      description: "The setup function starts synchronization. It may return a cleanup function that reverses that particular setup. The inline dependency array describes the reactive values used by the setup and cleanup; dependency here is a placeholder for such a value. useEffect itself returns no handle to a resource.",
    },
  },
  usage: {
    id: "when-to-use-effects",
    heading: "When should you use useEffect?",
    paragraphs: ["Ask what outside system needs to stay in step with the component. If you cannot identify one, an Effect may not be necessary. This is a useful design guideline, not a blanket ban on legitimate advanced synchronization or integration work."],
    useCases: [
      "Subscribe to browser events or synchronize with a browser API.",
      "Connect to an external service and disconnect when its inputs change.",
      "Start and stop a timer, or coordinate a non-React widget through its imperative API.",
    ],
    alternatives: [
      "Compute filtered lists, totals, or combined names from current props and state during rendering. An Effect that copies those results into more state adds another render and another value to keep consistent.",
      "Handle a particular user action in its event handler. For example, submitting an order belongs to the submit event, rather than an Effect that guesses what changed state means.",
      "Consider component structure or a meaningful key when resetting state for a new entity. Do not automatically add an Effect whenever one state value changes; first ask whether the next value can simply be derived.",
    ],
  },
  dependencies: {
    id: "dependency-arrays",
    heading: "Dependency arrays describe reactive inputs",
    paragraphs: [
      "The dependency list is a description of what the Effect reads, not a list of times you would prefer it to run. Include referenced reactive values such as props, state, and relevant variables or functions declared in the component. React compares each dependency with its previous value using Object.is.",
      "Keep the number of dependencies constant and write the list inline. Objects and functions created while rendering have new identities each time; using one as a dependency can restart synchronization even if its contents look unchanged. Often the better fix is to create an Effect-only helper or object inside setup, or move a genuinely constant value outside the component.",
    ],
    forms: [
      {
        id: "no-dependency-array",
        title: "No dependency array",
        language: "tsx",
        code: `useEffect(() => {
  // Synchronize after each commit of this component.
});`,
        description: "Without the second argument, setup runs after each committed render of the component. Any cleanup from the previous setup runs first. A discarded render attempt does not start an Effect.",
      },
      {
        id: "reactive-dependency-array",
        title: "An explicit dependency list",
        language: "tsx",
        code: `useEffect(() => {
  // Synchronize using dependency.
}, [dependency]);`,
        description: "Setup runs on mount and re-synchronizes after a commit when a listed value changes. Include all referenced reactive values, not only this illustrative dependency. Unchanged dependencies let React keep the existing synchronization.",
      },
      {
        id: "empty-dependency-array",
        title: "No reactive dependencies",
        language: "tsx",
        code: `useEffect(() => {
  // This setup reads no reactive values.
}, []);`,
        description: "An empty array says the Effect has no reactive inputs. It does not mean exactly once forever: remounts start new setups, and development checks can exercise additional setup/cleanup cycles. Do not omit dependencies merely to get this behavior.",
      },
    ],
  },
  cleanup: {
    id: "cleanup-and-lifecycle",
    heading: "Cleanup reverses a particular setup",
    paragraphs: [
      "Think in cycles: setup → cleanup → setup. On a normal dependency change, the component stays mounted: React calls the old cleanup, which closes over the old values, before starting the new setup with the new values. On unmount, React calls the latest cleanup without starting another setup.",
      "Remove the listener that setup registered, clear the interval it created, or disconnect the connection it opened. Keeping the resource handle inside that Effect gives cleanup the right resource to release. Cleanup should not perform unrelated work just because a render happened.",
      "Cleanup is more than class-style unmount logic. Without it, dependency changes can leave stale subscriptions or duplicate timers alive even while the component is still visible. When setup acquires a resource, give that setup a matching undo operation.",
    ],
  },
  strictMode: {
    id: "strict-mode",
    heading: "Strict Mode checks synchronization in development",
    paragraphs: [
      "In development, Strict Mode can stress-test an Effect with an extra setup-and-cleanup cycle before the continuing setup. This reveals listeners, connections, or timers that were not released correctly. These checks do not add the same extra cycle to production.",
      "The checks depend on the React development environment and where StrictMode is enabled. For example, a StrictMode boundary below a non-Strict root does not add the initial Effect replay described for a root boundary. Avoid promises that every Effect always runs exactly twice.",
      "Fix the missing cleanup rather than keeping a ref flag to prevent the next setup. Hiding the check does not release the first subscription, and it can break a genuine later mount. A correct setup → cleanup → setup sequence should leave one working synchronization, not two resources or none.",
    ],
  },
  examples: {
    id: "practical-examples",
    heading: "Practical TypeScript examples",
    paragraphs: ["These are complete TSX components to read and adapt, not live examples on this page. The client directive allows their interactive use in the Next.js App Router; it does not mean their render function can freely read window during server rendering. Browser reads below happen inside Effect setup."],
    items: [
      {
        id: "window-width-component",
        title: "1. Subscribe to window resize",
        language: "tsx",
        description: "The initial null produces the same checking message on the server and first client render. Setup reads the actual width, then subscribes. Cleanup removes the same updateWidth function from the same event source. No prop or state snapshot is read by setup, so the dependency list is empty; React's state setter has a stable identity.",
        code: `"use client";

import { useEffect, useState } from "react";

export function WindowWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    function updateWidth() {
      setWidth(window.innerWidth);
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <p>
      Window width: {width === null ? "Checking…" : width + "px"}
    </p>
  );
}`,
      },
      {
        id: "interval-component",
        title: "2. Start and stop an interval",
        language: "tsx",
        description: "Each setup owns one interval. Changing intervalMs cleans up the previous interval before starting a replacement; unmounting clears the last one. A functional updater avoids capturing an old ticks value and makes ticks unnecessary in the dependencies. Timer callbacks can be delayed, so this counts ticks rather than claiming to be an accurate clock.",
        code: `"use client";

import { useEffect, useState } from "react";

interface TickCounterProps {
  intervalMs?: number;
}

export function TickCounter({ intervalMs = 1000 }: TickCounterProps) {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTicks(previous => previous + 1);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs]);

  return <p>Ticks: {ticks}</p>;
}`,
      },
      {
        id: "online-status-component",
        title: "3. Synchronize with browser connectivity status",
        language: "tsx",
        description: "The browser is the external source of connectivity information; online is not derived from another React state variable. Setup reads navigator.onLine and listens to both connectivity events. Cleanup removes both listeners. The browser's online signal is only a hint and does not guarantee a particular service is reachable.",
        code: `"use client";

import { useEffect, useState } from "react";

export function OnlineStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    function updateStatus() {
      setOnline(navigator.onLine);
    }

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <p>
      Connection: {online === null ? "Checking…" : online ? "Online" : "Offline"}
    </p>
  );
}`,
      },
    ],
  },
  mistakes: {
    id: "common-mistakes",
    heading: "Common mistakes",
    paragraphs: [],
    items: [
      {
        id: "derived-state-effect",
        heading: "Using an Effect for a calculated value",
        problem: "Copying a combined name into state with an Effect first renders an old result, then schedules another render to catch up. There is no external system to synchronize.",
        correction: "Calculate the combined value while rendering instead of maintaining redundant state. These fragments assume firstName and lastName are current props or state values.",
        examples: [
          { id: "derived-state-incorrect", title: "Avoid: an extra state update for a derived value", language: "tsx", code: `useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);`, description: "This example assumes a redundant fullName state variable and setter." },
          { id: "derived-state-correction", title: "Instead: derive the value during rendering", language: "tsx", code: `const fullName = firstName + " " + lastName;`, description: "No Effect or second state variable is needed." },
        ],
      },
      {
        id: "missing-dependencies",
        heading: "Omitting reactive dependencies",
        problem: "A setup that reads a prop but declares an empty dependency array can keep using the value captured on its first run, leaving a subscription connected to an old input.",
        correction: "Include every referenced reactive value. If the list seems wrong, change how the setup is written and use the Hooks linter to verify it; do not try to control behavior by hiding an input.",
      },
      {
        id: "effect-loop",
        heading: "Creating a state update loop",
        problem: "An Effect that updates state can run repeatedly if that update makes one of its dependencies different again. A newly constructed object or function can participate in the cycle.",
        correction: "Check both links in the cycle: the state update and the changed dependency. Remove redundant derived state, or restructure the external synchronization so it updates state only when the external value actually changes. A state update inside an Effect is not automatically an infinite loop.",
      },
      {
        id: "missing-cleanup",
        heading: "Forgetting the matching cleanup",
        problem: "Adding a listener or interval without releasing it lets earlier setups keep reacting. New setups may then duplicate the same work.",
        correction: "Return cleanup that removes that exact listener or clears that setup's interval ID. Use the same event name, handler, and relevant listener options when removing a subscription.",
      },
      {
        id: "suppressing-dependency-lint",
        heading: "Silencing dependency warnings",
        problem: "Disabling exhaustive-deps can hide stale closures and make the code's actual inputs disagree with its declared synchronization conditions.",
        correction: "Treat a warning as evidence to inspect the code. Move Effect-only objects/functions into setup, move true constants out of the component, or use a functional state updater where appropriate. Do not make warning suppression the standard fix.",
      },
      {
        id: "event-specific-effects",
        heading: "Moving event-specific logic into an Effect",
        problem: "Watching a flag in an Effect to infer that a user submitted a form loses the direct connection to the event and can repeat work after later state changes or remounts.",
        correction: "Keep the work caused by that submit in the submit handler. Use an Effect for a synchronization that must remain correct whenever its inputs change, regardless of which interaction changed them.",
      },
      {
        id: "strict-mode-ref-guard",
        heading: "Suppressing the extra development cycle with a ref",
        problem: "A ranOnce flag can hide an unreleased resource or prevent a valid setup after cleanup. It treats a diagnostic check as the bug rather than revealing the incomplete resource lifecycle.",
        correction: "Make setup and cleanup symmetrical, then let React run the development check. Consider the actual StrictMode boundary and environment instead of assuming an exact global invocation count.",
      },
    ],
  },
  interview: {
    id: "interview-questions",
    heading: "Interview questions and answers",
    paragraphs: [],
    questions: [
      { id: "effect-purpose", question: "What is useEffect used for?", answer: "Synchronizing a component with something outside React's render calculation, such as browser events, timers, or a connection. It is not the default place for calculations or for work directly caused by a specific user action." },
      { id: "effect-timing", question: "When does an Effect run?", answer: "Its setup starts after a client commit on mount and later when its dependency conditions require it. Without an array it runs after each commit of that component. It does not run during SSR, and after commit should not be confused with always after browser paint." },
      { id: "dependency-purpose", question: "What is the purpose of the dependency array?", answer: "It declares the reactive inputs the Effect reads. React compares listed values with their previous values using Object.is to decide when to re-synchronize. Omitting a referenced reactive input can leave setup using an outdated value." },
      { id: "dependency-change", question: "What happens when a dependency changes?", answer: "After the changed value is committed, React runs the previous cleanup with the old captured values, then starts setup with the new values. This re-synchronization does not mean the component was unmounted." },
      { id: "cleanup-purpose", question: "Why is cleanup important?", answer: "It releases resources created by a particular setup so stale listeners, timers, or connections do not remain active. It runs on unmount and before the Effect re-synchronizes, so it must undo setup rather than assume every cleanup means permanent removal." },
      { id: "development-replay", question: "Why might an Effect run an extra time in development?", answer: "Strict Mode can add a setup/cleanup check to expose missing cleanup. The behavior is development-only and depends on its boundary and environment. Fix resource handling rather than adding a ref that blocks later setup." },
      { id: "loop-cause", question: "What causes an infinite Effect loop?", answer: "The Effect updates state, and the resulting render changes an Effect dependency, causing another setup and update. Investigate that feedback path; not every Effect that updates state loops. Derived calculations often need no Effect at all." },
      { id: "effect-alternatives", question: "When should you avoid useEffect?", answer: "When current props/state already determine the value for rendering, or when a specific event handler can perform the work directly. Component structure and keys can handle some resets. Look for the external system before introducing synchronization, while allowing for genuine advanced integration cases." },
    ],
  },
  takeaways: {
    id: "key-takeaways",
    heading: "Key takeaways",
    paragraphs: [],
    items: [
      "Effects synchronize with external systems after client commits; they do not run during SSR.",
      "Dependencies describe reactive inputs. Let the Hooks linter help keep them accurate.",
      "Cleanup reverses the work of its setup on re-synchronization or unmount.",
      "Strict Mode's development checks expose incomplete synchronization; do not hide them with ref flags.",
      "Remove unnecessary Effects in favor of derived calculations, event handlers, or better component structure.",
      "Keep browser reads out of server rendering, and do not confuse commit timing with paint timing.",
    ],
  },
  sources: [
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
    { label: "Synchronizing with Effects", href: "https://react.dev/learn/synchronizing-with-effects" },
    { label: "You might not need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "Removing Effect dependencies", href: "https://react.dev/learn/removing-effect-dependencies" },
    { label: "StrictMode reference", href: "https://react.dev/reference/react/StrictMode" },
  ],
};
