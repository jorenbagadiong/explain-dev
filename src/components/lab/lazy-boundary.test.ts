import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Static import-graph check: the global layout and ordinary lesson pages must not statically import
// the editor, the compiler or any sandbox package. The workspace is reached only through next/dynamic.

const src = path.join(process.cwd(), "src");
const SANDBOX_PACKAGES = /^(@codemirror\/|sucrase|acorn)/;
const LAB_MODULES = ["components/lab/practice-workspace", "components/lab/practice-workspace-loader", "components/lab/code-editor", "components/lab/preview-frame", "lib/lab/compiler", "components/lab/grading-results", "components/lab/learning-progress", "components/lab/use-challenge-progress", "lib/storage/challenge-progress", "content/labs/react/use-state-counter-solution", "lab-runtime/"];

function resolveImport(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/") ? path.join(src, specifier.slice(2)) : specifier.startsWith(".") ? path.resolve(path.dirname(from), specifier) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function staticImports(file: string): string[] {
  const code = readFileSync(file, "utf8");
  // Value imports and re-exports only; `import type` and dynamic import() are excluded.
  return [...code.matchAll(/^(?:import|export)\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']|^import\s+["']([^"']+)["']/gm)].map((match) => match[1] ?? match[2]);
}

function reachable(entry: string) {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    for (const specifier of staticImports(file)) {
      const resolved = resolveImport(file, specifier);
      if (resolved) queue.push(resolved);
      else if (!specifier.startsWith(".") && !specifier.startsWith("@/")) packages.add(specifier);
    }
  }
  return { files: [...files].map((file) => path.relative(src, file)), packages: [...packages] };
}

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? pages(path.join(dir, entry.name)) : entry.name === "page.tsx" ? [path.join(dir, entry.name)] : []);
}

// /practice is prefetched from the global sidebar, so it must not pull in the workspace loader either.
const ordinaryEntries = [path.join(src, "app/layout.tsx"), path.join(src, "app/page.tsx"), path.join(src, "app/practice/page.tsx"), ...pages(path.join(src, "app/frontend"))];

describe("Coding Lab lazy-loading boundary", () => {
  it("covers the layout, home, Practice index and every frontend page", () => {
    expect(ordinaryEntries.length).toBeGreaterThanOrEqual(123);
  });

  it.each(ordinaryEntries.map((entry) => [path.relative(src, entry), entry]))("%s does not statically reach lab code or sandbox packages", (_name, entry) => {
    const { files, packages } = reachable(entry);
    expect(packages.filter((name) => SANDBOX_PACKAGES.test(name))).toEqual([]);
    expect(files.filter((file) => LAB_MODULES.some((module) => file.startsWith(module)))).toEqual([]);
  });

  it("loads the workspace from the Practice route only through a dynamic import", () => {
    const loader = readFileSync(path.join(src, "components/lab/practice-workspace-loader.tsx"), "utf8");
    expect(loader).toMatch(/dynamic\(\(\) => import\("\.\/practice-workspace"\)/);
    expect(loader).toMatch(/ssr: false/);
    const { files, packages } = reachable(path.join(src, "app/practice/react/use-state-counter/page.tsx"));
    expect(packages.filter((name) => SANDBOX_PACKAGES.test(name))).toEqual([]);
    expect(files).not.toContain("components/lab/practice-workspace.tsx");
    expect(files).not.toContain("lib/lab/compiler.ts");
  });
});
