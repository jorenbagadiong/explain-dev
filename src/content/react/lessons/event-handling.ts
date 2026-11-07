import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "adding-handlers",
      heading: "Adding event handlers",
      paragraphs: [
        "An event handler is a function React runs in response to an interaction such as a click or a key press. You define it inside your component, so it can read props and state, and pass it to an element through a prop such as onClick.",
        "Pass the function, and do not call it. onClick={handleClick} hands React something to run later, while onClick={handleClick()} runs it during rendering and passes along the result.",
      ],
      examples: [
        {
          id: "basic-handler",
          classification: "complete",
          title: "A click handler",
          language: "tsx",
          code: `import { useState } from "react";

export default function LikeButton() {
  const [likes, setLikes] = useState(0);

  function handleClick() {
    setLikes(previous => previous + 1);
  }

  return (
    <button type="button" onClick={handleClick}>
      Liked {likes} times
    </button>
  );
}`,
          description: "By convention, the handler is named handle followed by the event. Use a native button, which is already focusable and responds to Enter and Space.",
        },
      ],
    },
    {
      id: "handlers-as-props",
      heading: "Passing handlers as props",
      paragraphs: [
        "A reusable component often does not know what a click should do. The parent decides, and passes that decision down as a prop. Custom handler props are named on followed by a capital letter, such as onPlay, and only built-in elements need the browser’s real event names.",
      ],
      examples: [
        {
          id: "handler-prop",
          classification: "complete",
          title: "A parent deciding what the click does",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function ActionButton({ onAction, children }: { onAction: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onAction}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  function handleExport() {
    window.print();
  }

  return <ActionButton onAction={handleExport}>Print this page</ActionButton>;
}`,
          description: "ActionButton owns the styling and behavior of a button, while Toolbar owns the meaning. Calling a browser API is fine here, because handlers do not run during rendering.",
        },
      ],
    },
    {
      id: "propagation",
      heading: "Propagation and default behavior",
      paragraphs: [
        "Events bubble up the tree. A click on a button runs its own onClick and then the onClick of each ancestor. The exception is onScroll, which only fires on the element it is attached to.",
        "Two event methods are often confused. stopPropagation prevents parent handlers from running, while preventDefault stops the browser’s built-in behavior, such as a form reloading the page. They are unrelated, and you may want one, both, or neither.",
      ],
      visual: {
        heading: "The order handlers run in",
        context: "This follows a click on a button inside a clickable card.",
        steps: [
          { id: "capture", title: "Capture phase", description: "Any onClickCapture handlers run from the top down, even if a child later stops propagation." },
          { id: "target", title: "Target", description: "The clicked button’s onClick runs." },
          { id: "bubble", title: "Bubbling", description: "Each ancestor’s onClick runs from the bottom up, unless propagation was stopped." },
        ],
        note: "Capture handlers are mainly useful for routers and analytics, and most application code only uses the bubbling handlers.",
      },
      examples: [
        {
          id: "stop-and-prevent",
          classification: "complete",
          title: "Using both event methods",
          language: "tsx",
          code: `import type { MouseEvent, SubmitEvent } from "react";

export default function SearchCard({ onOpen }: { onOpen: () => void }) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <section onClick={onOpen}>
      <form onSubmit={handleSubmit}>
        <button type="submit">Search</button>
      </form>
      <button type="button" onClick={handleClear}>
        Clear
      </button>
    </section>
  );
}`,
          description: "preventDefault keeps the form from reloading the page. stopPropagation keeps Clear from also triggering the section’s onOpen.",
        },
      ],
    },
    {
      id: "side-effects-in-handlers",
      heading: "Handlers are where side effects belong",
      paragraphs: [
        "Unlike rendering, event handlers do not need to be pure. They run because the user did something, so this is the natural place to update state, send a request, or call a browser API.",
        "Reach for an event handler before an Effect. If code runs because of a specific interaction, it belongs in that interaction’s handler.",
      ],
    },
  ],
  mistakes: [
    {
      id: "calling-handler",
      heading: "Calling the handler instead of passing it",
      problem: "onClick={handleClick()} looks like it is wiring up the function. It actually runs the function during every render, and if that handler sets state, the result can be an infinite render loop.",
      correction: "Pass the function itself. To supply arguments, wrap it, as in onClick={() => handleDelete(id)}.",
    },
    {
      id: "clickable-div",
      heading: "Attaching onClick to a div instead of using a button",
      problem: "A div with onClick responds to a mouse, but it is not focusable, does not respond to Enter or Space, and is not announced as a button. Keyboard and assistive technology users cannot operate it.",
      correction: "Use a native button or link, and style it as needed.",
    },
    {
      id: "confusing-stop-and-prevent",
      heading: "Mixing up stopPropagation and preventDefault",
      problem: "Calling stopPropagation in a form’s submit handler does not stop the page reloading, because the browser’s default action is separate from event bubbling. The reverse confusion leaves parent handlers still firing.",
      correction: "Use preventDefault to stop browser behavior, and stopPropagation to stop ancestors from handling the event.",
    },
    {
      id: "effect-for-event",
      heading: "Using an Effect to respond to an interaction",
      problem: "Setting a flag in a click handler and sending a request from an Effect that watches the flag adds an extra render and an indirect path. It can also re-send the request if the Effect runs again for another reason.",
      correction: "Do the work directly in the event handler, since you already know why it is happening.",
    },
  ],
  interview: [
    {
      id: "pass-vs-call",
      question: "What is the difference between onClick={fn} and onClick={fn()}?",
      answer: "The first passes the function for React to call on click. The second calls it during rendering and passes the return value, which is usually undefined. If that function also sets state, it can cause an infinite render loop.",
    },
    {
      id: "bubbling",
      question: "How does event propagation work in React?",
      answer: "Events bubble from the target up through ancestors, so parent handlers also run. A capture phase runs first from the top down through handlers such as onClickCapture. stopPropagation halts bubbling, and onScroll does not bubble in React.",
    },
    {
      id: "stop-vs-prevent",
      question: "What is the difference between stopPropagation and preventDefault?",
      answer: "stopPropagation prevents ancestors’ handlers from running. preventDefault stops the browser’s built-in action, such as submitting a form or following a link. They address different things, so calling one does not imply the other.",
    },
    {
      id: "handler-vs-effect",
      question: "How do you decide between an event handler and an Effect?",
      answer: "I ask why the code runs. If it is caused by a specific user action, it goes in the handler. If it must run because the component is on screen, to stay synchronized with something outside React, it goes in an Effect.",
    },
    {
      id: "state-in-handler",
      question: "Can an event handler call a state setter and then read the new value?",
      answer: "Not from the state variable in that same call. The setter requests a render with the next value, and the handler keeps the snapshot from the render that created it. If you need the next value immediately, compute it into a local variable first.",
    },
    {
      id: "naming-handlers",
      question: "Why are handler props named onSomething and functions named handleSomething?",
      answer: "It is a convention rather than a requirement. It separates the prop that receives a handler from the function that implements it, and it lets a prop name describe the app’s meaning, such as onPlay, instead of the browser event.",
    },
  ],
  takeaways: [
    "Pass handler functions to elements, and do not call them while rendering.",
    "Events bubble, and stopPropagation and preventDefault solve different problems.",
    "Handlers can contain side effects, because they do not run during rendering.",
    "Use native interactive elements so keyboards work without extra code.",
  ],
  quickReview: {
    definition: "An event handler is a function you pass to an element, which React runs in response to an interaction.",
    keyPoints: [
      "onClick={fn} passes the function, and onClick={fn()} calls it too early.",
      "Events bubble up, and capture handlers run first.",
      "preventDefault stops browser behavior, and stopPropagation stops ancestors.",
      "Handlers are the preferred home for side effects.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Passing an argument",
      language: "tsx",
      code: `export default function DeleteButton({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onDelete(id)}>
      Delete
    </button>
  );
}`,
      description: "The arrow function delays the call until the click, and it supplies the argument.",
    },
    commonMistakes: [
      "Writing onClick={save()} and running it on every render.",
      "Using a div with onClick instead of a button.",
      "Watching a flag in an Effect to respond to a click.",
    ],
    interviewTrap: "“Does stopPropagation stop a form from submitting?” No. Bubbling and browser default behavior are separate, so that needs preventDefault.",
    takeaway: "Handlers run because of what the user did, which is what makes them the right place for side effects.",
  },
  sources: [
    { label: "Responding to Events", href: "https://react.dev/learn/responding-to-events" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
  ],
};
