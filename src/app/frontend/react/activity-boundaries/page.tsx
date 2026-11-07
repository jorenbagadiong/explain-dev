import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-activity";

export const metadata = lessonMetadata("react-activity");

export default function Page() {
  return <LessonArticlePage topicId="react-activity" lesson={lesson} />;
}
