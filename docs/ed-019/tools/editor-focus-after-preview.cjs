/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019: editor focus after interacting with the cross-site preview (Firefox focus defect and fix).
// Usage: app on http://localhost:3118 (dedicated mode) and preview host on :4100, then node docs/ed-019/tools/editor-focus-after-preview.cjs
const pw = require("/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const ev = 'export default function App() {\n  function handle() {\n    throw new TypeError("Handler failed");\n  }\n  return <div><button type="button" onClick={() => {}}>Safe</button><button type="button" onClick={handle}>Break</button></div>;\n}\n';
(async () => {
  for (const engine of ["firefox", "chromium"]) {
    const browser = await pw[engine].launch(engine === "chromium" ? { executablePath: "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3118/practice/react/use-state-counter"); await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.dataset.previewStatus === "ready");
    const ed = async () => (await page.locator(".cm-content").innerText()).replace(/\n/g, " ").slice(0, 50);
    await page.locator(".cm-content").click(); await page.keyboard.press("ControlOrMeta+a"); await page.keyboard.insertText(ev);
    await page.locator("[data-lab-run]").click(); await page.waitForTimeout(1500);
    for (const variant of ["no-throw-click", "throw-click", "no-throw-click", "throw-click", "throw-click"]) {
      await page.frameLocator("iframe").getByRole("button", { name: variant === "throw-click" ? "Break" : "Safe" }).click(); await page.waitForTimeout(800);
      await page.locator(".cm-content").click();
      const focusedWithin = await page.waitForFunction(() => document.activeElement?.classList.contains("cm-content"), null, { timeout: 2000 }).then(() => true, () => false);
      const focus = await page.evaluate(() => ({ hasFocus: document.hasFocus(), active: document.activeElement?.className?.slice(0, 20) }));
      await page.keyboard.press("ControlOrMeta+a");
      const sel = await page.evaluate(() => String(getSelection()).length);
      await page.keyboard.insertText("const MARK = 1;\n");
      console.log(engine, variant, "focusedWithin2s=" + focusedWithin, JSON.stringify(focus), "selectionLen=" + sel, "editor:", await ed());
      await page.keyboard.press("ControlOrMeta+z");
    }
    await browser.close();
  }
})();
