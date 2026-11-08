import { describe, expect, it } from "vitest";
import { reactLessonNavigation } from "./react-navigation";
import { reactCurriculumGroups } from "./react-curriculum";
import { reactTopics } from "./react-topics";

describe("React navigation metadata projection", () => {
  it("preserves all eight canonical groups and all 119 available lessons in order", () => {
    expect(reactLessonNavigation?.groups.map(({ id, title }) => ({ id, title }))).toEqual(
      [...reactCurriculumGroups].sort((a, b) => a.order - b.order).map(({ id, title }) => ({ id, title })),
    );
    expect(reactLessonNavigation?.groups).toHaveLength(8);
    for (const group of reactLessonNavigation!.groups) {
      expect(group.lessons).toEqual(reactTopics.filter((topic) => topic.groupId === group.id && topic.status === "available")
        .sort((a, b) => a.order - b.order).map(({ id, title, href }) => ({ id, title, href })));
    }
    const lessons = reactLessonNavigation!.groups.flatMap((group) => group.lessons);
    expect(lessons).toHaveLength(119);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(119);
    expect(new Set(lessons.map((lesson) => lesson.href)).size).toBe(119);
  });
  it("serializes only navigation metadata, without content, summaries or functions", () => {
    expect(Object.keys(reactLessonNavigation!).sort()).toEqual(["groups", "href", "title"]);
    expect(reactLessonNavigation!.href).toBe("/frontend/react");
    for (const group of reactLessonNavigation!.groups) {
      expect(Object.keys(group).sort()).toEqual(["id", "lessons", "title"]);
      for (const lesson of group.lessons) expect(Object.keys(lesson).sort()).toEqual(["href", "id", "title"]);
    }
    expect(JSON.parse(JSON.stringify(reactLessonNavigation))).toEqual(reactLessonNavigation);
  });
});
