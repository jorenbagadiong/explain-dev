/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const sharp = require("sharp");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3116";
const routes = ["/", "/frontend", "/frontend/react", "/frontend/react/introduction-to-react", "/frontend/react/use-state", "/frontend/react/react-server-components"];
const report = { engine: "", checks: [], errors: [], contrasts: [] };
const check = (name, passed, evidence) => report.checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) });
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
  report.engine = `Chromium headless shell ${browser.version()}`;
  try {
    for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((theme) => { localStorage.setItem("theme", theme); localStorage.setItem("explain-dev:v1:preferences", '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}'); }, theme);
      const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on("console", (message) => { if (message.type() === "error" || /hydration/i.test(message.text())) report.errors.push(message.text()); }); page.on("pageerror", (error) => report.errors.push(error.message));
      let exactHeight;
      for (const route of routes) {
        const tag = `${width}/${theme} ${route}`;
        const response = await page.goto(base + route, { waitUntil: "networkidle" });
        const sidebar = page.getByRole("complementary", { name: "Learning sidebar" });
        const trigger = page.getByRole("button", { name: "Open navigation" });
        check(`${tag}: route, theme and no overflow`, response.status() === 200 && await page.evaluate((theme) => document.documentElement.classList.contains(theme) && document.documentElement.scrollWidth <= innerWidth, theme));
        check(`${tag}: expected sidebar breakpoint`, await sidebar.isVisible() === (width >= 1024));
        let root = sidebar;
        if (width < 1024) { await trigger.focus(); await trigger.press("Enter"); root = page.getByRole("dialog", { name: "Explore Explain Dev" }); await root.waitFor(); }
        const nav = root.getByRole("navigation", { name: "Primary navigation" });
        const links = nav.getByRole("link");
        check(`${tag}: original link order`, JSON.stringify(await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))) === JSON.stringify(["/", "/frontend"]));
        check(`${tag}: original statuses, no invented expandable list`, await nav.getByText("Coming soon", { exact: true }).count() === 3 && await nav.getByText("Available", { exact: true }).count() === 1 && await nav.getByRole("button").count() === 0);
        const current = nav.locator('[aria-current="page"]');
        check(`${tag}: correct active location`, await current.count() === 1 && await current.getAttribute("href") === (route === "/" ? "/" : "/frontend"));
        check(`${tag}: exact versus section strength`, await current.getAttribute("data-route-match") === (route === "/" || route === "/frontend" ? "exact" : "descendant"));
        const front = links.nth(1);
        if (route === "/frontend") exactHeight = (await front.boundingBox()).height;
        if (route === "/frontend/react") check(`${tag}: selected strength does not reflow row`, Math.abs((await front.boundingBox()).height - exactHeight) < 0.1);
        check(`${tag}: touch targets and labels fit`, await links.evaluateAll((els) => els.every((el) => { const b = el.getBoundingClientRect(); return b.height >= 44 && el.scrollWidth <= el.clientWidth; })));
        check(`${tag}: upcoming items are noninteractive`, await nav.locator('li div a, li div button, li div[tabindex]').count() === 0);
        await links.first().focus(); check(`${tag}: keyboard focus visible`, await links.first().evaluate((el) => getComputedStyle(el).outlineStyle !== "none"));
        await page.keyboard.press("Tab"); check(`${tag}: tab skips unavailable rows`, await front.evaluate((el) => el === document.activeElement));
        await contrast(page, root, tag);
        if (width < 1024) {
          const scroll = await page.evaluate(() => scrollY);
          await page.mouse.move(width - 4, 200); await page.mouse.wheel(0, 600); await page.waitForTimeout(50);
          check(`${tag}: background scroll locked`, await page.evaluate(() => scrollY) === scroll);
          for (let i = 0; i < 7; i++) { await page.keyboard.press(i % 2 ? "Shift+Tab" : "Tab"); check(`${tag}: focus remains in Sheet`, await root.evaluate((el) => el.contains(document.activeElement))); }
          await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" }); await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Open navigation");
          check(`${tag}: Escape restores focus`, await trigger.evaluate((el) => el === document.activeElement));
          await trigger.click(); await root.waitFor(); await page.mouse.click(width - 4, 200); await root.waitFor({ state: "hidden" });
          check(`${tag}: backdrop dismisses`, !await root.isVisible());
          await trigger.click(); await root.waitFor(); await root.getByRole("button", { name: "Close navigation" }).click(); await root.waitFor({ state: "hidden" });
          await trigger.click(); await root.waitFor(); await root.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Frontend Development/ }).click(); await page.waitForURL(base + "/frontend"); await root.waitFor({ state: "hidden" });
          check(`${tag}: navigation dismisses Sheet`, !await root.isVisible());
        }
        const toggle = page.getByRole("button", { name: "Toggle light and dark theme" }); await toggle.click(); await toggle.click(); await page.reload({ waitUntil: "networkidle" });
        check(`${tag}: theme persistence and preferences preserved`, await page.evaluate((theme) => document.documentElement.classList.contains(theme) && localStorage.getItem("explain-dev:v1:preferences") === '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}', theme));
      }
      await context.close(); console.log(`${width}/${theme}: representative navigation passed through`);
    }
    // Short-height desktop: independent scrolling, reachable footer, no wheel leakage.
    const context = await browser.newContext({ viewport: { width: 1440, height: 300 }, reducedMotion: "reduce" }); const page = await context.newPage();
    await page.goto(base + "/frontend/react", { waitUntil: "networkidle" });
    const sidebar = page.getByRole("complementary", { name: "Learning sidebar" });
    await sidebar.hover(); await page.mouse.wheel(0, 1000); await page.waitForTimeout(100);
    check("Short desktop: sidebar scrolls independently", await sidebar.evaluate((el) => el.scrollTop > 0) && await page.evaluate(() => scrollY === 0));
    check("Short desktop: footer is reachable without overlap", await sidebar.getByText("One concept at a time.").isVisible() && await sidebar.evaluate((el) => el.scrollHeight - el.scrollTop <= el.clientHeight + 2));
    await page.mouse.wheel(0, 1000); check("Short desktop: edge wheel stays contained", await page.evaluate(() => scrollY === 0));
    await page.setViewportSize({ width: 1440, height: 900 });
    await sidebar.evaluate((el) => { el.scrollTop = 0; });
    // Keep a real scrollable short sidebar while navigating using a main-content Link.
    await page.setViewportSize({ width: 1440, height: 300 }); await sidebar.evaluate((el) => { el.scrollTop = 30; });
    const previous = await sidebar.evaluate((el) => el.scrollTop);
    await page.locator('main a[href="/frontend/react/use-state"]').click(); await page.waitForURL(base + "/frontend/react/use-state");
    check("SPA route change: sidebar scroll is retained", Math.abs(await sidebar.evaluate((el) => el.scrollTop) - previous) < 1);
    await context.close();
    // Existing mobile scroller and resize-to-desktop close/focus behavior.
    const mobile = await browser.newContext({ viewport: { width: 375, height: 300 }, reducedMotion: "reduce", hasTouch: true }); const view = await mobile.newPage(); await view.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" });
    await view.getByRole("button", { name: "Open navigation" }).tap(); const drawer = view.getByRole("dialog"); await drawer.waitFor(); await drawer.hover(); await view.mouse.wheel(0, 900); await view.waitForTimeout(100);
    check("Short mobile: one drawer scroller with locked background", await drawer.evaluate((el) => el.scrollTop > 0) && await view.evaluate(() => scrollY === 0));
    await view.keyboard.press("Escape"); await drawer.waitFor({ state: "hidden" });
    await view.setViewportSize({ width: 375, height: 900 }); await view.getByRole("button", { name: "Open navigation" }).tap(); await drawer.waitFor(); await view.setViewportSize({ width: 1440, height: 900 }); await drawer.waitFor({ state: "hidden" }); await view.waitForFunction(() => document.activeElement?.id === "app-home-link");
    check("Resize to desktop closes drawer and focuses brand", await view.evaluate(() => document.activeElement?.id === "app-home-link")); await mobile.close();
    // Actual root text enlargement at desktop; scoped navigation text enlargement
    // at narrow drawer sizes, without relabelling viewport/DPR changes as zoom.
    for (const theme of ["dark", "light"]) {
      const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); await desktop.addInitScript((theme) => localStorage.setItem("theme", theme), theme); const p = await desktop.newPage(); await p.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" });
      const nav = p.getByRole("complementary", { name: "Learning sidebar" });
      const before = await nav.getByRole("link").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize)); await p.addStyleTag({ content: "html {font-size: 200% !important}" });
      check(`200% desktop text ${theme}: actual growth/no overflow`, await nav.getByRole("link").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize)) >= before * 1.99 && await nav.evaluate((el) => el.scrollWidth <= el.clientWidth) && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await desktop.close();
      const narrow = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" }); await narrow.addInitScript((theme) => localStorage.setItem("theme", theme), theme); const q = await narrow.newPage(); await q.goto(base + "/frontend/react/use-state", { waitUntil: "networkidle" }); await q.getByRole("button", { name: "Open navigation" }).click(); const d = q.getByRole("dialog"); await d.waitFor();
      const growth = await d.evaluate((root) => [...root.querySelectorAll("p,h2,span")].filter((el) => !el.closest('[aria-hidden="true"]') && !el.children.length).map((el) => { const style = getComputedStyle(el), before = parseFloat(style.fontSize); const line = parseFloat(style.lineHeight); el.style.fontSize = `${before * 2}px`; el.style.lineHeight = `${line * 2}px`; return { before, after: parseFloat(getComputedStyle(el).fontSize) }; }));
      check(`200% narrow navigation text ${theme}: actual enlargement/no clipping`, growth.every((item) => item.after >= item.before * 1.99) && await d.evaluate((el) => el.scrollWidth <= el.clientWidth));
      await q.keyboard.press("Escape"); await d.waitFor({ state: "hidden" }); await narrow.close();
    }
  } finally { await browser.close(); fs.writeFileSync("docs/ed-016/browser-verification.json", JSON.stringify(report, null, 2) + "\n"); }
  const failed = report.checks.filter((check) => !check.passed); console.log(JSON.stringify({ checks: report.checks.length, failed, errors: report.errors }, null, 2)); if (failed.length || report.errors.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
