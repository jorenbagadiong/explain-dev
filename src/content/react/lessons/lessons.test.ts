import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { typecheckCorpus } from "@/content/react/test-utils";
import { lessonExamples, loadLessons } from "./lesson-corpus";

const lessons = await loadLessons();
const table = [...lessons.entries()].map(([id, lesson]) => ({ id, lesson }));
const RESERVED_IDS = ["common-mistakes", "interview-questions", "key-takeaways"];
// Markers are case-sensitive, so ordinary names such as a `todo` variable stay valid.
const PLACEHOLDER = /\b(?:TODO|FIXME|TBD|XXX)\b|\b(?:lorem ipsum|placeholder text|coming soon)\b/;
// Statements the curriculum must never make. Misconceptions may be named in a
// mistake's problem, so this scans answers, takeaways, and reviews only.
const FORBIDDEN = [
  /every (?:react )?render (?:changes|updates|mutates) the DOM/i,
  /virtual DOM guarantees/i,
  /useEffect\(\[\]\) (?:always )?runs? exactly once/i,
  /memo(?:ization)? guarantees/i,
  /context (?:automatically )?solves all/i,
  /suspense automatically handles/i,
  /server components are (?:the same as|just) (?:server-side rendering|SSR)/i,
  /"use client" means .* never server-rendered/i,
  /react router is built into react/i,
  /react requires typescript/i,
  /react is a (?:complete )?full-stack framework/i,
  /always (?:faster|performs better) than vanilla/i,
];

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.entries(value).filter(([key]) => key !== "code" && key !== "typecheckContext").flatMap(([, item]) => strings(item));
  return [];
}

describe.each(table)("lesson $id", ({ lesson }) => {
  const examples = lessonExamples(lesson);

  it("has complete content in every required part", () => {
    expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
    expect(lesson.mistakes.length).toBeGreaterThanOrEqual(3);
    expect(lesson.interview.length).toBeGreaterThanOrEqual(5);
    expect(lesson.takeaways.length).toBeGreaterThanOrEqual(3);
    expect(examples.length).toBeGreaterThanOrEqual(1);
    expect(lesson.sources.length).toBeGreaterThanOrEqual(1);
    for (const section of lesson.sections) {
      expect(section.heading.trim()).not.toBe("");
      expect(section.paragraphs.length).toBeGreaterThan(0);
      expect(section.paragraphs.every((paragraph) => paragraph.trim().length > 20)).toBe(true);
    }
  });

  it("uses unique kebab-case IDs that avoid the shared section anchors", () => {
    const sectionIds = lesson.sections.map((section) => section.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    for (const id of sectionIds) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(RESERVED_IDS).not.toContain(id);
    }
    for (const ids of [examples.map((example) => example.id), lesson.mistakes.map((mistake) => mistake.id), lesson.interview.map((question) => question.id)]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(examples.map((example) => example.id)).not.toContain(lesson.quickReview.codeReminder.id);
  });

  it("explains mistakes and answers meaningfully, without repeats inside the lesson", () => {
    for (const mistake of lesson.mistakes) {
      expect(mistake.heading.trim()).not.toBe("");
      expect(mistake.problem.length).toBeGreaterThan(50);
      expect(mistake.correction.length).toBeGreaterThan(25);
    }
    expect(new Set(lesson.interview.map((question) => question.question)).size).toBe(lesson.interview.length);
    expect(new Set(lesson.interview.map((question) => question.answer)).size).toBe(lesson.interview.length);
    expect(lesson.interview.every((question) => question.question.endsWith("?") && question.answer.length > 60)).toBe(true);
  });

  it("authors a Quick Review rather than truncating Learn", () => {
    const review = lesson.quickReview;
    expect(review.keyPoints.length).toBeGreaterThanOrEqual(3);
    expect(review.keyPoints.length).toBeLessThanOrEqual(6);
    expect(new Set(review.keyPoints).size).toBe(review.keyPoints.length);
    expect(review.commonMistakes.length).toBeGreaterThanOrEqual(2);
    expect(review.commonMistakes.length).toBeLessThanOrEqual(3);
    for (const text of [review.definition, review.interviewTrap, review.takeaway, review.codeReminder.description]) expect(text.trim().length).toBeGreaterThan(20);
    const learn = lesson.sections.flatMap((section) => section.paragraphs);
    expect(learn).not.toContain(review.definition);
    expect(learn).not.toContain(review.takeaway);
  });

  it("classifies and explains every code block", () => {
    for (const example of [...examples, lesson.quickReview.codeReminder]) {
      expect(example.title.trim()).not.toBe("");
      expect(example.code.trim()).not.toBe("");
      expect(example.description.trim().length).toBeGreaterThan(15);
      expect(example.code).not.toMatch(PLACEHOLDER);
      // Deprecated in the installed React types; lessons teach current APIs.
      expect(example.code).not.toMatch(/\bFormEvent\b/);
      if (["complete", "client", "server", "framework"].includes(example.classification)) {
        expect(example.typecheckContext).toBeUndefined();
        expect(["tsx", "typescript"]).toContain(example.language);
      }
      if (example.classification === "server") expect(example.code).toMatch(/async function|"use server"/);
      if (example.classification === "external") expect(example.description).toMatch(/not installed|external package|separate package/i);
    }
  });

  it("contains no placeholders or known misconceptions", () => {
    for (const text of strings(lesson)) expect(text).not.toMatch(PLACEHOLDER);
    const assertions = strings([lesson.interview.map((question) => question.answer), lesson.takeaways, lesson.quickReview]);
    for (const text of assertions) for (const claim of FORBIDDEN) expect(text).not.toMatch(claim);
  });

  it("cites only sources actually consulted for this curriculum", () => {
    const verified = JSON.parse(readFileSync("docs/ed-013/verified-references.json", "utf8")) as Record<string, string>;
    for (const source of lesson.sources) {
      expect(source.label.trim()).not.toBe("");
      expect(Object.keys(verified)).toContain(source.href);
    }
  });
});

describe("lesson corpus", () => {
  it("does not reuse generic answers or mistakes across lessons", () => {
    const answers = table.flatMap(({ lesson }) => lesson.interview.map((question) => question.answer));
    expect(new Set(answers).size).toBe(answers.length);
    const problems = table.flatMap(({ lesson }) => lesson.mistakes.map((mistake) => mistake.problem));
    expect(new Set(problems).size).toBe(problems.length);
  });

  it("strictly type-checks every block that claims to compile", { timeout: 180_000 }, () => {
    const files = new Map<string, string>();
    for (const { id, lesson } of table) {
      for (const example of [...lessonExamples(lesson), lesson.quickReview.codeReminder]) {
        if (example.classification === "external" || example.classification === "pseudocode") continue;
        if (example.language !== "tsx" && example.language !== "typescript") continue;
        const { before = "", after = "" } = example.typecheckContext ?? {};
        files.set(`${id}__${example.id}`, `${before}\n${example.code}\n${after}`);
      }
    }
    // Modules that lazy() examples import. They exist only for the type checker.
    const lazyExampleModules = ["markdown-preview", "report-tab", "chart"].map((name) => `declare module "*/${name}" {\n  const component: import("react").ComponentType;\n  export default component;\n}`).join("\n");
    expect(typecheckCorpus(files, lazyExampleModules)).toEqual([]);
  });
});
