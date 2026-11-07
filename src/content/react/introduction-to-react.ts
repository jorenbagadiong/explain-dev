import type { ArticleConceptVisual, ArticleHierarchyVisual, ArticleQuickReview, ArticleSection, ArticleSource, CodeExample, CommonMistake, ComparisonColumn, InterviewQuestion } from "./article-types";

interface IntroductionToReactArticle {
  heading: string;
  overview: ArticleSection;
  whyReact: ArticleSection & { comparison: readonly ComparisonColumn[] };
  declarativeUi: ArticleSection & { comparison: readonly ComparisonColumn[]; imperativeExample: CodeExample; declarativeExample: CodeExample };
  components: ArticleSection & { basicExample: CodeExample; compositionExample: CodeExample };
  props: ArticleSection & { comparison: readonly ComparisonColumn[]; typedPropsExample: CodeExample; callbackExample: CodeExample };
  jsx: ArticleSection & { example: CodeExample };
  rendering: ArticleSection & { interactiveExample: CodeExample; conclusion: string };
  reactVsJavaScript: ArticleSection & { comparison: readonly ComparisonColumn[] };
  whenToUse: ArticleSection & { comparison: readonly ComparisonColumn[] };
  mistakes: ArticleSection & { items: readonly CommonMistake[] };
  interview: ArticleSection & { questions: readonly InterviewQuestion[] };
  takeaways: ArticleSection & { items: readonly string[] };
  quickReview: ArticleQuickReview;
  compositionVisual: ArticleHierarchyVisual;
  visual: ArticleConceptVisual;
  sources: readonly ArticleSource[];
}

