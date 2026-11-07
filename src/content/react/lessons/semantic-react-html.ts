import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "semantics-matter",
      heading: "Elements carry meaning",
      paragraphs: [
        "Semantic HTML means choosing elements for what they are, rather than for how they look by default. A heading, a list, and a button each tell browsers and assistive technology what something is. A screen reader user can then jump between headings, hear how many items a list has, or activate a button.",
        "JSX does not change this. React renders the elements you write, so a component built from div elements gives the browser no more information than hand-written div elements would. CSS can make any element look however you like, so appearance is never a reason to choose the wrong element.",
      ],
    },
    {
      id: "button-vs-div",
      heading: "Buttons and links",
      paragraphs: [
        "A button comes with focus, activation by Enter and Space, a role, and disabled behavior. A clickable div has none of it. The choice between a button and a link depends on what happens: a link goes somewhere, and a button does something.",
      ],
      comparison: [
        {
          id: "link-uses",
          title: "Use a link",
          items: ["It navigates to another address.", "It works with open in new tab, and it can be bookmarked.", "It is activated with Enter."],
        },
        {
          id: "button-uses",
          title: "Use a button",
          items: ["It performs an action on this page.", "It submits a form, or opens a dialog.", "It is activated with Enter or Space."],
        },
      ],
      examples: [
        {
          id: "button-native",
          classification: "complete",
          title: "Native elements for the job",
          language: "tsx",
          code: `export function LessonActions({ onSave }: { onSave: () => void }) {
  return (
    <div>
      <button type="button" onClick={onSave}>
        Save lesson
      </button>
      <a href="/frontend/react">All lessons</a>
    </div>
  );
}`,
          description: "Both work with a keyboard and assistive technology with no extra code. type=\"button\" stops the button from submitting a surrounding form.",
        },
      ],
    },
    {
      id: "page-structure",
      heading: "Landmarks and headings",
      paragraphs: [
        "Landmark elements describe regions of a page, so people using assistive technology can jump directly to them. Headings form an outline. Each heading’s level should reflect its place in that outline, rather than the size you want it to appear.",
      ],
      examples: [
        {
          id: "landmarks",
          classification: "complete",
          title: "A page with landmarks",
          language: "tsx",
          code: `export function ArticlePage() {
  return (
    <>
      <header>
        <nav aria-label="Primary">
          <a href="/">Home</a>
        </nav>
      </header>
      <main>
        <article>
          <h1>Rendering lists</h1>
          <section aria-labelledby="keys-heading">
            <h2 id="keys-heading">Keys</h2>
            <p>Keys identify items between renders.</p>
          </section>
        </article>
      </main>
      <footer>
        <p>Written for learners.</p>
      </footer>
    </>
  );
}`,
          description: "Fragments add no extra DOM, so semantic elements stay direct children where the structure requires it. A labelled section is exposed as a region.",
        },
      ],
    },
    {
      id: "lists-tables-forms",
      heading: "Lists, tables, and forms",
      paragraphs: ["The right element gives people information that they would otherwise have to work out."],
      list: [
        "ul and ol: assistive technology can announce the number of items, and the position in the list.",
        "table with th and caption: cells can be announced along with their headers.",
        "label: gives an input its name, and clicking the label focuses the input.",
        "fieldset and legend: names a group of related fields, such as radio buttons.",
        "dialog, details, and summary: native behavior for common interactive patterns.",
      ],
      closing: "Only use a table for data with rows and columns, since using one for layout misrepresents the content.",
    },
    {
      id: "components-and-semantics",
      heading: "Keeping semantics through components",
      paragraphs: [
        "Components can accidentally hide semantics. A Card that always renders a div forces each caller into the same structure, and a heading level fixed inside a component may not fit each page where it appears. Let callers choose the level or pass through attributes when structure depends on context. Also watch for invalid nesting: for example, a list’s direct children must be li elements, so an extra wrapper component rendering a div breaks that.",
      ],
      examples: [
        {
          id: "heading-level",
          classification: "complete",
          title: "Letting the caller choose the heading level",
          language: "tsx",
          code: `import type { ReactNode } from "react";

type CardProps = {
  title: string;
  headingLevel?: "h2" | "h3";
  children: ReactNode;
};

export function Card({ title, headingLevel: Heading = "h2", children }: CardProps) {
  return (
    <section>
      <Heading>{title}</Heading>
      {children}
    </section>
  );
}`,
          description: "Heading is capitalized, so JSX treats it as a variable holding the tag name. Each page can then fit the Card into its own outline.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "clickable-div",
      heading: "Making a div clickable",
      problem: "A div with onClick cannot be reached with Tab, and it does not respond to Enter or Space. Adding role, tabIndex, and key handlers only rebuilds part of what a button already has, with more room for bugs.",
      correction: "Use a button, and style it to look however you need.",
    },
    {
      id: "button-as-link",
      heading: "Using a button to navigate",
      problem: "A button that changes the address in its click handler cannot be opened in a new tab, and it does not reveal where it goes. People using assistive technology also expect different behavior from each kind of element.",
      correction: "Use a link for navigation, or your framework’s Link component.",
    },
    {
      id: "heading-for-size",
      heading: "Choosing headings for their size",
      problem: "Using h4 because it looks right, or skipping levels, gives a misleading outline to anyone navigating by heading. Using bold text instead of a heading removes the entry from that outline altogether.",
      correction: "Choose the level from the structure of the page, and use CSS for size.",
    },
    {
      id: "placeholder-as-label",
      heading: "Using a placeholder as the label",
      problem: "A placeholder disappears when typing begins, so people lose track of what the field is for, and it often has low contrast. It does not reliably serve as the field’s label either.",
      correction: "Add a visible label connected with htmlFor, and keep placeholders for hints.",
    },
    {
      id: "div-soup-lists",
      heading: "Breaking lists with wrapper elements",
      problem: "A component that renders a div inside a ul produces invalid structure, and assistive technology may not treat the items as a list. It is an easy mistake, because the wrapping is hidden inside a child component.",
      correction: "Have the item component render the li, and avoid extra wrappers.",
    },
  ],
  interview: [
    {
      id: "sh-what",
      question: "What is semantic HTML, and why does it matter?",
      answer: "Choosing elements for their meaning, rather than appearance. It gives browsers and assistive technology real information, so people can navigate by headings and landmarks, and controls get keyboard support. It also benefits search engines and developers reading the code.",
    },
    {
      id: "sh-button-link",
      question: "When do you use a button, and when a link?",
      answer: "A link navigates to a location, so it can be opened in a new tab or copied. A button performs an action on the current page, such as submitting or opening a dialog. Styling is separate, so a link can look like a button without changing what it is.",
    },
    {
      id: "sh-div-button",
      question: "What would it take to make a div behave like a button?",
      answer: "You would need a role, tabIndex, handlers for Enter and Space, disabled behavior, and form behavior as needed. That is a lot of code, and it is easy to get wrong, whereas a button element includes it all. So there is rarely a good reason to do it.",
    },
    {
      id: "sh-landmarks",
      question: "What are landmarks?",
      answer: "Regions such as header, nav, main, and footer that assistive technology can jump between. They give the page a navigable structure. If there are several of the same kind, such as two nav elements, labelling each one makes them distinguishable.",
    },
    {
      id: "sh-fragments",
      question: "How do Fragments help with semantics?",
      answer: "A component must return one parent in JSX, and a wrapper div can break structure that depends on direct children, such as a table row or a list. A Fragment groups elements with no extra DOM node, so the semantic structure remains valid.",
    },
    {
      id: "sh-component-headings",
      question: "How do you handle heading levels in reusable components?",
      answer: "Avoid fixing a level inside the component when it may appear in different places. Let the caller pass the level, or pass the heading itself as a prop. Then each page can maintain a sensible outline, regardless of where the component is used.",
    },
  ],
  takeaways: [
    "Choose elements for their meaning, and use CSS for appearance.",
    "Links go somewhere, and buttons do something.",
    "Headings form an outline, and landmarks mark regions.",
    "Check that components keep the structure valid.",
  ],
  quickReview: {
    definition: "Semantic HTML means using elements that communicate structure and behavior to browsers and users.",
    keyPoints: [
      "A button has focus and keyboard behavior built in.",
      "Heading levels follow structure, rather than size.",
      "A label gives an input its name.",
      "Fragments avoid breaking structure with extra nodes.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A labelled field",
      language: "tsx",
      code: `export function NameField() {
  return (
    <>
      <label htmlFor="name">Name</label>
      <input id="name" />
    </>
  );
}`,
      description: "htmlFor connects the label, which names the input and makes the label clickable.",
    },
    commonMistakes: [
      "Using a clickable div instead of a button.",
      "Choosing heading levels for their size.",
      "Using a placeholder in place of a label.",
    ],
    interviewTrap: "“Does React make div buttons accessible?” No. React renders what you write, so a div stays a div.",
    takeaway: "Start with the element that already does the job, then style it.",
  },
  sources: [
    { label: "MDN: HTML, a good basis for accessibility", href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML" },
    { label: "ARIA Authoring Practices: Read Me First", href: "https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/" },
    { label: "W3C tutorial: labelling controls", href: "https://www.w3.org/WAI/tutorials/forms/labels/" },
    { label: "Writing Markup with JSX", href: "https://react.dev/learn/writing-markup-with-jsx" },
    { label: "Common components reference", href: "https://react.dev/reference/react-dom/components/common" },
  ],
};
