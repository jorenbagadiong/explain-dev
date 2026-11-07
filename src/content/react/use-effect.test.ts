import { runInNewContext } from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import type { CodeExample } from "./article-types";
import { typecheckExamples } from "./test-utils";
import { useEffectArticle as article } from "./use-effect";

const sections = [article.overview, article.usage, article.dependencies, article.cleanup, article.strictMode, article.examples, article.mistakes, article.interview, article.takeaways];
const codeExamples = [article.overview.syntax, ...article.dependencies.forms, ...article.examples.items, ...article.mistakes.items.flatMap((mistake) => mistake.examples ?? [])];

describe("useEffect educational content", () => {
  it("provides all nine required sections with stable unique IDs and headings", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "what-is-use-effect", "when-to-use-effects", "dependency-arrays", "cleanup-and-lifecycle",
      "strict-mode", "practical-examples", "common-mistakes", "interview-questions", "key-takeaways",
    ]);
    expect(new Set(sections.map((section) => section.id)).size).toBe(sections.length);
    expect(sections.every((section) => section.heading.trim())).toBe(true);
  });

  it("keeps article content separate from topic metadata", () => {
    for (const key of ["id", "summary", "href", "status", "categoryId", "technologyId"]) expect(article).not.toHaveProperty(key);
  });

  it("provides three complete examples and unique code block IDs", () => {
    expect(article.examples.items).toHaveLength(3);
    expect(new Set(codeExamples.map((example) => example.id)).size).toBe(codeExamples.length);
    expect(article.examples.items.every((example) => example.code.includes('from "react"') && example.code.includes("export function"))).toBe(true);
    expect(codeExamples.every((example) => example.title.trim() && example.code.trim())).toBe(true);
  });

  it("strictly type-checks every complete TSX example against the installed React types", () => {
    expect(typecheckExamples(article.examples.items)).toEqual([]);
  });

  it("places each example's useEffect at the component top level", () => {
    for (const example of article.examples.items) {
      const source = ts.createSourceFile(`${example.id}.tsx`, example.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const component = source.statements.find((statement) => ts.isFunctionDeclaration(statement));
      if (!component || !ts.isFunctionDeclaration(component) || !component.body) throw new Error("Missing component");
      const effects = component.body.statements.filter((statement) =>
        ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression) &&
        ts.isIdentifier(statement.expression.expression) && statement.expression.expression.text === "useEffect",
      );
      expect(effects).toHaveLength(1);
    }
  });

  it("includes seven explained mistakes with corrections", () => {
    expect(article.mistakes.items.length).toBeGreaterThanOrEqual(7);
    expect(new Set(article.mistakes.items.map((mistake) => mistake.id)).size).toBe(article.mistakes.items.length);
    expect(article.mistakes.items.every((mistake) => mistake.problem.trim() && mistake.correction.trim())).toBe(true);
  });

  it("includes at least eight unique interview questions with answers", () => {
    const questions = article.interview.questions;
    expect(questions.length).toBeGreaterThanOrEqual(8);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(questions.every((question) => question.question.trim() && question.answer.trim())).toBe(true);
  });

  it("includes takeaways and the five primary official references", () => {
    expect(article.takeaways.items.length).toBeGreaterThanOrEqual(6);
    expect(article.sources).toHaveLength(5);
    expect(article.sources.every((source) => new URL(source.href).hostname === "react.dev")).toBe(true);
  });
});

type Setup = () => void | (() => void);

