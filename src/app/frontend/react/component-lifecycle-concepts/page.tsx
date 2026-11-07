import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-lifecycle";

export const metadata = lessonMetadata("component-lifecycle");

export default function Page() {
  return <LessonArticlePage topicId="component-lifecycle" lesson={lesson} />;
}
