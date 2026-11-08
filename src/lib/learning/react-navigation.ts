import { frontendTechnologies } from "./frontend-technologies";
import { reactCurriculumGroups, type ReactCurriculumGroupId } from "./react-curriculum";
import { reactTopics } from "./react-topics";

export interface ReactLessonNavigationData {
  title: string;
  href: string;
  groups: {
    id: ReactCurriculumGroupId;
    title: string;
    lessons: { id: string; title: string; href: string }[];
  }[];
}

// Project metadata on the server; the client never imports the content registry.
const technology = frontendTechnologies.find((entry) => entry.id === "react");
export const reactLessonNavigation: ReactLessonNavigationData | null =
  technology?.status === "available" ? {
    title: technology.name,
    href: technology.href,
    groups: [...reactCurriculumGroups].sort((a, b) => a.order - b.order).map((group) => ({
      id: group.id,
      title: group.title,
      lessons: reactTopics.filter((topic) => topic.groupId === group.id && topic.status === "available")
        .sort((a, b) => a.order - b.order)
        .map(({ id, title, href }) => ({ id, title, href })),
    })),
  } : null;
