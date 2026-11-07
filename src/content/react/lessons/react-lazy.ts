import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-lazy-does",
      heading: "What lazy does",
      paragraphs: [
        "lazy defers loading a component’s code until the first time it is rendered: const SomeComponent = lazy(load). The load function takes no arguments, and it must return a Promise that resolves to an object whose default property is a component.",
        "The dynamic import() syntax returns exactly that, which is why the two appear together. Your bundler or framework splits the imported code into its own file, so users do not download it until they need it. React caches the result, so load is called at most once.",
      ],
      examples: [
        {
          id: "basic-lazy",
          classification: "snippet",
          title: "Declaring a lazy component",
          language: "tsx",
          code: `const MarkdownPreview = lazy(() => import("./markdown-preview"));

export default function Editor({ isPreviewing }: { isPreviewing: boolean }) {
  return (
    <section>
      {isPreviewing && (
        <Suspense fallback={<p>Loading preview…</p>}>
          <MarkdownPreview />
        </Suspense>
      )}
    </section>
  );
}`,
          typecheckContext: { before: `import { lazy, Suspense } from "react";` },
          description: "The preview’s code loads only when someone first turns on preview. The module must have a default export.",
        },
      ],
    },
    {
      id: "suspense-is-required",
      heading: "It suspends while loading",
      paragraphs: [
        "While the code is loading, rendering the lazy component suspends. A Suspense boundary somewhere above shows the fallback in its place. Without a boundary, there is nothing to show during that time.",
        "If the load fails, for example because of a network error or a new deployment removing an old file, React throws the rejection, and the nearest Error Boundary handles it. Plan for that, since a chunk that fails to load is a realistic failure.",
      ],
    },
    {
      id: "what-to-split",
      heading: "Choosing what to split",
      paragraphs: [
        "Code splitting trades a smaller initial download for a delay the first time something appears. It pays off when the code is large and many users never need it. Splitting small components can make things worse, since each one means an extra request and a loading state.",
      ],
      comparison: [
        {
          id: "good-candidates",
          title: "Good candidates",
          items: ["Routes that many users never visit.", "Heavy editors, charts, and maps.", "Dialogs and panels opened rarely."],
        },
        {
          id: "poor-candidates",
          title: "Poor candidates",
          items: ["Content visible when the page first loads.", "Small, cheap components.", "Things nearly every user needs immediately."],
        },
      ],
      closing: "Frameworks often split by route automatically, so check what yours already does before adding lazy calls by hand.",
    },
    {
      id: "avoid-spinners",
      heading: "Avoiding a jarring first load",
      paragraphs: [
        "If a lazy component appears because of an update to something already on screen, a Transition keeps the current content visible while the code loads, rather than replacing it with a fallback. You can also start the import early, for example when someone hovers over a button, so that it is already cached by the time they click.",
      ],
      examples: [
        {
          id: "lazy-transition",
          classification: "snippet",
          title: "Loading a tab in a Transition",
          language: "tsx",
          code: `const ReportTab = lazy(() => import("./report-tab"));

export default function Tabs() {
  const [tab, setTab] = useState("summary");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => startTransition(() => setTab("report"))}>
        Report {isPending && "(Loading…)"}
      </button>
      <Suspense fallback={<p>Loading…</p>}>{tab === "report" ? <ReportTab /> : <p>Summary</p>}</Suspense>
    </>
  );
}`,
          typecheckContext: { before: `import { lazy, Suspense, useState, useTransition } from "react";` },
          description: "The summary stays visible during the load, and the button shows progress instead of the page flashing a fallback.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "lazy-inside-component",
      heading: "Declaring lazy inside a component",
      problem: "A lazy call in a component body creates a new component type on every render, so React resets all of its state each time. It looks as if the component keeps losing its data for no clear reason.",
      correction: "Declare lazy components at the module’s top level.",
    },
    {
      id: "named-export",
      heading: "Lazy-loading a module with only named exports",
      problem: "lazy expects the Promise to resolve to an object with a default property. A module with only named exports gives React no component, and it fails with a confusing error at render time.",
      correction: "Add a default export, or map it, as in import(\"./x\").then(module => ({ default: module.Chart })).",
    },
    {
      id: "no-boundary",
      heading: "Forgetting the Suspense boundary",
      problem: "Rendering a lazy component with no Suspense above it leaves nothing to show during the load. On updates, this can also hide content that was visible until now, which is a jarring experience.",
      correction: "Wrap it, or a parent, in Suspense with a fallback that fits the layout.",
    },
    {
      id: "no-error-boundary",
      heading: "Ignoring failed chunk loads",
      problem: "A deployment can remove old chunks while someone still has the page open, so the import rejects. Without an Error Boundary, that failure can take down the whole tree instead of one panel.",
      correction: "Add an Error Boundary with a message offering to reload.",
    },
    {
      id: "split-everything",
      heading: "Splitting every component",
      problem: "Lazy-loading small components produces many tiny requests and loading states. It can make the page feel slower than a single larger bundle, and the savings are small in exchange.",
      correction: "Split large, rarely used features, and measure your bundle before and after.",
    },
  ],
  interview: [
    {
      id: "rl-what",
      question: "What does React.lazy do?",
      answer: "It defers loading a component’s code until it first renders. It takes a function returning a Promise for a module with a default export, typically a dynamic import. While loading, rendering suspends, and the nearest Suspense boundary shows a fallback.",
    },
    {
      id: "rl-where",
      question: "Why must lazy be declared outside a component?",
      answer: "Inside a component, each render creates a new lazy component, which is a new type, so React resets its state on every re-render. At module level, there is one stable type, and its load Promise and result are cached.",
    },
    {
      id: "rl-benefit",
      question: "What is the tradeoff of code splitting?",
      answer: "A smaller initial download, in exchange for a delay and a loading state on first use. It pays off for large features that many users never need. For small components or immediately visible content, it can make things worse.",
    },
    {
      id: "rl-failure",
      question: "What happens if a lazy component fails to load?",
      answer: "React throws the rejection during rendering, so the nearest Error Boundary handles it. Without one, the whole tree can be removed. A common real cause is a new deployment removing old chunks, so a fallback that offers to reload is useful.",
    },
    {
      id: "rl-transition",
      question: "How do you avoid a fallback flash when loading a lazy tab?",
      answer: "Wrap the state update in a Transition, so React keeps the current content visible while the code loads, and isPending can show progress. Starting the import early, such as on hover, makes the wait shorter still.",
    },
    {
      id: "rl-named",
      question: "How do you use lazy with a named export?",
      answer: "Map the module in the load function: import(\"./charts\").then(module => ({ default: module.Chart })). lazy only reads the default property, so the wrapper gives it the shape it expects. A re-exporting module with a default also works.",
    },
  ],
  takeaways: [
    "lazy loads a component’s code on first render.",
    "Declare it at module level, and wrap it in Suspense.",
    "Handle load failures with an Error Boundary.",
    "Split large, rarely used features, and not everything.",
  ],
  quickReview: {
    definition: "lazy defers loading a component’s code until first render, suspending until the code arrives.",
    keyPoints: [
      "The module needs a default export.",
      "Declare it outside of components.",
      "Results are cached, and load runs at most once.",
      "Transitions avoid hiding visible content during a load.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A lazy declaration",
      language: "tsx",
      code: `const Chart = lazy(() => import("./chart"));`,
      typecheckContext: { before: `import { lazy } from "react";` },
      description: "At module level, this gives one stable component type with cached loading.",
    },
    commonMistakes: [
      "Declaring lazy inside a component.",
      "Forgetting a Suspense boundary.",
      "Having no plan for failed chunk loads.",
    ],
    interviewTrap: "“Can you call lazy inside your component?” Not safely. Each render would create a new type, and the component’s state would reset.",
    takeaway: "Split what is large and rare, and plan for both loading and failure.",
  },
  sources: [
    { label: "lazy reference", href: "https://react.dev/reference/react/lazy" },
    { label: "Suspense reference", href: "https://react.dev/reference/react/Suspense" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
