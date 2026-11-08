/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019 performance: ED-018 (same-origin) vs ED-019 fallback vs ED-019 dedicated preview host, per engine.
// Every metric reports all samples plus min / median / max; nothing is averaged away.
// Usage: ENGINE=chromium LABEL=ed019-dedicated BASE=http://localhost:3118 node docs/ed-019/tools/measure-performance.cjs
// (start the app, and for dedicated mode the preview host on :4100, first)
const fs = require("node:fs");
const http = require("node:http");
const zlib = require("node:zlib");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

const ENGINE = process.env.ENGINE || "chromium";
const LABEL = process.env.LABEL || "ed019";
const BASE = process.env.BASE || "http://localhost:3118";
const ROUTE = "/practice/react/use-state-counter";
const COLD_SAMPLES = 5;
const RUN_SAMPLES = 10;
const MEMORY_RUNS = 20;

const stats = (values) => {
  const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
  if (!numbers.length) return { samples: values, min: null, median: null, max: null };
  return { samples: values.map((value) => (typeof value === "number" ? +value.toFixed(1) : value)), min: +numbers[0].toFixed(1), median: +numbers[Math.floor(numbers.length / 2)].toFixed(1), max: +numbers.at(-1).toFixed(1) };
};

const fetchBytes = (url) => new Promise((resolve, reject) => {
  http.get(url, { headers: { "accept-encoding": "gzip" } }, (response) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => {
      const body = Buffer.concat(chunks);
      const encoding = response.headers["content-encoding"] ?? null;
      const raw = encoding === "gzip" ? zlib.gunzipSync(body) : body;
      resolve({ url, status: response.statusCode, transferredBytes: body.length, contentEncoding: encoding, uncompressedBytes: raw.length, gzipBytes: zlib.gzipSync(raw, { level: 9 }).length, cacheControl: response.headers["cache-control"] ?? null });
    });
  }).on("error", reject);
});

async function ready(page, previous = 0, timeout = 30000) {
  await page.waitForFunction((prev) => {
    const frame = document.querySelector("[data-preview-frame]");
    return frame && Number(frame.getAttribute("data-run-id")) > prev && document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "ready";
  }, previous, { timeout });
}

(async () => {
  const browser = await pw[ENGINE].launch(ENGINE === "chromium" ? { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
  const result = { label: LABEL, engine: `${ENGINE} ${browser.version()}`, base: BASE, measuredAt: new Date().toISOString(), errors: [] };
  try {
    // Cold loads
    const cold = { navigationToReadyMs: [], editorInitMs: [], previewReadyMs: [], previewRenderMs: [], parentScriptsEncodedBytes: [], parentScriptsDecodedBytes: [] };
    let previewUrl = null;
    for (let index = 0; index < COLD_SAMPLES; index++) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const started = Date.now();
      try {
        await page.goto(BASE + ROUTE);
        await ready(page);
        cold.navigationToReadyMs.push(Date.now() - started);
        const marks = await page.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((mark) => mark.name.startsWith("explain-dev-lab:")).map((mark) => [mark.name.split(":")[1], mark.detail?.ms])));
        cold.editorInitMs.push(marks["editor-init"] ?? null);
        cold.previewReadyMs.push(marks["preview-ready"] ?? null);
        cold.previewRenderMs.push(marks["preview-render"] ?? null);
        const scripts = await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => entry.initiatorType === "script" || entry.name.endsWith(".js")).map((entry) => [entry.encodedBodySize, entry.decodedBodySize]));
        cold.parentScriptsEncodedBytes.push(scripts.reduce((sum, [encoded]) => sum + encoded, 0));
        cold.parentScriptsDecodedBytes.push(scripts.reduce((sum, [, decoded]) => sum + decoded, 0));
        previewUrl = await page.locator('iframe[title="Preview of App.tsx"]').getAttribute("src");
      } catch (error) {
        cold.navigationToReadyMs.push(`failed: ${error.message.split("\n")[0]}`);
        result.errors.push({ phase: "cold load", error: error.message.split("\n")[0], status: await page.evaluate(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status")).catch(() => null) });
      }
      await context.close();
    }
    result.cold = Object.fromEntries(Object.entries(cold).map(([name, values]) => [name, stats(values)]));

    // Preview bundle as served
    if (previewUrl) {
      const absolute = new URL(previewUrl, BASE).href;
      const html = await fetchBytes(absolute);
      const document = await new Promise((resolve) => http.get(absolute, (response) => { let text = ""; response.on("data", (chunk) => (text += chunk)); response.on("end", () => resolve(text)); }));
      const runtimePath = document.match(/src="([^"]+runtime[^"]*\.js)"/)?.[1];
      const cssPath = document.match(/href="([^"]+\.css)"/)?.[1];
      result.previewAssets = { document: html, runtime: runtimePath ? await fetchBytes(new URL(runtimePath, absolute).href) : null, stylesheet: cssPath ? await fetchBytes(new URL(cssPath, absolute).href) : null };
    }

    // Warm page: run-to-preview latency, per-run network, memory and cleanup
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const previewRequests = [];
    page.on("request", (request) => { const frame = request.frame(); let url = ""; try { url = frame?.url() ?? ""; } catch { url = ""; } if (url.includes("preview.html") || request.url().includes("preview.html")) previewRequests.push({ at: Date.now(), url: request.url() }); });
    await page.goto(BASE + ROUTE);
    await ready(page);
    const latency = [];
    const requestsPerRun = [];
    for (let index = 0; index < RUN_SAMPLES; index++) {
      const previous = Number(await page.locator("[data-preview-frame]").getAttribute("data-run-id"));
      const before = previewRequests.length;
      const started = await page.evaluate(() => performance.now());
      await page.locator("[data-lab-run]").click();
      await ready(page, previous);
      latency.push((await page.evaluate(() => performance.now())) - started);
      await page.waitForTimeout(150);
      requestsPerRun.push(previewRequests.length - before);
    }
    result.runToPreviewMs = stats(latency);
    result.previewRequestsPerRun = stats(requestsPerRun);
    const heap = () => page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : null));
    const heapBefore = await heap();
    for (let index = 0; index < MEMORY_RUNS; index++) {
      const previous = Number(await page.locator("[data-preview-frame]").getAttribute("data-run-id"));
      await page.locator("[data-lab-run]").click();
      await ready(page, previous);
    }
    result.repeatedRuns = { runs: MEMORY_RUNS, parentHeapBeforeBytes: heapBefore, parentHeapAfterBytes: await heap(), iframesAfter: await page.locator("iframe").count(), note: heapBefore === null ? "performance.memory is not available in this engine" : "approximate; no forced GC" };
    await context.close();
  } catch (error) {
    result.errors.push({ phase: "measurement", error: error.stack });
  } finally {
    await browser.close();
  }
  fs.mkdirSync("docs/ed-019/performance", { recursive: true });
  fs.writeFileSync(`docs/ed-019/performance/${LABEL}-${ENGINE}.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ label: LABEL, engine: result.engine, errors: result.errors.length, navToReady: result.cold?.navigationToReadyMs?.median, previewReady: result.cold?.previewReadyMs?.median, render: result.cold?.previewRenderMs?.median, runToPreview: result.runToPreviewMs?.median, requestsPerRun: result.previewRequestsPerRun?.median }));
})();
