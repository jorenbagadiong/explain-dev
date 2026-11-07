// Derives docs/ed-013/curriculum-manifest.json from the topic registry.
// Usage: node docs/ed-013/tools/sync-manifest.mjs [--check]
// The registry owns identity. This file only tracks progress, and --check reports drift.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { reactCurriculumGroups } from "../../../src/lib/learning/react-curriculum.ts";
import { reactTopics } from "../../../src/lib/learning/react-topics.ts";

const MANIFEST = "docs/ed-013/curriculum-manifest.json";
const LEGACY_CONTENT = {
  "react-introduction": "src/content/react/introduction-to-react.ts",
  "declarative-ui": "src/content/react/thinking-in-declarative-ui.ts",
  "use-state": "src/content/react/use-state.ts",
  "use-effect": "src/content/react/use-effect.ts",
};
// Batches follow curriculum order and shrink as topics get harder.
const BATCH_SIZES = { fundamentals: 11, "state-data-flow": 7, hooks: 6, "component-architecture": 7, "forms-interaction": 6, "performance-rendering": 5, "advanced-react": 5, "testing-best-practices": 6 };

const hyphenateApi = (word) => (/^(?:use|create)[A-Z]|^ViewTransition$/.test(word) ? word.replace(/([a-z])([A-Z])/g, "$1-$2") : word);
export const slugFromTitle = (title) => title.split(/\s+/).map(hyphenateApi).join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { topics: [] };
const previousById = new Map(previous.topics.map((topic) => [topic.id, topic]));
const lessonText = (file) => (existsSync(file) ? readFileSync(file, "utf8") : "");

const topics = [];
let batchNumber = 0;
for (const group of [...reactCurriculumGroups].sort((a, b) => a.order - b.order)) {
  const inGroup = reactTopics.filter((topic) => topic.groupId === group.id).sort((a, b) => a.order - b.order);
  let inBatch = 0;
  batchNumber += 1;
  for (const topic of inGroup) {
    const legacy = LEGACY_CONTENT[topic.id];
    if (!legacy && inBatch === BATCH_SIZES[group.id]) { batchNumber += 1; inBatch = 0; }
    if (!legacy) inBatch += 1;
    const route = topic.status === "available" ? topic.href : `/frontend/react/${slugFromTitle(topic.title)}`;
    const contentFile = legacy ?? `src/content/react/lessons/${topic.id}.ts`;
    const routeFile = `src/app${route}/page.tsx`;
    const old = previousById.get(topic.id) ?? {};
    const filesExist = existsSync(contentFile) && existsSync(routeFile);
    const published = topic.status === "available";
    let workflowStatus = old.workflowStatus ?? "pending";
    const knownIssues = (old.knownIssues ?? []).filter((issue) => !issue.startsWith("Downgraded:"));
    if (legacy) workflowStatus = "existing";
    else if (published && !filesExist) { workflowStatus = "blocked"; knownIssues.push("Downgraded: registry says available but files are missing."); }
    else if (published) workflowStatus = "published";
    else if (workflowStatus === "published") { workflowStatus = "pending"; knownIssues.push("Downgraded: manifest said published but the registry does not."); }
    const references = [...lessonText(contentFile).matchAll(/href: "(https:[^"]+)"/g)].map((match) => match[1]);
    topics.push({
      id: topic.id,
      title: topic.title,
      groupId: group.id,
      group: group.title,
      order: topic.order,
      route,
      publicationStatus: topic.status,
      contentFile,
      routeFile,
      batch: legacy ? "pre-ed-013" : `B${String(batchNumber).padStart(2, "0")}`,
      workflowStatus,
      verificationStatus: old.verificationStatus ?? (legacy ? "verified-in-earlier-milestone" : "unverified"),
      docReferences: references,
      knownIssues,
      reviewNotes: old.reviewNotes ?? "",
    });
  }
}

const next = { generatedFrom: "src/lib/learning/react-topics.ts", topicCount: topics.length, topics };
const serialized = `${JSON.stringify(next, null, 2)}\n`;
if (process.argv.includes("--check")) {
  if (!existsSync(MANIFEST) || readFileSync(MANIFEST, "utf8") !== serialized) { console.error("Manifest is stale. Run: node docs/ed-013/tools/sync-manifest.mjs"); process.exit(1); }
  console.log("Manifest matches the registry and files on disk.");
} else {
  writeFileSync(MANIFEST, serialized);
}
const count = (status) => topics.filter((topic) => topic.workflowStatus === status).length;
console.log(`${topics.length} topics: ${topics.filter((topic) => topic.publicationStatus === "available").length} available, existing ${count("existing")}, published ${count("published")}, validated ${count("validated")}, implemented ${count("implemented")}, pending ${count("pending")}, blocked ${count("blocked")}`);
