/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const exe = process.argv[2];
const scenarios = { sameOriginOpaque: "http://localhost:4801/preview.html", crossSiteOpaque: "http://127.0.0.1:4802/preview.html" };
(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  const out = { engine: browser.version(), exe, scenarios: {} };
  for (const [name, src] of Object.entries(scenarios)) {
    const page = await browser.newPage(); const s = out.scenarios[name] = { dialogs: 0, popups: 0, console: [] };
    page.on("dialog", (d) => { s.dialogs++; d.dismiss(); }); page.on("popup", () => s.popups++);
    page.on("console", (m) => s.console.push(m.text().slice(0, 140)));
    await page.goto("http://localhost:4801/parent.html");
    await page.evaluate((src) => window.mount(src), src);
    await page.waitForFunction(() => window.received.some((m) => m.data?.type === "probe-results"), null, { timeout: 15000 });
    await page.waitForTimeout(500);
    Object.assign(s, await page.evaluate(() => ({ url: location.href, results: window.received.find((m) => m.data?.type === "probe-results"), bcReceived: window.bcReceived, cookieAfter: document.cookie, storageAfter: localStorage.getItem("explain-dev:v1:preferences"), loads: window.loads })));
    // Responsiveness: does a blocked preview thread block the parent?
    s.block = await page.evaluate(() => new Promise((resolve) => { let last = performance.now(), maxGap = 0; const t = setInterval(() => { const n = performance.now(); maxGap = Math.max(maxGap, n - last); last = n; }, 20); document.querySelector("iframe").contentWindow.postMessage("block", "*"); setTimeout(() => { clearInterval(t); resolve({ maxParentTimerGapMs: Math.round(maxGap) }); }, 4500); }));
    s.blockedDone = await page.evaluate(() => window.received.find((m) => m.data?.type === "blocked-done")?.data);
    s.selfNavigation = await page.evaluate(() => new Promise((resolve) => { const before = window.loads; document.querySelector("iframe").contentWindow.postMessage("navigate", "*"); setTimeout(() => resolve({ loadsBefore: before, loadsAfter: window.loads }), 2000); }));
    await page.close();
  }
  const direct = await browser.newPage();
  await direct.goto("http://localhost:4801/preview-blank.html"); await direct.waitForTimeout(300);
  out.directOpen = await direct.evaluate(() => { const r = { origin: self.origin }; try { localStorage.getItem("x"); r.localStorage = "accessible"; } catch (e) { r.localStorage = e.name; } try { r.cookie = document.cookie; } catch (e) { r.cookie = e.name; } return r; });
  await browser.close();
  out.serverHits = await (await fetch("http://127.0.0.1:4801/__hits")).json();
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
