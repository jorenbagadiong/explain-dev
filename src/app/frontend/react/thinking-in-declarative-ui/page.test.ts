import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { thinkingInDeclarativeUiArticle as article } from "@/content/react/thinking-in-declarative-ui";
import { reactTopics } from "@/lib/learning/react-topics";
import ThinkingInDeclarativeUiPage, { metadata } from "./page";

const html = renderToStaticMarkup(createElement(ThinkingInDeclarativeUiPage));
const panelStart = (mode: string) => html.search(new RegExp(`<div\\b[^>]*id="[^"]+-${mode}-panel"`));
const learnHtml = html.slice(panelStart("learn"), panelStart("review"));
const reviewHtml = html.slice(panelStart("review"), panelStart("interview"));
const interviewHtml = html.slice(panelStart("interview"), html.indexOf("<footer"));
const sections = [article.overview, article.imperativeVsDeclarative, article.uiAsFunction, article.uiStates, article.stateDriven, article.conditional, article.composition, article.avoidingDom, article.imperativeCode, article.mistakes, article.interview, article.takeaways];
const codeExamples = [
  article.imperativeVsDeclarative.imperativeExample, article.uiAsFunction.example, article.uiStates.example,
  article.conditional.patternsExample, article.conditional.formExample, article.composition.example, article.imperativeCode.example,
  ...article.mistakes.items.flatMap((mistake) => mistake.examples ?? []),
];
const escaped = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);

describe("published Thinking in Declarative UI article", () => {
  it("renders one primary heading within a semantic article", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1\b[^>]*id="article-heading"[^>]*>Thinking in Declarative UI<\/h1>/);
    expect(html).toMatch(/<article\b[^>]*aria-labelledby="article-heading"/);
  });

  it("renders valid section anchors from the content module", () => {
    const toc = html.match(/<nav\b[^>]*aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const anchors = [...toc.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    const sectionIds = [...html.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map((match) => match[1]);
    expect(anchors).toEqual(sections.map((section) => section.id));
    expect(sectionIds).toEqual(anchors);
  });

  it("renders Home, Frontend, and React breadcrumbs followed by the non-linked current topic", () => {
    const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    expect([...breadcrumb.matchAll(/href="([^"]+)"/g)].map((match) => match[1])).toEqual(["/", "/frontend", "/frontend/react"]);
    expect(breadcrumb).toMatch(/<span\b[^>]*aria-current="page"[^>]*>Thinking in declarative UI<\/span>/);
  });

  it("starts in Learn, with the other two modes hidden from keyboard and assistive technology", () => {
    expect(html.match(/<button\b[^>]*aria-pressed="(?:true|false)"/g)).toHaveLength(3);
    expect(html).toMatch(/<button\b[^>]*aria-pressed="true"[^>]*>Learn<\/button>/);
    expect(learnHtml).not.toMatch(/^<div\b[^>]*\bhidden=""/);
    expect(reviewHtml).toMatch(/^<div\b[^>]*\bhidden=""/);
    expect(interviewHtml).toMatch(/^<div\b[^>]*\bhidden=""/);
  });

  it("preserves code as escaped preformatted text without creating live controls", () => {
    const blocks = [...learnHtml.matchAll(/<pre\b[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)].map((match) => match[1]);
    expect(blocks).toHaveLength(codeExamples.length);
    codeExamples.forEach((example, index) => {
      expect(blocks[index]).toBe(example.code.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;"));
    });
    expect(learnHtml).not.toMatch(/<button\b|<input\b/);
  });

  it("displays the full lesson in Learn without hiding essential material behind disclosures", () => {
    const visible = learnHtml.replace(/<details\b[\s\S]*?<\/details>/g, "");
    const preserved = [
      ...sections.flatMap((section) => section.paragraphs),
      ...codeExamples.map((example) => example.description),
      ...[article.imperativeVsDeclarative, article.avoidingDom].flatMap((section) => section.comparison.flatMap((column) => [column.title, ...column.items])),
      ...article.imperativeCode.useCases,
      ...article.mistakes.items.flatMap((mistake) => [mistake.heading, mistake.problem, mistake.correction]),
      ...article.takeaways.items,
      article.imperativeVsDeclarative.conclusion,
    ];
    for (const text of preserved) expect(visible).toContain(escaped(text));
    expect(learnHtml.match(/<details\b/g)).toHaveLength(article.interview.questions.length);
  });

  it("renders both flows as ordered steps and the state diagram as a branching list", () => {
    for (const visual of [article.imperativeVisual, article.visual]) {
      const figure = learnHtml.slice(learnHtml.indexOf(`>${visual.heading}<`), learnHtml.indexOf(visual.note));
      expect(figure).toContain("<ol");
      expect([...figure.matchAll(/<h3\b[^>]*>([^<]+)<\/h3>/g)].map((match) => match[1])).toEqual(visual.steps.map((step) => step.title));
    }
    const tree = learnHtml.slice(learnHtml.indexOf(`>${article.statesVisual.heading}<`), learnHtml.indexOf(article.statesVisual.note));
    expect(tree).not.toContain("<ol");
    expect(tree).toMatch(/>Idle<\/p>[\s\S]*<ul\b[^>]*><li\b[^>]*><p\b[^>]*>Loading<\/p>[\s\S]*<ul\b[^>]*><li\b[^>]*><p\b[^>]*>Success<\/p>[\s\S]*<\/li><li\b[^>]*><p\b[^>]*>Error<\/p>/);
    expect(learnHtml).toContain(escaped(article.statesVisual.note));
  });

  it("renders no Back to Top button in server output, so hidden state is never exposed", () => {
    expect(html).not.toContain("Back to top");
  });

  it("displays the authored recap in Quick Review", () => {
    const review = article.quickReview;
    for (const text of [review.definition, ...review.keyPoints, ...review.commonMistakes, review.interviewTrap, review.takeaway]) expect(reviewHtml).toContain(escaped(text));
    expect(reviewHtml.match(/<pre\b/g)).toHaveLength(1);
    expect(article.overview.paragraphs).not.toContain(review.definition);
  });

  it("displays every interview question in Interview with each answer initially hidden", () => {
    const { questions } = article.interview;
    expect(interviewHtml.match(/<h3\b/g)).toHaveLength(questions.length);
    expect(interviewHtml.match(/aria-expanded="false"/g)).toHaveLength(questions.length);
    expect(interviewHtml).not.toContain('aria-expanded="true"');
    for (const { question, answer } of questions) {
      expect(interviewHtml).toContain(escaped(question));
      expect(interviewHtml).toContain(escaped(answer));
      expect(interviewHtml).toContain(`aria-label="Reveal answer: ${question}"`);
    }
    const answerIds = [...interviewHtml.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(answerIds).size).toBe(questions.length);
    for (const id of answerIds) expect(interviewHtml).toContain(`id="${id}" hidden=""`);
  });

  it("has no duplicate DOM IDs across the three modes", () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("takes the summary from the topic registry for page metadata", () => {
    expect(metadata.title).toBe("Thinking in Declarative UI | Explain Dev");
    expect(metadata.description).toBe(reactTopics.find((topic) => topic.id === "declarative-ui")?.summary);
  });

  it("keeps the article route and static presentation as Server Components", () => {
    for (const fileName of ["src/app/frontend/react/thinking-in-declarative-ui/page.tsx", "src/components/learning/concept-visual.tsx", "src/components/learning/article-layout.tsx", "src/content/react/thinking-in-declarative-ui.ts"]) {
      const file = path.resolve(fileName);
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      expect(source.statements.some((statement) => ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) && statement.expression.text === "use client")).toBe(false);
    }
  });
});
