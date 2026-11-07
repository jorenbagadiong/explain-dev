import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/children-composition";

export const metadata = lessonMetadata("children-composition");

export default function Page() {
  return <LessonArticlePage topicId="children-composition" lesson={lesson} />;
}
