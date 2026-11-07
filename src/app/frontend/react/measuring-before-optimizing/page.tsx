import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/measuring-performance";

export const metadata = lessonMetadata("measuring-performance");

export default function Page() {
  return <LessonArticlePage topicId="measuring-performance" lesson={lesson} />;
}
