import vm from "node:vm";
import { parse } from "acorn";
import { describe, expect, it } from "vitest";

import { useStateCounterChallenge } from "@/content/labs/react/use-state-counter";
import { createExecutionGuard, ExecutionLimitError } from "@/lab-runtime/execution-guard";
import { ALLOWED_MODULES, compileLearnerModule, GUARD_IDENTIFIER, wrapModule } from "./compiler";
import { findModuleLine } from "./diagnostics";
import { MAX_SOURCE_LENGTH } from "./protocol";

const MODULE_URL = "blob:null/0f1e2d3c-test";

function compile(code: string) {
  return compileLearnerModule({ name: "App.tsx", code });
}

function compiled(code: string): string {
  const result = compile(code);
  if (!result.ok) throw new Error(`Expected success, got ${result.kind}: ${result.diagnostic.message}`);
  return result.code;
}

function failure(code: string) {
  const result = compile(code);
  if (result.ok) throw new Error("Expected a compile failure");
  return result;
}

const jsxStub = { jsxDEV: (type: unknown, props: unknown) => ({ type, props }), jsx: (type: unknown, props: unknown) => ({ type, props }), jsxs: (type: unknown, props: unknown) => ({ type, props }) };

/** Test-only execution of compiled output in an isolated V8 context. The application never does this. */
function execute(code: string, { limitMs = 40, modules = {} as Record<string, unknown> } = {}) {
  const trips: ExecutionLimitError[] = [];
  const { guard } = createExecutionGuard({ now: () => performance.now(), scheduleReset: (reset) => setImmediate(reset), limitMs, onTrip: (error) => trips.push(error) });
  const learnerModule = { exports: {} as Record<string, unknown> };
  const available: Record<string, unknown> = { react: {}, "react/jsx-dev-runtime": jsxStub, "react/jsx-runtime": jsxStub, ...modules };
  const requireModule = (name: string) => {
    if (!(name in available)) throw new Error(`Blocked module ${name}`);
    return available[name];
  };
  const context = vm.createContext({ self: { load: (factory: (...args: unknown[]) => void) => factory(requireModule, learnerModule, learnerModule.exports, guard) }, Promise, setImmediate });
  new vm.Script(wrapModule("load", compiled(code)), { filename: MODULE_URL }).runInContext(context, { timeout: 5_000 });
  return { exports: learnerModule.exports, trips };
}

