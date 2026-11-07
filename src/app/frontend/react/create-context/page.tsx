import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-create-context";

export const metadata = lessonMetadata("react-create-context");

export default function Page() {
  return <LessonArticlePage topicId="react-create-context" lesson={lesson} />;
}
