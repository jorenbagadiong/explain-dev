import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { reactLessonNavigation } from "@/lib/learning/react-navigation";
import { categories } from "./categories";
import { CategoryNavigation } from "./category-navigation";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

function renderNavigation(pathname: string) {
  route.pathname = pathname;
  const html = renderToStaticMarkup(createElement(CategoryNavigation, { lessonNavigation: reactLessonNavigation }));
  const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter((match) => match[1].includes("data-category-link")).map((match) => ({
    href: match[1].match(/\bhref="([^"]+)"/)?.[1],
    routeMatch: match[1].match(/\bdata-route-match="([^"]+)"/)?.[1],
    current: /aria-current="(?:page|location)"/.test(match[1]),
    currentValue: match[1].match(/aria-current="([^"]+)"/)?.[1],
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

  it.each([
    ["/", false, false],
    ["/frontend", true, false],
    ["/frontend/react", true, true],
    ["/frontend/react/use-state", true, true],
    ["/frontend-tools", false, false],
    ["/frontend/react-other", true, false],
  ])("initializes parent disclosures from the route boundary on %s", (pathname, frontendOpen, reactOpen) => {
    const { html } = renderNavigation(pathname);
    const buttons = [...html.matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);
    for (const [label, open] of [["Frontend Development navigation", frontendOpen], ["React navigation", reactOpen]] as const) {
      const control = buttons.find((attributes) => attributes.includes(`aria-label="${label}"`))!;
      expect(control).toContain(`aria-expanded="${open}"`);
      const panelId = control.match(/aria-controls="([^"]+)"/)![1];
      expect(html).toContain(`<div id="${panelId}"${open ? "" : ' hidden=""'}`);
    }
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
    for (const item of html.matchAll(/<li data-category-id="(backend|fullstack|devops)">([\s\S]*?)<\/li>/g)) {
      expect(item[2]).not.toContain("<button");
      expect(item[2]).not.toContain("<a ");
    }
    expect(html).not.toContain('tabindex="0"');
  });

  it.each([
    ["/", "/", "exact"],
    ["/frontend", "/frontend", "exact"],
    ["/frontend/react", "/frontend", "descendant"],
    ["/frontend/react/use-state", "/frontend", "descendant"],
    ["/frontend-tools", undefined, undefined],
  ])("distinguishes exact and active-section presentation on %s from the existing pathname", (pathname, href, routeMatch) => {
    const { links } = renderNavigation(pathname);
    const matched = links.filter((link) => link.routeMatch);
    expect(matched.map((link) => ({ href: link.href, routeMatch: link.routeMatch }))).toEqual(
      href ? [{ href, routeMatch }] : [],
    );
    expect(matched.every((link) => link.current)).toBe(true);
    if (matched.length) expect(matched[0].currentValue).toBe(routeMatch === "exact" ? "page" : "location");
  });

  it.each([
    ["/", "/"],
    ["/frontend", "/frontend"],
    ["/frontend/react", "/frontend"],
    ["/frontend/react/use-state", "/frontend"],
    ["/frontend/react/use-effect", "/frontend"],
    ["/frontend-other", undefined],
    ["/frontend-tools", undefined],
    ["/backend", undefined],
    ["/unknown", undefined],
  ])("identifies the active link on %s without matching unrelated paths", (pathname, activeHref) => {
    const { links } = renderNavigation(pathname);
    expect(links.filter((link) => link.current).map((link) => link.href)).toEqual(
      activeHref ? [activeHref] : [],
    );
  });
});

describe("Practice entry point", () => {
  function practiceLink(pathname: string) {
    const { html } = renderNavigation(pathname);
    const match = html.match(/<a\b([^>]*data-practice-link=""[^>]*)>([\s\S]*?)<\/a>/);
    return { html, attributes: match?.[1] ?? "", content: match?.[2] ?? "" };
  }

  it("renders one Practice link after Home and before the learning categories", () => {
    const { html, attributes, content } = practiceLink("/");
    expect(html.match(/data-practice-link=""/g)).toHaveLength(1);
    expect(attributes).toContain('href="/practice"');
    expect(content).toContain("Practice");
    expect(content).toContain("Coding Lab prototype");
    expect(html.indexOf('href="/"')).toBeLessThan(html.indexOf('href="/practice"'));
    expect(html.indexOf('href="/practice"')).toBeLessThan(html.indexOf("Learning categories"));
  });

  it.each([
    ["/practice", "page", "exact"],
    ["/practice/react/use-state-counter", "location", "descendant"],
    ["/", undefined, undefined],
    ["/practice-other", undefined, undefined],
    ["/frontend/react/use-state", undefined, undefined],
  ])("marks %s with the matching current state", (pathname, current, routeMatch) => {
    const { attributes } = practiceLink(pathname);
    expect(attributes.match(/aria-current="([^"]+)"/)?.[1]).toBe(current);
    expect(attributes.match(/data-route-match="([^"]+)"/)?.[1]).toBe(routeMatch);
  });

  it("keeps a single page-level current link on Practice routes", () => {
    const { html } = renderNavigation("/practice/react/use-state-counter");
    expect(html.match(/aria-current="page"/g)).toBeNull();
    expect(renderNavigation("/practice").html.match(/aria-current="page"/g)).toHaveLength(1);
  });
});
