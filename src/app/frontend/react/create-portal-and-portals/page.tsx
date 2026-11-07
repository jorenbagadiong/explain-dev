import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-portals";

export const metadata = lessonMetadata("react-portals");

export default function Page() {
  return <LessonArticlePage topicId="react-portals" lesson={lesson} />;
}
