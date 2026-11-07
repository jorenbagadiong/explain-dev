import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/state-structure";

export const metadata = lessonMetadata("state-structure");

export default function Page() {
  return <LessonArticlePage topicId="state-structure" lesson={lesson} />;
}
