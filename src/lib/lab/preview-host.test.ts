import { mkdtemp, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DEV_PARENT_ORIGINS,
  DEV_PREVIEW_ORIGIN,
  dedicatedHostHeaders,
  parseOrigin,
  parseOriginList,
  previewContentSecurityPolicy,
  previewSecurityHeaders,
  renderDedicatedPreviewHtml,
} from "../../../preview-host/policy.mjs";
import { createPreviewHostServer } from "../../../preview-host/server.mjs";
import { isIncompatibleHello, LAB_CHANNEL, LAB_PROTOCOL_VERSION } from "./protocol";
import { resolvePreviewTarget } from "./preview-target";

const RUNTIME = "runtime.0123456789abcdef.js";

describe("preview origin validation", () => {
  it.each(["https://lab.example.dev", "https://explain-dev-lab.vercel.app", "https://lab.example.dev:8443", "http://localhost:3000", "http://127.0.0.1:4100"])("accepts the exact origin %s", (origin) => {
    expect(parseOrigin(origin)).toBe(origin);
  });

  it.each([
    "http://lab.example.dev",
    "https://lab.example.dev/",
    "https://lab.example.dev/preview.html",
    "https://*.vercel.app",
    "https://user:pass@lab.example.dev",
    "https://lab.example.dev?x=1",
    "https://LAB.example.dev",
    "javascript:alert(1)",
    "null",
    "'self'",
    "",
  ])("rejects %s", (origin) => {
    expect(() => parseOrigin(origin)).toThrow();
  });

  it("parses and deduplicates comma-separated allowlists", () => {
    expect(parseOriginList(" https://a.example.dev , https://b.example.dev,https://a.example.dev ")).toEqual(["https://a.example.dev", "https://b.example.dev"]);
    expect(() => parseOriginList(" , ")).toThrow();
    expect(() => parseOriginList("https://a.example.dev, https://*.example.dev")).toThrow();
  });

  it("uses different sites for the development app and preview host", () => {
    expect(new URL(DEV_PARENT_ORIGINS[0]).hostname).toBe("localhost");
    expect(new URL(DEV_PREVIEW_ORIGIN).hostname).toBe("127.0.0.1");
  });
});

describe("preview host policy", () => {
  it("builds a sandboxing, network-denying CSP with exact frame ancestors", () => {
    const csp = previewContentSecurityPolicy(["https://explain-dev.example"]);
    expect(csp).toContain("sandbox allow-scripts");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("script-src 'self' blob:");
    expect(csp).toContain("frame-ancestors https://explain-dev.example");
    expect(csp).not.toMatch(/unsafe-eval|allow-same-origin|\*/);
    expect(() => previewContentSecurityPolicy([])).toThrow();
    expect(() => previewContentSecurityPolicy(["https://*.example.dev"])).toThrow();
  });

  it("caches only the content-hashed runtime as immutable", () => {
    expect(dedicatedHostHeaders(RUNTIME)).toContainEqual({ key: "Cache-Control", value: "public, max-age=31536000, immutable" });
    expect(dedicatedHostHeaders("preview.html")).toContainEqual({ key: "Cache-Control", value: "no-cache" });
    expect(dedicatedHostHeaders("preview.html")).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });

  it("rewrites the shared preview template for the host root", () => {
    const html = renderDedicatedPreviewHtml('<link rel="stylesheet" href="/lab-runtime/preview.css"><script src="/lab-runtime/runtime.js" defer></script>', RUNTIME);
    expect(html).toBe(`<link rel="stylesheet" href="/preview.css"><script src="/${RUNTIME}" defer></script>`);
    expect(() => renderDedicatedPreviewHtml("<script src=\"/lab-runtime/other.js\"></script>", RUNTIME)).toThrow();
    expect(() => renderDedicatedPreviewHtml("", "runtime.js")).toThrow();
  });
});

