// Minimal static server for the dedicated preview host in local development and tests.
// Production uses the same files and headers on a static host (see docs/ed-019/architecture.md).
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { dedicatedHostHeaders, previewSecurityHeaders } from "./policy.mjs";

const CONTENT_TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

/**
 * Serves only the files that exist in `root` at build time (no directory listing, no traversal, no redirects).
 * `onRequest` receives a record per request for network attribution in tests.
 */
export async function createPreviewHostServer({ root, frameAncestors, onRequest }) {
  const files = new Map();
  for (const name of await readdir(root)) {
    const extension = path.extname(name);
    if (CONTENT_TYPES[extension]) files.set(`/${name}`, { name, body: await readFile(path.join(root, name)), type: CONTENT_TYPES[extension] });
  }
  const security = previewSecurityHeaders(frameAncestors);

  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://preview-host.invalid");
    const file = files.get(url.pathname);
    onRequest?.({
      at: Date.now(),
      method: request.method,
      path: url.pathname,
      query: url.search,
      served: Boolean(file) && (request.method === "GET" || request.method === "HEAD"),
      userAgent: request.headers["user-agent"] ?? null,
      fetchDest: request.headers["sec-fetch-dest"] ?? null,
      fetchMode: request.headers["sec-fetch-mode"] ?? null,
      fetchSite: request.headers["sec-fetch-site"] ?? null,
      referer: request.headers.referer ?? null,
      origin: request.headers.origin ?? null,
    });
    for (const header of security) response.setHeader(header.key, header.value);
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
      response.end("Method not allowed");
      return;
    }
    if (!file) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      response.end("Not found");
      return;
    }
    for (const header of dedicatedHostHeaders(file.name)) response.setHeader(header.key, header.value);
    response.writeHead(200, { "Content-Type": file.type, "Content-Length": file.body.length });
    response.end(request.method === "HEAD" ? undefined : file.body);
  });
}
