/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), "claude/portfolio_v2/node_modules/playwright-core"));
const cache = path.join(os.homedir(), ".cache/ms-playwright");
const shell = fs.readdirSync(cache).filter(name => name.startsWith("chromium_headless_shell-")).sort().pop();
const base = process.env.BASE || "http://localhost:3111";
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const representative = ["jsx", "state-snapshots", "use-optimistic", "component-composition", "accessible-forms", "rendering-performance", "server-components", "typescript-react"];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || path.join(cache, shell, "chrome-headless-shell-linux64/chrome-headless-shell") });
  const results = [], samples = [], consoleIssues = [];
  const check = (name, ok, evidence) => results.push({ name, passed: Boolean(ok), evidence });
  // Fresh contexts for cold resource metrics, no synthetic network or CPU throttle.
  for (const id of [...representative, "declarative-ui"]) {
    const topic = manifest.topics.find(topic => topic.id === id);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const encodings = [];
    page.on("response", response => { if (response.url().includes("/_next/static/") && response.url().includes(".js")) encodings.push({ url: new URL(response.url()).pathname, encoding: response.headers()["content-encoding"] || "identity" }); });
    page.on("console", message => { if (["warning", "error"].includes(message.type())) consoleIssues.push(message.text()); });
    page.on("pageerror", error => consoleIssues.push(error.message));
    await page.goto(base + topic.route, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => ({
      resources: performance.getEntriesByType("resource").filter(entry => entry.name.includes("/_next/static/") && /\.js(?:\?|$)/.test(entry.name)).map(entry => ({ url: new URL(entry.name).pathname, initiatorType: entry.initiatorType, decodedBodySize: entry.decodedBodySize, encodedBodySize: entry.encodedBodySize, transferSize: entry.transferSize })),
      navigation: performance.getEntriesByType("navigation").map(entry => ({ encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize, transferSize: entry.transferSize, domContentLoaded: entry.domContentLoadedEventEnd, load: entry.loadEventEnd })),
      paints: performance.getEntriesByType("paint").map(entry => ({ name: entry.name, startTime: entry.startTime })),
    }));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.startPreciseCoverage", { callCount: false, detailed: false });
    for (const label of ["Quick Review", "Interview", "Learn"]) await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: label, exact: true }).click();
    const coverage = await cdp.send("Profiler.takePreciseCoverage");
    const executedScripts = coverage.result.filter(entry => entry.url.includes("/_next/static/")).map(entry => new URL(entry.url).pathname);
    await cdp.send("Profiler.stopPreciseCoverage");
    await cdp.send("Profiler.disable");
    samples.push({ id, ...metrics, encodings, executedDuringModeSwitch: executedScripts });

    await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: "Interview", exact: true }).focus();
    await page.keyboard.press("Space");
    check(`${id}: Space switches mode and keeps focus`, await page.locator('[aria-pressed="true"]').textContent() === "Interview" && await page.evaluate(() => document.activeElement?.getAttribute("aria-pressed") === "true"));
    const state = await page.evaluate(() => {
      const regions = [...document.querySelectorAll("[role=region]")];
      const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
      return { regions: regions.map(region => ({ hidden: region.hidden, labelExists: Boolean(document.getElementById(region.getAttribute("aria-labelledby"))) })), duplicateIds: ids.filter((id,index) => ids.indexOf(id) !== index), danglingControls: [...document.querySelectorAll("[aria-controls]")].filter(control => !document.getElementById(control.getAttribute("aria-controls"))).length };
    });
    check(`${id}: unique IDs and valid control references`, state.duplicateIds.length === 0 && state.danglingControls === 0, state);
    check(`${id}: one active named region`, state.regions.filter(region => !region.hidden).length === 1 && state.regions.every(region => region.labelExists));

    const reveal = page.getByRole("button", { name: /^Reveal answer:/ }).first();
    const answerId = await reveal.getAttribute("aria-controls");
    const answerControl = page.locator(`button[aria-controls="${answerId}"]`);
    await reveal.focus();
    await page.keyboard.press("Space");
    check(`${id}: Space reveals answer and keeps focus`, await answerControl.getAttribute("aria-expanded") === "true" && await answerControl.evaluate(node => node === document.activeElement));
    await page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: "Learn", exact: true }).click();
    check(`${id}: focus is outside hidden content`, await page.evaluate(() => !document.activeElement.closest("[hidden]")));

    // Computed sRGB foreground/background pairs for core text tokens in both themes.
    for (const theme of ["dark", "light"]) {
      await page.evaluate(theme => { document.documentElement.classList.remove("dark", "light"); document.documentElement.classList.add(theme); }, theme);
      const contrasts = await page.evaluate(() => {
        const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const rgb = color => { ctx.clearRect(0,0,1,1); ctx.fillStyle = color; ctx.fillRect(0,0,1,1); return [...ctx.getImageData(0,0,1,1).data].slice(0,3); };
        const luminance = color => rgb(color).map(value => { const s = value/255; return s <= .04045 ? s/12.92 : ((s+.055)/1.055)**2.4; }).reduce((sum,value,index) => sum + value*[.2126,.7152,.0722][index],0);
        const root = getComputedStyle(document.documentElement);
        const bg = luminance(root.getPropertyValue("--background"));
        return ["--foreground", "--muted-foreground", "--primary"].map(token => { const fg = luminance(root.getPropertyValue(token)); return { token, ratio: (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05) }; });
      });
      check(`${id}: ${theme} core text/background contrast >= 4.5`, contrasts.every(pair => pair.ratio >= 4.5), contrasts);
    }
    if (id === "jsx") {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.screenshot({ path: "/tmp/ed014-320-light.png", fullPage: true });
      await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
      const theme = await page.evaluate(() => document.documentElement.classList.contains("dark") ? "dark" : "light");
      await page.reload({ waitUntil: "networkidle" });
      check("theme persists across reload", await page.evaluate(theme => document.documentElement.classList.contains(theme), theme));
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("dialog").waitFor();
      const focusInside = await page.getByRole("dialog").evaluate(node => node.contains(document.activeElement));
      for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
      check("mobile Sheet traps focus inside dialog", focusInside && await page.getByRole("dialog").evaluate(node => node.contains(document.activeElement)));
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
      const top = page.getByRole("button", { name: "Back to top" });
      await top.waitFor();
      await top.focus();
      const ring = await top.evaluate(node => ({ outline: getComputedStyle(node).outlineStyle, width: getComputedStyle(node).outlineWidth, rect: { width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height } }));
      check("Back to Top has 44px target", ring.rect.width >= 44 && ring.rect.height >= 44, ring);
      await page.keyboard.press("Space");
      await page.waitForFunction(() => scrollY === 0);
      check("Back to Top focus target is programmatically focusable", await page.evaluate(() => document.activeElement.id === "main-content" && document.activeElement.tabIndex === -1));
      // Keyboard zoom is attempted, but recorded only if the layout viewport changes.
      const beforeZoom = await page.evaluate(() => ({ innerWidth, dpr: devicePixelRatio, scale: visualViewport.scale }));
      await page.keyboard.press("Control++");
      const afterZoom = await page.evaluate(() => ({ innerWidth, dpr: devicePixelRatio, scale: visualViewport.scale }));
      samples.push({ zoomProbe: { beforeZoom, afterZoom, realZoomEstablished: afterZoom.innerWidth !== beforeZoom.innerWidth } });
    }
    await context.close();
  }
  for (const route of ["/", "/frontend", "/frontend/react"]) {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    check(`${route}: direct load, one heading, no page overflow`, response.status() === 200 && await page.locator("h1").count() === 1 && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.close();
  }
  check("no console or hydration issues", consoleIssues.length === 0, consoleIssues);
  const report = { engine: browser.version(), passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed), results, samples };
  fs.writeFileSync(process.env.REPORT || "docs/ed-014/browser-results.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ engine: report.engine, passed: report.passed, failed: report.failed, resources: samples.filter(sample => sample.id).map(sample => ({ id: sample.id, js: sample.resources.reduce((sum,resource) => sum + resource.transferSize, 0) })) }, null, 2));
  await browser.close();
  process.exitCode = report.failed.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 2; });
