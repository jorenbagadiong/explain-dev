import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/ref-props";

export const metadata = lessonMetadata("ref-props");

export default function Page() {
  return <LessonArticlePage topicId="ref-props" lesson={lesson} />;
}
