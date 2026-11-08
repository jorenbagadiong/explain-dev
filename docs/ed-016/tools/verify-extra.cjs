/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3116";
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  const checks = [];
  const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce", hasTouch: true }); const page = await context.newPage(); await page.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open navigation" }).tap(); const drawer = page.getByRole("dialog"); await drawer.waitFor();
    const links = drawer.getByRole("navigation", { name: "Primary navigation" }).getByRole("link"); await links.first().focus();
    for (let i = 0; i < 9; i++) { await page.keyboard.press("Tab"); check(`Forward focus wrap ${i}`, await drawer.evaluate((el) => el.contains(document.activeElement))); }
    for (let i = 0; i < 6; i++) { await page.keyboard.press("Shift+Tab"); check(`Reverse focus wrap ${i}`, await drawer.evaluate((el) => el.contains(document.activeElement))); }
    check("Reduced motion removes nav transitions", await links.first().evaluate((el) => getComputedStyle(el).transitionDuration.split(",").every((value) => parseFloat(value) === 0)));
    check("Reduced motion has no running animations", await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length === 0));
    await page.keyboard.press("Escape"); await drawer.waitFor({ state: "hidden" }); await context.close();
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 300 }, reducedMotion: "no-preference" }); const p = await desktop.newPage(); await p.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" });
    const side = p.getByRole("complementary", { name: "Learning sidebar" }); await side.hover(); await p.mouse.wheel(0, 1000); await p.waitForTimeout(100); const scroll = await side.evaluate((el) => el.scrollTop);
    await p.mouse.move(900, 200); await p.mouse.wheel(0, 700); await p.waitForTimeout(100);
    check("Wheel exits sidebar normally over main content", await p.evaluate(() => scrollY > 0) && await side.evaluate((el) => el.scrollTop) === scroll);
    check("Normal motion has no continuous nav animations", await side.evaluate((el) => el.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length === 0)); await desktop.close();
  } finally { await browser.close(); }
  fs.writeFileSync("docs/ed-016/extra-verification.json", JSON.stringify(checks, null, 2) + "\n");
  console.log(JSON.stringify({ checks: checks.length, failed: checks.filter((item) => !item.passed) })); if (checks.some((item) => !item.passed)) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
