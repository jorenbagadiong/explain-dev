/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const sharp = require("sharp");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3117";
const report = { checks: [], contrasts: [] };
const check = (name, passed) => report.checks.push({ name, passed: Boolean(passed) });
const lum = (rgb) => rgb.slice(0, 3).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
async function contrast(page, root, name) {
  const samples = await root.evaluate((root) => {
    const c = document.createElement("canvas"); c.width = c.height = 1; const ctx = c.getContext("2d");
    return [...root.querySelectorAll("a,span,p,h2")].filter((el) => { const b = el.getBoundingClientRect(); return !el.closest('[aria-hidden="true"]') && !el.children.length && b.width && b.top >= 0 && b.bottom <= innerHeight; }).map((el) => {
      const b = el.getBoundingClientRect(); ctx.fillStyle = getComputedStyle(el).color; ctx.fillRect(0, 0, 1, 1);
      return { text: el.textContent.slice(0, 40), fg: [...ctx.getImageData(0, 0, 1, 1).data], points: [0.1, 0.5, 0.9].map((x) => [Math.floor(b.x + b.width * x), Math.floor(b.y + Math.min(b.height / 2, 8))]) };
    });
  });
  const style = await page.addStyleTag({ content: "* { color: transparent !important; text-shadow: none !important; }" });
  const png = await page.screenshot(); await style.evaluate((el) => el.remove());
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const values = samples.map((sample) => {
    const fg = lum(sample.fg);
    const ratio = Math.min(...sample.points.map(([x, y]) => { const start = (Math.max(0, Math.min(info.height - 1, y)) * info.width + Math.max(0, Math.min(info.width - 1, x))) * info.channels; const bg = lum([...data.subarray(start, start + 3)]); return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05); }));
    return { text: sample.text, ratio };
  });
  report.contrasts.push({ name, count: values.length, minimum: Math.min(...values.map((item) => item.ratio)), failures: values.filter((item) => item.ratio < 4.5) });
  check(`${name}: actual-background text contrast`, values.length > 0 && values.every((item) => item.ratio >= 4.5));
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  try {
    for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      const page = await context.newPage(); await page.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" });
      const root = width < 1024 ? page.getByRole("dialog") : page.getByRole("complementary", { name: "Learning sidebar" });
      if (width < 1024) await page.getByRole("button", { name: "Open navigation" }).click();
      await contrast(page, root, `${width}/${theme} Hooks`);
      check(`${width}/${theme} IDs unique`, await page.evaluate(() => { const ids = [...document.querySelectorAll("[id]")].map((el) => el.id); return ids.length === new Set(ids).size; }));
      check(`${width}/${theme} panels associated and collapsed panels hidden`, await root.locator("button[aria-controls]").evaluateAll((buttons) => buttons.every((button) => { const panel = document.getElementById(button.getAttribute("aria-controls")); return panel && panel.getAttribute("aria-labelledby") === button.id && panel.hidden === (button.getAttribute("aria-expanded") === "false"); })));
      if (width < 1024) await page.keyboard.press("Escape");
      const nav = page.getByRole("complementary", { name: "Learning sidebar" }).getByRole("navigation", { name: "Primary navigation" });
      if (width >= 1024) {
        await nav.locator('[data-lesson-id="use-effect"]').click(); await page.waitForURL(base + "/frontend/react/use-effect");
        check(`${width}/${theme} same group navigation remains open`, await nav.locator('[data-lesson-group="hooks"] button').getAttribute("aria-expanded") === "true" && await nav.locator('[aria-current="page"]').getAttribute("href") === "/frontend/react/use-effect");
        const hooks = nav.locator('[data-lesson-group="hooks"] button'); await hooks.click();
        await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: "Quick Review", exact: true }).click();
        check(`${width}/${theme} unrelated mode update respects manual collapse`, await hooks.getAttribute("aria-expanded") === "false");
        await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: "Learn", exact: true }).click();
        await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
        check(`${width}/${theme} theme update respects manual collapse`, await hooks.getAttribute("aria-expanded") === "false");
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync("docs/ed-017/extra-verification.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ checks: report.checks.length, failed: report.checks.filter((item) => !item.passed), contrastMinimum: Math.min(...report.contrasts.map((item) => item.minimum)) })); if (report.checks.some((item) => !item.passed)) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
