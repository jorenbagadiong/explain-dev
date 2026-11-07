import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/lifting-state";

export const metadata = lessonMetadata("lifting-state");

export default function Page() {
  return <LessonArticlePage topicId="lifting-state" lesson={lesson} />;
}
