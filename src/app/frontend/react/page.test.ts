import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { reactCurriculumGroups } from "@/lib/learning/react-curriculum";
import { reactTopics } from "@/lib/learning/react-topics";
import ReactPage from "./page";

const html = renderToStaticMarkup(createElement(ReactPage));
const sections = [...html.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];

describe("grouped React curriculum", () => {
  it("renders eight semantic groups in registry order with headings and descriptions", () => {
    expect(sections.map((section) => section[1])).toEqual(reactCurriculumGroups.map((group) => group.id));
    for (const [index, group] of reactCurriculumGroups.entries()) {
      expect(sections[index][0]).toContain(`aria-labelledby="${group.id}-heading"`);
      expect(sections[index][2]).toContain(group.title.replaceAll("&", "&amp;"));
      expect(sections[index][2]).toContain(group.description);
      expect(sections[index][2].match(/<h2\b/g)).toHaveLength(1);
    }
  });

  it("renders each topic once in its own group and stable order using registry metadata", () => {
    const renderedTitles: string[] = [];
    for (const [index, group] of reactCurriculumGroups.entries()) {
      const cards = [...sections[index][2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
      const topics = reactTopics.filter((topic) => topic.groupId === group.id).sort((a, b) => a.order - b.order);
      expect(cards).toHaveLength(topics.length);
      topics.forEach((topic, cardIndex) => {
        expect(cards[cardIndex]).toContain(topic.title);
        expect(cards[cardIndex]).toContain(topic.summary);
        expect(cards[cardIndex].match(/<h3\b/g)).toHaveLength(1);
        renderedTitles.push(topic.title);
      });
    }
    expect(new Set(renderedTitles).size).toBe(reactTopics.length);
  });

  it("links only published cards and leaves all upcoming cards outside the tab order", () => {
    const curriculum = sections.map((section) => section[2]).join("");
    expect([...curriculum.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1])).toEqual([
      "/frontend/react/use-state", "/frontend/react/use-effect",
    ]);
    const upcoming = [...curriculum.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)];
    expect(upcoming).toHaveLength(reactTopics.filter((topic) => topic.status === "coming-soon").length);
    for (const card of upcoming) {
      expect(card[1]).toContain("Coming soon");
      expect(card[0]).not.toMatch(/<a\b|<button\b|<input\b|\btabindex=|\bonclick=|\brole="(?:button|link)"|hover:/);
    }
  });

  it("points static curriculum links to real unique sections", () => {
    const toc = html.match(/<nav\b[^>]*aria-label="React curriculum"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    expect(toc).toBeDefined();
    expect([...(toc ?? "").matchAll(/href="#([^"]+)"/g)].map((match) => match[1])).toEqual(sections.map((section) => section[1]));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the curriculum, registries, and cards server-compatible without browser state", () => {
    for (const path of ["src/app/frontend/react/page.tsx", "src/lib/learning/react-curriculum.ts", "src/lib/learning/react-topics.ts", "src/components/learning/topic-card.tsx"]) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/^\s*["']use client["']/);
      expect(source).not.toMatch(/\b(?:localStorage|window|document)\s*[.[]|\buse(?:State|Effect)\s*\(/);
    }
  });
});
