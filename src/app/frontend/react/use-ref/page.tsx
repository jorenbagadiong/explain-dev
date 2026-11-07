import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-ref";

export const metadata = lessonMetadata("use-ref");

export default function Page() {
  return <LessonArticlePage topicId="use-ref" lesson={lesson} />;
}
