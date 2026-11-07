import * as React from "react";
import * as ReactDOM from "react-dom";
import { describe, expect, it } from "vitest";

import { reactCurriculumGroups } from "./react-curriculum";
import { reactTopics, type ReactTopicKind } from "./react-topics";

// Reviewed against the official React 19.3 Hook references and installed exports.
const stableReactHooks = ["useState", "useReducer", "useActionState", "useOptimistic", "useContext", "useRef", "useImperativeHandle", "useEffect", "useLayoutEffect", "useInsertionEffect", "useEffectEvent", "useMemo", "useCallback", "useTransition", "useDeferredValue", "useId", "useSyncExternalStore", "useDebugValue"] as const;
const originalHooks = ["use-state", "use-effect", "use-ref", "use-memo", "use-callback", "use-context"];

describe("React curriculum topic metadata", () => {
  it("uses unique explicit IDs and unique titles", () => {
    expect(new Set(reactTopics.map((topic) => topic.id)).size).toBe(reactTopics.length);
    expect(new Set(reactTopics.map((topic) => topic.title)).size).toBe(reactTopics.length);
    for (const topic of reactTopics) {
      expect(topic.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(topic.title.trim()).not.toBe("");
      expect(topic.summary.trim()).not.toBe("");
      expect(topic.summary).not.toContain("\n");
    }
  });

  it("assigns every topic to Frontend/React and exactly one valid curriculum group", () => {
    const groupIds = reactCurriculumGroups.map((group) => group.id);
    for (const topic of reactTopics) {
      expect(topic.categoryId).toBe("frontend");
      expect(topic.technologyId).toBe("react");
      expect(groupIds).toContain(topic.groupId);
      // IDs survive moves; they neither encode a group prefix nor an array index.
      expect(topic.id.startsWith(`${topic.groupId}-`)).toBe(false);
    }
  });

  it("declares supported kinds and explicit publication status", () => {
    const kinds: ReactTopicKind[] = ["concept", "hook", "react-dom-hook", "api", "component", "pattern", "tooling"];
    for (const topic of reactTopics) {
      expect(kinds).toContain(topic.kind);
      expect(["available", "coming-soon"]).toContain(topic.status);
    }
  });

  it("preserves the six original Hook IDs, titles, summaries, and relative order", () => {
    const originals = reactTopics.filter((topic) => originalHooks.includes(topic.id));
    expect(originals.map((topic) => topic.id)).toEqual(originalHooks);
    expect(originals.map((topic) => topic.title)).toEqual(["useState", "useEffect", "useRef", "useMemo", "useCallback", "useContext"]);
    expect(originals.map((topic) => topic.summary)).toEqual([
      "Manage state that triggers component re-renders when updated.",
      "Synchronize a component with external systems.",
      "Store mutable values or DOM references without triggering re-renders.",
      "Cache the result of a calculation between renders.",
      "Cache a function reference between renders.",
      "Read values from the nearest matching context provider.",
    ]);
    expect(originals.every((topic) => topic.groupId === "hooks")).toBe(true);
  });

  it("publishes only useState and useEffect at their unchanged URLs", () => {
    expect(reactTopics.filter((topic) => topic.status === "available").map(({ id, href }) => ({ id, href }))).toEqual([
      { id: "use-state", href: "/frontend/react/use-state" },
      { id: "use-effect", href: "/frontend/react/use-effect" },
    ]);
    for (const topic of reactTopics.filter((topic) => !["use-state", "use-effect"].includes(topic.id))) {
      expect(topic.status).toBe("coming-soon");
      expect(topic).not.toHaveProperty("href");
    }
  });

  it("uses deterministic unique positive ordering within every group", () => {
    for (const group of reactCurriculumGroups) {
      const orders = reactTopics.filter((topic) => topic.groupId === group.id).map((topic) => topic.order);
      expect(orders.length).toBeGreaterThan(0);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(new Set(orders).size).toBe(orders.length);
      expect(orders.every((order) => Number.isInteger(order) && order > 0)).toBe(true);
    }
  });

  it("includes each verified stable React Hook exactly once with its package origin", () => {
    const hooks = reactTopics.filter((topic) => topic.kind === "hook");
    expect(hooks.map((topic) => topic.title).sort()).toEqual([...stableReactHooks].sort());
    for (const topic of hooks) {
      expect(topic.groupId).toBe("hooks");
      expect(topic.package).toBe("react");
      expect(React).toHaveProperty(topic.title, expect.any(Function));
    }
    // Catch a new installed use-prefixed export for review, without calling `use` a Hook.
    expect(Object.keys(React).filter((key) => /^use[A-Z]/.test(key)).sort()).toEqual([...stableReactHooks].sort());
  });

  it("identifies useFormStatus as the stable React DOM Hook without duplicating deprecated useFormState", () => {
    const hooks = reactTopics.filter((topic) => topic.kind === "react-dom-hook");
    expect(hooks.map((topic) => topic.title)).toEqual(["useFormStatus"]);
    expect(hooks[0]).toMatchObject({ groupId: "hooks", package: "react-dom", status: "coming-soon" });
    expect(ReactDOM.useFormStatus).toBeTypeOf("function");
    expect(Object.keys(ReactDOM).filter((key) => /^use[A-Z]/.test(key) && key !== "useFormState")).toEqual(["useFormStatus"]);
    expect(reactTopics.some((topic) => /useFormState|unstable_|experimental_/.test(topic.title))).toBe(false);
  });

  it.each([
    ["react-use-api", "api", "advanced-react"],
    ["react-memo", "api", "performance-rendering"],
    ["react-lazy", "api", "performance-rendering"],
    ["react-create-context", "api", "component-architecture"],
    ["react-portals", "api", "component-architecture"],
    ["custom-hooks", "pattern", "component-architecture"],
    ["react-suspense", "component", "performance-rendering"],
    ["react-compiler", "tooling", "performance-rendering"],
    ["client-boundaries", "concept", "advanced-react"],
  ])("classifies %s independently of built-in Hooks", (id, kind, groupId) => {
    expect(reactTopics.find((topic) => topic.id === id)).toMatchObject({ kind, groupId, status: "coming-soon" });
  });
});
