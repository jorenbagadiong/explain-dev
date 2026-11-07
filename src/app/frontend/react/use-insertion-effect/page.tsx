import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-insertion-effect";

export const metadata = lessonMetadata("use-insertion-effect");

export default function Page() {
  return <LessonArticlePage topicId="use-insertion-effect" lesson={lesson} />;
}
