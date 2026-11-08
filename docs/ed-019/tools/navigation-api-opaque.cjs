/* eslint-disable @typescript-eslint/no-require-imports */
// ED-019: does the Navigation API fire `navigate` events in an opaque-origin (sandboxed) frame? Compares an
// allow-scripts frame (opaque) with an allow-scripts allow-same-origin frame using same-document navigations.
// Usage: node docs/ed-019/tools/navigation-api-opaque.cjs
const http = require("node:http");
const pw = require(process.env.PLAYWRIGHT_CORE || "/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core");
const script = `const out = { origin: self.origin, hasNavigation: typeof navigation !== "undefined", entries: null, events: [] };
try { out.entries = navigation.entries().length; } catch (e) { out.entries = e.name; }
navigation.addEventListener("navigate", (e) => out.events.push({ type: e.navigationType, cancelable: e.cancelable }));
location.hash = "same-document";
history.pushState({}, "", "#pushed");
setTimeout(() => parent.postMessage(out, "*"), 300);`;
const app = http.createServer((request, response) => {
  if (request.url === "/") { response.setHeader("content-type", "text/html"); return response.end('<script>window.msgs=[];addEventListener("message",e=>msgs.push(e.data));</script><iframe sandbox="allow-scripts" src="/frame"></iframe><iframe sandbox="allow-scripts allow-same-origin" src="/frame"></iframe>'); }
  if (request.url === "/frame") { response.setHeader("content-type", "text/html"); return response.end('<script src="/frame.js"></script>'); }
  if (request.url === "/frame.js") { response.setHeader("content-type", "text/javascript"); return response.end(script); }
  response.statusCode = 404; response.end();
}).listen(4941, "127.0.0.1");
(async () => {
  for (const engine of ["chromium", "firefox"]) {
    const browser = await pw[engine].launch(engine === "chromium" ? { executablePath: process.env.CHROME_PATH || "/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome" } : {});
    const page = await browser.newPage();
    await page.goto("http://localhost:4941/");
    await page.waitForTimeout(1000);
    for (const result of await page.evaluate(() => window.msgs)) console.log(JSON.stringify({ engine: `${engine} ${browser.version()}`, ...result }));
    await browser.close();
  }
  app.close();
})();
