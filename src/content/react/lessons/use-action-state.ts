import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-it-does",
      heading: "What useActionState does",
      paragraphs: [
        "useActionState tracks the result and pending status of an Action. You give it a function and an initial state, and it returns the current state, a function to dispatch the Action, and an isPending flag: const [state, dispatchAction, isPending] = useActionState(reducerAction, initialState, permalink).",
        "It comes from the react package and is stable in React 19. Think of it as a reducer that is allowed to be asynchronous and to have side effects, in contrast with useReducer’s pure reducer.",
      ],
      comparison: [
        {
          id: "use-reducer",
          title: "useReducer",
          items: ["The reducer must be pure.", "The reducer is synchronous.", "Called twice in Strict Mode development.", "No built-in pending state."],
        },
        {
          id: "use-action-state",
          title: "useActionState",
          items: ["The action can have side effects.", "The action can be async.", "Not invoked twice in Strict Mode.", "Provides isPending."],
        },
      ],
    },
    {
      id: "arguments",
      heading: "The action’s arguments",
      paragraphs: [
        "Your function receives the previous state first and the payload second: reducerAction(previousState, actionPayload). previousState is initialState on the first call, then whatever the function last returned.",
        "When the dispatch function is used as a form’s action, the payload is the FormData. So the form data is the second argument, which is a common stumbling block when converting an existing form action.",
      ],
      examples: [
        {
          id: "form-action-state",
          classification: "client",
          title: "A form with validation and a pending state",
          language: "tsx",
          code: `"use client";

import { useActionState } from "react";

interface FormState {
  error: string | null;
  saved: boolean;
}

async function updateName(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim().length < 3) {
    return { error: "Name must be at least three characters.", saved: false };
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  return { error: null, saved: true };
}

export default function NameForm() {
  const [state, submitAction, isPending] = useActionState(updateName, { error: null, saved: false });

  return (
    <form action={submitAction}>
      <label>
        Name
        <input name="name" disabled={isPending} />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.saved && <p role="status">Saved.</p>}
    </form>
  );
}`,
          description: "The timeout stands in for a real request. Passing the dispatch function to action wraps the submission in a Transition for you. Failures that users can act on are returned as state rather than thrown.",
        },
      ],
    },
    {
      id: "transitions",
      heading: "Dispatching must happen inside a Transition",
      paragraphs: [
        "The dispatch function must run inside a Transition. Passing it to an Action prop such as form action handles this automatically. If you call it from an ordinary event handler, wrap the call in startTransition, or React logs a development error and isPending will not update correctly.",
        "Calling it during rendering is also an error, because that would cause an infinite loop.",
      ],
      examples: [
        {
          id: "manual-dispatch",
          classification: "client",
          title: "Dispatching from a click handler",
          language: "tsx",
          code: `"use client";

import { startTransition, useActionState } from "react";

async function addToCart(count: number): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return count + 1;
}

export default function AddButton() {
  const [count, dispatchAdd, isPending] = useActionState(addToCart, 0);

  return (
    <button type="button" disabled={isPending} onClick={() => startTransition(() => dispatchAdd())}>
      In cart: {count}
    </button>
  );
}`,
          description: "startTransition is imported from react. The dispatch function has a stable identity, so it is safe to pass down.",
        },
      ],
    },
    {
      id: "queueing",
      heading: "Dispatches run one at a time",
      paragraphs: [
        "Multiple dispatches are queued and run sequentially. Each receives the result of the previous one as previousState, so later calls wait for earlier ones. If you need work to happen in parallel, use useState with useTransition instead.",
        "If the function throws, React cancels all queued Actions and shows the nearest Error Boundary. To keep the queue running, catch expected errors and return an error state.",
      ],
      visual: {
        heading: "A queue of two dispatches",
        context: "This follows two quick clicks, starting from state 0.",
        steps: [
          { id: "first", title: "The first action runs", description: "It receives 0, and isPending is true." },
          { id: "second-waits", title: "The second waits", description: "It does not start until the first has finished." },
          { id: "second-runs", title: "The second action runs", description: "It receives the first’s result as previousState." },
          { id: "settle", title: "State settles", description: "isPending becomes false once the queue is empty." },
        ],
        note: "This is simplified. React batches multiple ongoing Actions together, which the docs describe as a current limitation that may change.",
      },
    },
    {
      id: "server-and-limits",
      heading: "Server Functions and other limits",
      paragraphs: [
        "The Hook also works with Server Functions in a framework that supports React Server Components. In that case, initialState and the payload must be serializable, and the optional permalink argument names the URL to navigate to if the form is submitted before the JavaScript bundle loads.",
        "There is no built-in reset. Handle a reset payload in your function, or change the component’s key to remount it. For instant feedback while an Action runs, combine this Hook with useOptimistic. Setting other state after an await inside the action currently needs its own startTransition.",
      ],
    },
  ],
  mistakes: [
    {
      id: "wrong-arg-order",
      heading: "Reading form data from the first argument",
      problem: "A function written as async (formData) => … worked as a plain form action. Under useActionState, the first argument becomes the previous state, so calling formData.get throws because state has no such method.",
      correction: "Declare (previousState, formData), and read the form data from the second argument.",
    },
    {
      id: "outside-transition",
      heading: "Calling dispatch outside a Transition",
      problem: "Calling the dispatch function directly from onClick looks equivalent to calling a setter. React logs that the async function was called outside of a transition, and isPending does not update as you would expect.",
      correction: "Pass it to a form action, or wrap the call in startTransition.",
    },
    {
      id: "throwing-validation",
      heading: "Throwing for expected validation failures",
      problem: "Throwing when a name is too short sends the user to an Error Boundary, replacing the form they were filling in. It also cancels any queued Actions, so ordinary input mistakes have a heavy outcome.",
      correction: "Return an error in the state for expected failures, and let only unexpected errors throw.",
    },
    {
      id: "parallel-expectation",
      heading: "Expecting dispatches to run in parallel",
      problem: "Clicking twice rapidly seems as if it should start two requests at once. They run in order, and each waits for the previous one, so slow requests make a long queue.",
      correction: "Use useState with useTransition when work must run in parallel, and disable the control while pending when one at a time is the intent.",
    },
    {
      id: "non-serializable",
      heading: "Passing non-serializable data to a Server Function",
      problem: "State that holds a class instance or a function can work in a Client Component, but it fails once the action is a Server Function, since values must be serialized to cross the network.",
      correction: "Use plain objects, arrays, strings, and numbers for initialState and payloads when the action runs on the server.",
    },
  ],
  interview: [
    {
      id: "uas-what",
      question: "What does useActionState return, and what is each item for?",
      answer: "A three-item array: the current state, which is initialState at first and then the action’s last result; a dispatch function that runs the action; and isPending, which is true while any dispatched Actions are running.",
    },
    {
      id: "uas-vs-reducer",
      question: "How does useActionState differ from useReducer?",
      answer: "useReducer’s reducer must be pure and synchronous, and it runs during rendering. useActionState’s function can be async and can have side effects, and it is not double-invoked in Strict Mode. It also tracks pending status and queues dispatches sequentially.",
    },
    {
      id: "uas-transition",
      question: "Why must the dispatch function be called inside a Transition?",
      answer: "The Hook relies on Transitions to track pending work. A form’s action prop or startTransition provides one. Calling it elsewhere logs a development error, and isPending will not update correctly. That is a common mistake when moving a call into a click handler.",
    },
    {
      id: "uas-sequence",
      question: "What happens when several dispatches happen quickly?",
      answer: "They are queued and run one after another, each receiving the previous result. If I need parallel requests, I would use useState and useTransition instead. If the action throws, React cancels the rest of the queue and shows the nearest Error Boundary.",
    },
    {
      id: "uas-errors",
      question: "How should a form action report validation errors with this Hook?",
      answer: "Return them as part of the state, so the form stays on screen and can display them. Throwing should be reserved for unexpected failures, because it cancels queued Actions and goes to an Error Boundary, replacing the user’s form.",
    },
    {
      id: "uas-permalink",
      question: "What is the permalink argument for?",
      answer: "It applies to Server Functions with progressive enhancement. If a form is submitted before the JavaScript bundle loads, the browser navigates to that URL, and the same form must be rendered there. Once the page is interactive, the argument has no effect.",
    },
    {
      id: "uas-framework",
      question: "Does useActionState require a framework?",
      answer: "No. It works with ordinary async functions in a Client Component. A framework is only needed if the action is a Server Function, since that depends on React Server Components support such as what Next.js provides.",
    },
  ],
  takeaways: [
    "useActionState tracks an Action’s result and pending status.",
    "The function receives previousState first, and the payload second.",
    "Dispatch inside a Transition, which form actions provide for you.",
    "Dispatches run sequentially, and a throw cancels the queue.",
  ],
  quickReview: {
    definition: "useActionState is a Hook from react that runs an Action, stores its result as state, and reports whether it is pending.",
    keyPoints: [
      "It returns [state, dispatchAction, isPending].",
      "The action’s arguments are (previousState, payload).",
      "Dispatches must happen inside a Transition.",
      "Return expected errors as state instead of throwing.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Using the Hook with a form",
      language: "tsx",
      code: `const [state, formAction, isPending] = useActionState(saveAction, initialState);`,
      typecheckContext: { before: `import { useActionState } from "react";\ntype State = { error: string | null };\ndeclare const initialState: State;\ndeclare function saveAction(previous: State, formData: FormData): Promise<State>;\nexport function Example() {`, after: `return <form action={formAction}><button disabled={isPending}>{state.error ?? "Save"}</button></form>;\n}` },
      description: "Pass formAction to the form, and saveAction receives (previous state, FormData).",
    },
    commonMistakes: [
      "Reading FormData from the first argument.",
      "Calling dispatch from onClick without startTransition.",
      "Throwing for ordinary validation failures.",
    ],
    interviewTrap: "“Do two quick submits run at the same time?” No. They are queued, and each waits for the previous one to finish.",
    takeaway: "Treat it as an asynchronous reducer with a pending flag and a queue.",
  },
  sources: [
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
    { label: "useReducer reference", href: "https://react.dev/reference/react/useReducer" },
  ],
};
