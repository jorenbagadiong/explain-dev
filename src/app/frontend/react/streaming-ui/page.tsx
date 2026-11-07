import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/streaming";

export const metadata = lessonMetadata("streaming");

export default function Page() {
  return <LessonArticlePage topicId="streaming" lesson={lesson} />;
}
