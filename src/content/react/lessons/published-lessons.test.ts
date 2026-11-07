import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Metadata } from "next";

import type { LessonArticle } from "@/content/react/article-types";
import { reactCurriculumGroups } from "@/lib/learning/react-curriculum";
import { reactTopics } from "@/lib/learning/react-topics";
import { lessonExamples, loadLessons } from "./lesson-corpus";

const lessons = await loadLessons();
const escape = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);
const published = reactTopics.flatMap((topic) => (topic.status === "available" && lessons.has(topic.id) ? [topic] : []));

async function render(topic: (typeof published)[number]) {
  const page = (await import(/* @vite-ignore */ path.resolve(`src/app${topic.href}/page.tsx`))) as { default: ComponentType; metadata: Metadata };
  const lesson = lessons.get(topic.id) as LessonArticle;
  const html = renderToStaticMarkup(createElement(page.default));
  const start = (mode: string) => html.search(new RegExp(`<div\\b[^>]*id="[^"]+-${mode}-panel"`));
  return { page, lesson, html, learn: html.slice(start("learn"), start("review")), review: html.slice(start("review"), start("interview")), interview: html.slice(start("interview"), html.indexOf("<footer")) };
}

describe.each(published.map((topic) => ({ id: topic.id, topic })))("published lesson route $id", ({ topic }) => {
  it("renders correct metadata, heading, and breadcrumbs", async () => {
    const { page, html } = await render(topic);
    expect(page.metadata.title).toBe(`${topic.title} | Explain Dev`);
    expect(page.metadata.description).toBe(topic.summary);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(`>${escape(topic.title)}</h1>`);
    expect(html).toContain(escape(`React · ${reactCurriculumGroups.find((group) => group.id === topic.groupId)?.title}`));
    const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    expect([...breadcrumb.matchAll(/href="([^"]+)"/g)].map((match) => match[1])).toEqual(["/", "/frontend", "/frontend/react"]);
    expect(breadcrumb).toContain(`aria-current="page" class="text-foreground">${escape(topic.title)}</span>`);
  });

  it("links every table-of-contents entry to a real section, with no duplicate DOM IDs", async () => {
    const { lesson, html } = await render(topic);
    const toc = html.match(/<nav\b[^>]*aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const expected = [...lesson.sections.map((section) => section.id), "common-mistakes", "interview-questions", "key-takeaways"];
    expect([...toc.matchAll(/href="#([^"]+)"/g)].map((match) => match[1])).toEqual(expected);
    expect([...html.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map((match) => match[1])).toEqual(expected);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("starts in Learn with the full lesson visible and the other modes hidden", async () => {
    const { lesson, learn, review, interview } = await render(topic);
    expect(learn).not.toMatch(/^<div\b[^>]*\bhidden=""/);
    expect(review).toMatch(/^<div\b[^>]*\bhidden=""/);
    expect(interview).toMatch(/^<div\b[^>]*\bhidden=""/);
    const visible = learn.replace(/<details\b[\s\S]*?<\/details>/g, "");
    for (const section of lesson.sections) {
      for (const text of [section.heading, ...section.paragraphs, ...(section.list ?? []), ...(section.closing ? [section.closing] : [])]) expect(visible).toContain(escape(text));
      for (const column of section.comparison ?? []) for (const text of [column.title, ...column.items]) expect(visible).toContain(escape(text));
    }
    for (const mistake of lesson.mistakes) for (const text of [mistake.heading, mistake.problem, mistake.correction]) expect(visible).toContain(escape(text));
    for (const takeaway of lesson.takeaways) expect(visible).toContain(escape(takeaway));
    expect(learn.match(/<details\b/g)).toHaveLength(lesson.interview.length);
  });

  it("renders every code block once in Learn as escaped text, with no live controls", async () => {
    const { lesson, learn } = await render(topic);
    const examples = lessonExamples(lesson);
    expect(learn.match(/<pre\b/g)).toHaveLength(examples.length);
    for (const example of examples) expect(learn).toContain(`<code>${escape(example.code).replaceAll('"', "&quot;").replaceAll("'", "&#x27;")}</code>`);
    expect(learn).not.toMatch(/<button\b|<input\b/);
  });

  it("presents the authored Quick Review and hidden Interview answers", async () => {
    const { lesson, review, interview } = await render(topic);
    const quick = lesson.quickReview;
    for (const text of [quick.definition, ...quick.keyPoints, ...quick.commonMistakes, quick.interviewTrap, quick.takeaway]) expect(review).toContain(escape(text));
    expect(review.match(/<pre\b/g)).toHaveLength(1);
    expect(interview.match(/aria-expanded="false"/g)).toHaveLength(lesson.interview.length);
    expect(interview).not.toContain('aria-expanded="true"');
    const answerIds = [...interview.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(answerIds).size).toBe(lesson.interview.length);
    for (const id of answerIds) expect(interview).toContain(`id="${id}" hidden=""`);
    for (const question of lesson.interview) expect(interview).toContain(escape(question.answer));
  });
});

describe("published lesson routes", () => {
  it("exercises every published lesson file", () => {
    for (const topic of published) expect(lessons.has(topic.id)).toBe(true);
  });
});
