import { describe, expect, it } from "vitest";

import { reactTopics } from "./react-topics";

describe("React topic metadata", () => {
  it("defines exactly six topics", () => {
    expect(reactTopics).toHaveLength(6);
  });

  it("uses unique stable topic IDs", () => {
    const ids = reactTopics.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(6);
    expect(ids).toEqual(["use-state", "use-effect", "use-ref", "use-memo", "use-callback", "use-context"]);
  });

  it("uses unique Hook titles", () => {
    const titles = reactTopics.map((topic) => topic.title);
    expect(new Set(titles).size).toBe(6);
    expect(titles).toEqual(["useState", "useEffect", "useRef", "useMemo", "useCallback", "useContext"]);
  });

  it("assigns every topic to the Frontend category", () => {
    expect(reactTopics.every((topic) => topic.categoryId === "frontend")).toBe(true);
  });

  it("assigns every topic to the React technology", () => {
    expect(reactTopics.every((topic) => topic.technologyId === "react")).toBe(true);
  });

  it("keeps useState and useEffect available at their article routes", () => {
    expect(reactTopics.filter((topic) => topic.status === "available")).toHaveLength(2);
    expect(reactTopics.find((topic) => topic.id === "use-state")).toMatchObject({
      status: "available",
      href: "/frontend/react/use-state",
    });
    expect(reactTopics.find((topic) => topic.id === "use-effect")).toMatchObject({
      status: "available",
      href: "/frontend/react/use-effect",
    });
  });

  it("keeps the other four topics coming soon without destinations", () => {
    const upcoming = reactTopics.filter((topic) => !["use-state", "use-effect"].includes(topic.id));
    expect(upcoming).toHaveLength(4);
    for (const topic of upcoming) {
      expect(topic.status).toBe("coming-soon");
      expect(topic.href).toBeUndefined();
      expect(topic).not.toHaveProperty("href");
    }
  });

  it("keeps registry order consistent with unique positive order values", () => {
    expect(reactTopics.map((topic) => topic.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(reactTopics.every((topic) => Number.isInteger(topic.order) && topic.order > 0)).toBe(true);
  });

  it("provides a non-empty concise summary for every topic", () => {
    for (const topic of reactTopics) {
      expect(topic.summary.trim()).not.toBe("");
      expect(topic.summary).not.toContain("\n");
    }
  });
});