describe("local preview host server", () => {
  let root = "";
  let base = "";
  const requests: { path: string; served: boolean; method?: string }[] = [];
  let close = () => {};

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "preview-host-"));
    await writeFile(path.join(root, "preview.html"), "<!doctype html><title>t</title>");
    await writeFile(path.join(root, "preview.css"), "body{}");
    await writeFile(path.join(root, RUNTIME), "void 0;");
    await writeFile(path.join(root, "host.json"), "{}");
    const server = await createPreviewHostServer({ root, frameAncestors: ["http://localhost:3118"], onRequest: (record: { path: string; served: boolean; method?: string }) => requests.push(record) });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    close = () => server.close();
  });
  afterAll(async () => {
    close();
    await rm(root, { recursive: true, force: true });
  });

  it("serves the preview document with the security headers", async () => {
    const response = await fetch(`${base}/preview.html`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("content-security-policy")).toBe(previewSecurityHeaders(["http://localhost:3118"])[0].value);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect((await fetch(`${base}/${RUNTIME}`)).headers.get("cache-control")).toContain("immutable");
  });

  it.each(["/", "/host.json", "/../package.json", "/%2e%2e/package.json", "/preview.html/", "/PREVIEW.HTML", "/favicon.ico"])("returns 404 for %s without redirecting", async (pathname) => {
    const response = await fetch(`${base}${pathname}`, { redirect: "manual" });
    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-security-policy")).toContain("sandbox allow-scripts");
  });

  it("rejects methods other than GET and HEAD and records every request", async () => {
    expect((await fetch(`${base}/preview.html`, { method: "POST", body: "x" })).status).toBe(405);
    expect((await fetch(`${base}/preview.html`, { method: "HEAD" })).status).toBe(200);
    expect(requests.some((record) => record.path === "/preview.html" && record.served)).toBe(true);
    expect(requests.some((record) => record.method === "POST" && !record.served)).toBe(true);
  });
});

describe("preview target selection", () => {
  it("falls back to the same-origin preview when no host is configured", () => {
    expect(resolvePreviewTarget(undefined)).toEqual({ mode: "same-origin", origin: null, url: "/lab-runtime/preview.html" });
    expect(resolvePreviewTarget("  ")).toEqual({ mode: "same-origin", origin: null, url: "/lab-runtime/preview.html" });
  });

  it("uses the dedicated host's preview document when configured", () => {
    expect(resolvePreviewTarget("https://lab.example.dev")).toEqual({ mode: "dedicated", origin: "https://lab.example.dev", url: "https://lab.example.dev/preview.html" });
    expect(() => resolvePreviewTarget("https://lab.example.dev/path")).toThrow();
  });
});

describe("protocol version skew", () => {
  it("recognizes a hello from a different protocol version, but not the current one or junk", () => {
    expect(isIncompatibleHello({ channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION - 1, type: "hello" })).toBe(true);
    expect(isIncompatibleHello({ channel: LAB_CHANNEL, version: LAB_PROTOCOL_VERSION, type: "hello" })).toBe(false);
    expect(isIncompatibleHello({ channel: "other", version: 1, type: "hello" })).toBe(false);
    expect(isIncompatibleHello({ channel: LAB_CHANNEL, version: "1", type: "hello" })).toBe(false);
  });
});

describe("dedicated-mode application headers", () => {
  it("restricts Practice framing to the configured preview host and keeps the fallback headers", async () => {
    vi.stubEnv("NEXT_PUBLIC_LAB_PREVIEW_ORIGIN", "https://lab.example.dev");
    vi.resetModules();
    const { default: config } = await import("../../../next.config");
    const rules = await config.headers!();
    expect(rules.map((rule) => rule.source)).toEqual(["/lab-runtime/:path*", "/practice/:path*"]);
    expect(rules[1].headers).toEqual([{ key: "Content-Security-Policy", value: "frame-src https://lab.example.dev" }]);
    vi.unstubAllEnvs();
  });

  it("fails the build for an invalid preview origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_LAB_PREVIEW_ORIGIN", "https://lab.example.dev/preview.html");
    vi.resetModules();
    await expect(import("../../../next.config")).rejects.toThrow(/NEXT_PUBLIC_LAB_PREVIEW_ORIGIN/);
    vi.unstubAllEnvs();
  });
});
