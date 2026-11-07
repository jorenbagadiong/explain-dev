import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "three-phases",
      heading: "Mounting, updating, and unmounting",
      paragraphs: [
        "Every component instance has the same basic lifecycle. It mounts when it is added to the screen, updates when it renders again with new props or state, and unmounts when it is removed. These words describe what happens to an instance over time.",
        "State belongs to a mounted instance. It is created on mount, kept across updates, and destroyed on unmount, which is why a component that is removed and later brought back starts fresh.",
      ],
      visual: {
        heading: "One component instance over time",
        context: "This shows the path of a single instance, from appearing on screen to being removed.",
        steps: [
          { id: "mount", title: "Mount", description: "The instance is added to the tree, and its state is initialized." },
          { id: "update", title: "Update", description: "It renders again with new props or state. This can repeat any number of times." },
          { id: "unmount", title: "Unmount", description: "It is removed from the tree, and its state is destroyed." },
        ],
        note: "A render is not always an update to the DOM. Also, identity decides whether an instance is kept, so a changed key causes an unmount and a new mount.",
      },
    },
    {
      id: "what-decides-identity",
      heading: "What decides whether an instance survives",
      paragraphs: [
        "React keeps an instance when the same component type appears at the same position in the tree, and with the same key if there is one. Change any of those, and the old instance unmounts while a new one mounts.",
        "That makes mounting something you can reason about and control. A conditional can unmount a component, and a new key forces a remount on purpose.",
      ],
      examples: [
        {
          id: "mount-unmount",
          classification: "complete",
          title: "State ends when a component unmounts",
          language: "tsx",
          code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(previous => previous + 1)}>
      Clicked {count} times
    </button>
  );
}

export default function Panel() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setIsVisible(previous => !previous)}>
        Toggle counter
      </button>
      {isVisible && <Counter />}
    </div>
  );
}`,
          description: "Hiding the counter unmounts it, and showing it again mounts a new instance that starts at 0.",
        },
      ],
    },
    {
      id: "effects-are-different",
      heading: "An Effect has its own, simpler lifecycle",
      paragraphs: [
        "It is tempting to treat Effects as lifecycle callbacks: one that runs on mount, another on update, another on unmount. That model gets complicated quickly, and it leads to bugs such as missing updates when a value changes.",
        "An Effect only has two steps: it starts synchronizing with something, and it later stops. This cycle can repeat many times while the component stays mounted, once for each change to its dependencies.",
      ],
      comparison: [
        {
          id: "component-lifecycle",
          title: "Component lifecycle",
          items: ["Mount, update, and unmount.", "Describes one instance on screen.", "Happens once per instance, apart from updates."],
        },
        {
          id: "effect-lifecycle",
          title: "Effect lifecycle",
          items: ["Start and stop synchronizing.", "Describes one connection to an outside system.", "May run many times while mounted."],
        },
      ],
      examples: [
        {
          id: "effect-cycle",
          classification: "complete",
          title: "Thinking in start and stop",
          language: "tsx",
          code: `import { useEffect } from "react";

