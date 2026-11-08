// Plain-text helpers for presenting diagnostics. All output is rendered as React text, never HTML.

/** Returns the first learner-module line in a stack trace produced by a script loaded from `moduleUrl`. */
export function findModuleLine(stack: unknown, moduleUrl: string): number | undefined {
  if (typeof stack !== "string" || !moduleUrl) return undefined;
  const escaped = moduleUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = stack.match(new RegExp(`${escaped}:(\\d+)(?::\\d+)?`));
  const line = match ? Number(match[1]) : NaN;
  return Number.isInteger(line) && line > 0 ? line : undefined;
}

export interface CodeFrameLine {
  number: number;
  text: string;
  highlighted: boolean;
}

/** A few lines of the learner's own source around a reported line. */
export function createCodeFrame(source: string, line: number | undefined, context = 2): CodeFrameLine[] {
  if (!line) return [];
  const lines = source.split("\n");
  if (line < 1 || line > lines.length) return [];
  const start = Math.max(1, line - context);
  const end = Math.min(lines.length, line + context);
  const frame: CodeFrameLine[] = [];
  for (let number = start; number <= end; number++) frame.push({ number, text: lines[number - 1].replace(/\t/g, "  "), highlighted: number === line });
  return frame;
}

/** Keeps React's component stack readable: trims blank lines and caps its length. */
export function summarizeComponentStack(stack: unknown, maxLines = 6): string | undefined {
  if (typeof stack !== "string") return undefined;
  const lines = stack.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, maxLines);
  return lines.length ? lines.join("\n") : undefined;
}
