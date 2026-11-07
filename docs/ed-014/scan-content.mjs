// Candidate discovery across all articles. A match is never a semantic verdict.
import { readFileSync, writeFileSync } from "node:fs";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ts from "typescript";
import { articles, examples, textEntries } from "./inventory.mjs";

const candidates = [], invalidImports = [], duplicateAnswers = [], seenAnswers = new Map();
const routeChecks = [];
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
let stringsScanned = 0;
for (const { topic, article, legacy } of articles) {
  const entries = textEntries(article);
  stringsScanned += entries.length;
  for (const { location, text } of entries) {
    if (/\b(?:TODO|FIXME|TBD|XXX)\b/.test(text) || /lorem ipsum|placeholder text|coming soon/i.test(text)) candidates.push({ topicId: topic.id, location, reason: "placeholder candidate", text });
    if (/\b(?:always|never|guarantee(?:s)?|every render|exactly once)\b/i.test(text) && /render|effect|memo|suspense|context|batch|server|compil|hook/i.test(text)) candidates.push({ topicId: topic.id, location, reason: "absolute-claim candidate; may be a correction of a misconception", text });
    if (/\.answer$/.test(location)) {
      if (seenAnswers.has(text)) duplicateAnswers.push({ topicId: topic.id, other: seenAnswers.get(text), location, text });
      else seenAnswers.set(text, { topicId: topic.id, location });
    }
  }
  const source = readFileSync(topic.contentFile, "utf8");
  if (source.trimStart().startsWith('"use client"')) throw new Error(`Content became a client module: ${topic.id}`);
  // Missing routes/content/build output throw rather than being skipped.
  const routeSource = readFileSync(topic.routeFile, "utf8");
  const html = readFileSync(`.next/server/app${topic.route}.html`, "utf8");
  const heading = legacy ? article.heading : topic.title;
  const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/)?.[0] ?? "";
  routeChecks.push({ topicId: topic.id,
    title: html.includes(`<title>${escape(heading)} | Explain Dev</title>`),
    heading: html.includes(`>${escape(heading)}</h1>`),
    breadcrumb: breadcrumb.includes(`>${escape(topic.title)}</span>`),
    serverRoute: !routeSource.trimStart().startsWith('"use client"'),
  });
}
for (const example of examples) {
  const source = ts.createSourceFile("example.tsx", example.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of source.statements.filter(ts.isImportDeclaration)) {
    const packageName = statement.moduleSpecifier.text;
    const api = packageName === "react" ? React : packageName === "react-dom" ? ReactDOM : null;
    const clause = statement.importClause;
    if (!api || !clause || clause.isTypeOnly || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    for (const item of clause.namedBindings.elements) {
      const name = (item.propertyName ?? item.name).text;
      if (!item.isTypeOnly && !(name in api)) invalidImports.push({ topicId: example.topicId, example: example.id, packageName, name });
    }
  }
}
const report = {
  scope: "119 articles, all extracted prose strings and all 445 example records. Candidate matching does not establish correctness or incorrectness.",
  articles: articles.length, stringsScanned, examplesScanned: examples.length,
  routeChecks,
  invalidInstalledRuntimeImports: invalidImports, exactDuplicateInterviewAnswers: duplicateAnswers,
  placeholders: candidates.filter(candidate => candidate.reason === "placeholder candidate"),
  htmlInjectionExamples: examples.filter(example => /dangerouslySetInnerHTML/.test(example.code)).map(example => ({ topicId: example.topicId, id: example.id })),
  absoluteClaimCandidates: candidates.filter(candidate => candidate.reason.startsWith("absolute")),
};
writeFileSync(process.env.REPORT || "docs/ed-014/content-scan.json", JSON.stringify(report, null, 2) + "\n");
const failedRoutes = routeChecks.filter(check => !check.title || !check.heading || !check.breadcrumb || !check.serverRoute);
console.log(JSON.stringify({ ...report, routeChecks: { checked: routeChecks.length, failed: failedRoutes }, absoluteClaimCandidates: report.absoluteClaimCandidates.length }, null, 2));
process.exitCode = invalidImports.length || report.placeholders.length || failedRoutes.length ? 1 : 0;
