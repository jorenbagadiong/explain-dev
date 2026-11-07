// Read-only curriculum inventory; writes audit evidence only when given --write.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

export const manifest = JSON.parse(readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
export const articles = await Promise.all(manifest.topics.map(async (topic) => {
  const exports = await import(pathToFileURL(path.resolve(topic.contentFile)).href);
  const article = exports.lesson ?? Object.values(exports).find(value => value && typeof value === "object");
  if (!article) throw new Error(`Missing article: ${topic.id}`);
  return { topic, article, legacy: !exports.lesson };
}));

function blocks(value, location = "article") {
  if (!value || typeof value !== "object") return [];
  if (typeof value.code === "string") return [{ ...value, location }];
  return Object.entries(value).flatMap(([key, child]) => blocks(child, `${location}.${key}`));
}

export const examples = articles.flatMap(({ topic, article, legacy }) => blocks(article).map(block => ({ topicId: topic.id, file: topic.contentFile, legacy, ...block })));
export function textEntries(value, location = "article") {
  if (typeof value === "string") return [{ location, text: value }];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).filter(([key]) => !["code", "before", "after"].includes(key)).flatMap(([key, child]) => textEntries(child, `${location}.${key}`));
}

const countBy = (items, key) => items.reduce((counts, item) => { const value = key(item); counts[value] = (counts[value] ?? 0) + 1; return counts; }, {});
export const summary = {
  topics: articles.length,
  groups: countBy(articles, ({ topic }) => topic.groupId),
  publication: countBy(articles, ({ topic }) => topic.publicationStatus),
  classifiedExamples: countBy(examples.filter(example => !example.legacy), example => example.classification),
  classifiedTotal: examples.filter(example => !example.legacy).length,
  legacyBlockRecords: examples.filter(example => example.legacy).length,
  legacyUniqueCode: new Set(examples.filter(example => example.legacy).map(example => example.code)).size,
  sourceUrls: [...new Set(articles.flatMap(({ article }) => article.sources.map(source => source.href)))].sort(),
  routesOnDisk: readdirSync("src/app/frontend/react", { withFileTypes: true }).filter(entry => entry.isDirectory()).length,
};

if (process.argv.includes("--write")) {
  writeFileSync("docs/ed-014/inventory.json", JSON.stringify(summary, null, 2) + "\n");
  writeFileSync("docs/ed-014/external-examples.json", JSON.stringify(examples.filter(example => example.classification === "external"), null, 2) + "\n");
  console.log(JSON.stringify({ ...summary, sourceUrls: summary.sourceUrls.length }, null, 2));
}
