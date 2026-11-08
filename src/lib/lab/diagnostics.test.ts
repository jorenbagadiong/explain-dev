import { describe, expect, it } from "vitest";

import { createCodeFrame, findModuleLine, summarizeComponentStack } from "./diagnostics";

const url = "blob:null/1a2b3c4d-0000-4000-8000-000000000000";

describe("diagnostic helpers", () => {
  it("finds the learner line in Chromium and Firefox stack formats only for the module URL", () => {
    expect(findModuleLine(`TypeError: x\n    at increment (${url}:12:7)\n    at runtime.js:1:100`, url)).toBe(12);
    expect(findModuleLine(`increment@${url}:9:3\n@runtime.js:1:1`, url)).toBe(9);
    expect(findModuleLine("at other (blob:null/ffff:3:1)", url)).toBeUndefined();
    expect(findModuleLine(undefined, url)).toBeUndefined();
    expect(findModuleLine(`at x (${url}:0:1)`, url)).toBeUndefined();
  });

  it("creates a bounded code frame around the reported line", () => {
    const source = "a\nb\nc\nd\ne\nf";
    expect(createCodeFrame(source, 1)).toEqual([{ number: 1, text: "a", highlighted: true }, { number: 2, text: "b", highlighted: false }, { number: 3, text: "c", highlighted: false }]);
    expect(createCodeFrame(source, 6).map((line) => line.number)).toEqual([4, 5, 6]);
    expect(createCodeFrame(source, 7)).toEqual([]);
    expect(createCodeFrame(source, undefined)).toEqual([]);
  });

  it("summarizes React component stacks", () => {
    expect(summarizeComponentStack("\n    at Broken (blob:x:2:3)\n    at App\n\n", 6)).toBe("at Broken (blob:x:2:3)\nat App");
    expect(summarizeComponentStack(undefined)).toBeUndefined();
  });
});
