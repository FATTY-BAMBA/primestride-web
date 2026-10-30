import {registerSources} from "./register-evidence.js";
import {evaluateReadiness} from "./readiness-rules.js";
/**
 * StrideBrain demo domain engine.
 * Shared across vertical packs: no interior-design or print-shop conditionals here.
 * All data is synthetic. No external API or production claims.
 */
export function validateSeed(seed,pack){
  const errors=[];
  if(!seed||seed.meta?.mode!=='SYNTHETIC_DEMO')errors.push("A synthetic seed is required");
  const lists=["projects","documents","suppliers","quotes","workOrders","approvals","activity"];
  for(const key of lists){if(!Array.isArray(seed?.[key]))errors.push(key+" must be an array");}
  if(errors.length)throw new Error(errors.join("; "));
  const ids=(arr,key)=>{const set=new Set();for(const x of arr){if(!x?.[key]){errors.push("Missing "+key);continue;}if(set.has(x[key]))errors.push("Duplicate "+key+": "+x[key]);set.add(x[key]);}return set;};
  const prj=ids(seed.projects,"id"),docs=ids(seed.documents,"id"),sup=ids(seed.suppliers,"id");
  ids(seed.quotes,"id");ids(seed.workOrders,"id");ids(seed.approvals,"id");ids(seed.activity,"id");
  for(const item of [...seed.documents,...seed.quotes,...seed.workOrders,...seed.approvals,...seed.activity]){
    if(item.projectId&&!prj.has(item.projectId))errors.push("Unknown project for "+item.id);
    if(item.sourceDocId&&!docs.has(item.sourceDocId))errors.push("Missing cited source for "+item.id);
  }
  for(const p of seed.projects){
    const recent=seed.quotes.filter(q=>q.projectId===p.id&&q.isLatest);
    if(recent.length!==1)errors.push(p.id+": expected exactly one latest quotation");
  }
  const scenario=pack.scenario;
  if(!prj.has(scenario.projectId))errors.push("Scenario project missing");
  for(const ref of scenario.sourceIds)if(!docs.has(ref))errors.push("Scenario source missing: "+ref);
  if(!seed.documents.length)errors.push("Knowledge must not be empty");
  if(!seed.suppliers.length)errors.push("Suppliers must not be empty");
  if(errors.length)throw new Error(errors.slice(0,10).join("; "));
  return {ok:true,counts:Object.fromEntries(lists.map(key=>[key,seed[key].length])),sourceCount:docs.size,suppliers:sup.size};
}
export function money(amount){return "NT$"+Math.round(Number(amount)||0).toLocaleString("en-US");}
export function calculateVariation(cost,marginPercent,taxPercent=5){
  const c=Math.max(0,Number(cost)||0);
  const m=Math.max(0,Math.min(90,Number(marginPercent)||0));
  const t=Math.max(0,Math.min(30,Number(taxPercent)||0));
  const beforeTax=Math.round(c/(1-m/100));
  const tax=Math.round(beforeTax*t/100);
  return {cost:c,margin:m,taxRate:t,beforeTax,tax,total:beforeTax+tax,grossProfit:beforeTax-c};
}
export function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
export function formattedDate(value){
  if(!value)return "—";return String(value).replace(/-/g,".");
}
export function stageTone(status){
 const v=String(status||"").toLowerCase();
 if(/complete|approved|handover|executed/.test(v))return "success";
 if(/block|pending|at risk|needs review/.test(v))return "warning";
 if(/progress|review|construction|production|procurement/.test(v))return "info";
 return "neutral";
}
export class WorkspaceModel{
  constructor(seed,pack){this.seed=seed;this.pack=pack;this.validation=validateSeed(seed,pack);this.byProject=new Map(seed.projects.map(x=>[x.id,x]));this.bySource=new Map([...seed.documents,...registerSources(seed)].map(x=>[x.id,x]));this.byQuote=new Map(seed.quotes.map(x=>[x.id,x]));this.byTask=new Map(seed.workOrders.map(x=>[x.id,x]));this.byApproval=new Map(seed.approvals.map(x=>[x.id,x]));}
  project(id){return this.byProject.get(id)||null;}
  document(id){return this.bySource.get(id)||null;}
  quote(id){return this.byQuote.get(id)||null;}
  task(id){return this.byTask.get(id)||null;}
  approvals(state){return this.seed.approvals.map(a=>({...a,status:state.approvals?.[a.id]||a.status}));}
  tasks(state){const tasks=this.seed.workOrders.map(w=>({...w,status:state.tasks?.[w.id]||w.status}));
 const aiTasks=Array.isArray(state.aiTeam?.generatedTasks)?state.aiTeam.generatedTasks:[];
 for(const task of aiTasks.slice().reverse())if(task?.id&&!tasks.some(x=>x.id===task.id))tasks.unshift({...task,status:state.tasks?.[task.id]||task.status||"Upcoming",synthetic:true});if(state.variation?.committed){tasks.unshift({id:this.pack.scenario.newWorkId,projectId:this.pack.scenario.projectId,title:this.pack.scenario.downstreamTask,owner:this.pack.owner,status:state.tasks?.[this.pack.scenario.newWorkId]||"Upcoming",dueDate:"To be confirmed",blockedBy:null,sourceDocId:this.pack.scenario.sourceIds[0],synthetic:true});}if(state.readiness?.reviewTaskCreated&&state.readiness?.reviewTaskId){
 const r=state.readiness,taskId=r.reviewTaskId;
 const last=r.assessment;
 const taskStatus=state.tasks?.[taskId]||(last?.counts?.hold>0?"Blocked":"Upcoming");
 tasks.unshift({id:taskId,projectId:this.pack.scenario.projectId,title:r.reviewTaskTitle||"Review workflow readiness exceptions",
 owner:this.pack.owner,status:taskStatus,dueDate:"Owner to schedule",
 blockedBy:last?.counts?.hold>0?last.counts.hold+" manual evidence gaps require follow-up":null,
 sourceDocId:r.reviewTaskSourceId||this.pack.scenario.sourceIds[0],synthetic:true});
 }return tasks;}
  latestQuotes(){return this.seed.quotes.filter(q=>q.isLatest);}
  latestQuoteFor(projectId){return this.latestQuotes().find(q=>q.projectId===projectId)||null;}
  summary(state){
    const tasks=this.tasks(state),approvals=this.approvals(state),quotes=this.latestQuotes(),v=calculateVariation(state.variation.cost,state.variation.margin,this.pack.scenario.tax);
    const quotedBase=quotes.reduce((n,q)=>n+q.amountExTax,0);
    return {projects:this.seed.projects.length,documents:this.seed.documents.length,suppliers:this.seed.suppliers.length,
      quotes:this.seed.quotes.length,workOrders:tasks.length,pending:approvals.filter(a=>a.status==="Pending").length,
      blocked:tasks.filter(w=>w.status==="Blocked").length,complete:tasks.filter(w=>w.status==="Complete").length,
      inProgress:tasks.filter(w=>w.status==="In progress").length,
      latestQuoteTotal:quotedBase+(state.variation.committed?v.beforeTax:0),
      portfolioBudgets:this.seed.projects.reduce((n,p)=>n+p.budget,0),
      currentQuoteCount:quotes.length, variation:v};
  }
  documentsFor(projectId){return this.seed.documents.filter(d=>d.projectId===projectId);}
  tasksFor(projectId,state){return this.tasks(state).filter(w=>w.projectId===projectId);}
  approvalsFor(projectId,state){return this.approvals(state).filter(a=>a.projectId===projectId);}
  quotationsFor(projectId){return this.seed.quotes.filter(q=>q.projectId===projectId);}
  searchDocuments(query="",kind="all"){
    const q=query.toLowerCase().trim();
    return this.seed.documents.filter(d=>(kind==="all"||d.kind===kind)&&(!q||[d.id,d.title,d.body,d.version].join(" ").toLowerCase().includes(q)));
  }
  searchProjects(query=""){
    const q=query.toLowerCase().trim();
    return this.seed.projects.filter(p=>!q||[p.id,p.name,p.type,p.city,p.manager,p.description||""].join(" ").toLowerCase().includes(q));
  }
}
function defaults(pack){return {variation:{cost:pack.scenario.cost,margin:pack.scenario.margin,supplier:false,owner:false,customer:false,committed:false},tasks:{},approvals:{},customerDraft:{lang:"zh",text:"",reviewed:false,reviewedAt:null},historyRequest:null,historyDraft:null,readiness:{inputs:null,assessment:null,reviewTaskCreated:false,reviewTaskId:null,reviewTaskTitle:null,reviewTaskSourceId:null},aiTeam:{activeAgentId:"operations-assistant",activeRunId:null,runs:[],generatedTasks:[],emailReceipts:[]},feedback:[],audit:[]};}
export function loadDemoState(pack){
 const fresh=defaults(pack);try{const old=JSON.parse(localStorage.getItem("stridebrain-demo-v2-"+pack.id)||"null");if(!old)return fresh;
  return {variation:{...fresh.variation,...old.variation},tasks:old.tasks||{},approvals:old.approvals||{},customerDraft:{...fresh.customerDraft,...old.customerDraft},historyRequest:old.historyRequest||null,historyDraft:old.historyDraft||null,readiness:{...fresh.readiness,...old.readiness},aiTeam:{...fresh.aiTeam,...(old.aiTeam||{}),activeAgentId:typeof old.aiTeam?.activeAgentId==="string"?old.aiTeam.activeAgentId:fresh.aiTeam.activeAgentId,runs:Array.isArray(old.aiTeam?.runs)?old.aiTeam.runs:[],generatedTasks:Array.isArray(old.aiTeam?.generatedTasks)?old.aiTeam.generatedTasks:[],emailReceipts:Array.isArray(old.aiTeam?.emailReceipts)?old.aiTeam.emailReceipts:[]},feedback:Array.isArray(old.feedback)?old.feedback:[],audit:Array.isArray(old.audit)?old.audit:[]};
 }catch{return fresh;}
}
export function saveDemoState(pack,state){try{localStorage.setItem("stridebrain-demo-v2-"+pack.id,JSON.stringify(state));return true;}catch{return false;}}
export function resetDemoState(pack){try{localStorage.removeItem("stridebrain-demo-v2-"+pack.id);}catch{}return defaults(pack);}
export function event(state,text){state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text});state.audit=state.audit.slice(0,60);}
export function setVariationInput(state,field,value){
 if(state.variation.committed)return {ok:false,reason:"A committed change cannot be edited. Reset this demo to start again."};
 if(field==="cost")state.variation.cost=Math.max(0,Math.round(Number(value)||0));
 else if(field==="margin")state.variation.margin=Math.max(0,Math.min(90,Number(value)||0));
 else return {ok:false,reason:"Unknown pricing field"};
 // A price change invalidates every prior decision, including supplier price verification.
 state.variation.supplier=false;state.variation.owner=false;state.variation.customer=false;
 state.customerDraft.reviewed=false;
 event(state,"Price input changed. Prior simulated confirmations invalidated.");
 return {ok:true};
}
export function approveVariationGate(state,gate,model){
 if(state.variation.committed)return {ok:false,reason:"Change already committed."};
 if(gate==="supplier"){state.variation.supplier=true;event(state,"Simulated supplier estimate checked against "+model.pack.scenario.sourceIds[1]);return {ok:true};}
 if(gate==="owner"){if(!state.variation.supplier)return {ok:false,reason:"Confirm supplier evidence first."};state.variation.owner=true;event(state,"Simulated owner approval for "+money(calculateVariation(state.variation.cost,state.variation.margin,model.pack.scenario.tax).beforeTax)+" before tax");return {ok:true};}
 if(gate==="customer"){if(!state.variation.owner)return {ok:false,reason:"Owner must approve before customer acceptance."};state.variation.customer=true;event(state,"Simulated customer written acceptance");return {ok:true};}
 return {ok:false,reason:"Unknown approval gate"};
}
export function commitVariation(state,model){
 const v=state.variation;if(v.committed)return {ok:false,reason:"Variation already committed."};
 if(!v.supplier||!v.owner||!v.customer)return {ok:false,reason:"Supplier verification, owner approval and customer acceptance are all required."};
 const readiness=state.readiness||{},assessment=readiness.assessment;
 if(!assessment)return {ok:false,reason:"Record the current industry readiness assessment in Operational checks before releasing this change."};
 if(assessment.counts?.hold>0||assessment.status!=="READY_FOR_HUMAN_REVIEW")return {ok:false,reason:"The operational assessment still contains blocking information gaps; resolve them and record an updated assessment."};
 if(JSON.stringify(assessment.inputs)!==JSON.stringify(readiness.inputs))return {ok:false,reason:"The readiness inputs changed since the last recorded assessment; assess them again."};
 const fresh=evaluateReadiness(model.pack.id,readiness.inputs);
 if(fresh.counts.hold>0||fresh.status!=="READY_FOR_HUMAN_REVIEW")return {ok:false,reason:"The latest industry rules still find blocking issues. Recheck and record a fresh assessment."};
 if(JSON.stringify(fresh.inputs)!==JSON.stringify(assessment.inputs)||JSON.stringify(fresh.checks.map(x=>x.status))!==JSON.stringify(assessment.checks?.map(x=>x.status)))return {ok:false,reason:"Readiness rules or entered facts have changed; redo the assessment before release."};
 v.committed=true;event(state,"Variation committed to demo work orders as "+model.pack.scenario.newWorkId);
 return {ok:true,workOrderId:model.pack.scenario.newWorkId};
}
export function buildCustomerReply(state,model,lang){
 const sc=model.pack.scenario,copy=sc.customerReply;
 const details=calculateVariation(state.variation.cost,state.variation.margin,sc.tax);
 const priceApproved=state.variation.owner&&state.variation.supplier;
 let text="";
 if(lang==="en"){text=[copy.enStart,priceApproved?copy.enApproved.replace("{total}",money(details.total)):copy.enPending,copy.enEnd].join("\n\n");}
 else {text=[copy.zhStart,priceApproved?copy.zhApproved.replace("{total}",money(details.total)):copy.zhPending,copy.zhEnd].join("\n\n");}
 return text;
}
export function reviewCustomerDraft(state){
 if(!state.customerDraft.text.trim())return {ok:false,reason:"Prepare or write a draft first."};
 state.customerDraft.reviewed=true;state.customerDraft.reviewedAt=new Date().toISOString();
 event(state,"Demo reviewer accepted the customer response draft (not sent).");return {ok:true};
}

export function recordFeedback(state,kind,sourceId,note){
 const kindOk=["Helpful","Needs review"].includes(kind);
 if(!kindOk)return {ok:false,reason:"Invalid feedback type"};
 const record={id:"FB-"+Date.now().toString(36)+"-"+String(state.feedback.length+1),kind,sourceId:sourceId||null,note:String(note||"").slice(0,1000),status:kind==="Helpful"?"Recorded":"Open",createdAt:new Date().toISOString()};
 state.feedback.unshift(record);
 event(state,"Knowledge feedback "+record.id+" captured; "+record.status.toLowerCase()+".");
 return {ok:true,record};
}
export function markFeedbackReviewed(state,id){
 const item=state.feedback.find(f=>f.id===id);
 if(!item)return {ok:false,reason:"Feedback not found."};
 item.status="Reviewed";item.reviewedAt=new Date().toISOString();
 event(state,"Feedback "+id+" reviewed. Original source document remains unchanged.");
 return {ok:true};
}
