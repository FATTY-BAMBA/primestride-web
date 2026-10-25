import {evidenceList} from "./evidence-presentation.js";
import {DEMO_ROLES} from "./experience-views.js";
import {aiTeamView} from "./views-ai-team.js";
import {runAgent,selectAgent,recordModelAgentPlan,approveAndExecuteAgentAction} from "./ai-team.js";
import {copilotErrorMessage} from "./copilot-errors.js";
import {getPack,listPacks} from "./industry-packs.js";
import {WorkspaceModel,money,calculateVariation,escapeHtml as e,loadDemoState,saveDemoState,resetDemoState,event,setVariationInput,approveVariationGate,commitVariation,buildCustomerReply,reviewCustomerDraft,recordFeedback,markFeedbackReviewed} from "./core-model.js";
import {overview,copilot,projects,knowledge,renderInspector,renderSourceModal} from "./views-primary.js";
import {service,quotes,work,suppliers,approvals,analytics,learning} from "./views-operations.js";
import {createSessionTransport,captureInvitation,createInvitationAttempt} from "./session-client.js";
import {sessionGate} from "./session-view.js";
import {source as sourceButton} from "./ui-shared.js";
import {DEFAULT_MODEL_ID,findAllowedModel} from "./model-catalog.js";
import {safeCopilotMarkdown} from "./copilot-format.js";
import {historyView} from "./views-history.js";
import {playbook} from "./views-playbook.js";
import {readinessView} from "./views-readiness.js";
import {documentIntelligenceView} from "./views-document-intelligence.js";
import {extractDocument,reviewCandidate,editCandidate,approveDocument,reviewReportMarkdown} from "./document-intelligence.js";
import {sampleFile} from "./sample-documents.js";
import {historyBridgeSection} from "./views-history-bridge.js";
import {bridgeDefaults,createSandboxPrecedent,attachSandboxPrecedent,detachSandboxPrecedent,suggestCostCodes} from "./document-history-bridge.js";
import {getReadinessPack,initialReadiness,normalizeReadinessInput,evaluateReadiness,validateReadinessSources} from "./readiness-rules.js";
import {validateIndustryEvidence} from "./industry-evidence.js";
import {validateHistory,historicalDefaults,safeRequest,historicalEstimate,estimateMarkdown} from "./historical-estimator.js";
const sessionTransport=createSessionTransport((...args)=>fetch(...args));
let capturedInvitation=captureInvitation(location,history);
let invitationAttempt=capturedInvitation===null?null:createInvitationAttempt(capturedInvitation,sessionTransport);
capturedInvitation=null;
const $=id=>document.getElementById(id);
let interfaceLocale="zh-TW";
try{interfaceLocale=sessionStorage.getItem("stridebrain-interface-locale")==="en"?"en":"zh-TW";}catch{}
function applyWorkspaceLanguage(){
 document.documentElement.lang=interfaceLocale==="en"?"en":"zh-Hant";
 const labels={overview:["總覽","Overview"],copilot:["StrideBrain 助理","StrideBrain Copilot"],team:["AI 團隊","AI Team"],projects:["專案管理","Projects"],knowledge:["知識中心","Knowledge hub"],service:["客戶服務","Customer service"],quotes:["報價管理","Quotations"],history:["歷史成本估價","Estimate from history"],work:["工作單","Work orders"],suppliers:["材料與供應商","Materials & suppliers"],approvals:["待審核事項","Approvals"],analytics:["營運分析","Analytics"],readiness:["作業檢查","Operational checks"],intake:["文件智慧整理","Document intelligence"],playbook:["產業作業指引","Industry playbook"],learning:["回饋與改善","Learning & feedback"]};
 for(const [name,pair] of Object.entries(labels)){
  const btn=document.querySelector('[data-action="nav"][data-value="'+name+'"]');if(!btn)continue;
  const text=btn.querySelector("#nav-entities,#nav-quotations,#nav-work,#nav-materials");
  if(text)text.textContent=pair[interfaceLocale==="en"?1:0];
  else for(const node of btn.childNodes)if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()){node.textContent=" "+pair[interfaceLocale==="en"?1:0]+" ";break;}
 }
 for(const btn of document.querySelectorAll("[data-action=language]"))btn.setAttribute("aria-pressed",String(btn.dataset.value===interfaceLocale));
 const staticLabels={
  ".switcher-label":["目前示範公司","ACTIVE DEMO COMPANY"],
  ".industry-label":["切換產業示範","Explore a different industry"],
  ".nav-section-label":["工作區","WORKSPACE"],
  ".syn-label":["示範資料","SAMPLE DATA"],
  ".top-menu":["探索知識中心 ↗","Explore knowledge ↗"],
  ".demo-status strong":["示範工作區","DEMO WORKSPACE"],
  ".demo-status small":["示範資料 · 無須建立公司帳戶","Demo data · No company setup required"],
  ".reset-btn":["↺ 重設產業示範","↺ Reset industry demo"],
  ".sidebar-profile small":["示範工作區管理者","Demo workspace owner"]

 };
 for(const [selector,texts] of Object.entries(staticLabels)){
  const node=document.querySelector(selector);if(!node)continue;
  const value=texts[interfaceLocale==="en"?1:0];
  if(selector===".syn-label"){
   const textNode=[...node.childNodes].find(child=>child.nodeType===Node.TEXT_NODE);
   if(textNode)textNode.textContent=" "+value;else node.append(document.createTextNode(" "+value));
  }else node.textContent=value;
 }
 const secondaryLabels={"NEW":["新功能","NEW"],"INTERACTIVE":["可互動","INTERACTIVE"],"RESEARCH":["研究資料","RESEARCH"]};
 document.querySelectorAll(".nav-new").forEach(node=>{
  const key=node.dataset.localeKey||node.textContent.trim();
  if(secondaryLabels[key]){node.dataset.localeKey=key;node.textContent=secondaryLabels[key][interfaceLocale==="en"?1:0];}
 });
 const industrySelector=$("industry-switcher");
 if(industrySelector)industrySelector.setAttribute("aria-label",interfaceLocale==="en"?"Change industry template":"切換產業範例");
 const sidebar=document.querySelector(".sidebar");
 if(sidebar)sidebar.setAttribute("aria-label",interfaceLocale==="en"?"Workspace navigation":"工作區導覽");
 const inspector=$("inspector");
 if(inspector)inspector.setAttribute("aria-label",interfaceLocale==="en"?"Context and source evidence":"工作脈絡與來源依據");
 document.querySelectorAll("[data-nav-zh]").forEach(n=>{n.textContent=interfaceLocale==="en"?n.dataset.navEn:n.dataset.navZh;});
 document.querySelectorAll(".nav-section-label").forEach((label,index)=>{label.textContent=interfaceLocale==="en"?(index===0?"WORKSPACE":"INTELLIGENCE"):(index===0?"工作區":"智慧功能");});
 const page=labels[view.page];if(page)$("page-name").textContent=page[interfaceLocale==="en"?1:0];
}

