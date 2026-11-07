import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useDeferredValue does",
      paragraphs: [
        "useDeferredValue lets part of the UI lag behind a value, so the rest can stay responsive. You pass it a value, and it returns a version of that value that may be older: const deferredValue = useDeferredValue(value, initialValue).",
        "If you omit initialValue, nothing is deferred on the first render, because there is no previous value to show. Providing one lets the first render use it, followed by a background render with the real value.",
      ],
      visual: {
        heading: "What happens when the value changes",
        context: "This follows one keystroke with a value called query.",
        steps: [
          { id: "urgent", title: "An urgent render", description: "React renders with the new query and the old deferred value, so the input updates right away." },
          { id: "background", title: "A background render", description: "React then starts rendering with the new deferred value." },
          { id: "interrupt", title: "Possibly interrupted", description: "If query changes again, React restarts the background render with the latest value." },
          { id: "commit", title: "Commit", description: "When the background render finishes, the updated UI appears." },
        ],
        note: "Changes are detected with Object.is. Effects from the background render do not fire until it commits.",
      },
    },
    {
      id: "not-debouncing",
      heading: "It is not debouncing",
      paragraphs: [
        "There is no fixed delay. The background render starts as soon as the urgent one finishes, and events such as typing interrupt it. On a fast device, the update appears almost immediately. On a slow one, it lags in proportion.",
        "It also defers rendering rather than network requests. If each value triggers a request, one is still made per change, so debouncing can still be useful alongside it, and caching makes repeated values such as pressing Backspace instant.",
      ],
      comparison: [
        {
          id: "debounce",
          title: "Debouncing or throttling",
          items: ["Waits for a fixed time.", "Can reduce the number of requests.", "Does not adapt to the device."],
        },
        {
          id: "deferred",
          title: "useDeferredValue",
          items: ["No fixed delay.", "Does not reduce the number of requests.", "Adapts to how fast the device can render."],
        },
      ],
    },
    {
      id: "needs-memo",
      heading: "Keeping typing fast requires memo",
      paragraphs: [
        "For a slow subtree, useDeferredValue lets keystrokes go ahead of expensive re-rendering. But the subtree must be wrapped in memo. During the urgent render, the deferred value is unchanged, so memo lets the slow component skip. Without memo, it re-renders anyway, and you gain nothing.",
      ],
      examples: [
        {
          id: "slow-list",
          classification: "complete",
          title: "A slow list that does not block typing",
          language: "tsx",
          code: `import { memo, useDeferredValue, useState } from "react";

const SlowList = memo(function SlowList({ text }: { text: string }) {
  const items = Array.from({ length: 2000 }, (_, index) => (
    <li key={index}>
      {text} {index}
    </li>
  ));

  return <ul>{items}</ul>;
});

export default function Filter() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);

  return (
    <>
      <label>
        Filter
        <input value={text} onChange={event => setText(event.target.value)} />
      </label>
      <SlowList text={deferredText} />
    </>
  );
}`,
          description: "This does not make SlowList render any faster. It only stops that rendering from blocking keystrokes.",
        },
      ],
    },
    {
      id: "with-suspense",
      heading: "With Suspense: stale content instead of a fallback",
      paragraphs: [
        "If the background update suspends, the user does not see the Suspense fallback. They keep seeing the previous content until the new data has loaded. This suits search results, where replacing the list with a spinner on each keystroke would be jarring.",
        "Stale content should look stale. Comparing the two values gives you a simple signal, which should not depend on color alone.",
      ],
      examples: [
        {
          id: "stale-signal",
          classification: "complete",
          title: "Showing that results are out of date",
          language: "tsx",
          code: `import { useDeferredValue, useState } from "react";

function Results({ query }: { query: string }) {
  return <p>Results for: {query}</p>;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <label>
        Search
        <input value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <div aria-busy={isStale} style={{ opacity: isStale ? 0.5 : 1 }}>
        {isStale && <p>Updating…</p>}
        <Results query={deferredQuery} />
      </div>
    </>
  );
}`,
          description: "isStale is true during the lag. Dimming and text are used together, so the state is not conveyed by appearance alone.",
        },
      ],
    },
    {
      id: "caveats",
      heading: "Caveats",
      paragraphs: ["A few details affect how you use it."],
      list: [
        "Pass primitives, or objects created outside of rendering. A new object created during rendering differs on every render, causing repeated background renders.",
        "Inside a Transition, the update is already deferred, so the Hook returns the new value and starts no deferred render.",
        "Use useTransition instead when you control the setter and want isPending, and this Hook when you only receive the value.",
      ],
    },
  ],
  mistakes: [
    {
      id: "no-memo",
      heading: "Using it without memo on the slow part",
      problem: "useDeferredValue alone looks as if it should be enough. Without memo, the slow child re-renders during the urgent pass anyway, since its parent rendered, so typing stays just as slow.",
      correction: "Wrap the slow subtree in memo, and pass it the deferred value.",
    },
    {
      id: "as-debounce",
      heading: "Expecting it to reduce network requests",
      problem: "Treating it as a debounce leads to one request per keystroke, though the screen appears to update less often. It defers rendering, and any fetching logic still runs for each value.",
      correction: "Debounce or cache requests separately, depending on what your data layer provides.",
    },
    {
      id: "new-object",
      heading: "Passing an object created during rendering",
      problem: "useDeferredValue({ query }) gives a new object on each render. Under Object.is it is always different, so React keeps scheduling background renders that never settle usefully.",
      correction: "Pass the primitive, or an object created outside of rendering.",
    },
    {
      id: "no-stale-signal",
      heading: "Showing stale content with no signal",
      problem: "Results that lag behind the input with no indication look wrong. Someone might read old results believing they match what they just typed, particularly on a slow connection.",
      correction: "Compare the value with the deferred value, and show a visible and accessible pending state.",
    },
  ],
  interview: [
    {
      id: "udv-what",
      question: "What does useDeferredValue do?",
      answer: "It returns a version of a value that may lag behind, while React renders with the new value in the background. Urgent updates such as typing go first, and the background render restarts if the value changes again.",
    },
    {
      id: "udv-vs-debounce",
      question: "How does useDeferredValue differ from debouncing?",
      answer: "Debouncing waits for a fixed time and can reduce work such as requests. useDeferredValue has no fixed delay and adapts to the device, starting as soon as the urgent render finishes. It does not reduce network requests, so the two can complement each other.",
    },
    {
      id: "udv-memo",
      question: "Why does useDeferredValue need memo to improve performance?",
      answer: "During the urgent render, the deferred value is unchanged, but without memo, the child re-renders with its parent anyway. memo lets it skip because its prop is the same. Without that, the expensive work still happens on every keystroke.",
    },
    {
      id: "udv-suspense",
      question: "How does it interact with Suspense?",
      answer: "If the background update suspends, users keep seeing the old content rather than the fallback, until the new data is ready. Comparing the value and the deferred value lets you indicate that the visible content is stale.",
    },
    {
      id: "udv-vs-transition",
      question: "When would you choose useDeferredValue over useTransition?",
      answer: "When you receive the value rather than controlling its setter, such as from a prop. useTransition wraps the state update itself and gives you isPending. Both produce non-blocking rendering, so it depends on what your code has access to.",
    },
    {
      id: "udv-initial",
      question: "What does the initialValue parameter do?",
      answer: "It is used only for the initial render. With it, React renders first with that value, then renders in the background with the actual one. Without it, the first render simply uses the value, because there is nothing previous to show.",
    },
  ],
  takeaways: [
    "useDeferredValue lets part of the UI lag behind a changing value.",
    "It has no fixed delay, and it does not reduce network requests.",
    "It only helps slow subtrees when they are wrapped in memo.",
    "With Suspense, it shows stale content instead of a fallback.",
  ],
  quickReview: {
    definition: "useDeferredValue returns a value that can lag behind, with the update rendered in the background.",
    keyPoints: [
      "Urgent updates go first, and the background render can restart.",
      "There is no delay to configure.",
      "memo is required for a performance benefit.",
      "Effects from the background render wait for its commit.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Deferring a value",
      language: "tsx",
      code: `const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;`,
      typecheckContext: { before: `import { useDeferredValue } from "react";\nexport function useExample(query: string) {`, after: "return isStale ? deferredQuery : query;\n}" },
      description: "Pass deferredQuery to the slow part, and use isStale to show that it is catching up.",
    },
    commonMistakes: [
      "Skipping memo on the slow child.",
      "Treating it as a debounce for requests.",
      "Passing a new object on every render.",
    ],
    interviewTrap: "“Does useDeferredValue make the slow component render faster?” No. It keeps the input responsive while the same work happens in the background.",
    takeaway: "Defer what can wait, memoize what is slow, and show when the content is stale.",
  },
  sources: [
    { label: "useDeferredValue reference", href: "https://react.dev/reference/react/useDeferredValue" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
