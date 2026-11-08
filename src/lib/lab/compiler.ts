import { parse, type Node } from "acorn";
import { fullAncestor } from "acorn-walk";
import { transform } from "sucrase";

import { MAX_SOURCE_LENGTH, toDiagnostic, type CompileErrorKind, type LabDiagnostic, type LabFile } from "./protocol";

// Compiles one learner module for the sandboxed preview. This is a pure source-to-source transform:
// nothing here executes learner code. It runs inside the preview runtime (and in unit tests).
//
// Pipeline:
//   1. Sucrase strips TypeScript and compiles JSX (line-preserving). Types are removed, never checked.
//   2. Acorn parses the result to enforce the module policy (import allowlist, no dynamic import, ...).
//   3. Execution guards are inserted at every function entry and loop iteration (same line, no newlines).
//   4. Sucrase converts ES module syntax to a CommonJS factory body whose `require` only resolves allowlisted modules.
// Line numbers therefore match the learner's source; columns can shift and are only reported for Sucrase errors.

/** Modules learners may import. jsx runtimes are used by compiled JSX. */
export const ALLOWED_MODULES = ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"] as const;
export const DOCUMENTED_MODULES = ["react", "react-dom/client"] as const;
export const GUARD_IDENTIFIER = "__labGuard";
const RESERVED_PREFIX = "__lab";

export type CompileResult =
  | { ok: true; code: string }
  | { ok: false; kind: CompileErrorKind; diagnostic: LabDiagnostic };

class PolicyError extends Error {
  constructor(readonly kind: CompileErrorKind, message: string, readonly line?: number) {
    super(message);
  }
}

type AnyNode = Node & Record<string, unknown>;
type Located = AnyNode & { loc?: { start: { line: number } } };

interface Insertion {
  position: number;
  text: string;
  /** Closers are placed before openers at the same position; nested order follows `depth`. */
  closer: boolean;
  depth: number;
}

const FUNCTION_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

function lineOf(node: AnyNode): number | undefined {
  return (node as Located).loc?.start.line;
}

function cleanSucraseMessage(message: string): string {
  return message.replace(/^Error transforming [^:]*: /, "").replace(/\s*\(\d+:\d+\)\s*$/, "");
}

function cleanAcornMessage(message: string): string {
  return message.replace(/\s*\(\d+:\d+\)\s*$/, "");
}

function stripTypesAndJsx(file: LabFile): string {
  return transform(file.code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "automatic",
    production: false,
    filePath: file.name,
    disableESTransforms: true,
    // TypeScript elides unused imports; keep them so every import is checked against the allowlist.
    keepUnusedImports: true,
  }).code;
}

