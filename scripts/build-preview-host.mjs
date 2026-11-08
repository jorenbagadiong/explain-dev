// Builds the dedicated Coding Lab preview host: preview-host/dist/{preview.html, preview.css, runtime.<hash>.js}.
// On Vercel (VERCEL=1) it also writes preview-host/.vercel/output (Build Output API v3) with the same headers.
//
// Environment:
//   LAB_PARENT_ORIGINS  Comma-separated exact app origins allowed to embed and talk to the preview (required unless --dev).
// Usage:
//   node scripts/build-preview-host.mjs          # production (LAB_PARENT_ORIGINS required)
//   node scripts/build-preview-host.mjs --dev    # local development (defaults to http://localhost:3000)
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

import { DEV_PARENT_ORIGINS, PREVIEW_DOCUMENT, PREVIEW_STYLESHEET, dedicatedHostHeaders, parseOriginList, previewSecurityHeaders, renderDedicatedPreviewHtml } from "../preview-host/policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hostDir = path.join(root, "preview-host");
const distDir = path.join(hostDir, "dist");
const isDev = process.argv.includes("--dev");

const configured = process.env.LAB_PARENT_ORIGINS;
if (!configured && !isDev) {
  console.error("LAB_PARENT_ORIGINS is required (for example https://explain-dev.example). Use --dev for local development.");
  process.exit(1);
}
const parentOrigins = configured ? parseOriginList(configured, "LAB_PARENT_ORIGINS") : [...DEV_PARENT_ORIGINS];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
const staging = path.join(hostDir, ".build");
await rm(staging, { recursive: true, force: true });

await build({
  configFile: path.join(root, "vite.lab-runtime.config.mts"),
  logLevel: "warn",
  define: { __LAB_PARENT_ORIGINS__: JSON.stringify(parentOrigins) },
  build: { outDir: staging, emptyOutDir: true },
});

const runtime = await readFile(path.join(staging, "runtime.js"));
const runtimeFile = `runtime.${createHash("sha256").update(runtime).digest("hex").slice(0, 16)}.js`;
await writeFile(path.join(distDir, runtimeFile), runtime);
await rm(staging, { recursive: true, force: true });
await cp(path.join(root, "public/lab-runtime/preview.css"), path.join(distDir, PREVIEW_STYLESHEET));
const template = await readFile(path.join(root, "public/lab-runtime/preview.html"), "utf8");
await writeFile(path.join(distDir, PREVIEW_DOCUMENT), renderDedicatedPreviewHtml(template, runtimeFile));
await writeFile(path.join(distDir, "host.json"), JSON.stringify({ parentOrigins, runtimeFile, builtAt: new Date().toISOString(), mode: isDev ? "development" : "production" }, null, 2) + "\n");

if (process.env.VERCEL) {
  // Vercel Build Output API v3: static files plus header routes computed from the same policy.
  const output = path.join(hostDir, ".vercel/output");
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, "static"), { recursive: true });
  for (const file of [PREVIEW_DOCUMENT, PREVIEW_STYLESHEET, runtimeFile]) await cp(path.join(distDir, file), path.join(output, "static", file));
  const toObject = (headers) => Object.fromEntries(headers.map((header) => [header.key, header.value]));
  const routes = [PREVIEW_DOCUMENT, PREVIEW_STYLESHEET, runtimeFile].map((file) => ({
    src: `^/${file.replace(/\./g, "\\.")}$`,
    headers: toObject([...previewSecurityHeaders(parentOrigins), ...dedicatedHostHeaders(file)]),
    continue: true,
  }));
  routes.push({ handle: "filesystem" });
  routes.push({ src: "^/.*$", status: 404, headers: toObject(previewSecurityHeaders(parentOrigins)) });
  await writeFile(path.join(output, "config.json"), JSON.stringify({ version: 3, routes }, null, 2) + "\n");
}

console.log(`Preview host built: ${path.relative(root, distDir)} (${runtimeFile}); parent origins: ${parentOrigins.join(", ")}`);
