import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { categories } from "./categories";
import { CategoryNavigation } from "./category-navigation";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

function renderNavigation(pathname: string) {
  route.pathname = pathname;
  const html = renderToStaticMarkup(createElement(CategoryNavigation));
  const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: match[1].match(/\bhref="([^"]+)"/)?.[1],
    current: match[1].includes('aria-current="page"'),
    content: match[2],
  }));
  return { html, links };
}

describe("shared category navigation", () => {
  it("renders Home and the available category as semantic links", () => {
    const { links } = renderNavigation("/");
    expect(links.map((link) => link.href)).toEqual(["/", "/frontend"]);
    expect(links[0].content).toContain("Home");
    expect(links[1].content).toContain("Frontend Development");
    expect(links[1].content).toContain("Available");
  });

  it("renders upcoming categories and their status outside links", () => {
    const { html, links } = renderNavigation("/");
    expect(html.match(/Coming soon/g)).toHaveLength(3);
    for (const category of categories.filter((entry) => entry.status === "coming-soon")) {
      // React escapes ampersands in category text during HTML serialization.
      const label = category.label.replaceAll("&", "&amp;");
      expect(html).toContain(label);
      expect(links.some((link) => link.content.includes(label))).toBe(false);
    }
    expect(html).not.toContain("<button");
    expect(html).not.toContain('tabindex="0"');
  });

  it.each([
    ["/", "/"],
    ["/frontend", "/frontend"],
    ["/frontend/react", "/frontend"],
    ["/frontend-other", undefined],
    ["/backend", undefined],
    ["/unknown", undefined],
  ])("identifies the active link on %s without matching unrelated paths", (pathname, activeHref) => {
    const { links } = renderNavigation(pathname);
    expect(links.filter((link) => link.current).map((link) => link.href)).toEqual(
      activeHref ? [activeHref] : [],
    );
  });
});
