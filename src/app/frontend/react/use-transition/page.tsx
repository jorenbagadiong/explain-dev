import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-transition";

export const metadata = lessonMetadata("use-transition");

export default function Page() {
  return <LessonArticlePage topicId="use-transition" lesson={lesson} />;
}
