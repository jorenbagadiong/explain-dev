import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/reducer-patterns";

export const metadata = lessonMetadata("reducer-patterns");

export default function Page() {
  return <LessonArticlePage topicId="reducer-patterns" lesson={lesson} />;
}