describe("compiling learner modules", () => {
  it("compiles the starter files of every published challenge", () => {
    const starter = useStateCounterChallenge.starterFiles[0];
    const result = compileLearnerModule(starter);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(() => parse(wrapModule("load", result.code), { ecmaVersion: "latest", sourceType: "script" })).not.toThrow();
    const { exports } = execute(starter.code);
    const tree = JSON.stringify((exports.default as () => unknown)());
    expect(tree).toContain("Count: ");
    expect(tree).toContain("Increment");
  });

  it("strips TypeScript syntax without type checking", () => {
    const code = `interface Props { label: string }
type Count = number;
export default function App({ label }: Props) {
  const value = 1 as unknown as Count;
  const wrong: string = 42 as unknown as string; // a type error that Sucrase does not report
  return label + value + wrong;
}`;
    const { exports } = execute(code);
    expect((exports.default as (props: { label: string }) => string)({ label: "n=" })).toBe("n=142");
  });

  it("preserves source line numbers for runtime stack traces", () => {
    const code = `import { useState } from "react";

type Props = { label: string };

export default function App() {
  throw new Error("line six");
}`;
    const { exports } = execute(code);
    let stack = "";
    try { (exports.default as () => void)(); } catch (error) { stack = String((error as Error).stack); }
    expect(findModuleLine(stack, MODULE_URL)).toBe(6);
  });

  it.each([
    ["an unclosed JSX element", "export default function App() {\n  return <div>;\n}", 2],
    ["a missing expression", "const x = ;\nexport default x;", 1],
    ["an invalid type annotation", "let x: = 1;\nexport default x;", 1],
  ])("reports %s as a recoverable syntax error with a location", (_name, code, line) => {
    const result = failure(code);
    expect(result.kind).toBe("syntax");
    expect(result.diagnostic.name).toBe("SyntaxError");
    expect(result.diagnostic.line).toBe(line);
    expect(result.diagnostic.column).toBeGreaterThan(0);
    expect(result.diagnostic.message).not.toMatch(/Error transforming|\(\d+:\d+\)/);
  });

  it("reports JavaScript errors that only the parser detects with the source line", () => {
    const result = failure("let a = 1;\nlet a = 2;\nexport default a;");
    expect(result.kind).toBe("syntax");
    expect(result.diagnostic.line).toBe(2);
    expect(result.diagnostic.message).toMatch(/already been declared/);
  });

  it("points the reported column at the offending token", () => {
    const result = failure("const x = ;\nexport default x;");
    expect("const x = ;"[result.diagnostic.column! - 1]).toBe(";");
  });

  it.each([
    ['import lodash from "lodash";', "lodash"],
    ['import { readFile } from "fs";', "fs"],
    ['import data from "https://example.com/x.js";', "https://example.com/x.js"],
    ['import "./styles.css";', "./styles.css"],
    ['export * from "react-dom/server";', "react-dom/server"],
    ['export { renderToString } from "react-dom/server";', "react-dom/server"],
  ])("rejects unsupported module %s", (statement, name) => {
    const result = failure(`import { useState } from "react";\n${statement}\nexport default function App() { return null; }`);
    expect(result.kind).toBe("unsupported-import");
    expect(result.diagnostic.line).toBe(2);
    expect(result.diagnostic.message).toContain(`"${name}"`);
    expect(result.diagnostic.message).toContain("react, react-dom/client");
  });

  it("erases type-only imports, which never load at runtime", () => {
    expect(compile('import type { CSSProperties } from "csstype";\nexport default function App() { return null; }').ok).toBe(true);
  });

  it.each(ALLOWED_MODULES)("allows the provided module %s", (name) => {
    expect(compile(`import * as M from "${name}";\nexport default function App() { return M ? null : null; }`).ok).toBe(true);
  });

  it.each([
    ["dynamic import", 'export default function App() {\n  import("react");\n  return null;\n}', /Dynamic import/],
    ["import.meta", "export default function App() {\n  return import.meta.url;\n}", /import\.meta/],
    ["require()", 'export default function App() {\n  return require("react");\n}', /require\(\)/],
    ["top-level await", "await Promise.resolve();\nexport default function App() { return null; }", /Top-level await/],
    ["top-level for await", "for await (const x of []) {}\nexport default function App() { return null; }", /Top-level await/],
  ])("rejects %s", (_name, code, message) => {
    const result = failure(code);
    expect(result.kind).toBe("unsupported-syntax");
    expect(result.diagnostic.message).toMatch(message);
    expect(result.diagnostic.line).toBeGreaterThan(0);
  });

  it("allows await inside functions", () => {
    expect(compile("export default async function App() { for await (const x of []) {} await Promise.resolve(); return null; }").ok).toBe(true);
  });

  it.each([
    `function ${GUARD_IDENTIFIER}() {}\nexport default function App() { return null; }`,
    "const __labHidden = 1;\nexport default function App() { return __labHidden; }",
    "export default function App(__labParam) { return null; }",
    "export default function App() { return { __labKey: 1 }; }",
  ])("rejects reserved __lab names so learner code cannot shadow the guard: %s", (code) => {
    const result = failure(code);
    expect(result.kind).toBe("unsupported-syntax");
    expect(result.diagnostic.message).toMatch(/reserved/);
  });

  it("does not treat __lab inside strings or comments as reserved", () => {
    expect(compile('// __labGuard\nexport default function App() { return "__labGuard"; }').ok).toBe(true);
  });

  it("requires a default export and accepts the re-export form", () => {
    expect(failure("export function App() { return null; }").kind).toBe("missing-export");
    expect(compile("function App() { return null; }\nexport { App as default };").ok).toBe(true);
    expect(compile("export default () => null;").ok).toBe(true);
  });

  it("rejects oversized sources before parsing", () => {
    expect(failure(`export default 1;${" ".repeat(MAX_SOURCE_LENGTH)}`).kind).toBe("too-large");
  });

  it("keeps function directive prologues first", () => {
    const output = compiled('export default function App() {\n  "use strict";\n  return 1;\n}');
    expect(output).toMatch(/"use strict";__labGuard\(\);/);
  });
});

