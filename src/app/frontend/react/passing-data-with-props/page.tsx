import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/props";

export const metadata = lessonMetadata("props");

export default function Page() {
  return <LessonArticlePage topicId="props" lesson={lesson} />;
}
