import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-memo";

export const metadata = lessonMetadata("use-memo");

export default function Page() {
  return <LessonArticlePage topicId="use-memo" lesson={lesson} />;
}
