import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "interactions-are-the-point",
      heading: "Test the flow a person follows",
      paragraphs: [
        "Most component bugs appear when something happens: a click, typing, a keyboard shortcut. A good interaction test follows the same steps as a person. It finds a control by what is visible or announced, uses it, and checks what changed.",
        "This pattern is often called arrange, act, assert: set up the component, do the interaction, then check the result. Keeping those three parts clear makes a test easy to read.",
      ],
    },
    {
      id: "testing-a-flow",
      heading: "A complete flow",
      paragraphs: [
        "Using React Testing Library and user-event, a test can read almost like instructions. Finding controls by role and label means that the test also fails if those accessible names go missing.",
      ],
      examples: [
        {
          id: "todo-flow",
          classification: "external",
          title: "Adding an item",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { TodoApp } from "./todo-app";

it("adds a task and clears the field", async () => {
  const user = userEvent.setup();
  render(<TodoApp />);

  await user.type(screen.getByLabelText("New task"), "Write tests");
  await user.click(screen.getByRole("button", { name: "Add" }));

  expect(screen.getByRole("listitem").textContent).toContain("Write tests");
  expect((screen.getByLabelText("New task") as HTMLInputElement).value).toBe("");
});`,
          description: "This depends on the separate packages @testing-library/react and @testing-library/user-event, which are not installed here. It also assumes a TodoApp in your own code.",
        },
      ],
    },
    {
      id: "keyboard",
      heading: "Testing keyboard use",
      paragraphs: [
        "Interaction tests can check keyboard behavior too, which is easy to forget. user.tab moves focus, user.keyboard presses keys, and you can assert on document.activeElement to confirm where focus went.",
      ],
      examples: [
        {
          id: "keyboard-flow",
          classification: "external",
          title: "Closing a dialog with Escape",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ConfirmPanel } from "./confirm-panel";

it("closes on Escape and returns focus to the trigger", async () => {
  const user = userEvent.setup();
  render(<ConfirmPanel />);

  const trigger = screen.getByRole("button", { name: "Delete" });
  await user.click(trigger);
  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});`,
          description: "This uses external packages that are not installed in this project. jsdom does not do layout, so visual focus and scrolling still need a real browser.",
        },
      ],
    },
    {
      id: "callbacks",
      heading: "Callbacks and boundaries",
      paragraphs: [
        "When a component’s job is to report something to its parent, a mock function is a good way to check it. vi.fn records calls, so you can verify that the right value came through. Focus on the arguments rather than the number of renders or internal steps.",
      ],
      examples: [
        {
          id: "plain-handler",
          classification: "complete",
          title: "Testing reporting logic without a DOM",
          language: "typescript",
          code: `import { expect, it, vi } from "vitest";

function createSubmitHandler(onSubmit: (email: string) => void) {
  return (email: string) => {
    const trimmed = email.trim();
    if (trimmed.includes("@")) onSubmit(trimmed);
  };
}

it("reports only valid, trimmed addresses", () => {
  const onSubmit = vi.fn();
  const handle = createSubmitHandler(onSubmit);

  handle("  not-an-address ");
  expect(onSubmit).not.toHaveBeenCalled();

  handle("  ana@example.com ");
  expect(onSubmit).toHaveBeenCalledWith("ana@example.com");
});`,
          description: "This one runs with what this project already has. Logic separated from markup can be tested with no rendering, and the interaction tests can then cover the wiring.",
        },
      ],
    },
    {
      id: "browser-tests",
      heading: "When to use a real browser",
      paragraphs: [
        "jsdom emulates a browser, but it has no layout, painting, or real focus visuals. Some things only a real browser can verify: whether a sticky header hides an element, whether a drag works, or whether something is truly visible.",
        "Keep a few end-to-end tests for the most important flows, such as signing up or checking out. They are slower and more prone to flakiness, so component tests should do most of the work.",
      ],
      comparison: [
        {
          id: "component-level",
          title: "Component tests",
          items: ["Fast, with many cases.", "Good for logic and wiring.", "No layout or real rendering."],
        },
        {
          id: "browser-level",
          title: "Real browser tests",
          items: ["Slower, with few cases.", "Good for critical flows.", "Verify layout, focus, and scrolling."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "calling-handlers-directly",
      heading: "Calling props directly instead of interacting",
      problem: "Pulling onClick from a rendered element and calling it skips everything a real click involves. The test would pass, even if the button is disabled or hidden, or has been covered by something else.",
      correction: "Use a real interaction, such as user.click, so that those conditions apply.",
    },
    {
      id: "selector-coupling",
      heading: "Finding controls by class or structure",
      problem: "Selecting by a class or a child position breaks whenever the markup or styling changes. The behavior is the same, but the test fails, so people lose trust in it.",
      correction: "Find controls by role, label, or visible text.",
    },
    {
      id: "too-many-steps",
      heading: "Testing a whole application in one test",
      problem: "A test covering ten flows in a row fails at the first problem, hiding the rest, and it is hard to tell what broke. It is also slow to run and awkward to maintain.",
      correction: "Keep each test focused on one behavior, and share setup through helpers.",
    },
    {
      id: "ignoring-keyboard",
      heading: "Testing only with clicks",
      problem: "A suite that only clicks can pass while a control cannot be reached with Tab or activated with a key. Keyboard users are then blocked, and nothing in the suite would ever catch it.",
      correction: "Add keyboard paths for important controls, and verify where focus ends up.",
    },
    {
      id: "jsdom-visibility",
      heading: "Trusting jsdom for visual behavior",
      problem: "Because jsdom has no layout, a test cannot tell if an element is covered, off-screen, or zero-sized. A test can pass for a button that no real user is able to see or reach.",
      correction: "Cover layout-dependent behavior with a real browser test.",
    },
  ],
  interview: [
    {
      id: "ti-how",
      question: "How do you test a user interaction?",
      answer: "Render the component, find controls as a person would, by role or label, perform the action with user-event, and assert on what changes on screen. That follows arrange, act, assert. It verifies the behavior rather than which internal functions ran.",
    },
    {
      id: "ti-keyboard-q",
      question: "How do you test keyboard accessibility in component tests?",
      answer: "With user-event’s tab and keyboard methods, asserting on document.activeElement, and on the result of key presses such as Escape. This catches a lot, but jsdom has no layout, so visible focus and scrolling still need a real browser.",
    },
    {
      id: "ti-mock-fn",
      question: "When should you use a mock function in an interaction test?",
      answer: "When the component’s job is to report something to its parent, such as onSubmit. A mock records the call, so you can verify the arguments. For behavior visible on screen, I assert on the screen instead, because that is what users experience.",
    },
    {
      id: "ti-e2e",
      question: "When would you write an end-to-end test instead?",
      answer: "For critical flows spanning several pages or depending on real layout, such as checkout. They give the most confidence, but they are slow and can be flaky, so I keep them few. Component tests handle variations and edge cases more cheaply.",
    },
    {
      id: "ti-pass-broken",
      question: "How could an interaction test pass when the feature is broken?",
      answer: "By calling a handler directly rather than interacting, by not awaiting async work, by mocking the broken part, or by using jsdom for something that needs layout. Good tests use realistic interactions, and they would actually fail if the behavior stopped working.",
    },
  ],
  takeaways: [
    "Follow the steps a person would, and assert on what they would see.",
    "Find controls by role and label.",
    "Include keyboard paths for important controls.",
    "Use real browsers for layout, and for a few critical flows.",
  ],
  quickReview: {
    definition: "Testing interactions means exercising a component through realistic input and accessible controls, then asserting on the result.",
    keyPoints: [
      "Arrange, act, assert.",
      "Use user-event rather than calling handlers directly.",
      "Assert focus with document.activeElement.",
      "jsdom has no layout.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "external",
      title: "One interaction",
      language: "tsx",
      code: `await user.click(screen.getByRole("button", { name: "Save" }));`,
      description: "user and screen come from a separate package, not installed here. This finds the button as a user would, then clicks it.",
    },
    commonMistakes: [
      "Calling onClick directly.",
      "Finding controls by class name.",
      "Testing only with mouse clicks.",
    ],
    interviewTrap: "“Does a passing jsdom test prove the button is usable?” No. jsdom has no layout, so the button could be covered or off-screen.",
    takeaway: "If a person could not do what your test does, the test is not telling you much.",
  },
  sources: [
    { label: "Testing Library: user-event", href: "https://testing-library.com/docs/user-event/intro/" },
    { label: "Testing Library: queries", href: "https://testing-library.com/docs/queries/about/" },
    { label: "Vitest: mocking", href: "https://vitest.dev/guide/mocking" },
    { label: "Vitest: test environment", href: "https://vitest.dev/guide/environment" },
  ],
};
