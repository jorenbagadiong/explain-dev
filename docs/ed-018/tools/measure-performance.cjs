/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018 performance measurements. Usage: BASE=http://127.0.0.1:3118 LABEL=ed-018 node docs/ed-018/tools/measure-performance.cjs
// Run once against a pre-ED-018 baseline build and once against the ED-018 build.
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const base = process.env.BASE || "http://127.0.0.1:3118";
const label = process.env.LABEL || "ed-018";
const routes = ["/", "/frontend/react", "/frontend/react/use-state", "/practice", "/practice/react/use-state-counter"];
const MARKERS = { codemirror: "cm-scroller", sucrase: "Error transforming", acorn: "Unexpected character", labRuntime: "explain-dev-lab" };
const median = (values) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? +sorted[Math.floor(sorted.length / 2)].toFixed(1) : null; };

async function scriptsFor(browser, route, waitForLab) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await page.goto(base + route, { waitUntil: "networkidle" });
  if (response.status() !== 200) { await context.close(); return { route, status: response.status() }; }
  if (waitForLab) await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "ready", null, { timeout: 20000 });
  await page.waitForTimeout(300);
  const parent = await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => entry.initiatorType === "script" || entry.name.endsWith(".js")).map((entry) => ({ url: entry.name, encoded: entry.encodedBodySize, decoded: entry.decodedBodySize })));
  const frame = page.frames().find((candidate) => candidate.url().includes("/lab-runtime/preview.html"));
  let previewRuntime = null;
  if (frame) {
    // The opaque-origin frame cannot report sizes for the runtime; measure it directly from the server.
    // node:http does not decompress, so this is the size actually sent over the wire.
    previewRuntime = await new Promise((resolve, reject) => {
      require("node:http").get(base + "/lab-runtime/runtime.js", { headers: { "accept-encoding": "gzip" } }, (response) => {
        let transferredBytes = 0;
        response.on("data", (chunk) => { transferredBytes += chunk.length; });
        response.on("end", () => resolve({ url: "/lab-runtime/runtime.js", transferredBytes, contentEncoding: response.headers["content-encoding"] ?? null, uncompressedBytes: fs.statSync("public/lab-runtime/runtime.js").size }));
      }).on("error", reject);
    });
  }
  const contents = await Promise.all(parent.map(async (entry) => (await fetch(entry.url)).text()));
  const found = Object.fromEntries(Object.entries(MARKERS).map(([name, marker]) => [name, contents.some((text) => text.includes(marker))]));
  await context.close();
  return {
    route,
    scripts: parent.length,
    encodedBytes: parent.reduce((sum, entry) => sum + entry.encoded, 0),
    decodedBytes: parent.reduce((sum, entry) => sum + entry.decoded, 0),
    parentBundlesContain: found,
    previewRuntime,
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" });
  const result = { label, base, engine: browser.version(), measuredAt: new Date().toISOString(), routes: [], lab: null };
  try {
    for (const route of routes) result.routes.push(await scriptsFor(browser, route, route.startsWith("/practice/react/")));
    const challenge = result.routes.find((entry) => entry.route === "/practice/react/use-state-counter");
    if (challenge?.scripts) {
      const samples = { editorInitMs: [], previewReadyMs: [], previewRenderMs: [], workspaceVisibleMs: [] };
      for (let index = 0; index < 5; index++) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        const started = Date.now();
        await page.goto(base + "/practice/react/use-state-counter");
        await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "ready", null, { timeout: 20000 });
        samples.workspaceVisibleMs.push(Date.now() - started);
        const marks = await page.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((mark) => mark.name.startsWith("explain-dev-lab:")).map((mark) => [mark.name.split(":")[1], mark.detail?.ms])));
        samples.editorInitMs.push(marks["editor-init"]);
        samples.previewReadyMs.push(marks["preview-ready"]);
        samples.previewRenderMs.push(marks["preview-render"]);
        await context.close();
      }
      result.lab = { samples, medians: Object.fromEntries(Object.entries(samples).map(([name, values]) => [name, median(values)])) };
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(`docs/ed-018/performance-${label}.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result.routes.map(({ route, scripts, encodedBytes, decodedBytes, parentBundlesContain }) => ({ route, scripts, encodedBytes, decodedBytes, parentBundlesContain })), null, 1));
  console.log(JSON.stringify(result.lab?.medians ?? null));
})();
