import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "the-idea",
      heading: "Letting part of the screen lag behind",
      paragraphs: [
        "Deferred rendering lets a non-critical part of the screen show slightly old information, while an urgent part stays current. When someone types into a search box, the input must reflect every key press immediately. The result list can catch up a moment later without anyone minding.",
        "Without this, every keystroke waits for the whole page to render, and typing feels sticky. The tool for this in React is useDeferredValue, which gives you a copy of a value that can lag behind.",
      ],
    },
    {
      id: "putting-it-together",
      heading: "What it takes to work",
      paragraphs: [
        "Two things have to be in place for the keystroke to stay fast. The slow part must receive the deferred value, and it must be wrapped in memo. During the urgent render the deferred value has not changed, so memo lets the slow part skip. The background render then updates it.",
      ],
      examples: [
        {
          id: "search-page",
          classification: "complete",
          title: "A responsive search page",
          language: "tsx",
          code: `import { memo, useDeferredValue, useState } from "react";

const lessons = Array.from({ length: 3000 }, (_, index) => "Lesson " + index);

const Results = memo(function Results({ query }: { query: string }) {
  const matches = lessons.filter(lesson => lesson.includes(query));

  return (
    <ul>
      {matches.map(match => (
        <li key={match}>{match}</li>
      ))}
    </ul>
  );
});

export default function Search() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <label>
        Search
        <input value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <p role="status">{isStale ? "Updating results…" : "Up to date"}</p>
      <Results query={deferredQuery} />
    </>
  );
}`,
          description: "Each keystroke renders the input at once, and Results skips that pass. A background render then updates the list, restarting if another key arrives.",
        },
      ],
    },
    {
      id: "choosing-a-tool",
      heading: "Choosing between the related tools",
      paragraphs: [
        "Several tools address similar symptoms. The difference is what you control, and whether you need to reduce work as well as keep the page responsive.",
      ],
      comparison: [
        {
          id: "deferred",
          title: "useDeferredValue",
          items: ["You receive a value, such as a prop.", "No fixed delay, and it adapts to the device.", "Does not reduce requests."],
        },
        {
          id: "transition-debounce",
          title: "useTransition, or debouncing",
          items: ["useTransition: you own the setter, and get isPending.", "Debouncing: waits a set time.", "Debouncing can reduce network requests."],
        },
      ],
    },
    {
      id: "with-loading-data",
      heading: "With data that suspends",
      paragraphs: [
        "When the deferred value drives something that suspends, users keep seeing the previous results rather than a fallback, until the new data has loaded. Each keystroke does not blank the list, which often feels far better.",
        "The display is stale during that time, so show it. Combining a text indicator with reduced opacity is a simple approach. Dimming alone relies on people noticing a color change, which should not be the only signal.",
      ],
    },
    {
      id: "when-not-to-use",
      heading: "When not to defer",
      paragraphs: [
        "Deferring adds a second render pass, so it is not free. Reach for it when you have measured that an update makes an interaction lag. A fast list needs nothing here, and on simple updates this only adds complexity.",
        "Remember that it does not make the slow part faster, either. If a list takes a full second to render, it still takes a full second. Making it cheaper, for example through virtualization or pagination, helps with the actual cost.",
      ],
    },
  ],
  mistakes: [
    {
      id: "skipping-memo",
      heading: "Forgetting memo on the slow component",
      problem: "Passing a deferred value to an ordinary component changes nothing, since it re-renders with its parent during the urgent pass anyway. Typing stays exactly as slow, and the Hook appears not to work.",
      correction: "Wrap the slow component in memo, so it can skip the urgent render.",
    },
    {
      id: "deferring-the-input",
      heading: "Passing the deferred value to the input",
      problem: "An input showing the deferred value lags behind what was typed, which is exactly the thing you were trying to prevent. The cursor and characters seem to fall behind the keyboard.",
      correction: "Keep the input on the current value, and give the deferred one to the slow part.",
    },
    {
      id: "stale-no-signal",
      heading: "Showing stale content as if it were current",
      problem: "A list that lags behind the input with no indication could be mistaken for results of the current query, especially on slower connections, where the delay is longest.",
      correction: "Compare the two values, and indicate that an update is on the way.",
    },
    {
      id: "instead-of-fixing",
      heading: "Using deferral to hide a slow component",
      problem: "A component that takes a second to render still takes that long, and it uses the CPU the whole time. The page responds, but a laptop’s fan or a phone’s battery will tell a different story.",
      correction: "Reduce the actual work through pagination, virtualization, or better calculations.",
    },
  ],
  interview: [
    {
      id: "dr-what",
      question: "What is deferred rendering?",
      answer: "Letting a non-critical part of the screen show a slightly old value while urgent parts stay current. useDeferredValue provides that value. The urgent render goes first, and then a background render, which can be interrupted, updates the slow part.",
    },
    {
      id: "dr-memo-q",
      question: "What makes useDeferredValue actually help with a slow list?",
      answer: "The list has to be wrapped in memo and has to receive the deferred value. During the urgent render, its prop is unchanged, so it can skip. Without memo, it re-renders on each keystroke, and nothing improves.",
    },
    {
      id: "dr-vs-debounce-q",
      question: "When would you debounce rather than defer?",
      answer: "When the goal is to reduce work outside rendering, such as network requests, since deferring does not do that. Deferring is better for keeping rendering from blocking, because it has no fixed delay and adapts to the device. They can be used together.",
    },
    {
      id: "dr-stale-ui",
      question: "How do you handle stale content while a deferred update is pending?",
      answer: "Compare the current value with the deferred one. If they differ, show an indicator, ideally text as well as a visual change. It tells people the results do not yet match what they entered, which matters most on slower devices.",
    },
    {
      id: "dr-limit",
      question: "Does deferring reduce the total rendering work?",
      answer: "No. If anything, it adds a pass, because the urgent render and the background render are separate. Interrupted renders are also discarded. It improves responsiveness, so a truly slow component still needs its own fix.",
    },
    {
      id: "dr-when",
      question: "When would you avoid useDeferredValue?",
      answer: "When nothing is measurably slow, because it adds complexity and an extra render pass. Also for values that must stay perfectly in step with what is displayed next to them. I would measure first, and consider simpler fixes.",
    },
  ],
  takeaways: [
    "Deferred rendering lets non-critical UI lag behind urgent UI.",
    "It needs a memoized slow component, receiving the deferred value.",
    "Show when the content is stale.",
    "It improves responsiveness, without reducing the work.",
  ],
  quickReview: {
    definition: "Deferred rendering keeps urgent UI current, and lets a slower part catch up in the background.",
    keyPoints: [
      "useDeferredValue provides the lagging value.",
      "memo is required for the benefit.",
      "The input stays on the current value.",
      "There is no fixed delay to configure.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "The two values",
      language: "tsx",
      code: `const deferredQuery = useDeferredValue(query);

return <Results query={deferredQuery} />;`,
      typecheckContext: { before: `import { useDeferredValue, type ReactNode } from "react";\ndeclare function Results(props: { query: string }): ReactNode;\nexport function Example({ query }: { query: string }) {`, after: "}" },
      description: "Only the slow part receives the lagging value.",
    },
    commonMistakes: [
      "Skipping memo on the slow component.",
      "Showing the deferred value in the input.",
      "Hiding that results are stale.",
    ],
    interviewTrap: "“Will useDeferredValue reduce the number of API calls?” No. It defers rendering, and requests still happen for each value.",
    takeaway: "Keep what people are touching current, and let everything else catch up.",
  },
  sources: [
    { label: "useDeferredValue reference", href: "https://react.dev/reference/react/useDeferredValue" },
    { label: "memo reference", href: "https://react.dev/reference/react/memo" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
