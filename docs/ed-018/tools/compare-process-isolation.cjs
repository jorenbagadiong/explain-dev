/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018: parent responsiveness during a bounded 1.5 s uninstrumented hang, full Chromium vs headless shell.
// Usage (production server on :3118): node docs/ed-018/tools/compare-process-isolation.cjs
const { chromium } = require("/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const code = 'export default function App() {\n  const start = Date.now();\n  const ok = /(a+)+$/.test("a".repeat(27) + "b");\n  return <p id="r">{String(ok)} {Date.now() - start}ms</p>;\n}\n';
(async () => {
  for (const [label, exe] of [["full Chromium", "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"], ["headless shell", "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell"]]) {
    const browser = await chromium.launch({ executablePath: exe });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://127.0.0.1:3118/practice/react/use-state-counter", { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.dataset.previewStatus === "ready");
    await page.locator(".cm-content").click(); await page.keyboard.press("ControlOrMeta+a"); await page.keyboard.insertText(code);
    await page.evaluate(() => { window.__g = { max: 0, last: performance.now() }; window.__t = setInterval(() => { const n = performance.now(); window.__g.max = Math.max(window.__g.max, n - window.__g.last); window.__g.last = n; }, 50); });
    await page.locator("[data-lab-run]").click();
    await page.waitForFunction(() => ["ready", "stopped"].includes(document.querySelector("[data-lab-workspace]")?.dataset.previewStatus) && Number(document.querySelector("[data-preview-frame]").dataset.runId) > 1, null, { timeout: 60000 });
    const state = await page.evaluate(() => document.querySelector("[data-lab-workspace]").dataset.previewStatus);
    const text = state === "ready" ? await page.frameLocator("iframe").locator("#r").textContent() : "";
    const gap = await page.evaluate(() => { clearInterval(window.__t); return Math.round(window.__g.max); });
    console.log(JSON.stringify({ browser: label, version: browser.version(), status: state, previewText: text, maxParentTimerGapMs: gap }));
    await browser.close();
  }
})();
