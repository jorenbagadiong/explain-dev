import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { typecheckExamples } from "./test-utils";
import { thinkingInDeclarativeUiArticle as article } from "./thinking-in-declarative-ui";

const sections = [article.overview, article.imperativeVsDeclarative, article.uiAsFunction, article.uiStates, article.stateDriven, article.conditional, article.composition, article.avoidingDom, article.imperativeCode, article.mistakes, article.interview, article.takeaways];
const lessonExamples = [
  article.imperativeVsDeclarative.imperativeExample, article.uiAsFunction.example, article.uiStates.example,
  article.conditional.patternsExample, article.conditional.formExample, article.composition.example, article.imperativeCode.example,
];
const codeExamples = [...lessonExamples, ...article.mistakes.items.flatMap((mistake) => mistake.examples ?? [])];
const code = (id: string) => codeExamples.find((example) => example.id === id)?.code ?? "";
const prose = JSON.stringify(article, (key, value) => (key === "code" ? undefined : value));

describe("Thinking in Declarative UI educational content", () => {
  it("provides every required section with stable unique IDs and headings", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "what-is-declarative-ui", "imperative-vs-declarative", "ui-as-a-function-of-state", "thinking-in-ui-states", "state-driven-rendering", "conditional-rendering",
      "declarative-composition", "avoiding-unnecessary-dom-manipulation", "when-imperative-code-is-appropriate", "common-mistakes", "interview-questions", "key-takeaways",
    ]);
    expect(new Set(sections.map((section) => section.id)).size).toBe(sections.length);
    expect(sections.every((section) => section.heading.trim())).toBe(true);
  });

  it("keeps article content separate from topic metadata", () => {
    for (const key of ["id", "summary", "href", "status", "categoryId", "technologyId"]) expect(article).not.toHaveProperty(key);
  });

  it("names exactly four complete TSX examples", () => {
    const named = codeExamples.filter((example) => /^Example \d:/.test(example.title));
    expect(named.map((example) => example.id)).toEqual(["declarative-counter", "request-states", "form-feedback", "task-composition"]);
    for (const example of named) {
      expect(example.language).toBe("tsx");
      expect(example.code).toContain("export default function");
    }
  });

  it("uses unique code IDs and complete metadata for every code block", () => {
    const ids = [...codeExamples, article.quickReview.codeReminder].map((example) => example.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(codeExamples.every((example) => example.title.trim() && example.code.trim() && example.description.trim())).toBe(true);
  });

  it("strictly type-checks every displayed code block, including corrections and the review reminder", () => {
    expect(typecheckExamples([...codeExamples, article.quickReview.codeReminder])).toEqual([]);
  });

  it("labels the imperative snippet as a comparison rather than a React component", () => {
    const { imperativeExample } = article.imperativeVsDeclarative;
    expect(imperativeExample.language).toBe("typescript");
    expect(imperativeExample.title).toContain("not a React component");
  });

  it("demonstrates what each named example promises", () => {
    expect(code("declarative-counter")).toMatch(/useState\(0\)[\s\S]*previous => previous \+ 1[\s\S]*disabled=\{itemCount === 0\}/);
    expect(code("request-states")).toMatch(/\| \{ status: "success"; message: string \}[\s\S]*switch \(state\.status\)/);
    expect(code("request-states")).not.toMatch(/fetch\(|isError|hasError/);
    expect(code("form-feedback")).toMatch(/htmlFor=\{inputId\}[\s\S]*value=\{email\}[\s\S]*onChange=[\s\S]*\{hasError \?/);
    expect(code("task-composition")).toMatch(/\{ task \}: \{ task: Task \}[\s\S]*<TaskRow key=[\s\S]*<TaskList tasks=/);
  });

  it("backs the exhaustiveness claim: an unhandled status does not compile", () => {
    const incomplete = code("request-states").replace(/    case "error":\n.*\n/, "");
    expect(incomplete).not.toEqual(code("request-states"));
    expect(typecheckExamples([{ id: "exhaustive-check", title: "", description: "", language: "tsx", code: incomplete }]).length).toBeGreaterThan(0);
  });

  it("backs the logical AND pitfall: a zero count renders the number, and the comparison does not", () => {
    const count: number = 0;
    expect(renderToStaticMarkup(createElement("p", null, count && "New"))).toBe("<p>0</p>");
    expect(renderToStaticMarkup(createElement("p", null, count > 0 && "New"))).toBe("<p></p>");
    expect(article.conditional.paragraphs.join(" ")).toContain("count > 0");
  });

  it("explains the seven required mistakes with corrections", () => {
    expect(article.mistakes.items.map((mistake) => mistake.id)).toEqual([
      "modifying-react-dom", "mutating-state", "render-equals-dom-update", "redundant-state", "effects-for-calculations", "contradictory-booleans", "never-imperative",
    ]);
    expect(article.mistakes.items.every((mistake) => mistake.problem.trim() && mistake.correction.trim())).toBe(true);
    expect(new Set(article.mistakes.items.map((mistake) => mistake.problem)).size).toBe(article.mistakes.items.length);
  });

  it("includes at least ten unique interview questions with substantive answers", () => {
    const { questions } = article.interview;
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.question)).size).toBe(questions.length);
    expect(questions.every((question) => question.answer.length > 80)).toBe(true);
  });

  it("provides both flows and shows Success and Error as alternatives rather than a sequence", () => {
    expect(article.imperativeVisual.steps.map((step) => step.title)).toEqual(["Event", "Find element", "Change DOM"]);
    expect(article.visual.steps.map((step) => step.title)).toEqual(["Event", "Update state", "Render UI", "Commit necessary DOM changes"]);
    for (const visual of [article.imperativeVisual, article.visual]) expect(visual.note).toContain("simplified conceptual flow");
    const { root } = article.statesVisual;
    expect(root.title).toBe("Idle");
    expect(root.children?.map((node) => node.title)).toEqual(["Loading"]);
    expect(root.children?.[0].children?.map((node) => node.title)).toEqual(["Success", "Error"]);
    expect(article.statesVisual.note).toContain("alternative outcomes");
  });

  it("avoids the overstatements this article exists to correct", () => {
    expect(prose).not.toMatch(/automatically handles everything|cannot support declarative|never (?:touch|use) the DOM/i);
    expect(article.overview.paragraphs.join(" ")).toContain("does not remove imperative code");
    expect(article.uiAsFunction.paragraphs.join(" ")).toContain("not a React API");
    expect(article.avoidingDom.paragraphs.join(" ")).toContain("not a rule against all DOM access");
  });

  it("finishes with takeaways and official React references", () => {
    expect(article.takeaways.items.length).toBeGreaterThanOrEqual(5);
    expect(article.sources).toHaveLength(9);
    expect(article.sources.every((source) => new URL(source.href).hostname === "react.dev")).toBe(true);
  });
});