// Educational content only: topic identity, summary, availability, and route
// remain in the React topic registry. These examples are displayed, never run.
export const introductionToReactArticle: IntroductionToReactArticle = {
  heading: "Introduction to React",
  overview: {
    id: "what-is-react",
    heading: "What is React?",
    paragraphs: [
      "React is a JavaScript library for building user interfaces. You describe the interface as components: functions that receive inputs and return a description of what should appear on screen. Small components combine into larger ones, so a page becomes an arrangement of reusable pieces instead of one long block of markup.",
      "You can write React with JavaScript or TypeScript. TypeScript adds type checking that many teams value, and the examples here use it, but React does not require it.",
      "React focuses on the UI layer. It is not a complete application framework by itself: decisions about routing, data fetching, and deployment sit outside its core. Frameworks such as Next.js build on React and provide those capabilities around it.",
    ],
  },
  whyReact: {
    id: "why-use-react",
    heading: "Why use React?",
    paragraphs: ["React earns its place when an interface has many interacting parts. Those benefits come with real costs, so weigh both against what you are building."],
    comparison: [
      {
        id: "benefits",
        title: "What React gives you",
        items: [
          "Component reuse: build a card or button once and use it wherever it is needed, so a fix lands in one place.",
          "Declarative UI: describe the screen for each state and let React work out the DOM changes.",
          "Composition: assemble complex screens from small components with clear responsibilities.",
          "Interactive interfaces: state keeps what is displayed tied to the data behind it as interactions multiply.",
          "Predictable data flow: data passes down through props, so you can trace where a value came from.",
          "Ecosystem and tooling: established frameworks, testing libraries, component libraries, and React Developer Tools.",
        ],
      },
      {
        id: "tradeoffs",
        title: "What it costs you",
        items: [
          "Learning curve: JSX, state, Hooks, and rendering behavior come on top of JavaScript itself.",
          "State management complexity: deciding where state lives gets harder as more components share data.",
          "Architecture decisions: React leaves structure, routing, and data fetching to you or your framework.",
          "Performance considerations: unnecessary rendering and large JavaScript bundles can still slow an application, so measure.",
          "Tooling choices: build setup, styling, and testing add decisions and upgrades to maintain.",
        ],
      },
    ],
  },
  declarativeUi: {
    id: "declarative-vs-imperative",
    heading: "Declarative versus imperative UI",
    paragraphs: [
      "Imperative code lists the steps: find this element, then change its text. You are responsible for every change and for keeping the page consistent with your data.",
      "Declarative UI starts from the result: for this state, the interface should look like this. When the state changes, React renders the new description, reconciles it with the previous result, and commits the necessary DOM changes. React still performs imperative DOM operations internally. The difference is that you do not write them by hand for each change.",
    ],
    comparison: [
      {
        id: "imperative",
        title: "Imperative",
        items: [
          "You write the steps: select an element, then change it.",
          "You keep the page in sync with your data yourself.",
          "Each new state can add another update path to keep correct.",
        ],
      },
      {
        id: "declarative",
        title: "Declarative",
        items: [
          "You write the result for a given state.",
          "React works out and applies the DOM changes.",
          "Each new state is another case in one description of the UI.",
        ],
      },
    ],
    imperativeExample: {
      id: "imperative-update",
      title: "Imperative: one direct DOM update",
      language: "typescript",
      code: `const button = document.querySelector<HTMLButtonElement>("#counter");

if (button) {
  button.textContent = "Count: 1";
}`,
      description: "This only illustrates a single DOM update. It sets an existing button’s text once, with no click handling and no count, so it is not a feature-equivalent version of the counter below.",
    },
    declarativeExample: {
      id: "declarative-counter",
      title: "Declarative: an interactive counter",
      language: "tsx",
      code: `import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setCount(previous => previous + 1)}
    >
      Count: {count}
    </button>
  );
}`,
      description: "The JSX states what the button shows for any count, and a click requests the next count. Nothing here touches the DOM directly. In the Next.js App Router, a component using state also needs the \"use client\" directive at the top of its file.",
    },
  },
  components: {
    id: "understanding-components",
    heading: "Understanding components",
    paragraphs: [
      "A component is a reusable building block of UI. In modern React it is a function that returns React elements, usually written with JSX. Older codebases may contain class components, but function components are the standard choice for new code.",
      "Component names start with an uppercase letter. That is how React tells your <ProfileCard /> apart from an HTML tag such as <section>.",
      "Components can contain other components. This composition is how you organize an interface: each piece has one job, and a parent arranges its children. Define each component at the top level of a file rather than inside another component.",
      "Keep components predictable during rendering. Given the same inputs they should return the same result, and they should not change variables or objects that existed before the render.",
    ],
    basicExample: {
      id: "basic-component",
      title: "Example 1: A basic component",
      language: "tsx",
      code: `export default function WelcomeBanner() {
  return (
    <section>
      <h2>Welcome to Explain Dev</h2>
      <p>Learn React one concept at a time.</p>
    </section>
  );
}`,
      description: "A complete component: a function, exported so other files can use it, returning semantic markup through JSX. It needs no React import, because modern JSX tooling supplies what the markup compiles to.",
    },
    compositionExample: {
      id: "component-composition",
      title: "Composing components into a page",
      language: "tsx",
      code: `function Header() {
  return (
    <header>
      <h1>Explain Dev</h1>
    </header>
  );
}

function MainContent() {
  return (
    <main>
      <p>Start with the fundamentals.</p>
    </main>
  );
}

function Footer() {
  return (
    <footer>
      <p>Keep learning.</p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <MainContent />
      <Footer />
    </>
  );
}`,
      description: "App reads as an outline of the page, and each child owns the details of its own area. The diagram below shows the same structure.",
    },
  },
  props: {
    id: "props-and-data-flow",
    heading: "Props and data flow",
    paragraphs: [
      "Props are the inputs a parent passes to a child, written like HTML attributes. They work much like function arguments, and they can hold any JavaScript value, including objects and functions.",
      "Props are read-only from the receiving component’s perspective. To display something different, the parent passes a new value on a later render.",
      "Data generally flows downward through component relationships. When a child needs to report something upward, such as a click, the parent passes a function as a callback prop and the child calls it. Passing props needs no extra library.",
    ],
    comparison: [
      {
        id: "props",
        title: "Props",
        items: [
          "Come from the parent component.",
          "Are read-only for the component receiving them.",
          "Configure a component from the outside.",
        ],
      },
      {
        id: "state",
        title: "State",
        items: [
          "Is owned by the component that declares it.",
          "Changes through its setter function, which requests a new render.",
          "Holds information the component must remember between renders.",
        ],
      },
    ],
    typedPropsExample: {
      id: "typed-props",
      title: "Example 2: Typed props",
      language: "tsx",
      code: `interface ProfileCardProps {
  name: string;
  role: string;
  yearsOfExperience: number;
}

function ProfileCard({ name, role, yearsOfExperience }: ProfileCardProps) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{role}</p>
      <p>{yearsOfExperience} years of experience</p>
    </article>
  );
}

export default function TeamSection() {
  return (
    <section aria-label="Team">
      <ProfileCard name="Maria" role="Frontend Engineer" yearsOfExperience={4} />
      <ProfileCard name="Paolo" role="UX Engineer" yearsOfExperience={2} />
    </section>
  );
}`,
      description: "TeamSection is the parent and reuses ProfileCard with different data. The interface documents the card’s inputs, and TypeScript reports a missing prop or a wrong type at each use.",
    },
    callbackExample: {
      id: "callback-props",
      title: "Passing a callback prop",
      language: "tsx",
      code: `import { useState } from "react";

interface LikeButtonProps {
  likes: number;
  onLike: () => void;
}

function LikeButton({ likes, onLike }: LikeButtonProps) {
  return (
    <button type="button" onClick={onLike}>
      Like ({likes})
    </button>
  );
}

export default function ArticleActions() {
  const [likes, setLikes] = useState(0);

  return (
    <LikeButton
      likes={likes}
      onLike={() => setLikes(previous => previous + 1)}
    />
  );
}`,
      description: "The parent owns the likes state. The child receives the current value and a function to call, so data flows down while the event reports up. The same value is state in the parent and a prop in the child.",
    },
  },
  jsx: {
    id: "jsx-fundamentals",
    heading: "JSX fundamentals",
    paragraphs: [
      "JSX is a syntax extension commonly used with React. It looks like HTML but follows JavaScript’s rules: every tag must close, and curly braces embed a JavaScript expression in the markup.",
      "A component returns one root element or a Fragment, written <>...</>, which groups elements without adding an extra DOM node. Many attributes use React-specific names, such as className in place of class, because JSX attributes become JavaScript object keys.",
      "Browsers do not understand JSX directly. A compiler or build tool transforms it into JavaScript before the code runs. React does not strictly require JSX, but most React code uses it. This is only an introduction; the upcoming Writing UI with JSX lesson in the curriculum is planned to go deeper.",
    ],
    example: {
      id: "jsx-basics",
      title: "Expressions, className, composition, and conditions",
      language: "tsx",
      code: `interface LessonSummaryProps {
  title: string;
  lessonCount: number;
  isNew: boolean;
}

function NewBadge() {
  return <span className="badge">New</span>;
}

export default function LessonSummary({ title, lessonCount, isNew }: LessonSummaryProps) {
  return (
    <>
      <h2 className="lesson-title">{title}</h2>
      <p>{lessonCount} lessons</p>
      {isNew && <NewBadge />}
      <p>{isNew ? "Just added" : "Part of the core path"}</p>
    </>
  );
}`,
      description: "The Fragment returns several elements together. {title} and {lessonCount} are expressions, className sets the CSS class, and NewBadge is composed like a tag. Conditions are ordinary JavaScript: && renders or omits the badge, and the ternary chooses between two strings.",
    },
  },
  rendering: {
    id: "react-rendering",
    heading: "React rendering",
    paragraphs: [
      "Rendering means React calls your components to determine what the UI should be. It is a calculation, not a screen update.",
      "The initial render happens when the application starts: React calls the root component and the components nested inside it, then adds the resulting DOM nodes to the page. Later renders are different, because there is an existing result to compare against. A state update queues one, and by default React also renders the components nested inside the one that updated. That is how children receive new props.",
      "Committing is the separate step that follows. React applies only the DOM changes needed to match the latest output, and then the browser paints. If the output is unchanged, the DOM nodes stay as they are, so a component rendering does not imply its DOM nodes changed.",
      "React may batch state updates. Several updates in one event handler are processed together after the handler finishes, typically producing one re-render rather than one for each call.",
      "Because React decides when to call your components, rendering should remain pure: calculate the output and leave everything else alone. In development, Strict Mode calls components twice to help expose code that breaks this rule.",
    ],
    interactiveExample: {
      id: "interactive-component",
      title: "Example 3: An interactive component",
      language: "tsx",
      code: `import { useState } from "react";

export default function LessonProgress() {
  const [completed, setCompleted] = useState(0);

  function handleComplete() {
    setCompleted(previous => previous + 1);
  }

  return (
    <section>
      <h2>Your progress</h2>
      <p>Lessons completed: {completed}</p>
      <button type="button" onClick={handleComplete}>
        Mark a lesson complete
      </button>
    </section>
  );
}`,
      description: "A native button makes this keyboard accessible without extra code. Each click requests an update, and React renders LessonProgress again. The heading and button look the same in the new output, so the commit updates only the paragraph’s text. The count lives in memory and resets when the page reloads.",
    },
    conclusion: "You may hear this comparison described as the Virtual DOM. It is a useful mental model, not a performance guarantee. Comparing output is also work, and a carefully written direct DOM update can be faster. Real performance depends on what your application renders and how much code it ships.",
  },
  reactVsJavaScript: {
    id: "react-vs-javascript",
    heading: "React versus JavaScript",
    paragraphs: ["React does not replace JavaScript. It is a library you use from JavaScript or TypeScript, so language fundamentals such as functions, arrays, destructuring, and modules appear in every component you write."],
    comparison: [
      {
        id: "javascript",
        title: "JavaScript",
        items: [
          "A programming language.",
          "Provides functions, objects, arrays, modules, and asynchronous code.",
          "Runs in browsers, which also expose APIs such as the DOM and fetch.",
          "Can update the page directly, with no library at all.",
        ],
      },
      {
        id: "react",
        title: "React",
        items: [
          "A library written for the JavaScript ecosystem.",
          "Provides components, state, and a rendering model.",
          "Updates the browser DOM for you through react-dom.",
          "Still lets you call browser APIs directly when appropriate, such as in an event handler.",
        ],
      },
    ],
  },
  whenToUse: {
    id: "when-to-use-react",
    heading: "When should you use React?",
    paragraphs: ["Treat this as a judgment call rather than a rule. Team experience, existing systems, and the product’s direction all matter as much as the current page count."],
    comparison: [
      {
        id: "good-fit",
        title: "Often a good fit",
        items: [
          "Interactive applications, such as dashboards and editors.",
          "Component-heavy interfaces with many repeated patterns.",
          "Applications whose UI state keeps evolving.",
          "Teams that benefit from shared UI patterns.",
        ],
      },
      {
        id: "may-be-unnecessary",
        title: "May be unnecessary",
        items: [
          "Simple static pages.",
          "Small websites with minimal interaction.",
          "Projects where a lighter solution better fits the requirements.",
        ],
      },
    ],
  },
  mistakes: {
    id: "common-mistakes",
    heading: "Common mistakes",
    paragraphs: ["Most of these come from blurring what React is responsible for and what it leaves to you."],
    items: [
      {
        id: "react-as-language",
        heading: "Treating React as a programming language",
        problem: "Saying “I code in React” can suggest it is a language of its own. It is not: the logic you write is JavaScript or TypeScript, and React is a library that code calls.",
        correction: "Describe React as a UI library, and name the language separately when it matters.",
      },
      {
        id: "replacing-javascript",
        heading: "Thinking React replaces JavaScript fundamentals",
        problem: "Skipping straight to React seems faster, but component code is full of everyday JavaScript. Without it, array methods and callbacks can look like React features.",
        correction: "Learn language fundamentals alongside React. In this example, filter, map, and the arrow functions are all plain JavaScript.",
        examples: [
          {
            id: "javascript-in-components",
            title: "JavaScript inside a component",
            language: "tsx",
            code: `interface User {
  id: number;
  name: string;
  isActive: boolean;
}

interface ActiveUsersProps {
  users: readonly User[];
}

export default function ActiveUsers({ users }: ActiveUsersProps) {
  const activeUsers = users.filter(user => user.isActive);

  return (
    <ul>
      {activeUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`,
            description: "Only the markup and the key attribute are React concerns. Choosing the active users is ordinary array work.",
          },
        ],
      },
      {
        id: "props-versus-state",
        heading: "Confusing props and state",
        problem: "Both can hold data and both affect the output, so they are easy to mix up. The real difference is ownership: a parent supplies props, while a component owns and updates its state.",
        correction: "Ask who controls the value. If the parent decides, use a prop. If the component must remember and change it, use state.",
        examples: [
          {
            id: "props-and-state-together",
            title: "A prop and state in one component",
            language: "tsx",
            code: `import { useState } from "react";

interface QuantityPickerProps {
  productName: string;
}

export default function QuantityPicker({ productName }: QuantityPickerProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <p>{productName}: {quantity}</p>
      <button type="button" onClick={() => setQuantity(previous => previous + 1)}>
        Add one
      </button>
    </div>
  );
}`,
            description: "productName is configured by the parent, while quantity is remembered and changed by this component.",
          },
        ],
      },
      {
        id: "mutating-props",
        heading: "Mutating props",
        problem: "Assigning to a prop treats a parent’s input as a local variable. Props are read-only snapshots, so writing to one breaks the expectation that rendering is predictable, and it will not request a new render.",
        correction: "Calculate a new value during rendering. If the value must change over time, keep it in state or ask the parent to pass a different prop.",
        examples: [
          {
            id: "derive-from-props",
            title: "Derive a value instead of mutating",
            language: "tsx",
            code: `interface SalePriceProps {
  price: number;
}

// Avoid: price = price * 0.9, or changing a props object.
export default function SalePrice({ price }: SalePriceProps) {
  const salePrice = price * 0.9;

  return <p>Sale price: {salePrice}</p>;
}`,
            description: "A new local variable holds the result, and the input is left untouched.",
          },
        ],
      },
      {
        id: "lowercase-components",
        heading: "Using lowercase names for custom components",
        problem: "JSX treats a lowercase tag as a built-in element. Writing <profileCard /> asks for an element with that tag name instead of calling your function, so your component never runs. In TypeScript, this is a compile error.",
        correction: "Start component names with an uppercase letter, both where you define them and where you use them.",
        examples: [
          {
            id: "uppercase-component",
            title: "Name components with a capital letter",
            language: "tsx",
            code: `function ProfileCard() {
  return <p>Maria, Frontend Engineer</p>;
}

// Avoid: <profileCard /> would not call the function above.
export default function App() {
  return <ProfileCard />;
}`,
            description: "The capital P tells JSX this tag refers to a component in scope.",
          },
        ],
      },
      {
        id: "render-replaces-dom",
        heading: "Assuming every render replaces the entire DOM",
        problem: "“Re-render” sounds like redrawing the page, but rendering only calculates output. If the whole DOM were replaced each time, an input would lose its text and focus on every update.",
        correction: "Separate the two steps: rendering works out the UI, and committing applies only the DOM changes needed. Example 3 above changes one paragraph’s text.",
      },
      {
        id: "always-best",
        heading: "Assuming React is always the fastest or best solution",
        problem: "Popularity is not a performance measurement. React adds code to download and a rendering step, so a simple page can be lighter and just as effective without it.",
        correction: "Choose from the project’s requirements, and measure performance instead of assuming it. React is a strong option for many interfaces, not a default answer for all of them.",
      },
    ],
  },
  interview: {
    id: "interview-questions",
    heading: "Interview questions",
    paragraphs: ["Try each answer aloud before opening it. These are common fundamentals to practice, not questions confirmed to appear at any particular company."],
    questions: [
      {
        id: "what-is-react",
        question: "What is React?",
        answer: "React is a JavaScript library for building user interfaces from components. You describe what the UI should look like for the current data, and React updates the DOM to match. It focuses on the UI, so routing and data fetching usually come from a framework or other libraries.",
      },
      {
        id: "why-react",
        question: "Why would you use React?",
        answer: "It suits interfaces with a lot of interaction and repeated UI. Components allow reuse and composition, the declarative model removes much of the manual DOM synchronization, and data flowing down through props is easier to trace. I would weigh that against the learning curve, the JavaScript it adds, and the architecture decisions it leaves open. A mostly static page may not need it.",
      },
      {
        id: "declarative-ui",
        question: "What is declarative UI?",
        answer: "You describe what the interface should look like for a given state, rather than writing the steps to change it. When the state changes, React works out the DOM updates. It reduces hand-written synchronization, although DOM operations still happen imperatively inside React.",
      },
      {
        id: "react-component",
        question: "What is a React component?",
        answer: "It is a reusable piece of UI. In modern React that is a function with a capitalized name that returns React elements, usually through JSX. Components accept props, can hold state, and combine with other components. They should stay pure while rendering, so React can call them safely.",
      },
      {
        id: "what-is-jsx",
        question: "What is JSX?",
        answer: "JSX is a syntax extension that lets you write markup-like code in JavaScript. It is not HTML: it uses names such as className, every tag must close, and curly braces embed expressions. Browsers cannot run it directly, so a build tool compiles it to JavaScript first. It is common with React but not strictly required.",
      },
      {
        id: "what-are-props",
        question: "What are props?",
        answer: "Props are the inputs a parent passes to a child, similar to function arguments. They can be any JavaScript value, including callbacks. They are read-only for the receiving component, which is why a change has to come from the parent passing a new value on a later render.",
      },
      {
        id: "props-vs-state",
        question: "What is the difference between props and state?",
        answer: "The difference is ownership. Props come from a parent and are read-only for the receiver. State belongs to the component that declares it, persists between renders, and changes through its setter, which requests a new render. They can describe the same value: a parent’s state is often passed to a child as a prop.",
      },
      {
        id: "render-causes",
        question: "What causes a React component to render?",
        answer: "It renders initially when it first appears. After that, the usual cause is a state update in the component or an ancestor. By default, a parent rendering also renders its children, even if their props are the same, unless an optimization such as memo applies. A context value the component reads can also cause it. New props are not a separate trigger, because they arrive when the parent renders.",
      },
      {
        id: "render-vs-dom",
        question: "What is the difference between rendering and DOM updates?",
        answer: "Rendering is React calling components to calculate the UI. Committing is when React applies changes to the DOM, and then the browser paints. React changes only the DOM nodes that differ, so a component can render without any DOM change at all.",
      },
      {
        id: "library-or-framework",
        question: "Is React a framework or a library?",
        answer: "React describes itself as a library, because it focuses on the UI and leaves routing, data fetching, and build setup open. Frameworks such as Next.js build on it and supply those parts. In practice many teams use React through a framework, so it helps to be clear about which layer you mean.",
      },
      {
        id: "capitalized-names",
        question: "Why must component names start with a capital letter?",
        answer: "JSX uses the case of a tag to decide what it means. Lowercase tags are treated as built-in elements such as section, while capitalized tags refer to a component in scope. A lowercase custom component would not be called as your function.",
      },
      {
        id: "typescript-required",
        question: "Do you need TypeScript or JSX to use React?",
        answer: "No. React works with plain JavaScript, and JSX compiles to ordinary function calls that you could write yourself. Most teams still use JSX because it reads clearly, and many add TypeScript to catch mistakes such as a wrong prop type before the code runs.",
      },
    ],
  },
  takeaways: {
    id: "key-takeaways",
    heading: "Key takeaways",
    paragraphs: [],
    items: [
      "React builds UI from components that you compose together.",
      "React is declarative: you describe the result, and React handles the DOM changes.",
      "Props pass data into components and are read-only for the receiver.",
      "State enables local interactive behavior and requests new renders.",
      "JSX describes UI in JavaScript and is compiled before it runs.",
      "Rendering and DOM commits are different steps, and a render may change nothing in the DOM.",
      "React does not replace JavaScript fundamentals, and it is not the right choice for every project.",
    ],
  },
  quickReview: {
    definition: "React is a UI library: you describe the interface as components, and it keeps the DOM in step with your data.",
    keyPoints: [
      "Components are capitalized functions that return React elements and compose into larger UIs.",
      "Declarative means describing the result for each state, not the steps to reach it.",
      "Props are read-only inputs from a parent; state is memory owned by the component.",
      "JSX is compiled to JavaScript, uses curly braces for expressions, and returns one root or a Fragment.",
      "A state update leads to a render, then a commit of only the DOM changes needed.",
      "Frameworks such as Next.js add routing and other capabilities around React.",
    ],
    codeReminder: {
      id: "review-reminder",
      title: "A component with a typed prop",
      language: "tsx",
      code: `export default function Greeting({ name }: { name: string }) {
  return <h2>Hello, {name}!</h2>;
}`,
      description: "A capitalized function, a read-only prop, and a curly-brace expression: the core of most components.",
    },
    commonMistakes: [
      "Calling React a language, or skipping the JavaScript beneath it.",
      "Assigning to a prop instead of deriving a value or using state.",
      "Naming a custom component in lowercase, so JSX treats it as a built-in tag.",
    ],
    interviewTrap: "“Does React update the entire DOM whenever a component renders?” No. Rendering and committing are distinct: rendering calculates the UI, and committing applies only the DOM changes needed. A component can render and change nothing in the DOM.",
    takeaway: "Think in components and state, and let React handle the DOM, while your JavaScript fundamentals do the rest.",
  },
  compositionVisual: {
    heading: "Component composition",
    context: "Components nest to form a tree. Here App renders three children, and together they make up one page. Indentation shows which component renders which.",
    root: {
      id: "app",
      title: "App",
      description: "The parent. It arranges the page and leaves the details to its children.",
      children: [
        { id: "header", title: "Header", description: "Owns the top of the page." },
        { id: "main-content", title: "MainContent", description: "Owns the primary content." },
        { id: "footer", title: "Footer", description: "Owns the end of the page." },
      ],
    },
    note: "Real applications have deeper trees, and each child here could render its own children in the same way.",
  },
  visual: {
    heading: "React update flow",
    context: "This follows one update from a change in data to what the user sees.",
    steps: [
      { id: "change", title: "State or props change", description: "A state setter queues an update, or a parent rendering passes new props." },
      { id: "render", title: "React renders", description: "React calls the affected components to calculate the new UI." },
      { id: "commit", title: "React commits necessary changes", description: "React applies only the DOM changes needed. If the output matches the previous result, there may be none." },
      { id: "display", title: "Browser displays the updated UI", description: "The browser paints any DOM changes on screen." },
    ],
    note: "This is a simplified conceptual model, and not every render causes DOM mutations. It leaves out details such as batching and Effects.",
  },
  sources: [
    { label: "Quick Start", href: "https://react.dev/learn" },
    { label: "Describing the UI", href: "https://react.dev/learn/describing-the-ui" },
    { label: "Your First Component", href: "https://react.dev/learn/your-first-component" },
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
    { label: "Writing Markup with JSX", href: "https://react.dev/learn/writing-markup-with-jsx" },
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "React Reference", href: "https://react.dev/reference/react" },
  ],
};
