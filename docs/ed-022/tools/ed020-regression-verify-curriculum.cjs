/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018 regression: all 119 React lessons, eight curriculum groups, learning modes, hydration/console errors
// and stored preferences. Usage: BASE=http://localhost:3118 node docs/ed-018/tools/verify-regression.cjs
const fs = require("node:fs");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");

fs.mkdirSync("docs/ed-022/regression", { recursive: true });
const ENGINE = process.env.ENGINE || "chromium";
const base = process.env.BASE || "http://localhost:3118";
const manifest = JSON.parse(fs.readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const groupTitles = [...fs.readFileSync("src/lib/learning/react-curriculum.ts", "utf8").matchAll(/^\s+title: "([^"]+)",$/gm)].map((match) => match[1]);
const PREFERENCES = '{"version":1,"bookmarkedTopicIds":["preserve"],"readTopicIds":["preserve"]}';
const report = { engine: "", base, checks: [], errors: [] };
const check = (name, passed, evidence) => { report.checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) }); if (!passed) console.log(`FAIL ${name}`, evidence ?? ""); };

(async () => {
  const browser = await pw[ENGINE].launch(ENGINE === "chromium" ? { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
  report.engine = `${ENGINE} ${browser.version()}`;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await context.addInitScript((preferences) => {
      if (window.top !== window) return;
      if (!sessionStorage.getItem("seeded")) { localStorage.setItem("explain-dev:v1:preferences", preferences); localStorage.setItem("theme", "dark"); sessionStorage.setItem("seeded", "1"); }
    }, PREFERENCES);
    const page = await context.newPage();
    const problems = [];
    page.on("console", (message) => { const url = message.location()?.url ?? ""; if ((message.type() === "error" || /hydrat/i.test(message.text())) && !url.includes("lab-runtime") && !url.startsWith("blob:")) problems.push({ route: page.url(), text: message.text().slice(0, 200) }); });
    page.on("pageerror", (error) => problems.push({ route: page.url(), text: error.message }));

    check("manifest lists 119 lessons in eight groups", manifest.topics.length === 119 && new Set(manifest.topics.map((topic) => topic.groupId)).size === 8 && groupTitles.length === 8, { lessons: manifest.topics.length, groups: groupTitles });
    for (const path of ["/", "/frontend", "/frontend/react", "/practice", "/practice/react/use-state-counter"]) {
      const response = await page.goto(base + path, { waitUntil: "networkidle" });
      check(`${path} returns 200`, response.status() === 200);
    }
    await page.goto(base + "/frontend/react", { waitUntil: "networkidle" });
    const overview = await page.locator("main").innerText();
    check("React overview shows all eight curriculum groups", groupTitles.every((title) => overview.includes(title)), groupTitles.filter((title) => !overview.includes(title)));
    check("React overview links to all 119 lessons", (await page.locator("main a[href^='/frontend/react/']").evaluateAll((links) => new Set(links.map((link) => link.getAttribute("href"))).size)) >= 119);

    let available = 0;
    for (const topic of manifest.topics) {
      const response = await page.goto(base + topic.route, { waitUntil: "load" });
      const ok = response.status() === 200 && await page.locator("h1").count() === 1 && await page.getByRole("group", { name: "Article mode" }).getByRole("button").count() === 3;
      if (ok) available++; else check(`lesson ${topic.route}`, false, { status: response.status() });
    }
    check("all 119 lessons load with one heading and three learning modes", available === 119, { available });

    for (const route of ["/frontend/react/introduction-to-react", "/frontend/react/use-state", "/frontend/react/use-effect"]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      const modes = page.getByRole("group", { name: "Article mode" });
      const panels = async () => page.locator("[id$='-panel'][role='region']").evaluateAll((elements) => elements.map((element) => !element.hidden));
      check(`${route} starts in Learn`, JSON.stringify(await panels()) === "[true,false,false]");
      await modes.getByRole("button", { name: "Quick Review" }).click();
      check(`${route} Quick Review mode`, JSON.stringify(await panels()) === "[false,true,false]" && (await modes.getByRole("button", { name: "Quick Review" }).getAttribute("aria-pressed")) === "true");
      await modes.getByRole("button", { name: "Interview" }).click();
      check(`${route} Interview mode`, JSON.stringify(await panels()) === "[false,false,true]");
      await modes.getByRole("button", { name: "Learn" }).click();
      check(`${route} back to Learn`, JSON.stringify(await panels()) === "[true,false,false]");
    }

    await page.goto(base + "/practice/react/use-state-counter", { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("[data-lab-workspace]")?.getAttribute("data-preview-status") === "ready");
    await page.locator("[data-lab-run]").click();
    await page.waitForTimeout(1500);
    check("stored preferences are unchanged after lessons and the Coding Lab", (await page.evaluate(() => localStorage.getItem("explain-dev:v1:preferences"))) === PREFERENCES);
    check("Coding Lab adds no storage keys", JSON.stringify(await page.evaluate(() => Object.keys(localStorage).sort())) === JSON.stringify(["explain-dev:v1:preferences", "theme"]), await page.evaluate(() => Object.keys(localStorage)));
    check("no console errors or hydration warnings on any page", problems.length === 0, problems.slice(0, 20));
    await context.close();
  } catch (error) {
    report.errors.push(error.stack);
    console.error(error);
  } finally {
    await browser.close();
    fs.writeFileSync(`docs/ed-022/regression/curriculum-${ENGINE}.json`, JSON.stringify(report, null, 2) + "\n");
    const failures = report.checks.filter((item) => !item.passed);
    console.log(JSON.stringify({ checks: report.checks.length, failed: failures.length, errors: report.errors.length }));
    if (failures.length || report.errors.length) process.exitCode = 1;
  }
})();
