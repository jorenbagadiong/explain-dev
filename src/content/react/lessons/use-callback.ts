import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-use-callback-does",
      heading: "What useCallback does",
      paragraphs: [
        "useCallback caches a function definition between renders. It returns the same function object as long as its dependencies have not changed, and it does not call your function. You decide when to call it, such as from an event handler.",
        "It does not stop the function being created. A new one is still created on every render, and React returns the cached one when nothing changed. The benefit is a stable reference, not saved creation work.",
      ],
      comparison: [
        {
          id: "use-memo",
          title: "useMemo",
          items: ["Calls your function.", "Caches its result.", "Use it for calculated values."],
        },
        {
          id: "use-callback",
          title: "useCallback",
          items: ["Does not call your function.", "Caches the function itself.", "Use it when a function’s identity matters."],
        },
      ],
    },
    {
      id: "when-it-helps",
      heading: "When a stable function matters",
      paragraphs: [
        "A function’s identity only matters if something compares it. There are three main cases, and outside them useCallback adds code with no real benefit.",
      ],
      list: [
        "Passing it to a child wrapped in memo, whose prop comparison a new function would defeat.",
        "Using it as a dependency of another Hook, such as useEffect.",
        "Returning it from a custom Hook, so that consumers can optimize their own code.",
      ],
      examples: [
        {
          id: "memo-child",
          classification: "complete",
          title: "A stable handler for a memoized child",
          language: "tsx",
          code: `import { memo, useCallback, useState } from "react";

const SaveButton = memo(function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button type="button" onClick={onSave}>
      Save
    </button>
  );
});

export default function Editor({ draftId }: { draftId: string }) {
  const [text, setText] = useState("");

  const handleSave = useCallback(() => {
    navigator.sendBeacon("/save", draftId);
  }, [draftId]);

  return (
    <>
      <label>
        Draft
        <textarea value={text} onChange={event => setText(event.target.value)} />
      </label>
      <SaveButton onSave={handleSave} />
    </>
  );
}`,
          description: "Typing changes text and re-renders Editor, but handleSave stays the same, so memo lets SaveButton skip rendering. A button this simple would rarely need the optimization. It only shows the mechanism.",
        },
      ],
    },
    {
      id: "reducing-dependencies",
      heading: "Reducing dependencies",
      paragraphs: [
        "A callback that reads state just to calculate the next state would need that state as a dependency, so it would change whenever the state did. An updater function removes that dependency.",
      ],
      examples: [
        {
          id: "updater-dep",
          classification: "complete",
          title: "An updater keeps the callback stable",
          language: "tsx",
          code: `import { useCallback, useState } from "react";

export function useTags() {
  const [tags, setTags] = useState<readonly string[]>([]);

  const addTag = useCallback((tag: string) => {
    setTags(previous => [...previous, tag]);
  }, []);

  return { tags, addTag };
}`,
          description: "addTag never reads tags, so it has no dependencies and keeps one identity. Setters from useState are stable, so they do not need listing.",
        },
      ],
    },
    {
      id: "effects-and-functions",
      heading: "Functions used by Effects",
      paragraphs: [
        "If an Effect uses a function declared in the component, that function becomes a dependency, and a new one each render would re-run the Effect. You could wrap it in useCallback, but it is usually better to move the function inside the Effect, which removes the need altogether.",
      ],
      examples: [
        {
          id: "function-in-effect",
          classification: "complete",
          title: "Moving the function into the Effect",
          language: "tsx",
          code: `import { useEffect } from "react";

export default function RoomStatus({ roomId }: { roomId: string }) {
  useEffect(() => {
    function describeRoom() {
      return "Viewing room " + roomId;
    }

    document.title = describeRoom();
  }, [roomId]);

  return <p>Room: {roomId}</p>;
}`,
          description: "The function is created inside the Effect, so the only dependency is roomId.",
        },
      ],
      closing: "If the React Compiler is enabled in a project, it memoizes functions automatically, which reduces the need for manual useCallback.",
    },
  ],
  mistakes: [
    {
      id: "callback-everywhere",
      heading: "Wrapping every function",
      problem: "useCallback everywhere feels like good practice. But if no one compares the reference, it does nothing useful, while making code harder to read and adding dependency lists to keep accurate.",
      correction: "Use it only in the cases where the identity matters, such as a memoized child after measuring.",
    },
    {
      id: "thinks-no-creation",
      heading: "Thinking it avoids creating the function",
      problem: "A common belief is that useCallback saves allocating a function on each render. It does not: your function expression is still created every time, and React simply returns the cached one instead.",
      correction: "Think of it as keeping a stable identity, and not as a way to save allocation.",
    },
    {
      id: "memo-missing",
      heading: "Using it for a child that is not memoized",
      problem: "A stable onClick passed to an ordinary child changes nothing, because that child re-renders with its parent anyway. The memoization has no effect, and the code suggests an optimization that is not happening.",
      correction: "Pair it with memo when skipping that child’s render is worthwhile.",
    },
    {
      id: "stale-callback",
      heading: "Omitting dependencies to keep it stable",
      problem: "Leaving a value out of the array to stop the callback changing makes it read a stale value from an old render. The bug appears only after that value changes, which makes it easy to miss.",
      correction: "Keep the list complete, and reduce dependencies with an updater function or by moving code.",
    },
    {
      id: "callback-in-loop",
      heading: "Calling useCallback inside a loop",
      problem: "Trying to cache a handler per list item by calling useCallback in map breaks the Rules of Hooks, because the number of calls changes with the list’s length.",
      correction: "Extract a child component for each item, and call useCallback there.",
    },
  ],
  interview: [
    {
      id: "what-callback-does",
      question: "What does useCallback do?",
      answer: "It returns the same function object between renders until a dependency changes. It does not call the function or prevent it from being created. It exists to keep a function’s identity stable for something that compares it.",
    },
    {
      id: "callback-vs-memo",
      question: "How does useCallback relate to useMemo?",
      answer: "useCallback caches a function, and useMemo caches the result of calling one. In fact useCallback(fn, deps) behaves like useMemo(() => fn, deps), so it is a convenient shorthand for the function case.",
    },
    {
      id: "when-callback-q",
      question: "When is useCallback actually useful?",
      answer: "When the function goes to a child wrapped in memo, when it is a dependency of another Hook, or when a custom Hook returns it. Without one of those, a stable identity has no consumer, so it adds complexity for nothing.",
    },
    {
      id: "callback-alone",
      question: "Does useCallback alone stop a child from re-rendering?",
      answer: "No. A child re-renders with its parent by default. Only a child wrapped in memo compares props, and then a stable function helps it skip. All props need to be stable for that to work, and context or the child’s own state can still trigger a render.",
    },
    {
      id: "callback-updater",
      question: "How can you reduce a useCallback’s dependencies?",
      answer: "If it reads state only to compute the next state, pass an updater to the setter, and the state is no longer a dependency. Setters themselves are stable. Moving non-reactive values outside the component also removes dependencies.",
    },
    {
      id: "callback-effect-q",
      question: "Should you use useCallback for a function called by an Effect?",
      answer: "Usually it is better to move the function inside the Effect, so it stops being a dependency. If it must be shared with other code, useCallback is reasonable. Omitting it from the list is not, since that creates stale reads.",
    },
  ],
  takeaways: [
    "useCallback keeps a function’s identity stable between renders.",
    "It only helps when something compares that identity.",
    "It does not prevent the function from being created.",
    "Updater functions and moving code often remove the need for it.",
  ],
  quickReview: {
    definition: "useCallback returns a cached function until its dependencies change, keeping the function’s identity stable.",
    keyPoints: [
      "It caches the function, without calling it.",
      "It is the function-shaped version of useMemo.",
      "It only pays off with memo or as a Hook dependency.",
      "Setters from useState never need to be listed.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A stable callback",
      language: "tsx",
      code: `const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);`,
      typecheckContext: { before: `import { useCallback } from "react";\nexport function Example({ onSelect }: { onSelect: (id: string) => void }) {`, after: `return <button onClick={() => handleSelect("a")}>Select</button>;\n}` },
      description: "The function stays the same until onSelect changes.",
    },
    commonMistakes: [
      "Wrapping every handler by default.",
      "Omitting a dependency to keep the function stable.",
      "Passing a stable handler to a child without memo.",
    ],
    interviewTrap: "“Does useCallback avoid creating the function?” No. A new one is created each render, and React just returns the cached one.",
    takeaway: "Ask who compares this function. If no one does, you do not need useCallback.",
  },
  sources: [
    { label: "useCallback reference", href: "https://react.dev/reference/react/useCallback" },
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
  ],
};
