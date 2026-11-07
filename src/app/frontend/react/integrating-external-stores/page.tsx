import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/external-stores";

export const metadata = lessonMetadata("external-stores");

export default function Page() {
  return <LessonArticlePage topicId="external-stores" lesson={lesson} />;
}
