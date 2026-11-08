import type { NextConfig } from "next";

// Response headers for the Coding Lab preview only (public/lab-runtime/*). Application pages are unchanged.
// The CSP `sandbox` directive forces an opaque origin even if the preview URL is opened directly.
const LAB_PREVIEW_CSP = [
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
  "frame-ancestors 'self'",
  "sandbox allow-scripts",
].join("; ");

const LAB_PREVIEW_PERMISSIONS_POLICY = [
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

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/lab-runtime/:path*",
        headers: [
          { key: "Content-Security-Policy", value: LAB_PREVIEW_CSP },
          { key: "Permissions-Policy", value: LAB_PREVIEW_PERMISSIONS_POLICY },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
