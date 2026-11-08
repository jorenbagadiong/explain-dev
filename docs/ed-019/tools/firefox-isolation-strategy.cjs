/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019: parent responsiveness during a finite uninstrumented hang in the preview, Firefox with Playwright's default
// fission.webContentIsolationStrategy=0 (no cross-process iframes) versus 1 (isolate every site, the desktop default).
// Usage: app (dedicated mode) on http://localhost:3118 and preview host on :4100, then node docs/ed-019/tools/firefox-isolation-strategy.cjs
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const code = 'export default function App() {\n  const start = Date.now();\n  const ok = /(a+)+$/.test("a".repeat(26) + "b");\n  return <p id="r">{String(ok)} {Date.now() - start}</p>;\n}\n';
(async () => {
  for (const strategy of [0, 1]) for (const mode of [process.env.MODE || "dedicated"]) {
    const browser = await pw.firefox.launch({ firefoxUserPrefs: { "fission.webContentIsolationStrategy": strategy } });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3118/practice/react/use-state-counter");
    await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.dataset.previewStatus === "ready", null, { timeout: 30000 });
    const remote = await page.evaluate(() => navigator.userAgent);
    await page.locator(".cm-content").click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("cm-content"), null, { timeout: 3000 });
    await page.keyboard.press("ControlOrMeta+a"); await page.keyboard.insertText(code);
    await page.evaluate(() => { window.__g = { max: 0, last: performance.now() }; window.__t = setInterval(() => { const n = performance.now(); window.__g.max = Math.max(window.__g.max, n - window.__g.last); window.__g.last = n; }, 50); });
    await page.locator("[data-lab-run]").click();
    await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.dataset.previewStatus === "ready" && Number(document.querySelector("[data-preview-frame]").dataset.runId) > 1, null, { timeout: 60000 });
    // Measured from the parent only: Playwright cannot inspect out-of-process frames in Firefox (strategy 1).
    const gap = await page.evaluate(() => { clearInterval(window.__t); return Math.round(window.__g.max); });
    console.log(JSON.stringify({ browser: `firefox ${browser.version()}`, isolationStrategy: strategy, mode, userAgent: remote, workspaceStatus: await page.evaluate(() => document.querySelector("[data-lab-workspace]").dataset.previewStatus), maxParentTimerGapMs: gap }));
    await browser.close();
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
