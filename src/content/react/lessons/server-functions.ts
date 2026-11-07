import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-they-are",
      heading: "What Server Functions are",
      paragraphs: [
        "Server Functions let Client Components call async functions that run on the server. You define one with the \"use server\" directive. The framework creates a reference, and when a client calls it, React sends a network request with serialized arguments, runs the function, and returns the result.",
        "They are for use in React Server Components, so they need a framework or bundler that implements them, such as Next.js. A plain client-side app has no server to run them on. They are stable in React 19, although the lower-level APIs for framework authors do not follow semver.",
      ],
      comparison: [
        {
          id: "terms-function",
          title: "Server Function",
          items: ["Any function marked with \"use server\".", "Callable from the client.", "Runs on the server."],
        },
        {
          id: "terms-action",
          title: "Action",
          items: ["A function passed to an action prop, or called inside a Transition.", "May run on the client or on the server.", "A Server Function used this way is called a Server Action."],
        },
      ],
      closing: "Until September 2024, all Server Functions were called Server Actions, so older material uses the broader name.",
    },
    {
      id: "defining",
      heading: "Defining and calling them",
      paragraphs: [
        "The directive can sit at the top of an async function’s body, or at the top of a module to mark all its exports. Client Components can import them from such a module, or receive them as props from a Server Component. Either way, the client gets a reference and never sees the function’s body.",
      ],
      examples: [
        {
          id: "server-module",
          classification: "server",
          title: "A module of Server Functions",
          language: "typescript",
          code: `"use server";

export async function updateName(previousState: { error: string | null }, formData: FormData) {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim() === "") {
    return { error: "A name is required." };
  }

  // Check the signed-in user here, then save using server-only code.
  return { error: null };
}`,
          description: "Everything exported here becomes a network endpoint. The second argument is FormData, because useActionState passes the previous state first.",
        },
        {
          id: "client-form",
          classification: "client",
          title: "A form using a Server Function",
          language: "tsx",
          code: `"use client";

import { useActionState } from "react";

declare function updateName(previous: { error: string | null }, formData: FormData): Promise<{ error: string | null }>;

export default function NameForm() {
  const [state, formAction, isPending] = useActionState(updateName, { error: null });

  return (
    <form action={formAction}>
      <label>
        Name
        <input name="name" disabled={isPending} />
      </label>
      <button type="submit" disabled={isPending}>
        Save
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
          description: "In a real project, updateName would be imported from the module above, and the declare line stands in for that import. With a Server Function, this form can submit before its JavaScript has loaded.",
        },
      ],
    },
    {
      id: "security",
      heading: "They are public endpoints",
      paragraphs: [
        "This is the most important thing to understand. A Server Function looks like a private function, but it is reachable through a network request by anyone. Its arguments are fully client-controlled, so they must be treated as untrusted input.",
        "In every Server Function, validate the input and verify that the logged-in user is allowed to perform the action. Hiding a button on the client protects nothing. Also keep your React version current, since vulnerabilities affecting Server Components have been disclosed, and the fixes are in patched releases.",
      ],
      examples: [
        {
          id: "secure-function",
          classification: "server",
          title: "Validating and authorizing",
          language: "typescript",
          code: `"use server";

declare function getCurrentUser(): Promise<{ id: string } | null>;
declare function deletePost(postId: string, userId: string): Promise<void>;

export async function deletePostAction(postId: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in.");

  if (typeof postId !== "string") throw new Error("Invalid request.");

  await deletePost(postId, user.id);
}`,
          description: "The argument is typed unknown on purpose, because TypeScript cannot check what arrives over the network. deletePost must also confirm that this user owns the post. The declare lines stand in for your own code.",
        },
      ],
    },
    {
      id: "what-can-cross",
      heading: "What can be passed",
      paragraphs: [
        "Arguments and return values must be serializable, since they cross the network. That includes primitives, plain objects, arrays, Map, Set, Date, FormData, Promises, and other Server Functions. React elements, ordinary functions, classes, and event objects are not supported.",
      ],
    },
    {
      id: "when-to-use",
      heading: "When to use them",
      paragraphs: [
        "They are designed for mutations that update server-side state. The docs do not recommend them for fetching data, and frameworks typically process one at a time, and do not cache their return values. For reading data, prefer Server Components.",
        "Outside of forms, call them inside startTransition, so you get pending state and error handling. As with any Action, updates after an await need another startTransition.",
      ],
      list: [
        "Good fit: saving a form, adding to a cart, or deleting an item.",
        "Poor fit: loading data for display, which belongs in a Server Component.",
        "Keep them small, and move shared logic into server-only modules.",
      ],
    },
  ],
  mistakes: [
    {
      id: "trusting-arguments",
      heading: "Trusting arguments because TypeScript checks them",
      problem: "A typed parameter feels safe, but types are erased at runtime, and the endpoint accepts anything anyone sends. An attacker can call it with values that your own UI would never produce.",
      correction: "Validate everything at runtime inside the function, and treat it as a public API.",
    },
    {
      id: "no-authorization",
      heading: "Forgetting authorization",
      problem: "Rendering a Delete button only for admins does not secure the action behind it. Anyone who has the endpoint can call it directly, so without a check inside the function, the action is open to all.",
      correction: "Check the current user’s permissions in every Server Function.",
    },
    {
      id: "fetching-with-actions",
      heading: "Using Server Functions to fetch data",
      problem: "They can return data, so they may seem convenient for reading. But they are designed for mutations, frameworks typically run them one at a time, and their results are not cached, which makes data loading slow.",
      correction: "Read data in Server Components, or through your framework’s data tools.",
    },
    {
      id: "leaking-closures",
      heading: "Capturing sensitive values in inline Server Functions",
      problem: "A Server Function defined inside a Server Component can close over values from its render, and those may be serialized and sent through the client. Secrets captured this way can leave the server.",
      correction: "Read secrets inside the function itself, and pass only non-sensitive identifiers.",
    },
    {
      id: "wrong-directive-use",
      heading: "Confusing \"use server\" with Server Components",
      problem: "Its name suggests marking something to run on the server in general. Adding it to a component turns exports into callable endpoints, which is quite different from a Server Component, and could expose things unintentionally.",
      correction: "Use it only for functions the client should be able to call.",
    },
  ],
  interview: [
    {
      id: "sf-what",
      question: "What is a Server Function?",
      answer: "An async function marked with use server, which the client can call. React sends a network request with serialized arguments, runs it on the server, and returns the result. It needs a framework or bundler that implements React Server Components.",
    },
    {
      id: "sf-vs-action",
      question: "What is the difference between a Server Function and a Server Action?",
      answer: "A Server Function is any function marked with use server. A Server Action is one passed to an action prop or called from inside an action. Before September 2024, all were called Server Actions, so older articles use that broader term.",
    },
    {
      id: "sf-security",
      question: "What security concerns apply to Server Functions?",
      answer: "They are public network endpoints, whatever they look like in code. Arguments are client-controlled, so validate them at runtime, and verify authorization in every function. Hiding UI does not protect them, and React itself should be kept updated with security patches.",
    },
    {
      id: "sf-serialization",
      question: "What can you pass to a Server Function?",
      answer: "Serializable values such as primitives, plain objects, arrays, Map, Set, Date, FormData, and Promises. Not React elements, ordinary functions, classes, or event objects. Return values have similar limits, because everything crosses the network.",
    },
    {
      id: "sf-when",
      question: "When would you avoid a Server Function?",
      answer: "For fetching data, since they are designed for mutations, typically run one at a time, and are not cached. Server Components suit reading. Also where no compatible framework exists, since a client-only React app cannot use them.",
    },
    {
      id: "sf-progressive",
      question: "What advantage do they have for forms?",
      answer: "Progressive enhancement. A form using a Server Function can submit before its JavaScript loads, or with JavaScript disabled. With useActionState, React can show returned errors in that situation too, which a purely client-side action cannot do.",
    },
  ],
  takeaways: [
    "Server Functions let the client call async functions on the server.",
    "They are public endpoints, so validate and authorize in each one.",
    "They are for mutations, and they need framework support.",
    "Arguments and results must be serializable.",
  ],
  quickReview: {
    definition: "A Server Function is an async function marked with \"use server\", which clients can call over the network.",
    keyPoints: [
      "A Server Action is a Server Function used as an action.",
      "Arguments are untrusted input.",
      "Use them for mutations, not for reading data.",
      "They need a framework or bundler with RSC support.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "server",
      title: "A directive at the top of a function",
      language: "typescript",
      code: `export async function saveNote(formData: FormData) {
  "use server";

  const text = formData.get("text");
  if (typeof text !== "string") throw new Error("Invalid note.");
}`,
      description: "The check runs on the server, because the input can be anything.",
    },
    commonMistakes: [
      "Trusting arguments because they are typed.",
      "Skipping authorization checks.",
      "Using them to fetch data.",
    ],
    interviewTrap: "“Is a Server Function private since it is not an exported API route?” No. It is reachable over the network, so treat it as a public endpoint.",
    takeaway: "Write every Server Function as if anyone on the internet can call it, because they can.",
  },
  sources: [
    { label: "Server Functions reference", href: "https://react.dev/reference/rsc/server-functions" },
    { label: "use server reference", href: "https://react.dev/reference/rsc/use-server" },
    { label: "form reference", href: "https://react.dev/reference/react-dom/components/form" },
    { label: "React blog: security advisories", href: "https://react.dev/blog" },
  ],
};
