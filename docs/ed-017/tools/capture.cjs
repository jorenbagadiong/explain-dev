/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const phase = process.argv[2]; if (!["before", "after"].includes(phase)) throw new Error("Expected before or after");
const base = process.env.BASE || "http://127.0.0.1:3117";
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const scenarios = [["fundamentals", "react-introduction"], ["hooks", "use-state"], ["long-title", "component-api-design"], ["long-group", "error-handling"]];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  const report = { engine: browser.version(), phase, samples: [], errors: [] };
  fs.mkdirSync(`docs/ed-017/screenshots/${phase}`, { recursive: true });
  try {
    for (const width of [375, 1440]) for (const theme of ["dark", "light"]) for (const [name, id] of scenarios) {
      const route = manifest.topics.find((topic) => topic.id === id).route;
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" }); await context.addInitScript((theme) => localStorage.setItem("theme", theme), theme); const page = await context.newPage();
      page.on("console", (message) => { if (message.type() === "error" || /hydration/i.test(message.text())) report.errors.push(message.text()); }); page.on("pageerror", (error) => report.errors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: "networkidle" }); if (response.status() !== 200) throw new Error(route);
      if (width < 1024) await page.getByRole("button", { name: "Open navigation" }).click();
      if (phase === "after") {
        const root = width < 1024 ? page.getByRole("dialog") : page.getByRole("complementary", { name: "Learning sidebar" });
        const active = root.locator('[data-lesson-link][aria-current="page"]'); await active.focus({ preventScroll: true }); await page.keyboard.press("Shift");
      }
      await page.screenshot({ path: `docs/ed-017/screenshots/${phase}/${name}-${width}-${theme}.png` }); report.samples.push({ route, width, theme, drawerOpen: width < 1024 }); await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(`docs/ed-017/${phase}-screenshots.json`, JSON.stringify(report, null, 2) + "\n"); console.log(JSON.stringify({ phase, screenshots: report.samples.length, errors: report.errors.length })); if (report.errors.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
