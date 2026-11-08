/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs'),pw=require(process.env.PLAYWRIGHT_CORE||'/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
const {cases}=require('./fixtures.cjs'),engine=process.env.ENGINE||'chromium',base=process.env.BASE||'http://localhost:3118';
const report={engine,phase:process.env.PHASE||'final',checks:[],results:[],errors:[]};
(async()=>{const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROME_PATH||'/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'}:{});
try{report.browser=browser.version();const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base+'/practice',{waitUntil:'networkidle'});
for(const test of cases.filter(test=>process.env.PHASE!=='cleanup-design'||test.id==='react-effect-cleanup')){
 const result=await page.evaluate(({id,code})=>new Promise(resolve=>{
  const frame=document.createElement('iframe');frame.sandbox='allow-scripts';frame.title='ED022 explicit behavioral test';frame.src='/lab-runtime/preview.html';
  let port,timeout;const finish=result=>{clearTimeout(timeout);removeEventListener('message',hello);port?.close();frame.remove();resolve(result)};
  const hello=event=>{if(event.source!==frame.contentWindow||event.origin!=='null'||event.data?.type!=='hello')return;if(event.data.version!==4){finish({type:'incompatible'});return}removeEventListener('message',hello);const channel=new MessageChannel(),session=crypto.randomUUID();port=channel.port1;port.onmessage=({data})=>{if(data.session===session&&data.runId===17&&['grading-result','compile-error','runtime-error'].includes(data.type))finish(data)};frame.contentWindow.postMessage({channel:'explain-dev-lab',version:4,type:'init',session,runId:17,theme:'dark',file:{name:'App.tsx',code},gradingChallengeId:id},'*',[channel.port2]);};
  addEventListener('message',hello);timeout=setTimeout(()=>finish({type:'harness-timeout'}),15000);document.body.append(frame);
 }),test);
 report.results.push({id:test.id,name:test.name,expected:test.expected,result});
 const passed=test.expected==='pass'?result.type==='grading-result'&&result.result.completed&&result.result.results.length===7&&result.result.challengeId===test.id:test.expected==='compile-error'?result.type==='compile-error':result.type!=='harness-timeout'&&result.type!=='incompatible'&&!(result.type==='grading-result'&&result.result.completed);
 report.checks.push({name:test.id+': '+test.name,passed});if(!passed)console.log('FAIL',test.name,JSON.stringify(result));
}
}finally{await browser.close();const out=`docs/ed-022/${engine}`;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/${report.phase}-grading.json`,JSON.stringify(report,null,2)+'\n')}
const failed=report.checks.filter(c=>!c.passed);console.log(JSON.stringify({checks:report.checks.length,failed,errors:report.errors}));if(failed.length||report.errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
