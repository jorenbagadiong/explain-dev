import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/rules-of-hooks";

export const metadata = lessonMetadata("rules-of-hooks");

export default function Page() {
  return <LessonArticlePage topicId="rules-of-hooks" lesson={lesson} />;
}
