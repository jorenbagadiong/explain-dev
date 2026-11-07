import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-vitest-is",
      heading: "What Vitest is",
      paragraphs: [
        "Vitest is a testing framework powered by Vite. It reads your Vite configuration by default, so existing plugins and settings apply, and a dedicated vitest.config file can hold test-specific settings. This project uses it, so the examples in this lesson are compiled against the installed package.",
        "Test files need .test. or .spec. in their name. Running vitest starts watch mode, and vitest run executes the tests once, which is what you want in continuous integration.",
      ],
    },
    {
      id: "organizing",
      heading: "Organizing tests",
      paragraphs: [
        "describe groups related tests, and it or test defines one. expect makes assertions. A good test name states what should happen, so that a failure reads as a sentence about what went wrong.",
      ],
      examples: [
        {
          id: "basic-suite",
          classification: "complete",
          title: "A small test file",
          language: "typescript",
          code: `import { describe, expect, it } from "vitest";

function formatPrice(amount: number) {
  return "PHP " + amount.toFixed(2);
}

describe("formatPrice", () => {
  it("always shows two decimal places", () => {
    expect(formatPrice(5)).toBe("PHP 5.00");
  });

  it("rounds to two decimal places", () => {
    expect(formatPrice(1.005 + 1)).toMatch(/^PHP 2\\.0/);
  });
});`,
          description: "Tests read as a specification of formatPrice. The second one uses a pattern, since floating point values are not always exact.",
        },
      ],
    },
    {
      id: "assertions",
      heading: "Common assertions",
      paragraphs: [
        "Choosing the most specific assertion gives you clearer failure messages. A failed toEqual shows exactly what differs, whereas a failed toBe(true) only says that false is not true.",
      ],
      list: [
        "toBe: identical, using Object.is. Suits primitives.",
        "toEqual: deep equality of values. Suits objects and arrays.",
        "toContain: an item in an array, or a substring.",
        "toMatch: a string against a pattern.",
        "toThrow: a function throws.",
        "toHaveBeenCalledWith: a mock function received certain arguments.",
      ],
    },
    {
      id: "setup-and-isolation",
      heading: "Setup and isolation",
      paragraphs: [
        "beforeEach and afterEach run around each test, and they suit setup and cleanup. Each test should prepare what it needs and leave nothing behind, so it can run alone and in any order.",
        "Stubs persist across tests unless they are restored. Config options such as unstubGlobals handle this automatically, which is how this project is set up, and vi.unstubAllGlobals does it manually.",
      ],
      examples: [
        {
          id: "before-each",
          classification: "complete",
          title: "Fresh state for each test",
          language: "typescript",
          code: `import { beforeEach, describe, expect, it } from "vitest";

function createCart() {
  const items: string[] = [];

  return {
    add: (item: string) => items.push(item),
    count: () => items.length,
  };
}

describe("cart", () => {
  let cart: ReturnType<typeof createCart>;

  beforeEach(() => {
    cart = createCart();
  });

  it("starts empty", () => {
    expect(cart.count()).toBe(0);
  });

  it("counts added items", () => {
    cart.add("Tea");
    expect(cart.count()).toBe(1);
  });
});`,
          description: "Each test gets its own cart, so the order they run in cannot affect the result.",
        },
      ],
    },
    {
      id: "environments",
      heading: "Test environments",
      paragraphs: [
        "Vitest runs in the node environment by default, so tests have no browser APIs. For components that need a DOM, the jsdom environment emulates one, and happy-dom is a faster alternative that lacks some APIs. Each uses its own package of that name.",
        "You can set the environment for a whole project in the config, or per file with a comment at the top. This project’s tests run in node, and they render with renderToStaticMarkup.",
      ],
      examples: [
        {
          id: "config-example",
          classification: "complete",
          title: "A configuration file",
          language: "typescript",
          code: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    unstubGlobals: true,
  },
});`,
          description: "Vitest’s options go under test. restoreMocks and unstubGlobals keep stubs from leaking between tests. A file can override the environment with a comment such as // @vitest-environment jsdom.",
        },
      ],
    },
    {
      id: "fake-timers",
      heading: "Time and asynchronous code",
      paragraphs: [
        "Tests return or await a Promise for asynchronous work, and Vitest waits for it. Fake timers replace setTimeout and setInterval, so a two-hour delay can run instantly, and vi.advanceTimersByTime moves fake time forward by a given amount.",
      ],
      examples: [
        {
          id: "timers",
          classification: "complete",
          title: "Testing a delay without waiting",
          language: "typescript",
          code: `import { afterEach, beforeEach, expect, it, vi } from "vitest";

