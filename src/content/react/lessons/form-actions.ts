import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-form-actions-are",
      heading: "What a form Action is",
      paragraphs: [
        "In React 19, the form element’s action prop accepts a function as well as a URL. With a URL, the form behaves like a standard HTML form. With a function, React handles the submission: the function receives the form’s FormData, and it can be async.",
        "You do not need onSubmit, preventDefault, or state for each input. This works in any React 19 app with no framework, because a form Action can be an ordinary client function.",
      ],
      examples: [
        {
          id: "client-action",
          classification: "client",
          title: "A client function as an Action",
          language: "tsx",
          code: `"use client";

async function subscribe(formData: FormData) {
  const email = formData.get("email");

  await fetch("/api/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export default function Newsletter() {
  return (
    <form action={subscribe}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <button type="submit">Subscribe</button>
    </form>
  );
}`,
          description: "The input is uncontrolled, and the Action reads it through FormData.",
        },
      ],
    },
    {
      id: "what-react-does",
      heading: "What React does for you",
      paragraphs: [
        "When action is a function, submission behaves differently from a plain form, in ways that are useful to know.",
      ],
      list: [
        "The method is always POST, whatever the method prop says.",
        "React runs the function in a Transition, so state updates inside it are non-blocking, and pending status can be tracked.",
        "Errors the function throws go to the nearest Error Boundary.",
        "After the function succeeds, React resets uncontrolled fields.",
        "If you also pass onSubmit, React runs the Action afterward, unless onSubmit calls preventDefault.",
      ],
    },
    {
      id: "reset-behavior",
      heading: "When the form resets",
      paragraphs: [
        "The automatic reset surprises people. Throwing an error prevents it. Returning a validation error does not count as failure, so the fields still reset, which can erase what the user typed even though you are asking them to fix it.",
        "So if an Action can return validation errors, preserve the input. Store the submitted values in state and pass them to defaultValue, as useActionState makes straightforward.",
      ],
      examples: [
        {
          id: "preserve-values",
          classification: "client",
          title: "Keeping input after a validation error",
          language: "tsx",
          code: `"use client";

import { useActionState } from "react";

interface State {
  error: string | null;
  email: string;
}

async function signUp(_previous: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "");

  if (!email.includes("@")) {
    return { error: "Include an @ in the address.", email };
  }

  await fetch("/api/signup", { method: "POST", body: JSON.stringify({ email }) });
  return { error: null, email: "" };
}

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, { error: null, email: "" });

  return (
    <form action={formAction}>
      <label>
        Email
        <input name="email" type="email" defaultValue={state.email} />
      </label>
      <button type="submit" disabled={isPending}>
        Sign up
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
          description: "The form still resets after the Action, but it resets to defaultValue, which now holds what the user typed.",
        },
      ],
    },
    {
      id: "passing-extra-data",
      heading: "Passing extra data to an Action",
      paragraphs: [
        "An Action often needs more than the visible fields, such as a product ID. There are three ways, with different tradeoffs.",
      ],
      comparison: [
        {
          id: "hidden-and-bind",
          title: "Hidden field or bind",
          items: ["<input type=\"hidden\" name=\"productId\" value={id} />", "addToCart.bind(null, id), with bound arguments before formData.", "Both work before JavaScript loads with Server Functions."],
        },
        {
          id: "closure",
          title: "A function in the component",
          items: ["Reads props and state directly.", "The simplest to write.", "Requires JavaScript to have loaded first."],
        },
      ],
    },
    {
      id: "server-functions",
      heading: "Where the framework comes in",
      paragraphs: [
        "Form Actions and server code are separate ideas. A function marked with the \"use server\" directive is a Server Function, and it can also be passed to action. That part requires a framework implementing React Server Components, such as Next.js, and is not available in a purely client-side app.",
        "The benefit is progressive enhancement: with a Server Function, users can submit before JavaScript loads, or with it disabled, as with URL-based forms.",
      ],
      examples: [
        {
          id: "server-action",
          classification: "server",
          title: "A Server Function used by a form",
          language: "typescript",
          code: `"use server";

export async function addComment(formData: FormData) {
  const comment = formData.get("comment");

  if (typeof comment !== "string" || comment.trim() === "") {
    return { error: "A comment is required." };
  }

  // Save the comment here, using server-only code.
  return { error: null };
}`,
          description: "This module must run in a framework with Server Components support. The input is validated here, because anything can arrive from the client.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "assuming-framework",
      heading: "Assuming form Actions need a framework",
      problem: "Actions are often introduced alongside Server Functions, which suggests they require Next.js. A plain client function works as an Action in any React 19 app. Only the server-executed part needs framework support.",
      correction: "Use client functions freely, and use Server Functions where your framework supports them.",
    },
    {
      id: "reset-surprise",
      heading: "Losing user input after a returned error",
      problem: "An Action that returns a validation error still counts as successful, so React resets the uncontrolled fields. The person sees an error message and an empty form, and has to start over.",
      correction: "Pass the submitted values back through state, and use them as defaultValue.",
    },
    {
      id: "method-prop",
      heading: "Expecting method to apply",
      problem: "method=\"get\" is ignored when action is a function, since the method is then always POST. Code expecting a URL-based query string will not get one, with no warning about it.",
      correction: "Use method only with a URL action. For GET-style search, use a URL action or update the URL yourself.",
    },
    {
      id: "state-after-await",
      heading: "Setting state after await without a Transition",
      problem: "An Action runs in a Transition, but updates after an await are not tracked by it, so they can behave as urgent updates and cause a flash of intermediate UI.",
      correction: "Wrap updates that follow an await in startTransition.",
    },
    {
      id: "server-trust",
      heading: "Trusting data in a Server Function",
      problem: "A Server Function looks like a private function, but it is reachable through a network endpoint. Anyone can call it with any arguments, so a form’s client checks offer no protection here.",
      correction: "Validate input and check authorization inside the Server Function.",
    },
  ],
  interview: [
    {
      id: "fa-what",
      question: "What are form Actions in React 19?",
      answer: "A form’s action prop can be a function that receives FormData. React handles the submission, runs the function in a Transition, sends thrown errors to an Error Boundary, and resets uncontrolled fields on success. No onSubmit or preventDefault is needed.",
    },
    {
      id: "fa-framework",
      question: "Do form Actions require a server or a framework?",
      answer: "No. A client function works in any React 19 app. Server Functions, marked with use server, need a framework that implements React Server Components. That is a commonly confused distinction, since the two are often shown together.",
    },
    {
      id: "fa-reset",
      question: "When does a form reset automatically after an Action?",
      answer: "After the function succeeds, React resets uncontrolled fields. Throwing prevents the reset. Returning a validation error still resets, because the function completed, so you should pass the submitted values back and use them as defaultValue.",
    },
    {
      id: "fa-enhancement",
      question: "What does progressive enhancement mean with form Actions?",
      answer: "With a Server Function as the action, the form can submit before JavaScript has loaded, or with JavaScript disabled, as a URL-based form would. useActionState can show returned errors in that situation too, using a Client Component and a Server Function.",
    },
    {
      id: "fa-extra-data",
      question: "How do you pass extra data, such as an ID, to an Action?",
      answer: "With a hidden input, which arrives as a string; with bind, which keeps types and puts arguments before formData; or with a function in the component that reads props. The first two work before JavaScript loads, and the third requires it.",
    },
    {
      id: "fa-vs-submit",
      question: "How does a function action differ from an onSubmit handler?",
      answer: "It receives FormData rather than an event, runs in a Transition, integrates with useFormStatus and useOptimistic, and resets uncontrolled fields. onSubmit gives you the event and full control. They can be combined, with onSubmit running first.",
    },
  ],
  takeaways: [
    "A form’s action can be a function receiving FormData.",
    "Client functions work with no framework, while Server Functions need one.",
    "Returning a validation error still resets fields, so preserve the input.",
    "Validate inside Server Functions, because they are public endpoints.",
  ],
  quickReview: {
    definition: "A form Action is a function passed to action, which React runs in a Transition with the form’s FormData.",
    keyPoints: [
      "The method is always POST for function actions.",
      "Thrown errors go to an Error Boundary.",
      "Uncontrolled fields reset after the function succeeds.",
      "Server Functions add progressive enhancement, and need a framework.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A minimal Action",
      language: "tsx",
      code: `export default function Search({ onSearch }: { onSearch: (query: string) => void }) {
  function search(formData: FormData) {
    onSearch(String(formData.get("query") ?? ""));
  }

  return (
    <form action={search}>
      <input name="query" aria-label="Search" />
      <button type="submit">Search</button>
    </form>
  );
}`,
      description: "No preventDefault and no state, because React passes the data to the function.",
    },
    commonMistakes: [
      "Assuming a framework is required.",
      "Losing input after returning an error.",
      "Trusting input inside a Server Function.",
    ],
    interviewTrap: "“Does returning an error stop the form from resetting?” No. Only throwing prevents the reset, so a returned error needs the values preserved.",
    takeaway: "Actions handle the mechanics of submitting, while your code keeps the rules and the messages.",
  },
  sources: [
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
    { label: "useActionState reference", href: "https://react.dev/reference/react/useActionState" },
    { label: "React 19 release notes", href: "https://react.dev/blog/2024/12/05/react-19" },
  ],
};
