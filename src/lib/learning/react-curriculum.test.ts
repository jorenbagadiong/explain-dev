import { describe, expect, it } from "vitest";

import { reactCurriculumGroups } from "./react-curriculum";
import { reactTopics } from "./react-topics";

describe("React curriculum groups", () => {
  it("defines exactly eight unique groups in curriculum order", () => {
    expect(reactCurriculumGroups.map((group) => group.id)).toEqual([
      "fundamentals", "state-data-flow", "hooks", "component-architecture", "forms-interaction", "performance-rendering", "advanced-react", "testing-best-practices",
    ]);
    expect(new Set(reactCurriculumGroups.map((group) => group.id)).size).toBe(8);
    expect(reactCurriculumGroups.map((group) => group.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("gives every group a title, description, and curriculum topics", () => {
    for (const group of reactCurriculumGroups) {
      expect(group.title.trim()).not.toBe("");
      expect(group.description.trim()).not.toBe("");
      expect(reactTopics.some((topic) => topic.groupId === group.id)).toBe(true);
    }
  });
});
