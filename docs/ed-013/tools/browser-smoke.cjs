/* eslint-disable @typescript-eslint/no-require-imports */
// Browser checks for published lessons, using a production server you start yourself.
//   yarn build && node_modules/.bin/next start -p 3111
//   node docs/ed-013/tools/browser-smoke.cjs                     every published route
//   node docs/ed-013/tools/browser-smoke.cjs --detail id id ...  also widths, themes, keyboard
// Playwright is not a project dependency: point PLAYWRIGHT_CORE at any installed copy.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), "claude/portfolio_v2/node_modules/playwright-core"));

const BASE = process.env.BASE || "http://localhost:3111";
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const published = manifest.topics.filter((topic) => topic.publicationStatus === "available");
const detailIndex = process.argv.indexOf("--detail");
const detailIds = detailIndex === -1 ? [] : process.argv.slice(detailIndex + 1);
const WIDTHS = [320, 375, 768, 1024, 1440];
const THEMES = ["dark", "light"];

let pass = 0;
const failures = [];
const issues = [];
const check = (name, ok, extra = "") => { if (ok) pass += 1; else failures.push(`${name} ${extra}`.trim()); };

function chromeFromCache() {
  const cache = path.join(os.homedir(), ".cache/ms-playwright");
  const shell = fs.readdirSync(cache).filter((name) => name.startsWith("chromium_headless_shell-")).sort().pop();
  return path.join(cache, shell, "chrome-headless-shell-linux64/chrome-headless-shell");
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromeFromCache() });
  console.log("engine", browser.browserType().name(), browser.version());

  const open = async (options, theme) => {
    const context = await browser.newContext(options);
    if (theme) await context.addInitScript((value) => { if (!localStorage.getItem("theme")) localStorage.setItem("theme", value); }, theme);
    const page = await context.newPage();
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) issues.push(`${message.type()}: ${message.text().slice(0, 200)} @ ${page.url()}`); });
    page.on("pageerror", (error) => issues.push(`pageerror: ${error.message.slice(0, 200)} @ ${page.url()}`));
    return { context, page };
  };
  const mode = (page, label) => page.getByRole("group", { name: "Article mode" }).getByRole("button", { name: label, exact: true }).click();
  const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // Every published route, at one size.
  const { context, page } = await open({ viewport: { width: 1024, height: 900 }, reducedMotion: "reduce" });
  for (const topic of published) {
    const tag = topic.id;
    const response = await page.goto(BASE + topic.route, { waitUntil: "networkidle" });
    check(`${tag} status 200`, response?.status() === 200, String(response?.status()));
    check(`${tag} one h1`, (await page.locator("h1").count()) === 1);
    check(`${tag} title`, (await page.title()).endsWith("| Explain Dev"));
    check(`${tag} breadcrumb`, (await page.getByRole("navigation", { name: "Breadcrumb" }).locator('[aria-current="page"]').innerText()) === topic.title);
    check(`${tag} learn visible`, await page.locator("article section[id]").first().isVisible());
    check(`${tag} learn no overflow`, (await overflow(page)) <= 0);
    await mode(page, "Quick Review");
    check(`${tag} review visible`, await page.getByText("The interview trap").isVisible());
    await mode(page, "Interview");
    const reveals = page.getByRole("button", { name: /^Reveal answer:/ });
    const count = await reveals.count();
    check(`${tag} has questions`, count > 0);
    await reveals.first().click();
    check(`${tag} reveal works`, (await reveals.count()) === count - 1 && (await page.getByRole("button", { name: /^Hide answer:/ }).count()) === 1);
    check(`${tag} interview no overflow`, (await overflow(page)) <= 0);
  }

  // Curriculum links point at every published route.
  await page.goto(`${BASE}/frontend/react`, { waitUntil: "networkidle" });
  const links = await page.locator('main section[id] a[href^="/frontend/react/"]').evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  check("curriculum links match published", JSON.stringify([...links].sort()) === JSON.stringify(published.map((topic) => topic.route).sort()), `${links.length}/${published.length}`);
  await context.close();

  // Deeper checks on representative lessons.
  for (const id of detailIds) {
    const topic = published.find((entry) => entry.id === id);
    if (!topic) { failures.push(`${id} not published`); continue; }
    for (const width of WIDTHS) for (const theme of THEMES) {
      const tag = `${id} ${width}-${theme}`;
      const session = await open({ viewport: { width, height: 900 }, reducedMotion: "reduce" }, theme);
      const view = session.page;
      await view.goto(BASE + topic.route, { waitUntil: "networkidle" });
      check(`${tag} theme`, await view.evaluate((value) => document.documentElement.classList.contains(value), theme));
      for (const label of ["Learn", "Quick Review", "Interview"]) {
        await mode(view, label);
        check(`${tag} ${label} no overflow`, (await overflow(view)) <= 0, String(await overflow(view)));
        const levels = await view.locator("article h1:visible, article h2:visible, article h3:visible").evaluateAll((items) => items.map((item) => Number(item.tagName[1])));
        check(`${tag} ${label} heading order`, levels[0] === 1 && levels.every((level, index) => index === 0 || level - levels[index - 1] <= 1), JSON.stringify(levels));
      }
      await mode(view, "Learn");
      const code = await view.locator("article pre:visible").evaluateAll((items) => items.filter((item) => item.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).length);
      check(`${tag} code stays in viewport`, code === 0);
      const clipped = await view.locator("article figure:visible:not(:has(pre))").evaluateAll((items) => items.filter((item) => item.scrollWidth > item.clientWidth + 1).length);
      check(`${tag} visuals not clipped`, clipped === 0);
      const hiddenFocusable = await view.evaluate(() => [...document.querySelectorAll("[role=region][hidden] a, [role=region][hidden] button, [role=region][hidden] summary")].filter((item) => item.checkVisibility()).length);
      check(`${tag} inactive modes not focusable`, hiddenFocusable === 0);

      // Keyboard: reveal with Enter, keep focus, no trap across a Tab pass.
      await mode(view, "Interview");
      const first = view.getByRole("button", { name: /^Reveal answer:/ }).first();
      await first.focus();
      await view.keyboard.press("Enter");
      check(`${tag} keyboard reveal keeps focus`, await view.evaluate(() => document.activeElement?.getAttribute("aria-expanded") === "true"));
      await mode(view, "Learn");
      await view.evaluate(() => document.activeElement?.blur());
      let previous = null;
      let stuck = 0;
      for (let index = 0; index < 60; index += 1) {
        await view.keyboard.press("Tab");
        const current = await view.evaluate(() => { const item = document.activeElement; return item === document.body ? "BODY" : item.getAttribute("href") || item.id || item.getAttribute("aria-label") || item.textContent || ""; });
        if (current === "BODY") break;
        if (current === previous) stuck += 1;
        previous = current;
      }
      check(`${tag} no keyboard trap`, stuck === 0);

      // Back to Top.
      const backToTop = view.getByRole("button", { name: "Back to top" });
      check(`${tag} back to top hidden at top`, (await view.locator('[aria-label="Back to top"]').count()) === 0 || (await view.evaluate(() => scrollY)) > 400);
      await view.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
      await backToTop.waitFor();
      await backToTop.focus();
      await view.keyboard.press("Enter");
      await view.waitForFunction(() => scrollY === 0);
      check(`${tag} back to top focuses main`, await view.evaluate(() => document.activeElement?.id === "main-content"));

      // Mobile Sheet.
      const menu = view.getByRole("button", { name: "Open navigation" });
      if (await menu.isVisible()) {
        await menu.click();
        const dialog = view.getByRole("dialog");
        await dialog.waitFor();
        await view.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        // Radix restores focus just after the dialog closes, so allow it a moment.
        const returned = await view.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Open navigation", null, { timeout: 1000 }).then(() => true, () => false);
        check(`${tag} sheet returns focus`, returned);
      }
      await session.context.close();
    }
  }

  await browser.close();
  console.log(`routes ${published.length} detail ${detailIds.length} passed ${pass} failed ${failures.length} console issues ${issues.length}`);
  failures.slice(0, 30).forEach((failure) => console.log("FAIL", failure.slice(0, 220)));
  [...new Set(issues)].slice(0, 10).forEach((issue) => console.log("ISSUE", issue));
  process.exit(failures.length || issues.length ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(2); });
