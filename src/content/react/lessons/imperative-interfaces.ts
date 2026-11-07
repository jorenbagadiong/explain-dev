import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "declarative-by-default",
      heading: "Declarative by default",
      paragraphs: [
        "A component’s normal interface is declarative: props describe what it should be, and it renders accordingly. An imperative interface instead exposes methods for a parent to call, such as player.play(). It is occasionally necessary, but it should be the exception.",
        "The reason is state. Props keep everything visible in the parent’s state, so the screen can be understood from data. Imperative calls change things that no state records, so nothing reflects them, and the sequence of past calls starts to matter.",
      ],
      comparison: [
        {
          id: "declarative",
          title: "Declarative prop",
          items: ["<Modal isOpen={isOpen} />", "State describes the result.", "Easy to test and to reason about."],
        },
        {
          id: "imperative",
          title: "Imperative method",
          items: ["modalRef.current.open()", "Calls cause the result.", "The current state lives inside the child."],
        },
      ],
    },
    {
      id: "when-appropriate",
      heading: "When an imperative interface is appropriate",
      paragraphs: [
        "Use one for actions that are events rather than state: something that happens at a moment and has no value to describe. If you would struggle to name a prop that holds the state, it may truly be a command.",
      ],
      list: [
        "Focusing a field.",
        "Scrolling to a position.",
        "Selecting text.",
        "Triggering a one-off animation, or playing a sound.",
      ],
    },
    {
      id: "small-interface",
      heading: "Keeping the interface small",
      paragraphs: [
        "When you do expose methods, offer only what callers need, and name them for what they achieve. A small handle hides your internals, so you can change the markup without breaking callers. Define it as a TypeScript interface, so it reads as a contract.",
      ],
      examples: [
        {
          id: "player-handle",
          classification: "complete",
          title: "A small, purposeful handle",
          language: "tsx",
          code: `import { useImperativeHandle, useRef, type Ref } from "react";

export interface PlayerHandle {
  restart: () => void;
}

function Player({ src, ref }: { src: string; ref?: Ref<PlayerHandle> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    restart() {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      void video.play();
    },
  }), []);

  return <video ref={videoRef} src={src} controls />;
}

export default function Lesson() {
  const playerRef = useRef<PlayerHandle>(null);

  return (
    <>
      <Player src="/intro.mp4" ref={playerRef} />
      <button type="button" onClick={() => playerRef.current?.restart()}>
        Watch again
      </button>
    </>
  );
}`,
          description: "The parent asks for an outcome and never sees the video element. Restarting is a true command, since no prop can express it.",
        },
      ],
    },
    {
      id: "wrapping-imperative",
      heading: "Turning imperative APIs into props",
      paragraphs: [
        "Many browser and third-party APIs are imperative, but your own component does not have to be. An Effect can translate a declarative prop into the imperative calls, so callers keep the simple model.",
      ],
      examples: [
        {
          id: "prop-to-effect",
          classification: "complete",
          title: "A declarative prop over an imperative API",
          language: "tsx",
          code: `import { useEffect, useRef } from "react";

export default function VideoPlayer({ src, isPlaying }: { src: string; isPlaying: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      void video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  return <video ref={videoRef} src={src} controls />;
}`,
          description: "The parent only sets isPlaying, and the Effect handles the imperative play and pause. Whether the video plays is now readable from state.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "state-in-handle",
      heading: "Exposing state changes as methods",
      problem: "Methods such as open, close, and setValue make the parent issue commands while the real state lives in the child. The parent has to track what it asked for, and it can drift from what actually happened.",
      correction: "Use props for anything that describes what should be on screen.",
    },
    {
      id: "leaking-node",
      heading: "Exposing the whole DOM node when a little is needed",
      problem: "Forwarding the ref directly lets callers do anything to the node. Soon they depend on its structure, and a markup change in your component breaks code in another part of the app.",
      correction: "Expose only the required methods, using useImperativeHandle.",
    },
    {
      id: "calling-during-render",
      heading: "Calling a handle’s method while rendering",
      problem: "ref.current is not set during the first render, and calling a method there would be a side effect in rendering anyway. The result is either a crash on null or behavior that repeats on each render.",
      correction: "Call methods from event handlers or Effects.",
    },
    {
      id: "effect-chains",
      heading: "Using an imperative call to mirror a prop",
      problem: "A parent with both state and a method call, keeping them in step in an Effect, has built two ways of doing one thing. Those paths can disagree, which produces bugs that are hard to trace.",
      correction: "Pick the declarative path, and have the child respond to the prop.",
    },
  ],
  interview: [
    {
      id: "ii-when",
      question: "When is an imperative component interface appropriate?",
      answer: "For actions that are events rather than state, such as focusing, scrolling, selecting text, or a one-off animation. If the thing can be described by a value, such as whether a modal is open, a prop is the better design.",
    },
    {
      id: "ii-why-not-open-close",
      question: "Why is an isOpen prop better than open and close methods?",
      answer: "The parent’s state then fully describes the screen, so it is easy to read, test, and restore. With methods, the state lives in the child, and the sequence of calls matters. Other components also cannot derive anything from it.",
    },
    {
      id: "ii-wrap",
      question: "How can you keep a declarative interface over an imperative API?",
      answer: "Take a prop, and use an Effect to translate it into the imperative calls when it changes. A VideoPlayer with isPlaying is a good example: callers set a value, while the component handles play and pause.",
    },
    {
      id: "ii-handle-size",
      question: "How do you design a good imperative handle?",
      answer: "Keep it small, with methods named for what they achieve rather than how. Hide the DOM node, and describe the handle in a TypeScript interface. That keeps your markup free to change without breaking callers.",
    },
    {
      id: "ii-testing",
      question: "How do imperative interfaces affect testing?",
      answer: "Tests must call methods in a certain order and then inspect the result, whereas declarative components can be rendered with given props. That is one more reason to keep them limited to real commands, and to test those through user-visible behavior.",
    },
  ],
  takeaways: [
    "Prefer props, and use methods only for true commands.",
    "Keep imperative handles small, purposeful, and typed.",
    "Hide DOM nodes behind the methods you choose to expose.",
    "An Effect can wrap imperative APIs in a declarative prop.",
  ],
  quickReview: {
    definition: "An imperative interface exposes methods for a parent to call, which should be reserved for actions that have no declarative form.",
    keyPoints: [
      "Props describe state, and methods trigger events.",
      "Focus, scroll, and one-off animations are fair uses.",
      "Open and close should generally be a prop.",
      "useImperativeHandle limits what a parent can reach.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A prop instead of a method",
      language: "tsx",
      code: `export default function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return isOpen ? <div role="dialog">{children}</div> : null;
}`,
      description: "The parent’s state decides, with no methods to call and nothing hidden.",
    },
    commonMistakes: [
      "Exposing open and close methods.",
      "Forwarding the whole DOM node.",
      "Calling handle methods while rendering.",
    ],
    interviewTrap: "“Is imperative code wrong in React?” No, but a component’s public interface should stay declarative wherever a value can describe the result.",
    takeaway: "If you can name the state, make it a prop. If it is just an event, a small method may fit.",
  },
  sources: [
    { label: "useImperativeHandle reference", href: "https://react.dev/reference/react/useImperativeHandle" },
    { label: "forwardRef reference", href: "https://react.dev/reference/react/forwardRef" },
    { label: "Synchronizing with Effects", href: "https://react.dev/learn/synchronizing-with-effects" },
  ],
};
