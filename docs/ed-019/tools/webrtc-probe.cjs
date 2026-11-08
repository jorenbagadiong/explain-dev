/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019 probe: WebRTC (STUN over UDP) from a sandboxed opaque-origin frame, with no mitigation, with the proposed CSP
// `webrtc 'block'` directive, and with the runtime's constructor removal. A UDP listener on 127.0.0.1:4933 is the ground truth.
// Usage: node docs/ed-019/tools/webrtc-probe.cjs
const http = require("node:http");
const dgram = require("node:dgram");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const packets = [];
const udp = dgram.createSocket("udp4");
udp.on("message", (message) => packets.push(message.length));
udp.bind(4933, "127.0.0.1");
const base = "default-src 'none'; script-src 'self'; sandbox allow-scripts";
const attack = `const out = {};
for (const n of ["RTCPeerConnection", "webkitRTCPeerConnection", "mozRTCPeerConnection", "RTCDataChannel"]) out[n] = typeof self[n];
try { const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:127.0.0.1:4933" }] }); pc.createDataChannel("x"); pc.createOffer().then((o) => pc.setLocalDescription(o)).catch((e) => (out.error = e.name)); out.created = true; } catch (e) { out.created = e.name; }
setTimeout(() => parent.postMessage(out, "*"), 2500);`;
// Same technique as disableWebRtc() in src/lab-runtime/main.ts.
const remove = `for (const n of ["RTCPeerConnection", "webkitRTCPeerConnection", "mozRTCPeerConnection"]) { try { delete self[n]; } catch {} try { Object.defineProperty(self, n, { value: undefined, configurable: false, writable: false }); } catch {} }`;
const app = http.createServer((request, response) => {
  const url = new URL(request.url, "http://x");
  const variant = url.searchParams.get("v");
  if (url.pathname === "/") { response.setHeader("content-type", "text/html"); return response.end(`<script>window.msgs=[];addEventListener("message",e=>msgs.push(e.data));</script><iframe sandbox="allow-scripts" src="/p?v=${variant}"></iframe>`); }
  if (url.pathname === "/p") { response.setHeader("content-security-policy", variant === "csp" ? `${base}; webrtc 'block'` : base); response.setHeader("content-type", "text/html"); return response.end(`<script src="/p.js?v=${variant}"></script>`); }
  if (url.pathname === "/p.js") { response.setHeader("content-type", "text/javascript"); return response.end((variant === "remove" ? remove : "") + attack); }
  response.statusCode = 404; response.end();
}).listen(4932, "127.0.0.1");

(async () => {
  for (const engine of ["chromium", "firefox"]) {
    const browser = await pw[engine].launch(engine === "chromium" ? { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
    for (const variant of ["none", "csp", "remove"]) {
      const before = packets.length;
      const page = await browser.newPage();
      const warnings = [];
      page.on("console", (message) => { if (/webrtc|Content-Security-Policy/i.test(message.text())) warnings.push(message.text().slice(0, 120)); });
      await page.goto(`http://localhost:4932/?v=${variant}`);
      await page.waitForTimeout(3500);
      console.log(JSON.stringify({ engine: `${engine} ${browser.version()}`, mitigation: variant, udpPacketsReceived: packets.length - before, result: await page.evaluate(() => window.msgs[0] ?? null), warnings }));
      await page.close();
    }
    await browser.close();
  }
  app.close();
  udp.close();
})();
