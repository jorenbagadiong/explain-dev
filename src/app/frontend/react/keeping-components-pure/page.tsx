import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-purity";

export const metadata = lessonMetadata("component-purity");

export default function Page() {
  return <LessonArticlePage topicId="component-purity" lesson={lesson} />;
}
