import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "one-focused-job",
      heading: "One focused job",
      paragraphs: [
        "A component should ideally be concerned with one thing. If it keeps growing, it probably contains smaller components waiting to be extracted. This is the single responsibility idea applied to UI.",
        "A job does not mean one line of markup. A ProductPage may coordinate many things, and its job is coordinating them. Trouble starts when a component’s description needs several unrelated verbs: it fetches, and validates, and formats, and renders a chart.",
      ],
    },
    {
      id: "signs-of-too-much",
      heading: "Signs a component is doing too much",
      paragraphs: ["These signals are more useful than a line count."],
      list: [
        "Its name needs and, or is vague, such as Manager or Wrapper.",
        "State or Effects are only used by part of its output.",
        "It takes many props, and only some are used in each case.",
        "Changing one feature often breaks something unrelated in the same file.",
        "Testing a small behavior means setting up a lot of unrelated data.",
      ],
    },
    {
      id: "splitting-along-state",
      heading: "Splitting along state",
      paragraphs: [
        "State that only one part of a component needs is often the best place to cut. Moving it down gives that part a clear owner, and it also stops the rest from re-rendering whenever it changes.",
      ],
      examples: [
        {
          id: "move-state-down",
          classification: "complete",
          title: "Giving local state a local owner",
          language: "tsx",
          code: `import { useState } from "react";

function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit(text);
        setText("");
      }}
    >
      <label>
        Comment
        <textarea value={text} onChange={event => setText(event.target.value)} />
      </label>
      <button type="submit">Post</button>
    </form>
  );
}

function CommentList({ comments }: { comments: readonly string[] }) {
  return (
    <ul>
      {comments.map(comment => (
        <li key={comment}>{comment}</li>
      ))}
    </ul>
  );
}

export default function Comments() {
  const [comments, setComments] = useState<readonly string[]>([]);

  return (
    <section>
      <CommentList comments={comments} />
      <CommentForm onSubmit={text => setComments([...comments, text])} />
    </section>
  );
}`,
          description: "Typing only re-renders CommentForm. Comments owns the list and nothing about drafts. Using text as the key assumes comments are unique, so a real app would use IDs.",
        },
      ],
    },
    {
      id: "inputs",
      heading: "Keeping inputs manageable",
      paragraphs: [
        "A long prop list usually points to a component with several jobs, or to related values that should travel together. Group what belongs together, and split what does not.",
      ],
      comparison: [
        {
          id: "many-props",
          title: "A warning sign",
          items: ["Twelve individual props.", "Many are optional and rarely used together.", "Several exist only to pass further down."],
        },
        {
          id: "manageable",
          title: "Usually better",
          items: ["A few props, or an object for related data.", "Children or slots for content.", "Child components take what they need directly."],
        },
      ],
      closing: "Do not bundle unrelated props into a single options object only to shorten the list, because that hides the same problem without solving it.",
    },
    {
      id: "feature-coordinators",
      heading: "Coordinators and leaf components",
      paragraphs: [
        "It helps to think about two kinds of job. Coordinators sit higher in the tree, owning state and arranging parts. Leaf components sit lower, focused on rendering and reporting interactions. Neither is better, and most features need both.",
        "Keep leaf components free of knowledge about where they are used. Then they can be reused and tested easily, while the coordinators absorb the specifics of each screen.",
      ],
      visual: {
        heading: "Responsibilities in a feature",
        context: "Indentation shows which component renders which.",
        root: {
          id: "checkout",
          title: "CheckoutPage",
          description: "A coordinator: owns the cart and order state, and arranges the steps.",
          children: [
            { id: "summary", title: "OrderSummary", description: "Displays what it is given." },
            { id: "address", title: "AddressForm", description: "Owns draft fields, and reports the finished address." },
            { id: "pay", title: "PayButton", description: "Shows state, and reports a click." },
          ],
        },
        note: "Responsibilities are a judgment call, and a good split can change as a feature grows.",
      },
    },
  ],
  mistakes: [
    {
      id: "catch-all",
      heading: "Letting a page component do everything",
      problem: "Fetching, form state, validation, formatting, and all the markup in one page is quick to begin with. Soon every change risks another feature, and nothing can be tested without setting up the whole page.",
      correction: "Keep the page as a coordinator, and move each independent part into its own component.",
    },
    {
      id: "state-too-high",
      heading: "Holding local state in a parent",
      problem: "Keeping a draft’s text in a page component means each keystroke re-renders the whole page, and the page now has to know about a detail that only the form cares about.",
      correction: "Move state to the lowest component that needs it.",
    },
    {
      id: "leaf-knows-too-much",
      heading: "Letting a leaf component know its surroundings",
      problem: "A Button that checks which page it is on, or reads the current route to decide its behavior, cannot be used elsewhere. It also breaks silently when that page is renamed.",
      correction: "Pass a prop or callback, and let the parent decide.",
    },
    {
      id: "vague-names",
      heading: "Using vague names",
      problem: "Names such as Helper, Manager, or Wrapper give no hint of a component’s job, so unrelated code accumulates in them over time, because nothing in the name says it does not belong.",
      correction: "Pick a name that describes the job. If you cannot, the component may not have just one.",
    },
    {
      id: "split-by-size",
      heading: "Splitting only by line count",
      problem: "Cutting a long component in half at an arbitrary point creates two files with shared state passed back and forth. It looks tidier, but the responsibilities are as tangled as they were.",
      correction: "Split along state, data, and purpose, even if one part stays longer.",
    },
  ],
  interview: [
    {
      id: "resp-single",
      question: "How does single responsibility apply to React components?",
      answer: "A component should have one job you can describe clearly. That job might be coordination rather than rendering. If it needs several unrelated verbs, or if its state only serves part of its output, it probably contains smaller components.",
    },
    {
      id: "resp-too-big",
      question: "How do you know a component is too large?",
      answer: "Not by line count alone. I look for a vague name, state used by only part of the output, many rarely combined props, and changes breaking unrelated features. Difficulty testing a small behavior is a strong signal too.",
    },
    {
      id: "resp-state-move",
      question: "How does moving state down help?",
      answer: "It gives that state a clear owner, and it limits re-renders to the part that needs them. A form’s draft text inside the form means typing does not re-render the page, and the page no longer has to know that detail.",
    },
    {
      id: "resp-props",
      question: "What does a long prop list tell you?",
      answer: "Often that the component has several jobs, or that props are only passing through to a child. I would look at splitting it, or using children to remove the middle layer. Bundling into one options object hides the problem rather than fixing it.",
    },
    {
      id: "resp-coordinator",
      question: "What is the difference between a coordinating component and a leaf component?",
      answer: "A coordinator owns state and arranges children, and it knows about its screen. A leaf focuses on rendering and reporting events, and it knows little about where it is used. Keeping leaves free of context makes them easy to reuse and test.",
    },
  ],
  takeaways: [
    "Give each component a job you can name.",
    "Cut along state and purpose, not line count.",
    "A long prop list is a signal to re-examine the design.",
    "Coordinators own specifics, so leaves can stay general.",
  ],
  quickReview: {
    definition: "A well-scoped component has one clear job and a manageable set of inputs.",
    keyPoints: [
      "A job can be rendering or coordinating.",
      "State used by part of the output suggests a split.",
      "Keep state as low as it can go.",
      "Leaf components should not know where they are used.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A focused leaf",
      language: "tsx",
      code: `export default function SaveButton({ isSaving, onSave }: { isSaving: boolean; onSave: () => void }) {
  return (
    <button type="button" disabled={isSaving} onClick={onSave}>
      {isSaving ? "Saving…" : "Save"}
    </button>
  );
}`,
      description: "It shows a state and reports a click, and it knows nothing about what saving means.",
    },
    commonMistakes: [
      "Doing everything inside one page component.",
      "Keeping a form’s draft state in a far-off parent.",
      "Naming components Manager or Helper.",
    ],
    interviewTrap: "“Does a long component always need splitting?” Not by length alone. Look at whether its parts have separate purposes and separate state.",
    takeaway: "If describing a component needs the word and, consider splitting it.",
  },
  sources: [
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Sharing State Between Components", href: "https://react.dev/learn/sharing-state-between-components" },
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
  ],
};
