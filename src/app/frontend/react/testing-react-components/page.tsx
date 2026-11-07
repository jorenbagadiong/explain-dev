import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/testing-components";

export const metadata = lessonMetadata("testing-components");

export default function Page() {
  return <LessonArticlePage topicId="testing-components" lesson={lesson} />;
}
