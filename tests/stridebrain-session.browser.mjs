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
let fault=null,slow=false,chatFailure=0,exchangeCount=0,uiResponse=null,emailSendRequests=0;
const chats=[],agentPlans=[],requests=[],errors=[],checks=[];
const publicRoot=path.resolve('public');
const server=https.createServer({key:fs.readFileSync(tmp+'/key.pem'),cert:fs.readFileSync(tmp+'/cert.pem')},async(req,res)=>{
 const pathname=new URL(req.url,'https://localhost').pathname;
 requests.push({path:pathname,referer:req.headers.referer||''});
 const cookies=Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const [k,...v]=x.trim().split('=');return [k,v.join('=')];}));
 const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(pathname==='/api/stridebrain-demo/connections/status'){
  return json({organizationId:'demo-workspace',storage:'pilot-env',activeSession:true,connections:[
   {id:'microsoft365',label:'Microsoft 365',channel:'email',implemented:true,configured:true,enabled:true,roleAllowed:false,sender:'ops@example.com',limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}},
   {id:'line',label:'LINE Official Account',channel:'line',implemented:false,configured:false,enabled:false,roleAllowed:false,sender:null},
   {id:'google-workspace',label:'Google Workspace',channel:'email',implemented:false,configured:false,enabled:false,roleAllowed:false,sender:null}
  ]});
 }
 if(pathname==='/api/stridebrain-demo/messages/send'){
  emailSendRequests++;return json({code:'MESSAGE_STAFF_ONLY'},403);
 }
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
  const body=JSON.parse(raw);
  if(chatFailure)return json({code:chatFailure===401?'DEMO_ACCESS_DENIED':'PROVIDER_FAILURE',error:'PRIVATE PROVIDER DIAGNOSTICS'},chatFailure);
  const session=getSessionStatus(jar(cookies));
  if(session.state!=='ready')return json({code:'DEMO_ACCESS_DENIED'},401);
  if(!session.allowedModelIds.includes(body.modelId))return json({code:'GUEST_MODEL_NOT_ALLOWED'},403);
  if(body.mode==='agent-plan'){
   agentPlans.push(body);
   const common={mode:'agent-plan',agentId:body.agentId,modelId:body.modelId,modelLabel:'Test model',provider:'OpenRouter',asOf:'2026-10-18',executionPolicy:{automatic:['read_records','draft'],approval:['create_internal_task'],blocked:['send_external_message','modify_business_records','approve_quote','payment']}};
   if(body.agentId==='project-coordinator')return json({...common,summary:'已查核專案並準備一項協調工作。',steps:4,
    timeline:[{tool:'list_priorities',status:'completed',label:'已查閱目前優先紀錄'},{tool:'get_project',status:'completed',label:'已查閱專案 PRJ-104'},{tool:'get_source',status:'completed',label:'已讀取依據 REG-WO-1040'},{tool:'propose_followup',status:'prepared',label:'已準備一項需批准的追蹤工作'}],
    proposals:[{projectId:'PRJ-104',recordId:'WO-1040',contact:'Leo Huang',title:'確認交接準備進度',rationale:'交接工作接近記錄到期日，需要確認目前狀態與下一位負責人。',sourceIds:['REG-WO-1040'],draftZh:'請確認 WO-1040 目前進度與下一個交接人。此訊息尚未送出。',draftEn:'Please confirm WO-1040 status and next handoff owner. This message has not been sent.'}]});
   if(body.agentId==='quote-margin-guardian')return json({...common,summary:'已檢查報價版本、直接成本與試算毛利，準備一項內部複核工作。',steps:4,
    timeline:[{tool:'review_quotations',status:'completed',label:'已檢查報價版本、成本與試算毛利'},{tool:'get_quote',status:'completed',label:'已查閱報價 PRJ-101'},{tool:'get_source',status:'completed',label:'已讀取依據 REG-Q-1005'},{tool:'propose_followup',status:'prepared',label:'已準備一項需批准的追蹤工作'}],
    proposals:[{projectId:'PRJ-101',recordId:'Q-1005',contact:'Mei Lin',title:'複核 Q-1005 報價與試算毛利',rationale:'需要確認報價版本、直接成本與試算毛利是否仍為目前可比範圍。',sourceIds:['REG-Q-1005'],draftZh:'請複核 Q-1005 的版本、直接成本與試算毛利；這不是實際獲利判定。',draftEn:'Review Q-1005 version, direct cost and calculated margin; this is not a realized-profit determination.'}]});
   return json({...common,summary:'已查核資料並準備一項追蹤工作。',steps:3,
    timeline:[{tool:'list_priorities',status:'completed',label:'已查閱目前優先紀錄'},{tool:'get_project',status:'completed',label:'已查閱專案 PRJ-101'},{tool:'propose_followup',status:'prepared',label:'已準備一項需批准的追蹤工作'}],
    proposals:[{projectId:'PRJ-101',recordId:'WO-1001',contact:'Mei Lin',title:'確認現場丈量進度',rationale:'工作單接近到期日。',sourceIds:['REG-WO-1001'],draftZh:'請確認 WO-1001 現場丈量目前進度。此訊息尚未送出。',draftEn:'Please confirm WO-1001 status. This message has not been sent.'}]});
  }
  chats.push(body);
  const answer=(body.locale==='en'?'Test response to: ':'測試回覆：')+body.messages.at(-1).content+' [REG-Q-1005] [DOC-1010]';
  const result={mode:'openrouter-readonly-demo',modelId:body.modelId,modelLabel:'Test model',answer,sourceIds:['REG-Q-1005','DOC-1010'],actions:['quotes'],asOf:'2026-10-18',...(uiResponse||{})};
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store'});
  res.write('event: status\ndata: '+JSON.stringify({message:'Finding relevant business records…'})+'\n\n');
  res.write('event: delta\ndata: '+JSON.stringify({text:result.answer})+'\n\n');
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
 assert.doesNotMatch(await page.locator('#inspector').innerText(),/松山|DOC-1006/);
 report('empty conversation does not default to an unrelated featured project');
 const beforeRole=chats.length;await page.click('[data-action="demoRole"][data-value="estimator"]');
 assert.equal(chats.length,beforeRole);assert.match(await page.locator('.sb-role-question').innerText(),/毛利/);
 assert.equal(await page.locator('#copilot-access-token').count(),0);report('optional role selection changes suggestions without login or model request');
 assert.equal(await page.locator('#nav-main > button').count(),7);
 await page.click('#nav-main [data-value="team"]');await page.waitForSelector('.sb-delegate-card');
 assert.match(await page.locator('#main').innerText(),/AI 團隊|AI 營運團隊/);
 await page.locator('.sb-connections-panel summary').click();
 assert.equal(await page.locator('.sb-connection-card').count(),3);
 assert.match(await page.locator('.sb-connections-panel').innerText(),/LINE Official Account/);
 assert.match(await page.locator('.sb-connections-panel').innerText(),/聯絡人身分/);
 assert.equal(await page.locator('[data-action="connectionHealth"]').count(),0);
 assert.equal(await page.locator('.sb-decision-card').count(),0);
 await page.click('[data-action="agentRun"]');await page.waitForSelector('.sb-decision-card');
 assert.equal(agentPlans.length,1);
 assert.equal(agentPlans[0].mode,'agent-plan');
 assert.equal(await page.locator('.sb-decision-card').count(),1);
 assert.equal(await page.locator('[data-action="agentExecute"]').count(),1);
 assert.match(await page.locator('.sb-run-summary').innerText(),/我已檢查目前的專案/);
 assert.equal(await page.locator('.sb-summary-preview button').count(),1);
 assert.equal(await page.locator('.sb-summary-preview button.active').count(),1);
 assert.equal(await page.locator('.sb-decision-card.selected').count(),1);
 assert.match(await page.locator('#inspector').innerText(),/PRJ-101/);
 assert.match(await page.locator('#inspector').innerText(),/REG-WO-1001/);
 await page.locator('.sb-agent-timeline summary').click();
 assert.match(await page.locator('.sb-agent-timeline').innerText(),/已查閱目前優先紀錄/);
 await page.locator('.sb-draft-details summary').first().click();
 assert.match(await page.locator('.sb-draft-details').first().innerText(),/尚未送出/);
 assert.equal(await page.locator('[data-action="agentEmailPrepare"]').count(),1);
 await page.locator('[data-action="agentEmailPrepare"]').click();
 await page.waitForSelector('.sb-email-composer');
 assert.match(await page.locator('.sb-email-composer').innerText(),/目前僅限工作人員寄信/);
 assert.equal(emailSendRequests,0);
 await page.locator('[data-action="agentEmailCancel"]').click();
 await page.locator('[data-action="agentExecute"]').first().click();
 assert.match(await page.locator('.sb-decision-card').first().innerText(),/已完成 ✓/);
 await page.click('[data-action="agentSelect"][data-value="project-coordinator"]');
 assert.equal(await page.locator('.sb-decision-card').count(),0);
 await page.click('[data-action="agentRun"][data-value="project-coordinator"]');await page.waitForSelector('.sb-decision-card');
 assert.equal(agentPlans.length,2);
 assert.equal(agentPlans[1].agentId,'project-coordinator');
 assert.equal(await page.locator('.sb-decision-card').count(),1);
 assert.match(await page.locator('#inspector').innerText(),/PRJ-104/);
 assert.equal(await page.locator('.sb-draft-details').first().evaluate(el=>el.open),true);
 assert.match(await page.locator('.sb-draft-details').first().innerText(),/交接|尚未送出/);
 await page.click('[data-action="agentSelect"][data-value="quote-margin-guardian"]');
 assert.equal(await page.locator('.sb-decision-card').count(),0);
 await page.click('[data-action="agentRun"][data-value="quote-margin-guardian"]');await page.waitForSelector('.sb-decision-card');
 assert.equal(agentPlans.length,3);
 assert.equal(agentPlans[2].agentId,'quote-margin-guardian');
 assert.equal(await page.locator('.sb-decision-card').count(),1);
 assert.ok(await page.locator('.sb-agent-sources [data-id^="REG-Q-"]').count()>=1);
 assert.match(await page.locator('#inspector').innerText(),/Q-1005/);
 await page.locator('.sb-draft-details summary').first().click();
 assert.match(await page.locator('.sb-draft-details').first().innerText(),/毛利|複核/);
 await page.click('#nav-main [data-value="work"]');
 assert.match(await page.locator('#main').innerText(),/AI-WO-OA-/);
 report('shared AI runtime runs operations, project and quote teammates; approval creates only an internal follow-up task');
 await page.click('#nav-main [data-value="overview"]');await page.waitForSelector('[data-priority-id]');
 assert.deepEqual(await page.locator('[data-priority-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.priorityId)),['WO-1001','WO-1040','WO-1049']);
 assert.match(await page.locator('.sb-commercial').innerText(),/試算毛利率/);
 assert.equal(await page.locator('#main [data-action="approval"]').count(),0);
 await page.screenshot({path:'/tmp/stridebrain-overview-desktop.png',fullPage:true});
 report('overview uses shared priority IDs and real commercial records without approval actions');
 await page.click('#nav-main [data-value="copilot"]');await page.waitForSelector('#sb-composer-input');
 await page.fill('#sb-composer-input','請整理待辦事項');await page.click('.sb-send');await page.waitForSelector('.copilot-gpt-prose');
 assert.equal(chats.length,1);assert.equal(chats[0].locale,'zh-TW');assert.equal(chats[0].modelId,modelId);assert.match(await page.locator('.copilot-gpt-prose').innerText(),/請整理待辦事項/);report('question reaches AI route and displays streamed response with source');
 await page.locator('[data-action="source"][data-id="REG-Q-1005"]').first().click();
 assert.match(await page.locator('#inspector').innerText(),/1570800/);
 assert.match(await page.locator('#inspector').innerText(),/377000/);
 report('quotation register source opens exact totals and calculation');
 await page.locator('[data-action="source"][data-id="DOC-1010"]').first().click();
 assert.match(await page.locator('#inspector').innerText(),/60,000/);
 assert.doesNotMatch(await page.locator('#inspector').innerText(),/1,570,800|1570800/);
 report('supplier source remains the incremental estimate, not the project quote');

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
 await page.goto(workspace);await page.waitForSelector('#sb-composer-input');
 if(await page.locator('[data-action="newChat"]').count())await page.click('[data-action="newChat"]');
 const twenty=Array.from({length:20},(_,i)=>'REG-WO-'+(1001+i));
 uiResponse={answer:twenty.map(id=>'檢視 ['+id+']').join('\n'),sourceIds:twenty,context:{mode:'comparison',selectedProjectId:null,candidateProjectIds:['PRJ-101','PRJ-102'],pendingProjectSelection:false}};
 await page.fill('#sb-composer-input','請顯示來源測試');await page.click('.sb-send');await page.waitForSelector('.copilot-gpt-prose');
 assert.equal(await page.locator('#main .copilot-tool-sources [data-action="source"]').count(),20);
 assert.match(await page.locator('#main .copilot-tool-sources strong').innerText(),/20/);
 await page.locator('#main .sb-evidence-more summary').click();
 assert.equal(await page.locator('#main .copilot-gpt-prose [data-id="REG-WO-1020"]').count(),1);
 await page.reload();await page.waitForSelector('.copilot-gpt-prose');
 assert.equal(await page.locator('#main .copilot-tool-sources [data-action="source"]').count(),20);
 report('twenty inline citations remain clickable and survive refresh; source list is collapsed, not truncated');
 await page.click('#nav-main [data-value="projects"]');await page.click('.project-card[data-id="PRJ-104"]');
 await page.click('#nav-main [data-value="copilot"]');
 uiResponse={answer:'森嶼辦公室的專案聯絡人是 Mei Lin。 [REG-PRJ-104]',sourceIds:['REG-PRJ-104'],context:{mode:'project',selectedProjectId:'PRJ-104',candidateProjectIds:['PRJ-104'],pendingProjectSelection:false}};
 await page.fill('#sb-composer-input','下一步找誰確認？');await page.click('.sb-send');
 await page.waitForFunction(()=>document.querySelector('#inspector')?.innerText.includes('REG-PRJ-104'));
 assert.equal(chats.at(-1).selectedProjectId,'PRJ-104');assert.doesNotMatch(await page.locator('#inspector').innerText(),/Songshan|松山|DOC-1006/);
 await page.reload();await page.waitForSelector('#sb-composer-input');
 assert.match(await page.locator('#inspector').innerText(),/PRJ-104/);
 report('explicit project is sent to chat and restored with the matching evidence panel');
 uiResponse=null;await page.click('[data-action="newChat"]');
 assert.doesNotMatch(await page.locator('#inspector').innerText(),/PRJ-104|PRJ-101/);
 report('new conversation clears old project focus and evidence');
 await page.setViewportSize({width:390,height:844});await page.goto(workspace);await page.waitForSelector('#sb-composer-input');assert.equal(await page.locator('#sb-guest-invite').count(),0);report('mobile guest opens chat without a second code');
 await page.click('#nav-main [data-value="overview"]');await page.waitForSelector('.sb-commercial');
 const width=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(width.scroll<=width.client+2,'Mobile page must not overflow horizontally');
 await page.screenshot({path:'/tmp/stridebrain-overview-mobile.png',fullPage:true});
 await page.click('#nav-main [data-value="copilot"]');await page.waitForSelector('#sb-composer-input');
 report('guided overview and commercial records remain usable at mobile width');
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
