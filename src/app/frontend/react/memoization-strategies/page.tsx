import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/memoization-strategies";

export const metadata = lessonMetadata("memoization-strategies");

export default function Page() {
  return <LessonArticlePage topicId="memoization-strategies" lesson={lesson} />;
}
