// Independent TypeScript programs: one example at a time, without other examples.
import { writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { examples } from "./inventory.mjs";

const options = {
  strict: true, noEmit: true, skipLibCheck: true, isolatedModules: true,
  target: ts.ScriptTarget.ES2017,
  lib: ["lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.esnext.d.ts"],
  module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Force, jsx: ts.JsxEmit.ReactJSX,
  types: ["react", "react-dom", "node"],
};
const cache = new Map();
const results = [];
for (const example of examples.filter(e => !e.legacy && !["external", "pseudocode"].includes(e.classification) && ["tsx", "typescript"].includes(e.language))) {
  const name = path.resolve(`src/content/react/__ed014__/${example.topicId}__${example.id}.tsx`);
  const context = example.typecheckContext ?? {};
  const source = `${context.before ?? ""}\n${example.code}\n${context.after ?? ""}`;
  const files = new Map([[name, source]]);
  // Only these explicitly partial lazy snippets assume a neighbouring module.
  if (example.topicId === "react-lazy") {
    files.set(path.resolve("src/content/react/__ed014__/assumed-modules.d.ts"), ["markdown-preview", "report-tab", "chart"].map(module => `declare module "*/${module}" { const Component: import("react").ComponentType; export default Component; }`).join("\n"));
  }
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, version, onError, fresh) => {
    const resolved = path.resolve(fileName);
    if (files.has(resolved)) return ts.createSourceFile(fileName, files.get(resolved), version, true, fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    if (!cache.has(resolved)) cache.set(resolved, original(fileName, version, onError, fresh));
    return cache.get(resolved);
  };
  const program = ts.createProgram([...files.keys()], options, host);
  const errors = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error).map(d => ts.flattenDiagnosticMessageText(d.messageText, " "));
  results.push({ topicId: example.topicId, id: example.id, classification: example.classification, errors, assumedModules: example.topicId === "react-lazy", ambientDeclarations: /\bdeclare\s/.test(source) });
  if (results.length % 50 === 0) console.log(`Compiled ${results.length} isolated examples`);
}
const report = { checked: results.length, failed: results.filter(result => result.errors.length), results };
writeFileSync("docs/ed-014/compilation.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ checked: report.checked, failed: report.failed }, null, 2));
process.exitCode = report.failed.length ? 1 : 0;
