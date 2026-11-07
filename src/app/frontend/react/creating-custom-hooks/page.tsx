import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/custom-hooks";

export const metadata = lessonMetadata("custom-hooks");

export default function Page() {
  return <LessonArticlePage topicId="custom-hooks" lesson={lesson} />;
}
