import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/testing-interactions";

export const metadata = lessonMetadata("testing-interactions");

export default function Page() {
  return <LessonArticlePage topicId="testing-interactions" lesson={lesson} />;
}
