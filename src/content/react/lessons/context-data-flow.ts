import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "the-problem-context-solves",
      heading: "The problem context solves",
      paragraphs: [
        "Props are the usual way to pass data, and their explicit flow is valuable. They get awkward when a value must travel through many components that do not use it, or when many components in different places need the same thing. This is called prop drilling.",
        "Context lets a parent make a value available to its whole subtree. Any component below can read it directly, however deep it is, without the components in between having to forward it.",
      ],
    },
    {
      id: "three-steps",
      heading: "Create, provide, and read",
      paragraphs: [
        "Using context takes three steps. In React 19, you render the context itself as the provider. Older code writes SomeContext.Provider, which you will still see in existing projects.",
      ],
      examples: [
        {
          id: "theme-context",
          classification: "complete",
          title: "A theme available to a whole subtree",
          language: "tsx",
          code: `import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

function ThemedLabel() {
  const theme = useContext(ThemeContext);

  return <p className={"label-" + theme}>Current theme: {theme}</p>;
}

function Sidebar() {
  return (
    <aside>
      <ThemedLabel />
    </aside>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <ThemeContext value={theme}>
      <Sidebar />
      <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Switch theme
      </button>
    </ThemeContext>
  );
}`,
          description: "Sidebar does not mention the theme at all. Keeping the value in state means every reader updates when it changes.",
        },
      ],
    },
    {
      id: "how-values-resolve",
      heading: "Which value a component reads",
      paragraphs: [
        "A component reads from the nearest matching provider above it. The rules resemble CSS inheritance, and different contexts do not interfere with each other.",
      ],
      list: [
        "The nearest provider above wins, and a nested provider overrides an outer one for its subtree.",
        "A provider in the same component as the useContext call does not count, because the search only goes upward.",
        "The default from createContext is used only when no provider exists above.",
        "A provider with value={undefined} gives undefined, not the default.",
      ],
    },
    {
      id: "when-not-to-use",
      heading: "When not to use context",
      paragraphs: [
        "Context is easy to overuse. Passing props through a few levels is not a problem in itself, and explicit data flow makes it clear which components use which data. Consider two alternatives first.",
      ],
      list: [
        "Pass props. A few levels are fine, and maintainers can follow them.",
        "Pass JSX as children. If middle components only forward data they do not use, restructure so the data skips them.",
      ],
      examples: [
        {
          id: "composition-instead",
          classification: "complete",
          title: "Composition removing a layer of props",
          language: "tsx",
          code: `import type { ReactNode } from "react";

interface Post {
  id: string;
  title: string;
}

function Layout({ children }: { children: ReactNode }) {
  return <main className="layout">{children}</main>;
}

function Posts({ posts }: { posts: readonly Post[] }) {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default function Page({ posts }: { posts: readonly Post[] }) {
  return (
    <Layout>
      <Posts posts={posts} />
    </Layout>
  );
}`,
          description: "Layout no longer needs a posts prop, because the data goes straight from Page to Posts.",
        },
      ],
      closing: "Good fits for context include theming, the current account, routing, and state shared by distant components, often paired with a reducer.",
    },
    {
      id: "update-cost",
      heading: "What a context update costs",
      paragraphs: [
        "When a provider’s value changes, React re-renders every component below that reads that context, and memo does not block this. React compares values with Object.is, so a new object literal counts as a change whenever the provider renders.",
        "If this proves to be a real cost, split the context so unrelated values do not update together, and memoize the provider’s value. Context does not replace all state management. It passes values through the tree, and it has no selectors, so readers cannot subscribe to only part of a value.",
      ],
      examples: [
        {
          id: "stable-value",
          classification: "complete",
          title: "A stable context value",
          language: "tsx",
          code: `import { createContext, useMemo, useState, type ReactNode } from "react";

interface Session {
  user: string;
  signOut: () => void;
}

export const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState("Ana");
  const value = useMemo(() => ({ user, signOut: () => setUser("") }), [user]);

  return <SessionContext value={value}>{children}</SessionContext>;
}`,
          description: "Without useMemo, each render of the provider would create a new object and update every reader. This is an optimization rather than a requirement.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "context-everywhere",
      heading: "Reaching for context at the first sign of prop passing",
      problem: "Two or three levels of props feel repetitive, so context seems cleaner. But it hides where data comes from and ties components to a provider, which makes them harder to reuse and to test.",
      correction: "Keep passing props, or restructure with children, and adopt context when those stop working well.",
    },
    {
      id: "provider-same-component",
      heading: "Expecting useContext to see a provider in the same component",
      problem: "Providing a value and reading it within one component returns the outer value or the default. It looks as if the provider is broken, but the search only goes upward from the caller.",
      correction: "Move the reading code into a child component rendered inside the provider.",
    },
    {
      id: "new-object-value",
      heading: "Passing a new object on every render",
      problem: "value={{ user, signOut }} creates a new object each time the provider renders. Under Object.is, that is a change, so every reader re-renders even when nothing inside is different.",
      correction: "Memoize the value when it is a measured problem, or split contexts that change at different rates.",
    },
    {
      id: "default-confusion",
      heading: "Treating the default as a fallback for undefined",
      problem: "A provider with value={undefined} returns undefined to readers, and the default is ignored. A missing value prop, or a misspelled one such as theme=, causes the same surprise.",
      correction: "Always pass value explicitly. Remember the default only applies when there is no provider at all.",
    },
    {
      id: "context-as-store",
      heading: "Treating context as a complete state manager",
      problem: "One large context holding everything looks like a simple store. But every reader updates on any change, since there are no selectors, so unrelated parts of the page re-render together.",
      correction: "Keep contexts focused and separate, and keep state local whenever it can be.",
    },
  ],
  interview: [
    {
      id: "what-context-does",
      question: "What problem does context solve?",
      answer: "It lets a parent provide a value to any component below without passing props through every level. It suits data needed widely or by distant components, such as a theme or the current user, where intermediate components have no use for it.",
    },
    {
      id: "context-vs-props",
      question: "When would you avoid context and just pass props?",
      answer: "When only a few levels are involved, or when composition with children can remove the middle layers. Props make data flow explicit, and they keep components reusable. Context adds an implicit dependency, so I would rather add it only when simpler options fall short.",
    },
    {
      id: "nearest-provider",
      question: "How does a component decide which provider’s value to read?",
      answer: "It uses the nearest provider above it for that context, and a nested one overrides an outer one. The search only goes upward, so a provider in the same component does not count. Without any provider, it gets the default.",
    },
    {
      id: "context-rerenders",
      question: "How do context changes affect rendering?",
      answer: "When the value changes under Object.is, every component reading that context re-renders, even if it is wrapped in memo. That is why new object literals are a problem. Splitting contexts and memoizing the value both reduce the cost.",
    },
    {
      id: "context-vs-redux",
      question: "Is context a replacement for a state management library?",
      answer: "Not directly. Context transports a value, and something else, such as useState or useReducer, still holds it. It has no selectors, so readers cannot subscribe to a part of it. For frequently changing shared state, an external store may fit better.",
    },
    {
      id: "default-value-use",
      question: "What is the default value in createContext for?",
      answer: "It is used when a component reads the context with no provider above it. A sensible default keeps components working without setup, which helps in tests. It never changes, so anything dynamic needs a provider with state.",
    },
  ],
  takeaways: [
    "Context passes a value to a subtree without threading props.",
    "Readers get the nearest provider above them.",
    "Try props and composition before context.",
    "A changed value re-renders every reader, and memo does not block it.",
  ],
  quickReview: {
    definition: "Context lets a component provide a value to everything below it, without passing props through each level.",
    keyPoints: [
      "createContext, then render it as a provider, then read with useContext.",
      "The nearest provider above wins.",
      "The default applies only when there is no provider.",
      "Readers re-render when the value changes under Object.is.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Reading a context",
      language: "tsx",
      code: `import { createContext, useContext } from "react";

const LocaleContext = createContext("en");

export default function Greeting() {
  const locale = useContext(LocaleContext);

  return <p>Language: {locale}</p>;
}`,
      description: "With no provider above, this reads the default of \"en\".",
    },
    commonMistakes: [
      "Adopting context before trying props or composition.",
      "Providing and reading in the same component.",
      "Passing a new object value on every render.",
    ],
    interviewTrap: "“Does memo stop context updates?” No. A component that reads a context re-renders when its value changes, regardless of memo.",
    takeaway: "Use context for widely needed values, and keep explicit props as the default.",
  },
  sources: [
    { label: "Passing Data Deeply with Context", href: "https://react.dev/learn/passing-data-deeply-with-context" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
