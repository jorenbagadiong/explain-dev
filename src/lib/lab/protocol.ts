// Message protocol between the Coding Lab (parent, trusted) and the preview runtime (sandboxed, untrusted).
//
// Handshake (window.postMessage, one message each way per preview frame):
//   preview → parent  { channel, version, type: "hello" }
//   parent  → preview { channel, version, type: "init", session, runId, theme, file } + one transferred MessagePort
// After the handshake, all traffic uses the private MessagePort and must carry the same session and runId.
// Everything received from the preview is untrusted: it is schema-checked, size-capped and only ever shown as text.

export const LAB_CHANNEL = "explain-dev-lab";
// Version 2 (ED-019): navigation diagnostics; the app and a dedicated preview host may be deployed separately.
export const LAB_PROTOCOL_VERSION = 2;
export const LAB_PREVIEW_PATH = "/lab-runtime/preview.html";
/** The only sandbox token the preview frame receives. Never add allow-same-origin. */
export const LAB_PREVIEW_SANDBOX = "allow-scripts";

export const MAX_SOURCE_LENGTH = 50_000;
export const MAX_MESSAGE_TEXT = 2_000;
export const MAX_DETAIL_TEXT = 4_000;
export const MAX_FILE_NAME = 64;

export type LabTheme = "dark" | "light";

export interface LabFile {
  name: string;
  code: string;
}

export interface HelloMessage {
  channel: typeof LAB_CHANNEL;
  version: typeof LAB_PROTOCOL_VERSION;
  type: "hello";
}

export interface InitMessage {
  channel: typeof LAB_CHANNEL;
  version: typeof LAB_PROTOCOL_VERSION;
  type: "init";
  session: string;
  runId: number;
  theme: LabTheme;
  file: LabFile;
}

export type CompileErrorKind = "syntax" | "unsupported-import" | "unsupported-syntax" | "missing-export" | "too-large";
export type RuntimeErrorKind = "module" | "render" | "event" | "promise" | "loop-guard" | "navigation";

export interface LabDiagnostic {
  name: string;
  message: string;
  line?: number;
  column?: number;
  /** Additional plain text such as a React component stack. */
  detail?: string;
}

interface PortEnvelope {
  channel: typeof LAB_CHANNEL;
  version: typeof LAB_PROTOCOL_VERSION;
  session: string;
  runId: number;
}

export type PreviewEvent =
  | { type: "rendered" }
  | { type: "heartbeat" }
  | { type: "compile-error"; kind: CompileErrorKind; diagnostic: LabDiagnostic }
  | { type: "runtime-error"; kind: RuntimeErrorKind; diagnostic: LabDiagnostic };

export type PreviewMessage = PortEnvelope & PreviewEvent;
export type ParentPortMessage = PortEnvelope & { type: "theme"; theme: LabTheme };

const COMPILE_KINDS: readonly CompileErrorKind[] = ["syntax", "unsupported-import", "unsupported-syntax", "missing-export", "too-large"];
const RUNTIME_KINDS: readonly RuntimeErrorKind[] = ["module", "render", "event", "promise", "loop-guard", "navigation"];
const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: UnknownRecord, required: readonly string[], optional: readonly string[] = []): boolean {
  const keys = Object.keys(value);
  return required.every((key) => keys.includes(key)) && keys.every((key) => required.includes(key) || optional.includes(key));
}

function isText(value: unknown, max: number, allowEmpty = false): value is string {
  return typeof value === "string" && value.length <= max && (allowEmpty || value.length > 0);
}

function isPositiveInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= max;
}

export function isSession(value: unknown): value is string {
  return typeof value === "string" && SESSION_PATTERN.test(value);
}

export function isTheme(value: unknown): value is LabTheme {
  return value === "dark" || value === "light";
}

function isEnvelope(value: UnknownRecord): boolean {
  return value.channel === LAB_CHANNEL && value.version === LAB_PROTOCOL_VERSION && isSession(value.session) && isPositiveInteger(value.runId);
}

export function isHelloMessage(value: unknown): value is HelloMessage {
  return isRecord(value) && hasExactKeys(value, ["channel", "version", "type"]) && value.channel === LAB_CHANNEL && value.version === LAB_PROTOCOL_VERSION && value.type === "hello";
}

/** A hello from a preview built for a different protocol version (app and preview host out of sync). */
export function isIncompatibleHello(value: unknown): boolean {
  return isRecord(value) && value.channel === LAB_CHANNEL && value.type === "hello" && value.version !== LAB_PROTOCOL_VERSION && Number.isInteger(value.version);
}

export function isInitMessage(value: unknown): value is InitMessage {
  if (!isRecord(value) || !hasExactKeys(value, ["channel", "version", "type", "session", "runId", "theme", "file"])) return false;
  if (value.type !== "init" || !isEnvelope(value) || !isTheme(value.theme)) return false;
  const file = value.file;
  return isRecord(file) && hasExactKeys(file, ["name", "code"]) && isText(file.name, MAX_FILE_NAME) && /^[\w-]+\.tsx$/.test(file.name) && isText(file.code, MAX_SOURCE_LENGTH, true);
}

export function isParentPortMessage(value: unknown): value is ParentPortMessage {
  return isRecord(value) && hasExactKeys(value, ["channel", "version", "session", "runId", "type", "theme"]) && isEnvelope(value) && value.type === "theme" && isTheme(value.theme);
}

function isDiagnostic(value: unknown): value is LabDiagnostic {
  if (!isRecord(value) || !hasExactKeys(value, ["name", "message"], ["line", "column", "detail"])) return false;
  return isText(value.name, 80)
    && isText(value.message, MAX_MESSAGE_TEXT)
    && (value.line === undefined || isPositiveInteger(value.line, 1_000_000))
    && (value.column === undefined || isPositiveInteger(value.column, 1_000_000))
    && (value.detail === undefined || isText(value.detail, MAX_DETAIL_TEXT, true));
}

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  if (!isRecord(value) || !isEnvelope(value)) return false;
  const envelope = ["channel", "version", "session", "runId", "type"];
  switch (value.type) {
    case "rendered":
    case "heartbeat":
      return hasExactKeys(value, envelope);
    case "compile-error":
      return hasExactKeys(value, [...envelope, "kind", "diagnostic"]) && COMPILE_KINDS.includes(value.kind as CompileErrorKind) && isDiagnostic(value.diagnostic);
    case "runtime-error":
      return hasExactKeys(value, [...envelope, "kind", "diagnostic"]) && RUNTIME_KINDS.includes(value.kind as RuntimeErrorKind) && isDiagnostic(value.diagnostic);
    default:
      return false;
  }
}

/** Truncates untrusted or long text before it is placed in a message. */
export function clampText(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export function toDiagnostic(input: { name?: unknown; message?: unknown; line?: number; column?: number; detail?: string }): LabDiagnostic {
  const name = typeof input.name === "string" && input.name.trim() ? clampText(input.name.trim(), 80) : "Error";
  const message = typeof input.message === "string" && input.message.trim() ? clampText(input.message, MAX_MESSAGE_TEXT) : "An unknown error occurred.";
  const diagnostic: LabDiagnostic = { name, message };
  if (input.line !== undefined && isPositiveInteger(input.line, 1_000_000)) diagnostic.line = input.line;
  if (input.column !== undefined && isPositiveInteger(input.column, 1_000_000)) diagnostic.column = input.column;
  if (input.detail) diagnostic.detail = clampText(input.detail, MAX_DETAIL_TEXT);
  return diagnostic;
}
