import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-is",
      heading: "What the React Compiler is",
      paragraphs: [
        "React Compiler is a build-time tool that automatically optimizes your components. It understands the Rules of React and memoizes components, Hooks, and expensive calculations that run during rendering, which replaces much of what manual useMemo, useCallback, and memo do.",
        "It is stable, and it has been tested extensively in production, but it remains an optional addition. Upgrading to React 19 does not turn it on, because it runs as part of your build. If a project has not configured it, no compilation is happening, whichever version of React is installed.",
      ],
      comparison: [
        {
          id: "manual",
          title: "Manual memoization",
          items: ["You decide what to cache.", "You maintain dependency lists.", "Available with no build changes."],
        },
        {
          id: "compiler",
          title: "React Compiler",
          items: ["The build decides what to cache.", "No dependency lists to maintain.", "Needs installing and configuring."],
        },
      ],
    },
    {
      id: "what-it-addresses",
      heading: "What it addresses",
      paragraphs: [
        "It targets two main problems. The first is cascading re-renders: it can skip re-rendering children when only a parent’s state has changed. The second is expensive calculations called inside components or Hooks.",
        "It has limits. It does not memoize plain functions outside of components and Hooks, and its memoization is not shared across components. It only helps React’s rendering, so slow layout, large bundles, or a slow network are all untouched.",
      ],
      examples: [
        {
          id: "before-after",
          classification: "complete",
          title: "Code the compiler can optimize",
          language: "tsx",
          code: `interface Item {
  id: string;
  label: string;
  isVisible: boolean;
}

function ItemRow({ item, onSelect }: { item: Item; onSelect: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(item.id)}>
        {item.label}
      </button>
    </li>
  );
}

export default function ItemList({ items, onSelect }: { items: readonly Item[]; onSelect: (id: string) => void }) {
  const visibleItems = items.filter(item => item.isVisible);

  return (
    <ul>
      {visibleItems.map(item => (
        <ItemRow key={item.id} item={item} onSelect={onSelect} />
      ))}
    </ul>
  );
}`,
          description: "With the compiler enabled, this plain code gets automatic caching. Without it, this is simply ordinary code that re-runs on every render, with no change in behavior.",
        },
      ],
    },
    {
      id: "installing",
      heading: "Enabling it",
      paragraphs: [
        "The compiler is primarily a Babel plugin, installed as a dev dependency. It must run first among your Babel plugins. Vite, React Router, Metro, and other tools each have a documented setup, so follow the installation guide for yours.",
        "It is designed for React 19, and it also supports React 17 and 18, for which the docs describe a compatibility target option. This project does not currently enable it.",
      ],
      examples: [
        {
          id: "install-command",
          classification: "external",
          title: "Installing the plugin",
          language: "bash",
          code: `yarn add -D babel-plugin-react-compiler@latest`,
          description: "This installs an external package that this project has not installed, so nothing here is compiled or run by this site.",
        },
        {
          id: "next-config",
          classification: "external",
          title: "Enabling it in Next.js",
          language: "typescript",
          code: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;`,
          description: "The reactCompiler option became stable in Next.js 16. It also needs the separate package babel-plugin-react-compiler, which is not installed in this project. Next.js only applies the compiler to relevant files, which limits the build cost.",
        },
      ],
    },
    {
      id: "rules-and-opting-out",
      heading: "Following the Rules of React",
      paragraphs: [
        "The compiler relies on your code following the Rules of React, such as components staying pure and Hooks being called properly. Where it detects a violation, it skips that component or Hook and continues optimizing the rest, so one problem does not block everything.",
        "The compiler rules in eslint-plugin-react-hooks report these violations, which is useful even before you adopt it. If a compiled component misbehaves, the \"use no memo\" directive opts that function out while you find the underlying issue, and you should remove it afterward.",
      ],
      examples: [
        {
          id: "opt-out",
          classification: "complete",
          title: "Opting one component out",
          language: "tsx",
          code: `export default function LegacyWidget({ title }: { title: string }) {
  "use no memo";

  return <h2>{title}</h2>;
}`,
          description: "Treat this as a temporary measure. A component that only works uncompiled usually has an impurity to fix.",
        },
      ],
    },
    {
      id: "verifying",
      heading: "Checking that it runs",
      paragraphs: [
        "Do not assume it is on. In React DevTools, optimized components show a Memo ✨ badge in development. You can also look at the build output, where compiled code imports from react/compiler-runtime.",
      ],
    },
    {
      id: "manual-memoization",
      heading: "What about existing useMemo calls?",
      paragraphs: [
        "For new code, the docs recommend relying on the compiler, and keeping useMemo and useCallback for cases that need precise control, such as a memoized value used as an Effect dependency.",
        "For existing code, leave current memoization in place, or test carefully before removing it, because removing it can change the compiler’s output. A broad cleanup right after adoption can quietly change how often Effects run.",
      ],
    },
  ],
  mistakes: [
    {
      id: "assumes-enabled",
      heading: "Assuming React 19 enables it",
      problem: "The compiler’s release is closely associated with React 19, so people often assume upgrading turns it on. It needs build configuration, so an upgraded project can still have no automatic memoization.",
      correction: "Check your build configuration, and look for the Memo ✨ badge in DevTools.",
    },
    {
      id: "fixes-everything",
      heading: "Expecting it to fix all performance problems",
      problem: "It only reduces unnecessary React rendering work. A slow page may be caused by bundle size, network latency, layout, or one very expensive component, none of which it changes.",
      correction: "Measure first, and treat it as one tool among several.",
    },
    {
      id: "strip-all-memo",
      heading: "Removing all manual memoization at once",
      problem: "Deleting useMemo everywhere after adopting it seems like an easy tidy-up. It can change the compiler’s output, and an Effect relying on a stable value may then run more often.",
      correction: "Leave existing memoization in place, or remove it gradually with testing.",
    },
    {
      id: "impure-code",
      heading: "Relying on code that breaks the Rules of React",
      problem: "Mutating a prop during rendering might have happened to work before. The compiler assumes the rules are followed, so it either skips that component or the bug shows up in new ways.",
      correction: "Use the lint rules to find violations, and fix them rather than opting out permanently.",
    },
    {
      id: "wrong-plugin-order",
      heading: "Misconfiguring the Babel plugin order",
      problem: "The plugin must run first in the pipeline, because it needs the original source information. Placed after other plugins, it can miss or mishandle code, and the failure is not obvious.",
      correction: "Follow the installation guide, and verify the result in DevTools or the build output.",
    },
  ],
  interview: [
    {
      id: "rc-what",
      question: "What is React Compiler?",
      answer: "A build-time tool that automatically memoizes components, Hooks, and expensive calculations during rendering, so that much manual useMemo, useCallback, and memo becomes unnecessary. It is stable but optional, and it requires build configuration.",
    },
    {
      id: "rc-runtime",
      question: "Does using React 19 mean the compiler is running?",
      answer: "No. They are separate. The compiler is part of your build tooling, so it must be installed and configured. It is designed for React 19, and it supports 17 and 18. You can verify it with the Memo ✨ badge in DevTools or in the build output.",
    },
    {
      id: "rc-manual",
      question: "Should you still write useMemo and useCallback?",
      answer: "For new code in a compiled project, mostly not. The docs suggest keeping them for precise control, such as a value used as an Effect dependency. In existing code, leave them in place or remove them carefully, because that can change the compiler’s output.",
    },
    {
      id: "rc-rules",
      question: "What happens if a component breaks the Rules of React?",
      answer: "The compiler skips that component or Hook, and continues optimizing the others, so you can fix violations gradually. The lint rules report these cases. \"use no memo\" can opt a component out temporarily while the underlying issue is fixed.",
    },
    {
      id: "rc-limits",
      question: "What can’t the compiler help with?",
      answer: "Anything outside React’s rendering, such as layout, paint, network, or bundle size. It does not memoize plain functions, and its caching is not shared across components. Slow components still render slowly when their inputs do change.",
    },
    {
      id: "rc-adopt",
      question: "How would you adopt the compiler in an existing project?",
      answer: "Run the lint rules first and fix violations, then enable it, possibly incrementally, and test key flows, since impure code could now behave differently. I would verify it in DevTools, and I would measure before and after rather than assume there is a benefit.",
    },
  ],
  takeaways: [
    "The compiler is a build-time tool, and it is opt-in.",
    "Installing React 19 does not enable it.",
    "It relies on the Rules of React, and it skips what breaks them.",
    "Leave existing memoization in place, or remove it carefully.",
  ],
  quickReview: {
    definition: "React Compiler is an optional build-time tool that automatically memoizes components and calculations in code following the Rules of React.",
    keyPoints: [
      "It runs at build time, usually as a Babel plugin.",
      "Designed for React 19, and supports 17 and 18.",
      "Violations cause a skip for that component.",
      "Verify it with the Memo ✨ badge in DevTools.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Opting out temporarily",
      language: "tsx",
      code: `export default function Widget() {
  "use no memo";

  return <p>Not compiled</p>;
}`,
      description: "Skips the compiler for this function while you fix the underlying issue.",
    },
    commonMistakes: [
      "Assuming that React 19 turns it on.",
      "Expecting it to fix every performance problem.",
      "Removing all manual memoization at once.",
    ],
    interviewTrap: "“We upgraded to React 19, so we have automatic memoization, right?” Not unless the compiler is configured in the build.",
    takeaway: "Treat it as build tooling you enable, verify, and measure.",
  },
  sources: [
    { label: "React Compiler introduction", href: "https://react.dev/learn/react-compiler/introduction" },
    { label: "React Compiler installation", href: "https://react.dev/learn/react-compiler/installation" },
    { label: "Next.js: reactCompiler option", href: "https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler" },
  ],
};
