import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "the-problem",
      heading: "Waiting without guessing",
      paragraphs: [
        "A lot of UI changes after a delay: data loads, a save finishes, a message fades. A test must wait for these, and the tempting way is a fixed delay, such as waiting 500 ms. That makes tests slow when the wait is too long, and flaky when it is too short, because timing varies between machines.",
        "The better approach is to wait for the outcome itself. The test asks for what the user would see, and it retries until that appears or a timeout passes.",
      ],
      comparison: [
        {
          id: "fixed-delays",
          title: "Fixed delays",
          items: ["Always wait the full time.", "Fail when the machine is slower than expected.", "Do not say what the test is waiting for."],
        },
        {
          id: "wait-outcome",
          title: "Waiting for an outcome",
          items: ["Finish as soon as it is ready.", "Tolerate variation up to a timeout.", "State what is expected."],
        },
      ],
    },
    {
      id: "find-by",
      heading: "findBy queries",
      paragraphs: [
        "findBy combines a getBy query with waitFor. It retries until an element appears, for 1000 ms by default, and this is usually all you need for something that shows up later.",
      ],
      examples: [
        {
          id: "find-by-example",
          classification: "external",
          title: "Waiting for loaded data",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { UserName } from "./user-name";

it("shows the name after loading", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ name: "Ana" }))));

  render(<UserName id="1" />);

  expect(screen.getByText("Loading…")).toBeTruthy();
  expect(await screen.findByText("Ana")).toBeTruthy();
  expect(screen.queryByText("Loading…")).toBeNull();
});`,
          description: "This depends on the separate package @testing-library/react, which is not installed here, and on a UserName in your own code. It checks the loading state, the result, and that loading has gone.",
        },
      ],
    },
    {
      id: "wait-for",
      heading: "waitFor and waitForElementToBeRemoved",
      paragraphs: [
        "waitFor runs a callback repeatedly until it stops throwing or the timeout passes. The default timeout is 1000 ms and the interval is 50 ms, and it also re-runs on DOM changes. The callback must throw to trigger a retry, and a falsy return value does not count. So put an assertion inside it.",
        "waitForElementToBeRemoved resolves once an element leaves the DOM. The element has to exist when you start waiting, or it rejects.",
      ],
      examples: [
        {
          id: "wait-for-example",
          classification: "external",
          title: "Waiting for a non-DOM outcome",
          language: "tsx",
          code: `import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { SaveForm } from "./save-form";

it("calls onSaved after the request finishes", async () => {
  const user = userEvent.setup();
  const onSaved = vi.fn();
  render(<SaveForm onSaved={onSaved} />);

  await user.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
});`,
          description: "This uses external packages that are not installed in this project. Since a mock being called does not change the DOM, findBy would not work here, so waitFor is the right tool.",
        },
      ],
    },
    {
      id: "time-and-network",
      heading: "Controlling time and the network",
      paragraphs: [
        "A test should not depend on a real server, so replace the boundary with something predictable. Fake timers make time-based behavior instant and exact. Combined, these make a failure scenario as easy to test as a success.",
      ],
      examples: [
        {
          id: "fake-timer-debounce",
          classification: "complete",
          title: "Testing a debounce with fake timers",
          language: "typescript",
          code: `import { afterEach, beforeEach, expect, it, vi } from "vitest";

