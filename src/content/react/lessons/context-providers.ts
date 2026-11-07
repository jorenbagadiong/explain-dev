import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "provider-components",
      heading: "Wrapping context in a provider component",
      paragraphs: [
        "As an application grows, the wiring for a context, its state, and its reducer can clutter whichever component owns them. A provider component gathers it in one place. It holds the state, provides the contexts, and accepts children.",
        "The rest of the app then contains only layout. Components below read through a small custom Hook, and they do not need to know how the value is managed.",
      ],
      examples: [
        {
          id: "tasks-provider",
          classification: "complete",
          title: "A provider with a reducer and custom Hooks",
          language: "tsx",
          code: `import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

type TaskAction = { type: "added"; text: string } | { type: "cleared" };

function tasksReducer(tasks: readonly string[], action: TaskAction): readonly string[] {
  switch (action.type) {
    case "added":
      return [...tasks, action.text];
    case "cleared":
      return [];
  }
}

const TasksContext = createContext<readonly string[] | null>(null);
const TasksDispatchContext = createContext<Dispatch<TaskAction> | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);

  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}

export function useTasks() {
  const tasks = useContext(TasksContext);
  if (tasks === null) throw new Error("useTasks must be used inside TasksProvider");
  return tasks;
}

export function useTasksDispatch() {
  const dispatch = useContext(TasksDispatchContext);
  if (dispatch === null) throw new Error("useTasksDispatch must be used inside TasksProvider");
  return dispatch;
}`,
          description: "Everything about tasks lives in one module. Exporting only the provider and Hooks means you can split the contexts or add logic later without touching callers.",
        },
      ],
    },
    {
      id: "placement",
      heading: "Placing providers deliberately",
      paragraphs: [
        "A provider does not have to go at the root. Place it as low as it can go while still covering everything that reads it. A context used by one feature belongs around that feature, not around the whole app.",
        "Lower placement limits how much of the tree re-renders on an update, and it lets a provider’s state reset naturally when the feature unmounts. It also allows different parts of the page to have different values.",
      ],
      visual: {
        heading: "Scoping providers to who needs them",
        context: "Indentation shows nesting in the tree.",
        root: {
          id: "app",
          title: "ThemeProvider",
          description: "App-wide, because nearly every component reads the theme.",
          children: [
            {
              id: "shell",
              title: "AppShell",
              description: "Shared layout that needs no feature state.",
              children: [
                { id: "editor-provider", title: "EditorProvider", description: "Wraps only the editor, so its frequent updates stay contained." },
                { id: "reports", title: "ReportsPage", description: "Never reads editor state, so it is unaffected." },
              ],
            },
          ],
        },
        note: "An app can have many context and reducer pairs. There is no need for one global provider.",
      },
    },
    {
      id: "focused-values",
      heading: "Keeping values focused",
      paragraphs: [
        "A context has no selectors, so every reader re-renders when the value changes under Object.is, whichever part it uses. One large context that combines unrelated data therefore makes unrelated components update together.",
        "Split by how often things change and by who uses them. Separating state from dispatch is a common example, because components that only send actions then do not re-render when state changes.",
      ],
      comparison: [
        {
          id: "one-big",
          title: "One large context",
          items: ["User, theme, cart, and notifications together.", "Any change updates every reader.", "Hard to see who depends on what."],
        },
        {
          id: "focused",
          title: "Focused contexts",
          items: ["One concern each.", "Updates reach only relevant readers.", "Easy to move or remove one later."],
        },
      ],
    },
    {
      id: "stable-provider-values",
      heading: "Keeping provided objects stable",
      paragraphs: [
        "If a provider re-renders for reasons unrelated to its value, an object literal still counts as a new value. Children passed through the children prop are unaffected, but readers are not. Memoizing the object with useMemo prevents this, and it is an optimization to add when you measure a problem, not a requirement.",
      ],
      examples: [
        {
          id: "memo-value",
          classification: "complete",
          title: "A stable object value",
          language: "tsx",
          code: `import { createContext, useMemo, useState, type ReactNode } from "react";

interface Theme {
  mode: "light" | "dark";
  toggle: () => void;
}

export const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Theme["mode"]>("light");
  const value = useMemo<Theme>(
    () => ({ mode, toggle: () => setMode(previous => (previous === "light" ? "dark" : "light")) }),
    [mode],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}`,
          description: "The value changes only when mode does, so readers skip unrelated renders of the provider’s parent.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "all-at-root",
      heading: "Putting every provider at the root",
      problem: "A stack of providers in the root file is easy to find, but a feature’s state then lives forever, is hard to reset, and any frequent updates reach further than necessary.",
      correction: "Place each provider around only the components that read it.",
    },
    {
      id: "god-context",
      heading: "Combining unrelated values in one context",
      problem: "A single AppContext is convenient to write. Since readers cannot subscribe to part of it, a notification count changing re-renders components that only wanted the user’s name.",
      correction: "Split contexts by concern and by how often values change.",
    },
    {
      id: "exporting-raw-context",
      heading: "Exporting the raw context everywhere",
      problem: "Calling useContext(TasksContext) throughout the app ties every file to that context and leaves null checks in each caller. A later split or change then has to touch all of them.",
      correction: "Export a small custom Hook from the provider’s module, and check for a missing provider there.",
    },
    {
      id: "duplicate-provider-state",
      heading: "Copying context values into local state",
      problem: "useState(useContext(ThemeContext)) stops following the provider after the first render, so that component shows an old value forever and quietly disagrees with everything else.",
      correction: "Read from context directly, and derive what you need during rendering.",
    },
    {
      id: "memo-everything-provider",
      heading: "Memoizing provider values without a reason",
      problem: "Wrapping every value in useMemo and useCallback adds code and dependency lists that need maintaining. If the provider only re-renders when its value changes anyway, none of this saves anything.",
      correction: "Add memoization when measurement shows unnecessary reader updates.",
    },
  ],
  interview: [
    {
      id: "cp-why-wrap",
      question: "Why wrap context in a dedicated provider component?",
      answer: "It keeps state, reducer, and context wiring in one module, so the rest of the app reads as layout. Together with custom Hooks, it hides how the value is managed, which lets you change the implementation later without touching callers.",
    },
    {
      id: "cp-placement",
      question: "Where should a context provider go in the tree?",
      answer: "As low as possible while still covering every reader. That limits how much of the tree re-renders, ties the state’s lifetime to the feature, and allows different values in different areas. Truly global concerns such as a theme can go near the root.",
    },
    {
      id: "cp-split",
      question: "When should you split a context?",
      answer: "When unrelated values change at different rates or are read by different components. Without selectors, any change re-renders every reader. Splitting state from dispatch is a common case, since dispatch never changes.",
    },
    {
      id: "cp-custom-hook",
      question: "Why expose a custom Hook rather than the context itself?",
      answer: "It gives callers a simple name, handles the missing-provider check in one place, and gives non-null types. It also keeps the option open to split contexts later or change the source, without any edits to the calling code.",
    },
    {
      id: "cp-reducer-pairing",
      question: "Why are reducers and context often used together?",
      answer: "The reducer centralizes the update logic, while context delivers state and dispatch to distant components. Together they avoid prop drilling for state with many transitions. An application can have many such pairs, one per concern, rather than a single global one.",
    },
    {
      id: "cp-store",
      question: "When would you use an external store instead of context?",
      answer: "When state changes frequently and many components read only parts of it, since context cannot let them subscribe to a part. An external store with selectors can update fewer components. For infrequently changing values, context is usually simple and sufficient.",
    },
  ],
  takeaways: [
    "Gather context wiring in a provider component with custom Hooks.",
    "Place providers as low as possible.",
    "Keep each context focused on one concern.",
    "Memoize provided objects when measurement calls for it.",
  ],
  quickReview: {
    definition: "A context provider architecture puts state, contexts, and Hooks in one module, and scopes each provider to those who need it.",
    keyPoints: [
      "Export a provider and Hooks, not the raw context.",
      "Every reader re-renders when the value changes.",
      "Separating state and dispatch is a common split.",
      "Many focused providers beat one global one.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A checked Hook",
      language: "tsx",
      code: `import { createContext, useContext } from "react";

const CartContext = createContext<number | null>(null);

export function useCartCount() {
  const count = useContext(CartContext);
  if (count === null) throw new Error("useCartCount needs a provider");
  return count;
}`,
      description: "Callers get a number, and a missing provider fails with a clear message.",
    },
    commonMistakes: [
      "Stacking all providers at the root.",
      "One context that holds everything.",
      "Copying a context value into local state.",
    ],
    interviewTrap: "“Should all providers go at the root?” No. Lower placement limits re-renders, and it ties state to the feature that uses it.",
    takeaway: "Scope each provider to its readers, and keep its value about one thing.",
  },
  sources: [
    { label: "Scaling Up with Reducer and Context", href: "https://react.dev/learn/scaling-up-with-reducer-and-context" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
    { label: "Passing Data Deeply with Context", href: "https://react.dev/learn/passing-data-deeply-with-context" },
  ],
};
