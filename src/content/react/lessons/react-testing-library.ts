import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-it-is",
      heading: "What React Testing Library is",
      paragraphs: [
        "React Testing Library is a lightweight layer over react-dom. It works with real DOM nodes and provides queries that mirror how people find things, such as by label or button text. Its guiding principle is that the closer your tests match real usage, the more confidence they give you.",
        "It is a separate set of packages, @testing-library/react and @testing-library/dom, and it is not part of React. It is not a test runner either, so it needs one such as Vitest or Jest, along with a DOM environment.",
      ],
      list: [
        "This project does not install it, so the code here is not compiled or run by this site’s checks.",
        "The examples are checked by reading them against the library’s documentation, and every code block in this lesson that depends on it is labelled as such.",
      ],
    },
    {
      id: "rendering",
      heading: "Rendering and screen",
      paragraphs: [
        "render puts your component into a container in document.body. screen then gives you queries bound to the whole document, which is the recommended way to find things. Cleanup between tests runs automatically if your test framework provides a global afterEach. Otherwise, you must call cleanup yourself.",
      ],
      examples: [
        {
          id: "render-screen",
          classification: "external",
          title: "A first test",
          language: "tsx",
          code: `// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

afterEach(cleanup);

it("greets the user by name", () => {
  render(<Greeting name="Ana" />);

  expect(screen.getByRole("heading", { name: "Hello, Ana" })).toBeTruthy();
});`,
          description: "This needs the external packages @testing-library/react and jsdom, which are not installed in this project. getByRole throws if there is no match, so finding the element is itself an assertion.",
        },
      ],
    },
    {
      id: "queries",
      heading: "Choosing a query",
      paragraphs: [
        "Queries differ in how they behave when nothing is found, and in whether they wait. Choosing correctly makes a test’s intent clear, and makes its failures more useful.",
      ],
      comparison: [
        {
          id: "single-queries",
          title: "Query behavior",
          items: ["getBy: throws if there is no match. Use it for what should be there.", "queryBy: returns null if there is no match. Use it to assert absence.", "findBy: retries, by default for up to 1000 ms. Use it for what appears later."],
        },
        {
          id: "priority",
          title: "Priority of queries",
          items: ["First: getByRole, getByLabelText, getByPlaceholderText, getByText, getByDisplayValue.", "Then: getByAltText and getByTitle.", "Last: getByTestId, as an escape hatch."],
        },
      ],
      closing: "All of them also have an All version, such as getAllByRole, for several matches. A single-element query throws if more than one matches.",
    },
    {
      id: "user-event",
      heading: "Simulating users",
      paragraphs: [
        "@testing-library/user-event simulates full interactions, firing the events that would happen in a browser, and checking whether a user could actually do it, such as clicking a hidden element. fireEvent, by contrast, dispatches one DOM event.",
        "Call userEvent.setup() before rendering, then await each interaction.",
      ],
      examples: [
        {
          id: "user-event-form",
          classification: "external",
          title: "Typing and submitting",
          language: "tsx",
          code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <form action={formData => onSearch(String(formData.get("query")))}>
      <label>
        Search
        <input name="query" />
      </label>
      <button type="submit">Go</button>
    </form>
  );
}

it("submits what was typed", async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  render(<SearchForm onSearch={onSearch} />);

  await user.type(screen.getByLabelText("Search"), "hooks");
  await user.click(screen.getByRole("button", { name: "Go" }));

  expect(onSearch).toHaveBeenCalledWith("hooks");
});`,
          description: "This requires the separate package @testing-library/user-event, which is not installed here. Finding the field by its label also verifies that it is labelled.",
        },
      ],
    },
    {
      id: "accessibility-benefit",
      heading: "Tests that encourage accessibility",
      paragraphs: [
        "Querying by role and accessible name has a useful side effect. If getByRole(\"button\", { name: \"Close\" }) cannot find your button, it may be because a div has no role, or an icon has no name. The test then reveals a real problem for assistive technology.",
        "It is no substitute for testing with real assistive technology, but it does make the accessible path the easy one. Use data-testid only for elements that text and labels cannot reasonably identify.",
      ],
    },
    {
      id: "act-note",
      heading: "What about act?",
      paragraphs: [
        "React’s act applies pending updates before assertions run. The library’s helpers already wrap their work in it, so you rarely need to call it yourself. A warning about updates not being wrapped in act often means something changed after your test finished looking, so wait for that outcome with findBy or waitFor.",
      ],
    },
  ],
  mistakes: [
    {
      id: "testid-first",
      heading: "Reaching for test IDs first",
      problem: "data-testid works everywhere, so it is tempting to use it for everything. Those tests would pass even if the button had no accessible name, and users cannot see test IDs, so the tests resemble real use less.",
      correction: "Use role and label queries first, and keep test IDs as a last resort.",
    },
    {
      id: "getby-absence",
      heading: "Using getBy to assert that something is absent",
      problem: "getBy throws when there is no match, so a test that expects nothing fails at the query, with an error that does not express the intent. It is a frequent first attempt at testing that something has gone away.",
      correction: "Use queryBy, and assert that the result is null.",
    },
    {
      id: "querying-container",
      heading: "Querying through container and CSS selectors",
      problem: "container.querySelector(\".btn-primary\") ties a test to class names and markup. Restyling then breaks tests, even though behavior is unchanged, and the test no longer reflects how people find things.",
      correction: "Use screen queries by role, label, or text.",
    },
    {
      id: "not-awaiting",
      heading: "Forgetting to await user events",
      problem: "Interactions from user.click are asynchronous. Without await, the assertion runs before the interaction has finished, which gives failures or warnings that appear random and depend on timing.",
      correction: "Await each interaction, and make the test function async.",
    },
    {
      id: "wrapping-act",
      heading: "Wrapping everything in act",
      problem: "Adding act around render and events to silence a warning repeats what the library already does, and it often hides the fact that the test is not waiting for something that happens later.",
      correction: "Remove the extra act, and wait for the outcome with findBy or waitFor.",
    },
  ],
  interview: [
    {
      id: "rtl-what",
      question: "What is the philosophy of React Testing Library?",
      answer: "The closer tests match how software is used, the more confidence they give. So it works with real DOM nodes, and finds elements as people do, by role, label, and text. Tests focus on behavior, so refactors that preserve behavior do not break them.",
    },
    {
      id: "rtl-query-types",
      question: "What is the difference between getBy, queryBy, and findBy?",
      answer: "getBy throws if nothing matches, so it suits things that should be present. queryBy returns null, so it suits asserting absence. findBy retries asynchronously, by default for 1000 ms, so it suits things that appear later. All three throw when several match.",
    },
    {
      id: "rtl-priority",
      question: "Which query should you prefer?",
      answer: "getByRole first, usually with a name, since it matches how assistive technology sees the page. Then getByLabelText for form fields, then text queries. getByTestId is a last resort for things that cannot be identified otherwise.",
    },
    {
      id: "rtl-user-vs-fire",
      question: "Why prefer user-event over fireEvent?",
      answer: "fireEvent dispatches one DOM event, while user-event models a whole interaction, firing the sequence a browser would. It also checks whether the action is possible, such as not clicking a hidden element. So it is closer to real use, and it can catch more bugs.",
    },
    {
      id: "rtl-act-warning",
      question: "What does an act warning usually mean in these tests?",
      answer: "Something updated React state outside of what the test was waiting on, often after an async operation finished later. Rather than wrapping things in act, I find the outcome that the update produces, and wait for it with findBy or waitFor.",
    },
    {
      id: "rtl-setup",
      question: "What does it take to use React Testing Library with Vitest?",
      answer: "Install the library and a DOM environment such as jsdom, and set Vitest’s environment for those tests. Without global test functions, cleanup does not run automatically, so call it in afterEach, or enable globals.",
    },
  ],
  takeaways: [
    "Find elements the way people do, by role, label, and text.",
    "Use getBy for present, queryBy for absent, and findBy for later.",
    "Prefer user-event, and await each interaction.",
    "It needs a test runner and a DOM environment, and it is a separate install.",
  ],
  quickReview: {
    definition: "React Testing Library tests components through real DOM nodes, using queries that mirror how people find things.",
    keyPoints: [
      "Priority: role, then label, then text, and test IDs last.",
      "queryBy returns null, and findBy retries.",
      "user-event models a whole interaction.",
      "Its helpers already wrap work in act.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "external",
      title: "The usual query",
      language: "tsx",
      code: `const button = screen.getByRole("button", { name: "Save" });`,
      description: "screen comes from the separate package @testing-library/react, which is not installed here. This finds a button by role and accessible name.",
    },
    commonMistakes: [
      "Using test IDs before role queries.",
      "Using getBy to assert that something is absent.",
      "Forgetting to await user events.",
    ],
    interviewTrap: "“Should you wrap user events in act to remove a warning?” No. The helpers already do. The warning usually means the test needs to wait for something.",
    takeaway: "If your test cannot find it the way a user would, a user may not be able to either.",
  },
  sources: [
    { label: "React Testing Library introduction", href: "https://testing-library.com/docs/react-testing-library/intro/" },
    { label: "Testing Library: queries", href: "https://testing-library.com/docs/queries/about/" },
    { label: "Testing Library: user-event", href: "https://testing-library.com/docs/user-event/intro/" },
    { label: "React Testing Library API", href: "https://testing-library.com/docs/react-testing-library/api/" },
    { label: "act reference", href: "https://react.dev/reference/react/act" },
  ],
};
