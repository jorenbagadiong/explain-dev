/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const sharp = require("sharp");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3115";
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const routes = ["/", "/frontend", "/frontend/react", "/frontend/react/introduction-to-react", "/frontend/react/use-state", manifest.topics.find((topic) => topic.id === "server-components").route];
const report = { engine: "", results: [], errors: [], contrast: [], probes: [] };
const check = (name, ok, evidence) => { report.results.push({ name, passed: Boolean(ok), ...(evidence === undefined ? {} : { evidence }) }); };
const lum = (rgb) => rgb.slice(0, 3).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
// Rasterize the background with text made transparent (layout unchanged), so
// contrast samples include the real gradient/background composition.
async function contrast(page, tag) {
  const texts = await page.evaluate(() => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    return [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main span, main button, main code, main summary")].filter((el) => {
      const b = el.getBoundingClientRect();
      return !el.closest('[hidden], [aria-hidden="true"]') && b.width && b.height && b.top >= 0 && b.bottom <= innerHeight && (el.children.length === 0 || el.matches(".hero-primary-link"));
    }).map((el) => {
      const b = el.getBoundingClientRect(); ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = getComputedStyle(el).color; ctx.fillRect(0, 0, 1, 1);
      return { text: el.textContent.slice(0, 48), rgb: [...ctx.getImageData(0, 0, 1, 1).data], points: [0.1, 0.5, 0.9].map((x) => [Math.floor(b.x + b.width * x), Math.floor(b.y + Math.min(b.height / 2, 12))]) };
    });
  });
  const style = await page.addStyleTag({ content: "* { color: transparent !important; text-shadow: none !important; }" });
  const png = await page.screenshot();
  await style.evaluate((el) => el.remove());
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const values = texts.map((text) => {
    const fg = lum(text.rgb);
    const ratio = Math.min(...text.points.map(([x, y]) => {
      const index = (Math.max(0, Math.min(info.height - 1, y)) * info.width + Math.max(0, Math.min(info.width - 1, x))) * info.channels;
      const bg = lum([...data.subarray(index, index + 3)]);
      return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    }));
    return { text: text.text, ratio };
  });
  report.contrast.push({ tag, samples: values.length, minimum: Math.min(...values.map((value) => value.ratio)), failures: values.filter((value) => value.ratio < 4.5) });
  check(`${tag}: sampled actual-background text contrast >= 4.5`, values.every((value) => value.ratio >= 4.5));
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" });
  report.engine = `Chromium headless shell ${browser.version()}`;
  try {
    for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((theme) => {
        localStorage.setItem("theme", theme);
        if (!localStorage.getItem("explain-dev:v1:preferences")) localStorage.setItem("explain-dev:v1:preferences", JSON.stringify({ version: 1, bookmarkedTopicIds: ["preserve"], readTopicIds: ["preserve"] }));
        window.ed015Writes = [];
        for (const method of ["setItem", "removeItem", "clear"]) {
          const original = Storage.prototype[method];
          Storage.prototype[method] = function (...args) { window.ed015Writes.push([method, ...args]); return original.apply(this, args); };
        }
      }, theme);
      const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on("console", (message) => { if (message.type() === "error" || /hydration/i.test(message.text())) report.errors.push(message.text()); });
      page.on("pageerror", (error) => report.errors.push(error.message));
      for (const route of routes) {
        const tag = `${width}/${theme} ${route}`;
        const response = await page.goto(base + route, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        check(`${tag}: 200, one h1, no overflow`, response.status() === 200 && await page.locator("h1").count() === 1 && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        check(`${tag}: headings fit`, await page.locator("main h1, main h2, main h3").evaluateAll((els) => els.every((el) => !el.getBoundingClientRect().width || el.scrollWidth <= el.clientWidth)));
        check(`${tag}: sidebar breakpoint`, await page.getByRole("complementary", { name: "Learning sidebar" }).isVisible() === (width >= 1024));
        const trigger = page.getByRole("button", { name: "Open navigation" });
        check(`${tag}: reduced motion has no animations`, await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length === 0));
        const decoration = page.locator(".developer-workspace");
        if (await decoration.count()) check(`${tag}: decoration cannot intercept/focus`, await decoration.evaluate((el) => el.getAttribute("aria-hidden") === "true" && getComputedStyle(el).pointerEvents === "none" && !el.querySelector("a,button,input,[tabindex]")));
        if (route === "/") {
          const primary = page.getByRole("link", { name: "Explore React", exact: false });
          const bounds = await primary.boundingBox();
          check(`${tag}: primary CTA in initial viewport`, bounds.y >= 80 && bounds.y + bounds.height <= 900);
          await primary.focus(); check(`${tag}: CTA focus visible`, await primary.evaluate((el) => getComputedStyle(el).outlineStyle !== "none"));
          await page.keyboard.press("Enter"); await page.waitForURL(base + "/frontend/react");
          check(`${tag}: CTA navigates`, await page.locator("main section[id]").count() === 8);
          await page.goto(base + route, { waitUntil: "networkidle" });
        }
        await contrast(page, tag);
        if (route === "/frontend/react") {
          const sections = page.locator("main section[id]");
          check(`${tag}: exact curriculum routes/order`, JSON.stringify(await sections.locator('a[href^="/frontend/react/"]').evaluateAll((els) => els.map((el) => el.getAttribute("href")))) === JSON.stringify(manifest.topics.map((topic) => topic.route)));
          const toc = page.getByRole("navigation", { name: "React curriculum" });
          for (const anchor of await toc.getByRole("link").all()) {
            const id = (await anchor.getAttribute("href")).slice(1);
            await anchor.press("Enter");
            const box = await page.locator("#" + id).boundingBox();
            check(`${tag}: ${id} anchor clears header`, box.y >= 79 && box.y < 850);
          }
          const card = sections.locator("a").first();
          await card.focus(); check(`${tag}: card focus`, await card.evaluate((el) => getComputedStyle(el).outlineStyle !== "none"));
          const height = await sections.first().evaluate((el) => el.getBoundingClientRect().height);
          await card.hover(); check(`${tag}: no hover layout shift`, Math.abs(await sections.first().evaluate((el) => el.getBoundingClientRect().height) - height) < 0.1);
        }
        if (route.startsWith("/frontend/react/")) {
          const group = page.getByRole("group", { name: "Article mode" });
          const beforeUrl = page.url(), beforeWrites = await page.evaluate(() => JSON.stringify(window.ed015Writes));
          check(`${tag}: Learn default`, await group.getByRole("button", { name: "Learn", exact: true }).getAttribute("aria-pressed") === "true");
          const toc = page.getByRole("navigation", { name: "On this page" });
          for (const anchor of await toc.getByRole("link").all()) {
            const id = (await anchor.getAttribute("href")).slice(1); await anchor.press("Enter");
            const box = await page.locator('[id="' + id + '"]').boundingBox();
            check(`${tag}: article anchor ${id}`, box.y >= 79 && box.y < 850);
          }
          const learn = page.getByRole("region", { name: "Learn", exact: true });
          let overflowed = 0;
          for (const pre of await learn.locator("pre").all()) {
            const info = await pre.evaluate((el) => { const overflow = el.scrollWidth > el.clientWidth; el.scrollLeft = el.scrollWidth; const moved = el.scrollLeft > 0; el.scrollLeft = 0; return { overflow, moved, flat: getComputedStyle(el).transform === "none", internal: getComputedStyle(el).overflowX === "auto" }; });
            check(`${tag}: code stays flat and scrollable`, info.flat && info.internal && (!info.overflow || info.moved));
            if (info.overflow) { overflowed++; await pre.evaluate((el) => el.focus()); if (await pre.evaluate((el) => document.activeElement === el)) { await page.keyboard.press("ArrowRight"); await page.waitForTimeout(100); check(`${tag}: native keyboard code scrolling`, await pre.evaluate((el) => el.scrollLeft > 0)); } }
          }
          check(`${tag}: narrow code overflow contained`, width > 375 || overflowed > 0);
          for (const label of ["Quick Review", "Interview", "Learn"]) {
            const button = group.getByRole("button", { name: label, exact: true }); await button.focus(); const scroll = await page.evaluate(() => scrollY); const modeUrl = page.url();
            await button.press("Space");
            check(`${tag}: ${label} preserves full URL/hash`, page.url() === modeUrl);
            check(`${tag}: ${label} keyboard/focus/scroll`, await button.getAttribute("aria-pressed") === "true" && await button.evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineStyle !== "none") && Math.abs(await page.evaluate(() => scrollY) - scroll) < 1);
            check(`${tag}: active panel isolation`, await page.getByRole("region", { name: label, exact: true }).isVisible() && await page.evaluate(() => !document.activeElement.closest("[hidden]")));
            if (label === "Interview") {
              const buttons = page.getByRole("region", { name: "Interview", exact: true }).getByRole("button");
              check(`${tag}: answers hidden initially`, await buttons.evaluateAll((els) => els.every((el) => el.getAttribute("aria-expanded") === "false")));
              for (const index of [0, 1]) { const button = buttons.nth(index); await button.focus(); const scroll = await page.evaluate(() => scrollY); await button.press("Enter"); check(`${tag}: answer ${index} reveals/focus`, await button.getAttribute("aria-expanded") === "true" && await button.evaluate((el) => el === document.activeElement) && Math.abs(await page.evaluate(() => scrollY) - scroll) < 1); }
              await buttons.first().press("Space"); check(`${tag}: independent answer hide`, await buttons.first().getAttribute("aria-expanded") === "false" && await buttons.nth(1).getAttribute("aria-expanded") === "true");
            }
            await page.evaluate(() => scrollTo(0, 0)); await contrast(page, `${tag} ${label}`);
          }
          check(`${tag}: modes/reveals do not write storage`, await page.evaluate(() => JSON.stringify(window.ed015Writes)) === beforeWrites);
          check(`${tag}: modes preserve path/query`, new URL(page.url()).pathname === new URL(beforeUrl).pathname && new URL(page.url()).search === new URL(beforeUrl).search);
          await page.evaluate(() => scrollTo(0, 1200));
          const top = page.getByRole("button", { name: "Back to top", exact: true }); await top.waitFor(); await top.focus(); await top.press("Enter"); await page.waitForFunction(() => scrollY === 0);
          check(`${tag}: Back to Top focus`, await page.evaluate(() => document.activeElement.id === "main-content"));
          if (width < 1024) {
            await trigger.focus(); await trigger.press("Enter"); const dialog = page.getByRole("dialog"); await dialog.waitFor();
            for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); check(`${tag}: Sheet focus containment`, await dialog.evaluate((el) => el.contains(document.activeElement))); }
            await page.keyboard.press("Escape"); await page.waitForFunction(() => document.activeElement.getAttribute("aria-label") === "Open navigation");
            check(`${tag}: Sheet closes and restores focus`, !await dialog.isVisible());
          }
          const toggle = page.getByRole("button", { name: "Toggle light and dark theme" }); await toggle.click(); await toggle.click();
          await page.reload({ waitUntil: "networkidle" }); check(`${tag}: refresh and theme persistence`, await page.evaluate((theme) => document.documentElement.classList.contains(theme), theme));
          check(`${tag}: preferences preserved`, await page.evaluate(() => localStorage.getItem("explain-dev:v1:preferences")) === JSON.stringify({ version: 1, bookmarkedTopicIds: ["preserve"], readTopicIds: ["preserve"] }));
          const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
          check(`${tag}: breadcrumbs`, JSON.stringify(await breadcrumb.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")))) === JSON.stringify(["/", "/frontend", "/frontend/react"]));
        }
      }
      await context.close();
      console.log(`${width}/${theme} representative routes complete`);
    }
    // Actual browser zoom probe. A shortcut is not counted as zoom unless measured.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    const page = await context.newPage(); await page.goto(base, { waitUntil: "networkidle" });
    const metrics = () => page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, visualScale: visualViewport.scale }));
    const before = await metrics(); await page.keyboard.press("Control++"); const after = await metrics();
    report.probes.push({ name: "Actual browser zoom shortcut", before, after, established: before.width !== after.width || before.dpr !== after.dpr });
    const cta = page.getByRole("link", { name: "Explore React", exact: false }); await cta.hover();
    const frames = await page.evaluate(() => new Promise((resolve) => { const times = []; let previous; const next = (time) => { if (previous) times.push(time - previous); previous = time; if (times.length < 60) requestAnimationFrame(next); else resolve(times); }; requestAnimationFrame(next); }));
    const sorted = [...frames].sort((a, b) => a - b); report.probes.push({ name: "Unthrottled local rAF intervals during hover", median: sorted[30], p95: sorted[57], max: sorted.at(-1), over50ms: frames.filter((frame) => frame > 50).length });
    check("Decorative entrance is bounded, no ongoing animation", await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length === 0));
    await page.goto(base + "/frontend/react", { waitUntil: "networkidle" });
    const card = page.locator("main section[id] a").first(); await card.hover(); await page.waitForTimeout(250);
    check("Fine pointer gets lift", await card.evaluate((el) => getComputedStyle(el).transform !== "none"));
    await context.close();
    // Real text resizing, not DPR or a resized viewport masquerading as zoom.
    const resize = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const view = await resize.newPage();
    for (const theme of ["dark", "light"]) for (const route of routes) {
      await view.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      await view.goto(base + route, { waitUntil: "networkidle" });
      const before = await view.locator("main p").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      await view.addStyleTag({ content: "html { font-size: 200% !important; } main pre code { font-size: 26px !important; }" });
      const after = await view.locator("main p").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      check(`200% text resize ${theme} ${route}: actual enlargement`, after >= before * 1.99, { before, after });
      check(`200% text resize ${theme} ${route}: no overflow`, await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (route.startsWith("/frontend/react/")) for (const label of ["Learn", "Quick Review", "Interview"]) {
        await view.getByRole("group", { name: "Article mode" }).getByRole("button", { name: label, exact: true }).click(); check(`200% text resize ${theme} ${route} ${label}: no overflow`, await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    }
    await resize.close();
    const touch = await browser.newContext({ viewport: { width: 375, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
    const mobile = await touch.newPage(); await mobile.goto(base + "/frontend/react");
    check("Coarse pointer needs no hover and receives no card transform", await mobile.locator("main section[id] a").first().evaluate((el) => getComputedStyle(el).transform === "none"));
    await touch.close();
  } finally {
    await browser.close();
    fs.writeFileSync("docs/ed-015/browser-verification.json", JSON.stringify(report, null, 2) + "\n");
  }
  const failed = report.results.filter((result) => !result.passed);
  console.log(JSON.stringify({ checks: report.results.length, failed, errors: report.errors, probes: report.probes }, null, 2));
  assert.equal(failed.length + report.errors.length, 0);
})().catch((error) => { console.error(error); process.exitCode = 1; });
