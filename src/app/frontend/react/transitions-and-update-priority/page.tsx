import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/transitions";

export const metadata = lessonMetadata("transitions");

export default function Page() {
  return <LessonArticlePage topicId="transitions" lesson={lesson} />;
}