// Execute only authored example code in a VM with tiny Hook stubs. This captures
// actual setup/cleanup bodies; it does not implement or prove React scheduling.
function prepareExample(example: CodeExample, componentName: string, props: object = {}) {
  const effects: { setup: Setup; dependencies: readonly unknown[] | undefined }[] = [];
  const state: unknown[] = [];
  const listeners = new Map<string, () => void>();
  const timers = new Map<number, () => void>();
  const browser = {
    innerWidth: 1024,
    addEventListener: vi.fn((event: string, handler: () => void) => { listeners.set(event, handler); }),
    removeEventListener: vi.fn((event: string, handler: () => void) => { if (listeners.get(event) === handler) listeners.delete(event); }),
    setInterval: vi.fn<(handler: () => void, delay: number) => number>((handler) => { const id = nextTimer++; timers.set(id, handler); return id; }),
    clearInterval: vi.fn((id: number) => { timers.delete(id); }),
  };
  let nextTimer = 1;
  const navigator = { onLine: true };
  const exports: Record<string, unknown> = {};
  const apiAccess = vi.fn(() => { throw new Error("Browser API accessed before Effect setup"); });
  let allowBrowser = false;
  const globals = {
    exports,
    require(name: string) {
      if (name === "react/jsx-runtime") return jsxRuntime;
      if (name === "react") return {
        useEffect(setup: Setup, dependencies?: readonly unknown[]) { effects.push({ setup, dependencies }); },
        useState(initial: unknown) {
          const index = state.length; state.push(initial);
          return [initial, (next: unknown) => { state[index] = typeof next === "function" ? next(state[index]) : next; }];
        },
      };
      throw new Error(`Unexpected example import: ${name}`);
    },
    get window() { if (!allowBrowser) return apiAccess(); return browser; },
    get navigator() { if (!allowBrowser) return apiAccess(); return navigator; },
  };
  const compiled = ts.transpileModule(example.code, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  runInNewContext(compiled.outputText, globals, { timeout: 1000 });
  const component = exports[componentName];
  if (typeof component !== "function") throw new Error("Missing exported example component");
  component(props);
  expect(apiAccess).not.toHaveBeenCalled();
  expect(effects).toHaveLength(1);
  allowBrowser = true;
  return { effect: effects[0], state, browser, navigator, listeners, timers };
}

function completeExample(id: string) {
  const example = article.examples.items.find((item) => item.id === id);
  if (!example) throw new Error(`Missing example: ${id}`);
  return example;
}

function cleanupOf(setup: Setup) {
  const cleanup = setup();
  if (typeof cleanup !== "function") throw new Error("Example setup did not return cleanup");
  return cleanup;
}

describe("displayed example setup and cleanup bodies", () => {
  it("avoids browser reads before setup, then synchronizes resize and removes the exact listener", () => {
    const test = prepareExample(completeExample("window-width-component"), "WindowWidth");
    expect(test.state).toEqual([null]);
    expect(test.effect.dependencies).toEqual([]);
    const cleanup = cleanupOf(test.effect.setup);
    expect(test.state).toEqual([1024]);
    const handler = test.listeners.get("resize");
    expect(handler).toBeDefined();
    test.browser.innerWidth = 640; handler?.();
    expect(test.state).toEqual([640]);
    cleanup();
    expect(test.browser.removeEventListener).toHaveBeenCalledWith("resize", handler);
    expect(test.listeners.size).toBe(0);
    const cleanupAgain = cleanupOf(test.effect.setup);
    expect(test.listeners.size).toBe(1);
    cleanupAgain(); expect(test.listeners.size).toBe(0);
  });

  it("uses the interval prop, applies functional updates, and clears each setup's timer", () => {
    const test = prepareExample(completeExample("interval-component"), "TickCounter", { intervalMs: 250 });
    expect(test.effect.dependencies).toEqual([250]);
    const cleanup = cleanupOf(test.effect.setup);
    expect(test.browser.setInterval.mock.calls[0][1]).toBe(250);
    expect(test.timers.size).toBe(1);
    const tick = [...test.timers.values()][0]; tick(); tick();
    expect(test.state).toEqual([2]);
    cleanup(); expect(test.timers.size).toBe(0);
    expect(test.browser.clearInterval).toHaveBeenCalledWith(1);
    const cleanupAgain = cleanupOf(test.effect.setup);
    expect(test.timers.size).toBe(1);
    cleanupAgain(); expect(test.timers.size).toBe(0);
  });

  it("synchronizes online/offline events and releases both subscriptions", () => {
    const test = prepareExample(completeExample("online-status-component"), "OnlineStatus");
    expect(test.state).toEqual([null]);
    const cleanup = cleanupOf(test.effect.setup);
    expect(test.state).toEqual([true]);
    const online = test.listeners.get("online"); const offline = test.listeners.get("offline");
    expect(online).toBeDefined(); expect(offline).toBe(online);
    test.navigator.onLine = false; offline?.(); expect(test.state).toEqual([false]);
    test.navigator.onLine = true; online?.(); expect(test.state).toEqual([true]);
    cleanup();
    expect(test.browser.removeEventListener).toHaveBeenCalledWith("online", online);
    expect(test.browser.removeEventListener).toHaveBeenCalledWith("offline", offline);
    expect(test.listeners.size).toBe(0);
    const cleanupAgain = cleanupOf(test.effect.setup);
    expect(test.listeners.size).toBe(2);
    cleanupAgain(); expect(test.listeners.size).toBe(0);
  });
});
