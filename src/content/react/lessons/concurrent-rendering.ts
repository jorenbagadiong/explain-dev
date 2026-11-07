import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-is",
      heading: "What concurrent rendering is",
      paragraphs: [
        "Concurrency is a behind-the-scenes rendering mechanism, introduced in React 18, that lets React prepare multiple versions of the UI at the same time. The React team describes it as not a feature in itself, but an implementation detail whose value comes from what it enables.",
        "Its key property is that rendering is interruptible. Without concurrent features, once React starts rendering an update, it finishes before doing anything else. In a concurrent render, React can pause, resume, or abandon work in progress, which lets the page respond to input during large rendering tasks.",
      ],
      comparison: [
        {
          id: "sync-render",
          title: "A synchronous render",
          items: ["Runs to completion.", "Long renders block input.", "How updates behave unless you use a concurrent feature."],
        },
        {
          id: "concurrent-render",
          title: "A concurrent render",
          items: ["Can be interrupted and resumed.", "Input can be handled in the middle of it.", "Enabled through features such as Transitions."],
        },
      ],
    },
    {
      id: "render-versus-commit",
      heading: "Rendering work is separate from committed updates",
      paragraphs: [
        "This is the mental model to hold on to. Rendering is calculation, and nothing reaches the screen until the commit. So React can do rendering work and throw it away with no visible effect, because it defers all DOM changes until the entire tree has been evaluated.",
        "That is how React guarantees a consistent UI, even when a render is interrupted. People never see a half-finished tree, because a tree only appears when it is complete.",
      ],
      visual: {
        heading: "A render that gets abandoned",
        context: "This follows a Transition interrupted by new input.",
        steps: [
          { id: "version-a", title: "Rendering version A in the background", description: "The screen still shows the previous committed UI." },
          { id: "input", title: "Input arrives", description: "React handles the urgent update first." },
          { id: "abandon", title: "Version A is discarded", description: "Nothing from it ever reached the DOM." },
          { id: "version-b", title: "Version B renders and commits", description: "The screen goes directly to the newest result." },
        ],
        note: "This is a simplified model. Exactly when React yields or restarts is an implementation detail.",
      },
    },
    {
      id: "opting-in",
      heading: "It is enabled by features you use",
      paragraphs: [
        "Upgrading React alone does not change how updates render. Concurrent behavior only applies in the parts of your application that use concurrent features. You do not call a concurrent API as such. You use features built on it.",
      ],
      list: [
        "startTransition and useTransition mark updates as interruptible.",
        "useDeferredValue lets part of the UI catch up in the background.",
        "Suspense uses it to keep visible content on screen during a Transition.",
        "Frameworks and routers often apply it for you, such as by wrapping navigation in a Transition.",
      ],
      examples: [
        {
          id: "transition-example",
          classification: "complete",
          title: "Using a concurrent feature",
          language: "tsx",
          code: `import { startTransition, useState } from "react";

export default function SearchBox({ onSearch }: { onSearch: (query: string) => void }) {
  const [text, setText] = useState("");

  return (
    <label>
      Search
      <input
        value={text}
        onChange={event => {
          const next = event.target.value;
          setText(next);
          startTransition(() => onSearch(next));
        }}
      />
    </label>
  );
}`,
          description: "The input updates urgently. If onSearch sets state in a parent, that update is marked as a Transition, so typing can interrupt its rendering.",
        },
      ],
    },
    {
      id: "what-this-means-for-code",
      heading: "What it asks of your code",
      paragraphs: [
        "Because a render may run more than once, or never commit, rendering must stay pure. Most components work without any change, but code that relies on a render happening exactly once, or having side effects, can misbehave.",
        "Mutable external data needs care too. If a store changes partway through a concurrent render, different components could read different values, a problem known as tearing. useSyncExternalStore exists to prevent this. Strict Mode helps surface these issues during development.",
      ],
      examples: [
        {
          id: "unsafe-render",
          classification: "complete",
          title: "Keeping rendering safe to repeat",
          language: "tsx",
          code: `// Avoid: incrementing a module-level counter during rendering,
// because abandoned or repeated renders would still count.
export default function Row({ index, label }: { index: number; label: string }) {
  return (
    <li>
      {index + 1}. {label}
    </li>
  );
}`,
          description: "This depends only on its props, so it gives the same result however many times React calls it.",
        },
      ],
    },
    {
      id: "misconceptions",
      heading: "Common misconceptions",
      paragraphs: ["Concurrency is easily misread, so it is worth being precise about what it is not."],
      list: [
        "It is not multi-threading. Rendering still runs on the main thread, broken into interruptible pieces.",
        "It does not make rendering faster. The same work happens, and it can sometimes be more, because of restarts.",
        "It does not automatically apply to all updates. You opt in through features.",
        "It does not affect your event handlers or Effects, whose long-running code can still block.",
      ],
    },
  ],
  mistakes: [
    {
      id: "assumed-automatic",
      heading: "Assuming React 18 or 19 makes everything concurrent",
      problem: "A common belief is that upgrading makes all rendering interruptible. Updates remain synchronous until you use a concurrent feature, so a slow update still blocks input after upgrading.",
      correction: "Use Transitions or deferred values for updates that should be interruptible.",
    },
    {
      id: "side-effects-in-render",
      heading: "Doing side effects during rendering",
      problem: "A render that might be abandoned or repeated can run a logging call or request several times, including for work that never appears. Such code worked by accident when renders happened exactly once.",
      correction: "Keep rendering pure, and move side effects to Effects and event handlers.",
    },
    {
      id: "multi-threading-belief",
      heading: "Thinking concurrency means parallel threads",
      problem: "The word suggests multi-threading, which leads to expecting work to run in parallel. React is still on the main thread, so heavy synchronous work blocks everything until it yields.",
      correction: "Think of it as React being able to interrupt its own rendering, and use a Web Worker for parallel work.",
    },
    {
      id: "external-store-tearing",
      heading: "Reading mutable stores directly while rendering",
      problem: "Reading a mutable external value during a concurrent render can let parts of the tree see different values if it changes partway through. This appears as a page showing two different answers at once.",
      correction: "Read external stores through useSyncExternalStore.",
    },
    {
      id: "faster-belief",
      heading: "Expecting concurrent rendering to reduce work",
      problem: "If a list takes a second to render, a Transition keeps the page responsive, but the list still takes a second, and restarts can add to that. Treating this as a speedup leaves the real cost unaddressed.",
      correction: "Use concurrency for responsiveness, and reduce the work itself separately.",
    },
  ],
  interview: [
    {
      id: "cr-what",
      question: "What is concurrent rendering?",
      answer: "A rendering mechanism that lets React prepare multiple versions of the UI, and pause, resume, or abandon rendering work. It keeps pages responsive during large updates. It is an implementation detail that is exposed through features such as Transitions.",
    },
    {
      id: "cr-consistent",
      question: "How does React keep the UI consistent if rendering can be interrupted?",
      answer: "It defers DOM changes until the entire tree has been evaluated, so an interrupted or abandoned render never appears. Rendering is only calculation, and only a finished result gets committed. That is why rendering has to stay pure.",
    },
    {
      id: "cr-threads",
      question: "Does concurrent rendering use multiple threads?",
      answer: "No. It runs on the main thread, splitting rendering into pieces, so React can yield to the browser and to higher-priority work. It is about interruptibility rather than parallelism. Long synchronous code outside rendering still blocks.",
    },
    {
      id: "cr-enable",
      question: "How do you enable concurrent rendering?",
      answer: "By using features built on it, such as startTransition, useTransition, useDeferredValue, and Suspense with Transitions. Upgrading alone does not change behavior. Many developers get it through frameworks and routers, without using those APIs directly.",
    },
    {
      id: "cr-tearing",
      question: "What is tearing?",
      answer: "When a mutable external value changes during a concurrent render, so different components read different versions, and the screen shows inconsistent data. useSyncExternalStore prevents it by forcing a blocking re-render if the store changes during a Transition.",
    },
    {
      id: "cr-code",
      question: "How does concurrent rendering affect how you write components?",
      answer: "Components must be pure, because they may be called several times, or their result may be thrown away. Most code already works. Strict Mode helps reveal problems by double-invoking components in development, which is why it is worth keeping on.",
    },
  ],
  takeaways: [
    "Concurrent rendering lets React interrupt, restart, or abandon rendering work.",
    "Nothing reaches the screen until a finished result is committed.",
    "It is opt-in, through features such as Transitions.",
    "It improves responsiveness, and it is not multi-threading.",
  ],
  quickReview: {
    definition: "Concurrent rendering lets React pause, resume, or discard rendering work, so that the page stays responsive during large updates.",
    keyPoints: [
      "Rendering is calculation, and commits are what change the DOM.",
      "It only applies when you use concurrent features.",
      "It runs on the main thread, without parallel threads.",
      "useSyncExternalStore prevents tearing.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Opting in",
      language: "tsx",
      code: `startTransition(() => setResults(nextResults));`,
      typecheckContext: { before: `import { startTransition } from "react";\ndeclare const nextResults: readonly string[];\ndeclare const setResults: (next: readonly string[]) => void;` },
      description: "This update can now be interrupted, and its work thrown away if needed.",
    },
    commonMistakes: [
      "Assuming upgrading makes everything concurrent.",
      "Having side effects during rendering.",
      "Reading mutable stores directly while rendering.",
    ],
    interviewTrap: "“Does concurrent mean multi-threaded?” No. It means React can interrupt its own work, on the same main thread.",
    takeaway: "Keep rendering pure, and React is free to work on what matters most.",
  },
  sources: [
    { label: "React 18 release notes", href: "https://react.dev/blog/2022/03/29/react-v18" },
    { label: "startTransition reference", href: "https://react.dev/reference/react/startTransition" },
    { label: "useSyncExternalStore reference", href: "https://react.dev/reference/react/useSyncExternalStore" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
  ],
};
