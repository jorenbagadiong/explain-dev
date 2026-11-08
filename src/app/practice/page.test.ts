import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { labChallenges } from "@/lib/lab/challenges";
import PracticePage, { metadata } from "./page";

const html = renderToStaticMarkup(createElement(PracticePage));

describe("Practice index", () => {
  it("renders the Practice heading and breadcrumb", () => {
    expect(metadata.title).toBe("Practice | Explain Dev");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(">Practice</h1>");
    expect(html).toMatch(/aria-current="page"[^>]*>Practice</);
  });

  it("lists every challenge with its route and lesson link", () => {
    const items = [...html.matchAll(/<li\b[^>]*data-lab-challenge="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];
    expect(items.map((item) => item[1])).toEqual(labChallenges.map((challenge) => challenge.id));
    expect(items[0][2]).toContain('href="/practice/react/use-state-counter"');
    expect(items[0][2]).toContain('href="/frontend/react/use-state"');
    expect(items[0][2]).toContain("Lesson: useState</a>");
  });

  it("does not load the editor or preview on the index", () => {
    expect(html).not.toContain("data-lab-workspace");
    expect(html).not.toContain("<iframe");
  });
});
