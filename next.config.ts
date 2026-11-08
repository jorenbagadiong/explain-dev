import type { NextConfig } from "next";

import { parseOrigin, previewSecurityHeaders } from "./preview-host/policy.mjs";

// Coding Lab preview hosting (docs/ed-019/architecture.md):
// - NEXT_PUBLIC_LAB_PREVIEW_ORIGIN set   → the preview loads from that dedicated host (a separate site).
// - NEXT_PUBLIC_LAB_PREVIEW_ORIGIN unset → same-origin fallback: this app serves /lab-runtime/ (ED-018 behaviour).
// Application pages keep their existing headers; only preview files and, in dedicated mode, Practice routes get headers.
function resolvePreviewOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_LAB_PREVIEW_ORIGIN;
  if (!value) return null;
  return parseOrigin(value, "NEXT_PUBLIC_LAB_PREVIEW_ORIGIN");
}

const previewOrigin = resolvePreviewOrigin();
if (!previewOrigin && process.env.VERCEL_ENV === "production") {
  console.warn("[explain-dev] NEXT_PUBLIC_LAB_PREVIEW_ORIGIN is not set: the Coding Lab uses the same-origin fallback preview.");
}

const nextConfig: NextConfig = {
  async headers() {
    const rules = [
      // Same-origin fallback preview. The CSP `sandbox` directive forces an opaque origin even if opened directly.
      { source: "/lab-runtime/:path*", headers: previewSecurityHeaders(["'self'"]) },
    ];
    // Practice pages may frame only the preview document's origin. frame-src also governs navigations the preview starts
    // itself, so location.assign/replace/href, meta refresh and redirects to other sites are refused before any request.
    rules.push({ source: "/practice/:path*", headers: [{ key: "Content-Security-Policy", value: `frame-src ${previewOrigin ?? "'self'"}` }] });
    return rules;
  },
};

export default nextConfig;
