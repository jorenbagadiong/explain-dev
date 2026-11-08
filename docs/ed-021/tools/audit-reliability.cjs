/* eslint-disable @typescript-eslint/no-require-imports */
// Focused ED-021 final-audit checks; uses the existing external Playwright installation.
const fs = require('node:fs');
const pw = require(process.env.PLAYWRIGHT_CORE || '/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const engine = process.env.ENGINE || 'chromium', base = process.env.BASE || 'http://localhost:3118';
const out = `docs/ed-021/${engine}`, key = 'explain-dev:v1:challenge-progress:react-use-state-counter';
const report = { engine, checks: [], errors: [] };
const check = (name, passed) => { report.checks.push({ name, passed: Boolean(passed) }); if (!passed) console.log('FAIL', name); };
const ready = async page => { await page.locator('.cm-content').waitFor(); await page.waitForFunction(() => document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status') === 'ready'); };
const edit = async (page, source) => { await page.locator('.cm-content').click(); await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.insertText(source); };
const saved = (page, source) => page.waitForFunction(({ key, source }) => JSON.parse(localStorage.getItem(key) || 'null')?.draftCode === source, { key, source });
const attach = page => page.on('pageerror', error => report.errors.push(error.message));
(async () => {
  const browser = await pw[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROME_PATH || '/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome' } : {});
  report.browser = browser.version();
  try {
    for (const failure of ['missing-locks', 'rejected-lock', 'read-throws', 'write-throws']) {
      const context = await browser.newContext();
      await context.addInitScript(({ key, failure }) => {
        if (window.top !== window) return;
        const locks = navigator.locks, get = Storage.prototype.getItem, set = Storage.prototype.setItem;
        const store = localStorage;
        window.__ed21ReadRaw = () => get.call(store, key);
        if (failure === 'missing-locks') Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
        if (failure === 'rejected-lock') Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: () => Promise.reject(new DOMException('Audit acquisition failure', 'SecurityError')) } });
        if (failure === 'read-throws') Storage.prototype.getItem = function (name) { if (name === key) throw new DOMException('Audit read failure', 'SecurityError'); return get.call(this, name); };
        if (failure === 'write-throws') Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('Audit write failure', 'SecurityError'); return set.call(this, name, value); };
        window.__ed21Recover = () => { Object.defineProperty(navigator, 'locks', { configurable: true, value: locks }); Storage.prototype.getItem = get; Storage.prototype.setItem = set; };
      }, { key, failure });
      const page = await context.newPage(); attach(page); await page.goto(base + '/practice/react/use-state-counter', { waitUntil: 'networkidle' }); await ready(page);
      const source = 'export default function App(){return <p>INERT_' + failure + '</p>}';
      await edit(page, source); await page.locator('[data-save-error]').waitFor();
      check(failure + ': accessible status warns unsaved', (await page.locator('[data-save-status][role="status"]').innerText()).includes('Not saved') && await page.locator('[data-save-error]').isVisible());
      check(failure + ': no unlocked/failed write and editor retained', await page.evaluate(() => window.__ed21ReadRaw()) === null && (await page.locator('.cm-content').innerText()).includes('INERT_' + failure));
      check(failure + ': source never auto-executes', await page.frameLocator('iframe[title="Preview of App.tsx"]').locator('p').innerText() === 'Count: 0');
      await page.evaluate(() => window.__ed21Recover()); await page.getByRole('button', { name: 'Retry saving', exact: true }).click(); await saved(page, source);
      check(failure + ': explicit retry saves exact current buffer', await page.locator('[data-save-indicator]').innerText() === 'Draft saved locally');
      await context.close();
    }
    const context = await browser.newContext(), owner = await context.newPage(); attach(owner);
    await owner.goto(base + '/practice/react/use-state-counter', { waitUntil: 'networkidle' }); await ready(owner); await edit(owner, 'first persisted source'); await saved(owner, 'first persisted source');
    // Freeze timers so an assertion cannot miss the pending state under browser load.
    // React must commit the input update before we inspect visible save status.
    await owner.clock.install(); await owner.clock.pauseAt(new Date());
    await owner.locator('.cm-content').click(); await owner.keyboard.press('End'); await owner.keyboard.insertText(' pending');
    await owner.clock.runFor(50);
    const pending = await owner.evaluate(key => ({ label: document.querySelector('[data-save-indicator]').textContent, stored: JSON.parse(localStorage.getItem(key)).draftCode }), key);
    report.pendingObservation = pending;
    check('new editor revision is pending before debounce, not shown saved', pending.label.includes('Saving') && pending.stored === 'first persisted source');
    await owner.clock.runFor(500); await owner.clock.resume(); await saved(owner, 'first persisted source pending');
    const follower = await context.newPage(); attach(follower); await follower.goto(base + '/practice/react/use-state-counter', { waitUntil: 'networkidle' }); await ready(follower); await edit(follower, 'follower unsaved buffer');
    // Close synchronously after the final input dispatch, before debounce. Test-driven pagehide exercises the same flush handler during close.
    await owner.evaluate(() => {
      const editor = document.querySelector('.cm-content');
      editor.addEventListener('input', () => queueMicrotask(() => dispatchEvent(new PageTransitionEvent('pagehide'))), { once: true });
    });
    await edit(owner, 'owner final pending source'); await owner.close();
    await follower.getByRole('button', { name: 'Retry saving', exact: true }).click();
    await follower.waitForFunction(() => document.querySelector('[data-save-error]')?.textContent.includes('changed in another tab'));
    check('closing owner flushes pending text and follower cannot silently overwrite', await follower.evaluate(key => JSON.parse(localStorage.getItem(key)).draftCode, key) === 'owner final pending source' && (await follower.locator('.cm-content').innerText()).includes('follower unsaved buffer'));
    follower.once('dialog', dialog => dialog.dismiss()); await follower.getByRole('button', { name: 'Load saved draft', exact: true }).click();
    check('cancelled load preserves unsaved editor', (await follower.locator('.cm-content').innerText()).includes('follower unsaved buffer'));
    follower.once('dialog', dialog => dialog.accept()); await follower.getByRole('button', { name: 'Save this draft instead', exact: true }).click(); await saved(follower, 'follower unsaved buffer');
    check('confirmed replacement alone persists the follower revision', await follower.locator('[data-save-indicator]').innerText() === 'Draft saved locally');
    await context.close();
  } finally {
    await browser.close(); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(`${out}/audit-report.json`, JSON.stringify(report, null, 2) + '\n');
  }
  const failures = report.checks.filter(check => !check.passed); console.log(JSON.stringify({ checks: report.checks.length, failures, errors: report.errors })); if (failures.length || report.errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
