import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/focus-management";

export const metadata = lessonMetadata("focus-management");

export default function Page() {
  return <LessonArticlePage topicId="focus-management" lesson={lesson} />;
}
