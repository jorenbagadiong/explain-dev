import { describe, expect, it } from "vitest";

import { introductionToReactArticle as article } from "./introduction-to-react";
import { typecheckExamples } from "./test-utils";

const sections = [article.overview, article.whyReact, article.declarativeUi, article.components, article.props, article.jsx, article.rendering, article.reactVsJavaScript, article.whenToUse, article.mistakes, article.interview, article.takeaways];
const lessonExamples = [
  article.declarativeUi.imperativeExample, article.declarativeUi.declarativeExample,
  article.components.basicExample, article.components.compositionExample,
  article.props.typedPropsExample, article.props.callbackExample,
  article.jsx.example, article.rendering.interactiveExample,
];
const codeExamples = [...lessonExamples, ...article.mistakes.items.flatMap((mistake) => mistake.examples ?? [])];
const example = (id: string) => codeExamples.find((item) => item.id === id)?.code ?? "";
const prose = JSON.stringify(article, (key, value) => (key === "code" ? undefined : value));

describe("Introduction to React educational content", () => {
  it("provides every required section with stable unique IDs and headings", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "what-is-react", "why-use-react", "declarative-vs-imperative", "understanding-components", "props-and-data-flow", "jsx-fundamentals",
      "react-rendering", "react-vs-javascript", "when-to-use-react", "common-mistakes", "interview-questions", "key-takeaways",
    ]);
    expect(new Set(sections.map((section) => section.id)).size).toBe(sections.length);
    expect(sections.every((section) => section.heading.trim())).toBe(true);
  });

  it("keeps article content separate from topic metadata", () => {
    for (const key of ["id", "summary", "href", "status", "categoryId", "technologyId"]) expect(article).not.toHaveProperty(key);
  });

  it("gives each comparison titled columns with content", () => {
    for (const comparison of [article.whyReact, article.declarativeUi, article.props, article.reactVsJavaScript, article.whenToUse].map((section) => section.comparison)) {
      expect(comparison).toHaveLength(2);
      expect(comparison.every((column) => column.title.trim() && column.items.length > 0 && column.items.every((item) => item.trim()))).toBe(true);
    }
  });

  it("uses unique code IDs and complete metadata for every example", () => {
    const ids = [...codeExamples, article.quickReview.codeReminder].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(codeExamples.every((item) => item.title.trim() && item.code.trim() && item.description.trim())).toBe(true);
    expect(codeExamples.filter((item) => item.language === "tsx" && /export default function/.test(item.code)).length).toBeGreaterThanOrEqual(3);
  });

  it("strictly type-checks every displayed example, including mistake corrections and the review reminder", () => {
    expect(typecheckExamples([...codeExamples, article.quickReview.codeReminder])).toEqual([]);
  });

  it("demonstrates what each of the three named examples promises", () => {
    expect(article.components.basicExample.title).toMatch(/^Example 1/);
    expect(example("basic-component")).toMatch(/export default function [A-Z][\s\S]*<section>/);
    expect(article.props.typedPropsExample.title).toMatch(/^Example 2/);
    expect(example("typed-props")).toMatch(/interface ProfileCardProps[\s\S]*: ProfileCardProps\)[\s\S]*<ProfileCard name=/);
    expect(article.rendering.interactiveExample.title).toMatch(/^Example 3/);
    expect(example("interactive-component")).toMatch(/useState\(0\)[\s\S]*previous => previous \+ 1[\s\S]*<button type="button" onClick=/);
    const jsx = example("jsx-basics");
    for (const feature of ["{title}", "className=", "<NewBadge />", "<>", "&&", "?"]) expect(jsx).toContain(feature);
  });

  it("backs the lowercase-component claim: TypeScript rejects the tag the correction warns against", () => {
    const code = "function profileCard() {\n  return <p>Maria</p>;\n}\nexport default function App() {\n  return <profileCard />;\n}";
    expect(typecheckExamples([{ id: "lowercase-check", title: "", description: "", language: "tsx", code }]).join(" ")).toContain("profileCard");
  });

  it("explains the seven required mistakes with corrections", () => {
    expect(article.mistakes.items.map((mistake) => mistake.id)).toEqual([
      "react-as-language", "replacing-javascript", "props-versus-state", "mutating-props", "lowercase-components", "render-replaces-dom", "always-best",
    ]);
    expect(article.mistakes.items.every((mistake) => mistake.problem.trim() && mistake.correction.trim())).toBe(true);
    expect(new Set(article.mistakes.items.map((mistake) => mistake.problem)).size).toBe(article.mistakes.items.length);
  });

  it("includes the ten required interview questions with substantive unique answers", () => {
    const questions = article.interview.questions;
    expect(questions.map((question) => question.question)).toEqual(expect.arrayContaining([
      "What is React?", "Why would you use React?", "What is declarative UI?", "What is a React component?", "What is JSX?", "What are props?",
      "What is the difference between props and state?", "What causes a React component to render?",
      "What is the difference between rendering and DOM updates?", "Is React a framework or a library?",
    ]));
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(questions.every((question) => question.answer.length > 80)).toBe(true);
  });

  it("provides a component tree and a caveated update flow", () => {
    const { root } = article.compositionVisual;
    expect(root.title).toBe("App");
    expect(root.children?.map((child) => child.title)).toEqual(["Header", "MainContent", "Footer"]);
    expect(article.visual.heading).toBe("React update flow");
    expect(article.visual.note).toContain("simplified conceptual model");
  });

  it("avoids the overstated claims this article exists to correct", () => {
    expect(prose).not.toMatch(/full-stack framework|always (?:faster|performs better)|TypeScript is required|never uses imperative/i);
    expect(article.overview.paragraphs.join(" ")).toContain("does not require it");
    expect(article.declarativeUi.imperativeExample.description).toContain("not a feature-equivalent");
    expect(article.rendering.conclusion).toContain("not a performance guarantee");
  });

  it("finishes with seven takeaways and official React references", () => {
    expect(article.takeaways.items).toHaveLength(7);
    expect(article.sources.map((source) => new URL(source.href).pathname)).toEqual([
      "/learn", "/learn/describing-the-ui", "/learn/your-first-component", "/learn/passing-props-to-a-component",
      "/learn/writing-markup-with-jsx", "/learn/render-and-commit", "/learn/state-as-a-snapshot", "/reference/react",
    ]);
    expect(article.sources.every((source) => new URL(source.href).hostname === "react.dev")).toBe(true);
  });
});
