/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const phase = process.argv[2];
if (!["baseline", "prototype", "after"].includes(phase)) throw new Error("Expected baseline, prototype, or after");
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const routes = [["home", "/"], ["frontend", "/frontend"], ["curriculum", "/frontend/react"], ["introduction", "/frontend/react/introduction-to-react"], ["use-state", "/frontend/react/use-state"], ["server-components", manifest.topics.find((topic) => topic.id === "server-components").route]];
const base = process.env.BASE || "http://127.0.0.1:3115";
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  const samples = [], errors = [];
  const directory = `docs/ed-015/screenshots/${phase}`;
  fs.mkdirSync(directory, { recursive: true });
  try {
    for (const width of [375, 1440]) for (const theme of ["dark", "light"]) for (const [name, route] of (phase === "prototype" ? routes.filter(([name]) => ["home", "curriculum", "use-state"].includes(name)) : routes)) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.addInitScript((theme) => {
        localStorage.setItem("theme", theme);
        window.ed015Metrics = { cls: 0, lcp: 0, longTasks: [] };
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.ed015Metrics.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => { window.ed015Metrics.lcp = list.getEntries().at(-1).startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => { window.ed015Metrics.longTasks.push(...list.getEntries().map((entry) => entry.duration)); }).observe({ type: "longtask", buffered: true });
      }, theme);
      page.on("console", (message) => { if (message.type() === "error" || /hydration/i.test(message.text())) errors.push({ route, width, theme, text: message.text() }); });
      page.on("pageerror", (error) => errors.push({ route, width, theme, text: error.message }));
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      if (response.status() !== 200) throw new Error(`${route}: ${response.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(directory, `${name}-${width}-${theme}.png`) });
      const metrics = await page.evaluate(() => ({
        ...window.ed015Metrics,
        paints: performance.getEntriesByType("paint").map((entry) => ({ name: entry.name, ms: entry.startTime })),
        domContentLoaded: performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,
        js: performance.getEntriesByType("resource").filter((entry) => /\/_next\/static\/.*\.js(?:\?|$)/.test(entry.name)).map((entry) => ({ path: new URL(entry.name).pathname, decoded: entry.decodedBodySize, encoded: entry.encodedBodySize, transfer: entry.transferSize })),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      samples.push({ name, route, width, theme, ...metrics });
      await context.close();
    }
    fs.writeFileSync(`docs/ed-015/${phase}-browser.json`, JSON.stringify({ browser: `Chromium headless shell ${browser.version()}`, viewportHeight: 900, motion: "reduce", source: "Fresh local production contexts; no CPU/network throttling. Single observations, not field metrics.", samples, errors }, null, 2) + "\n");
    console.log(JSON.stringify({ phase, screenshots: samples.length, unexpectedErrors: errors.length, overflowingPages: samples.filter((sample) => sample.overflow).length }));
    if (errors.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
