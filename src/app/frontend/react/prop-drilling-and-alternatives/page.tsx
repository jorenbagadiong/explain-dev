import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/prop-drilling";

export const metadata = lessonMetadata("prop-drilling");

export default function Page() {
  return <LessonArticlePage topicId="prop-drilling" lesson={lesson} />;
}
