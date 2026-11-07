import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { frontendTechnologies } from "@/lib/learning/frontend-technologies";
import FrontendPage from "./page";
import ReactPage, { metadata as reactMetadata } from "./react/page";

describe("frontend technology presentation", () => {
  const html = renderToStaticMarkup(createElement(FrontendPage));
  const items = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);

  it("renders all technology names, descriptions, and statuses from the registry", () => {
    expect(items).toHaveLength(7);
    frontendTechnologies.forEach((technology, index) => {
      expect(items[index]).toContain(technology.name.replaceAll("&", "&amp;"));
      expect(items[index]).toContain(technology.description);
      expect(items[index]).toContain(technology.status === "available" ? "Available" : "Coming soon");
    });
  });

  it("renders React as the only navigable technology", () => {
    expect(items.filter((item) => /<a\b/.test(item))).toHaveLength(1);
    const reactIndex = frontendTechnologies.findIndex((technology) => technology.id === "react");
    expect(items[reactIndex]).toContain('href="/frontend/react"');
  });

  it("leaves upcoming technologies outside the keyboard tab order", () => {
    frontendTechnologies.forEach((technology, index) => {
      if (technology.status === "coming-soon") {
        expect(items[index]).toMatch(/<article\b/);
        expect(items[index]).not.toMatch(/<a\b|<button\b|\btabindex=/);
      }
    });
  });

  it("retains one primary heading and a truthful learning-content message", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("More learning content is coming soon");
    expect(html).toContain("published Introduction to React, Thinking in declarative UI, useState, and useEffect articles");
  });
});

describe("React technology introduction", () => {
  const html = renderToStaticMarkup(createElement(ReactPage));

  it("preserves the primary heading, introduction, and coming-soon state", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1\b[^>]*>React<\/h1>/);
    expect(html).toContain("Learn the core concepts behind building interactive user interfaces with React.");
    expect(html).toContain("The Introduction to React, Thinking in declarative UI, useState, and useEffect articles are available now.");
    expect(html).toContain("React Hooks");
    expect(html).toContain("React Fundamentals");
    expect(html).toContain("All other lessons are coming soon.");
  });

  it("renders the breadcrumb hierarchy with two real links and a non-linked current page", () => {
    const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    expect(breadcrumb).toBeDefined();
    const links = [...(breadcrumb ?? "").matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    expect(links.map((match) => match[1].match(/\bhref="([^"]+)"/)?.[1])).toEqual(["/", "/frontend"]);
    expect(links[0][2]).toBe("Home");
    expect(links[1][2]).toBe("Frontend Development");
    expect(breadcrumb).toMatch(/<span\b[^>]*aria-current="page"[^>]*>React<\/span>/);
    expect(breadcrumb?.indexOf("Home")).toBeLessThan(breadcrumb?.indexOf("Frontend Development") ?? -1);
    expect(breadcrumb?.indexOf("Frontend Development")).toBeLessThan(breadcrumb?.indexOf('aria-current="page"') ?? -1);
  });

  it("provides metadata that identifies the technology without claiming published lessons", () => {
    expect(reactMetadata.title).toBe("React | Explain Dev");
    expect(reactMetadata.description).toContain("Start with Introduction to React, Thinking in declarative UI, useState, and useEffect");
    expect(reactMetadata.description).toContain("coming in future milestones");
  });
});
