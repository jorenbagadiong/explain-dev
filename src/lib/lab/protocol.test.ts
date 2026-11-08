import { describe, expect, it } from "vitest";

import {
  clampText,
  isHelloMessage,
  isInitMessage,
  isParentPortMessage,
  isPreviewMessage,
  LAB_CHANNEL,
  LAB_PREVIEW_SANDBOX,
  LAB_PROTOCOL_VERSION,
  MAX_DETAIL_TEXT,
  MAX_MESSAGE_TEXT,
  MAX_SOURCE_LENGTH,
  toDiagnostic,
} from "./protocol";

const session = "0b6f4a2e-3c1d-4e5f-8a9b-0c1d2e3f4a5b";
const envelope = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, session, runId: 3 };
const init = { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "init", session, runId: 3, theme: "dark", file: { name: "App.tsx", code: "export default 1;" } };

describe("Coding Lab message protocol", () => {
  it("never grants the preview same-origin access", () => {
    expect(LAB_PREVIEW_SANDBOX).toBe("allow-scripts");
    expect(LAB_PREVIEW_SANDBOX).not.toMatch(/same-origin|top-navigation|popups|forms|modals/);
  });

  it("accepts only the exact hello shape", () => {
    expect(isHelloMessage({ channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "hello" })).toBe(true);
    for (const forged of [
      { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "hello", extra: 1 },
      { channel: "other", version: LAB_PROTOCOL_VERSION, type: "hello" },
      { channel: LAB_CHANNEL, version: 2, type: "hello" },
      { channel: LAB_CHANNEL, version: "1", type: "hello" },
      [LAB_CHANNEL, 1, "hello"],
      "hello",
      null,
      undefined,
      Object.assign(Object.create({ polluted: true }), { channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "hello" }),
    ]) expect(isHelloMessage(forged)).toBe(false);
  });

  it("validates init messages, including file name and size limits", () => {
    expect(isInitMessage(init)).toBe(true);
    expect(isInitMessage({ ...init, file: { name: "App.tsx", code: "" } })).toBe(true);
    for (const forged of [
      { ...init, session: "not-a-uuid" },
      { ...init, runId: 0 },
      { ...init, runId: 1.5 },
      { ...init, theme: "blue" },
      { ...init, file: { name: "../secret.tsx", code: "" } },
      { ...init, file: { name: "App.js", code: "" } },
      { ...init, file: { name: "App.tsx", code: "x".repeat(MAX_SOURCE_LENGTH + 1) } },
      { ...init, file: { name: "App.tsx", code: "", extra: true } },
      { ...init, admin: true },
    ]) expect(isInitMessage(forged)).toBe(false);
  });

  it("validates every preview event type and rejects unknown or malformed ones", () => {
    const diagnostic = { name: "TypeError", message: "x is not a function", line: 4 };
    expect(isPreviewMessage({ ...envelope, type: "rendered" })).toBe(true);
    expect(isPreviewMessage({ ...envelope, type: "heartbeat" })).toBe(true);
    expect(isPreviewMessage({ ...envelope, type: "compile-error", kind: "syntax", diagnostic })).toBe(true);
    expect(isPreviewMessage({ ...envelope, type: "runtime-error", kind: "render", diagnostic: { ...diagnostic, detail: "at App" } })).toBe(true);
    for (const forged of [
      { ...envelope, type: "navigate", url: "https://example.com" },
      { ...envelope, type: "rendered", html: "<img src=x onerror=alert(1)>" },
      { ...envelope, type: "compile-error", kind: "exploit", diagnostic },
      { ...envelope, type: "runtime-error", kind: "render", diagnostic: { ...diagnostic, message: "x".repeat(MAX_MESSAGE_TEXT + 1) } },
      { ...envelope, type: "runtime-error", kind: "render", diagnostic: { ...diagnostic, detail: "x".repeat(MAX_DETAIL_TEXT + 1) } },
      { ...envelope, type: "runtime-error", kind: "render", diagnostic: { ...diagnostic, line: -1 } },
      { ...envelope, type: "runtime-error", kind: "render", diagnostic: { name: "", message: "m" } },
      { ...envelope, type: "runtime-error", kind: "render", diagnostic: { ...diagnostic, html: "<b>" } },
      { ...envelope, session: undefined, type: "rendered" },
      { ...envelope, runId: "3", type: "rendered" },
      { type: "rendered" },
    ]) expect(isPreviewMessage(forged)).toBe(false);
  });

  it("validates parent port messages", () => {
    expect(isParentPortMessage({ ...envelope, type: "theme", theme: "light" })).toBe(true);
    expect(isParentPortMessage({ ...envelope, type: "theme", theme: "light", code: "alert(1)" })).toBe(false);
    expect(isParentPortMessage({ ...envelope, type: "run", theme: "light" })).toBe(false);
  });

  it("normalizes thrown values into bounded diagnostics", () => {
    expect(toDiagnostic({ name: 42, message: "" })).toEqual({ name: "Error", message: "An unknown error occurred." });
    expect(toDiagnostic({ name: "RangeError", message: "x".repeat(5000), line: 0, column: 2 }).message).toHaveLength(MAX_MESSAGE_TEXT);
    expect(toDiagnostic({ name: "E", message: "m", line: 0 })).not.toHaveProperty("line");
    expect(clampText("abcdef", 4)).toBe("abc…");
  });
});
