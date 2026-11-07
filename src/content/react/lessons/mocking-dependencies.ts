import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-mock",
      heading: "Why replace a dependency",
      paragraphs: [
        "Some things make a test slow, unpredictable, or unsafe: a real server, the current time, random values, or a payment service. Replacing those with a controlled stand-in lets a test decide exactly what happens, including failures that are hard to trigger for real.",
        "The cost is that a mock is a claim about how the real thing behaves, and that claim can be wrong. Each mock also removes some real code from the test. So the skill lies in choosing where to mock, rather than in how much.",
      ],
      comparison: [
        {
          id: "mock-these",
          title: "Usually worth replacing",
          items: ["Network requests.", "Time, timers, and random values.", "Third-party services, such as payments."],
        },
        {
          id: "keep-these",
          title: "Usually worth keeping real",
          items: ["Your own components and child components.", "Your own rules and reducers.", "React itself, and its Hooks."],
        },
      ],
    },
    {
      id: "passing-dependencies",
      heading: "The simplest mock is an argument",
      paragraphs: [
        "If a function receives what it depends on, a test can simply pass something else. This involves no special tooling, and it makes the dependency visible in the function’s signature. vi.fn creates a function that records its calls.",
      ],
      examples: [
        {
          id: "injected",
          classification: "complete",
          title: "Passing the dependency in",
          language: "typescript",
          code: `import { expect, it, vi } from "vitest";

type Notifier = (message: string) => void;

function notifyIfOverdue(daysLate: number, notify: Notifier) {
  if (daysLate > 0) notify("Your book is " + daysLate + " days late.");
}

it("notifies only when a book is late", () => {
  const notify = vi.fn<Notifier>();

  notifyIfOverdue(0, notify);
  expect(notify).not.toHaveBeenCalled();

  notifyIfOverdue(3, notify);
  expect(notify).toHaveBeenCalledWith("Your book is 3 days late.");
});`,
          description: "No module replacement is needed. The test decides what notify does, and it checks the arguments.",
        },
      ],
    },
    {
      id: "globals-and-network",
      heading: "Replacing the network",
      paragraphs: [
        "vi.stubGlobal replaces a global such as fetch. Stubs persist until they are restored, so call vi.unstubAllGlobals in afterEach, or enable the unstubGlobals config option. Return a real Response from the stub, so that your code goes through its real parsing and status checks.",
      ],
      examples: [
        {
          id: "stub-fetch",
          classification: "complete",
          title: "Controlling fetch, for success and failure",
          language: "typescript",
          code: `import { afterEach, expect, it, vi } from "vitest";

async function loadTitle(id: string) {
  const response = await fetch("/api/lessons/" + id);
  if (!response.ok) throw new Error("Request failed: " + response.status);
  const lesson: { title: string } = await response.json();
  return lesson.title;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

it("returns the title", async () => {
  const fetchMock = vi.fn(async () => Response.json({ title: "Hooks" }));
  vi.stubGlobal("fetch", fetchMock);

  await expect(loadTitle("7")).resolves.toBe("Hooks");
  expect(fetchMock).toHaveBeenCalledWith("/api/lessons/7");
});

it("reports a server error", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 503 })));

  await expect(loadTitle("7")).rejects.toThrow("503");
});`,
          description: "All of loadTitle runs for real, and only the network is replaced. The failure path is as easy to test as the success path.",
        },
      ],
    },
    {
      id: "spies-and-modules",
      heading: "Spies and module mocks",
      paragraphs: [
        "vi.spyOn wraps a method on an object. The original still runs, unless you give it a replacement, and you can restore it afterward. This suits observing a call, or quieting something such as console.error in one test.",
        "vi.mock replaces an entire module for a test file. Vitest hoists the call to the top of the file, so it runs before imports, whatever line you wrote it on. That means its factory cannot use ordinary variables from the file, unless they are created with vi.hoisted.",
      ],
      examples: [
        {
          id: "spy",
          classification: "complete",
          title: "Spying and silencing a method",
          language: "typescript",
          code: `import { afterEach, expect, it, vi } from "vitest";

function warnOnce(seen: Set<string>, message: string) {
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(message);
}

afterEach(() => {
  vi.restoreAllMocks();
});

it("warns about each message once", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const seen = new Set<string>();

  warnOnce(seen, "Slow request");
  warnOnce(seen, "Slow request");

  expect(warn).toHaveBeenCalledTimes(1);
});`,
          description: "mockImplementation keeps test output clean, and restoring the spy means that other tests see the real console.warn.",
        },
        {
          id: "module-mock",
          classification: "complete",
          title: "Replacing a module",
          language: "typescript",
          code: `import { hostname } from "node:os";
import { expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
  hostname: () => "test-machine",
}));

function describeServer() {
  return "Running on " + hostname();
}

it("uses the mocked module", () => {
  expect(describeServer()).toBe("Running on test-machine");
});`,
          description: "vi.mock is hoisted above the import, so hostname is already the replacement when the file runs. A module of your own, such as an analytics client, works in the same way.",
        },
      ],
    },
    {
      id: "keeping-mocks-honest",
      heading: "Keeping mocks honest",
      paragraphs: [
        "A mock can drift. If the real API starts returning a different shape, tests using the old shape still pass while production fails. These habits limit the damage.",
      ],
      list: [
        "Mock at the outermost boundary, so that as much real code runs as possible.",
        "Give mocks real types, so that the compiler catches some of the drift.",
        "Keep responses realistic, and reuse them instead of writing a new shape in each test.",
        "Keep a few end-to-end tests that talk to the real service, or to a realistic test instance of it.",
      ],
      closing: "If a test’s setup is mostly mocks, it may be telling you that the code has too many dependencies.",
    },
  ],
  mistakes: [
    {
      id: "mocking-the-subject",
      heading: "Mocking the thing being tested",
      problem: "When a test replaces parts of the very function it is checking, the assertion is really about the mock. It passes whatever the real code does, so it would not notice if the feature broke.",
      correction: "Replace only outer boundaries, and let the code under test run for real.",
    },
    {
      id: "asserting-only-calls",
      heading: "Asserting only that a mock was called",
      problem: "Checking only that fetch was called shows that a request was made, without showing what happened with the response. The screen could be blank, or the error might not be handled, and the test would still pass.",
      correction: "Assert on the visible result, and on the call’s arguments where they matter.",
    },
    {
      id: "not-restoring",
      heading: "Not restoring stubs and spies",
      problem: "A stubbed fetch or a silenced console stays in place for later tests in the same file. Results then depend on the order that tests run in, and a silenced console can hide real warnings.",
      correction: "Restore in afterEach, or enable restoreMocks and unstubGlobals in the config.",
    },
    {
      id: "hoisting-surprise",
      heading: "Using a local variable in a vi.mock factory",
      problem: "vi.mock is moved above the file’s imports and variables, so a factory that refers to a variable declared normally fails, because that variable does not yet exist when the factory is set up.",
      correction: "Create the value with vi.hoisted, or define it inside the factory.",
    },
    {
      id: "unrealistic-responses",
      heading: "Using responses the real server would never send",
      problem: "A stub returning a minimal object with only the fields a test reads can hide bugs. Missing fields and error formats differ from production, so the code passes against something that does not actually exist.",
      correction: "Base responses on real ones, keep them typed, and reuse them across tests.",
    },
  ],
  interview: [
    {
      id: "md-when",
      question: "When should you mock a dependency in a test?",
      answer: "When the real thing is slow, unpredictable, or unsafe, such as a network call, the clock, or a payment service. Mocking also makes failures easy to trigger. I keep my own logic and child components real, since those are what I am trying to verify.",
    },
    {
      id: "md-risk",
      question: "What is the risk of mocking too much?",
      answer: "The test stops verifying real behavior. It can pass while the pieces do not work together, and it may break during refactors because it knows too much about how they connect. A mock is also an assumption about the real thing, and that assumption can drift out of date.",
    },
    {
      id: "md-spy-vs-mock",
      question: "What is the difference between vi.fn, vi.spyOn, and vi.mock?",
      answer: "vi.fn creates a standalone function that records calls. vi.spyOn wraps an existing method, and by default the original still runs. vi.mock replaces a whole module for the test file, and it is hoisted so that it applies before imports.",
    },
    {
      id: "md-hoist",
      question: "What does it mean that vi.mock is hoisted?",
      answer: "Vitest moves the call to the top of the file, before imports, wherever it was written. So the module is replaced when the imports load. As a result, its factory cannot use ordinary local variables, and vi.hoisted exists for that case.",
    },
    {
      id: "md-network-level",
      question: "At what level should you replace network calls?",
      answer: "As far out as is practical, ideally at fetch or the HTTP layer, rather than mocking your own data functions. That way your parsing, error handling, and status checks run for real. Returning a real Response object helps with that too.",
    },
    {
      id: "md-injection",
      question: "How can you make code easier to test without module mocks?",
      answer: "Pass dependencies in as arguments or props, such as a notifier function, or an API client from context. A test can then supply a stand-in directly. That also makes the dependency explicit in the code, which helps readers as well as tests.",
    },
  ],
  takeaways: [
    "Mock external boundaries, and keep your own logic real.",
    "Passing a dependency in is the simplest mock.",
    "Restore stubs and spies, so that tests stay independent.",
    "A mock is an assumption, so keep it typed and realistic.",
  ],
  quickReview: {
    definition: "Mocking replaces an external dependency with a controlled stand-in, so a test can decide what happens without losing the behavior under test.",
    keyPoints: [
      "vi.fn creates a recording function.",
      "vi.stubGlobal replaces fetch and other globals.",
      "vi.mock is hoisted above imports.",
      "Return real Response objects from stubs.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A recording function",
      language: "typescript",
      code: `import { expect, it, vi } from "vitest";

it("records calls", () => {
  const save = vi.fn();

  save("draft");

  expect(save).toHaveBeenCalledWith("draft");
});`,
      description: "vi.fn gives a function you can pass anywhere, and it remembers how it was called.",
    },
    commonMistakes: [
      "Mocking the code that is being tested.",
      "Asserting only that a mock was called.",
      "Forgetting to restore stubs and spies.",
    ],
    interviewTrap: "“If all the tests pass with mocks, does it work in production?” Not necessarily. Mocks are assumptions, so you still need some tests against the real integration.",
    takeaway: "Mock where your application ends and the outside world begins.",
  },
  sources: [
    { label: "Vitest: mocking", href: "https://vitest.dev/guide/mocking" },
    { label: "Vitest: mocking timers", href: "https://vitest.dev/guide/mocking/timers" },
    { label: "Vitest guide", href: "https://vitest.dev/guide/" },
  ],
};
