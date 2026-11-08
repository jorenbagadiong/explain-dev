// Single source of truth for the Coding Lab preview's security policy.
// Used by next.config.ts (same-origin fallback), the dedicated preview-host build, the local preview-host server and tests.
// Plain ESM so Node scripts, Next.js config and Vitest can all import it without a build step.

/** Default local development origins. `localhost` (app) and `127.0.0.1` (preview host) are different sites. */
export const DEV_PARENT_ORIGINS = Object.freeze(["http://localhost:3000"]);
export const DEV_PREVIEW_HOST = Object.freeze({ hostname: "127.0.0.1", port: 4100 });
export const DEV_PREVIEW_ORIGIN = `http://${DEV_PREVIEW_HOST.hostname}:${DEV_PREVIEW_HOST.port}`;

export const PREVIEW_DOCUMENT = "preview.html";
export const PREVIEW_STYLESHEET = "preview.css";

const HTTPS_ORIGIN = /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?::\d{1,5})?$/;
const LOOPBACK_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/;

/**
 * Validates one exact origin: `https://host[:port]`, or plain http only for loopback development.
 * Paths, wildcards, credentials, query strings and trailing slashes are rejected.
 */
export function parseOrigin(value, name = "origin") {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} must be a non-empty origin`);
  const origin = value.trim();
  if (!(HTTPS_ORIGIN.test(origin) || LOOPBACK_ORIGIN.test(origin))) {
    throw new Error(`${name} must be an exact https:// origin (or http://localhost / http://127.0.0.1 for development): ${JSON.stringify(origin)}`);
  }
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(`${name} is not a valid URL: ${JSON.stringify(origin)}`);
  }
  if (parsed.origin !== origin) throw new Error(`${name} must be written exactly as its origin (${parsed.origin}): ${JSON.stringify(origin)}`);
  return origin;
}

/** Parses a comma-separated allowlist of exact origins (deduplicated, order preserved). */
export function parseOriginList(value, name = "origins") {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} must list at least one origin`);
  const origins = value.split(",").map((entry) => entry.trim()).filter(Boolean).map((entry) => parseOrigin(entry, name));
  if (!origins.length) throw new Error(`${name} must list at least one origin`);
  return [...new Set(origins)];
}

/**
 * The preview document's Content-Security-Policy. `frameAncestors` are CSP sources: exact origins or "'self'".
 * The `sandbox` directive forces an opaque origin even if the document is opened directly.
 */
export function previewContentSecurityPolicy(frameAncestors) {
  if (!Array.isArray(frameAncestors) || !frameAncestors.length) throw new Error("frameAncestors must not be empty");
  for (const source of frameAncestors) if (source !== "'self'") parseOrigin(source, "frame-ancestors source");
  return [
    "default-src 'none'",
    "script-src 'self' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src data: blob:",
    "connect-src 'none'",
    "font-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "manifest-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    `frame-ancestors ${frameAncestors.join(" ")}`,
    "sandbox allow-scripts",
  ].join("; ");
}

export const PREVIEW_PERMISSIONS_POLICY = [
  "accelerometer=()",
  "camera=()",
  "display-capture=()",
  "fullscreen=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

/** Security headers sent with every preview file. */
export function previewSecurityHeaders(frameAncestors) {
  return [
    { key: "Content-Security-Policy", value: previewContentSecurityPolicy(frameAncestors) },
    { key: "Permissions-Policy", value: PREVIEW_PERMISSIONS_POLICY },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
  ];
}

/** Extra headers for the dedicated host only. */
export function dedicatedHostHeaders(file) {
  const headers = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
  if (/^runtime\.[0-9a-f]{16}\.js$/.test(file)) headers.push({ key: "Cache-Control", value: "public, max-age=31536000, immutable" });
  else headers.push({ key: "Cache-Control", value: "no-cache" });
  return headers;
}

/** Rewrites the shared preview.html template for the dedicated host's root layout. */
export function renderDedicatedPreviewHtml(template, runtimeFile) {
  if (!/^runtime\.[0-9a-f]{16}\.js$/.test(runtimeFile)) throw new Error(`Unexpected runtime file name: ${runtimeFile}`);
  const html = template
    .replace('href="/lab-runtime/preview.css"', `href="/${PREVIEW_STYLESHEET}"`)
    .replace('src="/lab-runtime/runtime.js"', `src="/${runtimeFile}"`);
  if (html.includes("/lab-runtime/")) throw new Error("preview.html template still references /lab-runtime/");
  return html;
}
