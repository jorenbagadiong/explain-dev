import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "getting-devtools",
      heading: "Getting React Developer Tools",
      paragraphs: [
        "React Developer Tools is a browser extension for Chrome, Firefox, and Edge. Once installed, sites built with React show Components and Profiler panels in the browser’s tools. Safari and other browsers can use the standalone react-devtools package, and React Native has its own built-in integration.",
        "The Components panel inspects the tree, along with props and state. The Profiler panel records rendering work, and it is the place to start when an interaction feels slow.",
      ],
    },
    {
      id: "recording",
      heading: "Recording an interaction",
      paragraphs: [
        "A recording captures each commit during an interaction, showing which components rendered and how long they took. Keep recordings short and focused on one action, since a long recording makes it hard to see what caused what.",
      ],
      visual: {
        heading: "A simple profiling session",
        context: "This assumes you have a specific interaction that feels slow.",
        steps: [
          { id: "start", title: "Start recording", description: "Begin in the Profiler panel, right before the interaction." },
          { id: "act", title: "Perform the interaction once", description: "Type a character, or open the panel. Keep it small." },
          { id: "stop", title: "Stop, and look at commits", description: "Look for commits that took a long time." },
          { id: "inspect", title: "Inspect the expensive components", description: "See which rendered, how long they took, and why." },
        ],
        note: "Development builds are slower than production. Use this to find relative costs, and then confirm with a profiling or production build.",
      },
    },
    {
      id: "reading-the-results",
      heading: "Reading the results",
      paragraphs: [
        "Each bar in the recording’s flame chart is a component, and wider means more time spent. Look for what is unexpectedly wide, and for components that rendered when you would not have expected them to. The Profiler can also record why each component rendered, which you enable in its settings.",
        "Note that a render showing up does not mean there is a problem. The question is whether the time it took matters for that interaction.",
      ],
      list: [
        "A wide component suggests expensive rendering or a large subtree below it.",
        "Many narrow components that all render suggest state too high in the tree.",
        "A component that rendered for no apparent reason may be getting new props, or reading a changing context.",
      ],
    },
    {
      id: "performance-panel",
      heading: "React tracks in the browser’s Performance panel",
      paragraphs: [
        "In browsers with the required extensibility APIs, such as Chrome, recording in the Performance panel also shows React Performance tracks. They place React’s scheduling, render, and commit phases on a timeline alongside network requests and other JavaScript, which shows how React’s work fits with everything else.",
        "They are available in development and profiling builds only, as production builds exclude them because of the overhead.",
      ],
    },
    {
      id: "profiler-component",
      heading: "The Profiler component",
      paragraphs: [
        "React also has a Profiler component for measuring rendering in code. It takes an id and an onRender callback, which React calls each time components in that tree update. It suits collecting numbers over time, which a manual DevTools recording cannot do.",
        "Profiling is disabled in production builds by default, because it adds overhead. To measure there, you need a special profiling build. Each Profiler adds some CPU and memory cost, so use it only where needed.",
      ],
      examples: [
        {
          id: "profiler-usage",
          classification: "complete",
          title: "Measuring a subtree in code",
          language: "tsx",
          code: `import { Profiler, type ProfilerOnRenderCallback } from "react";

const handleRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  console.log({ id, phase, actualDuration, baseDuration });
};

function Dashboard() {
  return <p>Dashboard</p>;
}

export default function App() {
  return (
    <Profiler id="dashboard" onRender={handleRender}>
      <Dashboard />
    </Profiler>
  );
}`,
          description: "actualDuration is the time spent on this update. baseDuration estimates re-rendering the whole subtree without optimizations. If the first is well below the second, memoization is helping.",
        },
      ],
      closing: "phase says mount, update, or nested-update. startTime and commitTime are also available, and all profilers in one commit share the same commitTime.",
    },
  ],
  mistakes: [
    {
      id: "profile-dev-only",
      heading: "Treating development timings as real numbers",
      problem: "Development builds include extra checks, so a 40 ms render might be far less in production. Reporting those numbers as actual costs can send you after a problem that users never have.",
      correction: "Use development profiling to compare, then confirm with a profiling or production build.",
    },
    {
      id: "long-recordings",
      heading: "Recording long sessions",
      problem: "A minute of clicking produces many commits with no clear link to any action. Finding the cause becomes guesswork, and the important commit can be lost among everything else.",
      correction: "Record one small interaction at a time.",
    },
    {
      id: "chasing-renders",
      heading: "Treating every render in the chart as a bug",
      problem: "Seeing many bars creates an urge to remove them all. Many will be cheap, so preventing them adds memoization that saves no time you could actually feel.",
      correction: "Focus on the wide bars, and on commits that take long enough to matter.",
    },
    {
      id: "profiler-production",
      heading: "Leaving Profiler in production and expecting data",
      problem: "Profiler’s callback does not produce data in a standard production build, since profiling is disabled there by default. Teams may believe they are collecting metrics, when nothing is arriving.",
      correction: "Use a profiling build where you need this, and check your framework’s documentation.",
    },
    {
      id: "ignoring-browser",
      heading: "Only looking at React’s tools",
      problem: "The Profiler shows only React’s work. If an interaction’s cost is layout, paint, or a third-party script, the chart may look fine while the page still feels slow, and you may stop looking.",
      correction: "Also record in the browser’s Performance panel.",
    },
  ],
  interview: [
    {
      id: "pr-what",
      question: "What does the React DevTools Profiler show?",
      answer: "For a recorded interaction, it shows each commit, the components that rendered, how long each took, and, when enabled, why each rendered. It helps you find expensive components and unnecessary work, and it covers only React’s rendering.",
    },
    {
      id: "pr-approach",
      question: "How would you use the Profiler to investigate a slow interaction?",
      answer: "Record just that interaction, look for the commits that took longest, then find the widest components and check why they rendered. Often the fix is moving state or memoizing one expensive part. Then I would record again to confirm the improvement.",
    },
    {
      id: "pr-actual-base",
      question: "What is the difference between actualDuration and baseDuration?",
      answer: "actualDuration is the time spent rendering this update. baseDuration estimates how long re-rendering the whole subtree would take without optimizations. Comparing them shows whether memoization is helping, since actual should be well below base after the first render.",
    },
    {
      id: "pr-prod",
      question: "Can you profile a production build?",
      answer: "Not with a standard production build, since profiling is disabled for its overhead. A special profiling build, using react-dom/profiling, enables it, and some frameworks have built-in support. Development builds work too, but they inflate the timings.",
    },
    {
      id: "pr-vs-performance",
      question: "When would you use the browser’s Performance panel rather than the Profiler?",
      answer: "When the cause might not be React, such as layout, paint, or other scripts. It shows the whole picture for the main thread, and React Performance tracks can place React’s phases on that timeline. I often start there, then use the Profiler for details.",
    },
  ],
  takeaways: [
    "Record one small interaction at a time.",
    "Look for wide bars and unexpected renders.",
    "Compare in development, and confirm with a profiling or production build.",
    "The Profiler shows only React’s work, so check the browser’s tools as well.",
  ],
  quickReview: {
    definition: "The React DevTools Profiler records which components rendered during an interaction, how long they took, and why.",
    keyPoints: [
      "It requires development or a profiling build.",
      "The Profiler component measures in code.",
      "actualDuration can be compared with baseDuration.",
      "It does not show layout or paint.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "The Profiler component",
      language: "tsx",
      code: `<Profiler id="app" onRender={handleRender}>
  <App />
</Profiler>`,
      typecheckContext: { before: `import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";\ndeclare const handleRender: ProfilerOnRenderCallback;\ndeclare function App(): ReactNode;\nexport const element = (`, after: ");" },
      description: "React calls handleRender with timings each time something in this tree updates.",
    },
    commonMistakes: [
      "Treating development timings as real numbers.",
      "Trying to remove every render shown.",
      "Stopping at the Profiler when the browser is the real cost.",
    ],
    interviewTrap: "“Does the Profiler work in a normal production build?” No. Profiling is disabled by default, and it needs a profiling build.",
    takeaway: "Let measurements choose what you fix, and record again to confirm that you fixed it.",
  },
  sources: [
    { label: "Profiler reference", href: "https://react.dev/reference/react/Profiler" },
    { label: "React Developer Tools", href: "https://react.dev/learn/react-developer-tools" },
    { label: "React Performance tracks", href: "https://react.dev/reference/dev-tools/react-performance-tracks" },
  ],
};