export default function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    return () => {
      document.title = previous;
    };
  }, [title]);

  return <h1>{title}</h1>;
}`,
          description: "This does not ask whether the component is mounting or updating. It says how to start for this title and how to stop, and React repeats that as the title changes.",
        },
      ],
    },
    {
      id: "strict-mode-remount",
      heading: "Development remounts in Strict Mode",
      paragraphs: [
        "In development, Strict Mode runs an extra setup and cleanup cycle for Effects when a component mounts, to check that cleanup properly undoes setup. An Effect with an empty dependency array is therefore not guaranteed to run exactly once.",
        "Do not design around this by trying to detect it. If the user could not tell the difference between one start and a start, stop, and start sequence, the Effect is correct.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effect-as-mount",
      heading: "Treating useEffect with [] as a mount callback",
      problem: "Reading it as run once on mount encourages leaving out dependencies, so the Effect uses stale values. It also misleads in development, where Strict Mode runs the setup and cleanup cycle an extra time.",
      correction: "List what the Effect uses, and write it to start and stop safely any number of times.",
    },
    {
      id: "class-mapping",
      heading: "Mapping class lifecycle methods onto Hooks one by one",
      problem: "Looking for the Hook version of each old lifecycle method splits one concern across several places. A subscription’s setup, update, and teardown are one idea, and thinking in methods scatters them.",
      correction: "Group code by what it synchronizes, with one Effect for each independent process.",
    },
    {
      id: "expecting-state-to-survive",
      heading: "Expecting state to survive an unmount",
      problem: "A form inside a conditional seems to forget its contents after being hidden. That is correct behavior rather than a bug, because unmounting destroys the instance, including its state.",
      correction: "Lift the state above the condition if it must survive, or hide the element with CSS and keep it mounted.",
    },
    {
      id: "update-means-effect",
      heading: "Assuming every update re-runs every Effect",
      problem: "An Effect with a dependency array does not run on each update, only when a listed value has changed. Assuming otherwise leads to confusion over why it did not run, or to removing the array altogether.",
      correction: "Read the dependency list as the reason the Effect re-synchronizes, and keep it accurate.",
    },
  ],
  interview: [
    {
      id: "phases",
      question: "What are the phases of a component’s lifecycle?",
      answer: "Mounting, when an instance is added to the tree and its state is created. Updating, when it renders again with new props or state, which can repeat. Unmounting, when it is removed and its state is destroyed.",
    },
    {
      id: "effect-vs-lifecycle",
      question: "Why shouldn’t you think of useEffect as lifecycle methods?",
      answer: "An Effect describes synchronizing with something outside React: how to start and how to stop. That cycle can repeat while the component is mounted. Thinking in mount and unmount leads to missing dependency updates and to logic split across several ideas.",
    },
    {
      id: "strict-remount",
      question: "Why does an Effect with an empty array sometimes run twice?",
      answer: "In development, Strict Mode adds an extra setup and cleanup cycle on mount to test whether cleanup works. It does not happen in production. The fix is correct cleanup, not a flag that prevents the second run.",
    },
    {
      id: "force-remount",
      question: "How can you force a component to remount?",
      answer: "Change its key. A different key gives it a new identity, so React unmounts the old instance and mounts a fresh one with new state. It is a clean way to reset a form when the record it edits changes.",
    },
    {
      id: "when-state-lost",
      question: "When does a component lose its state?",
      answer: "When it unmounts. That happens if a condition removes it, if a different component type appears at its position, if an ancestor changes type, or if its key changes. Moving position among siblings without keys can also do it.",
    },
    {
      id: "render-not-mount",
      question: "Is every render of a component a mount?",
      answer: "No. The first render of an instance is its mount, and later renders are updates to the same instance, with state preserved. Confusing the two leads to surprises, such as expecting useState’s initial value to apply again.",
    },
  ],
  takeaways: [
    "An instance mounts, updates any number of times, and unmounts.",
    "State lives only as long as the mounted instance.",
    "Type, position, and key decide whether an instance is kept.",
    "Effects start and stop synchronizing, which is separate from the component lifecycle.",
  ],
  quickReview: {
    definition: "A component instance mounts, updates through re-renders, and unmounts, and its state lasts exactly that long.",
    keyPoints: [
      "Mount creates state, and unmount destroys it.",
      "A changed key means unmount and a fresh mount.",
      "Effects have a start and stop cycle that can repeat while mounted.",
      "Strict Mode adds an extra Effect cycle in development.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A key forcing a fresh instance",
      language: "tsx",
      code: `function Editor({ recordId }: { recordId: string }) {
  return <p>Editing {recordId}</p>;
}

export default function Page({ recordId }: { recordId: string }) {
  return <Editor key={recordId} recordId={recordId} />;
}`,
      description: "A new recordId gives Editor a new identity, so it remounts with fresh state.",
    },
    commonMistakes: [
      "Reading useEffect with [] as guaranteed to run once.",
      "Expecting state to survive being conditionally removed.",
      "Looking for a one-to-one Hook for each class lifecycle method.",
    ],
    interviewTrap: "“Is useEffect(fn, []) the same as componentDidMount?” Not as a mental model. It describes synchronization, and Strict Mode runs extra cycles in development.",
    takeaway: "Use lifecycle words to describe instances, and start and stop to describe Effects.",
  },
  sources: [
    { label: "Lifecycle of Reactive Effects", href: "https://react.dev/learn/lifecycle-of-reactive-effects" },
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
  ],
};
