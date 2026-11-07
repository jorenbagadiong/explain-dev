import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-layout-effect";

export const metadata = lessonMetadata("use-layout-effect");

export default function Page() {
  return <LessonArticlePage topicId="use-layout-effect" lesson={lesson} />;
}
