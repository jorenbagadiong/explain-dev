import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-suspense";

export const metadata = lessonMetadata("react-suspense");

export default function Page() {
  return <LessonArticlePage topicId="react-suspense" lesson={lesson} />;
}
