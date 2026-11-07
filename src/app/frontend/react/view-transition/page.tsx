import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-view-transition";

export const metadata = lessonMetadata("react-view-transition");

export default function Page() {
  return <LessonArticlePage topicId="react-view-transition" lesson={lesson} />;
}
