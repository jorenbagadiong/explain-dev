import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-composition";

export const metadata = lessonMetadata("component-composition");

export default function Page() {
  return <LessonArticlePage topicId="component-composition" lesson={lesson} />;
}
