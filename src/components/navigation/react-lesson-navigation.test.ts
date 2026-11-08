import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { reactLessonNavigation } from "@/lib/learning/react-navigation";
import { ReactLessonNavigation } from "./react-lesson-navigation";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
const data = reactLessonNavigation!;
function render(pathname: string) {
  route.pathname = pathname;
  return renderToStaticMarkup(createElement(ReactLessonNavigation, { data }));
}

describe("React lesson navigation", () => {
  it.each(data.groups)("opens only $id on direct loading and matches every lesson exactly", (group) => {
    for (const lesson of group.lessons) {
      const html = render(lesson.href);
      expect(html.match(/aria-expanded="true"/g)).toHaveLength(2);
      expect(html).toContain(`data-lesson-group="${group.id}"><button`);
      const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
      const current = links.filter((link) => link[1].includes('aria-current="page"'));
      expect(current).toHaveLength(1);
      expect(current[0][1]).toContain(`href="${lesson.href}"`);
      expect(current[0][1]).toContain(`data-lesson-id="${lesson.id}"`);
      expect(links.filter((link) => link[1].includes("data-lesson-link"))).toHaveLength(group.lessons.length);
      expect(html).toContain('aria-current="location"');
    }
  });
  it.each(["/", "/frontend", "/frontend/react", "/frontend/react/use-state-extra", "/frontend/react/use-state/nested", "/frontend/react-other"])("does not invent an active lesson on %s", (pathname) => {
    const html = render(pathname);
    expect(html).not.toContain("data-lesson-link");
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(pathname === data.href || pathname.startsWith(`${data.href}/`) ? 8 : 9);
    expect(html.includes('aria-current="page"')).toBe(pathname === data.href);
  });
  it("gives every button a unique, existing controlled panel and accessible name", () => {
    const html = render(data.groups[0].lessons[0].href);
    const controls = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter((button) => !button[1].includes('aria-label="React navigation"'));
    const ids = controls.map((button) => button[1].match(/aria-controls="([^"]+)"/)![1]);
    expect(new Set(ids).size).toBe(8);
    controls.forEach((button, i) => {
      expect(button[1]).toContain('type="button"');
      expect(html).toContain(`<div id="${ids[i]}"`);
      expect(button[2]).toContain(data.groups[i].title.replaceAll("&", "&amp;"));
    });
  });
  it("uses separate panel IDs when desktop and mobile trees coexist", () => {
    route.pathname = data.groups[0].lessons[0].href;
    const html = renderToStaticMarkup(createElement("div", null,
      createElement(ReactLessonNavigation, { data }), createElement(ReactLessonNavigation, { data })));
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
