/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || '/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const base = process.env.BASE || 'http://127.0.0.1:3117';
fs.mkdirSync('docs/ed-021/regression/ed017/screenshots', {recursive:true});
const report = {checks: [], errors: []};
const check = (name, pass) => {report.checks.push({name, pass}); if (!pass) throw new Error(name);};
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/home/joren/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'});
  try {
    for (const width of [320,375,768,1024,1440]) for (const theme of ['dark','light']) {
      const ctx = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      await ctx.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
      const page = await ctx.newPage(); page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
      const root = width<1024 ? page.getByRole('dialog') : page.getByRole('complementary',{name:'Learning sidebar'});
      const show = async()=>{if(width<1024) await page.getByRole('button',{name:'Open navigation'}).click()};
      await page.goto(base + '/',{waitUntil:'networkidle'});await show();
      const front = root.getByRole('button',{name:'Frontend Development navigation',exact:true});
      const react = root.getByRole('button',{name:'React navigation',exact:true});
      check(`${width}/${theme} Frontend initially collapsed`,await front.getAttribute('aria-expanded')==='false' && !await react.isVisible());
      await front.press('Enter');check(`${width}/${theme} Frontend Enter expands`,await react.isVisible() && await react.getAttribute('aria-expanded')==='false');
      await react.press('Space');check(`${width}/${theme} React Space expands`,await root.getByRole('button',{name:'React Hooks',exact:true}).isVisible());
      await root.getByRole('button',{name:'React Hooks',exact:true}).click();
      const lesson = root.locator('[data-lesson-id="use-state"]');
      check(`${width}/${theme} lessons reachable`,await lesson.isVisible());
      await react.click();check(`${width}/${theme} React collapses`,!await lesson.isVisible());
      await react.click();check(`${width}/${theme} reopening retains lesson group`,await lesson.isVisible());
      await front.click();check(`${width}/${theme} Frontend hides entire branch`,!await react.isVisible() && !await lesson.isVisible());
      await front.click();check(`${width}/${theme} nested expansion retained`,await react.getAttribute('aria-expanded')==='true' && await lesson.isVisible());
      check(`${width}/${theme} targets and no overflow`,await root.locator('a,button').evaluateAll(els=>els.filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height>=44 && el.scrollWidth<=el.clientWidth)) && await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width<1024) await page.keyboard.press('Escape');
      await page.goto(base + '/frontend/react/use-state',{waitUntil:'networkidle'});await show();
      check(`${width}/${theme} direct load opens parents`,await front.getAttribute('aria-expanded')==='true' && await react.getAttribute('aria-expanded')==='true');
      check(`${width}/${theme} active lesson correct`,await root.locator('[data-lesson-link][aria-current="page"]').getAttribute('data-lesson-id')==='use-state');
      check(`${width}/${theme} panel associations`,await root.locator('button[aria-controls]').evaluateAll(els=>els.every(el=>{const panel=document.getElementById(el.getAttribute('aria-controls'));return panel && panel.getAttribute('aria-labelledby')===el.id && panel.hidden===(el.getAttribute('aria-expanded')==='false')})));
      await react.press('Enter');check(`${width}/${theme} keyboard collapses React`,!await lesson.isVisible());
      check(`${width}/${theme} focus visible`,await react.evaluate(el=>el===document.activeElement && getComputedStyle(el).outlineStyle!=='none'));
      await react.press('Enter');
      await root.locator('[data-lesson-id="use-effect"]').click();await page.waitForURL('**/frontend/react/use-effect');
      if(width<1024){await root.waitFor({state:'hidden'});await show()}
      check(`${width}/${theme} route changes open parents`,await front.getAttribute('aria-expanded')==='true' && await react.getAttribute('aria-expanded')==='true' && await root.locator('[data-lesson-link][aria-current="page"]').getAttribute('data-lesson-id')==='use-effect');
      if(width<1024) await page.keyboard.press('Escape');
      await page.goBack({waitUntil:'networkidle'});await show();check(`${width}/${theme} Back restores path and expansion`,await front.getAttribute('aria-expanded')==='true' && await react.getAttribute('aria-expanded')==='true' && await root.locator('[data-lesson-link][aria-current="page"]').getAttribute('data-lesson-id')==='use-state');
      await front.click();await front.press('Space');
      check(`${width}/${theme} overview links preserved`,await root.locator('a[data-category-link][href="/frontend"]').count()===1 && await root.locator('a[href="/frontend/react"]').count()===1);
      if(width===375||width===1440) await page.screenshot({path:`docs/ed-021/regression/ed017/screenshots/${width}-${theme}.png`});
      await ctx.close();console.log(width,theme,'passed');
    }
    check('no console errors',report.errors.length===0);
  } finally {await browser.close();fs.writeFileSync('docs/ed-021/regression/ed017/branch-verification.json',JSON.stringify(report,null,2));}
  console.log(`${report.checks.length} checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1});