const requested=new URLSearchParams(location.search).get("industry")||"interior";
let pack=getPack(requested),model=null,state=null,historyData=null,industryEvidence=null,documentSession=null,toastHandle=null,documentLoadVersion=0;
let copilotGuest=false,guestChatScope=null;
let copilotMode="checking",copilotOperatorToken="",copilotConnected=false,copilotBusy=false,copilotRunId=0;
let copilotAccess={state:"checking",allowedModelIds:[]},sessionRefreshRun=0,sessionRefreshPromise=null;
let selectedModelId=DEFAULT_MODEL_ID,copilotModelMenuOpen=false,copilotDraft="";
let view={page:"overview",projectId:null,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null,agentDecisionId:null};
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("visible");
 if(toastHandle)clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("visible"),3500);
}
function context(){return {model,pack,state,view,history:historyData,industryEvidence,documentSession,locale:interfaceLocale,staffAccess:new URLSearchParams(location.search).has("staff"),copilotSession:{access:copilotAccess.state,allowedModelIds:copilotAccess.allowedModelIds,mode:copilotMode,guest:copilotGuest,connected:copilotConnected,busy:copilotBusy,selectedModelId,modelMenuOpen:copilotModelMenuOpen,draft:copilotDraft}};}
const GUEST_CHAT_PREFIX="stridebrain-guest-chat-v1:";
function guestChatKey(industry){return GUEST_CHAT_PREFIX+(copilotGuest?"guest:":"staff:")+guestChatScope+":"+industry;}
function saveGuestChat(){
 if(copilotMode!=="gpt"||!/^[a-f0-9]{24}$/.test(guestChatScope||"")||!["interior","printing"].includes(pack.id))return;
 try{
  const messages=view.chat.filter(m=>m.role==="user"||(m.role==="assistant"&&m.mode==="gpt"&&m.text)).slice(-12).map(m=>m.role==="user"?{role:"user",text:String(m.text||"").slice(0,1200)}:{role:"assistant",mode:"gpt",text:String(m.text||"").slice(0,3800),modelId:String(m.modelId||"").slice(0,100),modelLabel:String(m.modelLabel||"").slice(0,100),sourceIds:Array.isArray(m.sources)?m.sources:[],actions:Array.isArray(m.actions)?m.actions.slice(0,4):[],query:String(m.query||"").slice(0,1200),context:m.context||null});
  sessionStorage.setItem(guestChatKey(pack.id),JSON.stringify(messages));
 }catch{/* Private browsing or unavailable storage: chat remains usable in memory. */}
}
function restoreGuestChat(){
 if(copilotMode!=="gpt"||!/^[a-f0-9]{24}$/.test(guestChatScope||""))return;
 try{
  const stored=JSON.parse(sessionStorage.getItem(guestChatKey(pack.id))||"[]");
  if(!Array.isArray(stored))return;
  view.chat=stored.slice(-12).flatMap(m=>{
   if(m?.role==="user"&&typeof m.text==="string"&&m.text.length<=1200)return [{role:"user",text:m.text}];
   if(m?.role==="assistant"&&m.mode==="gpt"&&typeof m.text==="string"&&m.text.length<=3800){
    const result={answer:m.text,sourceIds:m.sourceIds,actions:m.actions,modelId:m.modelId,modelLabel:m.modelLabel,context:m.context||null};
    return [{role:"assistant",html:gptAnswerCard(result),sources:result.sourceIds,actions:result.actions,query:m.query,modelId:result.modelId,modelLabel:result.modelLabel,text:result.answer,context:result.context||null,mode:"gpt"}];
   }
   return [];
  });
  const restoredProject=view.chat.at(-1)?.context?.selectedProjectId;
  view.copilotProjectId=model.project?.(restoredProject)?.id||null;
 }catch{view.chat=[];}
}
function clearGuestChat(scope=guestChatScope,guest=copilotGuest){
 if(!/^[a-f0-9]{24}$/.test(scope||""))return;
 const prefix=GUEST_CHAT_PREFIX+(guest?"guest:":"staff:")+scope+":";
 try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith(prefix))sessionStorage.removeItem(key);}}catch{}
}
function purgeUnclaimedGuestChats(activeGuestScope){
 try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith(GUEST_CHAT_PREFIX+"guest:")&&!key.startsWith(GUEST_CHAT_PREFIX+"guest:"+activeGuestScope+":"))sessionStorage.removeItem(key);}}catch{}
}
function save(){
 // A user-opened document or derived source must never leak into persistent localStorage.
 // Imported cost sources, imported quote drafts and inquiry metadata stay tab-only.
 const sanitized=documentSession?.imported&&historyData?{...state,historyRequest:historicalDefaults(historyData),historyDraft:null}:state;
 if(!saveDemoState(pack,sanitized))toast("Browser storage unavailable. Changes may not survive a refresh.");
}
function setPage(page,reset=true){
 view.page=page;if(reset){view.search="";view.filter="all";view.pageIndex=0;}
 render();window.scrollTo({top:0,behavior:"smooth"});
}
function pageTitle(){return view.page==="projects"?pack.projectLabel:view.page==="quotes"?pack.quoteLabel:view.page==="work"?pack.orderLabel:{overview:"Overview",copilot:"StrideBrain Copilot",team:"AI Team",knowledge:"Knowledge hub",service:"Customer service",suppliers:"Suppliers",approvals:"Approvals",analytics:"Analytics",learning:"Learning & feedback",history:"Historical estimates",playbook:"Industry playbook",readiness:"Operational checks",intake:"Document intelligence"}[view.page]||"Overview";}
function render(){
 if(!model)return;
 const mapping={overview,copilot,team:aiTeamView,projects,knowledge,service,quotes,work,suppliers,approvals,analytics,learning,history:historyView,playbook,readiness:readinessView,intake:documentIntelligenceView};
 $("main").innerHTML=(view.page==="copilot"&&copilotAccess.state!=="ready"?sessionGate:(mapping[view.page]||overview))(context())+(view.page==="intake"?historyBridgeSection(context()):"");
 $("inspector").innerHTML=renderInspector(context());
 $("page-name").textContent=pageTitle();
 applyWorkspaceLanguage();
 document.querySelectorAll(".sidebar [data-action='nav']").forEach(b=>{b.classList.toggle("active",b.dataset.value===view.page);if(b.dataset.value===view.page&&b.closest("details"))b.closest("details").open=true;});
}
function updateShell(){
 const zh=interfaceLocale!=="en";
 $("company-name").textContent=zh?pack.company:pack.companyEn;$("company-subtitle").textContent=zh?(pack.id==="printing"?"商用印刷 · 示範工作區":"室內設計 · 示範工作區"):(pack.company+" · "+pack.short);$("company-avatar").textContent=pack.symbol;
 $("owner-name").textContent=pack.owner;$("owner-initials").textContent=pack.ownerInitials;$("top-company").textContent=zh?pack.company:pack.companyEn;
 $("nav-entities").textContent=pack.projectLabel;$("nav-quotations").textContent=pack.quoteLabel;$("nav-work").textContent=pack.orderLabel;$("nav-materials").textContent=pack.materialLabel;
 $("industry-switcher").innerHTML=listPacks().map(p=>'<option value="'+e(p.id)+'"'+(p.id===pack.id?" selected":"")+'>'+e(zh?(p.id==="printing"?"印刷與包裝":"室內設計"):p.name)+" · "+e(zh?p.company:p.companyEn)+"</option>").join("");
 document.title="StrideBrain · "+(zh?pack.company:pack.companyEn)+(zh?" | 營運示範":" | SME Demo");
}
async function loadIndustry(id){
 saveGuestChat();
 copilotRunId++;copilotConnected=false;copilotOperatorToken="";copilotBusy=false;copilotModelMenuOpen=false;copilotDraft="";
 documentLoadVersion++; // cancel any in-flight local file parsing on industry switch
 const next=getPack(id),previous={pack,model,state,view,historyData,industryEvidence,documentSession};
 $("main").innerHTML='<div class="loading-screen"><div class="loader-ring"></div><h2>'+(interfaceLocale==="en"?"Opening ":"正在開啟 ")+e(interfaceLocale==="en"?next.short:(next.id==="printing"?"印刷與包裝":"室內設計"))+'</h2><p>'+(interfaceLocale==="en"?"Connecting an industry pack to the shared operating workspace…":"正在載入產業示範資料與工作區…")+'</p></div>';
 try{
  // Load independent demo assets concurrently; a stalled asset must not spin forever.
  const assets=[next.dataset,"./seeds/source-enrichment.json","./seeds/historical-"+next.id+".json","./seeds/taiwan-industry-evidence.json"];
  const datasets=await Promise.all(assets.map(async path=>{
   const response=await fetch(path,{cache:"force-cache",signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error("Demo data unavailable ("+response.status+"): "+path);
   return response.json();
  }));
  const [seed,enriched,historyPack,curated]=datasets;
  const overrides=enriched[next.id]||{};
  for(const document of seed.documents){if(Object.prototype.hasOwnProperty.call(overrides,document.id))document.body=overrides[document.id];}
  validateHistory(historyPack);
  const existing=new Set(seed.documents.map(d=>d.id));
  for(const document of historyPack.documents){if(!existing.has(document.id))seed.documents.push(document);}
  validateIndustryEvidence(curated);
  const industryDocuments=curated.documents.filter(d=>d.industry===next.id);
  for(const document of industryDocuments){
    if(!existing.has(document.id)){seed.documents.push(document);existing.add(document.id);}
  }
  const verified=new WorkspaceModel(seed,next);
  validateReadinessSources(getReadinessPack(next.id),verified);
  pack=next;model=verified;historyData=historyPack;industryEvidence=curated;state=loadDemoState(pack);
  state.historyRequest=safeRequest(historyData,state.historyRequest||historicalDefaults(historyData));
  state.readiness=state.readiness||{};
  state.readiness.inputs=normalizeReadinessInput(pack.id,state.readiness.inputs||initialReadiness(pack.id));
  documentSession=null;
  // A shareable ?view=copilot preview opens directly to the conversational
  // landing without changing the Overview default for existing customers.
  const preferCopilot=new URLSearchParams(location.search).get("view")==="copilot"||view.page==="copilot";
  view={page:preferCopilot?"copilot":"overview",projectId:pack.scenario.projectId,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null};
  const url=new URL(location.href);url.searchParams.set("industry",pack.id);history.replaceState({industry:pack.id},"",url);
  if(copilotMode==="gpt")restoreGuestChat();
  updateShell();render();toast(pack.name+" template loaded · "+model.seed.documents.length+" example source records.");
  window.dispatchEvent(new Event("stridebrain:ready"));
 }catch(error){
  pack=previous.pack;model=previous.model;state=previous.state;historyData=previous.historyData;industryEvidence=previous.industryEvidence;documentSession=previous.documentSession;view=previous.view;
  if(model){updateShell();render();toast("Could not load the selected industry: "+error.message);}
  else $("main").innerHTML='<div class="panel"><h2>Demo could not start</h2><p>'+e(error.message)+'</p><p>Try refreshing the preview. No live company data is involved.</p></div>';
 }
}
function gptAnswerCard(result){
 const zh=interfaceLocale!=="en";
 const content=String(result?.answer||"").slice(0,3800);
 const ids=[...new Set((Array.isArray(result.sourceIds)?result.sourceIds:[]).filter(id=>!!model.document(id)))];
 const paragraphs=safeCopilotMarkdown(content).replace(/\[([A-Z][A-Z0-9-]{2,85})\]/g,(full,id)=>ids.includes(id)?sourceButton(id):full);
 const allowed=new Set(["overview","projects","knowledge","quotes","work","suppliers","approvals","analytics","history","playbook","service"]);
 const actions=[...new Set((Array.isArray(result.actions)?result.actions:[]).filter(a=>allowed.has(a)))].slice(0,4);
 const labelMap=zh?{overview:"營運總覽",projects:"查看專案",knowledge:"查看知識資料",quotes:"查看報價",work:"工作單",suppliers:"供應商",approvals:"待審核事項",analytics:"營運分析",history:"歷史成本估價",playbook:"產業作業指引",service:"客戶回覆"}:{overview:"Business overview",projects:"Explore projects",knowledge:"Inspect knowledge",quotes:"Review quotes",work:"Work orders",suppliers:"Suppliers",approvals:"Pending approvals",analytics:"Analytics",history:"Past project estimates",playbook:"Industry playbook",service:"Customer replies"};
 return '<div class="answer-card"><div class="suite-eyebrow">'+e(result.modelLabel||"AI model")+' · '+(zh?'AI 回覆':'AI answer')+'</div><div class="copilot-gpt-prose">'+paragraphs+'</div>'+
  evidenceList(ids,model,interfaceLocale)+
  (actions.length?'<div class="answer-actions">'+actions.map(a=>'<button type="button" class="button-secondary" data-action="nav" data-value="'+a+'">'+e(labelMap[a])+' ↗</button>').join("")+'</div>':'')+
  '<p class="disclosure">'+(zh?'示範資料 · ':'Sample data · ')+e(result.asOf||"2026-10-18")+'</p></div>';
}
async function ask(question){
 const text=String(question||"").trim();if(!text||copilotBusy)return;
 if(copilotAccess.state!=="ready"||copilotMode!=="gpt"){
  copilotDraft=text;view.page="copilot";render();return;
 }
 if(!copilotAccess.allowedModelIds.includes(selectedModelId)){
  copilotDraft=text;await restoreStaffPreview();return;
 }
 copilotDraft="";copilotModelMenuOpen=false;
 view.chat.push({role:"user",text});
 view.page="copilot";view.docId=null;
 const active=++copilotRunId,activeIndustry=pack.id,activeModel=selectedModelId,activeLocale=interfaceLocale;
 const recent=view.chat.filter(m=>m.role==="user"||(m.role==="assistant"&&m.mode==="gpt"&&m.text))
  .slice(-12).map(m=>({role:m.role,content:String(m.text||"").slice(0,m.role==="user"?1200:1800)}));
 copilotBusy=true;
 const index=view.chat.length;
 view.chat.push({role:"assistant",html:'<div class="answer-card"><p class="muted">'+(activeLocale==='en'?'Reviewing the relevant records…':'正在查閱相關資料…')+'</p></div>',sources:[],query:text,mode:"gpt",pending:true});
 render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
 try{
  const response=await fetch("/api/stridebrain-demo/copilot",{
   method:"POST",cache:"no-store",credentials:"same-origin",
   headers:{"Content-Type":"application/json","Accept":activeModel.startsWith("openai-direct/")?"application/json":"text/event-stream"},
   body:JSON.stringify({industry:activeIndustry,messages:recent,modelId:activeModel,locale:activeLocale,selectedProjectId:view.copilotProjectId||null})
  });
  let result;
  if(response.ok&&response.headers.get("content-type")?.includes("text/event-stream")){
   if(!response.body)throw Error("No streaming response was received.");
   const reader=response.body.getReader(),decoder=new TextDecoder();
   let buffer="",draft="",completed=false,streamMetrics=null;
   let shown=0,painting=false;
   const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   const paintDraft=()=>{
    painting=false;
    if(active!==copilotRunId||pack.id!==activeIndustry)return;
    const node=document.querySelector('[data-streaming-answer="'+index+'"]');
    if(!node)return;
    // Reveal text already received. Do not fabricate provider tokens.
    shown=reducedMotion?draft.length:Math.min(draft.length,shown+Math.max(6,Math.ceil((draft.length-shown)/9)));
    node.textContent=draft.slice(0,shown);
    if(shown<draft.length){painting=true;requestAnimationFrame(paintDraft);}
   };
   const updateDraft=()=>{if(!painting){painting=true;requestAnimationFrame(paintDraft);}};
   const finishDraft=()=>new Promise(resolve=>{
    if(reducedMotion){shown=draft.length;updateDraft();resolve();return;}
    const deadline=performance.now()+1400;
    const check=()=>{if(active!==copilotRunId||shown>=draft.length||performance.now()>deadline){shown=draft.length;const node=document.querySelector('[data-streaming-answer="'+index+'"]');if(node)node.textContent=draft;resolve();}else requestAnimationFrame(check);};
    check();
   });
   view.chat[index].html='<div class="answer-card"><div class="suite-eyebrow">'+(activeLocale==='en'?'Preparing your answer':'正在整理回覆')+'</div><p class="disclosure">'+(activeLocale==='en'?'Sources will appear with the completed answer.':'回覆完成後將顯示資料來源。')+'</p><div class="copilot-stream-text" data-streaming-answer="'+index+'" aria-live="polite"></div></div>';
   render();
   while(true){
    const chunk=await reader.read();if(chunk.done)break;
    buffer+=decoder.decode(chunk.value,{stream:true});
    if(buffer.length>100000)throw Error("Invalid streaming response.");
    let end;
    while((end=buffer.indexOf("\n\n"))>=0){
     const event=buffer.slice(0,end);buffer=buffer.slice(end+2);
     const type=(event.match(/^event:\s*(.+)$/m)||[])[1];
     const dataLine=event.split("\n").find(line=>line.startsWith("data:"));
     if(!dataLine)continue;
     let data;try{data=JSON.parse(dataLine.slice(5).trim());}catch{continue;}
     if(type==="status"&&typeof data.message==="string"){
      const note=document.querySelector('[data-streaming-answer="'+index+'"]')?.previousElementSibling;
      if(note)note.textContent=activeLocale==="en"?data.message.slice(0,130):(/Writing/.test(data.message)?"正在整理回覆…":"正在查閱相關資料…");
     }else if(type==="delta"&&typeof data.text==="string"){
      draft=(draft+data.text).slice(0,3800);
      updateDraft();
     }else if(type==="metrics"){streamMetrics=data;}else if(type==="result"){result=data;completed=true;}
     else if(type==="error"){const error=new Error("Chat response interrupted");error.code=data.code;throw error;}
    }
   }
   if(!completed)throw Error("The streaming response ended before completion.");
   await finishDraft();
   if(streamMetrics)console.info("stridebrain_stream_metrics",streamMetrics);
  }else{
   result=await response.json();
   if(!response.ok){const error=new Error("Chat request failed");error.code=result.code;error.status=response.status;throw error;}
  }
  if(active!==copilotRunId||pack.id!==activeIndustry)return;
  if(!["gpt-readonly-demo","openrouter-readonly-demo"].includes(result.mode)||typeof result.answer!=="string"||result.modelId!==activeModel)throw Error("Unexpected model server response.");
  copilotConnected=true;
  view.chat[index]={role:"assistant",html:gptAnswerCard(result),sources:result.sourceIds,query:text,mode:"gpt",modelId:result.modelId,modelLabel:result.modelLabel,text:result.answer,actions:result.actions,context:result.context||null};
  if(result.context)view.copilotProjectId=model.project(result.context.selectedProjectId)?.id||null;
 }catch(err){
  if(active!==copilotRunId||pack.id!==activeIndustry)return;
  // Temporary provider failures must not erase a valid staff session or mix
  // synthetic sample answers into an incomplete real AI conversation.
  copilotConnected=false;
  copilotDraft=text;
  const message=copilotErrorMessage(err?.code,interfaceLocale);
  view.chat[index]={role:"assistant",html:'<div class="answer-card"><h3>'+(interfaceLocale==="en"?"Answer not completed":"回覆尚未完成")+'</h3><p>'+e(message)+'</p><button type="button" class="button-secondary" data-action="ask" data-prompt="'+e(text)+'">'+(interfaceLocale==="en"?"Retry question":"重試問題")+'</button></div>',sources:[],query:text,mode:"error",text:""};
  if(err?.status===401||err?.code==="DEMO_ACCESS_DENIED"){
   clearGuestChat();guestChatScope=null;view.chat=[];
   copilotAccess={state:"signed_out",allowedModelIds:[],code:"SESSION_EXPIRED"};copilotMode="signed_out";
  }
  if(err?.code==="GUEST_MODEL_NOT_ALLOWED"||err?.code==="MODEL_NOT_ALLOWED"){
   copilotAccess={state:"error",allowedModelIds:[]};copilotMode="error";
  }
  toast(message);
 }finally{
  if(active===copilotRunId){copilotBusy=false;saveGuestChat();render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});}
 }
}
function openSource(id){
 if(!model.document(id)){toast("Source document not found.");return;}
 view.docId=id;render();
 if(window.matchMedia("(max-width:1250px)").matches){
  $("evidence-overlay").innerHTML=renderSourceModal(model.document(id),industryEvidence);$("evidence-overlay").classList.add("show");
 }else toast("Source opened in the evidence panel.");
}
function closeSource(){
 view.docId=null;const modal=$("evidence-overlay");modal.classList.remove("show");modal.innerHTML="";render();
}
function downloadSource(id){
 const d=model.document(id);if(!d)return;
 const blob=new Blob([d.body],{type:"text/markdown;charset=utf-8"}),url=URL.createObjectURL(blob);
 const link=document.createElement("a");link.href=url;link.download=d.id+".md";document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function copyReviewedDraft(){
 if(!state.customerDraft.reviewed){toast("Review the current draft before copying.");return;}
 try{await navigator.clipboard.writeText(state.customerDraft.text);toast("Reviewed sample draft copied. No message was sent.");}
 catch{toast("Clipboard unavailable. You may select the text manually.");}
}

function downloadLocal(file){
 const blob=new Blob([file.bytes],{type:file.type}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=file.filename;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function detachImported(){
 const current=documentSession?.imported;
 if(!current||!historyData||!model)return;
 detachSandboxPrecedent(historyData,model,current.record.id);
 if(view.docId===current.document.id)view.docId=null;
 documentSession.imported=null;
 state.historyDraft=null;
 state.historyRequest=historicalDefaults(historyData); // do not persist imported project metadata on removal
 save();
}
async function handleDocument(file){
 if(!file||!model)return;
 detachImported();
 const run=++documentLoadVersion,sourceIndustry=pack.id;
 documentSession={loading:true,error:null,report:null,reviewNote:"",bridgeForm:null,imported:null};
 setPage("intake");
 try{
  const report=await extractDocument(file);
  if(run!==documentLoadVersion||pack.id!==sourceIndustry)return;
  documentSession={loading:false,error:null,report,reviewNote:"",bridgeForm:bridgeDefaults(report,historyData,pack.id),imported:null};
  render();toast("Extracted local file. Review every source value before using it.");
 }catch(err){
  if(run!==documentLoadVersion||pack.id!==sourceIndustry)return;
  documentSession={loading:false,error:String(err?.message||err),report:null,reviewNote:"",bridgeForm:null,imported:null};
  render();toast("Unable to read file. Check the source or try a sample file.");
 }
}
async function runModelDrivenOperationsPlan(){
 if(copilotMode!=="gpt"||copilotAccess.state!=="ready"||!copilotAccess.allowedModelIds.includes(selectedModelId)||selectedModelId.startsWith("openai-direct/"))return {ok:false,reason:interfaceLocale==="en"?"An approved OpenRouter model session is required for model-driven planning.":"模型驅動規劃需要已授權的 OpenRouter 模型工作階段。"};
 const goal=interfaceLocale==="en"?"Review the current workspace priorities, inspect the evidence you need, and prepare up to three useful internal follow-ups for my approval.":"請檢查目前工作區最需要關注的事項，查閱必要依據，並準備最多三項需要我批准的內部追蹤工作。";
 try{
  const response=await fetch("/api/stridebrain-demo/copilot",{method:"POST",cache:"no-store",credentials:"same-origin",
   headers:{"Content-Type":"application/json","Accept":"application/json"},
   body:JSON.stringify({industry:pack.id,messages:[{role:"user",content:goal}],modelId:selectedModelId,locale:interfaceLocale,mode:"agent-plan",agentId:"operations-assistant"})
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok)return {ok:false,reason:copilotErrorMessage(payload?.code,interfaceLocale)};
  return recordModelAgentPlan(state,model,payload);
 }catch{return {ok:false,reason:interfaceLocale==="en"?"The AI teammate planning request could not be completed.":"AI 同事目前無法完成規劃請求。"};}
}
async function perform(el){
 const action=el.dataset.action,id=el.dataset.id||"",value=el.dataset.value||"";
 if(action==="retrySession"){if(!copilotBusy)await restoreStaffPreview();return;}
 if(action==="agentSelect"){
  const result=selectAgent(state,value||id);if(result.ok){save();view.page="team";view.agentDecisionId=null;render();}else toast(result.reason);return;
 }
 if(action==="agentDecision"){
  view.agentDecisionId=value||id;view.docId=null;render();return;
 }
 if(action==="agentRun"){
  const agentId=value||state.aiTeam?.activeAgentId;
  const result=agentId==="operations-assistant"?await runModelDrivenOperationsPlan():runAgent(state,model,agentId);
  if(!result.ok){toast(result.reason);return;}
  save();view.page="team";view.agentDecisionId=result.run.items.find(x=>x.state!=="completed")?.id||result.run.items[0]?.id||null;render();toast(interfaceLocale==="en"?result.run.items.length+" actions prepared for review.":"AI 同事已準備 "+result.run.items.length+" 項工作，等你確認。");return;
 }
 if(action==="agentExecute"){
  const result=approveAndExecuteAgentAction(state,value||id);
  if(result.ok){save();render();toast(interfaceLocale==="en"?"Approved action completed and follow-up task created.":"已批准並完成動作，追蹤待辦已建立。");}
  else toast(result.reason);return;
 }
 if(action==="demoRole"){
  if(!DEMO_ROLES[value])return;
  view.demoRole=value;render();return;
 }
 if(action==="focusQuestion"){
  const project=model.project(id);if(!project)return;
  view.copilotProjectId=project.id;view.projectId=project.id;view.docId=null;
  await ask(el.dataset.prompt||project.id);return;
 }
 if(action==="language"){interfaceLocale=value==="en"?"en":"zh-TW";try{sessionStorage.setItem("stridebrain-interface-locale",interfaceLocale);}catch{}updateShell();render();return;}
 if(action==="nav"){copilotModelMenuOpen=false;view.projectDetail=false;setPage(value);}
 else if(action==="modelMenu"){
   if(copilotBusy)return;
   copilotModelMenuOpen=!copilotModelMenuOpen;render();
   if(copilotModelMenuOpen)document.querySelector(".sb-model-option.selected")?.focus();
   else document.querySelector(".sb-model-trigger")?.focus();
 }
 else if(action==="modelSelect"){
   if(copilotBusy)return;
   const chosen=findAllowedModel(value);
   if(!chosen||copilotAccess.state!=="ready"||!copilotAccess.allowedModelIds.includes(chosen.id)){return;}
   selectedModelId=chosen.id;copilotModelMenuOpen=false;copilotConnected=false;
   render();document.querySelector(".sb-model-trigger")?.focus();
   toast(copilotMode==="gpt"?"Selected "+chosen.label+" for the next authorized model request.":"Selected "+chosen.label+". Staff AI access is required to use this model. The sample response mode remains available.");
 }
 else if(action==="newChat"){
   if(copilotBusy){toast("Wait for the current answer or disconnect first.");return;}
   copilotRunId++;view.chat=[];view.copilotProjectId=null;view.docId=null;copilotDraft="";copilotModelMenuOpen=false;saveGuestChat();render();
   toast("Started a new local conversation.");
 }
 else if(action==="project"){
  if(model.project(id))view.copilotProjectId=id;
  const key=id||value;if(!model.project(key))return;view.projectId=key;view.projectDetail=true;setPage("projects");
 }else if(action==="intakeFixture"){
  try{downloadLocal(sampleFile(pack.id,value));toast("Sample "+value.toUpperCase()+" file downloaded. Select it in Document Intelligence to test.");}
  catch(err){toast("Cannot create sample: "+err.message);}
 }else if(action==="intakeClear"){
  if(documentSession?.report&&!confirm("Clear the extracted document and any linked temporary cost precedent?"))return;
  documentLoadVersion++;detachImported();
  documentSession=null;render();toast("Local document and any derived precedent cleared from this tab.");
 }else if(action==="intakeRow"){
  const report=documentSession?.report;if(!report)return;
  detachImported();const result=reviewCandidate(report,id,value);
  if(result.ok){documentSession.bridgeForm=bridgeDefaults(report,historyData,pack.id);render();toast("Line item review decision recorded in this tab.");}else toast(result.reason);
 }else if(action==="intakeApprove"){
  const report=documentSession?.report;if(!report)return;
  detachImported();const result=approveDocument(report,documentSession?.reviewNote||"");
  if(result.ok){documentSession.bridgeForm=bridgeDefaults(report,historyData,pack.id);render();toast(result.mode==="TEXT_EXTRACTION_REVIEW"?"Text extraction reviewed; no quotation was generated.":"Extracted cost draft reviewed locally. No customer quote was sent.");}
  else toast(result.reason);
 }else if(action==="intakeExport"){
  const report=documentSession?.report;
  if(!report?.reviewed){toast("Human review is required before export.");return;}
  const content=reviewReportMarkdown(report,pack.id);
  const filename="StrideBrain-"+pack.id+"-reviewed-extraction.md";
  downloadLocal({filename,type:"text/markdown;charset=utf-8",bytes:new TextEncoder().encode(content)});
  toast("Reviewed extraction exported with original source references.");
 }else if(action==="bridgeSuggest"){
   const report=documentSession?.report;if(!report?.reviewed)return;
   const form=documentSession.bridgeForm||bridgeDefaults(report,historyData,pack.id);
   form.codeMapping={...form.codeMapping,...suggestCostCodes(report,historyData,pack.id)};
   documentSession.bridgeForm=form;render();
   toast("Cost categories suggested from line descriptions. Verify every mapping.");
 }else if(action==="bridgeCommit"){
   const report=documentSession?.report,form=documentSession?.bridgeForm;
   if(!report||!form){toast("Review a document first.");return;}
   const result=createSandboxPrecedent(report,historyData,form);
   if(!result.ok){toast(result.issues?.[0]||"Cannot create sandbox precedent.");render();return;}
   const attached=attachSandboxPrecedent(historyData,model,result);
   if(!attached.ok){toast(attached.reason);return;}
   documentSession.imported=result;
   state.historyRequest=safeRequest(historyData,{...state.historyRequest,category:form.category,tier:form.tier,location:form.location,quantity:form.jobQuantity,scope:result.record.scope,inquiry:""});
   state.historyDraft=null;
   event(state,"A sample cost example was added to this browser workspace after review.");
   save();setPage("history");
   toast("Temporary sandbox precedent added. Not a verified real-world cost.");
 }else if(action==="bridgeRemove"){
   detachImported();render();toast("Session-only historical example removed. Original upload remains in the tab until cleared.");
 }else if(action==="flowStep"){view.flowStep=value;render();}
 else if(action==="readinessReset"){
   state.readiness.inputs=initialReadiness(pack.id);state.readiness.assessment=null;
   if(state.readiness.reviewTaskCreated)state.tasks[state.readiness.reviewTaskId]="Blocked";
   event(state,"Manual screening reset; any prior assessment became stale.");save();render();toast("Screening reset. Existing follow-up work remains for review.");
 }
 else if(action==="readinessRecord"){
   const result=evaluateReadiness(pack.id,state.readiness.inputs);
   state.readiness.assessment={...result,recordedAt:new Date().toLocaleString("en-TW",{hour12:false})};
   if(state.readiness.reviewTaskCreated)state.tasks[state.readiness.reviewTaskId]=result.counts.hold>0?"Blocked":"Upcoming";
   event(state,"Manually entered "+pack.id+" readiness screen: "+result.counts.hold+" holds, "+result.counts.review+" reviews.");
   save();render();toast("Assessment recorded. Not a technical certification.");
 }
 else if(action==="readinessCreateTask"){
   const config=getReadinessPack(pack.id),assessment=state.readiness.assessment;
   if(!assessment||JSON.stringify(assessment.inputs)!==JSON.stringify(evaluateReadiness(pack.id,state.readiness.inputs).inputs)){toast("Record the current assessment before creating a follow-up.");return;}
   if(state.readiness.reviewTaskCreated){toast("Review task already exists in Work Orders.");return;}
   state.readiness.reviewTaskCreated=true;
   state.readiness.reviewTaskId=config.reviewWorkId;state.readiness.reviewTaskTitle=config.reviewWorkTitle;
   state.readiness.reviewTaskSourceId=config.workSourceId;
   state.tasks[config.reviewWorkId]=assessment.counts.hold>0?"Blocked":"Upcoming";
   event(state,"Created linked review item "+config.reviewWorkId+" for "+config.project+" from manual readiness findings.");
   save();render();toast("Linked "+config.reviewWorkId+" to the example work-order register.");
 }
 else if(action==="enableGpt"){
   const token=$("copilot-access-token")?.value?.trim()||"";
   if(token.length<20){toast(interfaceLocale==="en"?"Enter your staff access code.":"請輸入內部人員存取碼。");return;}
   try{
    await sessionTransport.request("/api/stridebrain-demo/copilot/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});
    const field=$("copilot-access-token");if(field)field.value="";
    await restoreStaffPreview();
   }catch{toast(interfaceLocale==="en"?"Sign-in could not be completed. Please retry.":"登入未完成，請重試。");}
 }else if(action==="disableGpt"){
   sessionRefreshRun++;sessionRefreshPromise=null;copilotRunId++;copilotBusy=false;copilotConnected=false;
   invitationAttempt?.clear();invitationAttempt=null;
   copilotAccess={state:"checking",allowedModelIds:[]};copilotMode="checking";render();
   try{
    await Promise.all(["/api/stridebrain-demo/copilot/guest-session","/api/stridebrain-demo/copilot/session"].map(url=>sessionTransport.request(url,{method:"DELETE"})));
    clearGuestChat();purgeUnclaimedGuestChats(null);guestChatScope=null;copilotGuest=false;view.chat=[];copilotDraft="";
    copilotAccess={state:"signed_out",allowedModelIds:[]};copilotMode="signed_out";render();
    location.assign("./guest.html");
   }catch{copilotAccess={state:"error",allowedModelIds:[]};copilotMode="error";render();}
 }else if(action==="projectBack"){view.projectDetail=false;render();}
 else if(action==="source")openSource(id);
 else if(action==="closeSource")closeSource();
 else if(action==="download")downloadSource(value);
 else if(action==="ask")ask(el.dataset.prompt||"");
 else if(action==="publicFilter"){view.page="knowledge";view.search="";view.filter="Public industry reference";view.pageIndex=0;render();}
 else if(action==="page"){view.pageIndex=Math.max(0,view.pageIndex+Number(value));render();}
 else if(action==="quote"){view.quoteId=id;setPage("quotes");}
 else if(action==="gate"){
  const result=approveVariationGate(state,value,model);
  if(result.ok){state.customerDraft.reviewed=false;save();render();toast("Sample approval recorded locally.");}
  else toast(result.reason);
 }else if(action==="commit"){
  const result=commitVariation(state,model);
  if(result.ok){save();render();toast("Created "+result.workOrderId+" in the sample work register.");}
  else toast(result.reason);
 }else if(action==="approval"){
  const a=model.byApproval.get(id);if(!a)return;
  state.approvals[id]="Approved";event(state,"Sample approval "+id+" · "+a.projectId);save();render();toast("Sample workspace approval recorded.");
 }else if(action==="task"){
  const t=model.tasks(state).find(x=>x.id===id);if(!t)return;
  if(id===state.readiness?.reviewTaskId&&t.status!=="Complete"){
   const current=evaluateReadiness(pack.id,state.readiness.inputs);
   const saved=state.readiness.assessment;
   if(!saved||current.counts.hold>0||JSON.stringify(current.inputs)!==JSON.stringify(saved.inputs)||JSON.stringify(current.checks.map(x=>x.status))!==JSON.stringify(saved.checks?.map(x=>x.status))){
    toast("Keep this review task blocked until the latest operational assessment has no outstanding holds.");return;
   }
  }
  state.tasks[id]=t.status==="Complete"?"Upcoming":"Complete";
  event(state,"Work status changed: "+id+" → "+state.tasks[id]);save();render();toast("Sample work status updated.");
 }else if(action==="historyReset"){
  state.historyRequest=historicalDefaults(historyData);state.historyDraft=null;save();render();toast("Inquiry settings restored to the industry default.");
 }else if(action==="historyDraft"){
  const result=historicalEstimate(historyData,state.historyRequest);
  if(!result.ok){toast("Cannot create a draft: "+result.reason);return;}
  state.historyDraft={result,createdAt:new Date().toISOString(),fingerprint:JSON.stringify(state.historyRequest),reviewed:false,reviewedAt:null};
  event(state,"Historical draft prepared from "+result.comparables.length+" sample cost records.");
  save();render();toast("Draft created. Human review is required.");
 }else if(action==="historyApprove"){
  const draft=state.historyDraft;
  if(!draft?.result?.ok){toast("Create a supported historical estimate first.");return;}
  if(draft.fingerprint!==JSON.stringify(state.historyRequest)){toast("Inputs have changed; generate a fresh draft.");return;}
  draft.reviewed=true;draft.reviewedAt=new Date().toISOString();event(state,"Sample estimate reviewed locally.");save();render();toast("Draft reviewed locally. No quotation was sent.");
 }else if(action==="historyExport"){
  const draft=state.historyDraft;
  if(!draft?.reviewed||draft.fingerprint!==JSON.stringify(state.historyRequest)){toast("A current human-reviewed draft is required for export.");return;}
  const markdown=estimateMarkdown(historyData,draft.result,draft),blob=new Blob([markdown],{type:"text/markdown;charset=utf-8"}),url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download="StrideBrain-"+pack.id+"-historical-draft.md";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("Reviewed sample estimate exported. This is not a commercial offer.");
 }else if(action==="draftLang"){
  state.customerDraft.lang=value;state.customerDraft.text="";state.customerDraft.reviewed=false;save();render();
 }else if(action==="draftGenerate"){
  state.customerDraft.text=buildCustomerReply(state,model,state.customerDraft.lang);
  state.customerDraft.reviewed=false;event(state,"Drafted "+(state.customerDraft.lang==="zh"?"Traditional Chinese":"English")+" sample response");save();render();
  toast("Customer response prepared. Review required before copy.");
 }else if(action==="draftReview"){
  const result=reviewCustomerDraft(state);
  if(result.ok){save();render();toast("Draft reviewed locally. No message sent.");}else toast(result.reason);
 }else if(action==="draftCopy")copyReviewedDraft();
 else if(action==="feedback"){
  const i=Number(el.dataset.index||0),msg=view.chat[i];if(!msg||msg.role!=="assistant")return;
  const kind=el.dataset.kind;
  const note=msg.mode==="gpt"?"Staff GPT response feedback (question text not saved)":(kind==="Helpful"?"Helpful answer: ":"Needs verification: ")+msg.query;
  const result=recordFeedback(state,kind,msg.sources?.[0]||null,note);
  if(result.ok){save();toast("Feedback captured for human review.");}
 }else if(action==="sourceFeedback"){
  const result=recordFeedback(state,"Needs review",value||id,"Source requires accuracy or revision review.");
  if(result.ok){save();closeSource();toast("Source flagged in the learning queue.");}
 }else if(action==="reviewFeedback"){
  const result=markFeedbackReviewed(state,id);if(result.ok){save();render();toast("Review recorded; source text was not changed.");}
 }else if(action==="reset"){
  if(!confirm("Reset this sample workspace's approvals, tasks, feedback and drafts?"))return;
  state=resetDemoState(pack);state.historyRequest=historicalDefaults(historyData);state.readiness.inputs=initialReadiness(pack.id);view.chat=[];view.docId=null;view.quoteId=null;view.projectDetail=false;setPage("overview");toast("Sample state restored.");
 }
}
document.addEventListener("click",ev=>{
 const el=ev.target.closest("[data-action]");
 if(el&&model){perform(el);return;}
 if(copilotModelMenuOpen&&!ev.target.closest(".sb-model-container")){
  copilotModelMenuOpen=false;if(view.page==="copilot")render();
 }
});
document.addEventListener("submit",ev=>{
 if(ev.target.id!=="ask-form"||!model)return;
 ev.preventDefault();const input=ev.target.querySelector("[data-copilot-input],input");if(input){const text=input.value;input.value="";copilotDraft="";ask(text);}
});
document.addEventListener("change",ev=>{
 if(ev.target.id==="intake-currency"){
  if(documentSession?.report){detachImported();documentSession.report.currencyConfirmed=ev.target.checked;documentSession.report.reviewed=false;documentSession.report.reviewedAt=null;render();}
  return;
 }
 if(ev.target.id==="intake-file"){
  const file=ev.target.files?.[0];if(file)handleDocument(file);return;
 }
 if(ev.target.hasAttribute("data-intake-value")){
  const itemId=ev.target.getAttribute("data-intake-value"),field=ev.target.dataset.field;
  detachImported();const result=editCandidate(documentSession?.report,itemId,field,ev.target.value);
  if(result.ok){documentSession.bridgeForm=bridgeDefaults(documentSession.report,historyData,pack.id);render();toast("Value updated as an explicit human edit; source amount is unchanged.");}
  else toast(result.reason);
  return;
 }
 if(ev.target.hasAttribute("data-bridge")){
   if(!documentSession?.report)return;
   const key=ev.target.dataset.bridge,form=documentSession.bridgeForm||bridgeDefaults(documentSession.report,historyData,pack.id);
   detachImported();
   if(key==="codeMapping")form.codeMapping[ev.target.dataset.lineId]=ev.target.value;
   else if(["acknowledged","scopeComplete","sourceExplained"].includes(key))form[key]=ev.target.checked;
   else form[key]=ev.target.value;
   documentSession.bridgeForm=form;render();return;
 }
 if(ev.target.id==="industry-switcher"){loadIndustry(ev.target.value);return;}
 if(!model)return;
 const input=ev.target.dataset.input;
 const screeningField=ev.target.dataset.readiness;
 if(screeningField){
   const nextInput={...state.readiness.inputs,[screeningField]:ev.target.value};
   state.readiness.inputs=normalizeReadinessInput(pack.id,nextInput);state.readiness.assessment=null;
   if(state.readiness.reviewTaskCreated)state.tasks[state.readiness.reviewTaskId]="Blocked";
   event(state,"Manual screening input updated: "+screeningField+"; previous assessment invalidated.");
   save();render();return;
 }
 if(ev.target.hasAttribute("data-history-scope")){
   const code=ev.target.getAttribute("data-history-scope");
   const current=new Set(state.historyRequest.scope);
   if(ev.target.checked)current.add(code);else current.delete(code);
   state.historyRequest=safeRequest(historyData,{...state.historyRequest,scope:[...current]});state.historyDraft=null;save();render();return;
 }
 const historyField=ev.target.dataset.history;
 if(historyField&&historyField!=="inquiry"){
   state.historyRequest=safeRequest(historyData,{...state.historyRequest,[historyField]:ev.target.value});
   state.historyDraft=null;save();render();return;
 }
 if(input==="filter"){view.filter=ev.target.value;view.pageIndex=0;render();}
 else if(input==="varCost"||input==="varMargin"){
  const result=setVariationInput(state,input==="varCost"?"cost":"margin",ev.target.value);
  if(result.ok){save();render();toast("Price recalculated; previous approvals require fresh review.");}else toast(result.reason);
 }
});
document.addEventListener("input",ev=>{
 if(!model)return;
 if(ev.target.matches("[data-copilot-input]")){copilotDraft=ev.target.value.slice(0,1200);return;}
 const input=ev.target.dataset.input;
 if(ev.target.id==="intake-review-note"){if(documentSession){if(documentSession.imported)detachImported();documentSession.reviewNote=ev.target.value;if(documentSession.report?.reviewed&&ev.target.value!==documentSession.report.reviewerNote){documentSession.report.reviewed=false;documentSession.report.reviewedAt=null;}}return;}
 if(ev.target.hasAttribute("data-bridge")){
   if(!documentSession?.report)return;
   const key=ev.target.dataset.bridge;
   if(!["title","excludedReason"].includes(key))return;
   const form=documentSession.bridgeForm||bridgeDefaults(documentSession.report,historyData,pack.id);
   form[key]=ev.target.value;documentSession.bridgeForm=form;return;
 }
 if(input==="search"){
  const pos=ev.target.selectionStart||0;view.search=ev.target.value;view.pageIndex=0;
  render();const el=document.querySelector('[data-input="search"]');if(el){el.focus();try{el.setSelectionRange(pos,pos);}catch{}}
 }else if(ev.target.dataset.history==="inquiry"){
  state.historyRequest.inquiry=ev.target.value;state.historyDraft=null;save();
 }else if(input==="draftText"){
  state.customerDraft.text=ev.target.value;state.customerDraft.reviewed=false;save();
 }
});
document.addEventListener("keydown",ev=>{
 if(copilotModelMenuOpen&&["ArrowDown","ArrowUp"].includes(ev.key)&&ev.target.closest(".sb-model-menu")){
  ev.preventDefault();
  const choices=[...document.querySelectorAll(".sb-model-option:not(:disabled)")];
  if(choices.length){const i=choices.indexOf(document.activeElement);choices[(i+(ev.key==="ArrowDown"?1:-1)+choices.length)%choices.length].focus();}
  return;
 }
 if(ev.key==="Enter"&&!ev.shiftKey&&!ev.isComposing&&ev.target.matches("[data-copilot-input]")){
  ev.preventDefault();if(!copilotBusy)ev.target.closest("form")?.requestSubmit();return;
 }
 if(ev.key==="Escape"&&copilotModelMenuOpen){
  copilotModelMenuOpen=false;if(view.page==="copilot"){render();document.querySelector(".sb-model-trigger")?.focus();}return;
 }
 if(ev.key==="Escape"&&view.docId)closeSource();
});
document.addEventListener("dragover",ev=>{if(ev.target.closest("#intake-drop"))ev.preventDefault();});
document.addEventListener("drop",ev=>{const area=ev.target.closest("#intake-drop");if(!area)return;ev.preventDefault();const file=ev.dataTransfer?.files?.[0];if(file)handleDocument(file);});
function applySessionStatus(info){
 const sameIdentity=guestChatScope===info.chatScope&&copilotGuest===(info.role==="guest");
 copilotAccess=info;copilotConnected=false;copilotModelMenuOpen=false;
 if(info.active){
  copilotGuest=info.role==="guest";guestChatScope=info.chatScope;
  copilotMode=info.state==="ready"?"gpt":"unavailable";
  if(!info.allowedModelIds.includes(selectedModelId))selectedModelId=info.defaultModelId||DEFAULT_MODEL_ID;
  purgeUnclaimedGuestChats(copilotGuest?guestChatScope:null);
  if(!sameIdentity){view.chat=[];if(model&&copilotMode==="gpt")restoreGuestChat();}
 }else{
  clearGuestChat();purgeUnclaimedGuestChats(null);guestChatScope=null;copilotGuest=false;view.chat=[];copilotMode="signed_out";
 }
 if(model)render();
}
async function restoreStaffPreview(){
 if(sessionRefreshPromise)return sessionRefreshPromise;
 const run=++sessionRefreshRun;
 copilotAccess={...copilotAccess,state:"checking"};copilotMode="checking";copilotModelMenuOpen=false;
 if(model)render();
 sessionRefreshPromise=(async()=>{
  try{
   const info=invitationAttempt?await invitationAttempt.redeem():await sessionTransport.read();
   if(run!==sessionRefreshRun)return;
   invitationAttempt=null;applySessionStatus(info);
  }catch(error){
   if(run!==sessionRefreshRun)return;
   if(error?.code==="INVALID_INVITATION")invitationAttempt=null;
   copilotAccess={state:"error",allowedModelIds:[],code:error?.code||"SESSION_NETWORK"};copilotMode="error";
   if(model)render();
  }finally{if(run===sessionRefreshRun)sessionRefreshPromise=null;}
 })();
 return sessionRefreshPromise;
}
// Session verification begins immediately; Copilot is gated until it resolves.
restoreStaffPreview();
loadIndustry(pack.id);
