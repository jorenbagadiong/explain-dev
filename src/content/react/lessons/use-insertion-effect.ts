import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "who-it-is-for",
      heading: "Who this Hook is for",
      paragraphs: [
        "useInsertionEffect is for authors of CSS-in-JS libraries that inject styles at runtime. If you are not building one, you almost certainly want useEffect or useLayoutEffect instead.",
        "It is still worth understanding, because you may meet it in library code, and because it explains the ordering of Effects.",
      ],
    },
    {
      id: "when-it-runs",
      heading: "When it runs",
      paragraphs: [
        "It runs after a component is added to the DOM but before any layout Effects fire. That order is the whole point. Styles need to exist before anything else reads layout, or those measurements would be based on outdated styles.",
        "It also differs in how it sequences work. Other Effects run all cleanups and then all setups, while this one runs cleanup and setup one component at a time, so they interleave.",
      ],
      visual: {
        heading: "Effect timing on a commit",
        context: "This shows the order for the three Effect Hooks during a single update.",
        steps: [
          { id: "insertion", title: "useInsertionEffect", description: "Inserts styles, before layout can be read." },
          { id: "layout", title: "useLayoutEffect", description: "Can measure, with new styles now in place, before paint." },
          { id: "paint", title: "Browser paint", description: "The result is drawn." },
          { id: "effect", title: "useEffect", description: "Usually runs after paint, for most side effects." },
        ],
        note: "This is simplified. Whether insertion runs before or after the DOM itself is updated is unspecified, so do not rely on either order.",
      },
    },
    {
      id: "restrictions",
      heading: "What it cannot do",
      paragraphs: ["The Hook is deliberately narrow, with restrictions that the others do not have."],
      list: [
        "You cannot update state inside it.",
        "Refs are not attached yet when it runs.",
        "It may run before or after the DOM is updated, so you cannot rely on either.",
        "It only runs on the client, and Effects do not run during server rendering.",
      ],
    },
    {
      id: "library-pattern",
      heading: "How a library might use it",
      paragraphs: [
        "A library’s Hook takes a style rule, and inserts a style tag once per rule. The set prevents inserting the same rule repeatedly.",
      ],
      examples: [
        {
          id: "use-css",
          classification: "client",
          title: "A simplified CSS-in-JS Hook",
          language: "tsx",
          code: `"use client";

import { useInsertionEffect } from "react";

const insertedRules = new Set<string>();

export function useCss(rule: string) {
  useInsertionEffect(() => {
    if (insertedRules.has(rule)) return;
    insertedRules.add(rule);

    const style = document.createElement("style");
    style.textContent = rule;
    document.head.appendChild(style);
  });

  return rule;
}`,
          description: "This is a sketch of the pattern for library authors, not something most applications should write. It never removes rules. A real library also deals with server collection and removal.",
        },
      ],
      closing: "On a server, a library can collect the rules during rendering, guarded by a check for window, and send them with the HTML.",
    },
    {
      id: "why-not-others",
      heading: "Why not render or the other Effects?",
      paragraphs: [
        "These alternatives seem simpler, and each has a real problem.",
      ],
      comparison: [
        {
          id: "during-render",
          title: "Injecting during rendering",
          items: ["Rendering must stay pure.", "It is extremely slow during a non-blocking update such as a transition.", "The browser recalculates styles on every frame while the tree renders."],
        },
        {
          id: "later-effects",
          title: "Injecting in other Effects",
          items: ["They run too late.", "Another component’s layout Effect could read layout first.", "Its measurements would then reflect outdated styles."],
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "app-code",
      heading: "Using it in application code",
      problem: "Its early timing can look like a useful way to run code before layout Effects. For anything other than style insertion, its restrictions get in the way, and readers will wonder why it is there.",
      correction: "Use useEffect by default, and useLayoutEffect for measuring before paint.",
    },
    {
      id: "setting-state",
      heading: "Trying to set state inside it",
      problem: "Calling a setter inside this Hook is not allowed, because it runs at a stage where updates cannot be scheduled safely. Code written with other Effects in mind will fail if moved here.",
      correction: "Keep it to inserting styles, and use a different Effect for anything that updates state.",
    },
    {
      id: "reading-refs",
      heading: "Reading refs inside it",
      problem: "Refs are not attached when this Hook runs, so a ref’s current has not been set. Measuring or touching a node from here fails, even though it would work in a layout Effect.",
      correction: "Measure in useLayoutEffect instead, after the styles are in place.",
    },
    {
      id: "layout-effect-for-styles",
      heading: "Injecting styles in useLayoutEffect",
      problem: "Effects in one component can run before styles from another have been inserted, so a measurement is taken against old styles. The resulting errors in layout are intermittent and hard to trace.",
      correction: "If you are building such a library, insert styles in useInsertionEffect so that they exist first.",
    },
  ],
  interview: [
    {
      id: "uie-purpose",
      question: "What is useInsertionEffect for?",
      answer: "It lets CSS-in-JS libraries insert style tags before any layout Effects run, so later measurements see the right styles. It is a specialized Hook, and application code should use useEffect or useLayoutEffect instead.",
    },
    {
      id: "uie-order",
      question: "How does its timing compare with the other Effect Hooks?",
      answer: "It runs before layout Effects, which run before paint, and useEffect generally follows paint. It also runs cleanup and setup for each component in turn, whereas other Effects do all cleanups and then all setups.",
    },
    {
      id: "uie-restrict",
      question: "What can you not do inside useInsertionEffect?",
      answer: "You cannot update state, refs are not attached yet, and you should not assume whether the DOM has been updated. It also does not run on the server. All of that suits its single purpose of inserting styles.",
    },
    {
      id: "uie-why-not-render",
      question: "Why not inject style tags during rendering?",
      answer: "Beyond breaking purity, it is very slow during non-blocking updates, because the browser recalculates styles on every frame while React is rendering the tree. Inserting at a defined point after rendering avoids that.",
    },
    {
      id: "uie-ssr",
      question: "How can a CSS-in-JS library handle server rendering if this Hook only runs on the client?",
      answer: "It can collect the rules used during server rendering, for example in a set guarded by a check that window is undefined, and then include them in the HTML. The Hook takes care of insertion on the client.",
    },
  ],
  takeaways: [
    "This Hook is for CSS-in-JS library authors.",
    "It runs before layout Effects, so styles are ready for measuring.",
    "It cannot set state or read refs.",
    "Application code should use the other Effect Hooks.",
  ],
  quickReview: {
    definition: "useInsertionEffect lets CSS-in-JS libraries insert styles before any layout Effects run.",
    keyPoints: [
      "It is intended for library authors.",
      "No state updates, and refs are not attached.",
      "Cleanup and setup interleave per component.",
      "It is client-only.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "The library pattern",
      language: "tsx",
      code: `useInsertionEffect(() => {
  document.head.appendChild(createStyle(rule));
});`,
      typecheckContext: { before: `import { useInsertionEffect } from "react";\ndeclare const rule: string;\ndeclare const createStyle: (rule: string) => HTMLStyleElement;\nexport function useExample() {`, after: "}" },
      description: "Style insertion only. A real library also avoids inserting duplicates.",
    },
    commonMistakes: [
      "Using it in ordinary application code.",
      "Setting state inside it.",
      "Trying to read a ref from it.",
    ],
    interviewTrap: "“Should you use it to run code earlier than useLayoutEffect?” No. It exists for style insertion, and its restrictions make it unsuitable for general work.",
    takeaway: "Know why it exists, and leave it to libraries.",
  },
  sources: [
    { label: "useInsertionEffect reference", href: "https://react.dev/reference/react/useInsertionEffect" },
    { label: "useLayoutEffect reference", href: "https://react.dev/reference/react/useLayoutEffect" },
  ],
};
