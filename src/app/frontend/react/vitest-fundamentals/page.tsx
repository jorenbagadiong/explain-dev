import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/vitest-fundamentals";

export const metadata = lessonMetadata("vitest-fundamentals");

export default function Page() {
  return <LessonArticlePage topicId="vitest-fundamentals" lesson={lesson} />;
}
