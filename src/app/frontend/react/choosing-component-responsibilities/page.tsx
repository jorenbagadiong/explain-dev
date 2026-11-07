import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-responsibilities";

export const metadata = lessonMetadata("component-responsibilities");

export default function Page() {
  return <LessonArticlePage topicId="component-responsibilities" lesson={lesson} />;
}
