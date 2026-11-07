import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/avoiding-renders";

export const metadata = lessonMetadata("avoiding-renders");

export default function Page() {
  return <LessonArticlePage topicId="avoiding-renders" lesson={lesson} />;
}
