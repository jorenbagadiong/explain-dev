import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "signature",
      heading: "The useReducer signature",
      paragraphs: [
        "useReducer takes a reducer and an initial value and returns the current state and a dispatch function: const [state, dispatch] = useReducer(reducer, initialArg, init). The optional third argument computes the initial state from initialArg.",
        "dispatch takes one argument, the action, and returns nothing. React calls your reducer with the current state and that action, and it uses the result as the next state. This lesson focuses on how the Hook behaves, and the Organizing updates with reducers lesson covers how to design one.",
      ],
      examples: [
        {
          id: "counter-reducer",
          classification: "complete",
          title: "useReducer with a typed reducer",
          language: "tsx",
          code: `import { useReducer } from "react";

interface State {
  age: number;
  name: string;
}

type Action = { type: "incremented_age" } | { type: "renamed"; name: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "incremented_age":
      return { ...state, age: state.age + 1 };
    case "renamed":
      return { ...state, name: action.name };
  }
}

export default function Profile() {
  const [state, dispatch] = useReducer(reducer, { age: 30, name: "Ana" });

  return (
    <>
      <label>
        Name
        <input value={state.name} onChange={event => dispatch({ type: "renamed", name: event.target.value })} />
      </label>
      <button type="button" onClick={() => dispatch({ type: "incremented_age" })}>
        Age: {state.age}
      </button>
    </>
  );
}`,
          description: "Spreading state keeps the other field. Without it, the returned object would contain only what you listed.",
        },
      ],
    },
    {
      id: "dispatch-behavior",
      heading: "How dispatch behaves",
      paragraphs: [
        "dispatch follows the same snapshot rule as a state setter. It schedules a render and does not change the state variable in the running code, so reading state right after dispatch gives the old value.",
        "To preview the next value, call the reducer yourself with the same action. Because it is a pure function, this has no side effects.",
      ],
      examples: [
        {
          id: "preview-next",
          classification: "snippet",
          title: "Previewing the next state",
          language: "tsx",
          code: `const action = { type: "incremented" } as const;
const nextState = reducer(state, action);
dispatch(action);`,
          typecheckContext: { before: `type Action = { type: "incremented" };\ndeclare const state: number;\ndeclare const reducer: (state: number, action: Action) => number;\ndeclare const dispatch: (action: Action) => void;` },
          description: "nextState holds what the next render will see. state itself stays the same until then.",
        },
      ],
      closing: "If the reducer returns a value identical to the current state under Object.is, React skips re-rendering the component and its children.",
    },
    {
      id: "initial-state",
      heading: "Initializing expensive state",
      paragraphs: [
        "Passing createInitialState(username) as the second argument calls that function on every render, though only the first result is used. To run it once, pass the function itself as the third argument, and pass its input as the second.",
      ],
      examples: [
        {
          id: "lazy-init",
          classification: "complete",
          title: "An initializer function",
          language: "tsx",
          code: `import { useReducer } from "react";

interface Filter {
  owner: string;
  tags: readonly string[];
}

type FilterAction = { type: "tagged"; tag: string };

function createInitialFilter(owner: string): Filter {
  return { owner, tags: [] };
}

function reducer(state: Filter, action: FilterAction): Filter {
  return { ...state, tags: [...state.tags, action.tag] };
}

export default function FilterPanel({ owner }: { owner: string }) {
  const [filter, dispatch] = useReducer(reducer, owner, createInitialFilter);

  return (
    <button type="button" onClick={() => dispatch({ type: "tagged", tag: "react" })}>
      {filter.owner}: {filter.tags.length} tags
    </button>
  );
}`,
          description: "Pass createInitialFilter, not createInitialFilter(owner). If the initializer needs no input, pass null as the second argument.",
        },
      ],
    },
    {
      id: "purity",
      heading: "Purity and Strict Mode",
      paragraphs: [
        "The reducer and initializer must be pure. In development, Strict Mode calls each one twice and ignores one result, which helps reveal accidental mutation. It has no effect in production, and a pure reducer is not affected.",
        "Event handlers do not need to be pure, so requests and other side effects belong there.",
      ],
    },
    {
      id: "with-context",
      heading: "Combining useReducer and context",
      paragraphs: [
        "A reducer and context work well together when state and its updates are needed by distant components. The provider holds the reducer, and it passes state and dispatch down. dispatch keeps a stable identity between renders, so passing it does not trigger updates by itself.",
      ],
      examples: [
        {
          id: "reducer-context",
          classification: "complete",
          title: "Providing state and dispatch separately",
          language: "tsx",
          code: `import { createContext, useReducer, type Dispatch, type ReactNode } from "react";

type CartAction = { type: "added" } | { type: "cleared" };

function cartReducer(count: number, action: CartAction): number {
  return action.type === "added" ? count + 1 : 0;
}

export const CartCountContext = createContext(0);
export const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, dispatch] = useReducer(cartReducer, 0);

  return (
    <CartCountContext value={count}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartCountContext>
  );
}`,
          description: "Separate contexts let components that only dispatch avoid re-rendering when the count changes.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "mutating-reducer-state",
      heading: "Mutating state in the reducer",
      problem: "state.age++ followed by return state changes the object and returns the same reference. React sees no difference under Object.is, so the screen does not update, even though the data in memory has.",
      correction: "Return a new object with the change.",
    },
    {
      id: "missing-spread",
      heading: "Returning only the changed field",
      problem: "return { age: state.age + 1 } looks concise, but the returned object becomes the whole state, so name is gone. With TypeScript, the return type reports it. Without it, the bug appears later as undefined.",
      correction: "Spread the previous state, as in { ...state, age: state.age + 1 }.",
    },
    {
      id: "call-init",
      heading: "Calling the initializer in the argument",
      problem: "useReducer(reducer, createInitialState(name)) runs the function on every render and discards the result after the first. For anything expensive, this wastes work on each keystroke or update.",
      correction: "Pass the function as the third argument, with its input as the second.",
    },
    {
      id: "state-after-dispatch",
      heading: "Reading state immediately after dispatch",
      problem: "A log right after dispatch shows the old value, which looks as if the action was ignored. The running code still holds this render’s snapshot, and the new value only arrives with the next render.",
      correction: "Call the reducer yourself if you need the next value immediately.",
    },
    {
      id: "unknown-action",
      heading: "Silently ignoring unknown actions",
      problem: "A default case that returns state unchanged hides a misspelled action type. The click appears to do nothing, and no error points at the typo.",
      correction: "Use a discriminated union in TypeScript, or throw in the default case.",
    },
  ],
  interview: [
    {
      id: "use-reducer-signature",
      question: "What are useReducer’s arguments and return value?",
      answer: "A reducer, an initial argument, and an optional init function that computes the initial state from it. It returns the current state and a dispatch function. Dispatch takes one action, returns nothing, and is stable between renders.",
    },
    {
      id: "dispatch-immediate",
      question: "Does dispatch change state immediately?",
      answer: "No. It schedules a render, and the state variable stays the same in the running code. If I need the next value now, I can call the reducer myself with the same action, since it is a pure function.",
    },
    {
      id: "init-param",
      question: "What is the third argument to useReducer for?",
      answer: "It is an initializer that runs once. Passing createInitialState(x) as the second argument would run it on each render, even though only the first result is used. Passing x and createInitialState separately avoids that repeated work.",
    },
    {
      id: "reducer-bail",
      question: "When does useReducer skip a re-render?",
      answer: "When the reducer returns a value identical to the current state under Object.is. React skips rendering the component’s children, although it may still need to call the component once. A common accidental cause is mutating and returning the same object.",
    },
    {
      id: "reducer-context-q",
      question: "Why combine useReducer with context?",
      answer: "It lets distant components read state and dispatch actions without threading props. dispatch has a stable identity, so it can go in its own context, which means components that only dispatch do not re-render when state changes.",
    },
    {
      id: "strict-reducer",
      question: "Why does a reducer run twice in development?",
      answer: "Strict Mode calls reducers and initializers twice and ignores one result, to surface impure code such as mutation. It has no effect in production, and a correctly pure reducer gives the same result both times.",
    },
  ],
  takeaways: [
    "useReducer returns state and a stable dispatch function.",
    "dispatch schedules a render and does not change the current variable.",
    "Pass an initializer as the third argument to avoid repeated setup.",
    "Reducers must be pure, and they must return new objects.",
  ],
  quickReview: {
    definition: "useReducer manages state through a pure reducer and a dispatch function that sends it actions.",
    keyPoints: [
      "const [state, dispatch] = useReducer(reducer, initialArg, init).",
      "State is a snapshot, so dispatch does not change it right away.",
      "An identical returned value skips the re-render.",
      "Strict Mode calls the reducer twice in development.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A minimal useReducer",
      language: "tsx",
      code: `import { useReducer } from "react";

export default function Clicks() {
  const [clicks, addClick] = useReducer((count: number) => count + 1, 0);

  return (
    <button type="button" onClick={addClick}>
      {clicks} clicks
    </button>
  );
}`,
      description: "A reducer can be as small as this, though named actions are clearer as logic grows.",
    },
    commonMistakes: [
      "Mutating state and returning the same reference.",
      "Forgetting to spread the other fields.",
      "Calling the initializer in the second argument.",
    ],
    interviewTrap: "“Can you read the new state right after dispatch?” No. Call the reducer directly if you need that value in the same handler.",
    takeaway: "Treat useReducer like a setter that takes events, with the same snapshot rules.",
  },
  sources: [
    { label: "useReducer reference", href: "https://react.dev/reference/react/useReducer" },
    { label: "Extracting State Logic into a Reducer", href: "https://react.dev/learn/extracting-state-logic-into-a-reducer" },
    { label: "useContext reference", href: "https://react.dev/reference/react/useContext" },
  ],
};
