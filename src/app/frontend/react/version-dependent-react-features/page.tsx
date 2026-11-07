import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/version-sensitive-features";

export const metadata = lessonMetadata("version-sensitive-features");

export default function Page() {
  return <LessonArticlePage topicId="version-sensitive-features" lesson={lesson} />;
}
