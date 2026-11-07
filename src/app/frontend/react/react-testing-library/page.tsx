import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-testing-library";

export const metadata = lessonMetadata("react-testing-library");

export default function Page() {
  return <LessonArticlePage topicId="react-testing-library" lesson={lesson} />;
}
