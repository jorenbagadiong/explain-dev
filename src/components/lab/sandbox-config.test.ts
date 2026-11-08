import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";
import { LAB_PREVIEW_PATH } from "@/lib/lab/protocol";
import { createSession, PreviewFrame } from "./preview-frame";

const root = process.cwd();

async function previewHeaders() {
  const rules = await nextConfig.headers!();
  return { rules, headers: Object.fromEntries(rules[0].headers.map((header) => [header.key, header.value])) };
}

describe("Coding Lab sandbox configuration", () => {
  it("scopes security headers to the preview path only", async () => {
    const { rules } = await previewHeaders();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/lab-runtime/:path*");
    expect(LAB_PREVIEW_PATH.startsWith("/lab-runtime/")).toBe(true);
  });

  it("sends a CSP that sandboxes, denies network access and forbids eval", async () => {
    const { headers } = await previewHeaders();
    const directives = Object.fromEntries(headers["Content-Security-Policy"].split(";").map((part: string) => part.trim().split(/\s+/)).map(([name, ...values]: string[]) => [name, values.join(" ")]));
    expect(directives).toMatchObject({
      "default-src": "'none'",
      "script-src": "'self' blob:",
      "connect-src": "'none'",
      "img-src": "data: blob:",
      "font-src": "'none'",
      "media-src": "'none'",
      "object-src": "'none'",
      "frame-src": "'none'",
      "worker-src": "'none'",
      "form-action": "'none'",
      "base-uri": "'none'",
      "frame-ancestors": "'self'",
      sandbox: "allow-scripts",
    });
    expect(headers["Content-Security-Policy"]).not.toMatch(/unsafe-eval|allow-same-origin|\*/);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["Permissions-Policy"]).toMatch(/camera=\(\).*microphone=\(\)/);
  });

  it("serves a preview document with no inline script", () => {
    const html = readFileSync(path.join(root, "public/lab-runtime/preview.html"), "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    expect(scripts).toHaveLength(1);
    expect(scripts[0][1]).toContain('src="/lab-runtime/runtime.js"');
    expect(scripts[0][2].trim()).toBe("");
    expect(html).not.toMatch(/\son[a-z]+=/i);
  });

  it("renders the preview iframe with only allow-scripts", () => {
    const html = renderToStaticMarkup(createElement(PreviewFrame, { runId: 1, file: { name: "App.tsx", code: "" }, theme: "dark", title: "Preview of App.tsx", onEvent: () => {} }));
    const iframe = html.match(/<iframe\b([^>]*)>/)![1];
    expect(iframe).toContain('sandbox="allow-scripts"');
    expect(iframe).toContain(`src="${LAB_PREVIEW_PATH}"`);
    expect(iframe).toContain('referrerPolicy="no-referrer"');
    expect(iframe).toContain('title="Preview of App.tsx"');
    expect(iframe).not.toMatch(/allow-same-origin|allow="/);
  });

  it("creates unguessable version 4 session capabilities", () => {
    const sessions = new Set(Array.from({ length: 50 }, () => createSession()));
    expect(sessions.size).toBe(50);
    for (const session of sessions) expect(session).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
