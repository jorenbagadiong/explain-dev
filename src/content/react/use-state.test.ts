import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { useStateArticle as article } from "./use-state";

const sections = [article.overview, article.usage, article.updates, article.examples, article.mistakes, article.interview, article.takeaways];
const codeExamples = [article.overview.syntax, ...article.updates.comparison, ...article.examples.items];

describe("useState article content", () => {
  it("defines the required educational sections with unique anchors and headings", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "what-is-use-state", "when-to-use-state", "how-updates-work", "practical-examples",
      "common-mistakes", "interview-questions", "key-takeaways",
    ]);
    expect(new Set(sections.map((section) => section.id)).size).toBe(sections.length);
    expect(sections.every((section) => section.heading.trim().length > 0)).toBe(true);
  });

  it("keeps article content separate from registry metadata", () => {
    for (const key of ["id", "summary", "href", "status", "categoryId", "technologyId"]) {
      expect(article).not.toHaveProperty(key);
    }
  });

  it("includes three complete examples and uniquely identified code blocks", () => {
    expect(article.examples.items.length).toBeGreaterThanOrEqual(3);
    expect(new Set(codeExamples.map((example) => example.id)).size).toBe(codeExamples.length);
    for (const example of article.examples.items) {
      expect(example.language).toBe("tsx");
      expect(example.code).toContain('from "react"');
      expect(example.code).toContain("export function");
      expect(example.code).toContain("useState");
      expect(example.title.trim()).not.toBe("");
      expect(example.description.trim()).not.toBe("");
    }
  });

  it("strictly type-checks every complete TSX example with the installed React types", () => {
    // Virtual files avoid creating runnable example routes or writing snippets to disk.
    const files = new Map(article.examples.items.map((example) => [
      path.resolve("src/content/react/__snippet_checks__", `${example.id}.tsx`), example.code,
    ]));
    const options: ts.CompilerOptions = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      types: ["react"],
    };
    const host = ts.createCompilerHost(options);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
      const code = files.get(path.resolve(fileName));
      return code !== undefined
        ? ts.createSourceFile(fileName, code, languageVersion, true, ts.ScriptKind.TSX)
        : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    };
    const program = ts.createProgram([...files.keys()], options, host);
    const errors = ts.getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    expect(errors).toEqual([]);
  });

  it("provides explanations and corrections for the five required mistakes", () => {
    expect(article.mistakes.items.length).toBeGreaterThanOrEqual(5);
    expect(article.mistakes.items.map((mistake) => mistake.id)).toEqual([
      "mutating-state", "expecting-immediate-change", "stale-dependent-updates", "redundant-state", "conditional-hooks",
    ]);
    expect(article.mistakes.items.every((mistake) => mistake.problem.trim() && mistake.correction.trim())).toBe(true);
  });

  it("provides at least six unique interview questions with non-empty answers", () => {
    const questions = article.interview.questions;
    expect(questions.length).toBeGreaterThanOrEqual(6);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(questions.every((question) => question.question.trim() && question.answer.trim())).toBe(true);
  });

  it("finishes with takeaways and authoritative references", () => {
    expect(article.takeaways.items.length).toBeGreaterThanOrEqual(5);
    expect(article.sources.every((source) => new URL(source.href).hostname === "react.dev")).toBe(true);
  });
});
