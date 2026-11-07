import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/testing-async-ui";

export const metadata = lessonMetadata("testing-async-ui");

export default function Page() {
  return <LessonArticlePage topicId="testing-async-ui" lesson={lesson} />;
}
