import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "test-behavior",
      heading: "Test what users can observe",
      paragraphs: [
        "A useful component test checks observable behavior: what appears on screen, and what happens when someone interacts with it. It should not care which Hook a component uses, or how many internal functions it has, because a refactor that keeps behavior the same should not break any tests.",
        "The more closely tests resemble how software is really used, the more confidence they give you. A test that reads private state can pass while the page is broken, and fail while the page is fine.",
      ],
      comparison: [
        {
          id: "behavior",
          title: "Observable behavior",
          items: ["The error message appears after an invalid submit.", "The button is disabled while saving.", "Clicking Add puts a new row in the list."],
        },
        {
          id: "implementation",
          title: "Implementation details",
          items: ["State holds a certain value.", "A particular Hook or child component was used.", "A private helper was called."],
        },
      ],
    },
    {
      id: "what-to-test-where",
      heading: "Choosing the right level",
      paragraphs: [
        "Not everything needs rendering. Logic in plain functions and reducers can be tested directly, which is fast and precise. Component tests then cover how the pieces work together, and a few end-to-end tests cover the most important flows in a real browser.",
      ],
      visual: {
        heading: "Where different tests fit",
        context: "Indentation shows increasing scope. Each kind answers a different question.",
        root: {
          id: "e2e",
          title: "End-to-end tests",
          description: "Does a critical flow work in a real browser? Slowest, and fewest in number.",
          children: [
            {
              id: "component-tests",
              title: "Component tests",
              description: "Does this feature behave properly for a user?",
              children: [{ id: "unit-tests", title: "Unit tests", description: "Is this rule correct? Fast, with many edge cases." }],
            },
          ],
        },
        note: "The right mix depends on the project. What matters is that each test can fail for a reason someone would care about.",
      },
    },
    {
      id: "pure-logic",
      heading: "Start with the logic",
      paragraphs: [
        "Rules extracted into plain functions need no renderer at all. These tests use Vitest, which this project already runs. Edge cases are cheapest to cover at this level.",
      ],
      examples: [
        {
          id: "pure-function-test",
          classification: "complete",
          title: "Testing a rule directly",
          language: "typescript",
          code: `import { describe, expect, it } from "vitest";

function canCheckOut(total: number, itemCount: number) {
  return itemCount > 0 && total >= 100;
}

describe("canCheckOut", () => {
  it("needs at least one item", () => {
    expect(canCheckOut(500, 0)).toBe(false);
  });

  it("needs the minimum total", () => {
    expect(canCheckOut(99, 2)).toBe(false);
    expect(canCheckOut(100, 2)).toBe(true);
  });
});`,
          description: "There is no setup, and the boundary value is explicit. Component tests can then cover that the button reflects this, without repeating each case.",
        },
      ],
    },
    {
      id: "rendering-a-component",
      heading: "Testing rendered output",
      paragraphs: [
        "For static output, React’s own renderToStaticMarkup is enough, and it needs no browser environment. It cannot test interactions, because no Effects or event handlers run. For those, you need a DOM environment, and usually a helper library.",
      ],
      examples: [
        {
          id: "static-markup-test",
          classification: "complete",
          title: "Checking output without a DOM",
          language: "tsx",
          code: `import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

function Status({ isOnline }: { isOnline: boolean }) {
  return <p role="status">{isOnline ? "Online" : "Offline"}</p>;
}

it("shows the offline message", () => {
  const html = renderToStaticMarkup(<Status isOnline={false} />);

  expect(html).toContain("Offline");
});`,
          description: "This suits simple output and server-rendered pages. It says nothing about what happens after hydration, or about clicking anything.",
        },
        {
          id: "rtl-test",
          classification: "external",
          title: "Testing an interaction with React Testing Library",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}

it("counts clicks", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole("button", { name: /clicked 0/i }));

  expect(screen.getByRole("button", { name: /clicked 1/i })).toBeTruthy();
});`,
          description: "This uses separate packages that are not installed in this project, along with a DOM environment such as jsdom. It reads like what a person does: find the button, click it, and see the result.",
        },
      ],
    },
    {
      id: "good-tests",
      heading: "What makes a test worth keeping",
      paragraphs: ["A few questions help with judging a test."],
      list: [
        "Would it fail if the feature broke?",
        "Would it keep passing through a refactor that preserves behavior?",
        "Does its name say what should happen, so that a failure explains itself?",
        "Can it run alone, in any order, without depending on another test?",
      ],
      closing: "A test that is never going to fail, or that fails on every change, costs time and gives little in return.",
    },
  ],
  mistakes: [
    {
      id: "testing-state",
      heading: "Asserting on internal state",
      problem: "Checking that state equals something ties a test to how a component is written. Moving state to a parent or switching to a reducer breaks the test, although nothing has changed for users.",
      correction: "Assert on what appears on screen after an interaction.",
    },
    {
      id: "snapshot-everything",
      heading: "Relying on large snapshots",
      problem: "A full-page snapshot fails on any markup change, so people learn to update it without reading it. It records what the output was, without saying what it should be, so it rarely catches a real bug.",
      correction: "Assert on the specific behavior that matters, and keep any snapshots small.",
    },
    {
      id: "testing-react",
      heading: "Testing that React itself works",
      problem: "A test that a useState value updates after its setter checks React rather than your code. It adds time to the suite, and it could only fail if React were broken.",
      correction: "Test your application’s rules and behavior.",
    },
    {
      id: "coverage-goal",
      heading: "Treating coverage as the goal",
      problem: "A high percentage only shows that lines ran. A test with no meaningful assertion can execute a whole component, so coverage goes up while nothing is verified at all.",
      correction: "Use coverage to find untested areas, and judge tests by what would make them fail.",
    },
    {
      id: "shared-state-tests",
      heading: "Letting tests depend on each other",
      problem: "State left behind by one test, such as module variables or storage, can make the next pass or fail depending on the order. Such tests become flaky, and the failures are hard to reproduce.",
      correction: "Set up what each test needs, and clean up after it.",
    },
  ],
  interview: [
    {
      id: "tc-what",
      question: "What should a React component test verify?",
      answer: "Observable behavior: what the user sees, and what happens when they interact. It should not depend on implementation details such as internal state or which Hooks are used, so that a refactor preserving behavior keeps the tests green.",
    },
    {
      id: "tc-implementation",
      question: "Why avoid testing implementation details?",
      answer: "Those tests break during harmless refactors, which trains people to distrust failures, and they can pass while the feature is actually broken. Tests that follow real usage give more confidence, and they make change safer rather than more costly.",
    },
    {
      id: "tc-levels",
      question: "How do you decide what kind of test to write?",
      answer: "Rules with many cases go in fast unit tests on plain functions or reducers. Features get component tests that exercise them as a user would. Critical flows such as sign-in get a few end-to-end tests in a real browser, since those are the slowest and most realistic.",
    },
    {
      id: "tc-coverage",
      question: "Is high test coverage a good target?",
      answer: "It is useful for spotting untested code, but it is a poor goal, because it only shows lines ran, not that anything was checked. I care more whether a test would fail if the feature broke, and whether important behavior is covered.",
    },
    {
      id: "tc-snapshot",
      question: "What are the problems with snapshot tests?",
      answer: "Large ones change with any markup change, so reviewers approve updates without reading them, and they do not express intent. Small, focused snapshots can be useful, for instance on a serialized value, but specific assertions usually communicate more.",
    },
    {
      id: "tc-server",
      question: "How would you test a Server Component?",
      answer: "Keep its logic in plain functions that are unit tested, and cover the rendered result with an end-to-end test, since tools for rendering async components are limited. Simple synchronous components can be rendered to markup directly.",
    },
  ],
  takeaways: [
    "Test observable behavior, not implementation details.",
    "Cover rules with fast unit tests, and features with component tests.",
    "A good test fails when the feature breaks, and survives a refactor.",
    "Coverage points to gaps, and it is not the goal.",
  ],
  quickReview: {
    definition: "Testing React components means verifying what users can observe, rather than how a component works internally.",
    keyPoints: [
      "Assert on output after interactions.",
      "Plain functions need no renderer.",
      "renderToStaticMarkup cannot test interactions.",
      "Each test should run alone, in any order.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A behavior-focused assertion",
      language: "tsx",
      code: `import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

function Empty() {
  return <p>No lessons yet.</p>;
}

it("explains the empty state", () => {
  expect(renderToStaticMarkup(<Empty />)).toContain("No lessons yet.");
});`,
      description: "This checks the text a person reads, rather than the structure around it.",
    },
    commonMistakes: [
      "Asserting on internal state.",
      "Updating large snapshots without reading them.",
      "Treating a coverage percentage as the goal.",
    ],
    interviewTrap: "“Is a test that checks state values a good test?” Usually not. It breaks on refactors, and it can pass while the screen is wrong.",
    takeaway: "Write tests that would only fail for a reason a user would care about.",
  },
  sources: [
    { label: "React Testing Library introduction", href: "https://testing-library.com/docs/react-testing-library/intro/" },
    { label: "Vitest guide", href: "https://vitest.dev/guide/" },
    { label: "act reference", href: "https://react.dev/reference/react/act" },
  ],
};
