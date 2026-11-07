import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "choosing-array-methods",
      heading: "Choosing methods that return new arrays",
      paragraphs: [
        "Arrays in state are read-only, just like objects. Some array methods change the original, while others return a new array. Prefer the second group, and pass the result to the setter.",
      ],
      comparison: [
        {
          id: "avoid",
          title: "Avoid: these mutate the array",
          items: ["Adding: push, unshift.", "Removing: pop, shift, splice.", "Replacing: splice, arr[i] = value.", "Ordering: reverse, sort."],
        },
        {
          id: "prefer",
          title: "Prefer: these return a new array",
          items: ["Adding: spread, concat.", "Removing: filter, slice.", "Replacing: map.", "Ordering: toSorted, toReversed, or copy first."],
        },
      ],
      closing: "slice and splice look alike but behave differently: slice copies, while splice mutates.",
    },
    {
      id: "adding-and-removing",
      heading: "Adding and removing items",
      paragraphs: [
        "Spread lets you add an item at either end by placing it before or after the existing items. filter creates an array without the item you want to remove, and it leaves the original alone.",
      ],
      examples: [
        {
          id: "add-remove",
          classification: "complete",
          title: "Adding with spread and removing with filter",
          language: "tsx",
          code: `import { useState } from "react";

interface Task {
  id: number;
  title: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<readonly Task[]>([{ id: 1, title: "Read the docs" }]);
  const [nextId, setNextId] = useState(2);

  function addTask() {
    setTasks([...tasks, { id: nextId, title: "Task " + nextId }]);
    setNextId(nextId + 1);
  }

  function removeTask(id: number) {
    setTasks(tasks.filter(task => task.id !== id));
  }

  return (
    <>
      <button type="button" onClick={addTask}>
        Add task
      </button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title}
            <button type="button" onClick={() => removeTask(task.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}`,
          description: "Both updates produce a new array, and marking the array readonly lets TypeScript reject push and sort on it.",
        },
      ],
    },
    {
      id: "transforming-items",
      heading: "Changing one item in a list",
      paragraphs: [
        "A copied array is shallow, so it still holds the same objects. Writing to next[0].done would change the object in the old state as well. To update one item, use map, return a new object for the item that changes, and return the rest as they are.",
      ],
      examples: [
        {
          id: "map-update",
          classification: "complete",
          title: "Updating an object inside an array",
          language: "tsx",
          code: `import { useState } from "react";

const initialItems = [
  { id: "a", label: "Milk", isPacked: false },
  { id: "b", label: "Tea", isPacked: false },
];

export default function PackingList() {
  const [items, setItems] = useState(initialItems);

  function toggle(id: string) {
    setItems(items.map(item => (item.id === id ? { ...item, isPacked: !item.isPacked } : item)));
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <label>
            <input type="checkbox" checked={item.isPacked} onChange={() => toggle(item.id)} />
            {item.label}
          </label>
        </li>
      ))}
    </ul>
  );
}`,
          description: "Only the matching item becomes a new object. The others keep their identity, which also helps memoized children skip work.",
        },
      ],
    },
    {
      id: "inserting-and-sorting",
      heading: "Inserting and reordering",
      paragraphs: [
        "To insert into the middle, combine slice and spread. To reorder, use the non-mutating toSorted or toReversed, or copy the array and then call sort or reverse on the copy. Because the copy is new, changing its order does not touch state.",
      ],
      examples: [
        {
          id: "insert-sort",
          classification: "snippet",
          title: "Inserting and sorting without mutation",
          language: "tsx",
          code: `const inserted = [...items.slice(0, index), newItem, ...items.slice(index)];

const sorted = items.toSorted((a, b) => a.localeCompare(b));`,
          typecheckContext: { before: "declare const items: readonly string[];\ndeclare const index: number;\ndeclare const newItem: string;\nexport {};" },
          description: "Each line produces a new array and leaves items as it was. toSorted requires a reasonably modern browser, so copy and sort if you must support older ones.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "push-then-set",
      heading: "Using push and passing the same array",
      problem: "items.push(item) followed by setItems(items) passes the original reference. React sees no change, so the list may not update, even though the data in memory has changed.",
      correction: "Pass a new array, as in setItems([...items, item]).",
    },
    {
      id: "sorting-state",
      heading: "Sorting state in place",
      problem: "items.sort() both reorders the array and returns it, so it looks harmless. It changes state directly, and if called during rendering, it also mutates data that other code relies on.",
      correction: "Use toSorted, or sort a copy, as in [...items].sort().",
    },
    {
      id: "shallow-array-copy",
      heading: "Mutating objects inside a copied array",
      problem: "const next = [...items] followed by next[0].isPacked = true looks safe, because the array is new. But next[0] and items[0] are the same object, so the old state changes too, and duplicates in another list change as well.",
      correction: "Use map, and create a new object for the changed item.",
    },
    {
      id: "index-id",
      heading: "Using the array index as the identity for updates",
      problem: "Toggling an item by its index works until the list is filtered or reordered. Then the index refers to a different item, so the action changes or removes the wrong one.",
      correction: "Give items stable IDs, and target updates by ID.",
    },
  ],
  interview: [
    {
      id: "add-to-array",
      question: "How do you add an item to an array in state?",
      answer: "Create a new array with spread, as in setItems([...items, item]), or place the item first to prepend it. push would mutate the existing array and leave the same reference, which React may treat as no change.",
    },
    {
      id: "remove-from-array",
      question: "How do you remove an item from an array in state?",
      answer: "Use filter to create a new array that leaves it out, usually by comparing IDs. filter does not touch the original. splice would be wrong here because it mutates, even though the two can give the same visible result.",
    },
    {
      id: "update-item",
      question: "How do you update one object in an array of objects?",
      answer: "map over the array, return a copy with the change for the matching item, and return other items unchanged. That creates a new array and a new object only where needed, and it leaves the old state untouched.",
    },
    {
      id: "sort-safely",
      question: "How do you sort an array that is in state?",
      answer: "Use toSorted, which returns a new array, or copy and sort, as in [...items].sort(). Calling sort directly mutates state. If the sorted order is only for display, it should usually be calculated during rendering rather than stored.",
    },
    {
      id: "shallow-copy-q",
      question: "Why isn’t [...items] enough when you change a property of an item?",
      answer: "The copy is shallow. It is a new array holding the same object references, so changing a property affects the object in the old array too. You also need a new object for the item you change.",
    },
  ],
  takeaways: [
    "Use methods that return new arrays, and pass the result to the setter.",
    "Add with spread, remove with filter, and change items with map.",
    "A copied array still shares its objects, so copy the object you change.",
    "Target updates by a stable ID rather than the index.",
  ],
  quickReview: {
    definition: "Updating an array immutably means building a new array for each change and leaving the existing one untouched.",
    keyPoints: [
      "push, pop, shift, unshift, splice, sort, and reverse all mutate.",
      "spread, filter, map, slice, and toSorted return new arrays.",
      "Array copies are shallow.",
      "Marking state as readonly lets TypeScript catch mutation.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Update one item",
      language: "tsx",
      code: `setItems(items.map(item => (item.id === id ? { ...item, isDone: true } : item)));`,
      typecheckContext: { before: `type Item = { id: string; isDone: boolean };\ndeclare const items: readonly Item[];\ndeclare const id: string;\ndeclare const setItems: (next: readonly Item[]) => void;` },
      description: "A new array, with a new object only for the matching item.",
    },
    commonMistakes: [
      "Calling push and passing the same array to the setter.",
      "Calling sort directly on state.",
      "Writing to an object inside a copied array.",
    ],
    interviewTrap: "“Is [...items] a safe way to change an item’s property?” Not by itself. The array is new, but its objects are shared with the old state.",
    takeaway: "Every array change should end with a new array, and a new object for each item you changed.",
  },
  sources: [
    { label: "Updating Arrays in State", href: "https://react.dev/learn/updating-arrays-in-state" },
    { label: "Updating Objects in State", href: "https://react.dev/learn/updating-objects-in-state" },
  ],
};
