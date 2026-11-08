/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019 Phase 5 probe: which in-preview controls can stop a sandboxed, opaque-origin frame from navigating itself,
// and does the embedding page's CSP frame-src refuse those navigations before a request is sent?
// Self-contained (own servers on 127.0.0.1:4921-4923). Usage: node docs/ed-019/tools/navigation-controls-probe.cjs
const http = require("node:http");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const CANARY = "http://127.0.0.1:4922";
const PREVIEW_CSP = "default-src 'none'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; sandbox allow-scripts";
const hits = [];
const attacks = {
  href: `location.href = "${CANARY}/?v=href"`,
  assign: `location.assign("${CANARY}/?v=assign")`,
  replace: `location.replace("${CANARY}/?v=replace")`,
  navigationApi: `navigation.navigate("${CANARY}/?v=navigation-api")`,
  metaRefresh: `{ const m = document.createElement("meta"); m.httpEquiv = "refresh"; m.content = "0;url=${CANARY}/?v=meta"; document.head.append(m); }`,
  metaRefreshDelayed: `{ const m = document.createElement("meta"); m.httpEquiv = "refresh"; m.content = "1;url=${CANARY}/?v=meta-delayed"; document.head.append(m); }`,
  anchor: `{ const a = document.createElement("a"); a.href = "${CANARY}/?v=anchor"; document.body.append(a); a.click(); }`,
  redirect: `location.href = "${CANARY}/redirect?v=redirect"`,
};
// In-preview controls under test (installed before the attack runs).
const controls = {
  none: "",
  navigationApiCancel: `navigation.addEventListener("navigate", (e) => { info.navigateEvents++; if (!e.destination.sameDocument) e.preventDefault(); });`,
  metaRemoval: `new MutationObserver((records) => { for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1 && n.localName === "meta" && (n.getAttribute("http-equiv") || "").toLowerCase() === "refresh") { n.remove(); info.metaRemoved++; } }).observe(document, { childList: true, subtree: true });`,
  clickGuard: `addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[href]"); if (a) { e.preventDefault(); info.clicksBlocked++; } }, true);`,
};

const canary = http.createServer((request, response) => {
  hits.push(request.url);
  if (request.url.startsWith("/redirect")) { response.writeHead(302, { Location: `${CANARY}/after-redirect` }); return response.end(); }
  response.end("canary");
}).listen(4922, "127.0.0.1");

const app = http.createServer((request, response) => {
  const url = new URL(request.url, "http://x");
  const attack = url.searchParams.get("attack");
  const control = url.searchParams.get("control");
  const frameSrc = url.searchParams.get("frameSrc");
  if (url.pathname === "/") {
    // The embedding page optionally restricts frames to the preview's own origin (ED-019 Practice-page header).
    if (frameSrc === "1") response.setHeader("content-security-policy", "frame-src http://127.0.0.1:4923");
    response.setHeader("content-type", "text/html");
    return response.end(`<script>window.loads=0;window.violations=0;window.msgs=[];addEventListener("message",e=>msgs.push(e.data));document.addEventListener("securitypolicyviolation",()=>violations++);</script><iframe sandbox="allow-scripts" src="http://127.0.0.1:4923/preview?attack=${attack}&control=${control}" onload="loads++"></iframe>`);
  }
  response.statusCode = 404; response.end();
}).listen(4921, "127.0.0.1");

const host = http.createServer((request, response) => {
  const url = new URL(request.url, "http://x");
  if (url.pathname === "/preview") { response.setHeader("content-security-policy", PREVIEW_CSP); response.setHeader("content-type", "text/html"); return response.end(`<script src="/p.js${url.search}"></script>`); }
  if (url.pathname === "/p.js") {
    response.setHeader("content-type", "text/javascript");
    return response.end(`const info = { origin: self.origin, navigateEvents: 0, metaRemoved: 0, clicksBlocked: 0 };
${controls[url.searchParams.get("control")]}
setTimeout(() => { try { ${attacks[url.searchParams.get("attack")]}; } catch (error) { info.error = error.name; } setTimeout(() => parent.postMessage(info, "*"), 1800); }, 50);`);
  }
  response.statusCode = 404; response.end();
}).listen(4923, "127.0.0.1");

(async () => {
  const rows = [];
  for (const engine of ["chromium", "firefox"]) {
    const browser = await pw[engine].launch(engine === "chromium" ? { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
    for (const frameSrc of ["0", "1"]) for (const [control, attackNames] of [["none", Object.keys(attacks)], ["navigationApiCancel", ["href", "assign", "replace", "navigationApi"]], ["metaRemoval", ["metaRefresh", "metaRefreshDelayed"]], ["clickGuard", ["anchor"]]]) {
      // With frame-src the preview survives, so it can report whether a cancelling navigate listener ever fired.
      if (frameSrc === "1" && control !== "none" && control !== "navigationApiCancel") continue;
      for (const attack of attackNames) {
        const page = await browser.newPage();
        const before = hits.length;
        await page.goto(`http://localhost:4921/?attack=${attack}&control=${control}&frameSrc=${frameSrc}`);
        await page.waitForTimeout(2600);
        const state = await page.evaluate(() => ({ loads: window.loads, violations: window.violations, info: window.msgs[0] ?? null }));
        rows.push({ engine: `${engine} ${browser.version()}`, parentFrameSrc: frameSrc === "1", control, attack, requestsReachedCanary: hits.slice(before), frameLoads: state.loads, parentCspViolations: state.violations, previewSurvivedAndReported: Boolean(state.info), info: state.info });
        await page.close();
      }
    }
    await browser.close();
  }
  for (const row of rows) console.log(JSON.stringify(row));
  app.close(); host.close(); canary.close();
})();