function remindLater(callback: () => void) {
  setTimeout(callback, 60_000);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("fires only after the delay", () => {
  const callback = vi.fn();
  remindLater(callback);

  vi.advanceTimersByTime(59_000);
  expect(callback).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1_000);
  expect(callback).toHaveBeenCalledTimes(1);
});`,
          description: "The test runs instantly, and it checks both sides of the boundary. Restoring real timers keeps this from affecting other tests.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "tobe-objects",
      heading: "Using toBe for objects",
      problem: "toBe compares identity, so two objects with the same contents fail. The failure can be puzzling, since the printed values look identical, and it sends people searching for a difference that is not there.",
      correction: "Use toEqual for objects and arrays.",
    },
    {
      id: "not-returning-promise",
      heading: "Not awaiting asynchronous work",
      problem: "A test that does not await a Promise finishes before its assertions run, so it passes whatever the code does. These tests give false confidence, and they can fail unpredictably in some later test.",
      correction: "Make the test async, and await the work, or use await expect(...).resolves.",
    },
    {
      id: "leaking-state",
      heading: "Leaking state between tests",
      problem: "A module-level variable, a stub, or fake timers left active can make the next test behave differently. The suite then passes or fails depending on order, which makes failures hard to reproduce.",
      correction: "Use beforeEach for fresh state, and restore stubs and timers afterward.",
    },
    {
      id: "over-mocking",
      heading: "Mocking everything in sight",
      problem: "A test that replaces all of a function’s collaborators mostly checks that the mocks were called. It can pass while the real parts do not work together, which leaves the important behavior unverified.",
      correction: "Mock at the boundaries, such as the network, and keep real logic in the test.",
    },
    {
      id: "wrong-environment",
      heading: "Running DOM code in the node environment",
      problem: "A test that touches document fails with a reference error in the default node environment. It looks like a code bug, when the test environment is what needs changing.",
      correction: "Set jsdom for that file with a comment, or in the config, or keep the test free of DOM.",
    },
  ],
  interview: [
    {
      id: "vf-what",
      question: "What is Vitest, and how does it relate to Vite?",
      answer: "A test framework powered by Vite. It reads your Vite config by default, so it shares plugins and transforms with your app. That avoids maintaining a separate transform setup, and its API will be familiar to anyone who has used Jest.",
    },
    {
      id: "vf-tobe",
      question: "What is the difference between toBe and toEqual?",
      answer: "toBe checks identity with Object.is, so it suits primitives or asserting the very same object. toEqual compares contents recursively, so it suits objects and arrays. Using toBe on two equal objects fails, even though they print the same.",
    },
    {
      id: "vf-isolation",
      question: "How do you keep tests independent?",
      answer: "Create fresh state in beforeEach or in the test itself, and clean up in afterEach. Restore mocks, stubs, and timers, which config options such as restoreMocks and unstubGlobals can automate. Then each test passes alone and in any order.",
    },
    {
      id: "vf-env",
      question: "What test environments does Vitest offer?",
      answer: "node by default, jsdom and happy-dom to emulate a browser, and edge-runtime for Vercel’s Edge Runtime. You can set one for the whole project or per file with a comment. happy-dom is faster than jsdom, but it lacks some APIs.",
    },
    {
      id: "vf-timers",
      question: "How do you test code that uses setTimeout?",
      answer: "With fake timers: vi.useFakeTimers, then vi.advanceTimersByTime or vi.runAllTimers. That runs instantly and it is deterministic, unlike a real wait. Restore with vi.useRealTimers afterward, so other tests are not affected.",
    },
    {
      id: "vf-run",
      question: "What is the difference between vitest and vitest run?",
      answer: "vitest starts watch mode, re-running affected tests as files change, which suits development. vitest run executes the tests once and exits, which suits continuous integration, where a process that keeps watching would never finish.",
    },
  ],
  takeaways: [
    "describe groups tests, it defines one, and expect asserts.",
    "Choose the most specific assertion for clearer failures.",
    "Keep tests independent, and restore what you stub.",
    "Choose an environment that matches what the test touches.",
  ],
  quickReview: {
    definition: "Vitest is a Vite-powered test framework for organizing tests, assertions, setup, and isolation.",
    keyPoints: [
      "File names need .test. or .spec.",
      "toBe is for identity, and toEqual is for contents.",
      "node is the default environment.",
      "Fake timers make delays instant.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "One test",
      language: "typescript",
      code: `import { expect, it } from "vitest";

it("adds numbers", () => {
  expect(1 + 2).toBe(3);
});`,
      description: "A name describing the behavior, and one clear assertion.",
    },
    commonMistakes: [
      "Using toBe to compare objects.",
      "Forgetting to await asynchronous work.",
      "Leaving stubs or fake timers active.",
    ],
    interviewTrap: "“Why did my test pass even though the code is broken?” Often because a Promise was not awaited, so the assertion never ran before the test ended.",
    takeaway: "Tests are small programs, so keep them simple, independent, and honest.",
  },
  sources: [
    { label: "Vitest guide", href: "https://vitest.dev/guide/" },
    { label: "Vitest: test environment", href: "https://vitest.dev/guide/environment" },
    { label: "Vitest: mocking", href: "https://vitest.dev/guide/mocking" },
    { label: "Vitest: mocking timers", href: "https://vitest.dev/guide/mocking/timers" },
  ],
};
