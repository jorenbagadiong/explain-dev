/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const phase = process.argv[2];
if (!["before", "prototype", "after"].includes(phase)) throw new Error("Expected before, prototype, or after");
const base = process.env.BASE || "http://127.0.0.1:3116";
const routes = [["home", "/"], ["frontend", "/frontend"], ["curriculum", "/frontend/react"], ["introduction", "/frontend/react/introduction-to-react"], ["use-state", "/frontend/react/use-state"], ["advanced", "/frontend/react/react-server-components"]];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  const report = { engine: browser.version(), phase, samples: [], errors: [] };
  fs.mkdirSync(`docs/ed-016/screenshots/${phase}`, { recursive: true });
  try {
    for (const width of (phase === "prototype" ? [1440] : [375, 1440])) for (const theme of ["dark", "light"]) for (const [name, route] of routes) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      const page = await context.newPage();
      page.on("console", (message) => { if (message.type() === "error" || /hydration/i.test(message.text())) report.errors.push(message.text()); });
      page.on("pageerror", (error) => report.errors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      if (response.status() !== 200) throw new Error(`${route}: ${response.status()}`);
      await page.evaluate(() => document.fonts.ready);
      if (width < 1024) await page.getByRole("button", { name: "Open navigation" }).click();
      await page.screenshot({ path: `docs/ed-016/screenshots/${phase}/${name}-${width}-${theme}.png` });
      report.samples.push({ route, width, theme, drawerOpen: width < 1024, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(`docs/ed-016/${phase}-screenshots.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ phase, screenshots: report.samples.length, errors: report.errors.length }));
  if (report.errors.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
