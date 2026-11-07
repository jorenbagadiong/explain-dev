import { describe, expect, it } from "vitest";

import { categories } from "./categories";

describe("learning category configuration", () => {
  it("contains exactly four unique categories in the intended order", () => {
    expect(categories).toHaveLength(4);
    const ids = categories.map((category) => category.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids).toEqual(["frontend", "backend", "fullstack", "devops"]);
  });

  it("makes Frontend available at its implemented route", () => {
    expect(categories.find((category) => category.id === "frontend")).toMatchObject({
      label: "Frontend Development",
      href: "/frontend",
      status: "available",
    });
    expect(categories.filter((category) => category.status === "available")).toHaveLength(1);
  });

  it.each(["backend", "fullstack", "devops"])("keeps %s coming soon without a navigable route", (id) => {
    const category = categories.find((entry) => entry.id === id);
    expect(category).toBeDefined();
    expect(category?.status).toBe("coming-soon");
    expect(category?.href).toBeUndefined();
  });

  it("defines names, descriptions, and icons for all category presentations", () => {
    for (const category of categories) {
      expect(category.label.trim()).not.toBe("");
      expect(category.description.trim()).not.toBe("");
      expect(category.icon).toBeDefined();
    }
  });
});
