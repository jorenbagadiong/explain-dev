import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/avoiding-unnecessary-state";

export const metadata = lessonMetadata("avoiding-unnecessary-state");

export default function Page() {
  return <LessonArticlePage topicId="avoiding-unnecessary-state" lesson={lesson} />;
}
