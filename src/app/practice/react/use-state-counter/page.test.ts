import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useStateCounterChallenge as challenge } from "@/content/labs/react/use-state-counter";
import { reactTopics } from "@/lib/learning/react-topics";

// The real loader is a lazily loaded client boundary; here we only assert what the server renders around it.
vi.mock("@/components/lab/practice-workspace-loader", () => ({
  PracticeWorkspaceLoader: (props: { challengeTitle: string; starterFile: { name: string; code: string } }) =>
    createElement("div", { "data-workspace-placeholder": "", "data-title": props.challengeTitle, "data-file": props.starterFile.name, "data-starter-length": props.starterFile.code.length }),
}));

const { default: Page, metadata } = await import("./page");
const html = renderToStaticMarkup(createElement(Page));
const lesson = reactTopics.find((topic) => topic.id === "use-state")!;

describe("useState counter practice page", () => {
  it("renders one heading, metadata and a breadcrumb back to Practice", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(">Build a Counter</h1>");
    expect(metadata.title).toBe("Build a Counter · Practice | Explain Dev");
    const breadcrumb = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)![1];
    expect([...breadcrumb.matchAll(/href="([^"]+)"/g)].map((match) => match[1])).toEqual(["/", "/practice"]);
    expect(breadcrumb).toMatch(/aria-current="page"[^>]*>Build a Counter</);
  });

  it("links to the lesson using the curriculum registry's title and route", () => {
    const link = html.match(/<a\b([^>]*data-lab-lesson-link=""[^>]*)>([\s\S]*?)<\/a>/)!;
    expect(link[1]).toContain(`href="${lesson.href}"`);
    expect(link[2]).toMatch(new RegExp(`>${lesson.title}$`));
    expect(html).toContain("React Hooks");
  });

  it("server-renders instructions and requirements, keeping progressive hints in the client workspace", () => {
    for (const text of [...challenge.instructions, ...challenge.requirements]) expect(html).toContain(text);
    expect(html).toContain("select Run Tests");
    for (const hint of challenge.hints) expect(html).not.toContain(hint);
  });

  it("discloses prototype limitations, including that types are not checked", () => {
    const notice = html.match(/<aside\b[^>]*data-lab-limitations=""[^>]*>([\s\S]*?)<\/aside>/)![1];
    expect(notice).toContain("Research prototype.");
    expect(notice).toContain("TypeScript types are removed, not checked.");
    expect(notice).toContain("Network requests are blocked.");
    expect(notice).toContain("Drafts and progress are stored only in this browser");
  });

  it("passes the starter file to the lazily loaded workspace", () => {
    expect(html).toContain(`data-workspace-placeholder="" data-title="Build a Counter" data-file="App.tsx" data-starter-length="${challenge.starterFiles[0].code.length}"`);
  });
});
