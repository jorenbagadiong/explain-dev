import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-antipatterns";

export const metadata = lessonMetadata("react-antipatterns");

export default function Page() {
  return <LessonArticlePage topicId="react-antipatterns" lesson={lesson} />;
}
