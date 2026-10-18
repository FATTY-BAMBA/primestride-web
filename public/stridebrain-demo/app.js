import {getPack,listPacks} from "./industry-packs.js";
import {WorkspaceModel,money,calculateVariation,escapeHtml as e,loadDemoState,saveDemoState,resetDemoState,event,setVariationInput,approveVariationGate,commitVariation,buildCustomerReply,reviewCustomerDraft,recordFeedback,markFeedbackReviewed} from "./core-model.js";
import {overview,copilot,projects,knowledge,renderInspector,renderSourceModal} from "./views-primary.js";
import {service,quotes,work,suppliers,approvals,analytics,learning} from "./views-operations.js";
import {exampleAnswer} from "./assistant-rules.js";
import {source as sourceButton} from "./ui-shared.js";
import {DEFAULT_MODEL_ID,findAllowedModel} from "./model-catalog.js";
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
const $=id=>document.getElementById(id);
const requested=new URLSearchParams(location.search).get("industry")||"interior";
let pack=getPack(requested),model=null,state=null,historyData=null,industryEvidence=null,documentSession=null,toastHandle=null,documentLoadVersion=0;
let copilotMode="sample",copilotOperatorToken="",copilotConnected=false,copilotBusy=false,copilotRunId=0;
let selectedModelId=DEFAULT_MODEL_ID,copilotModelMenuOpen=false,copilotDraft="";
let view={page:"overview",projectId:null,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null};
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("visible");
 if(toastHandle)clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("visible"),3500);
}
function context(){return {model,pack,state,view,history:historyData,industryEvidence,documentSession,copilotSession:{mode:copilotMode,connected:copilotConnected,busy:copilotBusy,selectedModelId,modelMenuOpen:copilotModelMenuOpen,draft:copilotDraft}};}
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
function pageTitle(){return view.page==="projects"?pack.projectLabel:view.page==="quotes"?pack.quoteLabel:view.page==="work"?pack.orderLabel:{overview:"Overview",copilot:"StrideBrain Copilot",knowledge:"Knowledge hub",service:"Customer service",suppliers:"Suppliers",approvals:"Approvals",analytics:"Analytics",learning:"Learning & feedback",history:"Historical estimates",playbook:"Industry playbook",readiness:"Operational checks",intake:"Document intelligence"}[view.page]||"Overview";}
function render(){
 if(!model)return;
 const mapping={overview,copilot,projects,knowledge,service,quotes,work,suppliers,approvals,analytics,learning,history:historyView,playbook,readiness:readinessView,intake:documentIntelligenceView};
 $("main").innerHTML=(mapping[view.page]||overview)(context())+(view.page==="intake"?historyBridgeSection(context()):"");
 $("inspector").innerHTML=renderInspector(context());
 $("page-name").textContent=pageTitle();
 document.querySelectorAll(".sidebar [data-action='nav']").forEach(b=>b.classList.toggle("active",b.dataset.value===view.page));
}
function updateShell(){
 $("company-name").textContent=pack.companyEn;$("company-subtitle").textContent=pack.company+" · "+pack.short;$("company-avatar").textContent=pack.symbol;
 $("owner-name").textContent=pack.owner;$("owner-initials").textContent=pack.ownerInitials;$("top-company").textContent=pack.companyEn;
 $("nav-entities").textContent=pack.projectLabel;$("nav-quotations").textContent=pack.quoteLabel;$("nav-work").textContent=pack.orderLabel;$("nav-materials").textContent=pack.materialLabel;
 $("industry-switcher").innerHTML=listPacks().map(p=>'<option value="'+e(p.id)+'"'+(p.id===pack.id?" selected":"")+'>'+e(p.name)+" · "+e(p.companyEn)+"</option>").join("");
 document.title="StrideBrain · "+pack.companyEn+" | SME Demo";
}
async function loadIndustry(id){
 copilotRunId++;copilotMode="sample";copilotConnected=false;copilotOperatorToken="";copilotBusy=false;copilotModelMenuOpen=false;copilotDraft="";
 documentLoadVersion++; // cancel any in-flight local file parsing on industry switch
 const next=getPack(id),previous={pack,model,state,view,historyData,industryEvidence,documentSession};
 $("main").innerHTML='<div class="loading-screen"><div class="loader-ring"></div><h2>Opening '+e(next.short)+'</h2><p>Connecting an industry pack to the shared operating workspace…</p></div>';
 try{
  const result=await fetch(next.dataset,{cache:"no-store"});if(!result.ok)throw Error("Dataset unavailable: "+result.status);
  const seed=await result.json();
  const extra=await fetch("./seeds/source-enrichment.json",{cache:"no-store"});
  if(!extra.ok)throw Error("Enriched source data unavailable: "+extra.status);
  const enriched=await extra.json();const overrides=enriched[next.id]||{};
  for(const document of seed.documents){if(Object.prototype.hasOwnProperty.call(overrides,document.id))document.body=overrides[document.id];}
  const historyResponse=await fetch("./seeds/historical-"+next.id+".json",{cache:"no-store"});
  if(!historyResponse.ok)throw Error("Historical record pack unavailable: "+historyResponse.status);
  const historyPack=await historyResponse.json();validateHistory(historyPack);
  const existing=new Set(seed.documents.map(d=>d.id));
  for(const document of historyPack.documents){if(!existing.has(document.id))seed.documents.push(document);}
  const evidenceResult=await fetch("./seeds/taiwan-industry-evidence.json",{cache:"no-store"});
  if(!evidenceResult.ok)throw Error("Curated Taiwan industry evidence unavailable: "+evidenceResult.status);
  const curated=await evidenceResult.json();validateIndustryEvidence(curated);
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
  view={page:"overview",projectId:pack.scenario.projectId,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null};
  const url=new URL(location.href);url.searchParams.set("industry",pack.id);history.replaceState({industry:pack.id},"",url);
  updateShell();render();toast(pack.name+" template loaded · "+model.seed.documents.length+" example source records.");
 }catch(error){
  pack=previous.pack;model=previous.model;state=previous.state;historyData=previous.historyData;industryEvidence=previous.industryEvidence;documentSession=previous.documentSession;view=previous.view;
  if(model){updateShell();render();toast("Could not load the selected industry: "+error.message);}
  else $("main").innerHTML='<div class="panel"><h2>Demo could not start</h2><p>'+e(error.message)+'</p><p>Try refreshing the preview. No live company data is involved.</p></div>';
 }
}
function gptAnswerCard(result){
 const content=String(result?.answer||"").slice(0,3800);
 const paragraphs=content.split(/\n{2,}/).map(p=>'<p>'+e(p).replace(/\n/g,"<br>")+'</p>').join("");
 const allowed=new Set(["overview","projects","knowledge","quotes","work","suppliers","approvals","analytics","history","playbook","service"]);
 const actions=[...new Set((Array.isArray(result.actions)?result.actions:[]).filter(a=>allowed.has(a)))].slice(0,4);
 const labelMap={overview:"Business overview",projects:"Explore projects",knowledge:"Inspect knowledge",quotes:"Review quotes",work:"Work orders",suppliers:"Suppliers",approvals:"Pending approvals",analytics:"Analytics",history:"Past project estimates",playbook:"Industry playbook",service:"Customer replies"};
 const ids=[...new Set((Array.isArray(result.sourceIds)?result.sourceIds:[]).filter(id=>!!model.document(id)))].slice(0,12);
 return '<div class="answer-card"><div class="suite-eyebrow">'+e(result.modelLabel||"AI model")+' · READ-ONLY DEMO ANSWER</div><div class="copilot-gpt-prose">'+paragraphs+'</div>'+
  (ids.length?'<div class="copilot-tool-sources"><strong>Inspect supporting sample records</strong><div>'+ids.map(sourceButton).join(" ")+'</div></div>':'<p class="disclosure">No cited record was returned for this conversational answer.</p>')+
  (actions.length?'<div class="answer-actions">'+actions.map(a=>'<button type="button" class="button-secondary" data-action="nav" data-value="'+a+'">'+e(labelMap[a])+' ↗</button>').join("")+'</div>':'')+
  '<p class="disclosure">Fictional sample data · '+e(result.asOf||"2026-10-18")+' snapshot · no live customer records or actions.</p></div>';
}
async function ask(question){
 const text=String(question||"").trim();if(!text||copilotBusy)return;
 copilotDraft="";copilotModelMenuOpen=false;
 view.chat.push({role:"user",text});
 view.page="copilot";
 if(copilotMode!=="gpt"||!copilotOperatorToken){
  const ans=exampleAnswer(text,context());
  view.chat.push({role:"assistant",html:ans.html,sources:ans.sources,query:text,mode:"sample",text:""});
  render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});return;
 }
 const active=++copilotRunId,activeIndustry=pack.id,activeModel=selectedModelId;
 const recent=view.chat.filter(m=>m.role==="user"||(m.role==="assistant"&&m.mode==="gpt"&&m.text))
  .slice(-12).map(m=>({role:m.role,content:String(m.text||"").slice(0,m.role==="user"?1200:1800)}));
 copilotBusy=true;
 const index=view.chat.length;
 view.chat.push({role:"assistant",html:'<div class="answer-card"><div class="suite-eyebrow">READ-ONLY BUSINESS TOOLS</div><p class="muted">Checking the synthetic company records and composing an answer…</p></div>',sources:[],query:text,mode:"gpt",pending:true});
 render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
 try{
  const response=await fetch("/api/stridebrain-demo/copilot",{
   method:"POST",cache:"no-store",credentials:"same-origin",
   headers:{"Content-Type":"application/json","x-stridebrain-operator-token":copilotOperatorToken},
   body:JSON.stringify({industry:activeIndustry,messages:recent,modelId:activeModel})
  });
  const result=await response.json();
  if(!response.ok)throw Error(String(result.error||"The GPT service is unavailable.").slice(0,180));
  if(active!==copilotRunId||pack.id!==activeIndustry)return;
  if(!["gpt-readonly-demo","openrouter-readonly-demo"].includes(result.mode)||typeof result.answer!=="string"||result.modelId!==activeModel)throw Error("Unexpected model server response.");
  copilotConnected=true;
  view.chat[index]={role:"assistant",html:gptAnswerCard(result),sources:result.sourceIds,query:text,mode:"gpt",modelId:result.modelId,modelLabel:result.modelLabel,text:result.answer};
 }catch(err){
  if(active!==copilotRunId||pack.id!==activeIndustry)return;
  copilotMode="sample";copilotOperatorToken="";copilotConnected=false;
  const fallback=exampleAnswer(text,context());
  view.chat[index]={role:"assistant",html:'<div class="divergence"><strong>GPT is not connected.</strong> '+e(String(err?.message||"The service could not answer."))+' The result below is from the deterministic synthetic sample—not a GPT response.</div>'+fallback.html,sources:fallback.sources,query:text,mode:"sample",text:""};
  toast("Selected AI model unavailable. Showing the clearly labeled deterministic fallback.");
 }finally{
  if(active===copilotRunId){copilotBusy=false;render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});}
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
  render();toast("Unable to read file. Check the source or try a fictional sample.");
 }
}
function perform(el){
 const action=el.dataset.action,id=el.dataset.id||"",value=el.dataset.value||"";
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
   if(!chosen){toast("That model is not on the approved list.");return;}
   selectedModelId=chosen.id;copilotModelMenuOpen=false;copilotConnected=false;
   render();document.querySelector(".sb-model-trigger")?.focus();
   toast(copilotMode==="gpt"?"Selected "+chosen.label+" for the next authorized model request.":"Selected "+chosen.label+". Connect staff AI to use this model; sample answers remain deterministic.");
 }
 else if(action==="newChat"){
   if(copilotBusy){toast("Wait for the current answer or disconnect first.");return;}
   copilotRunId++;view.chat=[];copilotDraft="";copilotModelMenuOpen=false;render();
   toast("Started a new local conversation.");
 }
 else if(action==="project"){
  const key=id||value;if(!model.project(key))return;view.projectId=key;view.projectDetail=true;setPage("projects");
 }else if(action==="intakeFixture"){
  try{downloadLocal(sampleFile(pack.id,value));toast("Fictional "+value.toUpperCase()+" sample downloaded. Select it in Document Intelligence to test.");}
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
   event(state,"A fictional browser-only completed-cost example was added after manual review.");
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
   if(token.length<20){toast("Enter the internal operator token (not an OpenAI API key).");return;}
   if(view.chat.length&&!confirm("Switching to GPT preview clears the current sample conversation. Continue?"))return;
   copilotMode="gpt";copilotOperatorToken=token;copilotConnected=false;copilotRunId++;view.chat=[];copilotModelMenuOpen=false;render();
   toast("Staff GPT mode requested. The next message will check server configuration and access.");
 }else if(action==="disableGpt"){
   copilotRunId++;copilotMode="sample";copilotOperatorToken="";copilotConnected=false;copilotBusy=false;copilotModelMenuOpen=false;copilotDraft="";
   view.chat=[];render();toast("Returned to the offline deterministic demo; no operator access token is retained.");
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
  if(result.ok){state.customerDraft.reviewed=false;save();render();toast("Simulated approval recorded.");}
  else toast(result.reason);
 }else if(action==="commit"){
  const result=commitVariation(state,model);
  if(result.ok){save();render();toast("Created "+result.workOrderId+" in the sample work register.");}
  else toast(result.reason);
 }else if(action==="approval"){
  const a=model.byApproval.get(id);if(!a)return;
  state.approvals[id]="Approved";event(state,"Simulated approval "+id+" · "+a.projectId);save();render();toast("Internal demo approval recorded.");
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
  event(state,"Historical draft prepared from "+result.comparables.length+" fictional precedent records.");
  save();render();toast("Draft created. Human review is required.");
 }else if(action==="historyApprove"){
  const draft=state.historyDraft;
  if(!draft?.result?.ok){toast("Create a supported historical estimate first.");return;}
  if(draft.fingerprint!==JSON.stringify(state.historyRequest)){toast("Inputs have changed; generate a fresh draft.");return;}
  draft.reviewed=true;draft.reviewedAt=new Date().toISOString();event(state,"Simulated owner review of historical-cost estimate.");save();render();toast("Draft reviewed locally. No quotation was sent.");
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
  if(!confirm("Reset this industry's simulated approvals, tasks, feedback and drafts?"))return;
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
loadIndustry(pack.id);
