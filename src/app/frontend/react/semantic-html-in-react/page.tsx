import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/semantic-react-html";

export const metadata = lessonMetadata("semantic-react-html");

export default function Page() {
  return <LessonArticlePage topicId="semantic-react-html" lesson={lesson} />;
}
