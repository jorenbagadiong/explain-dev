import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "hooks-need-a-component",
      heading: "Hooks need a component to run in",
      paragraphs: [
        "A Hook can only be called while React renders a component, so you cannot simply call one in a test. Something has to render it. That leaves two main options: test it through a real component that uses it, or use a helper that renders a small test component for you.",
        "Often the best test of a Hook is the first option, because it verifies what users ultimately experience. A separate Hook test is most useful for reusable Hooks with several behaviors of their own.",
      ],
      comparison: [
        {
          id: "through-component",
          title: "Through a component",
          items: ["Tests real usage.", "Survives changes to the Hook’s internals.", "Best when one component uses the Hook."],
        },
        {
          id: "render-hook",
          title: "With renderHook",
          items: ["Tests the Hook’s own interface.", "Good for shared library Hooks.", "Easy to become detached from real use."],
        },
      ],
    },
    {
      id: "extract-logic",
      heading: "First, move logic out of the Hook",
      paragraphs: [
        "Much of what a custom Hook does can live in plain functions or a reducer, leaving the Hook as a thin wrapper. Those run with no React at all, so their edge cases are simple to test. A reducer’s transitions are a good example.",
      ],
      examples: [
        {
          id: "reducer-test",
          classification: "complete",
          title: "Testing a Hook’s reducer directly",
          language: "typescript",
          code: `import { describe, expect, it } from "vitest";

type CounterAction = { type: "incremented" } | { type: "reset"; to: number };

function counterReducer(count: number, action: CounterAction): number {
  switch (action.type) {
    case "incremented":
      return count + 1;
    case "reset":
      return action.to;
  }
}

describe("counterReducer", () => {
  it("increments", () => {
    expect(counterReducer(1, { type: "incremented" })).toBe(2);
  });

  it("resets to a given value", () => {
    expect(counterReducer(9, { type: "reset", to: 0 })).toBe(0);
  });
});`,
          description: "useCounter could simply call useReducer(counterReducer, 0). Every rule is tested here, with no rendering.",
        },
      ],
    },
    {
      id: "through-a-component",
      heading: "Testing through a small component",
      paragraphs: [
        "A small test component uses the Hook as a real caller would, and shows the result in the DOM. This works with the same queries as any component test. If you need a DOM without a library, React’s act lets you render with createRoot directly.",
      ],
      examples: [
        {
          id: "hook-test-component",
          classification: "external",
          title: "A Hook behind a test component",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { useToggle } from "./use-toggle";

function TestToggle() {
  const [isOn, toggle] = useToggle(false);

  return <button onClick={toggle}>{isOn ? "On" : "Off"}</button>;
}

it("toggles", async () => {
  const user = userEvent.setup();
  render(<TestToggle />);

  await user.click(screen.getByRole("button", { name: "Off" }));

  expect(screen.getByRole("button", { name: "On" })).toBeTruthy();
});`,
          description: "This uses external packages that are not installed in this project, and it assumes a useToggle in your own code. The test does not depend on how useToggle stores its value.",
        },
      ],
    },
    {
      id: "render-hook",
      heading: "Using renderHook",
      paragraphs: [
        "renderHook from React Testing Library wraps the call in a small test component. result.current holds the most recently committed return value. Reading it later gets the new value, so do not destructure it early. rerender re-runs the Hook with new props, and act wraps updates you trigger directly.",
      ],
      examples: [
        {
          id: "render-hook-example",
          classification: "external",
          title: "Testing a Hook’s interface",
          language: "tsx",
          code: `import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useCounter } from "./use-counter";

it("increments from an initial value", () => {
  const { result } = renderHook(() => useCounter(5));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(6);
});

it("responds to changed props", () => {
  const { result, rerender } = renderHook(({ step }) => useCounter(0, step), {
    initialProps: { step: 1 },
  });

  rerender({ step: 2 });
  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(2);
});`,
          description: "This depends on the separate package @testing-library/react, which is not installed here, and it assumes a useCounter in your code. initialProps only applies to the first render, and act is needed since nothing else wraps this update.",
        },
      ],
    },
    {
      id: "effects-and-context",
      heading: "Hooks with Effects and context",
      paragraphs: [
        "Test that cleanup works, not only setup, because leaks are a frequent bug in custom Hooks. Unmount and check that listeners were removed, and that nothing fires afterward. A Hook reading context needs a provider, which renderHook accepts through its wrapper option.",
      ],
      examples: [
        {
          id: "subscribe-cleanup",
          classification: "complete",
          title: "Testing a subscription’s cleanup directly",
          language: "typescript",
          code: `import { expect, it, vi } from "vitest";

function subscribeToResize(target: EventTarget, callback: () => void) {
  target.addEventListener("resize", callback);

  return () => target.removeEventListener("resize", callback);
}

it("stops listening after cleanup", () => {
  const target = new EventTarget();
  const callback = vi.fn();
  const unsubscribe = subscribeToResize(target, callback);

  target.dispatchEvent(new Event("resize"));
  unsubscribe();
  target.dispatchEvent(new Event("resize"));

  expect(callback).toHaveBeenCalledTimes(1);
});`,
          description: "Extracting the subscription lets you test setup and cleanup with no React, and the Hook only has to call it from an Effect.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "calling-hook-directly",
      heading: "Calling a Hook directly in a test",
      problem: "useCounter() outside of a render fails, with React reporting an invalid Hook call, because there is no component to attach it to. It looks like a broken Hook, when the problem is how the test calls it.",
      correction: "Render it through a component or renderHook.",
    },
    {
      id: "destructure-result",
      heading: "Destructuring result.current too early",
      problem: "const { count } = result.current captures the value at that moment. After an update, count is still old, so the assertion fails even though the Hook worked correctly.",
      correction: "Read result.current again after each update.",
    },
    {
      id: "missing-act",
      heading: "Forgetting act around direct updates",
      problem: "Calling a Hook’s function through renderHook, with no interaction helper wrapping it, means the update may not have been applied when you assert. React also warns that the update was not wrapped in act.",
      correction: "Wrap the call in act, and use its async form for asynchronous work.",
    },
    {
      id: "testing-internals",
      heading: "Asserting on how a Hook works internally",
      problem: "Mocking useState to check that it was called ties the test to one implementation. Switching to useReducer breaks the test, even though the Hook’s behavior for callers has not changed at all.",
      correction: "Test what the Hook returns and does.",
    },
    {
      id: "skip-cleanup-test",
      heading: "Not testing cleanup",
      problem: "A Hook that adds a listener can look perfect in tests that never unmount it. Without a cleanup test, a leak or a late callback goes unnoticed until it appears as a subtle production bug.",
      correction: "Unmount in a test, and verify that the subscription is gone.",
    },
  ],
  interview: [
    {
      id: "th-how",
      question: "How do you test a custom Hook?",
      answer: "Often through a component that uses it, which verifies real behavior. For reusable Hooks with several behaviors, renderHook from React Testing Library works too. Logic extracted into plain functions or reducers can be tested directly, with no React.",
    },
    {
      id: "th-why-not-direct",
      question: "Why can’t you just call a Hook in a test?",
      answer: "Hooks must be called while React is rendering a function component, so calling one elsewhere fails with an invalid Hook call message. Something has to render it, which is what renderHook does by placing the call in a small test component.",
    },
    {
      id: "th-result-current",
      question: "Why do you read result.current after each update?",
      answer: "It holds the most recently committed value, and it is replaced as the Hook re-renders. Destructuring early captures a stale snapshot. This follows from each render having its own values, so reading the property again gets the latest one.",
    },
    {
      id: "th-act",
      question: "When do you need act when testing Hooks?",
      answer: "When triggering updates directly rather than through a library interaction, such as calling a function from result.current. act applies pending updates before assertions. The docs recommend its async form, and they say the sync form will be removed.",
    },
    {
      id: "th-context",
      question: "How do you test a Hook that uses context?",
      answer: "Provide the context, using the wrapper option on renderHook or by rendering the test component inside a provider. A checked Hook that throws without a provider can be tested too, including that it throws a clear message.",
    },
    {
      id: "th-extract",
      question: "How can you make Hooks easier to test?",
      answer: "Keep them thin. Put rules in plain functions or a reducer, and put subscriptions in functions returning a cleanup. Those can be tested with no rendering, and then a small number of tests can confirm that the Hook wires them together properly.",
    },
  ],
  takeaways: [
    "A Hook needs a component to run in.",
    "Testing through a real component is often enough.",
    "Move logic into plain functions and reducers.",
    "Test cleanup as well as setup.",
  ],
  quickReview: {
    definition: "Testing a custom Hook means running it inside a component, or testing the logic it delegates to, and asserting on behavior.",
    keyPoints: [
      "renderHook provides a test component.",
      "Read result.current after each update.",
      "Use act for direct updates.",
      "A wrapper option provides context.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "external",
      title: "Rendering a Hook",
      language: "tsx",
      code: `const { result } = renderHook(() => useCounter(0));`,
      description: "renderHook comes from a separate package, not installed here. result.current then holds the Hook’s latest return value.",
    },
    commonMistakes: [
      "Calling a Hook outside of rendering.",
      "Destructuring result.current too early.",
      "Never testing cleanup.",
    ],
    interviewTrap: "“Do reusable Hooks always need renderHook tests?” No. Testing through a component, or testing extracted logic directly, is often better.",
    takeaway: "Keep Hooks thin, and most of the testing becomes ordinary function testing.",
  },
  sources: [
    { label: "React Testing Library API", href: "https://testing-library.com/docs/react-testing-library/api/" },
    { label: "act reference", href: "https://react.dev/reference/react/act" },
    { label: "Rules of Hooks", href: "https://react.dev/reference/rules/rules-of-hooks" },
    { label: "Reusing Logic with Custom Hooks", href: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
  ],
};
