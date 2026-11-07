import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useTransition does",
      paragraphs: [
        "useTransition lets you render part of the UI in the background, so an update does not block the rest of the interface. It takes no parameters and returns two things: const [isPending, startTransition] = useTransition().",
        "isPending says whether a Transition is in progress. startTransition marks state updates as Transitions, and it has a stable identity, so it can be left out of Effect dependencies.",
      ],
      examples: [
        {
          id: "tab-switch",
          classification: "complete",
          title: "A tab switch that stays responsive",
          language: "tsx",
          code: `import { useState, useTransition } from "react";

type Tab = "about" | "posts";

function SlowPosts() {
  const items = Array.from({ length: 2000 }, (_, index) => <li key={index}>Post {index}</li>);

  return <ul>{items}</ul>;
}

export default function Tabs() {
  const [tab, setTab] = useState<Tab>("about");
  const [isPending, startTransition] = useTransition();

  function select(next: Tab) {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <button type="button" onClick={() => select("about")}>
        About
      </button>
      <button type="button" onClick={() => select("posts")}>
        Posts {isPending && "(Loading…)"}
      </button>
      {tab === "about" ? <p>About this site</p> : <SlowPosts />}
    </>
  );
}`,
          description: "While the long list renders, the buttons remain usable. Clicking About before it finishes interrupts the render, so React handles the new choice at once.",
        },
      ],
    },
    {
      id: "how-start-transition-works",
      heading: "How startTransition works",
      paragraphs: [
        "The function you pass runs immediately, and it is not deferred. Running code in it does not delay that code. What changes is how React treats the updates: every state update made synchronously during it is marked as a Transition.",
        "This has two consequences that trip people up. Updates inside setTimeout are not Transitions, because they happen later. And updates after an await need another startTransition, because JavaScript cannot carry the Transition’s context across an await.",
      ],
      examples: [
        {
          id: "after-await",
          classification: "snippet",
          title: "Wrapping updates after an await",
          language: "tsx",
          code: `startTransition(async () => {
  const saved = await saveDraft(text);

  startTransition(() => {
    setSavedText(saved);
  });
});`,
          typecheckContext: { before: `import { startTransition } from "react";\ndeclare const text: string;\ndeclare const saveDraft: (value: string) => Promise<string>;\ndeclare const setSavedText: (value: string) => void;` },
          description: "isPending stays true from the first call until all Actions finish and the final state is on screen.",
        },
      ],
    },
    {
      id: "interruption",
      heading: "Non-blocking and interruptible",
      paragraphs: [
        "A Transition can be interrupted by other updates. If a user types while a chart re-renders in a Transition, React handles the typing first and then restarts the chart. That is what keeps the page responsive.",
        "It does not make the work faster. The same rendering still has to happen, and on a slow device it simply happens without freezing the page. The React 19.3 changelog records separate rendering of independent Transitions, so a slow one need not hold up an unrelated one. This does not guarantee a particular batching relationship or commit order, especially for updates sharing state or asynchronous Actions.",
      ],
    },
    {
      id: "text-inputs",
      heading: "Transitions cannot control text inputs",
      paragraphs: [
        "An input’s value has to update synchronously, so startTransition(() => setText(value)) does not work. Use one state variable for the input, and either a second one set in a Transition for the rest of the UI, or useDeferredValue.",
      ],
      examples: [
        {
          id: "two-states",
          classification: "complete",
          title: "Separate state for the input and the results",
          language: "tsx",
          code: `import { useState, useTransition } from "react";

export default function Search() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <label>
        Search
        <input
          value={text}
          onChange={event => {
            const next = event.target.value;
            setText(next);
            startTransition(() => setQuery(next));
          }}
        />
      </label>
      <p>{isPending ? "Updating…" : "Results for: " + query}</p>
    </>
  );
}`,
          description: "The input stays synchronous, while whatever depends on query can render in the background.",
        },
      ],
    },
    {
      id: "suspense",
      heading: "Working with Suspense",
      paragraphs: [
        "Transitions change how Suspense behaves during navigation. A Transition waits only long enough to avoid hiding content that is already visible, so a tab container stays on screen while the new tab loads, and the pending state can show on the button.",
        "Content that has never been shown still displays its fallback, and a nested Suspense boundary inside the new content is not waited for. This is why routers commonly wrap navigation in Transitions.",
      ],
    },
    {
      id: "errors-and-limits",
      heading: "Errors, ordering, and the standalone function",
      paragraphs: [
        "If the function passed to startTransition throws or rejects, the nearest error boundary around the component calling useTransition shows its fallback. Async Actions also do not guarantee order, since responses can arrive out of sequence. useActionState and form actions handle ordering for common cases.",
        "Only wrap updates when you have access to the state’s setter. For values from props or custom Hooks, use useDeferredValue.",
      ],
      comparison: [
        {
          id: "hook",
          title: "useTransition",
          items: ["A Hook, so it is used in components and custom Hooks.", "Provides isPending.", "An error boundary can catch its errors."],
        },
        {
          id: "standalone",
          title: "Standalone startTransition",
          items: ["Imported from react, and usable anywhere.", "Provides no pending state.", "Not tied to a component, so an error boundary cannot catch its errors."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "wrapping-input",
      heading: "Wrapping a controlled input’s update",
      problem: "Marking setText as a Transition to keep typing smooth does the opposite, because an input’s value must update synchronously. The input can drop or lag behind characters.",
      correction: "Keep the input’s state synchronous, and use a Transition or useDeferredValue for what depends on it.",
    },
    {
      id: "thinks-delay",
      heading: "Thinking startTransition delays your code",
      problem: "The name suggests something happens later. The function runs immediately and synchronously, so 1, 2, 3 logs in order around it. Only React’s scheduling of the marked updates is different.",
      correction: "Read it as a label on updates, not as a timer.",
    },
    {
      id: "after-await-unmarked",
      heading: "Forgetting a second startTransition after await",
      problem: "State set after an await looks like part of the same Transition, but it is not tracked, so it can behave as an urgent update and cause a flash of intermediate UI.",
      correction: "Wrap updates after an await in another startTransition.",
    },
    {
      id: "timeout-unmarked",
      heading: "Expecting updates in setTimeout to be Transitions",
      problem: "Calling setTimeout inside startTransition and setting state there runs after the function has returned, so those updates are not marked as Transitions.",
      correction: "Call startTransition inside the timeout’s callback.",
    },
    {
      id: "transition-as-fix",
      heading: "Treating a Transition as a performance fix",
      problem: "Wrapping a slow update keeps the page responsive, but the rendering is just as slow. A list that takes two seconds still takes two seconds, and the user just avoids a frozen page.",
      correction: "Use a Transition for responsiveness, and separately fix the slow rendering if the wait itself is the problem.",
    },
  ],
  interview: [
    {
      id: "ut-what",
      question: "What does useTransition do?",
      answer: "It marks state updates as non-blocking, so React can keep the page responsive while rendering them and can interrupt them for more urgent updates. It returns isPending, for showing progress, and startTransition, for marking the updates.",
    },
    {
      id: "ut-immediately",
      question: "Does the function passed to startTransition run later?",
      answer: "No, it runs immediately. Any state updates made synchronously during it get marked as Transitions. So code order is unaffected, and only React’s handling of those updates differs. Updates scheduled later, as in setTimeout, are not marked.",
    },
    {
      id: "ut-input",
      question: "Why can’t you use a Transition for a text input’s state?",
      answer: "Inputs need to update synchronously to show what was typed. Use separate state: one synchronous for the input, and one set in a Transition for what depends on it. useDeferredValue is another option with a single state variable.",
    },
    {
      id: "ut-vs-deferred",
      question: "When would you use useTransition rather than useDeferredValue?",
      answer: "useTransition when you control the state setter, so you can wrap the update. useDeferredValue when you only receive a value, such as from a prop. Both make updates non-blocking, and neither makes the rendering itself faster.",
    },
    {
      id: "ut-suspense",
      question: "How do Transitions affect Suspense fallbacks?",
      answer: "A Transition avoids hiding content that has already been revealed, so the old screen stays visible while new content loads. Boundaries for new content can still show fallbacks. That is why routers commonly wrap navigation in Transitions.",
    },
    {
      id: "ut-order",
      question: "What is a risk with async Transitions?",
      answer: "Responses can arrive out of order, because async Actions do not guarantee sequence. A slower earlier request could overwrite a later result. useActionState and form actions manage this in common cases, and custom logic needs its own queue or abort handling.",
    },
    {
      id: "ut-error",
      question: "How are errors handled in startTransition?",
      answer: "If the function throws or returns a rejected promise, an error boundary around the component calling useTransition shows its fallback. The standalone startTransition is not tied to a component, so a boundary cannot catch its errors in the same way.",
    },
  ],
  takeaways: [
    "Transitions mark updates as non-blocking and interruptible.",
    "The function passed in runs immediately, and only synchronous updates in it are marked.",
    "Controlled inputs must stay outside Transitions.",
    "A Transition improves responsiveness, without making rendering faster.",
  ],
  quickReview: {
    definition: "useTransition marks state updates as non-blocking and reports whether they are still in progress.",
    keyPoints: [
      "It returns [isPending, startTransition].",
      "startTransition runs its function right away.",
      "Updates after await need another startTransition.",
      "Transitions do not hide content that is already visible.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Marking an update",
      language: "tsx",
      code: `const [isPending, startTransition] = useTransition();

startTransition(() => setTab("posts"));`,
      typecheckContext: { before: `import { useTransition } from "react";\ndeclare const setTab: (tab: string) => void;\nexport function useExample() {`, after: "return isPending;\n}" },
      description: "The tab update can be interrupted, and isPending tracks its progress.",
    },
    commonMistakes: [
      "Wrapping a controlled input’s state.",
      "Assuming the function runs later.",
      "Missing startTransition after an await.",
    ],
    interviewTrap: "“Does a Transition make slow rendering faster?” No. It keeps the page responsive while the same work happens.",
    takeaway: "Use Transitions to tell React what can wait, and fix slow rendering separately.",
  },
  sources: [
    { label: "React 19.3 changelog: independent Transitions (#37290)", href: "https://react.dev/blog/2026/09/09/react-19-3#changelog" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
    { label: "useDeferredValue reference", href: "https://react.dev/reference/react/useDeferredValue" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
  ],
};
