import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-callback";

export const metadata = lessonMetadata("use-callback");

export default function Page() {
  return <LessonArticlePage topicId="use-callback" lesson={lesson} />;
}
