import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/imperative-interfaces";

export const metadata = lessonMetadata("imperative-interfaces");

export default function Page() {
  return <LessonArticlePage topicId="imperative-interfaces" lesson={lesson} />;
}
