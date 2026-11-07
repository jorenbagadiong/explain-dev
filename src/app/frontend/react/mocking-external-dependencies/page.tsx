import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/mocking-dependencies";

export const metadata = lessonMetadata("mocking-dependencies");

export default function Page() {
  return <LessonArticlePage topicId="mocking-dependencies" lesson={lesson} />;
}
