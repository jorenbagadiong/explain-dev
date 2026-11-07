import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "treat-state-as-read-only",
      heading: "Treat objects in state as read-only",
      paragraphs: [
        "Numbers and strings can only be replaced, never changed. Objects can technically be changed, but when one is in React state, you should treat it as if it could not be. Changing a property directly does not tell React anything happened, so nothing renders.",
        "To update an object, create a new one and pass it to the setter. Mutating an object you just created is fine, because nothing else has a reference to it yet.",
      ],
      examples: [
        {
          id: "replace-object",
          classification: "complete",
          title: "Replacing rather than mutating",
          language: "tsx",
          code: `import { useState } from "react";

interface Position {
  x: number;
  y: number;
}

export default function MoveButton() {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  function handleMove() {
    // Avoid: position.x += 10, which React cannot see.
    setPosition({ ...position, x: position.x + 10 });
  }

  return (
    <button type="button" onClick={handleMove}>
      x is {position.x}, y is {position.y}
    </button>
  );
}`,
          description: "The setter receives a new object, so React knows to render. The spread keeps y as it was.",
        },
      ],
    },
    {
      id: "copying-with-spread",
      heading: "Copying with spread",
      paragraphs: [
        "Spread syntax copies an object’s properties into a new one, and any property listed afterward overrides the copy. A computed property name lets one handler update whichever field changed.",
      ],
      examples: [
        {
          id: "form-object",
          classification: "complete",
          title: "One handler for several fields",
          language: "tsx",
          code: `import { useState, type ChangeEvent } from "react";

export default function ProfileForm() {
  const [profile, setProfile] = useState({ firstName: "", lastName: "" });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  }

  return (
    <form>
      <label>
        First name
        <input name="firstName" value={profile.firstName} onChange={handleChange} />
      </label>
      <label>
        Last name
        <input name="lastName" value={profile.lastName} onChange={handleChange} />
      </label>
    </form>
  );
}`,
          description: "The name attribute decides which key is overridden, and the spread keeps the other field.",
        },
      ],
    },
    {
      id: "nested-objects",
      heading: "Updating nested objects",
      paragraphs: [
        "Spread is shallow: it copies only one level. To change a nested value, copy every level from the top down to the change.",
        "Nested objects are not really inside each other. They are separate objects that refer to one another, so two objects can point to the same inner object. Mutating it through one affects both, which is one more reason not to mutate.",
      ],
      examples: [
        {
          id: "nested-update",
          classification: "complete",
          title: "Copying each level",
          language: "tsx",
          code: `import { useState } from "react";

const initialPerson = {
  name: "Ana",
  address: { city: "Cebu", country: "Philippines" },
};

export default function CityPicker() {
  const [person, setPerson] = useState(initialPerson);

  function moveToDavao() {
    setPerson({
      ...person,
      address: { ...person.address, city: "Davao" },
    });
  }

  return (
    <button type="button" onClick={moveToDavao}>
      {person.name} lives in {person.address.city}
    </button>
  );
}`,
          description: "Both the outer object and the address are new. Deeply nested state gets verbose, which often signals that the state shape should be flatter.",
        },
      ],
      closing: "If nested updates are frequent, flatten the state or consider the separate Immer library, whose use-immer package lets you write mutating-style code that produces a new object. It is optional and not part of React.",
    },
    {
      id: "why-immutability",
      heading: "Why React asks for this",
      paragraphs: ["Immutability is what several useful behaviors are built on."],
      list: [
        "Change detection is cheap, because comparing references is enough for React and memo.",
        "Debugging is easier, because logged past state is not overwritten later.",
        "Undo and history features are simple, since old copies are kept intact.",
        "React’s features can rely on state being a snapshot.",
      ],
    },
  ],
  mistakes: [
    {
      id: "direct-mutation",
      heading: "Changing a property and calling the setter with the same object",
      problem: "user.name = \"Ana\" followed by setUser(user) looks complete. But the reference has not changed, so React compares it with Object.is, sees no difference, and may skip the render entirely.",
      correction: "Pass a new object, such as setUser({ ...user, name: \"Ana\" }).",
    },
    {
      id: "shallow-copy-trap",
      heading: "Assuming spread copies deeply",
      problem: "const next = { ...person } followed by next.address.city = \"Davao\" appears safe. But next.address is the same object as person.address, so the old state has been mutated too, which can break earlier renders and history.",
      correction: "Copy each level you change, or use structuredClone only if you truly need a full deep copy.",
    },
    {
      id: "partial-update",
      heading: "Passing only the changed field",
      problem: "Class components merged state updates, so setProfile({ firstName }) may look right. useState replaces the whole value, so the other fields vanish and controlled inputs can break.",
      correction: "Spread the previous object first, or keep unrelated values in separate state variables.",
    },
    {
      id: "deep-nesting",
      heading: "Keeping unnecessarily deep state",
      problem: "A tree of nested objects makes every update long and easy to get wrong. Each level must be copied, so a small change takes many lines, and mistakes in those copies produce silent mutation.",
      correction: "Flatten the state, usually by storing items by ID, or use a reducer to centralize the update logic.",
    },
  ],
  interview: [
    {
      id: "why-not-mutate",
      question: "Why shouldn’t you mutate an object in React state?",
      answer: "React decides whether state changed by comparing references with Object.is. A mutated object has the same reference, so the update can be skipped. It also changes data earlier renders rely on, which undermines snapshots and any comparison based on identity.",
    },
    {
      id: "spread-shallow",
      question: "What does it mean that spread is shallow?",
      answer: "It copies one level of properties. Nested objects are copied by reference, so the new and old objects share them. Changing a nested value requires copying each level along the path to that value.",
    },
    {
      id: "nested-update-q",
      question: "How do you update a deeply nested value in state?",
      answer: "Copy from the top down: spread the outer object, then spread each nested object on the way to the change. If that gets unwieldy, I would flatten the state, use a reducer, or use Immer, which is a separate library.",
    },
    {
      id: "local-mutation-allowed",
      question: "Is mutating an object ever acceptable in an event handler?",
      answer: "Yes, if you created the object just now and nothing else references it, such as building a new object before passing it to the setter. The rule is about objects already in state, because other renders may depend on those.",
    },
    {
      id: "setstate-merge",
      question: "Does useState merge objects like class setState did?",
      answer: "No, it replaces the value entirely. Passing only one field discards the others. This is why object updates spread the previous value first, and it is a reason to split unrelated values into separate state variables.",
    },
  ],
  takeaways: [
    "Treat objects in state as read-only, and pass new ones to the setter.",
    "Spread copies one level, so nested updates copy every level on the path.",
    "useState replaces rather than merges.",
    "Deep nesting is often a sign to flatten the state shape.",
  ],
  quickReview: {
    definition: "Updating an object immutably means creating a changed copy and passing it to the setter, leaving the old object untouched.",
    keyPoints: [
      "React compares references with Object.is.",
      "Spread is shallow, and nested objects stay shared.",
      "Mutating a brand-new object is fine.",
      "Immer is optional, and it is a separate package.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Copy each level",
      language: "tsx",
      code: `setPerson({
  ...person,
  address: { ...person.address, city: "Davao" },
});`,
      typecheckContext: { before: `type Person = { name: string; address: { city: string } };\ndeclare const person: Person;\ndeclare const setPerson: (next: Person) => void;` },
      description: "The outer object and the address are both new, and everything else carries over.",
    },
    commonMistakes: [
      "Mutating a property, then passing the same object to the setter.",
      "Assuming spread makes a deep copy.",
      "Passing only one field, as if useState merged updates.",
    ],
    interviewTrap: "“Does { ...person } copy the address too?” No. It copies the reference, so changing next.address.city also changes the old state.",
    takeaway: "If a value is in state, do not change it. Make a new one.",
  },
  sources: [
    { label: "Updating Objects in State", href: "https://react.dev/learn/updating-objects-in-state" },
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
  ],
};
