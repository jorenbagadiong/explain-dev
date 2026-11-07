import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "the-problem",
      heading: "The problem it solves",
      paragraphs: [
        "Effects re-synchronize when a dependency changes. Sometimes an Effect also needs to read a value without reacting to it. A chat room should reconnect when roomId changes, but it should not reconnect because the user muted notifications, even though the connected notification reads muted.",
        "Listing muted as a dependency causes the unnecessary reconnects. Leaving it out reads a stale value and breaks the lint rule. useEffectEvent separates the two kinds of logic.",
      ],
    },
    {
      id: "how-it-works",
      heading: "How it works",
      paragraphs: [
        "const onEvent = useEffectEvent(callback) returns an Effect Event: a function with the same signature as your callback. When called, it runs the callback and always reads the latest committed props and state at the time of the call.",
        "Because it sees fresh values without re-synchronizing, it does not go in the Effect’s dependencies. The Hook is exported by the installed React 19.3 package, and it was added in React 19.2.",
      ],
      examples: [
        {
          id: "chat-room",
          classification: "client",
          title: "Reading the latest value without reconnecting",
          language: "tsx",
          code: `"use client";

import { useEffect, useEffectEvent } from "react";

function createConnection(roomId: string) {
  return {
    onConnected(handler: () => void) {
      window.setTimeout(handler, 100);
    },
    disconnect() {
      console.log("Disconnected from " + roomId);
    },
  };
}

export default function ChatRoom({ roomId, isMuted }: { roomId: string; isMuted: boolean }) {
  const onConnected = useEffectEvent(() => {
    if (!isMuted) window.alert("Connected to " + roomId);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.onConnected(() => onConnected());

    return () => connection.disconnect();
  }, [roomId]);

  return <h2>Room: {roomId}</h2>;
}`,
          description: "Changing roomId reconnects, while changing isMuted does not. When the event fires, it still reads the current isMuted. The connection here is a small stand-in for a real one.",
        },
      ],
    },
    {
      id: "the-rules",
      heading: "The rules",
      paragraphs: [
        "Effect Events have strict rules, enforced by eslint-plugin-react-hooks. They exist to keep this from becoming a way to hide dependencies.",
      ],
      list: [
        "Call useEffectEvent at the top level of a component or custom Hook.",
        "Call the Effect Event only from inside Effects, or from other Effect Events in the same component.",
        "Do not call it during rendering, and do not pass it to other components or Hooks.",
        "Do not list it in a dependency array.",
      ],
      closing: "Its identity is deliberately not stable, and it changes on every render. That way, adding it to a dependency array makes the Effect re-run on each render, which reveals the mistake.",
    },
    {
      id: "not-a-dependency-escape",
      heading: "It is not a way to silence the linter",
      paragraphs: [
        "Only use it for logic that is genuinely an event fired from an Effect. The test is whether the Effect should re-synchronize when that value changes. If it should, the value is a real dependency, and hiding it behind an Effect Event introduces the same stale-logic risks in a different form.",
      ],
      comparison: [
        {
          id: "stays-dependency",
          title: "Keep as a dependency",
          items: ["The connection’s server URL or room.", "A value that changes what the Effect sets up.", "Anything where a change should restart the work."],
        },
        {
          id: "effect-event",
          title: "Read in an Effect Event",
          items: ["A notification preference read when an event fires.", "A theme used only to style a message.", "A value used for logging at the moment something happens."],
        },
      ],
    },
    {
      id: "event-handlers-compared",
      heading: "How it differs from an event handler",
      paragraphs: [
        "A normal event handler runs in response to a user’s action, and you pass it to elements. An Effect Event runs because something happened inside an Effect, such as a connection opening or a timer firing. It cannot be used as an onClick handler, and an ordinary function serves that purpose better.",
      ],
    },
  ],
  mistakes: [
    {
      id: "hiding-dependencies",
      heading: "Using it to avoid listing a real dependency",
      problem: "Wrapping logic in an Effect Event because the linter complained can silence the warning for a value that should restart the Effect. The Effect then stops re-synchronizing, which is the same bug as omitting the dependency.",
      correction: "Ask whether a change should restart the work. If yes, keep it as a dependency.",
    },
    {
      id: "in-dependency-array",
      heading: "Listing the Effect Event as a dependency",
      problem: "Adding it to the array looks like the correct habit. The lint rule reports it, and because its identity changes every render, the Effect would re-run on each render.",
      correction: "Leave it out of the array. It is designed not to be a dependency.",
    },
    {
      id: "calling-from-handlers",
      heading: "Calling it from an event handler or passing it as a prop",
      problem: "It can seem like a general way to read the latest value in any callback. The lint rule rejects this, because it can only be called from Effects and Effect Events.",
      correction: "Use an ordinary function for event handlers, since those already see the latest values for their render.",
    },
    {
      id: "calling-during-render",
      heading: "Calling it during rendering",
      problem: "Calling it while rendering reads values through a function that exists for later events, so the lint rule reports that it cannot be called during rendering. It serves no purpose there, since rendering already has the current values.",
      correction: "Read values directly when rendering, and call Effect Events only from Effects.",
    },
    {
      id: "wrong-version",
      heading: "Assuming it exists in every React version",
      problem: "Copying this pattern into a project on an older React version fails because the export does not exist there. Examples online may also show older experimental import names.",
      correction: "Check the installed version, and import useEffectEvent from react on 19.2 or newer.",
    },
  ],
  interview: [
    {
      id: "uee-what",
      question: "What problem does useEffectEvent solve?",
      answer: "It lets an Effect read the latest props or state without re-synchronizing when they change. So a chat connection can reconnect on room changes while reading a mute setting only when the connected event fires.",
    },
    {
      id: "uee-reactive",
      question: "How do you decide between a dependency and an Effect Event?",
      answer: "I ask whether the Effect should restart when the value changes. If the value determines what is synchronized, it is a dependency. If it is only read at the moment something happens, it belongs in an Effect Event.",
    },
    {
      id: "uee-rules",
      question: "Where can an Effect Event be called?",
      answer: "Only from inside Effects or other Effect Events in the same component. It cannot be called during rendering, passed to other components, or used as an ordinary event handler. The React Hooks lint rule checks this.",
    },
    {
      id: "uee-identity",
      question: "Does useEffectEvent return a stable function?",
      answer: "No. Its identity intentionally changes on every render. It should never be in a dependency array, and if someone adds it, the Effect re-runs on every render, which makes the mistake visible rather than hiding it.",
    },
    {
      id: "uee-vs-ref",
      question: "How does this compare with storing the latest value in a ref?",
      answer: "A ref updated in an Effect was the common workaround, and it needs manual syncing. useEffectEvent expresses the intent directly and is understood by the lint rule. On versions without it, a ref is still the practical option.",
    },
    {
      id: "uee-handler",
      question: "How is an Effect Event different from a regular event handler?",
      answer: "An event handler runs because a user interacted, and it is passed to elements. An Effect Event is triggered by something inside an Effect, such as a timer or a connection. Each reads current values, but they serve different triggers and have different rules.",
    },
  ],
  takeaways: [
    "useEffectEvent separates non-reactive logic from an Effect’s synchronization.",
    "It always reads the latest committed props and state.",
    "Call it only from Effects, and keep it out of dependency arrays.",
    "It is not a tool for hiding real dependencies.",
  ],
  quickReview: {
    definition: "useEffectEvent creates a function an Effect can call to read the latest values without those values being dependencies.",
    keyPoints: [
      "It is available from react in 19.2 and newer.",
      "Only Effects and other Effect Events may call it.",
      "Its identity changes each render, by design.",
      "If a change should restart the Effect, keep it as a dependency.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Separating the event",
      language: "tsx",
      code: `const onTick = useEffectEvent(() => log(count));

useEffect(() => {
  const id = setInterval(() => onTick(), 1000);
  return () => clearInterval(id);
}, []);`,
      typecheckContext: { before: `import { useEffect, useEffectEvent } from "react";\ndeclare const log: (value: number) => void;\nexport function useExample(count: number) {`, after: "}" },
      description: "The interval is never restarted, yet each tick logs the current count.",
    },
    commonMistakes: [
      "Using it to silence the dependency lint rule.",
      "Adding it to a dependency array.",
      "Calling it from an event handler.",
    ],
    interviewTrap: "“Is useEffectEvent just a stable callback?” No. Its identity deliberately changes every render, and it can only be called from Effects.",
    takeaway: "Ask one question: should this change restart the Effect?",
  },
  sources: [
    { label: "useEffectEvent reference", href: "https://react.dev/reference/react/useEffectEvent" },
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
    { label: "Lifecycle of Reactive Effects", href: "https://react.dev/learn/lifecycle-of-reactive-effects" },
  ],
};
