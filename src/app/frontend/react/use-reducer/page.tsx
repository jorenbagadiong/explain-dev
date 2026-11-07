import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-reducer";

export const metadata = lessonMetadata("use-reducer");

export default function Page() {
  return <LessonArticlePage topicId="use-reducer" lesson={lesson} />;
}