describe("execution guards", () => {
  it.each([
    ["while (true) {}", "export default function App() {\n  while (true) {}\n}"],
    ["for (;;);", "export default function App() {\n  for (;;);\n}"],
    ["do-while", "export default function App() {\n  let i = 0;\n  do i++; while (true);\n}"],
    ["for-of over an infinite generator", "function* forever() { while (true) yield 1; }\nexport default function App() {\n  for (const value of forever()) value;\n}"],
    ["catch-and-continue", "export default function App() {\n  while (true) { try { while (true) {} } catch {} }\n}"],
  ])("stops %s and keeps throwing after the limit", (_name, code) => {
    const { exports, trips } = execute(code);
    let thrown: unknown;
    try { (exports.default as () => void)(); } catch (error) { thrown = error; }
    expect(thrown).toBeInstanceOf(ExecutionLimitError);
    expect(trips).toHaveLength(1);
  });

  it("surfaces unbounded synchronous recursion as a stack overflow", () => {
    const { exports } = execute("export default function App() { return App(); }");
    expect(() => (exports.default as () => void)()).toThrow(/call stack/i);
  });

  it("stops an endless microtask chain that would starve the event loop", async () => {
    const { exports, trips } = execute("export default function App() {\n  const spin = () => Promise.resolve().then(spin);\n  return spin();\n}", { limitMs: 30 });
    // Learner code cannot catch it (the guard stays tripped), so the uninstrumented test observes the rejection.
    const outcome = await Promise.race([(exports.default as () => Promise<unknown>)().then(() => "resolved", (error) => error), new Promise((resolve) => setTimeout(() => resolve("still running"), 2_000))]);
    expect(outcome).toBeInstanceOf(ExecutionLimitError);
    expect(trips).toHaveLength(1);
  });

  it("does not trip work that yields between tasks", async () => {
    const { exports, trips } = execute(`export default function App(done) {
  let rounds = 0;
  const tick = () => { for (let i = 0; i < 1000; i++) {} if (++rounds < 20) setImmediate(tick); else done(rounds); };
  tick();
}`, { limitMs: 30, modules: {} });
    const rounds = await new Promise((resolve) => (exports.default as (done: (value: number) => void) => void)(resolve));
    expect(rounds).toBe(20);
    expect(trips).toHaveLength(0);
  });

  it("preserves semantics of labels, non-block bodies, concise arrows and classes", () => {
    const { exports } = execute(`
class Box { #v = 2; get value() { return this.#v; } double = (n = (() => 1)()) => n * this.#v; static make() { return new Box(); } }
export default function App() {
  const pairs = [];
  outer: for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (j === 1) continue outer; if (i === 2) break outer; pairs.push(i + ":" + j); }
  let n = 0;
  while (n < 5) n++;
  const object = () => ({ a: 1 });
  const add = (a) => (b) => a + b;
  const seq = (x) => (x, x + 1);
  if (n) for (const k of [1, 2]) n += k;
  let keys = "";
  for (const key in { a: 1, b: 2 }) keys += key;
  const box = Box.make();
  return [pairs.join(","), n, object().a, add(2)(3), seq(4), box.value, box.double(), box.double(5), keys].join("|");
}`);
    expect((exports.default as () => string)()).toBe("0:0,1:0|8|1|5|5|2|2|10|ab");
  });

  it("handles statements that end at the same position as nested arrows (ASI)", () => {
    const { exports } = execute("let f\nfor (let i = 0; i < 2; i++) f = () => i\nexport default function App() { return f(); }");
    expect((exports.default as () => number)()).toBe(1);
  });
});
