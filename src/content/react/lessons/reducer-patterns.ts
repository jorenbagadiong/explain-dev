import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "why-reducers",
      heading: "Why move update logic into a reducer",
      paragraphs: [
        "As a component grows, its state updates can spread across many event handlers. A reducer gathers them into one function outside the component, separating what happened from how state changes in response.",
        "Handlers then only announce events, such as a task being added, and the reducer decides what that means for state. You can read every possible change in one place.",
      ],
    },
    {
      id: "actions-and-reducers",
      heading: "Actions and the reducer function",
      paragraphs: [
        "An action is a plain object describing what the user did. By convention it has a string type, and it should contain the minimal information about what happened. A reducer takes the current state and an action and returns the next state.",
        "Discriminated unions fit actions well in TypeScript. Each case narrows to the fields that action has, and a missing case can be caught at compile time.",
      ],
      examples: [
        {
          id: "task-reducer",
          classification: "complete",
          title: "A typed reducer",
          language: "tsx",
          code: `import { useReducer } from "react";

interface Task {
  id: number;
  text: string;
  isDone: boolean;
}

type TaskAction =
  | { type: "added"; id: number; text: string }
  | { type: "toggled"; id: number }
  | { type: "deleted"; id: number };

let nextId = 1;

export function tasksReducer(tasks: readonly Task[], action: TaskAction): readonly Task[] {
  switch (action.type) {
    case "added":
      return [...tasks, { id: action.id, text: action.text, isDone: false }];
    case "toggled":
      return tasks.map(task => (task.id === action.id ? { ...task, isDone: !task.isDone } : task));
    case "deleted":
      return tasks.filter(task => task.id !== action.id);
  }
}

export default function TaskList() {
  const [tasks, dispatch] = useReducer(tasksReducer, []);

  return (
    <>
      <button type="button" onClick={() => dispatch({ type: "added", id: nextId++, text: "New task" })}>
        Add task
      </button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <label>
              <input type="checkbox" checked={task.isDone} onChange={() => dispatch({ type: "toggled", id: task.id })} />
              {task.text}
            </label>
            <button type="button" onClick={() => dispatch({ type: "deleted", id: task.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}`,
          description: "All the state logic is in tasksReducer, and the component only dispatches. Exporting the reducer means it can be tested on its own. The ID is created in the event handler and carried by the action, which keeps the reducer pure.",
        },
      ],
    },
    {
      id: "migrating",
      heading: "Moving from useState to a reducer",
      paragraphs: ["You can convert a component in three small steps, testing as you go."],
      visual: {
        heading: "The migration",
        context: "Each step leaves the component working.",
        steps: [
          { id: "dispatch", title: "Dispatch actions", description: "Handlers describe what happened instead of setting state." },
          { id: "write", title: "Write a reducer", description: "Move each update into a case that returns the next state." },
          { id: "use", title: "Use the reducer", description: "Replace useState with useReducer in the component." },
        ],
        note: "The two Hooks are equivalent in power, so you can convert in either direction and mix them in one component.",
      },
    },
    {
      id: "writing-good-reducers",
      heading: "Writing good reducers",
      paragraphs: [
        "Two rules matter most. First, reducers must be pure, because they run during rendering. They should not send requests or set timers, and they must not mutate state. Strict Mode calls them twice in development to help reveal this.",
        "Second, each action should describe a single user interaction, even if it changes many fields. Pressing Reset on a form should dispatch one reset_form action, not five set_field actions. A log of actions then tells you exactly what the user did.",
      ],
      examples: [
        {
          id: "side-effect-placement",
          classification: "snippet",
          title: "Side effects stay in the handler",
          language: "tsx",
          code: `function handleDelete(id: number) {
  dispatch({ type: "deleted", id });
  void saveDeletion(id);
}`,
          typecheckContext: { before: `declare const dispatch: (action: { type: "deleted"; id: number }) => void;\ndeclare const saveDeletion: (id: number) => Promise<void>;` },
          description: "The handler updates state and starts the request. The reducer only calculates the next state.",
        },
      ],
    },
    {
      id: "choosing-a-reducer",
      heading: "useState or useReducer?",
      paragraphs: [
        "Neither one is better. Reducers suit state with many related transitions or several handlers doing similar things, and they make bugs easier to trace by logging actions. Plain state is shorter and easier to read for simple values.",
      ],
      comparison: [
        {
          id: "use-state",
          title: "useState fits when",
          items: ["State is independent and simple.", "There are few ways it can change.", "The update logic is short enough to read inline."],
        },
        {
          id: "use-reducer",
          title: "useReducer fits when",
          items: ["Several handlers update state in similar ways.", "One event changes several values together.", "You keep hitting bugs from incorrect updates and want more structure."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "impure-reducer",
      heading: "Doing side effects in a reducer",
      problem: "Showing an alert or sending a request from a reducer looks tidy because the logic is all in one place. But reducers run during rendering, so that side effect can fire at unexpected times, and twice under Strict Mode.",
      correction: "Do the side effect in the event handler, and keep the reducer as a pure calculation.",
    },
    {
      id: "mutating-state-reducer",
      heading: "Mutating state and returning it",
      problem: "state.count++ followed by return state changes the old state and returns the same reference. Under an Object.is comparison, React can skip the render, so the update appears to have been ignored.",
      correction: "Return a new object, as in return { ...state, count: state.count + 1 }.",
    },
    {
      id: "dropping-fields",
      heading: "Forgetting to copy other fields",
      problem: "Returning { count: 1 } from a reducer replaces the whole state. Every other field becomes undefined, which often surfaces later as a crash or as a controlled input warning.",
      correction: "Spread the previous state first, and let TypeScript’s return type catch missing fields.",
    },
    {
      id: "setter-shaped-actions",
      heading: "Writing actions that just set fields",
      problem: "A set_field action for everything turns the reducer into a thin wrapper around useState. It adds ceremony, while the logic for what an event means goes back into the handlers.",
      correction: "Name actions after what happened, such as checked_out, and put the consequences in the reducer.",
    },
    {
      id: "reading-after-dispatch",
      heading: "Reading state right after dispatching",
      problem: "dispatch schedules a render rather than changing the variable, so state on the next line still holds the old value. Decisions based on it use stale data.",
      correction: "If you need the next state now, call the reducer yourself with the same action to compute it.",
    },
  ],
  interview: [
    {
      id: "reducer-definition",
      question: "What is a reducer in React?",
      answer: "It is a pure function that takes the current state and an action and returns the next state. Used with useReducer, it moves update logic out of event handlers, which then only dispatch a description of what happened.",
    },
    {
      id: "when-reducer",
      question: "When would you choose useReducer over useState?",
      answer: "When several handlers update state in similar ways, when one event changes multiple values, or when update bugs keep appearing and I want one place to look. For a simple independent value, useState is clearer, and the two can be mixed.",
    },
    {
      id: "why-pure-reducer",
      question: "Why must a reducer be pure?",
      answer: "It runs during rendering, and React may call it more than once. Strict Mode calls it twice in development to expose problems. A pure reducer also needs no component to run, so it can be tested with plain inputs and outputs.",
    },
    {
      id: "one-action",
      question: "How should you design reducer actions?",
      answer: "Each action should describe one user interaction, using a name for what happened rather than which field to set. Pressing Reset dispatches one action, even if five fields change. That also makes an action log read like a history of what the user did.",
    },
    {
      id: "reducer-testing",
      question: "How does a reducer make testing easier?",
      answer: "It is a plain function with no dependency on a component, so you can export it and test transitions directly: given this state and action, expect this result. Complex logic is then covered without rendering anything.",
    },
    {
      id: "reducer-typescript",
      question: "How would you type actions in TypeScript?",
      answer: "With a discriminated union keyed on type. Each switch case narrows to that action’s fields, so it cannot read a field that action does not have. With a declared return type, leaving a case out becomes a compile error too.",
    },
  ],
  takeaways: [
    "Reducers separate what happened from how state changes.",
    "Reducers must be pure, and side effects stay in handlers.",
    "Each action describes one user interaction.",
    "Neither useState nor useReducer is better, so choose by the shape of the logic.",
  ],
  quickReview: {
    definition: "A reducer is a pure function that turns the current state and an action into the next state.",
    keyPoints: [
      "Handlers dispatch actions and do not calculate state.",
      "Actions name events, not fields.",
      "Discriminated unions make actions safe in TypeScript.",
      "Reducers can be tested without rendering.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A small reducer",
      language: "tsx",
      code: `type Action = { type: "incremented" } | { type: "reset" };

export function counter(count: number, action: Action): number {
  switch (action.type) {
    case "incremented":
      return count + 1;
    case "reset":
      return 0;
  }
}`,
      description: "A pure function with no React in it: state and action in, next state out.",
    },
    commonMistakes: [
      "Sending requests from inside a reducer.",
      "Mutating state and returning the same reference.",
      "Dispatching one action per field instead of one per interaction.",
    ],
    interviewTrap: "“Is useReducer more powerful than useState?” No. They are equivalent. A reducer only organizes the logic differently.",
    takeaway: "Reach for a reducer when you need one place to answer: what can happen to this state?",
  },
  sources: [
    { label: "Extracting State Logic into a Reducer", href: "https://react.dev/learn/extracting-state-logic-into-a-reducer" },
    { label: "useReducer reference", href: "https://react.dev/reference/react/useReducer" },
  ],
};
