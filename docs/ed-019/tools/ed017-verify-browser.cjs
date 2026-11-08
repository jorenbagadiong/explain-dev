/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const base = process.env.BASE || "http://127.0.0.1:3117";
const topics = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8")).topics;
const groups = [...new Set(topics.map((topic) => topic.groupId))];
const report = { engine: "", checks: [], errors: [] };
const check = (name, passed, evidence) => report.checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) });
const activeVisible = (root) => root.locator('[data-lesson-link][aria-current="page"]').evaluate((el) => { const row = el.getBoundingClientRect(), frame = el.closest("[data-navigation-scroll]").getBoundingClientRect(); return row.top >= frame.top && row.bottom <= frame.bottom; });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell" }); report.engine = browser.version();
  try {
    for (const width of [320, 375, 768, 1024, 1440]) for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", hasTouch: width < 1024 });
      await context.addInitScript((theme) => { localStorage.setItem("theme", theme); localStorage.setItem("explain-dev:v1:preferences", '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}'); }, theme);
      const page = await context.newPage(); page.setDefaultTimeout(8000);
      page.on("console", (msg) => { if (msg.type() === "error" || /hydration/i.test(msg.text())) report.errors.push(msg.text()); }); page.on("pageerror", (error) => report.errors.push(error.message));
      const sidebar = page.getByRole("complementary", { name: "Learning sidebar" });
      const trigger = page.getByRole("button", { name: "Open navigation" });
      const root = width < 1024 ? page.getByRole("dialog") : sidebar;
      const show = async () => { if (width < 1024) { await trigger.click(); await root.waitFor(); } };
      for (const group of groups) {
        // Last lesson exercises auto-reveal deep inside long groups.
        const lesson = topics.filter((topic) => topic.groupId === group).at(-1);
        const tag = `${width}/${theme}/${group}`;
        const response = await page.goto(base + lesson.route, { waitUntil: "networkidle" }); await show();
        const nav = root.getByRole("navigation", { name: "Primary navigation" });
        check(`${tag} route and breakpoint`, response.status() === 200 && await sidebar.isVisible() === (width >= 1024));
        check(`${tag} theme and no overflow`, await page.evaluate((theme) => document.documentElement.classList.contains(theme) && document.documentElement.scrollWidth <= innerWidth, theme) && await root.evaluate((el) => el.scrollWidth <= el.clientWidth));
        check(`${tag} active group only`, await nav.locator('[data-lesson-group] > button[aria-expanded="true"]').count() === 1 && await nav.locator(`[data-lesson-group="${group}"] button`).getAttribute("aria-expanded") === "true");
        check(`${tag} exact active lesson only`, await nav.locator('[aria-current="page"]').count() === 1 && await nav.locator('[data-lesson-link][aria-current="page"]').getAttribute("href") === lesson.route);
        await page.waitForTimeout(50); check(`${tag} active lesson revealed`, await activeVisible(root));
        check(`${tag} page remains at top`, await page.evaluate(() => scrollY === 0));
        check(`${tag} touch targets and wrapping`, await nav.locator("a, button").evaluateAll((els) => els.every((el) => { const b = el.getBoundingClientRect(); return b.height >= 44 && el.scrollWidth <= el.clientWidth; })));
        check(`${tag} one scrolling frame`, await nav.evaluate((el) => [...el.querySelectorAll("*")].every((child) => !["auto", "scroll"].includes(getComputedStyle(child).overflowY))));
        if (width < 1024) {
          check(`${tag} opening focus on active lesson`, await nav.locator('[data-lesson-link][aria-current="page"]').evaluate((el) => el === document.activeElement));
          await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" });
          check(`${tag} focus restored`, await trigger.evaluate((el) => el === document.activeElement));
        }
      }
      // Expand every group and compare every visible title/ID/URL in canonical order.
      await page.goto(base + "/frontend/react", { waitUntil: "networkidle" }); await show();
      const nav = root.getByRole("navigation", { name: "Primary navigation" });
      const expected = topics.map(({ id, title, route }) => ({ id, title, href: route })); const seen = [];
      check(`${width}/${theme} landing groups collapsed`, await nav.locator('[data-lesson-group] > button[aria-expanded="true"]').count() === 0);
      for (const group of groups) {
        const button = nav.locator(`[data-lesson-group="${group}"] button`); await button.click();
        check(`${width}/${theme}/${group} manual exclusive expansion`, await button.getAttribute("aria-expanded") === "true" && await nav.locator('[data-lesson-group] > button[aria-expanded="true"]').count() === 1);
        seen.push(...await nav.locator("[data-lesson-link]").evaluateAll((els) => els.map((el) => ({ id: el.getAttribute("data-lesson-id"), title: el.textContent, href: el.getAttribute("href") }))));
        await button.press("Space"); check(`${width}/${theme}/${group} Space collapses`, await button.getAttribute("aria-expanded") === "false");
        await button.press("Enter"); check(`${width}/${theme}/${group} Enter expands`, await button.getAttribute("aria-expanded") === "true");
        check(`${width}/${theme}/${group} visible focus and reduced motion`, await button.evaluate((el) => getComputedStyle(el).outlineStyle !== "none" && getComputedStyle(el.querySelector("svg")).transitionDuration === "0s"));
      }
      check(`${width}/${theme} all 119 canonical links`, JSON.stringify(seen) === JSON.stringify(expected), { seen: seen.length });
      if (width < 1024) { await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" }); }
      // Cross-group SPA navigation then Back/Forward; no full reloads.
      const from = topics.find((topic) => topic.id === "use-state"); const to = topics.find((topic) => topic.id === "react-introduction");
      await page.goto(base + from.route, { waitUntil: "networkidle" }); await show();
      await nav.locator('[data-lesson-group="fundamentals"] button').click();
      await nav.locator(`[data-lesson-id="${to.id}"]`).click(); await page.waitForURL(base + to.route);
      if (width < 1024) { await root.waitFor({ state: "hidden" }); check(`${width}/${theme} selection dismisses Sheet`, !await root.isVisible()); await show(); }
      check(`${width}/${theme} SPA opens destination group`, await nav.locator('[data-lesson-group="fundamentals"] button').getAttribute("aria-expanded") === "true" && await nav.locator('[aria-current="page"]').getAttribute("href") === to.route);
      if (width < 1024) { await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" }); }
      await page.goBack({ waitUntil: "networkidle" }); await show();
      check(`${width}/${theme} Back restores hooks`, await nav.locator('[data-lesson-group="hooks"] button').getAttribute("aria-expanded") === "true" && await nav.locator('[aria-current="page"]').getAttribute("href") === from.route);
      if (width < 1024) { await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" }); }
      await page.goForward({ waitUntil: "networkidle" }); await show();
      check(`${width}/${theme} Forward restores fundamentals`, await nav.locator('[data-lesson-group="fundamentals"] button').getAttribute("aria-expanded") === "true" && await nav.locator('[aria-current="page"]').getAttribute("href") === to.route);
      const activeButton = nav.locator('[data-lesson-group="fundamentals"] button'); await activeButton.click(); await page.waitForTimeout(100);
      check(`${width}/${theme} intentional active collapse persists`, await activeButton.getAttribute("aria-expanded") === "false");
      if (width < 1024) {
        await page.keyboard.press("Escape"); await root.waitFor({ state: "hidden" }); await show();
        for (let i = 0; i < 20; i++) { await page.keyboard.press(i < 10 ? "Tab" : "Shift+Tab"); check(`${width}/${theme} focus trap ${i}`, await root.evaluate((el) => el.contains(document.activeElement))); }
        const y = await page.evaluate(() => scrollY); await page.mouse.move(width - 4, 200); await page.mouse.wheel(0, 600); await page.waitForTimeout(50); check(`${width}/${theme} body scroll locked`, await page.evaluate(() => scrollY) === y);
        await page.mouse.click(width - 4, 200); await root.waitFor({ state: "hidden" }); check(`${width}/${theme} backdrop dismissal`, !await root.isVisible());
        await show(); await root.getByRole("button", { name: "Close navigation" }).click(); await root.waitFor({ state: "hidden" });
        check(`${width}/${theme} close button dismissal`, !await root.isVisible());
        await show(); await page.setViewportSize({ width: 1024, height: 900 }); await root.waitFor({ state: "hidden" });
        check(`${width}/${theme} resize closes and focuses brand`, await page.locator("#app-home-link").evaluate((el) => el === document.activeElement));
        await page.setViewportSize({ width, height: 900 });
      }
      const toggle = page.getByRole("button", { name: "Toggle light and dark theme" }); await toggle.click(); await toggle.click();
      check(`${width}/${theme} preferences untouched`, await page.evaluate((theme) => document.documentElement.classList.contains(theme) && localStorage.getItem("explain-dev:v1:preferences") === '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}' && Object.keys(localStorage).sort().join(",") === "explain-dev:v1:preferences,theme", theme));
      await context.close(); console.log(`${width}/${theme} done`);
    }
    // A very short desktop: scroll only the navigation, then exit normally over content.
    const context = await browser.newContext({ viewport: { width: 1440, height: 300 }, reducedMotion: "no-preference" }); const page = await context.newPage();
    await page.goto(base + "/frontend/react/error-handling-and-recovery", { waitUntil: "networkidle" });
    const root = page.getByRole("complementary", { name: "Learning sidebar" });
    check("short desktop active revealed", await activeVisible(root));
    await root.hover(); await page.mouse.wheel(0, 800); await page.waitForTimeout(100); const top = await root.evaluate((el) => el.scrollTop);
    check("sidebar wheel contained", top > 0 && await page.evaluate(() => scrollY === 0));
    await page.mouse.move(900, 200); await page.mouse.wheel(0, 700); await page.waitForTimeout(100);
    check("main wheel independent", await page.evaluate(() => scrollY > 0) && await root.evaluate((el) => el.scrollTop) === top);
    check("no continuous navigation animation", await root.evaluate((el) => el.getAnimations({ subtree: true }).every((animation) => animation.playState !== "running")));
    await context.close();
  } finally { await browser.close(); }
  fs.writeFileSync("docs/ed-019/regression/ed017/browser-verification.json", JSON.stringify(report, null, 2) + "\n");
  const failures = report.checks.filter((item) => !item.passed); console.log(JSON.stringify({ checks: report.checks.length, failures, errors: report.errors }, null, 2)); if (failures.length || report.errors.length) process.exitCode = 1;
})().catch((error) => { fs.writeFileSync("docs/ed-019/regression/ed017/browser-verification.json", JSON.stringify({ ...report, fatal: error.stack }, null, 2) + "\n"); console.error(error); process.exitCode = 1; });
