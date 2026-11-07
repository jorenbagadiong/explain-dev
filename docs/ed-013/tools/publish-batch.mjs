// Flips validated lessons to available in the registry, then records it in the manifest.
// Usage: node docs/ed-013/tools/publish-batch.mjs <topic-id> [topic-id...]
// Run only after the batch's content, type, render, and regression gates have passed.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const REGISTRY = "src/lib/learning/react-topics.ts";
const MANIFEST = "docs/ed-013/curriculum-manifest.json";
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
let registry = readFileSync(REGISTRY, "utf8");

for (const id of process.argv.slice(2)) {
  const entry = manifest.topics.find((topic) => topic.id === id);
  if (!entry) throw new Error(`Unknown topic: ${id}`);
  if (!existsSync(entry.contentFile) || !existsSync(entry.routeFile)) throw new Error(`Missing files for: ${id}`);
  const start = registry.indexOf(`    id: "${id}",\n`);
  const end = registry.indexOf("\n  },", start);
  if (start === -1 || end === -1) throw new Error(`Not in registry: ${id}`);
  const block = registry.slice(start, end);
  if (!block.includes('status: "coming-soon",')) throw new Error(`Not unpublished: ${id}`);
  registry = registry.slice(0, start) + block.replace('status: "coming-soon",', `status: "available",\n    href: "${entry.route}",`) + registry.slice(end);
  entry.workflowStatus = "published";
  entry.verificationStatus = "gates-passed";
}
writeFileSync(REGISTRY, registry);
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Published ${process.argv.length - 2} topics.`);
