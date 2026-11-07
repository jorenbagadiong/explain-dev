import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-api-design";

export const metadata = lessonMetadata("component-api-design");

export default function Page() {
  return <LessonArticlePage topicId="component-api-design" lesson={lesson} />;
}
