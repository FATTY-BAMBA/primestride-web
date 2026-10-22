/** Browser regression gate. Synthetic cookies and a simulated model; no paid calls. */
import assert from 'node:assert/strict';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {getSessionStatus} from '../src/lib/stridebrain-demo/session-status.js';
import {inviteIdentity,issueGuestSession,guestChatScope,GUEST_COOKIE} from '../src/lib/stridebrain-demo/guest-session.js';
import {setupEnv,invitation,hash,modelId,jar} from './helpers/stridebrain-session-fixtures.mjs';
const {chromium}=await import(process.env.STRIDEBRAIN_PLAYWRIGHT_MODULE||'playwright');
setupEnv();
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'stridebrain-browser-'));
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',tmp+'/key.pem','-out',tmp+'/cert.pem','-subj','/CN=localhost','-days','1'],{stdio:'ignore'});
let fault=null,slow=false,chatFailure=0,exchangeCount=0;
const chats=[],requests=[],errors=[],checks=[];
const publicRoot=path.resolve('public');
const server=https.createServer({key:fs.readFileSync(tmp+'/key.pem'),cert:fs.readFileSync(tmp+'/cert.pem')},async(req,res)=>{
 const pathname=new URL(req.url,'https://localhost').pathname;
 requests.push({path:pathname,referer:req.headers.referer||''});
 const cookies=Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const [k,...v]=x.trim().split('=');return [k,v.join('=')];}));
 const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(pathname==='/api/stridebrain-demo/copilot/status'){
  if(slow)await new Promise(r=>setTimeout(r,800));
  if(fault==='network'){req.socket.destroy();return;}
  if(fault==='503')return json({code:'SESSION_UNAVAILABLE'},503);
  if(fault==='malformed')return json({active:true});
  return json(getSessionStatus(jar(cookies)));
 }
 if(pathname==='/api/stridebrain-demo/copilot/guest-session'&&req.method==='POST'){
  let raw='';for await(const piece of req)raw+=piece;
  const identity=inviteIdentity(JSON.parse(raw).inviteCode);exchangeCount++;
  if(!identity)return json({code:'INVALID_INVITATION'},401);
  res.setHeader('Set-Cookie',`${GUEST_COOKIE}=${issueGuestSession(identity)}; Path=/api/stridebrain-demo; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
  return json({active:true,chatScope:guestChatScope(identity)});
 }
 if(['/api/stridebrain-demo/copilot/guest-session','/api/stridebrain-demo/copilot/session'].includes(pathname)&&req.method==='DELETE'){
  const name=pathname.endsWith('/guest-session')?GUEST_COOKIE:'stridebrain_demo_staff';
  res.setHeader('Set-Cookie',`${name}=; Path=/api/stridebrain-demo; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);return json({active:false});
 }
 if(pathname==='/api/stridebrain-demo/copilot'&&req.method==='POST'){
  let raw='';for await(const piece of req)raw+=piece;
  const body=JSON.parse(raw);chats.push(body);
  if(chatFailure)return json({code:chatFailure===401?'DEMO_ACCESS_DENIED':'PROVIDER_FAILURE',error:'PRIVATE PROVIDER DIAGNOSTICS'},chatFailure);
  const session=getSessionStatus(jar(cookies));
  if(session.state!=='ready')return json({code:'DEMO_ACCESS_DENIED'},401);
  if(!session.allowedModelIds.includes(body.modelId))return json({code:'GUEST_MODEL_NOT_ALLOWED'},403);
  const answer=(body.locale==='en'?'Test response to: ':'測試回覆：')+body.messages.at(-1).content+' [DOC-1006]';
  const result={mode:'openrouter-readonly-demo',modelId:body.modelId,modelLabel:'Test model',answer,sourceIds:['DOC-1006'],actions:['quotes'],asOf:'2026-10-18'};
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store'});
  res.write('event: status\ndata: '+JSON.stringify({message:'Finding relevant business records…'})+'\n\n');
  res.write('event: delta\ndata: '+JSON.stringify({text:answer})+'\n\n');
  res.end('event: result\ndata: '+JSON.stringify(result)+'\n\n');return;
 }
 const file=path.resolve(publicRoot,'.'+pathname);
 if(!file.startsWith(publicRoot+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='https://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const workspace=base+'/stridebrain-demo/index.html?industry=interior&view=copilot';
const report=(name)=>{checks.push(name);console.log('PASS '+name);};
try{
 await page.goto(base+'/stridebrain-demo/guest.html');
 await page.waitForFunction(()=>!document.getElementById('submit').disabled);
 await page.fill('#code',invitation);await page.click('#submit');
 await page.waitForURL('**/index.html?industry=interior&view=copilot');await page.waitForSelector('#sb-composer-input');
 assert.equal(exchangeCount,1);assert.equal(await page.locator('#code,#sb-guest-invite,#copilot-access-token').count(),0);
 const cookie=(await context.cookies(base+'/api/stridebrain-demo/copilot')).find(c=>c.name===GUEST_COOKIE);
 assert.ok(cookie?.httpOnly&&cookie?.secure&&cookie?.sameSite==='Strict');
 assert.ok(!(await page.evaluate(()=>document.cookie)).includes(GUEST_COOKIE));report('one invitation creates protected session; no second code in chat');
 await page.fill('#sb-composer-input','請整理待辦事項');await page.click('.sb-send');await page.waitForSelector('.copilot-gpt-prose');
 assert.equal(chats.length,1);assert.equal(chats[0].locale,'zh-TW');assert.equal(chats[0].modelId,modelId);assert.match(await page.locator('.copilot-gpt-prose').innerText(),/請整理待辦事項/);report('question reaches AI route and displays streamed response with source');
 await page.fill('#sb-composer-input','為什麼？');await page.click('.sb-send');await page.waitForFunction(()=>document.querySelectorAll('.copilot-gpt-prose').length===2);
 assert.equal(chats.at(-1).locale,'zh-TW');assert.ok(chats.at(-1).messages.length>=3);report('Chinese follow-up retains language and conversation');
 await page.reload();await page.waitForSelector('#sb-composer-input');assert.equal(exchangeCount,1);assert.equal(await page.locator('.copilot-gpt-prose').count(),2);report('refresh restores chat without a second invitation');
 await page.click('.sb-model-trigger');assert.equal(await page.locator('.sb-model-option').count(),1);await page.keyboard.press('Escape');report('model selector only shows guest-entitled model');
 await page.click('[data-action="language"][data-value="en"]');await page.fill('#sb-composer-input','What next?');await page.click('.sb-send');await page.waitForFunction(()=>document.querySelectorAll('.copilot-gpt-prose').length===3);assert.equal(chats.at(-1).locale,'en');report('English mode sends explicit locale');
 slow=true;await page.reload();await page.waitForSelector('[data-session-state="checking"]');assert.equal(await page.locator('#ask-form').count(),0);await page.waitForSelector('#sb-composer-input');slow=false;report('slow session check never exposes usable chat early');
 for(const mode of ['503','network','malformed']){
  fault=mode;const before=chats.length;await page.reload();await page.waitForSelector('[data-session-state="error"]');assert.equal(await page.locator('#ask-form').count(),0);assert.equal(chats.length,before);assert.ok(!(await page.locator('body').innerText()).includes('Current recorded quotation'));
  fault=null;await page.click('[data-action="retrySession"]');await page.waitForSelector('#sb-composer-input');assert.equal(exchangeCount,1);report(mode+' verification failure recovers without another invitation or sample answer');
 }
 chatFailure=502;await page.fill('#sb-composer-input','Keep this question');await page.click('.sb-send');await page.waitForSelector('.chat-answer h3');assert.equal(await page.inputValue('#sb-composer-input'),'Keep this question');assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE PROVIDER'));chatFailure=0;report('provider failure retains question and hides diagnostics');
 chatFailure=401;await page.fill('#sb-composer-input','Preserve on expiry');await page.click('.sb-send');await page.waitForSelector('[data-session-state="signed_out"]');assert.equal(await page.inputValue('#sb-held-question'),'Preserve on expiry');assert.equal(await page.locator('#ask-form').count(),0);chatFailure=0;report('expired access stops AI but preserves the draft');
 await page.setViewportSize({width:390,height:844});await page.goto(workspace);await page.waitForSelector('#sb-composer-input');assert.equal(await page.locator('#sb-guest-invite').count(),0);report('mobile guest opens chat without a second code');
 await page.click('[data-action="disableGpt"]');await page.waitForURL('**/guest.html');
 await page.waitForFunction(()=>!document.getElementById('submit').disabled);
 assert.equal((await context.cookies(base+'/api/stridebrain-demo/copilot')).filter(c=>c.name===GUEST_COOKIE).length,0);report('sign-out actually removes the guest session');
 await page.goto(workspace+'#invite='+encodeURIComponent(invitation));await page.waitForSelector('#sb-composer-input');
 assert.equal(new URL(page.url()).hash,'');assert.equal(await page.locator('#code,#sb-guest-invite').count(),0);
 assert.ok(!(await page.evaluate(()=>JSON.stringify(sessionStorage))).includes(invitation));report('invitation link activates automatically and is removed from the address');
 assert.deepEqual(errors,[]);report('no browser JavaScript errors');
 assert.ok(requests.every(r=>!r.path.includes(invitation)&&!r.referer.includes(invitation)));report('invitation never appears in request URLs or referrers');
 const outsider=await browser.newContext({ignoreHTTPSErrors:true});const blank=await outsider.newPage();await blank.goto(workspace);await blank.waitForSelector('[data-session-state="signed_out"]');assert.equal(await blank.locator('#ask-form').count(),0);await outsider.close();report('visitor without a session cannot use AI');
 console.log(JSON.stringify({passed:checks.length,failed:0,provider:'simulated',checks}));
}finally{await browser.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
