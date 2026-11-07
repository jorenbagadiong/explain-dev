import { describe, expect, it } from "vitest";

import { frontendTechnologies } from "./frontend-technologies";

describe("frontend technology registry", () => {
  it("contains seven unique technologies in the intended order", () => {
    expect(frontendTechnologies).toHaveLength(7);
    const ids = frontendTechnologies.map((technology) => technology.id);
    expect(new Set(ids).size).toBe(7);
    expect(ids).toEqual(["html-css", "javascript", "typescript", "react", "nextjs", "accessibility", "performance"]);
  });

  it("makes React the only available technology at its implemented route", () => {
    const available = frontendTechnologies.filter((technology) => technology.status === "available");
    expect(available).toHaveLength(1);
    expect(available[0]).toMatchObject({
      id: "react",
      name: "React",
      description: "Build interactive user interfaces with reusable components.",
      status: "available",
      href: "/frontend/react",
    });
  });

  it.each(["html-css", "javascript", "typescript", "nextjs", "accessibility", "performance"])(
    "keeps %s coming soon without a navigable route",
    (id) => {
      const technology = frontendTechnologies.find((entry) => entry.id === id);
      expect(technology).toBeDefined();
      expect(technology?.status).toBe("coming-soon");
      expect(technology?.href).toBeUndefined();
    },
  );

  it("provides descriptive names and summaries for every technology", () => {
    for (const technology of frontendTechnologies) {
      expect(technology.name.trim()).not.toBe("");
      expect(technology.description.trim()).not.toBe("");
      expect(technology.icon).toBeDefined();
    }
  });
});
