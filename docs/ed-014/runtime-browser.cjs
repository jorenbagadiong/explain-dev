/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), "claude/portfolio_v2/node_modules/playwright-core"));
const cache = path.join(os.homedir(), ".cache/ms-playwright");
const shell = fs.readdirSync(cache).filter(name => name.startsWith("chromium_headless_shell-")).sort().pop();
const results = [];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || path.join(cache, shell, "chrome-headless-shell-linux64/chrome-headless-shell") });
  const page = await browser.newPage();
  await page.goto(process.env.BASE || "http://localhost:3111");
  await page.addScriptTag({ path: "/tmp/explain-dev-ed014-runtime/examples.js" });
  const messages = [];
  page.on("console", message => { if (["warning", "error"].includes(message.type())) messages.push(message.text()); });
  page.on("pageerror", error => messages.push(error.message));
  const check = (name, ok, evidence) => results.push({ name, passed: Boolean(ok), evidence });
  const mount = (name, props = {}) => page.evaluate(({ name, props }) => window.audit.mount(name, props), { name, props });

  await mount("commit");
  await page.getByLabel("Your name").fill("Preserved");
  await page.getByRole("button", { name: "Click", exact: true }).click();
  check("fundamentals: render preserves uncontrolled input", await page.getByLabel("Your name").inputValue() === "Preserved" && await page.getByText("Clicks: 1").count() === 1);

  await mount("queue");
  await page.getByRole("button").click();
  check("state: three functional updaters accumulate", await page.getByRole("button", { name: "Count: 3", exact: true }).count() === 1);

  await page.evaluate(() => {
    window.notifications = [];
    window.alert = message => window.notifications.push(message);
    window.audit.mount("effect", { roomId: "old", isMuted: false }, true);
    window.audit.mount("effect", { roomId: "new", isMuted: false }, true);
  });
  await page.waitForTimeout(180);
  const notifications = await page.evaluate(() => window.notifications);
  check("effects: obsolete connections and Strict Mode probes do not notify", JSON.stringify(notifications) === JSON.stringify(["Connected to new"]), notifications);
  await page.evaluate(() => { window.notifications = []; window.audit.mount("effect", { roomId: "removed", isMuted: false }); window.audit.unmount(); });
  await page.waitForTimeout(180);
  const afterUnmount = await page.evaluate(() => window.notifications);
  check("effects: no notification after unmount", afterUnmount.length === 0, afterUnmount);

  await mount("like");
  await page.getByRole("button", { name: "Like", exact: true }).click();
  check("optimistic: immediate like", await page.getByRole("button", { name: "Liked", exact: true }).getAttribute("aria-pressed") === "true");
  await page.waitForTimeout(600);
  check("optimistic: confirmed like persists", await page.getByRole("button", { name: "Liked", exact: true }).count() === 1);

  const beforeComments = messages.length;
  await page.evaluate(() => { window.pendingComments = []; window.audit.mount("comments", { comments: [], addComment: () => new Promise(resolve => window.pendingComments.push(resolve)) }); });
  for (let i = 0; i < 2; i++) {
    await page.getByLabel("Comment", { exact: true }).fill("Same text");
    await page.getByRole("button", { name: "Post", exact: true }).click();
  }
  const duplicateWarnings = messages.slice(beforeComments).filter(text => /same key|unique.*key/i.test(text));
  check("optimistic: identical pending submissions have distinct identity", await page.getByRole("listitem").count() === 2 && duplicateWarnings.length === 0, duplicateWarnings);
  await page.evaluate(() => window.pendingComments.forEach(resolve => resolve()));
  await page.waitForFunction(() => document.querySelectorAll("#fixture li").length === 2 && document.querySelectorAll("#fixture li em").length === 0);
  const confirmedComments = await page.getByRole("listitem").allTextContents();
  check("optimistic: both confirmed comments persist without pending labels", confirmedComments.length === 2 && confirmedComments.every(text => text.trim() === "Same text") && await page.locator("#fixture li em").count() === 0, confirmedComments);

  await mount("action");
  await page.getByLabel("Name", { exact: true }).fill("x");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("alert").waitFor();
  check("actions: expected validation remains in form", await page.getByRole("alert").innerText() === "Name must be at least three characters.");
  await page.getByLabel("Name", { exact: true }).fill("Valid name");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("status").waitFor();
  check("actions: success and reset", await page.getByRole("status").innerText() === "Saved." && await page.getByLabel("Name", { exact: true }).inputValue() === "");

  await page.evaluate(() => { window.confirmed = 0; window.cancelled = 0; window.audit.mount("composition", { onConfirm: () => window.confirmed++, onCancel: () => window.cancelled++ }); });
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  check("architecture: composed callbacks", await page.evaluate(() => window.confirmed === 1 && window.cancelled === 1));

  await mount("form");
  await page.getByLabel("Email", { exact: true }).fill("a@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Hello");
  check("forms: labels target controls and native validity works", await page.locator("form").evaluate(form => form.checkValidity()));

  await mount("memo");
  await page.getByRole("button").click();
  check("performance: memoized child and parent update", await page.getByRole("heading", { name: "Hello, Ana" }).count() === 1 && await page.getByRole("button", { name: "Clicked 1 times" }).count() === 1);

  await page.evaluate(() => { const promise = new Promise(resolve => { window.resolveMessage = resolve; }); window.audit.mount("suspense", { messagePromise: promise }); });
  check("advanced: pending promise activates Suspense", await page.getByText("Waiting for message…", { exact: true }).count() === 1);
  await page.evaluate(() => window.resolveMessage("Resolved message"));
  await page.getByText("Resolved message", { exact: true }).waitFor();
  check("advanced: stable promise resolves", await page.getByText("Waiting for message…", { exact: true }).count() === 0);

  const boundaryStart = messages.length;
  await mount("boundary");
  check("boundaries: render error shows fallback", await page.getByRole("alert").innerText() === "The chart could not be displayed.");
  await mount("effectBoundaryProbe");
  await page.getByRole("alert").waitFor();
  check("audit probe: synchronous Effect errors reach a boundary", await page.getByRole("alert").innerText() === "Effect error caught");
  const expectedBoundaryMessages = messages.slice(boundaryStart);

  await page.evaluate(() => { const gate = new Promise(resolve => { window.resolveSlow = resolve; }); window.audit.mount("transitionProbe", { gate }); });
  await page.getByRole("button", { name: "Start slow", exact: true }).click();
  await page.getByText("Slow pending", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Start fast", exact: true }).click();
  const independent = await page.getByText("Fast ready", { exact: true }).waitFor({ timeout: 1500 }).then(() => true, () => false);
  check("audit probe: independent transition commits while sibling is suspended", independent && await page.getByText("Slow pending", { exact: true }).count() === 1);
  await page.evaluate(() => window.resolveSlow("Slow ready"));
  await page.getByText("Slow ready", { exact: true }).waitFor();

  await mount("typed");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  check("testing/best practices: typed failure state", await page.getByRole("alert").innerText() === "Try again later.");

  await mount("store");
  await page.getByRole("button").click();
  check("stores: snapshot updates subscriber", await page.getByRole("button", { name: "1 tasks", exact: true }).count() === 1);
  await page.evaluate(() => window.audit.unmount());
  const unexpectedMessages = messages.filter(message => !duplicateWarnings.includes(message) && !expectedBoundaryMessages.includes(message));
  check("no unexpected runtime warnings", unexpectedMessages.length === 0, unexpectedMessages);
  const report = { engine: browser.version(), results, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, warnings: messages };
  fs.writeFileSync(process.env.REPORT || "docs/ed-014/runtime-results.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  process.exitCode = report.failed ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 2; });
