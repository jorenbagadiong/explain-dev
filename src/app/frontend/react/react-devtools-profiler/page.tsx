import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-profiler";

export const metadata = lessonMetadata("react-profiler");

export default function Page() {
  return <LessonArticlePage topicId="react-profiler" lesson={lesson} />;
}
