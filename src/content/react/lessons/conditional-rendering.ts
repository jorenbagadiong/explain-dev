import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "conditions-are-javascript",
      heading: "Conditions are ordinary JavaScript",
      paragraphs: [
        "React has no special syntax for conditions. Control flow is handled by JavaScript, so you use the same if statements and operators as anywhere else, then return whichever JSX fits.",
        "This works because JSX elements are only descriptions. Choosing one over another costs almost nothing, and nothing is created in the DOM until React commits the result.",
      ],
    },
    {
      id: "if-and-early-return",
      heading: "if statements and early returns",
      paragraphs: [
        "Use if when a case changes the whole result, or when the logic is too large to read comfortably inside markup. An early return handles a special case first and leaves the main path unindented.",
        "A component can return null to render nothing. That is valid, but it can surprise someone reading the parent, so it is often clearer for the parent to decide whether to include the child at all.",
      ],
      examples: [
        {
          id: "early-return",
          classification: "complete",
          title: "An early return for a special case",
          language: "tsx",
          code: `interface OrderSummaryProps {
  items: readonly string[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  if (items.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <section>
      <h2>Your order</h2>
      <p>{items.length} items</p>
    </section>
  );
}`,
          description: "The empty case has a different shape altogether, so it gets its own return statement.",
        },
      ],
    },
    {
      id: "ternary-and-logical-and",
      heading: "Conditional expressions and logical AND",
      paragraphs: [
        "Inside JSX, you need an expression. The conditional operator, written condition ? a : b, chooses between two results. Logical AND, written condition && a, shows something or nothing.",
        "Logical AND returns its left side when that side is falsy. React renders nothing for false, null, and undefined, but it does render 0, and an empty string produces nothing visible. So {count && <Badge />} shows a stray 0 when count is 0. Compare explicitly, as in {count > 0 && <Badge />}.",
      ],
      examples: [
        {
          id: "inline-conditions",
          classification: "complete",
          title: "Choosing and showing inline",
          language: "tsx",
          code: `interface InboxTitleProps {
  unread: number;
  isOffline: boolean;
}

export default function InboxTitle({ unread, isOffline }: InboxTitleProps) {
  return (
    <header>
      <h2>{unread > 0 ? "New messages" : "Inbox"}</h2>
      {unread > 0 && <p>{unread} unread</p>}
      {isOffline && <p role="status">You are offline.</p>}
    </header>
  );
}`,
          description: "The ternary picks between two strings. Each && either adds a paragraph or leaves a hole, and the number is compared rather than used directly.",
        },
      ],
    },
    {
      id: "choosing-a-style",
      heading: "Choosing a style",
      paragraphs: [
        "Pick whichever form stays readable. Deeply nested ternaries are hard to follow, so extract a variable or a child component when you reach that point.",
      ],
      list: [
        "A different overall result: if with an early return.",
        "Two alternatives inside markup: a conditional expression.",
        "Something or nothing inside markup: logical AND, with a boolean on the left.",
        "Many branches: a variable assigned above the return, or a child component.",
      ],
      examples: [
        {
          id: "variable-branch",
          classification: "complete",
          title: "Assigning JSX to a variable",
          language: "tsx",
          code: `type Status = "draft" | "published" | "archived";

export default function StatusLabel({ status }: { status: Status }) {
  let label = <span>Draft</span>;

  if (status === "published") {
    label = <strong>Published</strong>;
  } else if (status === "archived") {
    label = <em>Archived</em>;
  }

  return <p>Status: {label}</p>;
}`,
          description: "The variable is local to this render, so reassigning it does not affect purity. The markup below stays flat however many branches there are.",
        },
      ],
      closing: "Conditional rendering also affects state. A component removed from the tree loses its state, so hiding something with a condition is not the same as hiding it with CSS.",
    },
  ],
  mistakes: [
    {
      id: "number-on-left",
      heading: "Using a number on the left of &&",
      problem: "{messages.length && <Inbox />} reads as if nothing shows for an empty list. But when the length is 0, the whole expression evaluates to 0, and React renders that number on the page.",
      correction: "Make the left side a boolean, as in {messages.length > 0 && <Inbox />}.",
    },
    {
      id: "nested-ternaries",
      heading: "Nesting ternaries deeply",
      problem: "A chain of conditional operators compiles fine, but its branches become hard to match up. A later change is likely to land on the wrong branch, and reviewers struggle to see every case.",
      correction: "Use an early return, assign to a variable above the return, or extract a child component for each case.",
    },
    {
      id: "condition-resets-state",
      heading: "Forgetting that removing a component destroys its state",
      problem: "Toggling {isOpen && <Form />} seems equivalent to hiding the form. But React removes the component when the condition is false, so anything typed into it is gone when it comes back.",
      correction: "Keep the state in a parent if it must survive, or hide the element with CSS when both the state and the DOM should remain.",
    },
    {
      id: "statement-in-jsx",
      heading: "Writing an if statement inside JSX braces",
      problem: "An if inside braces is a syntax error, because braces only accept expressions. It is a common first attempt, since the same code would be valid a few lines higher.",
      correction: "Move the if above the return, or use a conditional expression inside the braces.",
    },
  ],
  interview: [
    {
      id: "ways-to-conditionally-render",
      question: "What are the common ways to render conditionally in React?",
      answer: "An if statement with an early return, assigning JSX to a variable, the conditional operator inside markup, and logical AND for something-or-nothing cases. They are all plain JavaScript, so the choice comes down to readability.",
    },
    {
      id: "zero-pitfall",
      question: "What is the problem with {count && <Badge />}?",
      answer: "When count is 0, && returns 0, and React renders numbers, so a 0 appears on the page. The fix is a boolean on the left side, such as count > 0. Values like false, null, and undefined render nothing, which is why the bug only shows for zero.",
    },
    {
      id: "return-null",
      question: "Is it acceptable for a component to return null?",
      answer: "Yes, it renders nothing and is valid. It can be surprising, though, because the parent’s JSX still shows the component. Often the parent should decide whether to include it, unless the child truly owns that decision.",
    },
    {
      id: "css-vs-condition",
      question: "What is the difference between hiding with a condition and hiding with CSS?",
      answer: "A condition removes the component from the tree, so its state and DOM are destroyed and re-created on return. CSS keeps both alive and only changes visibility. I choose based on whether the state should survive and on the cost of mounting.",
    },
    {
      id: "no-special-syntax",
      question: "Why doesn’t React have a template directive like v-if?",
      answer: "JSX is JavaScript, so React reuses the language’s own control flow rather than adding its own. Elements are plain values, which means choosing between them with normal operators needs nothing extra.",
    },
  ],
  takeaways: [
    "Conditions in React are plain JavaScript.",
    "Use if for whole-result changes, and expressions inside markup.",
    "Keep the left side of && a boolean to avoid rendering 0.",
    "A conditionally removed component loses its state.",
  ],
  quickReview: {
    definition: "Conditional rendering means returning different elements using ordinary JavaScript control flow.",
    keyPoints: [
      "Early returns suit a special case that changes the whole result.",
      "A ternary chooses between two results inside markup.",
      "Logical AND shows something or nothing.",
      "false, null, and undefined render nothing, but 0 renders.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A safe logical AND",
      language: "tsx",
      code: `export default function CartBadge({ count }: { count: number }) {
  return <div>{count > 0 && <span>{count} items</span>}</div>;
}`,
      description: "The comparison keeps a zero count from appearing on the page.",
    },
    commonMistakes: [
      "Rendering a stray 0 with a number on the left of &&.",
      "Nesting ternaries until the branches are unreadable.",
      "Expecting state to survive a conditional removal.",
    ],
    interviewTrap: "“Are {show && <Form />} and hiding with CSS the same?” No. The condition destroys the form’s state and DOM, while CSS keeps both.",
    takeaway: "Use the plainest JavaScript that reads well, and remember what removal does to state.",
  },
  sources: [
    { label: "Conditional Rendering", href: "https://react.dev/learn/conditional-rendering" },
    { label: "Preserving and Resetting State", href: "https://react.dev/learn/preserving-and-resetting-state" },
  ],
};
