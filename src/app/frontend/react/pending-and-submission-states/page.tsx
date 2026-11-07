import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/submission-states";

export const metadata = lessonMetadata("submission-states");

export default function Page() {
  return <LessonArticlePage topicId="submission-states" lesson={lesson} />;
}
