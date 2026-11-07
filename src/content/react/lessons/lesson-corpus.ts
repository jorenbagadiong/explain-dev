import { readdirSync } from "node:fs";
import path from "node:path";

import type { LessonArticle, LessonExample } from "@/content/react/article-types";

// Test-only loader. Route files never import this, so lessons stay route-isolated.
export const LESSONS_DIR = path.resolve("src/content/react/lessons");

export function lessonIds(): string[] {
  return readdirSync(LESSONS_DIR).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts") && file !== "lesson-corpus.ts").map((file) => file.slice(0, -3)).sort();
}

export async function loadLessons(): Promise<Map<string, LessonArticle>> {
  const entries = await Promise.all(lessonIds().map(async (id) => [id, (await import(/* @vite-ignore */ path.join(LESSONS_DIR, `${id}.ts`))).lesson as LessonArticle] as const));
  return new Map(entries);
}

export function lessonExamples(lesson: LessonArticle): LessonExample[] {
  return [...lesson.sections.flatMap((section) => section.examples ?? []), ...lesson.mistakes.flatMap((mistake) => mistake.examples ?? [])];
}