function debounce(callback: (value: string) => void, delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (value: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(value), delayMs);
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("only reports the last value", () => {
  const callback = vi.fn();
  const search = debounce(callback, 300);

  search("re");
  search("rea");
  vi.advanceTimersByTime(300);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith("rea");
});`,
          description: "This runs instantly and gives the same result every time, which a real 300 ms wait could not promise.",
        },
        {
          id: "failure-state",
          classification: "complete",
          title: "Testing a failure path",
          language: "typescript",
          code: `import { expect, it, vi } from "vitest";

async function loadName(id: string) {
  const response = await fetch("/api/users/" + id);
  if (!response.ok) throw new Error("The user could not be loaded.");
  const user: { name: string } = await response.json();
  return user.name;
}

it("reports a failed request", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));

  await expect(loadName("1")).rejects.toThrow("could not be loaded");
});`,
          description: "The error path gets tested as easily as the success path, with no server. await on rejects matters, because without it, the test would end early and pass.",
        },
      ],
    },
    {
      id: "what-to-cover",
      heading: "States worth covering",
      paragraphs: ["An asynchronous feature has several states, and each one can break separately."],
      list: [
        "Loading: is a pending state visible?",
        "Success: does the result appear, and does the pending state go away?",
        "Failure: is the error explained, and can the person retry?",
        "Empty: does an empty result have a helpful message?",
        "Order: does a stale response get ignored when a newer one has been requested?",
      ],
    },
  ],
  mistakes: [
    {
      id: "sleep",
      heading: "Using fixed delays",
      problem: "await sleep(500) passes on your machine, then fails on a slower continuous integration runner. Increasing it to be safe slows every run of the suite, and it still offers no guarantee.",
      correction: "Wait for the outcome with findBy or waitFor, or use fake timers.",
    },
    {
      id: "falsy-wait",
      heading: "Returning a boolean from waitFor",
      problem: "waitFor(() => isDone) looks like a condition, but it only retries when the callback throws. A falsy return counts as success, so the test continues immediately, as if the wait had succeeded.",
      correction: "Put an assertion inside, such as waitFor(() => expect(isDone).toBe(true)).",
    },
    {
      id: "only-happy-path",
      heading: "Testing only the success path",
      problem: "A suite that only covers successful responses leaves the failure state unverified, and that is where users get stuck. An error message that never renders can go unnoticed until production.",
      correction: "Add a test for failure, and an empty state, using a controlled response.",
    },
    {
      id: "real-network",
      heading: "Calling a real API from component tests",
      problem: "A test relying on a live server fails when the network or that service is down, runs slowly, and can change real data. Its failures may have nothing to do with your code at all.",
      correction: "Replace the network at the boundary, and keep a few end-to-end tests for real integration.",
    },
    {
      id: "forget-await-rejects",
      heading: "Forgetting to await a rejects assertion",
      problem: "expect(promise).rejects.toThrow() without await returns a Promise that nobody waits for. The test ends straight away and passes, so a broken error path appears to be covered.",
      correction: "Always await asynchronous assertions.",
    },
  ],
  interview: [
    {
      id: "ta-how",
      question: "How do you test UI that updates asynchronously?",
      answer: "Wait for the outcome instead of a fixed time. findBy retries until an element appears, and waitFor retries an assertion. The network is replaced with a controlled response, and fake timers handle time-based behavior, so tests are fast and deterministic.",
    },
    {
      id: "ta-sleep-why",
      question: "Why are fixed delays a bad idea in tests?",
      answer: "They are either too long, slowing the suite, or too short, failing on slower machines. They also do not state what the test is waiting for. Waiting for the outcome finishes as soon as it is ready, and it tolerates variation up to a timeout.",
    },
    {
      id: "ta-find-vs-wait",
      question: "When do you use findBy, and when waitFor?",
      answer: "findBy for an element that will appear, since it is simply a query with retry. waitFor for anything else, such as a mock being called, or an assertion on something already present. The callback must throw to retry, so it needs an assertion inside.",
    },
    {
      id: "ta-states",
      question: "Which states should you test for async UI?",
      answer: "Loading, success, failure, and empty, and ideally what happens when a newer request supersedes an older one. People usually test success first, while failure states are often where real users get stuck, so they deserve attention too.",
    },
    {
      id: "ta-flaky",
      question: "What causes flaky async tests, and how do you fix them?",
      answer: "Real timers and networks, unawaited work, and state shared between tests. Fixes are waiting on outcomes, controlling time and network, awaiting everything, and cleaning up. I would not simply retry a flaky test, because it may be revealing a real race condition.",
    },
  ],
  takeaways: [
    "Wait for outcomes, never for fixed amounts of time.",
    "findBy suits elements, and waitFor suits anything else.",
    "Control the network and time, so that tests are deterministic.",
    "Cover loading, success, failure, and empty states.",
  ],
  quickReview: {
    definition: "Testing asynchronous UI means waiting for observable outcomes, rather than relying on arbitrary delays.",
    keyPoints: [
      "findBy retries for 1000 ms by default.",
      "waitFor needs its callback to throw to retry.",
      "Fake timers make delays instant.",
      "Always await asynchronous assertions.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "external",
      title: "Waiting for an element",
      language: "tsx",
      code: `expect(await screen.findByRole("alert")).toBeTruthy();`,
      description: "screen comes from a separate package, not installed here. This waits for the alert, and it finishes as soon as it appears.",
    },
    commonMistakes: [
      "Using await sleep(500).",
      "Returning a boolean from waitFor.",
      "Covering only the success path.",
    ],
    interviewTrap: "“Does waitFor(() => isReady) wait for isReady?” No. It only retries when the callback throws, so that returns right away.",
    takeaway: "Tell the test what you are waiting for, and never how long you think it takes.",
  },
  sources: [
    { label: "Testing Library: async methods", href: "https://testing-library.com/docs/dom-testing-library/api-async/" },
    { label: "Testing Library: queries", href: "https://testing-library.com/docs/queries/about/" },
    { label: "Vitest: mocking timers", href: "https://vitest.dev/guide/mocking/timers" },
    { label: "Reacting to Input with State", href: "https://react.dev/learn/reacting-to-input-with-state" },
  ],
};