function analyzeAndInstrument(code: string): string {
  let ast: AnyNode;
  const reservedLines: (number | undefined)[] = [];
  try {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
      preserveParens: true,
      // Token-level check: the AST walker skips binding identifiers (declarations, parameters, function names).
      onToken: (token) => {
        const value: unknown = (token as { value?: unknown }).value;
        if (token.type.label === "name" && typeof value === "string" && value.startsWith(RESERVED_PREFIX)) reservedLines.push(token.loc?.start.line);
      },
    }) as unknown as AnyNode;
  } catch (error) {
    const loc = (error as { loc?: { line: number } }).loc;
    throw new PolicyError("syntax", cleanAcornMessage(error instanceof Error ? error.message : String(error)), loc?.line);
  }
  if (reservedLines.length) throw new PolicyError("unsupported-syntax", `Names starting with "${RESERVED_PREFIX}" are reserved by the Coding Lab.`, reservedLines[0]);

  const insertions: Insertion[] = [];
  let hasDefaultExport = false;
  const guardCall = `${GUARD_IDENTIFIER}();`;

  const checkSource = (source: unknown, node: AnyNode) => {
    const name = (source as { value?: unknown } | null)?.value;
    if (typeof name !== "string" || !(ALLOWED_MODULES as readonly string[]).includes(name)) {
      throw new PolicyError(
        "unsupported-import",
        `"${String(name)}" can't be imported in the Coding Lab. Available modules: ${DOCUMENTED_MODULES.join(", ")}.`,
        lineOf(node),
      );
    }
  };

  fullAncestor(ast, (node: Node, _state: unknown, ancestors: Node[]) => {
    const current = node as AnyNode;
    const depth = ancestors.length;
    switch (current.type) {
      case "ImportDeclaration":
        checkSource(current.source, current);
        break;
      case "ExportAllDeclaration":
        checkSource(current.source, current);
        break;
      case "ExportNamedDeclaration":
        if (current.source) checkSource(current.source, current);
        if ((current.specifiers as AnyNode[]).some((specifier) => (specifier.exported as { name?: string; value?: string }).name === "default" || (specifier.exported as { value?: string }).value === "default")) hasDefaultExport = true;
        break;
      case "ExportDefaultDeclaration":
        hasDefaultExport = true;
        break;
      case "ImportExpression":
        throw new PolicyError("unsupported-syntax", `Dynamic import() is not available in the Coding Lab. Use a static import from: ${DOCUMENTED_MODULES.join(", ")}.`, lineOf(current));
      case "MetaProperty":
        if ((current.meta as { name?: string }).name === "import") throw new PolicyError("unsupported-syntax", "import.meta is not available in the Coding Lab.", lineOf(current));
        break;
      case "CallExpression": {
        const callee = current.callee as AnyNode;
        if (callee.type === "Identifier" && callee.name === "require") throw new PolicyError("unsupported-syntax", "require() is not available. Use an import declaration instead.", lineOf(current));
        break;
      }
      case "AwaitExpression":
      case "ForOfStatement":
        if ((current.type === "AwaitExpression" || current.await === true) && !ancestors.some((ancestor) => FUNCTION_TYPES.has(ancestor.type))) {
          throw new PolicyError("unsupported-syntax", "Top-level await is not supported. Move it into a function, such as an event handler or effect.", lineOf(current));
        }
        break;
    }

    if (FUNCTION_TYPES.has(current.type)) {
      const body = current.body as AnyNode;
      if (body.type === "BlockStatement") {
        // Keep directive prologues ("use strict") first.
        const statements = body.body as AnyNode[];
        let position = body.start + 1;
        for (const statement of statements) {
          if (statement.type === "ExpressionStatement" && typeof statement.directive === "string") position = statement.end;
          else break;
        }
        insertions.push({ position, text: guardCall, closer: false, depth });
      } else {
        // Concise arrow body: `x => expr` becomes `x => (guard(), expr)`.
        insertions.push({ position: body.start, text: `(${GUARD_IDENTIFIER}(), `, closer: false, depth });
        insertions.push({ position: body.end, text: ")", closer: true, depth });
      }
    }

    if (LOOP_TYPES.has(current.type)) {
      const body = current.body as AnyNode;
      if (body.type === "BlockStatement") {
        insertions.push({ position: body.start + 1, text: guardCall, closer: false, depth });
      } else {
        insertions.push({ position: body.start, text: `{${guardCall} `, closer: false, depth });
        insertions.push({ position: body.end, text: " }", closer: true, depth });
      }
    }
  });

  if (!hasDefaultExport) {
    throw new PolicyError("missing-export", "Export your component as the default export, for example: export default function App() { … }");
  }

  // Apply from the end so earlier positions stay valid. At one position the final order must be:
  // inner closers, outer closers, outer openers, inner openers.
  insertions.sort((a, b) => {
    if (a.position !== b.position) return b.position - a.position;
    if (a.closer !== b.closer) return a.closer ? 1 : -1;
    return a.closer ? a.depth - b.depth : b.depth - a.depth;
  });
  let output = code;
  for (const insertion of insertions) output = output.slice(0, insertion.position) + insertion.text + output.slice(insertion.position);
  return output;
}

function toCommonJs(code: string, fileName: string): string {
  return transform(code, { transforms: ["imports"], filePath: fileName, disableESTransforms: true }).code;
}

export function compileLearnerModule(file: LabFile): CompileResult {
  if (file.code.length > MAX_SOURCE_LENGTH) {
    return { ok: false, kind: "too-large", diagnostic: toDiagnostic({ name: "CompileError", message: `The file is larger than ${MAX_SOURCE_LENGTH.toLocaleString("en-US")} characters.` }) };
  }

  let stripped: string;
  try {
    stripped = stripTypesAndJsx(file);
  } catch (error) {
    const loc = (error as { loc?: { line?: number; column?: number } }).loc;
    return {
      ok: false,
      kind: "syntax",
      diagnostic: toDiagnostic({ name: "SyntaxError", message: cleanSucraseMessage(error instanceof Error ? error.message : String(error)), line: loc?.line, column: loc?.column }),
    };
  }

  try {
    return { ok: true, code: toCommonJs(analyzeAndInstrument(stripped), file.name) };
  } catch (error) {
    if (error instanceof PolicyError) {
      return { ok: false, kind: error.kind, diagnostic: toDiagnostic({ name: error.kind === "syntax" ? "SyntaxError" : "CompileError", message: error.message, line: error.line }) };
    }
    return { ok: false, kind: "syntax", diagnostic: toDiagnostic({ name: "CompileError", message: error instanceof Error ? error.message : String(error) }) };
  }
}

/** Wraps compiled CommonJS in a factory call. The prefix stays on line 1 so stack lines match the source. */
export function wrapModule(callbackName: string, compiled: string): string {
  if (!/^[A-Za-z_$][\w$]*$/.test(callbackName)) throw new Error("Invalid module callback name");
  return `self[${JSON.stringify(callbackName)}](function (require, module, exports, ${GUARD_IDENTIFIER}) {${compiled}\n});`;
}
