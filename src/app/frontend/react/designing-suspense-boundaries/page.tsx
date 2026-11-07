import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/suspense-boundaries";

export const metadata = lessonMetadata("suspense-boundaries");

export default function Page() {
  return <LessonArticlePage topicId="suspense-boundaries" lesson={lesson} />;
}
