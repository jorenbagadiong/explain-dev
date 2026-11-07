import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { reactTopics } from "@/lib/learning/react-topics";
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

});
