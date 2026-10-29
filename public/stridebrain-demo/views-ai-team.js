import {escapeHtml as e} from "./core-model.js";
import {button,source} from "./ui-shared.js";
import {displayRecordText} from "./record-locale.js";
import {listAgents,activeAgentRun,normaliseAiTeamState} from "./ai-team.js";
import {buildContactChannelRegistry,contactIdForName} from "./contact-channels.js";

const formatTime=(value,zh)=>{if(!value)return "—";try{return new Date(value).toLocaleString(zh?"zh-TW":"en-TW",{hour12:false,month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return value;}};
const name=(agent,zh)=>zh?agent.nameZh:agent.nameEn;
const desc=(agent,zh)=>zh?agent.descriptionZh:agent.descriptionEn;
const runFor=(team,agentId)=>team.runs.find(r=>r.agentId===agentId)||null;
const counts=run=>({waiting:run?.items?.filter(x=>x.state!=="completed").length||0,done:run?.items?.filter(x=>x.state==="completed").length||0,total:run?.items?.length||0});
const compactStatus=(run,zh)=>{if(!run)return zh?"準備就緒":"Ready";const c=counts(run);if(c.waiting)return zh?c.waiting+" 項待確認":c.waiting+" awaiting review";if(c.done)return zh?"已完成 "+c.done+" 項":c.done+" completed";return zh?"已完成巡檢":"Review complete";};
const permissions=zh=>[
 {title:zh?"可自動完成":"Automatic",text:zh?"閱讀資料、比對記錄、整理摘要與準備草稿。":"Read records, compare evidence, summarize and prepare drafts."},
 {title:zh?"需要你批准":"Needs approval",text:zh?"建立內部追蹤待辦；外部郵件或 LINE 訊息需在最終預覽後再次批准。":"Create an internal follow-up task; external email or LINE messages require a second approval after final preview."},
 {title:zh?"AI 不會自動做":"Never automatic",text:zh?"未經你批准的對外發訊、修改商務資料、核准報價或付款。":"External sending without your approval, business-record edits, quote approval or payments."}
];
const humanStep=(step,zh)=>{const map={list_priorities:zh?"查看今日優先紀錄":"Review today's priorities",review_coordination:zh?"檢查受阻工作、交期、核准與交接":"Review blockers, deadlines, approvals and handoffs",review_quotations:zh?"檢查報價、成本與試算毛利":"Review quotes, costs and calculated margins",get_project:zh?"檢查專案工作脈絡":"Inspect project context",get_quote:zh?"檢查報價版本":"Inspect quotation versions",get_source:zh?"讀取相關依據":"Read supporting evidence",propose_followup:zh?"準備待批准的追蹤工作":"Prepare approval-required follow-up"};return step?.label||map[step?.tool]||(zh?"查閱工作資料":"Review workspace data");};
const agentDemoCopy=(agentId,zh)=>{
 const map={
  "operations-assistant":{
   launch:zh?"整理今天最需要你決定的事":"Surface what needs your attention today",
   detail:zh?"先掃描優先紀錄、核准與例外，再把需要你判斷的工作整理好。":"Scan priority records, approvals and exceptions, then prepare only the work that needs your judgment.",
   focus:zh?["優先事項","例外","追蹤"]:["Priorities","Exceptions","Follow-ups"],
   eyebrow:zh?"AI 巡檢完成":"AI REVIEW COMPLETE",
   result:n=>zh?n+" 項需要你確認":n+" item"+(n===1?"":"s")+" need your review",
   summary:zh?"我已檢查目前的專案、核准紀錄與相關依據，以下是建議你先確認的事項。":"I reviewed current projects, approval records and supporting evidence. These are the items worth confirming first."
  },
  "project-coordinator":{
   launch:zh?"找出這週最可能卡住的交接":"See what could slip this week",
   detail:zh?"檢查受阻工作、近期交期、待核准事項與已記錄的負責人，先把需要協調的交接抓出來。":"Check recorded blockers, near-term deadlines, pending approvals and owners to surface the handoffs that need coordination.",
   focus:zh?["受阻工作","近期交期","交接"]:["Blockers","Deadlines","Handoffs"],
   eyebrow:zh?"協調巡檢完成":"COORDINATION REVIEW COMPLETE",
   result:n=>zh?n+" 項協調風險值得先處理":n+" coordination risk"+(n===1?"":"s")+" worth clearing",
   summary:zh?"我已比對受阻工作、交期、待核准事項與專案脈絡。以下是最值得先確認負責人、卡點與下一個交接的事項。":"I compared blockers, deadlines, pending approvals and project context. These are the handoffs worth clearing first."
  },
  "quote-margin-guardian":{
   launch:zh?"找出需要人工複核的報價風險":"Find quote risks that need human review",
   detail:zh?"檢查版本、直接成本與試算毛利，只把需要人工判斷的差異交給你。":"Review versions, direct costs and calculated margins, then surface only the differences that need judgment.",
   focus:zh?["版本","直接成本","試算毛利"]:["Versions","Direct cost","Margin"],
   eyebrow:zh?"報價巡檢完成":"QUOTE REVIEW COMPLETE",
   result:n=>zh?n+" 項報價需要你複核":n+" quote review"+(n===1?"":"s")+" need your attention",
   summary:zh?"我已檢查報價版本、直接成本與試算毛利，以下項目值得先確認版本與範圍。":"I reviewed quote versions, direct costs and calculated margins. These are the items worth validating first."
  }
 };
 return map[agentId]||map["operations-assistant"];
};
const controlFlow=zh=>[
 {n:"01",title:zh?"AI 先查核":"AI reviews",detail:zh?"讀取紀錄與來源依據":"Records & source evidence"},
 {n:"02",title:zh?"AI 準備下一步":"AI prepares",detail:zh?"整理風險、草稿與待辦":"Risks, drafts & next steps"},
 {n:"03",title:zh?"由你批准":"You approve",detail:zh?"任何對外動作都停在這裡":"Every external action stops here"},
 {n:"04",title:zh?"留下可查收據":"Receipt logged",detail:zh?"Gmail / LINE 與稽核紀錄":"Gmail / LINE + audit trail"}
];

const receiptFor=(team,itemId,channel="email")=>{
 const current=team.externalReceipts?.find(x=>x.itemId===itemId&&x.channel===channel);
 if(current)return current;
 return channel==="email"?(team.emailReceipts?.find(x=>x.itemId===itemId)||null):null;
};
const verifiedLineIdentityFor=(c,contactName)=>{
 const ref=contactIdForName(contactName);
 return c.lineInbox?.identities?.find(x=>x.status==="verified"&&x.contactRef===ref)||null;
};
function emailComposer(c,item,project,draft,receipt,zh){
 if(receipt){const providerLabel=receipt.provider==="gmail"?"Google Workspace":"Microsoft 365";return '<div class="sb-email-receipt"><strong>'+e(providerLabel)+' '+(zh?'已接受寄送':'accepted for sending')+'</strong><span>'+e(receipt.to)+' · '+e(receipt.subject)+'</span><small>'+e(receipt.receiptId)+' · '+e(receipt.acceptedAt)+'</small></div>';}
 if(c.view.emailDecisionId!==item.id)return '';
 const status=c.emailConnector||{state:"unknown"};
 if(status.state==="checking"||status.state==="unknown")return '<div class="sb-email-composer pending" data-item-id="'+e(item.id)+'"><strong>'+(zh?'正在檢查郵件連線…':'Checking email connection…')+'</strong></div>';
 if(!status.roleAllowed)return '<div class="sb-email-composer blocked" data-item-id="'+e(item.id)+'"><strong>'+(zh?'目前僅限工作人員寄信':'Email sending is staff-only')+'</strong><p>'+(zh?'示範訪客可以查看與準備草稿，但不能觸發外部郵件。':'Demo guests may review and prepare drafts but cannot trigger external email.')+'</p>'+button(zh?'關閉':'Close','agentEmailCancel',item.id,'button-outline')+'</div>';
 if(!status.configured)return '<div class="sb-email-composer blocked" data-item-id="'+e(item.id)+'"><strong>'+(zh?'郵件連線尚未設定':'Email connector is not configured')+'</strong><p>'+(zh?'請先連線 Google Workspace 或設定 Microsoft 365 寄件者；StrideBrain 不會假裝已寄送。':'Connect Google Workspace or configure Microsoft 365 first. StrideBrain will not fake a send.')+'</p>'+button(zh?'關閉':'Close','agentEmailCancel',item.id,'button-outline')+'</div>';
 const subject=(zh?'追蹤｜':'Follow-up | ')+(project?.name||item.projectName)+' · '+item.title;
 return '<div class="sb-email-composer" data-item-id="'+e(item.id)+'"><div class="sb-email-composer-head"><div><small class="sb-label">'+(zh?'外部郵件 · 需要再次批准':'EXTERNAL EMAIL · SECOND APPROVAL REQUIRED')+'</small><h4>'+(zh?'確認寄送內容':'Confirm email before sending')+'</h4></div><span>'+(zh?'不會自動寄出':'Will not auto-send')+'</span></div>'+
  '<label>'+(zh?'寄件者':'From')+'<input value="'+e(status.sender||'')+'" disabled></label>'+
  '<label>'+(zh?'收件者':'To')+'<input name="email-to" type="email" autocomplete="off" placeholder="'+(zh?'輸入已列入白名單的 email':'Enter an allowlisted email')+'"></label>'+
  '<label>'+(zh?'主旨':'Subject')+'<input name="email-subject" maxlength="160" value="'+e(subject)+'"></label>'+
  '<label>'+(zh?'內容':'Message')+'<textarea name="email-body" maxlength="5000" rows="6">'+e(draft)+'</textarea></label>'+
  '<p class="sb-email-warning">'+(zh?'批准後會透過 '+e(status.providerLabel||'已連線郵件服務')+' 寄出 1 封郵件。無附件、無密件副本、無群發。':'Approval sends exactly one email through '+e(status.providerLabel||'the connected email provider')+'. No attachments, BCC or bulk send.')+'</p>'+
  '<div class="sb-email-actions">'+button(zh?'取消':'Cancel','agentEmailCancel',item.id,'button-outline')+button(zh?'批准並寄出 ↗':'Approve & send ↗','agentEmailSend',item.id,'button-primary')+'</div></div>';
}
function lineComposer(c,item,draft,receipt,zh){
 if(receipt)return '<div class="sb-email-receipt"><strong>LINE '+(zh?'已接受寄送':'accepted for sending')+'</strong><span>'+e(receipt.recipientLabel||receipt.contactRef||'Verified LINE contact')+'</span><small>'+e(receipt.receiptId)+' · '+e(receipt.acceptedAt)+'</small></div>';
 if(c.view.lineDecisionId!==item.id)return '';
 const connection=c.messageConnections?.connections?.find(x=>x.id==="line")||null;
 const identity=verifiedLineIdentityFor(c,item.contact);
 if(c.lineInbox?.state==="checking"||c.messageConnections?.state==="checking")return '<div class="sb-email-composer pending sb-line-composer" data-item-id="'+e(item.id)+'"><strong>'+(zh?'正在檢查 LINE 連線與身分…':'Checking LINE connection and identity…')+'</strong></div>';
 if(!connection?.roleAllowed)return '<div class="sb-email-composer blocked sb-line-composer" data-item-id="'+e(item.id)+'"><strong>'+(zh?'目前僅限工作人員透過 LINE 發訊':'LINE sending is staff-only')+'</strong>'+button(zh?'關閉':'Close','agentLineCancel',item.id,'button-outline')+'</div>';
 if(!connection?.configured)return '<div class="sb-email-composer blocked sb-line-composer" data-item-id="'+e(item.id)+'"><strong>'+(zh?'LINE 尚未完成設定':'LINE is not configured')+'</strong>'+button(zh?'關閉':'Close','agentLineCancel',item.id,'button-outline')+'</div>';
 if(!identity)return '<div class="sb-email-composer blocked sb-line-composer" data-item-id="'+e(item.id)+'"><strong>'+(zh?'這位聯絡人尚未有已驗證的 LINE 身分':'This contact has no verified LINE identity')+'</strong><p>'+(zh?'請先在下方「LINE 身分驗證」將收到的 LINE 使用者連結到正確聯絡人。':'First link an observed LINE user to the correct contact in LINE identity review below.')+'</p>'+button(zh?'關閉':'Close','agentLineCancel',item.id,'button-outline')+'</div>';
 return '<div class="sb-email-composer sb-line-composer" data-item-id="'+e(item.id)+'" data-contact-ref="'+e(identity.contactRef)+'"><div class="sb-email-composer-head"><div><small class="sb-label">'+(zh?'外部 LINE 訊息 · 需要再次批准':'EXTERNAL LINE MESSAGE · SECOND APPROVAL REQUIRED')+'</small><h4>'+(zh?'確認 LINE 訊息':'Confirm LINE message')+'</h4></div><span>'+(zh?'不會自動送出':'Will not auto-send')+'</span></div>'+
  '<label>'+(zh?'收件者':'Recipient')+'<input value="'+e(identity.displayName)+'" disabled></label>'+
  '<label>'+(zh?'內容':'Message')+'<textarea name="line-body" maxlength="4000" rows="6">'+e(draft)+'</textarea></label>'+
  '<p class="sb-email-warning">'+(zh?'批准後只會透過 LINE 傳送 1 則文字訊息給此已驗證聯絡人。無群發。':'Approval sends exactly one text message through LINE to this verified contact. No broadcast.')+'</p>'+
  '<div class="sb-email-actions">'+button(zh?'取消':'Cancel','agentLineCancel',item.id,'button-outline')+button(zh?'批准並傳送 ↗':'Approve & send ↗','agentLineSend',item.id,'button-primary')+'</div></div>';
}

function connectionsPanel(c,zh){
 const fallback=[
  {id:"microsoft365",label:"Microsoft 365",channel:"email",implemented:true,configured:false,roleAllowed:false,sender:null},
  {id:"line",label:"LINE Official Account",channel:"line",implemented:true,configured:false,roleAllowed:false,sender:null},
  {id:"google-workspace",label:"Google Workspace",channel:"email",implemented:true,configured:false,roleAllowed:false,sender:null}
 ];
 const data=c.messageConnections?.connections?.length?c.messageConnections.connections:fallback;
 const healthByProvider=c.messageConnections?.healthByProvider||{};
 const registry=buildContactChannelRegistry(c.model.seed),lineIdentities=Array.isArray(c.lineInbox?.identities)?c.lineInbox.identities:[],
  verifiedLine=lineIdentities.filter(x=>x.status==="verified"),pendingLine=lineIdentities.filter(x=>x.status==="pending"),linked=verifiedLine.length;
 const cards=data.map(conn=>{
  const isGoogle=conn.id==="google-workspace",isLine=conn.id==="line";
  const connected=isGoogle?conn.connected===true:conn.configured===true;
  const googleReadError=isGoogle&&conn.connectionState==="error";
  const readyToConnect=isGoogle&&conn.implemented===true&&conn.configured===true&&!connected&&!googleReadError&&conn.roleAllowed===true;
  const planned=conn.implemented!==true,health=healthByProvider[conn.id]||null;
  let status=isGoogle?(connected?(zh?"已連線":"Connected"):googleReadError?(zh?"連線狀態讀取失敗":"Connection status unavailable"):readyToConnect?(zh?"可開始連線":"Ready to connect"):planned?(zh?"下一階段":"Planned next"):(zh?"尚未設定":"Not configured")):
   isLine?(connected?(zh?"已設定 · 可檢查連線":"Configured · ready to verify"):(zh?"可開始安全設定":"Ready for secure setup")):
   connected?(zh?"已設定 · 尚未驗證":"Configured · not verified"):planned?(zh?"下一階段":"Planned next"):(zh?"尚未設定":"Not configured");
  if(health?.state==="checking")status=zh?"正在檢查…":"Checking…";
  else if(health?.state==="error")status=zh?"連線檢查失敗":"Connection check failed";
  else if(health?.ready&&health?.checks?.send?.proven)status=zh?"已完成測試寄送":"Test send proven";
  else if(health?.ready)status=isLine?(zh?"LINE 頻道已驗證":"LINE channel verified"):(zh?"憑證與冪等就緒":"Credentials & idempotency ready");
  const detail=(connected||(isGoogle&&conn.sender))?(conn.sender||conn.channel):(isLine?(zh?"LINE 官方帳號 · 安全 webhook + 已驗證聯絡人":"LINE Official Account · secure webhook + verified contacts"):(isGoogle?(zh?"Gmail / 公司網域信箱":"Gmail / company domain"):(zh?"專用 Microsoft 365 寄件信箱":"Dedicated Microsoft 365 sender")));
  let checks="";
  if(conn.id==="microsoft365"&&health?.state==="ready"){
   const rows=[
    [zh?"設定完整":"Configuration",health.checks?.configuration?.ok],
    [zh?"Redis 冪等":"Redis idempotency",health.checks?.idempotency?.ok],
    [zh?"Entra 認證":"Entra authentication",health.checks?.authentication?.ok],
    [zh?"實際測試寄送":"Controlled test send",health.checks?.send?.proven]
   ];
   checks='<div class="sb-connection-checks">'+rows.map(([label,ok])=>'<span class="'+(ok?'ok':'pending')+'"><b>'+(ok?'✓':'○')+'</b>'+e(label)+'</span>').join('')+'</div>'+
    (health.checks?.send?.lastAcceptedAt?'<small class="sb-last-send">'+(zh?'上次接受寄送：':'Last accepted send: ')+e(health.checks.send.lastAcceptedAt)+'</small>':'');
  }
  const testButton=["microsoft365","line"].includes(conn.id)&&connected&&conn.roleAllowed===true?button(zh?'檢查連線':'Check connection','connectionHealth',conn.id,'button-outline'):'';
  const googleButton=readyToConnect?'<a class="button-outline" href="/api/stridebrain-demo/google/connect">'+(zh?'連線 Google Workspace':'Connect Google Workspace')+'</a>':'';
  return '<article class="sb-connection-card '+(connected?'connected ':'')+(conn.id==="line"?'priority':'')+'"><div><span class="sb-connection-dot"></span><strong>'+e(conn.label)+'</strong></div><small>'+e(status)+'</small><p>'+e(detail)+'</p>'+checks+testButton+googleButton+'</article>';
 }).join('');
 const contactOptions=registry.map(x=>'<option value="'+e(x.contactId)+'" data-name="'+e(x.displayName)+'">'+e(x.displayName)+'</option>').join('');
 const google=data.find(x=>x.id==="google-workspace")||null,line=data.find(x=>x.id==="line")||null,lineHealth=healthByProvider.line||null;
 const googleProof=google?.connected===true?(zh?"已連線":"Connected"):google?.configured===true?(zh?"可連線":"Ready to connect"):(zh?"待設定":"Setup pending");
 const lineProof=lineHealth?.ready?(zh?"頻道已驗證":"Channel verified"):line?.configured===true?(zh?"已設定":"Configured"):(zh?"待設定":"Setup pending");
 const actionProof='<section class="sb-action-proof"><div><div class="suite-eyebrow">'+(zh?"受控對外動作":"CONTROLLED ACTION LAYER")+'</div><h2>'+(zh?"AI 準備，員工批准，系統留下收據":"AI prepares. Your team approves. Every action leaves a receipt.")+'</h2><p>'+(zh?"真正的 Gmail 與 LINE 動作不會藏在聊天裡自動發生；送出前一定有最後一次人工確認。":"Real Gmail and LINE actions never happen invisibly inside chat; a final human approval is always required before sending.")+'</p></div><div class="sb-action-proof-channels"><div><span class="sb-channel-mark google">G</span><strong>Google Workspace</strong><small>'+e(googleProof)+'</small></div><div><span class="sb-channel-mark line">LINE</span><strong>LINE Official Account</strong><small>'+e(lineProof)+'</small></div></div></section>';
 let lineReview='';
 if(c.lineInbox?.state==="checking")lineReview='<div class="sb-identity-note"><strong>'+(zh?'LINE 身分驗證':'LINE identity review')+'</strong><span>'+(zh?'正在載入…':'Loading…')+'</span></div>';
 else if(c.lineInbox?.state==="error")lineReview='<div class="sb-identity-note"><strong>'+(zh?'LINE 身分驗證':'LINE identity review')+'</strong><span>'+(zh?'目前無法讀取':'Unavailable')+'</span></div>';
 else if(pendingLine.length||verifiedLine.length){
  lineReview='<div class="sb-line-identity-review"><div class="sb-line-identity-head"><div><strong>'+(zh?'LINE 身分驗證':'LINE identity review')+'</strong><p>'+(zh?'StrideBrain 不會從名稱猜測 LINE 使用者。工作人員必須明確連結後才可對外發訊。':'StrideBrain never guesses a LINE user from a name. Staff must explicitly link the identity before sending.')+'</p></div><span>'+pendingLine.length+' '+(zh?'待驗證':'pending')+'</span></div>'+
   lineIdentities.map(identity=>{
    const latest=identity.latestMessage?'<blockquote>'+e(identity.latestMessage)+'</blockquote>':'';
    if(identity.status==="verified")return '<div class="sb-line-identity-row verified" data-line-identity-id="'+e(identity.identityId)+'"><div><b>✓ '+e(identity.displayName)+'</b><small>'+(zh?'已驗證 LINE 身分':'Verified LINE identity')+' · '+e(formatTime(identity.verifiedAt,zh))+'</small>'+latest+'</div></div>';
    return '<div class="sb-line-identity-row" data-line-identity-id="'+e(identity.identityId)+'"><div><b>'+(zh?'新的 LINE 使用者':'New LINE user')+'</b><small>'+e(formatTime(identity.latestMessageAt||identity.observedAt,zh))+'</small>'+latest+'</div><div class="sb-line-link-controls"><select name="line-contact-ref" aria-label="'+(zh?'選擇要連結的聯絡人':'Choose contact to link')+'"><option value="">'+(zh?'選擇聯絡人…':'Choose contact…')+'</option>'+contactOptions+'</select>'+button(zh?'驗證並連結':'Verify & link','lineIdentityVerify',identity.identityId,'button-primary')+'</div></div>';
   }).join('')+'</div>';
 }
 return actionProof+'<details class="sb-connections-panel"'+(pendingLine.length?' open':'')+'><summary><div><div class="suite-eyebrow">'+(zh?'連線服務':'CONNECTED CHANNELS')+'</div><h2>'+(zh?'讓 AI 同事接進企業原本使用的工具':'Use the channels your business already works in')+'</h2><p>'+(zh?'Microsoft 365、LINE、Google Workspace 共用同一套批准與稽核規則。':'Microsoft 365, LINE and Google Workspace share the same approval and audit contract.')+'</p></div><span>＋</span></summary><div class="sb-connections-grid">'+cards+'</div>'+lineReview+'<div class="sb-identity-note"><strong>'+(zh?'聯絡人身分':'Contact identities')+'</strong><span>'+registry.length+' '+(zh?'位聯絡人 · ':'contacts · ')+linked+' '+(zh?'個已驗證 LINE 身分':'verified LINE identities')+'</span><p>'+(zh?'未連結的 email / LINE 身分會保持空白，不會從姓名推測或自動產生。':'Unlinked email / LINE identities stay empty; StrideBrain does not infer or invent them from names.')+'</p></div><div class="sb-connections-foot"><small>'+(zh?'示範階段的連線設定目前由伺服器環境管理；正式多租戶版本會改成每家公司獨立連線與加密憑證。':'Pilot connections are currently server-environment backed. Production multi-tenant connections will be organization-scoped with encrypted credentials.')+'</small>'+button(zh?'重新檢查連線 ↻':'Refresh connections ↻','connectionsRefresh','','button-outline')+'</div></details>';
}

export function aiTeamView(c){
 const {model:m,state:s}=c,zh=c.locale!=="en",team=normaliseAiTeamState(s.aiTeam),agents=listAgents();
 s.aiTeam=team;
 const selected=agents.find(a=>a.id===team.activeAgentId)||agents[0],run=activeAgentRun(s,selected.id),t=x=>displayRecordText(x,c.locale);
 const cts=counts(run),externalCount=run?(team.externalReceipts||[]).filter(r=>run.items.some(item=>item.id===r.itemId)).length:0;
 let out='<section class="sb-team-hero"><div><div class="suite-eyebrow">'+(zh?'STRIDEBRAIN · AI 營運團隊':'STRIDEBRAIN · AI OPERATING TEAM')+'</div><h1>'+(zh?'把需要你決定的事<br>準備好再交給你':'Bring you decisions,<br>not busywork')+'</h1><p>'+(zh?'AI 同事先查資料、比對依據、準備下一步。需要判斷或執行的地方，才交回給你。':'AI teammates inspect records, verify evidence and prepare the next step. You only step in where judgment or approval is required.')+'</p></div><div class="sb-team-hero-badge"><span>3</span><small>'+(zh?'位 AI 同事<br>受控執行':'AI teammates<br>controlled execution')+'</small></div></section>';
 out+='<section class="sb-control-flow" aria-label="'+(zh?'AI 到人工批准的工作流程':'AI-to-human approval flow')+'">'+controlFlow(zh).map((x,index)=>'<div><span>'+x.n+'</span><strong>'+e(x.title)+'</strong><small>'+e(x.detail)+'</small>'+(index<3?'<b aria-hidden="true">→</b>':'')+'</div>').join('')+'</section>';
 out+='<section class="section sb-agent-roster"><div class="section-head"><div><h2>'+(zh?'我的 AI 團隊':'My AI team')+'</h2><p>'+(zh?'選一位同事開始工作。':'Choose a teammate to delegate work to.')+'</p></div></div><div class="sb-agent-grid">'+agents.map(agent=>{const ar=runFor(team,agent.id),active=selected.id===agent.id;return '<button type="button" class="sb-agent-card '+(active?'active':'')+'" data-action="agentSelect" data-value="'+e(agent.id)+'" aria-pressed="'+String(active)+'"><div class="sb-agent-card-top"><span class="sb-agent-dot '+(ar?'ready':'idle')+'"></span><span>'+e(name(agent,zh))+'</span><small>'+e(agent.version)+'</small></div><p>'+e(desc(agent,zh))+'</p><div class="sb-agent-card-status"><strong>'+e(compactStatus(ar,zh))+'</strong>'+(ar?'<span>'+e(formatTime(ar.createdAt,zh))+'</span>':'')+'</div></button>';}).join('')+'</div></section>';
 if(!run){
  const demoCopy=agentDemoCopy(selected.id,zh);
  out+='<section class="sb-delegate-card"><div><div class="suite-eyebrow">'+e(name(selected,zh))+'</div><h2>'+e(demoCopy.launch)+'</h2><p>'+e(demoCopy.detail)+'</p><div class="sb-agent-focus">'+demoCopy.focus.map(x=>'<span>'+e(x)+'</span>').join('')+'</div><div class="sb-safe-inline"><span>✓</span>'+(zh?'先查資料與準備工作，不會自動對外發訊或核准商務動作。':'Reviews and prepares first. It will not send externally or approve business actions on its own.')+'</div></div>'+button(zh?'開始今日巡檢 ↗':'Start today’s review ↗','agentRun',selected.id,'button-primary')+'</section>';
  out+='<section class="sb-permission-compact">'+permissions(zh).map((x,i)=>'<div><span>0'+(i+1)+'</span><strong>'+x.title+'</strong><p>'+x.text+'</p></div>').join('')+'</section>';
  out+=connectionsPanel(c,zh);
  return out;
 }
 const pendingPreview=run.items.filter(x=>x.state!=="completed").slice(0,3),demoCopy=agentDemoCopy(selected.id,zh);
 out+='<section class="sb-run-summary"><div class="sb-run-summary-copy"><div class="suite-eyebrow">'+e(run.modelDriven?demoCopy.eyebrow:(zh?'工作整理完成':'WORK REVIEW COMPLETE'))+'</div><h2>'+e(demoCopy.result(cts.waiting))+'</h2><p>'+e(demoCopy.summary)+'</p><div class="sb-summary-preview">'+pendingPreview.map((item,index)=>{const pr=m.project(item.projectId);const selectedDecision=c.view.agentDecisionId===item.id;return '<button type="button" class="'+(selectedDecision?'active':'')+'" data-action="agentDecision" data-value="'+e(item.id)+'" aria-pressed="'+String(selectedDecision)+'"><span>0'+(index+1)+'</span><strong>'+e(t(pr?.name||item.projectName))+'</strong><small>'+e(t(item.title))+'</small></button>';}).join('')+'</div><details class="sb-summary-detail"><summary>'+(zh?'查看 AI 判斷摘要':'View AI reasoning summary')+'</summary><p>'+e(run.basis||'')+'</p></details></div><div class="sb-run-summary-side"><div class="sb-run-summary-metrics"><div><strong>'+cts.waiting+'</strong><span>'+(zh?'待你確認':'awaiting you')+'</span></div><div><strong>'+cts.done+'</strong><span>'+(zh?'已完成':'completed')+'</span></div><div><strong>'+externalCount+'</strong><span>'+(zh?'對外動作':'external actions')+'</span></div></div>'+button(zh?'重新巡檢 ↻':'Run review again ↻','agentRun',selected.id,'button-outline')+'</div></section>';
 out+='<section class="section sb-decision-section"><div class="section-head"><div><div class="suite-eyebrow">'+(zh?'下一步由你決定':'YOUR DECISIONS')+'</div><h2>'+(zh?'待你確認的工作':'Work waiting for you')+'</h2><p>'+(zh?'AI 已經把背景、依據與建議下一步整理好。':'The AI has already organized the context, evidence and proposed next step.')+'</p></div></div><div class="sb-decision-list">'+run.items.map((item,index)=>{const pr=m.project(item.projectId),done=item.state==="completed",draft=zh?item.draftZh:item.draftEn;const rationale=item.rationale||(zh?'根據目前記錄，這項工作值得先確認狀態與下一步。':'Based on the current records, this item is worth confirming before work moves on.');const selectedDecision=c.view.agentDecisionId===item.id,emailReceipt=receiptFor(team,item.id,"email"),lineReceipt=receiptFor(team,item.id,"line"),lineIdentity=verifiedLineIdentityFor(c,item.contact);return '<article class="sb-decision-card '+(done?'done ':'')+(selectedDecision?'selected':'')+'" data-decision-id="'+e(item.id)+'"><div class="sb-decision-head"><div class="sb-decision-index">0'+(index+1)+'</div><div class="sb-decision-title"><span>'+e(t(pr?.name||item.projectName))+'</span><h3>'+e(t(item.title))+'</h3><small>'+e(item.recordId)+' · '+e(item.contact)+'</small></div><div class="sb-decision-state">'+(done?(zh?'已完成 ✓':'Completed ✓'):(zh?'待你確認':'Needs review'))+'</div></div><div class="sb-decision-body"><div><small class="sb-label">'+(zh?'為什麼現在要看':'WHY THIS MATTERS')+'</small><p>'+e(rationale)+'</p></div><div><small class="sb-label">'+(zh?'查核依據':'EVIDENCE')+'</small><div class="sb-agent-sources">'+item.sourceIds.slice(0,8).map(source).join(' ')+'</div></div></div><details class="sb-draft-details"><summary>'+(zh?'查看 AI 準備的草稿':'Review prepared draft')+' <span>＋</span></summary><div><small class="sb-label">'+(item.draftKind==="review"?(zh?'內部複核摘要':'INTERNAL REVIEW NOTE'):(zh?'訊息草稿 · 尚未送出':'MESSAGE DRAFT · NOT SENT'))+'</small><p>'+e(draft)+'</p></div></details><div class="sb-decision-actions">'+(selectedDecision?'<span class="sb-current-context">'+(zh?'目前查看中':'Currently viewing')+'</span>':button(zh?'查看脈絡':'View context','agentDecision',item.id,'button-outline'))+(done?'<span class="notice green">'+e((zh?'已建立追蹤待辦 ':'Created follow-up task ')+item.generatedTaskId)+'</span>':button(zh?'批准並建立待辦 ↗':'Approve & create task ↗','agentExecute',item.id,'button-primary'))+(emailReceipt?'':button(zh?'準備寄信 ✉':'Prepare email ✉','agentEmailPrepare',item.id,'button-outline'))+(lineReceipt||!lineIdentity?'':button(zh?'準備 LINE ↗':'Prepare LINE ↗','agentLinePrepare',item.id,'button-outline'))+'</div>'+emailComposer(c,item,pr,draft,emailReceipt,zh)+lineComposer(c,item,draft,lineReceipt,zh)+'</article>';}).join('')+'</div></section>';
 if(run.modelDriven&&run.timeline?.length){
  out+='<details class="section sb-agent-timeline"><summary><div><div class="suite-eyebrow">'+(zh?'AI 巡檢過程':'AI REVIEW TRACE')+'</div><h2>'+(zh?'查看 AI 剛才做了什麼':'See what the AI just checked')+'</h2><p>'+(zh?'預設收起，避免技術細節干擾你的決策。':'Collapsed by default so technical detail does not get in the way of decisions.')+'</p></div><span class="sb-trace-toggle">＋</span></summary><div class="sb-agent-timeline-list">'+run.timeline.map((step,index)=>'<div><span>0'+(index+1)+'</span><strong>'+e(humanStep(step,zh))+'</strong><small>'+e(step.tool)+'</small></div>').join('')+'</div><p class="secondary-note">'+(zh?'這些步驟只讀取資料與準備提案；尚未執行任何外部動作。':'These steps only read data and prepared proposals; no external action was executed.')+'</p></details>';
 }
 out+='<section class="sb-permission-compact">'+permissions(zh).map((x,i)=>'<div><span>0'+(i+1)+'</span><strong>'+x.title+'</strong><p>'+x.text+'</p></div>').join('')+'</section>';
 out+=connectionsPanel(c,zh);
 return out;
}
