import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/controlled-uncontrolled";

export const metadata = lessonMetadata("controlled-uncontrolled");

export default function Page() {
  return <LessonArticlePage topicId="controlled-uncontrolled" lesson={lesson} />;
}
