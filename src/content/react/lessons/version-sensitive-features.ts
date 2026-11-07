import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-versions-matter",
      heading: "Why versions matter",
      paragraphs: [
        "React’s APIs change over time, and tutorials do not always say which version they assume. Code that works in one project can fail in another, simply because an export does not exist there, or because it behaves differently. So before adopting a newer API, check three things: which version you have, which channel it came from, and whether your framework supports it.",
        "This site runs on React 19.3.1, and the lessons here note when an API requires a recent release.",
      ],
    },
    {
      id: "release-channels",
      heading: "Release channels",
      paragraphs: [
        "React publishes through three channels. Only Latest follows semantic versioning, and the other two can change at any time.",
      ],
      list: [
        "Latest: stable releases for production apps, and what npm install react gives you. It follows semver.",
        "Canary: tracks the main branch, with release candidates for the next release. It is used by frameworks, and it may include breaking changes.",
        "Experimental: tracks main with extra feature flags. It is for testing only, and it should not be used in user-facing applications.",
      ],
      closing: "Under semver, patches contain critical fixes, minors add features and non-critical fixes, and majors contain breaking changes. APIs prefixed with unstable_ are explicitly excluded from these guarantees.",
    },
    {
      id: "checking",
      heading: "Checking what you actually have",
      paragraphs: [
        "Do not assume. A quick check of the installed package tells you what really exists in your project, which can differ from what the documentation’s newest version describes.",
      ],
      examples: [
        {
          id: "check-exports",
          classification: "complete",
          title: "Checking versions and exports from a script",
          language: "typescript",
          code: `import * as React from "react";

console.log(React.version);
console.log("useEffectEvent" in React);
console.log("Activity" in React);`,
          description: "This reports the installed version, and whether specific exports exist. TypeScript definitions tell you too, since a missing export becomes a compile error.",
        },
        {
          id: "check-command",
          classification: "snippet",
          title: "Checking from the command line",
          language: "bash",
          code: `yarn list --pattern "react" --depth=0
npm view react dist-tags`,
          description: "The first shows what is installed, and the second shows what each channel currently points to. Duplicate copies of React in a project can also cause errors, so this can be useful for diagnosis.",
        },
      ],
    },
    {
      id: "recent-additions",
      heading: "When recent APIs arrived",
      paragraphs: [
        "A few version boundaries come up often. If a project is on an older version, these APIs will not be there, and neither will the behavior.",
      ],
      comparison: [
        {
          id: "react-19",
          title: "React 19",
          items: ["Actions and form actions.", "useActionState, useOptimistic, and use.", "ref as a prop, and context as a provider."],
        },
        {
          id: "react-19-later",
          title: "React 19.2 and 19.3",
          items: ["19.2: Activity, useEffectEvent, and Performance Tracks.", "19.3: ViewTransition and Fragment Refs, both stable.", "19.3: browser() from react-dom."],
        },
      ],
    },
    {
      id: "framework-layer",
      heading: "The framework layer",
      paragraphs: [
        "Some features need more than a React version. Server Components and Server Functions require a framework or bundler implementing them, and the lower-level APIs for that do not follow semver. The React Compiler requires build tooling. Frameworks also ship a pinned React release of their own, sometimes from Canary, so what your code receives may differ from your package.json.",
        "So check the framework’s documentation as well. A feature can be stable in React, and not yet supported by your framework, or the reverse.",
      ],
    },
    {
      id: "upgrading",
      heading: "Upgrading safely",
      paragraphs: [
        "React uses development warnings in place of formal deprecation cycles. If your application shows no warnings on the latest release, it should be compatible with the next major. So treat those warnings as a to-do list.",
        "Security is another reason to keep current. The React blog has reported vulnerabilities in React Server Components, including a critical one in December 2025, with fixes in patched releases such as 19.0.1, 19.1.2, and 19.2.1. Applications using Server Components should follow those advisories, and upgrade promptly.",
      ],
    },
  ],
  mistakes: [
    {
      id: "copying-examples",
      heading: "Copying code without checking its version",
      problem: "An example using useEffectEvent or ref as a prop fails or misbehaves on older versions. On React 18, a ref prop arrives as undefined, so the code quietly does nothing, rather than reporting a clear error.",
      correction: "Check your installed version first, and read the docs for that API.",
    },
    {
      id: "experimental-in-production",
      heading: "Using Experimental releases in production",
      problem: "A new feature is tempting, but Experimental builds offer no stability guarantees, and APIs may change or vanish with no notice. An upgrade can break your application, with no migration path.",
      correction: "Use the Latest channel, or Canary only through a pinned framework setup.",
    },
    {
      id: "unstable-prefix",
      heading: "Depending on unstable_ APIs or internals",
      problem: "APIs with an unstable_ prefix, and undocumented internals, are outside the semver promise. They can change in any release, including a patch, so an update that should be routine can break things.",
      correction: "Use stable APIs where possible, and isolate any unstable use behind your own wrapper.",
    },
    {
      id: "docs-newer-than-project",
      heading: "Assuming the docs match your project",
      problem: "react.dev documents the latest release, which may be ahead of your project. A documented API may not exist in your install, and a behavior may have changed since the version you are running.",
      correction: "Compare with your installed version, and read release notes for what changed.",
    },
    {
      id: "ignoring-warnings",
      heading: "Ignoring development warnings",
      problem: "Warnings are React’s migration path, since they appear ahead of breaking changes. Leaving them to pile up means that the next major upgrade becomes a large, risky project, rather than a small one.",
      correction: "Fix warnings as they appear, keeping the console clean.",
    },
  ],
  interview: [
    {
      id: "vs-channels",
      question: "What are React’s release channels?",
      answer: "Latest for stable semver releases. Canary tracks main and holds release candidates, used by frameworks with a pinned version, and it may include breaking changes. Experimental adds feature flags for testing only, and it should not go into user-facing applications.",
    },
    {
      id: "vs-check",
      question: "How would you check whether you can use a newer API?",
      answer: "Check the installed React version and whether the export exists, which TypeScript also reveals. Then read its docs and release notes, and check whether my framework supports it, especially for Server Components or anything needing tooling.",
    },
    {
      id: "vs-breaking",
      question: "What does not count as a breaking change for React?",
      answer: "Development warnings, unstable_ APIs, Canary and alpha versions, and undocumented internals. These can change without a major version. So relying on them means accepting that an ordinary upgrade could break your code.",
    },
    {
      id: "vs-canary",
      question: "How can a framework ship features before they are in a stable React release?",
      answer: "Frameworks can use a pinned Canary build, since Canary tracks release candidates. So a feature may appear to work in your Next.js project, even though your package.json would not have it on the Latest channel by itself.",
    },
    {
      id: "vs-upgrade",
      question: "How do you approach upgrading React in a large application?",
      answer: "Fix development warnings first, because they flag what is changing. Read the upgrade guide, run codemods where offered, and upgrade through tests and staged rollout. It can happen one component at a time, since new features are opt-in.",
    },
    {
      id: "vs-security",
      question: "Why does staying current matter beyond new features?",
      answer: "Security. Vulnerabilities in Server Components have been disclosed, and they were fixed in patched releases, and fixes are backported to affected majors. An application using Server Components on an unpatched version may be exposed, so advisories deserve attention.",
    },
  ],
  takeaways: [
    "Check your version, the channel, and your framework before adopting an API.",
    "Only the Latest channel follows semver.",
    "Treat development warnings as your upgrade path.",
    "Follow security advisories, particularly when using Server Components.",
  ],
  quickReview: {
    definition: "Version-dependent features require checking your installed release, its channel, and your framework’s support before use.",
    keyPoints: [
      "Latest is semver, while Canary and Experimental are not.",
      "unstable_ APIs are outside the guarantee.",
      "Frameworks may pin their own React.",
      "Warnings are the migration path.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Checking the version",
      language: "typescript",
      code: `import { version } from "react";

console.log(version);`,
      description: "Prints the React version your code is actually running.",
    },
    commonMistakes: [
      "Copying examples without checking versions.",
      "Using Experimental builds in production.",
      "Relying on undocumented internals.",
    ],
    interviewTrap: "“It works in our Next.js app, so it must be stable, right?” Not necessarily. Frameworks can pin Canary builds with features not yet in a stable release.",
    takeaway: "Trust what is installed, and confirm it against the docs for that version.",
  },
  sources: [
    { label: "Versioning policy", href: "https://react.dev/community/versioning-policy" },
    { label: "React 19.2 release notes", href: "https://react.dev/blog/2025/10/01/react-19-2" },
    { label: "React 19.3 release notes", href: "https://react.dev/blog/2026/09/09/react-19-3" },
    { label: "React 19 release notes", href: "https://react.dev/blog/2024/12/05/react-19" },
    { label: "React blog", href: "https://react.dev/blog" },
  ],
};
