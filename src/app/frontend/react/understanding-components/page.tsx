import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-components";

export const metadata = lessonMetadata("react-components");

export default function Page() {
  return <LessonArticlePage topicId="react-components" lesson={lesson} />;
}
