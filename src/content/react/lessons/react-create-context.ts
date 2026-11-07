import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-create-context-does",
      heading: "What createContext does",
      paragraphs: [
        "createContext creates a context object that components can provide or read: const SomeContext = createContext(defaultValue). It is an API from react rather than a Hook, so it does not follow the Rules of Hooks, and it is called outside of any component.",
        "The returned object holds no data itself. It is an identifier for which context components are providing or reading. The values live in providers further down.",
      ],
      examples: [
        {
          id: "creating-context",
          classification: "complete",
          title: "Creating, providing, and reading",
          language: "tsx",
          code: `import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("light");

function Toolbar() {
  const theme = useContext(ThemeContext);

  return <p>Theme: {theme}</p>;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <ThemeContext value={theme}>
      <Toolbar />
      <button type="button" onClick={() => setTheme("light")}>
        Use light theme
      </button>
    </ThemeContext>
  );
}`,
          description: "createContext runs once at module level. State in App supplies a value that can change.",
        },
      ],
    },
    {
      id: "default-value",
      heading: "The default value",
      paragraphs: [
        "defaultValue is what components receive when no matching provider exists above them. It is a static last resort that never changes, so calling createContext(\"light\") does not create something you can update. To make a value change, add state and render a provider.",
        "If there is no meaningful default, pass null. In TypeScript, that means including null in the type, and a checked custom Hook can remove it for callers.",
      ],
      examples: [
        {
          id: "null-default",
          classification: "complete",
          title: "A context with no meaningful default",
          language: "tsx",
          code: `import { createContext, useContext } from "react";

interface User {
  name: string;
}

export const AuthContext = createContext<User | null>(null);

export function useCurrentUser(): User {
  const user = useContext(AuthContext);
  if (user === null) throw new Error("useCurrentUser must be used inside an AuthContext provider");
  return user;
}`,
          description: "The type admits null, while callers of the Hook get a guaranteed User.",
        },
      ],
    },
    {
      id: "the-context-object",
      heading: "What the object contains",
      paragraphs: [
        "The object’s main use is rendering it as a provider. Two older properties also exist, and you will see both in existing code.",
      ],
      comparison: [
        {
          id: "modern",
          title: "Modern, React 19",
          items: ["<ThemeContext value={theme}> provides a value.", "useContext(ThemeContext) reads it."],
        },
        {
          id: "legacy",
          title: "Legacy",
          items: ["<ThemeContext.Provider value={theme}> was required before React 19.", "<ThemeContext.Consumer> read a value through a render function, and new code should use useContext."],
        },
      ],
    },
    {
      id: "organizing",
      heading: "Organizing contexts across files",
      paragraphs: [
        "Contexts are usually shared by several files, so declare them in their own module and export them, just like components. A single module per feature keeps related contexts, providers, and Hooks together.",
        "Reading and providing must use exactly the same object. If a build tool produces duplicate copies of a module, for example through symlinks, the two will not match, and readers will see only the default.",
      ],
    },
  ],
  mistakes: [
    {
      id: "inside-component",
      heading: "Calling createContext inside a component",
      problem: "A context created in a component body is a new object on each render. Providers and readers then hold different references, so readers get the default value and the data never arrives.",
      correction: "Call it once at module level, outside any component.",
    },
    {
      id: "changing-default",
      heading: "Trying to update the default value",
      problem: "Reassigning or expecting createContext(\"light\") to change does nothing, because the default is static. A common sign is a value that stays the same however you try to set it.",
      correction: "Keep the value in state, and pass it to a provider.",
    },
    {
      id: "thinks-hook",
      heading: "Treating createContext as a Hook",
      problem: "Its name appears alongside useContext, so it is often assumed to be a Hook. It is a regular API that runs once, and it has none of a Hook’s behavior, such as being tied to a component’s render.",
      correction: "Remember that it creates the object once, while useContext reads from it during rendering.",
    },
    {
      id: "old-provider-confusion",
      heading: "Assuming .Provider is still required",
      problem: "Most older tutorials use SomeContext.Provider, so developers may believe it is mandatory or that the shorter form is an error. In React 19, the context itself works as the provider.",
      correction: "Use the shorter form on React 19, and use .Provider on older versions.",
    },
  ],
  interview: [
    {
      id: "cc-what",
      question: "What does createContext do?",
      answer: "It creates a context object with a default value, and that object identifies the context for providing and reading. It holds no data itself. Values come from providers rendered further down, and components read them with useContext.",
    },
    {
      id: "cc-hook",
      question: "Is createContext a Hook?",
      answer: "No. It is a plain API, called outside of components, usually once per module. useContext is the Hook, and it reads the value during rendering. Calling createContext in a component would create a new context each render, and that would break reading.",
    },
    {
      id: "cc-default",
      question: "When is the default value used?",
      answer: "Only when no matching provider exists above the reader. It never changes, so it cannot be used for dynamic data. If there is no sensible default, use null and check for it in a custom Hook.",
    },
    {
      id: "cc-provider-19",
      question: "How did React 19 change providing a context?",
      answer: "You can render the context directly as a provider, as in <ThemeContext value={theme}>. Before React 19, you had to use ThemeContext.Provider. The older form still appears in many codebases and tutorials.",
    },
    {
      id: "cc-typescript",
      question: "How do you type a context with no meaningful default?",
      answer: "Use createContext<User | null>(null), so the type includes null. Then write a custom Hook that throws if the value is null, and returns the narrowed type, so callers do not repeat the check.",
    },
  ],
  takeaways: [
    "createContext is a plain API, called at module level.",
    "The returned object identifies a context and holds no data.",
    "The default is static, and it is only used without a provider.",
    "In React 19, render the context itself as the provider.",
  ],
  quickReview: {
    definition: "createContext creates a context object, with a static default, that components can provide and read.",
    keyPoints: [
      "It is not a Hook, and it belongs outside components.",
      "Use null when no default is meaningful.",
      ".Provider and .Consumer are the older forms.",
      "Providing and reading must use the same object.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Creating a context",
      language: "tsx",
      code: `import { createContext } from "react";

export const LocaleContext = createContext("en");`,
      description: "One object, exported from a module, with a static default.",
    },
    commonMistakes: [
      "Calling it inside a component.",
      "Expecting the default value to change.",
      "Treating it as a Hook.",
    ],
    interviewTrap: "“Can you change a context by changing its default?” No. The default never changes, so dynamic values need state and a provider.",
    takeaway: "Create the object once, then let providers and readers do the work.",
  },
  sources: [
    { label: "createContext reference", href: "https://react.dev/reference/react/createContext" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
