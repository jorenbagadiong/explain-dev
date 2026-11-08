/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3115";
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  const results = [];
  const target = async (page, locator) => { await locator.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 112)); };
  try {
    for (const [width, theme] of [[375, "light"], [1440, "dark"]]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      const page = await context.newPage();
      await page.goto(base + "/frontend/react", { waitUntil: "networkidle" }); await target(page, page.locator("#fundamentals"));
      await page.screenshot({ path: `docs/ed-015/screenshots/after/curriculum-detail-${width}-${theme}.png` });
      await page.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" }); await target(page, page.locator("#practical-examples .code-panel").first());
      await page.screenshot({ path: `docs/ed-015/screenshots/after/code-detail-${width}-${theme}.png` });
      await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: "Interview", exact: true }).click();
      const first = page.getByRole("button", { name: /^Reveal answer:/ }).first(); await first.click(); await target(page, page.locator(".interview-card").first());
      await page.screenshot({ path: `docs/ed-015/screenshots/after/answer-detail-${width}-${theme}.png` });
      await page.goto(base + "/frontend/react/introduction-to-react", { waitUntil: "networkidle" }); await target(page, page.locator(".concept-visual").first());
      await page.screenshot({ path: `docs/ed-015/screenshots/after/diagram-detail-${width}-${theme}.png` });
      results.push({ width, theme, extraScreenshots: 4 });
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 375, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    for (const route of ["/", "/frontend/react", "/frontend/react/introduction-to-react", "/frontend/react/use-state"]) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator("h1").count(), 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (route === "/") assert(await page.getByRole("link", { name: "Explore React", exact: false }).isVisible());
      if (route === "/frontend/react") assert.equal(await page.locator("main section[id] a").count(), 119);
      if (route.endsWith("/use-state") || route.endsWith("/introduction-to-react")) {
        assert(await page.getByRole("region", { name: "Learn", exact: true }).isVisible());
        const details = page.locator("#interview-questions details").first(); await details.locator("summary").press("Enter"); assert(await details.locator("p").isVisible());
      }
      results.push({ noJavaScript: route, passed: true });
    }
    await context.close();
  } finally { await browser.close(); }
  fs.writeFileSync("docs/ed-015/details-verification.json", JSON.stringify(results, null, 2) + "\n");
  console.log("8 additional detail screenshots; four no-JavaScript routes and native disclosures passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
