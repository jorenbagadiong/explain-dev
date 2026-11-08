/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs'),pw=require(process.env.PLAYWRIGHT_CORE||'/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const {fixtures}=require('./fixtures.cjs'),engine=process.env.ENGINE||'chromium',base=process.env.BASE||'http://localhost:3118',out=`docs/ed-022/${engine}`;
const report={engine,expectedChecks:136,checks:[],errors:[]},check=(name,passed,evidence)=>{report.checks.push({name,passed:!!passed,evidence});if(!passed)console.log('FAIL',name,JSON.stringify(evidence))};
const key=id=>'explain-dev:v1:challenge-progress:'+id,route=id=>'/practice/react/'+id.replace(/^react-/,'');
const ready=async p=>{await p.locator('.cm-content').waitFor();await p.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='ready')};
const edit=async(p,code)=>{await p.locator('.cm-content').click();await p.waitForFunction(()=>document.activeElement?.classList.contains('cm-content'));await p.keyboard.press('ControlOrMeta+a');await p.keyboard.insertText(code)};
const saved=(p,id,code)=>p.waitForFunction(({key,code})=>JSON.parse(localStorage.getItem(key)||'null')?.draftCode===code,{key:key(id),code});
const read=(p,id)=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key(id));
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROME_PATH||'/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'}:{});
try{report.browser=browser.version();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.addInitScript(()=>{if(top!==self){addEventListener('message',event=>{if(event.data?.type==='init')window.__ed22Init=event.data.file.code});return}localStorage.setItem('theme','dark');if(navigator.clipboard)navigator.clipboard.writeText=async value=>{window.__ed22Copied=value}});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base+'/practice',{waitUntil:'networkidle'});
check('index lists five challenges and loads no editor or preview',await page.locator('[data-lab-challenge]').count()===5&&await page.locator('.cm-content, iframe').count()===0);
const prior={};
for(const {id,code:reference} of fixtures){
 await page.locator(`a[href="${route(id)}"]`).first().click();await ready(page);
 check(id+': independent first visit',await page.locator('[data-progress-status]').innerText()==='Not Started'&&await read(page,id)===null);
 const preview=page.frames().find(frame=>frame!==page.mainFrame());
 const isolation=await preview.evaluate(()=>{let dom=false,storage=false;try{void parent.document.body}catch(error){dom=error.name==='SecurityError'}try{void localStorage.length}catch(error){storage=error.name==='SecurityError'}return self.origin==='null'&&dom&&storage&&typeof RTCPeerConnection==='undefined'});
 check(id+': opaque sandbox blocks parent DOM and storage, WebRTC removed',isolation&&await page.locator('iframe').getAttribute('sandbox')==='allow-scripts');

 const draft=`export default function App(){return <p>ED022_DRAFT_${id}</p>}`;
 await edit(page,draft);await page.getByRole('link',{name:'Practice',exact:true}).first().click();await page.waitForURL(base+'/practice');await page.waitForFunction(id=>document.querySelector(`[data-index-progress="${id}"]`)?.textContent.includes('In Progress'),id);
 check(id+': rapid navigation flush and index status',await page.locator(`[data-index-progress="${id}"]`).innerText().then(text=>text.includes('In Progress'))&&(await read(page,id)).draftCode===draft);
 await page.locator(`a[href="${route(id)}"]`).first().click();await ready(page);
 check(id+': restored text never forwarded to preview',await page.locator('.cm-content').innerText().then(text=>text.includes('ED022_DRAFT_'))&&!(await page.frames().find(f=>f!==page.mainFrame()).evaluate(()=>window.__ed22Init)).includes('ED022_DRAFT_'));
 const latest=draft+'\n// refresh before debounce';await edit(page,latest);await page.reload({waitUntil:'networkidle'});await ready(page);
 check(id+': refresh restores latest source',await page.locator('.cm-content').innerText().then(text=>text.includes('refresh before debounce')));
 await page.getByRole('button',{name:'Reveal hint 1 of 3',exact:true}).press('Enter');await page.getByRole('button',{name:'Reveal hint 2 of 3',exact:true}).click();await page.reload({waitUntil:'networkidle'});await ready(page);
 check(id+': ordered hints survive refresh',await page.locator('[data-revealed-hints] li').count()===2&&await page.getByRole('button',{name:'Reveal hint 3 of 3',exact:true}).count()===1);
 const before=await page.locator('.cm-content').innerText();await page.getByRole('button',{name:'View reference solution',exact:true}).click();
 check(id+': warning precedes reference',await page.locator('pre[aria-label="Challenge reference solution"]').count()===0&&await page.getByText('This reveals the complete challenge implementation.',{exact:false}).isVisible());
 await page.getByRole('button',{name:'Reveal reference solution',exact:true}).click();const pre=page.locator('pre[aria-label="Challenge reference solution"]');await pre.waitFor();
 check(id+': own reference preserves learner source and cannot complete',await pre.innerText()===reference&&await page.locator('.cm-content').innerText()===before&&(await read(page,id)).completion===null);
 if(await page.evaluate(()=>!!navigator.clipboard)){await page.getByRole('button',{name:'Copy solution',exact:true}).click();check(id+': copy is explicit and does not apply',await page.evaluate(()=>window.__ed22Copied)===reference&&await page.locator('.cm-content').innerText()===before)}
 await edit(page,reference);await page.locator('[data-lab-run]').click();await ready(page);
 const visible=page.frameLocator('iframe[title="Preview of App.tsx"]');let worked=false;
 if(id==='react-use-state-counter'){await visible.getByRole('button',{name:'Increment',exact:true}).click();worked=await visible.locator('p').innerText()==='Count: 1'}
 else if(id==='react-controlled-input'){await visible.getByRole('textbox',{name:'Name',exact:true}).fill('Ada');worked=await visible.getByRole('status',{name:'Greeting',exact:true}).innerText()==='Hello, Ada!'}
 else if(id==='react-list-filtering'){await visible.getByRole('textbox',{name:'Search fruits',exact:true}).fill('ap');worked=JSON.stringify(await visible.getByRole('list',{name:'Fruits',exact:true}).locator('li').allTextContents())===JSON.stringify(['Apple','Apricot','Grape','Pineapple'])}
 else if(id==='react-conditional-rendering'){await visible.getByRole('button',{name:'Toggle details',exact:true}).click();worked=await visible.locator('#details').innerText()==='Extra details are visible.';await visible.getByRole('button',{name:'Toggle details',exact:true}).click();worked=worked&&await visible.locator('#details').count()===0}
 else {await visible.getByText(/^Ticks: [1-9]/).waitFor();worked=true}
 check(id+': explicitly run edited React works in interactive preview',worked);
 await page.locator('[data-lab-tests]').click();await page.waitForFunction(()=>document.querySelector('[data-grading-status]')?.getAttribute('data-grading-status')==='finished');
 check(id+': all seven reference tests earn own revision completion',await page.locator('[data-test-status="passed"]').count()===7&&(await read(page,id)).completion.revision===(await read(page,id)).gradingRevision&&await page.locator('[data-progress-status]').innerText()==='Completed');
 await edit(page,reference+'\n// after completion');await saved(page,id,reference+'\n// after completion');await page.reload({waitUntil:'networkidle'});await ready(page);
 check(id+': history survives without claiming edited draft passes',await page.locator('[data-progress-status]').innerText()==='Completed'&&(await read(page,id)).verification===null&&await page.locator('[data-historical-completion]').count()===1&&await pre.count()===0);
 await page.locator('[data-lab-reset]').click();await page.locator('.cm-content').click();await page.keyboard.press('ControlOrMeta+z');
 check(id+': Reset is one undoable change and keeps history',await page.locator('.cm-content').innerText().then(text=>text.includes('after completion'))&&(await read(page,id)).completion!==null);
 page.once('dialog',d=>d.dismiss());await page.locator('[data-clear-progress]').click();check(id+': cancelled Clear keeps history',(await read(page,id)).completion!==null);
 page.once('dialog',d=>d.accept());await page.locator('[data-clear-progress]').click();
 check(id+': confirmed Clear removes intended data only',(await read(page,id)).cleared===true&&Object.keys(await read(page,id)).length===4&&await page.locator('[data-progress-status]').innerText()==='Not Started');
 const snapshot=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([name])=>name.includes(':challenge-progress:'))));
 check(id+': other challenge records remain byte-identical',Object.entries(prior).every(([name,raw])=>snapshot[name]===raw));Object.assign(prior,snapshot);
 await page.getByRole('link',{name:'Practice',exact:true}).first().click();await page.waitForURL(base+'/practice');
 await page.waitForFunction(id=>document.querySelector(`[data-index-progress="${id}"]`)?.textContent.includes('Not Started'),id);
 check(id+': cleared status returns to index',await page.locator(`[data-index-progress="${id}"]`).innerText().then(text=>text.includes('Not Started')));
}
// Five viewports, both themes, every challenge: one live workspace, keyboard hints and wrapped content.
for(const width of [320,375,768,1024,1440])for(const theme of ['dark','light'])for(const {id} of fixtures){
 const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await c.addInitScript(theme=>{if(top===self)localStorage.setItem('theme',theme)},theme);const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+route(id),{waitUntil:'networkidle'});await ready(p);
 const hint=p.getByRole('button',{name:'Reveal hint 1 of 3',exact:true});await hint.focus();await hint.press('Enter');
 check(`${id} ${width}/${theme}: keyboard, focus, theme, no overflow, one editor`,await p.locator('[data-revealed-hints] li').count()===1&&await p.getByRole('button',{name:'Reveal hint 2 of 3',exact:true}).evaluate(el=>el===document.activeElement&&(getComputedStyle(el).outlineStyle!=='none'||getComputedStyle(el).boxShadow!=='none'))&&await p.evaluate(theme=>document.documentElement.classList.contains(theme)&&document.documentElement.scrollWidth<=innerWidth,theme)&&await p.locator('.cm-content').count()===1&&await p.locator('iframe').count()===1);
 if(width===375||width===1440)await p.screenshot({path:`${out}/${id}-${width}-${theme}.png`,fullPage:true});await c.close();
}
await context.close();report.complete=true;
}catch(error){report.errors.push(error.stack||String(error));throw error}finally{await browser.close();fs.writeFileSync(`${out}/experience.json`,JSON.stringify(report,null,2)+'\n')}
const failed=report.checks.filter(c=>!c.passed);console.log(JSON.stringify({checks:report.checks.length,failed,errors:report.errors}));if(failed.length||report.errors.length||report.checks.length!==report.expectedChecks)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
