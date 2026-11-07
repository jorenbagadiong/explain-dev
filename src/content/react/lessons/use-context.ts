import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-use-context-does",
      heading: "What useContext does",
      paragraphs: [
        "useContext reads a context and subscribes the component to it. You pass it a context object, and it returns the value from the closest provider of that context above the calling component. Call it at the top level of a component or custom Hook.",
        "If there is no provider above, it returns the default given to createContext. This lesson covers the Hook itself. The Context and data flow lesson covers when context is the right tool at all.",
      ],
      examples: [
        {
          id: "read-context",
          classification: "complete",
          title: "Reading and updating a context",
          language: "tsx",
          code: `import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function Panel() {
  const theme = useContext(ThemeContext);

  return <section className={"panel-" + theme}>The {theme} panel</section>;
}

export default function Page() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext value={theme}>
      <Panel />
      <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Switch theme
      </button>
    </ThemeContext>
  );
}`,
          description: "The context is rendered directly as the provider. Because the value comes from state, changing it re-renders Panel. The default of \"light\" is unused here, since a provider exists.",
        },
      ],
    },
    {
      id: "how-lookup-works",
      heading: "How the lookup works",
      paragraphs: [
        "useContext only searches upward. A provider rendered by the same component that calls useContext has no effect on that call, which often surprises people the first time.",
        "Nested providers override outer ones for their subtree, so the innermost wins. The object you provide and the object you read must be exactly the same reference, which build setups can break when they duplicate a module, for example through symlinks.",
      ],
      list: [
        "The provider must be above the caller, not in the same component.",
        "A missing provider gives the default.",
        "value={undefined} gives undefined, not the default.",
        "A misspelled prop such as theme={theme} also leaves value undefined.",
      ],
    },
    {
      id: "custom-hook-pattern",
      heading: "Wrapping a context in a custom Hook",
      paragraphs: [
        "A small custom Hook keeps callers simple, and it can check for a missing provider. When a context has no sensible default, use null and throw a clear error, rather than letting a confusing failure appear later.",
      ],
      examples: [
        {
          id: "context-hook",
          classification: "complete",
          title: "A checked context Hook",
          language: "tsx",
          code: `import { createContext, useContext, useState, type ReactNode } from "react";

interface Cart {
  count: number;
  add: () => void;
}

const CartContext = createContext<Cart | null>(null);

export function useCart(): Cart {
  const cart = useContext(CartContext);
  if (cart === null) throw new Error("useCart must be used inside CartProvider");
  return cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return <CartContext value={{ count, add: () => setCount(previous => previous + 1) }}>{children}</CartContext>;
}`,
          description: "Callers get a non-null Cart, and a missing provider fails with a clear message. The new object each render is acceptable until it is measured to be a cost.",
        },
      ],
    },
    {
      id: "rendering-behavior",
      heading: "How context affects rendering",
      paragraphs: [
        "When a provider’s value changes, React re-renders every descendant that reads that context, and memo does not block this. Skipping memoized components in between does not matter, because the update reaches readers directly.",
        "React compares values with Object.is. So value={{ user, login }} counts as changed whenever the provider renders, even if the contents are identical. If that is a measured problem, memoize the object with useMemo and the functions with useCallback. It is an optimization, not a requirement.",
      ],
      examples: [
        {
          id: "memoized-value",
          classification: "complete",
          title: "Memoizing the provided value",
          language: "tsx",
          code: `import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

interface Auth {
  user: string | null;
  login: (name: string) => void;
}

export const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const login = useCallback((name: string) => setUser(name), []);
  const value = useMemo(() => ({ user, login }), [user, login]);

  return <AuthContext value={value}>{children}</AuthContext>;
}`,
          description: "Readers now update only when user changes, and not whenever the provider’s parent renders.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "same-component-provider",
      heading: "Reading a context in the component that provides it",
      problem: "Calling useContext and rendering the provider in one component returns the outer value or the default. It looks as if the provider is ignored, but the Hook only looks at what is above the caller.",
      correction: "Render a child inside the provider, and call useContext there.",
    },
    {
      id: "memo-blocks-context",
      heading: "Expecting memo to stop context updates",
      problem: "A memo-wrapped component that reads a context still re-renders when the value changes. Trying to stop this with memo does nothing, since memo only compares props, and context is a separate input.",
      correction: "Split the context, memoize the value, or move the read into a smaller child.",
    },
    {
      id: "undefined-value",
      heading: "Passing undefined to the provider",
      problem: "A forgotten value prop, or one under the wrong name, provides undefined to everyone below. Since a provider exists, the default is not used, and readers crash with errors that look unrelated.",
      correction: "Always pass value explicitly, and use a checked custom Hook where it helps.",
    },
    {
      id: "conditional-use-context",
      heading: "Calling useContext conditionally",
      problem: "useContext follows the Rules of Hooks, so calling it inside a condition or loop changes the Hook order between renders. React reports an error, or the wrong values may be returned.",
      correction: "Call it at the top level. If you need conditional reading, the use API can read a context conditionally.",
    },
    {
      id: "new-context-per-render",
      heading: "Creating a context inside a component",
      problem: "createContext inside a component body produces a new context on each render. Providers and readers then hold different references, so readers fall back to the default and the value never arrives.",
      correction: "Create contexts at module level, usually in their own file.",
    },
  ],
  interview: [
    {
      id: "use-context-returns",
      question: "What does useContext return?",
      answer: "The value passed to the closest provider of that context above the calling component, or the createContext default if there is none. It also subscribes the component, so it re-renders when that value changes.",
    },
    {
      id: "provider-not-seen",
      question: "Why might useContext not see a provider?",
      answer: "The provider may be in the same component or below it, since the search only goes upward. It could be missing, the value prop may be misspelled, or a duplicated module may have produced two context objects with different identities.",
    },
    {
      id: "context-memo-q",
      question: "Does React.memo prevent re-renders from context?",
      answer: "No. A component that reads a context re-renders when the value changes, whatever memo does. memo compares props only, so splitting contexts or memoizing the provided value are the tools that actually help.",
    },
    {
      id: "object-value-rerender",
      question: "Why can passing an object to a provider cause extra re-renders?",
      answer: "React compares the value with Object.is, and an object literal is new each time the provider renders, even with identical contents. So all readers update. useMemo around the object, with useCallback for functions, keeps it stable.",
    },
    {
      id: "default-when-used",
      question: "When is the createContext default used?",
      answer: "Only when no matching provider exists above the reader. It is not used for a provider with an undefined value. Defaults never change, so a useful one keeps components working in tests, and dynamic values need state in a provider.",
    },
    {
      id: "use-vs-use-context",
      question: "How does use(Context) differ from useContext?",
      answer: "Both read the nearest provider. The use API can also be called inside conditions and loops, while useContext must be at the top level like other Hooks. Otherwise, useContext remains a fine default for ordinary reading.",
    },
  ],
  takeaways: [
    "useContext reads the nearest provider above the caller.",
    "The default applies only when no provider exists.",
    "Readers re-render when the value changes, even inside memo.",
    "Wrap contexts in custom Hooks to give clearer errors.",
  ],
  quickReview: {
    definition: "useContext reads and subscribes to the nearest provider’s value for a given context.",
    keyPoints: [
      "It searches upward only.",
      "Values are compared with Object.is.",
      "memo does not block context updates.",
      "It must be called at the top level.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A provider and a reader",
      language: "tsx",
      code: `import { createContext, useContext } from "react";

const SizeContext = createContext(16);

function Text() {
  const size = useContext(SizeContext);

  return <p style={{ fontSize: size }}>Hello</p>;
}

export default function Page() {
  return (
    <SizeContext value={20}>
      <Text />
    </SizeContext>
  );
}`,
      description: "Text reads 20 from the provider above, not the default of 16.",
    },
    commonMistakes: [
      "Providing and reading in one component.",
      "Expecting memo to block context updates.",
      "Providing undefined, and expecting the default.",
    ],
    interviewTrap: "“If a provider passes undefined, do readers get the default?” No. The default only applies when no provider exists at all.",
    takeaway: "Know where the value comes from: the nearest provider above, and nothing else.",
  },
  sources: [
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
    { label: "Passing Data Deeply with Context", href: "https://react.dev/learn/passing-data-deeply-with-context" },
  ],
};
