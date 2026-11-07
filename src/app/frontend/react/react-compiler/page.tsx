import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-compiler";

export const metadata = lessonMetadata("react-compiler");

export default function Page() {
  return <LessonArticlePage topicId="react-compiler" lesson={lesson} />;
}
