/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018 positive control: renderer CPU during an uninstrumented hang and after the preview is removed.
// Usage (production server on :3118): node docs/ed-018/tools/verify-disposal.cjs
const { chromium } = require("/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const programs = {
  regex: 'export default function App() {\n  return <p>{String(/(a+)+$/.test("a".repeat(40) + "b"))}</p>;\n}\n',
  hugeMemory: 'const chunks: number[][] = [];\nexport default function App() {\n  while (true) chunks.push(new Array(50_000_000).fill(1));\n}\n',
};
(async () => {
  const browser = await chromium.launch({ executablePath: "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" });
  const cdp = await browser.newBrowserCDPSession();
  const cpu = async () => (await cdp.send("SystemInfo.getProcessInfo")).processInfo.filter((p) => p.type === "renderer");
  const busy = async (ms) => { const a = await cpu(); await new Promise((r) => setTimeout(r, ms)); const b = await cpu(); return b.map((p) => ({ id: p.id, cpu: +(p.cpuTime - (a.find((x) => x.id === p.id)?.cpuTime ?? 0)).toFixed(2) })).filter((p) => p.cpu > 0.2); };
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("crash", () => console.log("PARENT PAGE CRASHED"));
  await page.goto("http://127.0.0.1:3118/practice/react/use-state-counter", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.dataset.previewStatus === "ready");
  for (const [name, code] of Object.entries(programs)) {
    await page.locator(".cm-content").click(); await page.keyboard.press("ControlOrMeta+a"); await page.keyboard.insertText(code);
    await page.evaluate(() => { window.__g = { max: 0, last: performance.now() }; window.__t = setInterval(() => { const n = performance.now(); window.__g.max = Math.max(window.__g.max, n - window.__g.last); window.__g.last = n; }, 50); });
    const t = Date.now();
    await page.locator("[data-lab-run]").click();
    await page.waitForTimeout(800);
    const during = await busy(1500);
    await page.waitForFunction(() => ["stopped", "runtime-error"].includes(document.querySelector("[data-lab-workspace]")?.dataset.previewStatus), null, { timeout: 30000 });
    const status = await page.evaluate(() => [document.querySelector("[data-lab-workspace]").dataset.previewStatus, document.querySelector("[data-lab-problems]")?.innerText.split("\n").filter(Boolean).slice(1, 3).join(" | ")]);
    const elapsed = Date.now() - t;
    await page.waitForTimeout(500);
    const after = await busy(2000);
    const gap = await page.evaluate(() => { clearInterval(window.__t); return Math.round(window.__g.max); });
    console.log(JSON.stringify({ name, status, elapsedMs: elapsed, busyDuringHang: during, busyAfterRemoval: after, maxParentGapMs: gap }));
  }
  await browser.close();
})();
