import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-state";

export const metadata = lessonMetadata("component-state");

export default function Page() {
  return <LessonArticlePage topicId="component-state" lesson={lesson} />;
}
