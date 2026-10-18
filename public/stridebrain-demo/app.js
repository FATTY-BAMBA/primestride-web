import {getPack,listPacks} from "./industry-packs.js";
import {WorkspaceModel,money,calculateVariation,escapeHtml as e,loadDemoState,saveDemoState,resetDemoState,event,setVariationInput,approveVariationGate,commitVariation,buildCustomerReply,reviewCustomerDraft,recordFeedback,markFeedbackReviewed} from "./core-model.js";
import {overview,copilot,projects,knowledge,renderInspector,renderSourceModal} from "./views-primary.js";
import {service,quotes,work,suppliers,approvals,analytics,learning} from "./views-operations.js";
import {exampleAnswer} from "./assistant-rules.js";
import {historyView} from "./views-history.js";
import {playbook} from "./views-playbook.js";
import {validateIndustryEvidence} from "./industry-evidence.js";
import {validateHistory,historicalDefaults,safeRequest,historicalEstimate,estimateMarkdown} from "./historical-estimator.js";
const $=id=>document.getElementById(id);
const requested=new URLSearchParams(location.search).get("industry")||"interior";
let pack=getPack(requested),model=null,state=null,historyData=null,industryEvidence=null,toastHandle=null;
let view={page:"overview",projectId:null,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null};
function toast(message){
 const el=$("toast");el.textContent=message;el.classList.add("visible");
 if(toastHandle)clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("visible"),3500);
}
function context(){return {model,pack,state,view,history:historyData,industryEvidence};}
function save(){if(!saveDemoState(pack,state))toast("Browser storage unavailable. Changes may not survive a refresh.");}
function setPage(page,reset=true){
 view.page=page;if(reset){view.search="";view.filter="all";view.pageIndex=0;}
 render();window.scrollTo({top:0,behavior:"smooth"});
}
function pageTitle(){return view.page==="projects"?pack.projectLabel:view.page==="quotes"?pack.quoteLabel:view.page==="work"?pack.orderLabel:{overview:"Overview",copilot:"StrideBrain Copilot",knowledge:"Knowledge hub",service:"Customer service",suppliers:"Suppliers",approvals:"Approvals",analytics:"Analytics",learning:"Learning & feedback",history:"Historical estimates",playbook:"Industry playbook"}[view.page]||"Overview";}
function render(){
 if(!model)return;
 const mapping={overview,copilot,projects,knowledge,service,quotes,work,suppliers,approvals,analytics,learning,history:historyView,playbook};
 $("main").innerHTML=(mapping[view.page]||overview)(context());
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
 const next=getPack(id),previous={pack,model,state,view,historyData,industryEvidence};
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
  pack=next;model=verified;historyData=historyPack;industryEvidence=curated;state=loadDemoState(pack);
  state.historyRequest=safeRequest(historyData,state.historyRequest||historicalDefaults(historyData));
  view={page:"overview",projectId:pack.scenario.projectId,projectDetail:false,docId:null,quoteId:null,chat:[],search:"",filter:"all",pageIndex:0,flowStep:null};
  const url=new URL(location.href);url.searchParams.set("industry",pack.id);history.replaceState({industry:pack.id},"",url);
  updateShell();render();toast(pack.name+" template loaded · "+model.seed.documents.length+" example source records.");
 }catch(error){
  pack=previous.pack;model=previous.model;state=previous.state;historyData=previous.historyData;industryEvidence=previous.industryEvidence;view=previous.view;
  if(model){updateShell();render();toast("Could not load the selected industry: "+error.message);}
  else $("main").innerHTML='<div class="panel"><h2>Demo could not start</h2><p>'+e(error.message)+'</p><p>Try refreshing the preview. No live company data is involved.</p></div>';
 }
}
function ask(question){
 const text=String(question||"").trim();if(!text)return;
 view.chat.push({role:"user",text});
 const ans=exampleAnswer(text,context());
 view.chat.push({role:"assistant",html:ans.html,sources:ans.sources,query:text});
 view.page="copilot";render();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
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
function perform(el){
 const action=el.dataset.action,id=el.dataset.id||"",value=el.dataset.value||"";
 if(action==="nav"){view.projectDetail=false;setPage(value);}
 else if(action==="project"){
  const key=id||value;if(!model.project(key))return;view.projectId=key;view.projectDetail=true;setPage("projects");
 }else if(action==="flowStep"){view.flowStep=value;render();}
 else if(action==="projectBack"){view.projectDetail=false;render();}
 else if(action==="source")openSource(id);
 else if(action==="closeSource")closeSource();
 else if(action==="download")downloadSource(value);
 else if(action==="ask")ask(el.dataset.prompt||"");
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
  const result=recordFeedback(state,kind,msg.sources?.[0]||null,(kind==="Helpful"?"Helpful answer: ":"Needs verification: ")+msg.query);
  if(result.ok){save();toast("Feedback captured for human review.");}
 }else if(action==="sourceFeedback"){
  const result=recordFeedback(state,"Needs review",value||id,"Source requires accuracy or revision review.");
  if(result.ok){save();closeSource();toast("Source flagged in the learning queue.");}
 }else if(action==="reviewFeedback"){
  const result=markFeedbackReviewed(state,id);if(result.ok){save();render();toast("Review recorded; source text was not changed.");}
 }else if(action==="reset"){
  if(!confirm("Reset this industry's simulated approvals, tasks, feedback and drafts?"))return;
  state=resetDemoState(pack);state.historyRequest=historicalDefaults(historyData);view.chat=[];view.docId=null;view.quoteId=null;view.projectDetail=false;setPage("overview");toast("Sample state restored.");
 }
}
document.addEventListener("click",ev=>{const el=ev.target.closest("[data-action]");if(el&&model)perform(el);});
document.addEventListener("submit",ev=>{
 if(ev.target.id!=="ask-form"||!model)return;
 ev.preventDefault();const input=ev.target.querySelector("input");if(input){const text=input.value;input.value="";ask(text);}
});
document.addEventListener("change",ev=>{
 if(ev.target.id==="industry-switcher"){loadIndustry(ev.target.value);return;}
 if(!model)return;
 const input=ev.target.dataset.input;
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
 const input=ev.target.dataset.input;
 if(input==="search"){
  const pos=ev.target.selectionStart||0;view.search=ev.target.value;view.pageIndex=0;
  render();const el=document.querySelector('[data-input="search"]');if(el){el.focus();try{el.setSelectionRange(pos,pos);}catch{}}
 }else if(ev.target.dataset.history==="inquiry"){
  state.historyRequest.inquiry=ev.target.value;state.historyDraft=null;save();
 }else if(input==="draftText"){
  state.customerDraft.text=ev.target.value;state.customerDraft.reviewed=false;save();
 }
});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&view.docId)closeSource();});
loadIndustry(pack.id);
