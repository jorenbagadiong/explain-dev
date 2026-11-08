/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs');
const pw=require(process.env.PLAYWRIGHT_CORE||'/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const programs=require('../../ed-020/tools/fixtures.cjs');
const engine=process.env.ENGINE||'chromium',base=process.env.BASE||'http://localhost:3118';
const out=`docs/ed-022/regression/${engine}-${process.env.MODE||'fallback'}`;fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],fixtures:{},durations:[]};
const check=(name,ok,evidence)=>{report.checks.push({name,passed:!!ok,evidence});if(!ok)console.log('FAIL',name,JSON.stringify(evidence));};
async function edit(page,code){const editor=page.locator('.cm-content');await editor.click();await page.waitForFunction(()=>document.activeElement?.classList.contains('cm-content'));await page.keyboard.press('ControlOrMeta+a');await page.keyboard.insertText(code);}
async function grade(page,code){if(code!==undefined)await edit(page,code);const started=Date.now();await page.locator('[data-lab-tests]').click();await page.waitForFunction(()=>['finished','blocked'].includes(document.querySelector('[data-grading-status]')?.getAttribute('data-grading-status')),null,{timeout:25000});await page.waitForFunction(()=>!document.querySelector('[data-grading-frame]'));const data=await page.locator('[data-grading-status]').evaluate(el=>({state:el.getAttribute('data-grading-status'),summary:el.querySelector('[data-grading-summary]').textContent,error:el.querySelector('[data-grading-error]')?.textContent,results:[...el.querySelectorAll('[data-test-id]')].map(row=>({id:row.getAttribute('data-test-id'),status:row.getAttribute('data-test-status'),text:row.textContent}))}));data.elapsedMs=Date.now()-started;return data;}
(async()=>{
const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROME_PATH||'/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'}:{});report.browser=browser.version();
try{
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(e.message));
await page.goto(base+'/practice/react/use-state-counter',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='ready');
let starter=await grade(page);check('starter fails behavior (only initial passes)',starter.results.filter(r=>r.status==='passed').length===1,starter);
for(const name of ['correct','autofocus','functional','reducer','classCounter','globalState','missingIncrement','wrongDecrement','brokenReset','wrongInitial','stale','noNegative','syntax','renderError','eventError','loop','neverSettles']){
const data=await grade(page,programs[name]);report.fixtures[name]=data;
const valid=['correct','autofocus','functional','reducer','classCounter','globalState'].includes(name);
if(valid)check(name+' passes all seven',data.results.length===7&&data.results.every(r=>r.status==='passed'),data);
else if(name==='syntax')check('invalid JSX executes no tests',data.state==='blocked'&&data.results.length===0&&data.error.includes('No tests were executed'),data);
else if(['loop','neverSettles'].includes(name))check(name+' terminates with timeout/error',data.state==='blocked'||data.results.some(r=>['timeout','error'].includes(r.status)),data);
else{
const relevant={missingIncrement:'increment',wrongDecrement:'decrement',brokenReset:'reset',wrongInitial:'initial-zero',stale:'repeated-increment',noNegative:'negative-values',renderError:'initial-zero',eventError:'increment'}[name];
check(name+' fails its relevant requirement',data.results.find(r=>r.id===relevant)?.status!=='passed'&&data.results.length===7,data);
}
if(name==='autofocus')check('learner autofocus cannot steal grading control focus',await page.locator('[data-lab-tests]').evaluate(el=>document.activeElement===el));
check(name+' disposable frame cleaned',await page.locator('iframe').count()===1);
if(['correct','syntax','neverSettles'].includes(name)){await page.locator('[data-grading-status]').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${name}-1440-dark.png`,fullPage:true});}
}
const recovery=await grade(page,programs.correct);check('recovers after nonresponsive work',recovery.results.every(r=>r.status==='passed')&&recovery.results.length===7);
// Run the visible preview once, change its state, then grade unchanged code repeatedly.
await page.locator('[data-lab-run]').click();await page.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='ready');
const visible=page.frameLocator('iframe[title="Preview of App.tsx"]');await visible.getByRole('button',{name:'Increment',exact:true}).click();await visible.getByRole('button',{name:'Increment',exact:true}).click();
const source=await page.locator('.cm-content').innerText();const runId=await page.locator('[data-preview-frame]:not([data-grading-frame])').getAttribute('data-run-id');
const initialHeap=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
for(let i=0;i<15;i++){const data=await grade(page);report.durations.push(data.elapsedMs);check('repeat '+i,data.results.length===7&&data.results.every(r=>r.status==='passed')&&await page.locator('iframe').count()===1);}
report.memory={before:initialHeap,after:await page.evaluate(()=>performance.memory?.usedJSHeapSize??null)};
check('grading leaves editor and visible preview untouched',await page.locator('.cm-content').innerText()===source&&await visible.locator('p').innerText()==='Count: 2'&&await page.locator('[data-preview-frame]:not([data-grading-frame])').getAttribute('data-run-id')===runId);
const navCode=programs.correct.replace("import {useState}","import {useState,useEffect}").replace('return <main>','useEffect(()=>{location.href="https://example.invalid/grade-blocked"},[]);return <main>');
const navResult=await grade(page,navCode);await page.waitForTimeout(250);
check('grading navigation cannot stop or change the visible preview',await page.locator('[data-lab-workspace]').getAttribute('data-preview-status')==='ready'&&await visible.locator('p').innerText()==='Count: 2'&&await page.locator('iframe').count()===1&&navResult.state==='blocked');

await edit(page,programs.correct+'\n// edit');check('edit immediately invalidates results',await page.locator('[data-grading-status]').getAttribute('data-grading-status')==='idle'&&await page.locator('[data-test-id]').count()===0);
// Cancel live grading with an edit and with Reset. No stale completion may reappear.
await edit(page,programs.neverSettles);await page.locator('[data-lab-tests]').click();await edit(page,programs.correct);await page.waitForTimeout(1800);check('in-flight edit cancels stale results',await page.locator('[data-grading-status]').getAttribute('data-grading-status')==='idle'&&await page.locator('iframe').count()===1);
await page.locator('[data-lab-tests]').click();await page.locator('[data-lab-reset]').click();await page.waitForTimeout(1800);check('Reset cancels grading',await page.locator('[data-grading-status]').getAttribute('data-grading-status')==='idle'&&await page.locator('iframe').count()===1);
await page.locator('.cm-content').click();await page.keyboard.press('ControlOrMeta+z');check('Reset remains undoable',await page.locator('.cm-content').innerText()===programs.correct);
await edit(page,programs.neverSettles);await page.locator('[data-lab-tests]').click();await edit(page,programs.correct);const newer=await grade(page);check('new run supersedes old work',newer.results.length===7&&newer.results.every(r=>r.status==='passed'));
await context.close();
// Requested responsive/theme matrix, keyboard activation and screenshots.
for(const width of [320,375,768,1024,1440])for(const theme of ['dark','light']){
const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await ctx.addInitScript(t=>{localStorage.setItem('theme',t);localStorage.setItem('explain-dev:v1:preferences','preserve')},theme);const p=await ctx.newPage();await p.goto(base+'/practice/react/use-state-counter',{waitUntil:'networkidle'});await p.locator('.cm-content').waitFor();
const control=p.locator('[data-lab-tests]');await control.focus();await control.press('Enter');await p.waitForFunction(()=>document.querySelector('[data-grading-status]')?.getAttribute('data-grading-status')==='finished');
check(`${width}/${theme} keyboard and visible focus`,await control.evaluate(el=>el===document.activeElement&&(getComputedStyle(el).outlineStyle!=='none'||getComputedStyle(el).boxShadow!=='none')&&el.getBoundingClientRect().height>=44));
check(`${width}/${theme} accessible summary and seven results`,await p.locator('[data-grading-summary][role="status"][aria-atomic="true"]').count()===1&&await p.locator('[data-test-id]').count()===7);
check(`${width}/${theme} no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
check(`${width}/${theme} only scoped progress storage; preferences preserved`,await p.evaluate(()=>localStorage.getItem('explain-dev:v1:preferences')==='preserve'&&Object.keys(localStorage).sort().join(',')==='explain-dev:v1:challenge-progress:react-use-state-counter,explain-dev:v1:preferences,theme'));
if(width===375||width===1440){await p.locator('[data-grading-status]').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/results-${width}-${theme}.png`});}
await ctx.close();}
}finally{await browser.close();fs.writeFileSync(`${out}/grading-report.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(c=>!c.passed).length,errors:report.errors}));if(report.checks.some(c=>!c.passed)||report.errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
