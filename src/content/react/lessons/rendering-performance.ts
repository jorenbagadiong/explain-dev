import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "two-kinds-of-cost",
      heading: "React’s work and the browser’s work",
      paragraphs: [
        "When a page feels slow, the cause may be React rendering components, or it may be the browser doing layout and paint. These are separate costs with separate fixes, and improving the wrong one does nothing.",
        "React’s rendering runs your component functions and compares the output. The browser then takes the resulting DOM changes through its pipeline: recalculating styles, computing layout, painting pixels, and compositing layers.",
      ],
      visual: {
        heading: "From update to pixels",
        context: "The first two steps are React’s, and the rest belong to the browser.",
        steps: [
          { id: "render", title: "React renders", description: "Components run, and output is compared with the previous result." },
          { id: "commit", title: "React commits", description: "Necessary DOM changes are applied." },
          { id: "style-layout", title: "Style and layout", description: "The browser works out styles, then size and position." },
          { id: "paint-composite", title: "Paint and composite", description: "Pixels are drawn on layers, and the layers are combined." },
        ],
        note: "Not every update reaches every stage. If a commit changes nothing, the browser has nothing new to do, and compositor-only changes skip layout and paint.",
      },
    },
    {
      id: "frame-budget",
      heading: "The frame budget",
      paragraphs: [
        "A 60 Hz display refreshes about every 16.66 ms, and the browser has its own overhead, so your work has around 10 ms per frame to avoid dropped frames during animation. For responses to input, the question is how quickly the next frame appears. Interaction to Next Paint, a Core Web Vital, considers 200 ms or less to be good.",
        "Rendering that takes 100 ms is invisible when someone changes a page, but it is very noticeable if it happens on each keystroke. Context decides what is too slow.",
      ],
    },
    {
      id: "what-makes-rendering-slow",
      heading: "What makes React rendering slow",
      paragraphs: [
        "A single component is rarely slow on its own. Slowness usually comes from one of a few patterns.",
      ],
      list: [
        "A heavy calculation running on every render.",
        "A large tree rendered for a small change, because state sits too high.",
        "Long lists with thousands of rows.",
        "Frequent updates, such as on each pointer move or scroll event, driving large trees.",
      ],
      examples: [
        {
          id: "state-position",
          classification: "complete",
          title: "Limiting what an update touches",
          language: "tsx",
          code: `import { useState } from "react";

function ExpensiveReport() {
  return <section>Report with many rows</section>;
}

function PointerBadge() {
  const [x, setX] = useState(0);

  return (
    <div onPointerMove={event => setX(event.clientX)}>
      Pointer at {x}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PointerBadge />
      <ExpensiveReport />
    </>
  );
}`,
          description: "Moving the state into PointerBadge means ExpensiveReport does not render on each pointer move, with no memoization involved.",
        },
      ],
    },
    {
      id: "browser-costs",
      heading: "What makes the browser slow",
      paragraphs: [
        "If rendering is fast but interactions still lag, look at the browser. Layout is often the expensive stage, since a change to one element’s geometry can affect others. Reading layout right after writing to it, repeatedly in a loop, forces repeated recalculation, which is known as layout thrashing.",
        "For animation, properties handled by the compositor are cheapest, because they skip layout and paint. Animating width or top triggers layout on each frame, whereas transform usually does not.",
      ],
      examples: [
        {
          id: "transform-animation",
          classification: "complete",
          title: "Moving an element without layout",
          language: "tsx",
          code: `export default function Drawer({ isOpen }: { isOpen: boolean }) {
  return (
    <aside
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 200ms",
      }}
    >
      Navigation
    </aside>
  );
}`,
          description: "React only sets the style when isOpen changes, then the browser animates transform on the compositor. A real drawer also respects reduced motion and manages focus.",
        },
      ],
    },
    {
      id: "finding-out",
      heading: "Finding out which one it is",
      paragraphs: [
        "Different tools answer different questions. Use a production build, since development builds of React are much slower and can mislead you. A slower CPU setting in browser tools helps too, since your machine is probably faster than many users’ devices.",
      ],
      comparison: [
        {
          id: "react-tools",
          title: "React DevTools Profiler",
          items: ["Shows which components rendered, and how long each took.", "Shows why each rendered.", "Does not show layout or paint."],
        },
        {
          id: "browser-tools",
          title: "Browser Performance panel",
          items: ["Shows scripting, layout, paint, and long tasks.", "Reveals dropped frames.", "Shows the whole page, not only React."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "wrong-layer",
      heading: "Optimizing React when the browser is the bottleneck",
      problem: "Adding memo throughout an app does not help if the cost is layout from a huge DOM or an expensive CSS effect. Time goes into complex code, and the interaction feels just as slow.",
      correction: "Record in the browser’s Performance panel first, and see where the time actually goes.",
    },
    {
      id: "dev-measurement",
      heading: "Measuring in development mode",
      problem: "React’s development build is much slower, and Strict Mode adds double calls. A problem seen only there might not exist for users, and real ones may be hidden behind that extra cost.",
      correction: "Measure a production build, ideally with CPU throttling.",
    },
    {
      id: "layout-thrash",
      heading: "Reading layout in a loop after writing",
      problem: "Setting a style and then reading offsetHeight for each item forces the browser to recalculate layout each time, because it must give an accurate answer. A list of items can then cost far more than expected.",
      correction: "Read everything first, then write everything, in separate batches.",
    },
    {
      id: "animate-layout",
      heading: "Animating properties that trigger layout",
      problem: "Animating width, height, or top makes the browser recalculate layout on each frame. It may look fine on a fast laptop, and be visibly choppy on a mid-range phone.",
      correction: "Prefer transform and opacity for animation where possible.",
    },
    {
      id: "fast-machine",
      heading: "Testing only on a fast machine",
      problem: "A developer’s laptop can hide problems that dominate on a mid-range phone. Interactions that take 30 ms for you could take hundreds for someone else, and you would never see it.",
      correction: "Use CPU throttling, test on real devices, and watch field data if you have it.",
    },
  ],
  interview: [
    {
      id: "rp-diff",
      question: "How does React’s rendering differ from browser rendering?",
      answer: "React’s rendering runs components and compares output to decide on DOM changes. Browser rendering then computes styles and layout, paints pixels, and composites layers. A slow page could be either, and the fix depends on which one it is.",
    },
    {
      id: "rp-diagnose",
      question: "How would you diagnose a slow interaction?",
      answer: "Reproduce it on a production build with CPU throttling, and record it in the browser’s Performance panel to see whether it is scripting, layout, or paint. If it is scripting in React, use the DevTools Profiler to find which components are responsible.",
    },
    {
      id: "rp-budget",
      question: "What is the frame budget?",
      answer: "At 60 Hz, a frame lasts about 16.66 ms, and the browser needs some of that, so your work has about 10 ms for smooth animation. For responses to input, Interaction to Next Paint treats 200 ms or less as good.",
    },
    {
      id: "rp-thrash",
      question: "What is layout thrashing?",
      answer: "Repeatedly writing to the DOM and then reading layout, such as in a loop. Each read forces the browser to recalculate layout before returning. Batching reads first and writes afterward avoids it, and React’s commit naturally batches its DOM writes.",
    },
    {
      id: "rp-animation",
      question: "Why prefer transform and opacity for animations?",
      answer: "They can usually be handled by the compositor, without layout or paint, so they stay smooth even when the main thread is busy. Animating width or top triggers layout each frame, which is much more expensive.",
    },
    {
      id: "rp-dev-build",
      question: "Why shouldn’t you measure performance in development mode?",
      answer: "Development builds include extra checks, and Strict Mode calls components twice, so timings are inflated and distorted. A production build, with profiling where needed and throttled CPU, gives you numbers closer to what real users experience.",
    },
  ],
  takeaways: [
    "React’s work and the browser’s work are separate costs.",
    "Find out which one is slow before fixing anything.",
    "State placement limits how much React does.",
    "Measure production builds, on slower devices.",
  ],
  quickReview: {
    definition: "Rendering performance covers React’s work of calculating updates, and the browser’s work of turning them into pixels.",
    keyPoints: [
      "Browser pipeline: style, layout, paint, composite.",
      "About 10 ms per frame for smooth animation.",
      "Use the Profiler for React, and the Performance panel for everything.",
      "Compositor properties skip layout and paint.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Avoiding layout thrashing",
      language: "tsx",
      code: `const heights = items.map(item => item.offsetHeight);
items.forEach((item, index) => {
  item.style.height = heights[index] + 8 + "px";
});`,
      typecheckContext: { before: "declare const items: readonly HTMLElement[];" },
      description: "All reads happen first, then all writes, so layout is not recalculated each time.",
    },
    commonMistakes: [
      "Adding memo when layout is the real cost.",
      "Measuring only in development mode.",
      "Testing only on a fast machine.",
    ],
    interviewTrap: "“Will memoizing components fix a janky animation?” Probably not, if the cost is layout or paint. Measure first, and animate transform instead.",
    takeaway: "Before optimizing, find out whose work is slow.",
  },
  sources: [
    { label: "web.dev: Rendering performance", href: "https://web.dev/articles/rendering-performance" },
    { label: "web.dev: Interaction to Next Paint", href: "https://web.dev/articles/inp" },
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "Profiler reference", href: "https://react.dev/reference/react/Profiler" },
  ],
};
