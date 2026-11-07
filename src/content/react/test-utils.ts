import path from "node:path";
import ts from "typescript";

import type { CodeExample } from "./article-types";

// Test-only compiler helper: virtual roots never become files or runnable routes.
export function typecheckExamples(examples: readonly CodeExample[]): string[] {
  const files = new Map(examples.map((example) => [
    path.resolve("src/content/react/__snippet_checks__", `${example.id}.tsx`), example.code,
  ]));
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    types: ["react"],
  };
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const code = files.get(path.resolve(fileName));
    return code !== undefined
      ? ts.createSourceFile(fileName, code, languageVersion, true, ts.ScriptKind.TSX)
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };
  const program = ts.createProgram([...files.keys()], options, host);
  const errors = ts.getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  return errors;
}

// Compiles the whole lesson corpus in one program. Forcing module detection keeps
// snippets from different lessons from colliding through shared global scope.
export function typecheckCorpus(files: ReadonlyMap<string, string>, ambient = ""): string[] {
  const resolved = new Map([...files].map(([name, code]) => [path.resolve("src/content/react/__snippet_checks__", `${name}.tsx`), code]));
  const ambientFile = path.resolve("src/content/react/__snippet_checks__/__ambient__.d.ts");
  if (ambient) resolved.set(ambientFile, ambient);
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2017,
    lib: ["lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.esnext.d.ts"],
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    moduleDetection: ts.ModuleDetectionKind.Force,
    jsx: ts.JsxEmit.ReactJSX,
    types: ["react", "react-dom", "node"],
  };
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const code = resolved.get(path.resolve(fileName));
    return code !== undefined
      ? ts.createSourceFile(fileName, code, languageVersion, true, path.resolve(fileName) === ambientFile ? ts.ScriptKind.TS : ts.ScriptKind.TSX)
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };
  const program = ts.createProgram([...resolved.keys()], options, host);
  return ts.getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => `${path.basename(diagnostic.file?.fileName ?? "program")}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
}
