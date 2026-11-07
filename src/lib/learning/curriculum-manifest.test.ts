import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { lessonIds } from "@/content/react/lessons/lesson-corpus";
import { reactCurriculumGroups } from "./react-curriculum";
import { reactTopics } from "./react-topics";

interface ManifestTopic {
  id: string; title: string; groupId: string; order: number; route: string; publicationStatus: string;
  contentFile: string; routeFile: string; batch: string; workflowStatus: string; verificationStatus: string;
}
const manifest = JSON.parse(readFileSync("docs/ed-013/curriculum-manifest.json", "utf8")) as { topicCount: number; topics: ManifestTopic[] };
const byId = new Map(manifest.topics.map((topic) => [topic.id, topic]));
const LEGACY = ["react-introduction", "declarative-ui", "use-state", "use-effect"];

describe("curriculum registry", () => {
  it("keeps 119 topics in eight groups", () => {
    expect(reactTopics).toHaveLength(119);
    expect(reactCurriculumGroups).toHaveLength(8);
    expect(new Set(reactTopics.map((topic) => topic.id)).size).toBe(119);
  });

  it("gives Thinking in Declarative UI its canonical title without moving it", () => {
    expect(reactTopics.find((topic) => topic.id === "declarative-ui")).toMatchObject({ title: "Thinking in Declarative UI", order: 2, href: "/frontend/react/thinking-in-declarative-ui" });
  });
});

describe("curriculum manifest", () => {
  it("has exactly one entry per registry topic, with matching identity", () => {
    expect(manifest.topicCount).toBe(reactTopics.length);
    expect(manifest.topics).toHaveLength(reactTopics.length);
    expect(byId.size).toBe(reactTopics.length);
    for (const topic of reactTopics) {
      expect(byId.get(topic.id)).toMatchObject({ title: topic.title, groupId: topic.groupId, order: topic.order, publicationStatus: topic.status });
    }
  });

  it("assigns every topic a unique route inside the React section", () => {
    const routes = manifest.topics.map((topic) => topic.route);
    expect(new Set(routes).size).toBe(routes.length);
    for (const route of routes) expect(route).toMatch(/^\/frontend\/react\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("only records a topic as published when the registry and files agree", () => {
    for (const entry of manifest.topics) {
      const topic = reactTopics.find((item) => item.id === entry.id);
      if (entry.workflowStatus === "published" || entry.workflowStatus === "existing") {
        expect(topic?.status).toBe("available");
        expect(existsSync(entry.contentFile)).toBe(true);
        expect(existsSync(entry.routeFile)).toBe(true);
      }
      if (topic?.status === "available") {
        expect(topic.href).toBe(entry.route);
        expect(["published", "existing"]).toContain(entry.workflowStatus);
      }
      if (entry.workflowStatus === "published") expect(entry.verificationStatus).toBe("gates-passed");
    }
    expect(manifest.topics.filter((topic) => topic.workflowStatus === "existing").map((topic) => topic.id).sort()).toEqual([...LEGACY].sort());
  });
});

describe("lesson files and routes", () => {
  it("has a lesson file only for real, non-legacy topics", () => {
    for (const id of lessonIds()) {
      expect(byId.has(id)).toBe(true);
      expect(LEGACY).not.toContain(id);
    }
  });

  it("has a route directory only for manifest routes", () => {
    const routes = new Set(manifest.topics.map((topic) => topic.route));
    const root = path.resolve("src/app/frontend/react");
    for (const entry of readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory())) {
      expect(routes.has(`/frontend/react/${entry.name}`)).toBe(true);
    }
  });

  it("wires each lesson route to its own topic and content, and nothing else", () => {
    for (const id of lessonIds()) {
      const entry = byId.get(id) as ManifestTopic;
      if (!existsSync(entry.routeFile)) continue;
      const source = readFileSync(entry.routeFile, "utf8");
      expect(source).toContain(`from "@/content/react/lessons/${id}"`);
      expect(source).toContain(`lessonMetadata("${id}")`);
      expect(source).toContain(`topicId="${id}"`);
      expect(source.match(/@\/content\/react/g)).toHaveLength(1);
      expect(source).not.toContain("use client");
    }
  });

  it("keeps lesson bodies out of shared and client modules", () => {
    for (const file of ["src/components/learning/article-layout.tsx", "src/components/learning/article-modes.tsx", "src/components/learning/lesson-article.tsx", "src/app/frontend/react/page.tsx", "src/lib/learning/react-topics.ts"]) {
      expect(readFileSync(file, "utf8")).not.toMatch(/@\/content\/react\/lessons\//);
    }
    // The directive may appear inside a code example, so only the file's start counts.
    for (const id of lessonIds()) expect(readFileSync(`src/content/react/lessons/${id}.ts`, "utf8").trimStart().startsWith('import type')).toBe(true);
  });
});
