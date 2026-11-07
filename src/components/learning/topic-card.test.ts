import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { reactTopics } from "@/lib/learning/react-topics";
import ReactPage from "@/app/frontend/react/page";
import { TopicCard } from "./topic-card";

describe("topic cards", () => {
  it.each(reactTopics)("renders $title with its summary and visible status", (topic) => {
    const html = renderToStaticMarkup(createElement(TopicCard, { topic }));
    expect(html).toContain(topic.title);
    expect(html).toContain(topic.summary);
    if (topic.status === "available") {
      expect(html).toMatch(/^<a\b/);
      expect(html).toContain(`href="${topic.href}"`);
      expect(html).toContain("Available");
    } else {
      expect(html).toMatch(/^<article\b/);
      expect(html).toContain("Coming soon");
      expect(html).not.toMatch(/<a\b|<button\b|<input\b|\btabindex=|\brole="(?:button|link)"/);
    }
  });

  it("renders all six cards in registry order under the React Hooks section", () => {
    const html = renderToStaticMarkup(createElement(ReactPage));
    const section = html.match(/<section\b[^>]*aria-labelledby="react-hooks-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    expect(section).toBeDefined();
    expect(section).toMatch(/<h2\b[^>]*>React Hooks<\/h2>/);
    const cards = [...(section ?? "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    expect(cards).toHaveLength(6);
    reactTopics.forEach((topic, index) => {
      expect(cards[index]).toContain(topic.title);
      expect(cards[index]).toContain(topic.summary);
    });
    expect(section?.match(/Coming soon/g)).toHaveLength(5);
    expect(section?.match(/<a\b/g)).toHaveLength(1);
    expect(section).toContain('href="/frontend/react/use-state"');
    expect(section).not.toMatch(/<button\b|\btabindex=/);
    expect(html).not.toContain("Planned learning areas");
  });
});
