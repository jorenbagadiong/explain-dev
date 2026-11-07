import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "urgent-and-not",
      heading: "Urgent updates and everything else",
      paragraphs: [
        "Not all updates are equally urgent. Typing, clicking, and pressing need a response now, because people notice any delay. Updating a large list of results can wait a moment, as long as the page stays responsive.",
        "React lets you say which is which. An update inside startTransition is marked as non-urgent, so React can render it in the background, and it can interrupt that work if something more urgent arrives.",
      ],
      comparison: [
        {
          id: "urgent",
          title: "Urgent updates",
          items: ["Typing into an input.", "Clicking, pressing, or toggling.", "Blocking until finished by default."],
        },
        {
          id: "transition",
          title: "Transition updates",
          items: ["Switching tabs or pages.", "Filtering a large list.", "Interruptible, and they keep the page responsive."],
        },
      ],
    },
    {
      id: "how-interruption-works",
      heading: "How interruption works",
      paragraphs: [
        "If a user types while a chart re-renders in a Transition, React handles the typing first, and then restarts the chart render with the latest data. Abandoned work never reaches the screen, because React only commits a finished result. That is one reason why rendering has to stay pure.",
      ],
      visual: {
        heading: "An urgent update arriving during a Transition",
        context: "This follows a slow tab render, interrupted by a click on a different tab.",
        steps: [
          { id: "start", title: "Transition begins", description: "React starts rendering the slow tab in the background." },
          { id: "urgent-arrives", title: "A click arrives", description: "React pauses its background work, and handles the click." },
          { id: "discard", title: "Old work is discarded", description: "The first tab’s partial render is thrown away, with no effect on the screen." },
          { id: "finish", title: "The latest result commits", description: "React finishes rendering the tab that was chosen last." },
        ],
        note: "This is simplified. Whether React pauses or restarts at a given point is an implementation detail, and multiple Transitions are currently batched together.",
      },
    },
    {
      id: "two-entry-points",
      heading: "Two ways to start one",
      paragraphs: [
        "useTransition provides isPending, for showing progress, along with startTransition. A standalone startTransition, imported from react, is available outside components, for example in a data library, but gives no pending flag.",
      ],
      examples: [
        {
          id: "filter-transition",
          classification: "complete",
          title: "Keeping a filter responsive",
          language: "tsx",
          code: `import { useState, useTransition } from "react";

const allItems = Array.from({ length: 5000 }, (_, index) => "Item " + index);

export default function Filter() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const results = allItems.filter(item => item.includes(query));

  return (
    <>
      <label>
        Filter
        <input
          value={text}
          onChange={event => {
            setText(event.target.value);
            startTransition(() => setQuery(event.target.value));
          }}
        />
      </label>
      <p role="status">{isPending ? "Updating…" : results.length + " results"}</p>
      <ul>
        {results.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}`,
          description: "The input’s own state stays urgent, because Transitions cannot control a text input. The results update in the background.",
        },
      ],
    },
    {
      id: "navigation",
      heading: "Transitions and navigation",
      paragraphs: [
        "Transitions change what Suspense does. During a Transition, React waits rather than hiding content that has already been revealed. So a page stays on screen while the next one loads, with a pending state on the link. Routers commonly wrap navigation in Transitions for this reason.",
        "Content that has never been shown still displays its fallback, so a new screen can begin with its own skeleton.",
      ],
    },
    {
      id: "limits",
      heading: "What Transitions do not do",
      paragraphs: ["Transitions help with responsiveness only, and a few limits are worth knowing."],
      list: [
        "They do not make rendering faster, since the same work still has to happen.",
        "They cannot control text inputs, which must update synchronously.",
        "They only mark updates made synchronously in the function, so updates after await or in setTimeout need their own startTransition.",
        "They do not help with blocking work in event handlers or Effects, only with rendering.",
      ],
    },
  ],
  mistakes: [
    {
      id: "input-in-transition",
      heading: "Marking a controlled input’s update as a Transition",
      problem: "startTransition(() => setText(value)) is an attempt to make typing smooth, but the input’s value must update synchronously, so it cannot be controlled this way, and characters may be lost.",
      correction: "Keep the input’s state urgent, and use a Transition for what depends on it.",
    },
    {
      id: "not-faster",
      heading: "Expecting Transitions to speed up rendering",
      problem: "A slow list wrapped in a Transition takes just as long. The page stays responsive, but the result arrives no sooner, so a real rendering problem is hidden rather than solved.",
      correction: "Use a Transition for responsiveness, and optimize slow rendering separately.",
    },
    {
      id: "side-effects-render",
      heading: "Having side effects during rendering",
      problem: "Because a Transition’s render can be abandoned or restarted, a side effect in the component body may run for work that never appears. Sending a request there can fire repeatedly, for results nobody sees.",
      correction: "Keep rendering pure, and put side effects in Effects or event handlers.",
    },
    {
      id: "blocking-handler",
      heading: "Doing heavy work in the handler",
      problem: "A Transition only makes React’s rendering interruptible. A long synchronous loop inside the event handler still blocks the main thread, whichever way the state update is marked.",
      correction: "Move heavy calculations out of the handler, for example by splitting the work or using a Web Worker.",
    },
    {
      id: "no-pending-ui",
      heading: "Showing nothing during a slow Transition",
      problem: "A Transition keeps old content on screen, so with no indication, it can look as if a click did nothing. People may click again, or assume that the page has frozen.",
      correction: "Use isPending to show progress near the element that started the update.",
    },
  ],
  interview: [
    {
      id: "tr-what",
      question: "What is a Transition in React?",
      answer: "An update marked as non-urgent. React can render it in the background and interrupt it for urgent updates such as typing, and it only commits a finished result. This keeps the page responsive during expensive updates.",
    },
    {
      id: "tr-priority",
      question: "How does React decide what to work on first?",
      answer: "Urgent updates, such as those from clicks and typing, take priority over Transition updates. If an urgent update arrives, React handles it first, and it restarts the Transition’s render with the latest state. You mark priority by using startTransition.",
    },
    {
      id: "tr-pure",
      question: "Why do Transitions require rendering to be pure?",
      answer: "A Transition’s render may be interrupted, restarted, or abandoned, so the component may be called with no visible result. Side effects during rendering would then fire for work that never reaches the screen, or more often than expected.",
    },
    {
      id: "tr-limit",
      question: "What can’t Transitions fix?",
      answer: "They do not make rendering faster, and they do not help with long synchronous work in event handlers or Effects. Text inputs must stay urgent as well. They only change how React schedules rendering, so slow code still needs optimizing.",
    },
    {
      id: "tr-routing",
      question: "Why do routers use Transitions for navigation?",
      answer: "Without one, navigating to a page that suspends hides the current page behind a fallback. A Transition keeps the current page visible until the next is ready, while isPending can show progress. New boundaries still show their own fallbacks.",
    },
    {
      id: "tr-vs-debounce",
      question: "How do Transitions differ from debouncing a filter?",
      answer: "Debouncing delays the update by a fixed time, even on a fast device. A Transition starts right away, and it yields when something urgent arrives, so it adapts to the device. Debouncing can still help reduce network requests, which Transitions do not.",
    },
  ],
  takeaways: [
    "Transitions mark updates as interruptible and non-urgent.",
    "Urgent updates such as typing go first.",
    "Abandoned renders never reach the screen, so rendering must stay pure.",
    "Transitions improve responsiveness, and they do not reduce the work.",
  ],
  quickReview: {
    definition: "A Transition marks a state update as non-urgent, so React can render it in the background and interrupt it.",
    keyPoints: [
      "useTransition adds isPending, and standalone startTransition does not.",
      "Text inputs must stay outside Transitions.",
      "Visible content stays on screen during navigation.",
      "Rendering may be restarted or thrown away.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Marking an update",
      language: "tsx",
      code: `startTransition(() => {
  setQuery(nextQuery);
});`,
      typecheckContext: { before: `import { startTransition } from "react";\ndeclare const nextQuery: string;\ndeclare const setQuery: (value: string) => void;` },
      description: "The update can now be interrupted by more urgent work.",
    },
    commonMistakes: [
      "Wrapping a controlled input’s own state.",
      "Expecting slow rendering to become faster.",
      "Showing no progress during a slow Transition.",
    ],
    interviewTrap: "“Does a Transition run its function later?” No. The function runs immediately, and what changes is how React schedules the rendering it causes.",
    takeaway: "Tell React what can wait, so that it never makes an interaction wait.",
  },
  sources: [
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
    { label: "Suspense reference", href: "https://react.dev/reference/react/Suspense" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
  ],
};
