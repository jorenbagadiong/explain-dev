// Writes the thin static route file for each given topic, if it does not exist yet.
// Usage: node docs/ed-013/tools/generate-routes.mjs <topic-id> [topic-id...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const manifest = JSON.parse(readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
for (const id of process.argv.slice(2)) {
  const entry = manifest.topics.find((topic) => topic.id === id);
  if (!entry) throw new Error(`Unknown topic: ${id}`);
  if (existsSync(entry.routeFile)) continue;
  mkdirSync(dirname(entry.routeFile), { recursive: true });
  writeFileSync(entry.routeFile, `import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/${id}";

export const metadata = lessonMetadata("${id}");

export default function Page() {
  return <LessonArticlePage topicId="${id}" lesson={lesson} />;
}
`);
}
