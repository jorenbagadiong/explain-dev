import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-debugging";

export const metadata = lessonMetadata("react-debugging");

export default function Page() {
  return <LessonArticlePage topicId="react-debugging" lesson={lesson} />;
}
