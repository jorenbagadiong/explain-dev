/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const zlib = require('node:zlib');
const {chromium} = require(process.env.PLAYWRIGHT_CORE || '/home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/home/joren/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'});
 const result={};
 try{for(const [label,route] of [['article','/frontend/react/use-state'],['practice','/practice/react/use-state-counter']]){
 const context=await browser.newContext();const page=await context.newPage();const files={};
 page.on('response',async response=>{if(response.request().resourceType()==='script'&&response.request().frame()===page.mainFrame()){try{const body=await response.body();files[new URL(response.url()).pathname]={raw:body.length,gzip:zlib.gzipSync(body,{level:9}).length}}catch{}}});
 await page.goto((process.env.BASE||'http://localhost:3118')+route,{waitUntil:'networkidle'});
 if(label==='practice')await page.waitForFunction(()=>document.querySelector('[data-lab-workspace]')?.getAttribute('data-preview-status')==='ready');
 await page.waitForTimeout(200); result[label]={files,raw:Object.values(files).reduce((sum,f)=>sum+f.raw,0),gzip:Object.values(files).reduce((sum,f)=>sum+f.gzip,0)};await context.close();
 }}finally{await browser.close()}
 const runtime=fs.readFileSync('public/lab-runtime/runtime.js');result.runtime={raw:runtime.length,gzip:zlib.gzipSync(runtime,{level:9}).length};
 fs.writeFileSync(`docs/ed-020/${process.argv[2]||'after'}-assets.json`,JSON.stringify(result,null,2)+'\n');console.log(result.runtime);
})().catch(e=>{console.error(e);process.exitCode=1});
