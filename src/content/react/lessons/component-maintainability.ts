import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-it-means",
      heading: "What maintainable means",
      paragraphs: [
        "Code is read and changed far more often than it is first written. A maintainable component lets someone understand what it does, change it without fear, and predict what else might be affected. That person is often you, a few months later.",
        "None of this has one correct answer, and the guidance below comes from experience, rather than from rules that React enforces. The goal is always to make the next change easier.",
      ],
      list: [
        "Can you describe what this component does in one sentence?",
        "Can you tell from its props what it needs?",
        "When a requirement changes, how many files must change?",
        "Could someone test it without building the entire page?",
      ],
    },
    {
      id: "responsibilities",
      heading: "Splitting by responsibility",
      paragraphs: [
        "A component becomes difficult when it mixes unrelated concerns, such as fetching, business rules, form handling, and detailed markup. Size alone is not the measure, since a long component that does one simple thing can be fine, and splitting it would only scatter the code.",
        "Split when a piece has its own reason to change, or its own state. Avoid extracting a piece simply because it is possible, as each component adds a name and an interface to understand.",
      ],
      examples: [
        {
          id: "split-logic",
          classification: "complete",
          title: "Separating a rule from its markup",
          language: "tsx",
          code: `type Lesson = { id: string; title: string; minutes: number };

export function totalMinutes(lessons: readonly Lesson[]) {
  return lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
}

export function LessonSummary({ lessons }: { lessons: readonly Lesson[] }) {
  return (
    <p>
      {lessons.length} lessons, {totalMinutes(lessons)} minutes
    </p>
  );
}`,
          description: "The rule can be tested with no rendering, and other features can reuse it. The component only describes how to display the result.",
        },
      ],
    },
    {
      id: "naming",
      heading: "Naming and props",
      paragraphs: [
        "Name a component for what it is in your application, and name a prop for what it means to the component. Event props usually start with on, such as onSave, and handlers commonly start with handle. Booleans read well with a prefix like is or has.",
        "Props are a component’s public interface. Fewer, clearer props are easier to use correctly. A discriminated union can rule out invalid combinations entirely, which is better than documenting them.",
      ],
      examples: [
        {
          id: "union-props",
          classification: "complete",
          title: "Props that rule out invalid combinations",
          language: "tsx",
          code: `type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "failed"; message: string };

export function SaveMessage({ status }: { status: SaveStatus }) {
  switch (status.kind) {
    case "idle":
      return null;
    case "saving":
      return <p role="status">Saving…</p>;
    case "failed":
      return <p role="alert">{status.message}</p>;
  }
}`,
          description: "A message exists only when saving has failed, so the type rules out contradictory states, and the switch handles each kind in one place.",
        },
      ],
    },
    {
      id: "dependencies",
      heading: "Managing dependencies and coupling",
      paragraphs: [
        "A component that imports a global store, a router, and a specific API client can only work where all of them exist. Components receiving what they need through props are easier to reuse and test. Features still need to connect to those systems somewhere, so keep that wiring in a few components near the top of each feature.",
        "State should live as low as it can, while still being shared by everything that needs it. Moving it higher than necessary spreads re-rendering and knowledge across more components.",
      ],
      visual: {
        heading: "Separating wiring from display",
        context: "Indentation shows what renders what. Knowledge of the outside world stays in the top component.",
        root: {
          id: "feature",
          title: "LessonPage",
          description: "Connects to routing and data, and passes plain values down.",
          children: [
            { id: "list", title: "LessonList", description: "Receives lessons as props, and knows nothing about where they came from." },
            { id: "filter", title: "LessonFilter", description: "Receives a value and an onChange prop." },
          ],
        },
        note: "This is a guideline. A small app may not need the separation, and it should not be applied mechanically.",
      },
    },
    {
      id: "organization",
      heading: "Organizing files and abstractions",
      paragraphs: [
        "React has no required file structure. Grouping by feature tends to scale well, because the things that change together stay together. Decide on a convention, then apply it consistently, as consistency matters more than which option you choose.",
        "Be cautious about abstracting early. Two pieces of code that look alike today may need to diverge tomorrow, and a shared component full of options to handle each difference is often worse than a little repetition. A common guideline is to wait until a pattern has appeared a few times.",
      ],
    },
  ],
  mistakes: [
    {
      id: "god-component",
      heading: "Letting one component do everything",
      problem: "A component that fetches, validates, and renders a whole page has many reasons to change. Every edit risks unrelated behavior, and any test has to set up all of it, so people become reluctant to touch it.",
      correction: "Split by responsibility, and move rules into plain functions.",
    },
    {
      id: "boolean-props",
      heading: "Adding a boolean prop for every variation",
      problem: "isCompact, isPrimary, and hideIcon multiply into combinations that nobody has tested. Each new requirement adds another flag, and the component’s body fills with conditions, until no one is sure what is valid.",
      correction: "Use composition with children, or one variant prop.",
    },
    {
      id: "premature-abstraction",
      heading: "Abstracting too early",
      problem: "A shared component made after seeing only two similar cases often guesses wrong about what varies. Later needs arrive as more options, and it becomes harder to understand than the duplicated code ever was.",
      correction: "Tolerate some repetition until the real pattern is clear.",
    },
    {
      id: "splitting-too-much",
      heading: "Splitting everything into tiny components",
      problem: "Dozens of tiny components passing props between them can make simple behavior difficult to follow. A reader must jump between files to understand one screen, so the code is harder to change.",
      correction: "Extract when a piece has its own purpose, state, or reuse.",
    },
    {
      id: "vague-names",
      heading: "Using vague names",
      problem: "Names such as Wrapper, Manager, or utils say nothing about their purpose, and they attract unrelated code. Readers then need to open each file to find out what it does, which slows every later change.",
      correction: "Name things for what they mean in the application.",
    },
  ],
  interview: [
    {
      id: "cm-split",
      question: "How do you decide when to split a component?",
      answer: "When a piece has its own reason to change, its own state, or real reuse, or when logic is hiding among markup. Line count alone is a weak signal. Splitting has a cost as well, since each new component adds an interface and a name to understand.",
    },
    {
      id: "cm-maintainable",
      question: "What makes a component maintainable?",
      answer: "A clear responsibility, a small and honest props interface, good names, and few hidden dependencies. Someone can understand it quickly, change it safely, and test it without the entire app. Good tests and consistent conventions support that as well.",
    },
    {
      id: "cm-reuse",
      question: "When should you make a component reusable?",
      answer: "After a pattern has actually appeared a few times, and I can see what really varies. Designing for imagined reuse often leads to many options that are never used. A little duplication costs less than the wrong abstraction, which is hard to undo.",
    },
    {
      id: "cm-coupling",
      question: "How do you reduce coupling in React components?",
      answer: "Pass data through props or children rather than reaching for global systems everywhere, and keep the wiring to those systems in a few feature-level components. Plain functions hold rules. Then display components can be reused and tested on their own.",
    },
    {
      id: "cm-structure",
      question: "How would you organize a large React codebase?",
      answer: "Usually by feature, keeping components, Hooks, and tests that change together close, with a small shared area for truly generic pieces. React does not require any particular structure, so consistency and clear boundaries matter more than specific folder names.",
    },
    {
      id: "cm-state-location",
      question: "How does the location of state affect maintainability?",
      answer: "State kept as low as possible limits what re-renders, and it limits what must understand that state. Lifting it only when components truly share it keeps each one simple. Global state used by default spreads knowledge widely, which makes changes riskier.",
    },
  ],
  takeaways: [
    "Optimize for the next person who has to change the code.",
    "Split by responsibility, rather than by size.",
    "Keep props small, and make invalid states impossible.",
    "Wait for real patterns before abstracting.",
  ],
  quickReview: {
    definition: "Component maintainability means keeping responsibilities, naming, and dependencies understandable as features grow.",
    keyPoints: [
      "One clear responsibility per component.",
      "Name things for what they mean.",
      "Keep state as low as possible.",
      "Some repetition beats the wrong abstraction.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A rule outside the markup",
      language: "typescript",
      code: `export function isOverdue(dueDate: Date, today: Date) {
  return dueDate.getTime() < today.getTime();
}`,
      description: "A named function can be tested and reused, and it documents the rule.",
    },
    commonMistakes: [
      "Letting one component do everything.",
      "Adding a boolean prop for each variation.",
      "Abstracting after seeing only two cases.",
    ],
    interviewTrap: "“Is a 300-line component always bad?” Not necessarily. Length is a clue, and responsibilities are what count.",
    takeaway: "Make the next change easier, because there will always be a next change.",
  },
  sources: [
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
    { label: "Reusing Logic with Custom Hooks", href: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
    { label: "Importing and Exporting Components", href: "https://react.dev/learn/importing-and-exporting-components" },
  ],
};
