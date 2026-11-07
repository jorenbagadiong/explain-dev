import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-jsx-is",
      heading: "What JSX is",
      paragraphs: [
        "JSX is a syntax extension for JavaScript that lets you write markup-like code inside a JavaScript file. It exists because rendering logic and markup usually change together, so keeping them side by side in a component is convenient.",
        "JSX and React are separate things that are often used together. React does not strictly require JSX, but most React code uses it because nested elements are much easier to read than nested function calls. Browsers cannot run JSX directly, so a compiler turns it into plain JavaScript first.",
      ],
      examples: [
        {
          id: "profile-heading",
          classification: "complete",
          title: "JSX inside a component",
          language: "tsx",
          code: `export default function ProfileHeading() {
  const name = "Maria Santos";
  const avatarUrl = "/avatars/maria.png";

  return (
    <header className="profile">
      <img src={avatarUrl} alt={name} width={64} height={64} />
      <h2>{name}</h2>
    </header>
  );
}`,
          description: "The markup is ordinary JavaScript by the time it runs, so it can read the variables declared above it. Parentheses let the return value span several lines.",
        },
      ],
    },
    {
      id: "jsx-rules",
      heading: "The rules that differ from HTML",
      paragraphs: [
        "JSX looks like HTML but is stricter, because each tag becomes part of a JavaScript object. Three rules cover most of the differences.",
      ],
      list: [
        "Return a single root. A component cannot return two sibling tags on their own, so wrap them in a parent element or a Fragment, written <>...</>, which adds nothing to the DOM.",
        "Close every tag. Void elements need a slash, as in <img /> and <br />, and wrapping tags need a closing tag.",
        "Use camelCase for most attributes, because attributes become object keys. class becomes className, for becomes htmlFor, and stroke-width becomes strokeWidth. The aria-* and data-* attributes keep their dashes.",
      ],
    },
    {
      id: "curly-braces",
      heading: "Embedding JavaScript with curly braces",
      paragraphs: [
        "Curly braces open a window back into JavaScript, and any expression can go inside: a variable, a property, or a function call. They work in two places, as text content inside a tag and as an attribute value immediately after the equals sign.",
        "Quotes and braces mean different things. alt=\"Photo\" passes a string, alt={caption} reads a variable, and alt=\"{caption}\" passes the literal text {caption}. Double curlies are not special syntax either: in style={{ color: \"red\" }}, the outer pair is the JSX brace and the inner pair is an ordinary object.",
      ],
      examples: [
        {
          id: "braces-in-practice",
          classification: "complete",
          title: "Expressions in text and attributes",
          language: "tsx",
          code: `function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", { dateStyle: "long" });
}

export default function EventCard() {
  const event = { title: "React meetup", starts: new Date("2026-12-05") };

  return (
    <article style={{ borderRadius: 12, padding: 16 }}>
      <h2>{event.title}</h2>
      <p>Starts on {formatDate(event.starts)}</p>
    </article>
  );
}`,
          description: "The text uses a property and a function call. The style prop receives an object with camelCase keys, although a CSS class is usually the better choice for anything beyond a small dynamic value.",
        },
      ],
      closing: "Braces cannot name a tag, so <{tag}> does not work. To choose a tag dynamically, store it in a capitalized variable and render that variable as the tag.",
    },
    {
      id: "when-to-skip-jsx",
      heading: "When you would not use JSX",
      paragraphs: [
        "JSX needs a build step. A project without one can call createElement directly, which produces the same element objects. Beyond that case, JSX is the usual choice, and this curriculum uses it throughout.",
      ],
    },
  ],
  mistakes: [
    {
      id: "adjacent-roots",
      heading: "Returning adjacent tags without a wrapper",
      problem: "Two sibling tags in a return statement look harmless, but each one compiles to a separate JavaScript object, and a function can only return one value. The compiler reports an error.",
      correction: "Wrap them in a Fragment when you do not want an extra DOM element, or in a real parent when the layout needs one.",
    },
    {
      id: "rendering-objects",
      heading: "Rendering an object as text",
      problem: "Writing {person} inside a heading seems like it should print the person, but React cannot convert an arbitrary object into text. It throws an error saying objects are not valid as a React child.",
      correction: "Render a specific property, such as {person.name}, or map a collection into elements.",
    },
    {
      id: "braces-in-quotes",
      heading: "Putting braces inside quotes",
      problem: "An attribute such as src=\"{imageUrl}\" looks like interpolation, but quotes create a plain string, so the browser receives the literal characters {imageUrl} and the image fails to load.",
      correction: "Use braces alone, as in src={imageUrl}. Build combined values with an expression inside the braces.",
    },
    {
      id: "html-attribute-names",
      heading: "Copying HTML attribute names unchanged",
      problem: "Pasted HTML often keeps class and for. These collide with JavaScript reserved words, so TypeScript rejects them and React warns in the console, because JSX attributes map to object keys.",
      correction: "Use className and htmlFor, and write other multi-word attributes in camelCase. A converter can help with large pieces of pasted markup.",
    },
  ],
  interview: [
    {
      id: "what-is-jsx",
      question: "What is JSX, and why does React code use it?",
      answer: "JSX is a syntax extension that lets you write markup inside JavaScript. A compiler turns it into element-creating calls before the code runs. React code uses it because a component’s rendering logic and markup stay together, and nested structure is easier to read than nested function calls.",
    },
    {
      id: "jsx-vs-html",
      question: "How does JSX differ from HTML?",
      answer: "It is stricter and follows JavaScript rules. Every tag must close, a component returns one root, most attributes are camelCase, and class becomes className. Curly braces also embed live JavaScript expressions, which HTML has no equivalent for.",
    },
    {
      id: "single-root-why",
      question: "Why must a component return a single root element?",
      answer: "JSX compiles to JavaScript objects, and a function cannot return two values without wrapping them. The usual fix is a Fragment, which groups the elements without adding a node to the DOM.",
    },
    {
      id: "double-curlies",
      question: "What do double curly braces mean in JSX?",
      answer: "They are not special syntax. The outer braces switch into JavaScript, and the inner braces create an object literal. You see this most with the style prop, which takes an object with camelCase keys instead of a CSS string.",
    },
    {
      id: "jsx-required",
      question: "Can you use React without JSX?",
      answer: "Yes. JSX is a convenience over element creation, so you can call createElement yourself and get the same element objects. Most projects still use JSX for readability, and it is mainly avoided when a project has no build step.",
    },
    {
      id: "expressions-only",
      question: "Why can you put a ternary inside JSX braces but not an if statement?",
      answer: "Braces accept expressions, which produce a value. An if statement is a statement and produces no value to embed. To branch with if, do it above the return and store the result in a variable, or return early.",
    },
  ],
  takeaways: [
    "JSX is a syntax extension compiled to JavaScript, and it is separate from React itself.",
    "Return one root, close every tag, and use camelCase attributes such as className.",
    "Curly braces embed expressions in text and attribute values, while quotes create strings.",
    "Objects cannot be rendered directly as children, so render a property or map a collection.",
  ],
  quickReview: {
    definition: "JSX is markup-like syntax in JavaScript that compiles to element objects before it runs.",
    keyPoints: [
      "One root per component, or a Fragment when no wrapper is wanted.",
      "Every tag closes, including <img /> and <br />.",
      "Attributes are mostly camelCase: className, htmlFor, strokeWidth.",
      "Braces hold expressions, in text content or attribute values only.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Braces, className, and a Fragment",
      language: "tsx",
      code: `export default function Label({ count }: { count: number }) {
  return (
    <>
      <span className="label">Items</span>
      <span>{count}</span>
    </>
  );
}`,
      description: "Two siblings under a Fragment, with a class and an expression.",
    },
    commonMistakes: [
      "Rendering a whole object, as in {person}, instead of one of its properties.",
      "Writing src=\"{url}\", which passes literal text rather than the variable.",
      "Keeping HTML’s class and for attributes.",
    ],
    interviewTrap: "“Is JSX just HTML in JavaScript?” No. It compiles to JavaScript, follows stricter rules, and embeds expressions. React can also be used without it.",
    takeaway: "Read JSX as JavaScript that describes UI, and its rules stop feeling arbitrary.",
  },
  sources: [
    { label: "Writing Markup with JSX", href: "https://react.dev/learn/writing-markup-with-jsx" },
    { label: "JavaScript in JSX with Curly Braces", href: "https://react.dev/learn/javascript-in-jsx-with-curly-braces" },
    { label: "createElement reference", href: "https://react.dev/reference/react/createElement" },
  ],
};
