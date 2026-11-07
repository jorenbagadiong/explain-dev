import { mkdtempSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { examples } from "./inventory.mjs";

const root = mkdtempSync(path.join(tmpdir(), "explain-dev-ed014-tests-"));
symlinkSync(path.resolve("node_modules"), path.join(root, "node_modules"), "dir");
const tests = examples.filter(example => example.classification === "complete" && /from ["']vitest["']/.test(example.code));
for (const example of tests) writeFileSync(path.join(root, `${example.topicId}__${example.id}.test.tsx`), example.code);
writeFileSync(path.join(root, "vitest.config.mjs"), `export default { test: { environment: "node", include: ["*.test.tsx"], restoreMocks: true, unstubGlobals: true } };\n`);
console.log(`Executing ${tests.length} extracted Vitest examples in ${root}`);
const run = spawnSync(process.execPath, [path.resolve("node_modules/vitest/vitest.mjs"), "run", "--config", path.join(root, "vitest.config.mjs"), "--reporter=json", `--outputFile=${path.resolve("docs/ed-014/vitest-examples.json")}`], { cwd: root, stdio: "inherit" });
process.exitCode = run.status ?? 1;
