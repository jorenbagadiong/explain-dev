import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-suspense-does",
      heading: "What Suspense does",
      paragraphs: [
        "Suspense lets you show a fallback while something inside it is not ready: <Suspense fallback={<Loading />}>…</Suspense>. If a child suspends during rendering, React shows the closest boundary’s fallback in its place, then retries when the data is ready.",
        "It lets a component assume its data is available, with loading handled declaratively by a parent. It does not fetch anything by itself, however, and this is the most misunderstood part.",
      ],
    },
    {
      id: "what-activates-it",
      heading: "Only Suspense-enabled sources activate it",
      paragraphs: [
        "A boundary only reacts to sources that integrate with Suspense. Fetching inside an Effect or an event handler does not activate it. The fallback never shows, and the content simply stays empty until the data arrives.",
      ],
      comparison: [
        {
          id: "activates",
          title: "Activates a boundary",
          items: ["lazy for component code.", "use with a cached Promise.", "Data from a Suspense-enabled framework, or Server Components.", "A stylesheet with a precedence prop, while it loads."],
        },
        {
          id: "does-not",
          title: "Does not activate it",
          items: ["fetch inside useEffect.", "Requests started in event handlers.", "An ordinary loading state you manage yourself."],
        },
      ],
      examples: [
        {
          id: "use-promise",
          classification: "client",
          title: "Suspending on a cached Promise",
          language: "tsx",
          code: `"use client";

import { Suspense, use } from "react";

function Albums({ albumsPromise }: { albumsPromise: Promise<readonly string[]> }) {
  const albums = use(albumsPromise);

  return (
    <ul>
      {albums.map(album => (
        <li key={album}>{album}</li>
      ))}
    </ul>
  );
}

export default function ArtistPage({ albumsPromise }: { albumsPromise: Promise<readonly string[]> }) {
  return (
    <Suspense fallback={<p>Loading albums…</p>}>
      <Albums albumsPromise={albumsPromise} />
    </Suspense>
  );
}`,
          description: "The Promise is created outside this component and passed in, because one created during rendering is not stable across retries. A framework or caching library normally provides it.",
        },
      ],
    },
    {
      id: "reveal-units",
      heading: "Boundaries define what appears together",
      paragraphs: [
        "Everything inside one boundary is a single unit. If any child suspends, all of them show the fallback, and then they all appear together. Nesting boundaries creates a sequence instead, in which each fallback is replaced as its own content becomes available.",
        "React throttles reveals, showing suspended content at most once every 300 ms, so that boundaries becoming ready within that window appear together. Boundaries should match the loading sequence you want people to see, so do not wrap every component.",
      ],
      examples: [
        {
          id: "nested-boundaries",
          classification: "client",
          title: "A deliberate loading sequence",
          language: "tsx",
          code: `"use client";

import { Suspense, use } from "react";

function Biography({ dataPromise }: { dataPromise: Promise<string> }) {
  return <p>{use(dataPromise)}</p>;
}

function Albums({ dataPromise }: { dataPromise: Promise<string> }) {
  return <p>{use(dataPromise)}</p>;
}

export default function Artist({ bioPromise, albumsPromise }: { bioPromise: Promise<string>; albumsPromise: Promise<string> }) {
  return (
    <Suspense fallback={<p>Loading artist…</p>}>
      <Biography dataPromise={bioPromise} />
      <Suspense fallback={<p>Loading albums…</p>}>
        <Albums dataPromise={albumsPromise} />
      </Suspense>
    </Suspense>
  );
}`,
          description: "The biography appears first, and the albums follow with their own placeholder.",
        },
      ],
    },
    {
      id: "already-visible",
      heading: "Content that has already appeared",
      paragraphs: [
        "If visible content suspends again, the boundary shows its fallback, replacing what the user could see. That can be jarring. Updates caused by startTransition or useDeferredValue are the exception, since they keep the current content visible while the new content loads.",
        "React cleans up layout Effects in hidden content, and it fires them again when the content returns. React also does not keep state for a tree that suspended before first mounting, so it retries from scratch once ready.",
      ],
      list: [
        "To keep content visible during an update, use a Transition.",
        "To show stale results while typing, use useDeferredValue.",
        "To show the fallback on purpose for new content, change the boundary’s key.",
      ],
    },
    {
      id: "server-rendering",
      heading: "With server rendering",
      paragraphs: [
        "Suspense also defines what can be streamed. During server rendering, a component that suspends lets React send the fallback first, and the content afterward. If a component throws on the server, React does not abort: it sends the closest boundary’s fallback in the HTML, and retries on the client.",
        "If the client also fails, the error goes to the nearest Error Boundary. If it succeeds, the user sees no error at all.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effect-fetch",
      heading: "Expecting Suspense to work with useEffect fetching",
      problem: "Wrapping a component that fetches in useEffect shows no fallback, because Suspense cannot see that request. The component renders empty and fills in later, while the loading UI never appears.",
      correction: "Use a Suspense-enabled source, such as framework data, or use with a cached Promise.",
    },
    {
      id: "promise-in-render",
      heading: "Creating the Promise during rendering",
      problem: "use(fetch(url)) in a component creates a new Promise on each render. Each retry then suspends on another new Promise, which can loop forever, and React reports an uncached promise problem.",
      correction: "Create the Promise outside the component, or use a library or framework that caches it.",
    },
    {
      id: "boundary-everywhere",
      heading: "Wrapping every component in a boundary",
      problem: "A boundary around each small part causes many spinners, popping in at different times. The page keeps rearranging as it loads, which is harder to follow than one coherent loading state.",
      correction: "Place boundaries around units that make sense to appear together.",
    },
    {
      id: "fallback-replaces-content",
      heading: "Letting visible content be replaced by a fallback",
      problem: "A tab change that suspends can replace the whole page with a spinner, even though the old content was perfectly usable. People lose their context for what might be a short wait.",
      correction: "Wrap the update in a Transition, which keeps existing content visible.",
    },
    {
      id: "suspense-catches-errors",
      heading: "Expecting Suspense to handle errors",
      problem: "A rejected Promise is not a loading state. Suspense does not show its fallback for it, so with no Error Boundary, the error propagates up and can remove the tree.",
      correction: "Pair Suspense with an Error Boundary around the same area.",
    },
  ],
  interview: [
    {
      id: "rs-what",
      question: "What does Suspense do?",
      answer: "It shows a fallback while something inside it is not ready to render, then reveals the content when it is. It lets components read data as if it were available, with the loading UI declared by a parent. It does not fetch data itself.",
    },
    {
      id: "rs-activate",
      question: "Does Suspense work with any data fetching?",
      answer: "No. Only Suspense-enabled sources activate it: lazy, use with a cached Promise, and framework data sources. A fetch inside useEffect or an event handler does not, so the fallback never appears. You would manage that loading state yourself.",
    },
    {
      id: "rs-nesting",
      question: "How do nested Suspense boundaries behave?",
      answer: "Each creates a step in a loading sequence. An outer boundary’s content appears first, and an inner fallback shows until its part is ready. Everything inside one boundary appears together. React also throttles reveals, so close-together content appears as one.",
    },
    {
      id: "rs-update-hide",
      question: "What happens when already visible content suspends again?",
      answer: "The boundary shows its fallback, unless the update came from startTransition or useDeferredValue, which keep existing content visible. That is why routers wrap navigation in Transitions. Changing the boundary’s key is how you deliberately show the fallback for new content.",
    },
    {
      id: "rs-server",
      question: "How does Suspense relate to streaming server rendering?",
      answer: "Boundaries define what can arrive later. React can send a fallback in the initial HTML, then stream the content when it is ready. If a component throws on the server, the fallback is sent, and React retries on the client, so a transient server error may never be visible.",
    },
    {
      id: "rs-errors",
      question: "How do Suspense and Error Boundaries relate?",
      answer: "Suspense handles the waiting, and Error Boundaries handle the failure. A rejected Promise goes to the nearest Error Boundary, not to the fallback. In practice, you often place both around the same region, so each state has a suitable UI.",
    },
    {
      id: "rs-state",
      question: "Does React preserve state for a tree that suspends on first render?",
      answer: "No. If a tree suspends before it has mounted, React does not keep its state, and it retries from scratch once ready. This is why a Promise created inside that tree would be re-created on each retry, unless something outside caches it.",
    },
  ],
  takeaways: [
    "Suspense shows a fallback while children are not ready.",
    "Only Suspense-enabled sources activate it, and useEffect fetching does not.",
    "Boundaries define what appears together, so place them deliberately.",
    "Transitions and useDeferredValue keep visible content from being replaced.",
  ],
  quickReview: {
    definition: "Suspense declares a fallback to show while a descendant is suspended by a supported source, such as lazy code or a cached Promise.",
    keyPoints: [
      "It does not fetch anything itself.",
      "Fetching in Effects does not activate it.",
      "Nesting creates a loading sequence.",
      "Errors go to Error Boundaries, not fallbacks.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A boundary",
      language: "tsx",
      code: `<Suspense fallback={<p>Loading…</p>}>
  <Profile />
</Suspense>`,
      typecheckContext: { before: `import { Suspense, type ReactNode } from "react";\ndeclare function Profile(): ReactNode;\nexport const element = (`, after: ");" },
      description: "The paragraph shows only if Profile suspends through a supported source.",
    },
    commonMistakes: [
      "Expecting a fallback from fetching in useEffect.",
      "Creating the Promise during rendering.",
      "Wrapping every small component in a boundary.",
    ],
    interviewTrap: "“Will Suspense show a spinner for my useEffect fetch?” No. It cannot see that request, so the fallback never appears.",
    takeaway: "Suspense coordinates waiting, while something else has to provide the data.",
  },
  sources: [
    { label: "Suspense reference", href: "https://react.dev/reference/react/Suspense" },
    { label: "lazy reference", href: "https://react.dev/reference/react/lazy" },
    { label: "React 19 release notes", href: "https://react.dev/blog/2024/12/05/react-19" },
    { label: "useDeferredValue reference", href: "https://react.dev/reference/react/useDeferredValue" },
  ],
};
