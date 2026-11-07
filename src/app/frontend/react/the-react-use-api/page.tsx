import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-use-api";

export const metadata = lessonMetadata("react-use-api");

export default function Page() {
  return <LessonArticlePage topicId="react-use-api" lesson={lesson} />;
}
