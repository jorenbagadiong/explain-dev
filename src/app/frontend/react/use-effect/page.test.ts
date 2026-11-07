import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { useEffectArticle as article } from "@/content/react/use-effect";
import { reactTopics } from "@/lib/learning/react-topics";
import UseEffectPage, { metadata } from "./page";

const html = renderToStaticMarkup(createElement(UseEffectPage));
const sections = [article.overview, article.usage, article.dependencies, article.cleanup, article.strictMode, article.examples, article.mistakes, article.interview, article.takeaways];
const codeExamples = [article.overview.syntax, ...article.dependencies.forms, ...article.examples.items, ...article.mistakes.items.flatMap((mistake) => mistake.examples ?? [])];

describe("published useEffect article", () => {
  it("renders one primary heading within a semantic article", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(article.heading);
    expect(html).toMatch(/<article\b[^>]*aria-labelledby="article-heading"/);
    expect(html).toContain('id="article-heading"');
  });

  it("renders the content module's section IDs and table-of-contents links", () => {
    const toc = html.match(/<nav\b[^>]*aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const anchors = [...toc.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    const sectionIds = [...html.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map((match) => match[1]);
    expect(anchors).toEqual(sections.map((section) => section.id));
    expect(sectionIds).toEqual(anchors);
    for (const section of sections) expect(html).toContain(section.heading.replaceAll("&", "&amp;"));
  });

  it("renders Home, Frontend, and React breadcrumbs followed by the non-linked current topic", () => {
    const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const hrefs = [...breadcrumb.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    expect(hrefs).toEqual(["/", "/frontend", "/frontend/react"]);
    expect(breadcrumb).toMatch(/<span\b[^>]*aria-current="page"[^>]*>useEffect<\/span>/);
  });

  it("preserves code as escaped preformatted text without creating live controls", () => {
    const blocks = [...html.matchAll(/<pre\b[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)].map((match) => match[1]);
    expect(blocks).toHaveLength(codeExamples.length);
    codeExamples.forEach((example, index) => {
      const escaped = example.code.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
      expect(blocks[index]).toBe(escaped);
    });
    expect(html).not.toMatch(/<button\b|<input\b/);
    expect(html).toContain("TSX");
  });

  it("takes the summary from the topic registry for page metadata", () => {
    expect(metadata.title).toBe(`${article.heading} | Explain Dev`);
    expect(metadata.description).toBe(reactTopics.find((topic) => topic.id === "use-effect")?.summary);
  });

  it("keeps the article page and code presentation as Server Components", () => {
    for (const fileName of ["src/app/frontend/react/use-effect/page.tsx", "src/components/learning/code-block.tsx", "src/components/learning/article-layout.tsx"]) {
      const file = path.resolve(fileName);
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const clientDirective = source.statements.some((statement) =>
        ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) && statement.expression.text === "use client",
      );
      expect(clientDirective).toBe(false);
    }
  });
});
