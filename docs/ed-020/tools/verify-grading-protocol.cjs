/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs');const pw=require(process.env.PLAYWRIGHT_CORE||'/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const engine=process.env.ENGINE||'chromium',base=process.env.BASE||'http://localhost:3118';const report={checks:[]};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)console.log('FAIL',name)};
const ids=['initial-zero','increment','repeated-increment','decrement','reset','negative-values','combined-interactions'];
(async()=>{const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROME_PATH||'/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'}:{});
try{for(const scenario of ['malformed','markup','deadline','old-version']){
const ctx=await browser.newContext();const page=await ctx.newPage();
await page.route('**/lab-runtime/runtime.js',route=>route.fulfill({contentType:'application/javascript',body:`
const hello={channel:'explain-dev-lab',version:${scenario==='old-version'?2:3},type:'hello'};
const ids=${JSON.stringify(ids)},scenario=${JSON.stringify(scenario)};
addEventListener('message',event=>{
 if(event.source!==parent||event.origin!==${JSON.stringify(new URL(base).origin)}||event.data.type!=='init')return;
 const init=event.data,port=event.ports[0];const env={channel:'explain-dev-lab',version:3,session:init.session,runId:init.runId};
 const result={challengeId:'react-use-state-counter',runId:init.runId,results:ids.map(id=>({id,status:'passed',feedback:'Matched.',durationMs:1})),completed:true,durationMs:20};
 const msg={...env,type:'grading-result',result};const send=value=>port.postMessage(value);
 if(!init.gradingChallengeId){send(msg);send({...env,type:'rendered'});setInterval(()=>send({...env,type:'heartbeat'}),500);return}
 setInterval(()=>send({...env,type:'heartbeat'}),500);
 if(scenario==='deadline')return;
 if(scenario==='markup'){result.results[0].feedback='<img src=x onerror=alert(1)><script>alert(2)</script>';send(msg);return}
 const clone=()=>structuredClone(msg);const bad=[];
 let m=clone();m.result.challengeId='invented';bad.push(m);
 m=clone();m.result.results=[];bad.push(m);
 m=clone();m.result.results.reverse();bad.push(m);
 m=clone();m.result.results[1]=m.result.results[0];bad.push(m);
 m=clone();m.result.completed=false;bad.push(m);
 m=clone();m.result.results[0].feedback='x'.repeat(501);bad.push(m);
 m=clone();m.result.durationMs=NaN;bad.push(m);
 m=clone();m.result.results[0].status='certified';bad.push(m);
 m=clone();m.result.html='<b>';bad.push(m);
 m=clone();m.session='00000000-0000-4000-8000-000000000000';bad.push(m);
 m=clone();m.runId++;m.result.runId++;bad.push(m);
 m=clone();m.result.runId++;bad.push(m);
 for(const value of bad)send(value);
 setTimeout(()=>send(msg),1000);
});parent.postMessage(hello,${JSON.stringify(new URL(base).origin)});` }));
await page.goto(base+'/practice/react/use-state-counter',{waitUntil:'networkidle'});
if(scenario==='old-version'){await page.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='failed');check('v2 host fails closed after protocol change',await page.locator('iframe').count()===0);await ctx.close();continue}
await page.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='ready');
check(scenario+' interactive preview cannot deliver grading results',await page.locator('[data-grading-status]').getAttribute('data-grading-status')==='idle');
await page.locator('[data-lab-tests]').click();
if(scenario==='malformed'){await page.waitForFunction(()=>Number(document.querySelector('[data-grading-frame]')?.getAttribute('data-rejected-messages'))===12);check('all 12 malformed/spoofed results rejected before display',await page.locator('[data-test-id]').count()===0)}
await page.waitForFunction(()=>['finished','blocked'].includes(document.querySelector('[data-grading-status]')?.getAttribute('data-grading-status')),null,{timeout:20000});
if(scenario==='deadline'){check('responsive malicious preview still has a bounded grading deadline',await page.locator('[data-grading-error]').innerText().then(t=>t.includes('stopped responding')||t.includes('execution limit')));check('deadline closes grading frame only',await page.locator('iframe').count()===1&&await page.locator('[data-lab-workspace]').getAttribute('data-preview-status')==='ready')}
else{check(scenario+' valid result eventually accepted',await page.locator('[data-test-id]').count()===7);if(scenario==='markup')check('grading feedback escaped as text',await page.locator('[data-grading-status] img,[data-grading-status] script').count()===0&&await page.locator('[data-grading-status]').innerText().then(t=>t.includes('<img')))}
await ctx.close();}
}finally{await browser.close();fs.writeFileSync(`docs/ed-020/protocol-${engine}.json`,JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(c=>!c.passed)}));if(report.checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
