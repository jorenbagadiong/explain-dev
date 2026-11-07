import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-measure",
      heading: "Why measure first",
      paragraphs: [
        "Intuition about performance is often wrong. A component that looks expensive may be cheap, and the real cost may be something nobody suspected, such as a third-party script. Optimizing without measuring adds complexity, and it may not even touch the actual problem.",
        "A measurement gives you a target and a way to know when you have finished. It also tells you when to stop, because an interaction that already feels instant does not need further work.",
      ],
      visual: {
        heading: "A measure-first loop",
        context: "Each change is checked against the number it was meant to improve.",
        steps: [
          { id: "pick", title: "Pick a real interaction", description: "Choose something users do, that feels slow or matters to them." },
          { id: "baseline", title: "Record a baseline", description: "Use a production build, on realistic conditions, several times." },
          { id: "change", title: "Make one change", description: "Change only one thing, so the result can be attributed to it." },
          { id: "compare", title: "Compare, and keep or revert", description: "If it did not help, undo it, since the complexity is a cost." },
        ],
        note: "Measuring has its own overhead, so compare like with like, and do not over-interpret small differences.",
      },
    },
    {
      id: "realistic-conditions",
      heading: "Measuring under realistic conditions",
      paragraphs: [
        "Your development machine is probably much faster than many of your users’ devices. Numbers from it can hide real problems, and development builds distort them in the other direction.",
      ],
      list: [
        "Use a production build, because development adds extra checks.",
        "Throttle the CPU in browser tools, or test on a mid-range phone.",
        "Use realistic data, because a list of 10 items hides what 10,000 will do.",
        "Repeat each measurement, and look at typical values, since single runs vary.",
      ],
    },
    {
      id: "what-to-measure",
      heading: "What to measure",
      paragraphs: [
        "Measure what people experience. Interaction to Next Paint, a Core Web Vital, covers the delay from a click, tap, or key press until the next frame shows feedback. It considers 200 ms or less to be good, more than 500 ms poor, and it is assessed at the 75th percentile of real page loads.",
        "Field data from real users is the best way to measure this, because it reflects real behavior, and it shows which interactions are slow. Lab results depend on what you happen to test, so they can miss problems.",
      ],
      comparison: [
        {
          id: "lab",
          title: "Lab data",
          items: ["Controlled and repeatable.", "Good for diagnosing a known problem.", "Only covers what you chose to test."],
        },
        {
          id: "field",
          title: "Field data",
          items: ["From real users and devices.", "Shows what actually happens.", "Noisier, and harder to debug directly."],
        },
      ],
    },
    {
      id: "tools",
      heading: "Tools for the job",
      paragraphs: [
        "Start wide, then narrow down. The browser’s Performance panel shows whether time is going to scripting, layout, or paint. If it is React, the Profiler shows which components. For a single calculation, console.time gives a quick answer.",
      ],
      examples: [
        {
          id: "console-time",
          classification: "complete",
          title: "Timing one calculation",
          language: "tsx",
          code: `interface Row {
  id: string;
  score: number;
}

export function rankRows(rows: readonly Row[]) {
  console.time("rankRows");
  const ranked = rows.toSorted((a, b) => b.score - a.score);
  console.timeEnd("rankRows");

  return ranked;
}`,
          description: "This shows whether a calculation is worth caching at all. The docs suggest logging around 1 ms or more as a rough sign, but judge against your own interaction. Remove the logging after measuring.",
        },
        {
          id: "performance-mark",
          classification: "complete",
          title: "Measuring an interaction in code",
          language: "tsx",
          code: `export function measureAsync<T>(name: string, work: () => Promise<T>): Promise<T> {
  performance.mark(name + "-start");

  return work().finally(() => {
    performance.measure(name, name + "-start");
  });
}`,
          description: "The User Timing API places your own labels on the Performance panel’s timeline, next to everything else.",
        },
      ],
    },
    {
      id: "knowing-when-to-stop",
      heading: "Knowing when to stop",
      paragraphs: [
        "Set a goal before you begin, such as keeping a specific interaction under 200 ms on a mid-range device. Then you can tell when you have reached it. Going further usually costs more than it returns, in both complexity and time.",
        "Measure again later too. Performance tends to degrade slowly, one small feature at a time, so an occasional check on important interactions is worth doing.",
      ],
    },
  ],
  mistakes: [
    {
      id: "optimize-by-guess",
      heading: "Optimizing on a hunch",
      problem: "Rewriting a component because it looks slow takes time and adds complexity, and without a measurement, nobody knows whether anything improved. Often the real cost is somewhere else.",
      correction: "Record the interaction first, and let the data choose the target.",
    },
    {
      id: "dev-numbers",
      heading: "Trusting development numbers",
      problem: "Development builds run extra checks, and Strict Mode double-calls components. A component measured at 50 ms in development may be fine in production, so the optimization solves a problem that users never had.",
      correction: "Measure production or profiling builds.",
    },
    {
      id: "fast-laptop",
      heading: "Measuring only on a fast laptop",
      problem: "An interaction that takes 40 ms on a new laptop can take several times that on a mid-range phone. Testing only on your own machine means you may never see what many users experience.",
      correction: "Throttle the CPU, test on real devices, and review field data.",
    },
    {
      id: "many-changes",
      heading: "Changing several things at once",
      problem: "If you add memo, move state, and split a bundle in one go, you cannot tell which one helped. Some might have had no effect, and you keep their complexity with no benefit.",
      correction: "Change one thing, measure, and decide whether to keep it.",
    },
    {
      id: "averages-only",
      heading: "Relying on one run or on averages",
      problem: "A single measurement can be noise, and an average can hide the slow experiences that matter most. A page that is fast for most users but very slow for some can look healthy.",
      correction: "Repeat measurements, and look at higher percentiles such as the 75th.",
    },
  ],
  interview: [
    {
      id: "mp-why",
      question: "Why measure before optimizing?",
      answer: "Intuition is often wrong, and optimization adds complexity. A measurement shows where the time goes, gives a target, and proves whether a change helped. Without it, you can spend effort on something that does not affect the user at all.",
    },
    {
      id: "mp-how",
      question: "How would you approach a report that a page is slow?",
      answer: "Reproduce it with a specific interaction on a production build, with a throttled CPU and realistic data. Record it in the Performance panel to see what dominates. Then change one thing, measure again, and keep it only if it actually helped.",
    },
    {
      id: "mp-inp",
      question: "What is Interaction to Next Paint?",
      answer: "A Core Web Vital measuring how long the page takes to show visual feedback after a click, tap, or key press. Scrolling and hovering are not counted. 200 ms or less is good, and more than 500 ms is poor, assessed at the 75th percentile of page loads.",
    },
    {
      id: "mp-lab-field",
      question: "What is the difference between lab and field data?",
      answer: "Lab data comes from controlled tests, so it is repeatable and good for diagnosis, but it only covers what you test. Field data comes from real users and devices, so it shows the actual experience, including problems you did not think to test.",
    },
    {
      id: "mp-stop",
      question: "How do you decide when performance is good enough?",
      answer: "By setting a target before you begin, based on the interaction and users’ devices, such as under 200 ms on a mid-range phone. Once it is met, further gains tend to cost more than they return. Then monitor, because regressions tend to creep in.",
    },
    {
      id: "mp-dev-why",
      question: "Why is a production build important for measuring?",
      answer: "Development React runs additional checks, and Strict Mode calls components twice, so numbers are inflated and do not reflect the same work. A production build, or a profiling build for React detail, gives a much more truthful picture.",
    },
  ],
  takeaways: [
    "Measure a real interaction before changing anything.",
    "Use production builds, slower devices, and realistic data.",
    "Change one thing at a time, and keep only what helps.",
    "Set a target, so you know when to stop.",
  ],
  quickReview: {
    definition: "Measuring before optimizing means finding where time really goes on a real interaction, then proving that each change helped.",
    keyPoints: [
      "Production build, throttled CPU, realistic data.",
      "INP: 200 ms or less is good.",
      "Field data shows what users actually experience.",
      "Revert changes that do not help.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Timing a calculation",
      language: "tsx",
      code: `console.time("filter");
const visible = items.filter(isVisible);
console.timeEnd("filter");`,
      typecheckContext: { before: "declare const items: readonly string[];\ndeclare const isVisible: (item: string) => boolean;" },
      description: "A quick check on whether a calculation is worth caching.",
    },
    commonMistakes: [
      "Optimizing without a baseline.",
      "Trusting numbers from a development build.",
      "Changing several things at once.",
    ],
    interviewTrap: "“It took 100 ms in dev, so we need to fix it, right?” Not necessarily. Development builds inflate timings, so measure a production build first.",
    takeaway: "No baseline means no proof, so measure, change one thing, and measure again.",
  },
  sources: [
    { label: "web.dev: Interaction to Next Paint", href: "https://web.dev/articles/inp" },
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
    { label: "Profiler reference", href: "https://react.dev/reference/react/Profiler" },
    { label: "React Performance tracks", href: "https://react.dev/reference/dev-tools/react-performance-tracks" },
  ],
};
