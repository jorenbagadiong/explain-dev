import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/testing-custom-hooks";

export const metadata = lessonMetadata("testing-custom-hooks");

export default function Page() {
  return <LessonArticlePage topicId="testing-custom-hooks" lesson={lesson} />;
}
