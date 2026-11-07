import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QuickReviewPanel, InterviewPanel } from "@/components/learning/article-panels";
import { introductionToReactArticle } from "./introduction-to-react";
import { useStateArticle } from "./use-state";
import { useEffectArticle } from "./use-effect";
import { typecheckExamples } from "./test-utils";

const articles = [useStateArticle, useEffectArticle, introductionToReactArticle];

describe("article learning content", () => {
  it.each(articles)("authors a complete concise review for $heading", (article) => {
    const review = article.quickReview;
    expect(review.definition.trim()).not.toBe("");
    expect(review.definition).not.toBe(article.overview.paragraphs[0]);
    expect(review.keyPoints.length).toBeGreaterThanOrEqual(4);
    expect(review.keyPoints.length).toBeLessThanOrEqual(6);
    expect(new Set(review.keyPoints).size).toBe(review.keyPoints.length);
    expect(review.commonMistakes.length).toBeGreaterThanOrEqual(2);
    expect(review.commonMistakes.length).toBeLessThanOrEqual(3);
    expect(review.interviewTrap.trim()).not.toBe("");
    expect(review.takeaway.trim()).not.toBe("");
    const html = renderToStaticMarkup(createElement(QuickReviewPanel, { review }));
    const escaped = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);
    for (const text of [review.definition, ...review.keyPoints, ...review.commonMistakes, review.interviewTrap, review.takeaway, review.codeReminder.code]) expect(html).toContain(escaped(text));
    expect(html.match(/<pre\b/g)).toHaveLength(1);
  });

  it("keeps the introduction review on its render-versus-commit trap and diagram caveat", () => {
    expect(introductionToReactArticle.quickReview.interviewTrap).toMatch(/entire DOM.*No\..*committing.*only the DOM changes needed/);
    expect(introductionToReactArticle.visual.note).toContain("not every render causes DOM mutations");
    expect(introductionToReactArticle.visual.steps.map((step) => step.id)).toEqual(["change", "render", "commit", "display"]);
  });

  it("keeps the two reviews specific to their topics and preserves important caveats", () => {
    expect(useStateArticle.quickReview.interviewTrap).toMatch(/same handler.*replacement 1.*result is 1.*functional.*2/);
    expect(useStateArticle.visual.context).toContain("alternative handlers");
    expect(useStateArticle.visual.steps.map((step) => step.id)).toEqual(useStateArticle.updates.comparison.map((example) => example.id));
    expect(useEffectArticle.quickReview.interviewTrap).toMatch(/not an exactly-once.*Strict Mode.*Production/);
    expect(useEffectArticle.quickReview.keyPoints.join(" ")).toContain("Object.is");
    expect(useEffectArticle.visual.steps.map((step) => step.id)).toEqual(["commit", "setup", "changed-input", "old-cleanup", "new-setup", "unmount-cleanup"]);
  });

  it.each(articles)("has unique visual steps with textual context and caveats for $heading", (article) => {
    const visual = article.visual;
    expect(visual.heading.trim()).not.toBe("");
    expect(visual.context.trim()).not.toBe("");
    expect(visual.note.trim()).not.toBe("");
    expect(new Set(visual.steps.map((step) => step.id)).size).toBe(visual.steps.length);
    expect(visual.steps.every((step) => step.title.trim() && step.description.trim())).toBe(true);
  });

  it.each(articles)("preserves all $heading interview questions with initially hidden independent answer controls", (article) => {
    const html = renderToStaticMarkup(createElement(InterviewPanel, { questions: article.interview.questions }));
    expect(html.match(/<h3\b/g)).toHaveLength(article.interview.questions.length);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(article.interview.questions.length);
    const answerIds = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(answerIds).size).toBe(article.interview.questions.length);
    for (const id of answerIds) expect(html).toContain(`id="${id}" hidden=""`);
    for (const question of article.interview.questions) {
      const escaped = renderToStaticMarkup(createElement("span", null, question.answer)).slice(6, -7);
      expect(html).toContain(escaped);
    }
  });

  it("type-checks both short reminders when placed inside their stated component context", () => {
    const state = useStateArticle.quickReview.codeReminder;
    const effect = useEffectArticle.quickReview.codeReminder;
    expect(typecheckExamples([
      { ...state, code: `import { useState } from "react";\nexport function Reminder() { const [, setCount] = useState(0); const increment = () => { ${state.code} }; return <button onClick={increment}>Increase</button>; }` },
      { ...effect, code: `import { useEffect } from "react";\nexport function Reminder({ onResize }: { onResize: () => void }) { ${effect.code} return null; }` },
    ])).toEqual([]);
  });
});
