import enrichment from "../../../public/stridebrain-demo/seeds/source-enrichment.json";
import {enrichedDocuments,registerSources,registerSourceId} from "../../../public/stridebrain-demo/register-evidence.js";
import {reviewPriorities} from "./priority-review.js";
/**
 * StrideBrain INTERNAL DEMO ONLY.
 * Read-only tools on bundled fictional industry records + cited public research.
 * NOT a multi-tenant company data adapter. No browser uploads enter this module.
 */
import interior from "../../../public/stridebrain-interiors/seed.json";
import printing from "../../../public/stridebrain-demo/seeds/printing.json";
import interiorHistory from "../../../public/stridebrain-demo/seeds/historical-interior.json";
import printingHistory from "../../../public/stridebrain-demo/seeds/historical-printing.json";
import curated from "../../../public/stridebrain-demo/seeds/taiwan-industry-evidence.json";

const COLLECTIONS={interior:{seed:{...interior,documents:enrichedDocuments(interior,enrichment.interior)},history:interiorHistory},printing:{seed:{...printing,documents:enrichedDocuments(printing,enrichment.printing)},history:printingHistory}};
export function workspaceEvidenceSeed(industry){return pack(industry).seed;}
const MAX_SOURCE_LEN=460;
export const validIndustry=id=>Object.prototype.hasOwnProperty.call(COLLECTIONS,id);
const text=value=>typeof value==="string"?value:"";
const money=n=>"NT$"+Math.round(Number(n)||0).toLocaleString("en-US");
const bounded=(value,max=100)=>text(value).slice(0,max).toLowerCase().trim();
const distinct=list=>[...new Set(list.filter(x=>typeof x==="string"&&x.length>0))];
const tokens=input=>{
 const q=bounded(input,180);
 const english=q.match(/[a-z0-9-]{2,}/g)||[];
 const han=q.match(/[\u3400-\u9fff]{2,}/g)||[];
 // For Chinese natural-language questions retain adjacent 2-character substrings.
 const pairs=han.flatMap(word=>word.length<=2?[word]:Array.from({length:Math.min(word.length-1,30)},(_,i)=>word.slice(i,i+2)));
 const lexicon=[
  ["廚房",["kitchen","countertop","cabinet"]],["檯面",["countertop","quartz"]],
  ["石英",["quartz","stone"]],["材料",["material","materials","supplier"]],
  ["供應商",["supplier","vendor"]],["報價",["quote","quotation","cost","estimate"]],
  ["毛利",["margin","profit"]],["成本",["cost","pricing"]],
  ["專案",["project","job"]],["案場",["project","site"]],["進度",["progress","status"]],
  ["工程",["construction","work"]],["裝修",["renovation","construction"]],
  ["合約",["contract","scope"]],["圖面",["drawing","revision"]],["驗收",["inspection","handover"]],
  ["法規",["regulation","law","compliance"]],["許可",["permit","approval"]],
  ["印刷",["printing","press"]],["海報",["poster","print"]],
  ["紙張",["paper","stock"]],["紙材",["paper","material"]],
  ["打樣",["proof","sample"]],["出血",["bleed","trim"]],
  ["檔案",["artwork","file","pdf"]],["交期",["schedule","delivery"]],
  ["工作單",["work order","task"]],["客戶",["customer","client"]],
  ["庫存",["inventory","stock"]],["採購",["procurement","supplier"]]
 ];
 const translated=lexicon.filter(([han])=>q.includes(han)).flatMap(([,terms])=>terms);
 return distinct([...english,...pairs,...translated]).slice(0,32);
};
function pack(industry){if(!validIndustry(industry))throw Error("Unknown demo industry");return COLLECTIONS[industry];}
export function allDemoSources(industry){
 const {seed,history}=pack(industry),refDocs=curated.documents.filter(d=>d.industry===industry);
 return [...seed.documents,...history.documents,...refDocs,...registerSources(seed)];
}
export function demoSourceIds(industry){return new Set(allDemoSources(industry).map(x=>x.id));}
const latestQuote=(seed,projectId)=>seed.quotes.find(q=>q.projectId===projectId&&q.isLatest);
const projectMatches=(seed,search)=>{const q=bounded(search),ts=tokens(q);return seed.projects.map(p=>{
 const indexed=[p.id,p.name,p.client,p.type,p.city,p.stage,p.manager].map(x=>bounded(x,150)).join(" ");
 let score=ts.reduce((sum,t)=>sum+(indexed.includes(t)?1:0),0);
 if(q&&indexed.includes(q))score+=4;
 if(!q)score=1;
 return {...p,score};
 }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));};
function resolveProject(seed,projectId){
 if(!projectId)return null;
 const id=bounded(projectId,130);
 return seed.projects.find(p=>p.id.toLowerCase()===id)||projectMatches(seed,id)[0]||null;
}
function retrieveDocs(industry,query,limit=5){
 const docs=allDemoSources(industry),search=bounded(query,180),ts=tokens(search);
 if(!search)return [];
 return docs.map(doc=>{
 const title=bounded(doc.title,250),body=bounded(doc.body,2800);
 const score=ts.reduce((sum,t)=>sum+(title.includes(t)?5:0)+(body.includes(t)?1:0),0)+(title.includes(search)?5:0);
 return {doc,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,Math.min(6,Math.max(1,limit))).map(({doc,score})=>({
 id:doc.id,title:doc.title,version:doc.version,status:doc.status,
 basisType:doc.basisType||"SYNTHETIC_DEMO",sourceType:doc.sourceType||"Demo record",
 sourceExcerpt:text(doc.body).slice(0,MAX_SOURCE_LEN),relevanceScore:score,
 sourceUrl:doc.basisType==="PUBLIC_REFERENCE"&&text(doc.sourceUrl).startsWith("https://")?doc.sourceUrl:null
 }));
}
const dateLabel="2026-10-18";
function snapshot(industry){
 const {seed}=pack(industry),latest=seed.quotes.filter(q=>q.isLatest);
 const blocked=seed.workOrders.filter(w=>w.status==="Blocked");
 const pending=seed.approvals.filter(a=>a.status==="Pending");
 const total=latest.reduce((v,q)=>v+Number(q.amountExTax||0),0);
 const costs=latest.reduce((v,q)=>v+Number(q.directCost||0),0);
 const asOf=seed.meta.date||dateLabel;
 const recordedSent=seed.quotes.filter(q=>q.status==="Sent"&&q.lastUpdated===asOf);
 const recordedSentSum=recordedSent.reduce((v,q)=>v+Number(q.amountExTax||0),0);
 return {
 isSynthetic:true,asOf:dateLabel,company:seed.meta.company,industry,
 projectCount:seed.projects.length,documentCount:seed.documents.length,
 pendingApprovals:pending.length,blockedWorkOrders:blocked.length,
 quoteVersionCount:seed.quotes.length,currentDraftQuoteCount:latest.length,
 sumOfLatestDraftQuotesExTax:total,
 draftQuoteDirectCosts:costs,
 weightedDraftQuoteGrossMarginPct:total>0?Math.round((total-costs)/total*1000)/10:null,
 quoteVersionsMarkedSentOnSnapshotDate:recordedSent.length,
 proposedPreTaxValueMarkedSentOnSnapshotDate:recordedSentSum,
 warning:"Sample workspace snapshot dated 2026-10-18. Figures are examples, not live transactions, recognized revenue, profit, or customer cash flow.",
 sourceIds:distinct([...pending.slice(0,3).map(a=>a.sourceDocId),...blocked.slice(0,3).map(w=>w.sourceDocId)])
 };
}
function projects(industry,query){
 const {seed}=pack(industry),matches=projectMatches(seed,query).slice(0,8);
 return {isSynthetic:true,matches:matches.map(p=>({id:p.id,name:p.name,type:p.type,stage:p.stage,manager:p.manager,location:p.city,budget:p.budget,progress:p.progress,sourceIds:seed.documents.filter(d=>d.projectId===p.id).slice(0,2).map(d=>d.id)})),sourceIds:distinct(matches.flatMap(p=>seed.documents.filter(d=>d.projectId===p.id).slice(0,1).map(d=>d.id)))};
}
function project(industry,projectId){
 const {seed}=pack(industry),p=resolveProject(seed,projectId);
 if(!p)return {found:false,note:"No matching demo project or job. Try a project ID or name.",sourceIds:[]};
 const latest=latestQuote(seed,p.id);
 const tasks=seed.workOrders.filter(w=>w.projectId===p.id).slice(0,15).map(w=>({id:w.id,title:w.title,status:w.status,owner:w.owner,dueDate:w.dueDate,sourceDocId:w.sourceDocId}));
 const approvals=seed.approvals.filter(a=>a.projectId===p.id).map(a=>({id:a.id,title:a.title,status:a.status,sourceDocId:a.sourceDocId}));
 const docs=seed.documents.filter(d=>d.projectId===p.id).slice(0,12).map(d=>({id:d.id,title:d.title,version:d.version,status:d.status}));
 return {found:true,isSynthetic:true,reviewFindings:reviewPriorities(seed,{projectId:p.id,limit:1}),project:{id:p.id,name:p.name,stage:p.stage,type:p.type,client:p.client,manager:p.manager,location:p.city,recordedProgress:p.progress,provisionalBudget:p.budget,sampleTargetDate:p.targetDate},latestDraftQuote:latest?{id:latest.id,directCost:latest.directCost,priceExTax:latest.amountExTax,targetMargin:latest.grossMarginTarget,status:latest.status,sourceDocId:latest.sourceDocId}:null,tasks,approvals,documents:docs,sourceIds:distinct([registerSourceId(p.id),latest?registerSourceId(latest.id):null,...approvals.map(x=>registerSourceId(x.id)),...tasks.map(x=>registerSourceId(x.id))])};
}
function quote(industry,projectId){
 const {seed}=pack(industry),p=resolveProject(seed,projectId);
 if(!p)return {found:false,note:"No matching sample project/job.",sourceIds:[]};
 const list=seed.quotes.filter(q=>q.projectId===p.id).sort((a,b)=>a.revision-b.revision);
 const current=list.find(q=>q.isLatest)||null;
 return {found:true,projectId:p.id,projectName:p.name,
 latestProposal:current?{id:current.id,revision:current.revision,priceExTax:current.amountExTax,directCost:current.directCost,computedGrossProfit:current.amountExTax-current.directCost,targetMargin:current.grossMarginTarget,status:current.status,registerSourceId:registerSourceId(current.id),illustrativeTax:current.tax,totalWithTax:current.totalWithTax}:null,
 revisions:list.map(q=>({id:q.id,revision:q.revision,status:q.status,priceExTax:q.amountExTax,directCost:q.directCost,calculatedGrossProfit:q.amountExTax-q.directCost,registerSourceId:registerSourceId(q.id),linkedDocumentId:q.sourceDocId})),
 sourceIds:list.map(q=>registerSourceId(q.id)),
 evidenceKind:"quotation_register",
 valueBasis:"Whole-project amounts come from quotation register rows, not linked supplier document text. Gross profit is calculated from price minus direct cost.",
 linkedDocuments:distinct(list.map(q=>q.sourceDocId)).map(id=>{const d=seed.documents.find(d=>d.id===id);return {id,title:d?.title,relationship:"associated_document_not_proof_of_register_amounts",readByThisTool:false};}),
 disclaimer:"Sample quotation amounts—not recognized revenue, verified supplier costs, or collected cash."};
}
function priorities(industry,limit=3){return reviewPriorities(pack(industry).seed,{limit});}
function suppliers(industry,query){
 const {seed}=pack(industry),q=bounded(query),results=seed.suppliers.filter(x=>!q||[x.id,x.name,x.category].join(" ").toLowerCase().includes(q)).slice(0,8);
 return {isSynthetic:true,suppliers:results.map(x=>({id:x.id,name:x.name,category:x.category,exampleUnitPrice:x.sampleUnitPrice,exampleLeadTimeDays:x.leadTimeDays,priceChecked:x.priceChecked})),sourceIds:[],note:"Supplier details, example prices and lead times are demo data, not live vendor confirmations."};
}
function historical(industry,category,quantity){
 const {history}=pack(industry);
 const categories=new Set(history.categories.map(x=>x.id));
 const cat=categories.has(category)?category:history.defaults.category;
 const count=Math.max(1,Math.min(100000,Math.round(Number(quantity)||history.defaults.quantity)));
 const matches=history.records.filter(r=>r.status==="COMPLETE"&&r.category===cat&&r.tier===history.defaults.tier&&r.unit===history.unit)
   .map(r=>({...r,quantityGap:Math.abs(Math.log(count/r.quantity))})).sort((a,b)=>a.quantityGap-b.quantityGap).slice(0,6);
 return {industry,category:cat,targetQuantity:count,unit:history.unit,
 comparables:matches.map(r=>({id:r.id,name:r.title,date:r.completedAt,quantity:r.quantity,location:r.location,fictionalFinalDirectCost:r.finalDirectCost,sourceDocId:r.sourceDocId})),
 sourceIds:matches.map(x=>x.sourceDocId),notice:"Comparisons use completed sample cost records. Supplier prices haven't been verified and no client quote has been issued."};
}
function workflow(industry,query){
 const q=bounded(query,180),ts=tokens(q);
 const cards=curated.cards.filter(x=>x.industry===industry).map(c=>{
  const hay=bounded([c.titleEn,c.titleZh,c.summary,c.stage].join(" "),2500);
  return {card:c,score:ts.reduce((n,t)=>n+(hay.includes(t)?1:0),0)};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
 const step=curated.workflows[industry].filter(x=>!q||[x.title,x.input,x.output].join(" ").toLowerCase().includes(q)).slice(0,4);
 const sourceIds=cards.map(x=>x.card.id);
 return {isPublicEvidence:true,notes:cards.map(({card})=>({id:card.id,title:card.titleZh+" · "+card.titleEn,summary:card.summary,limits:card.limits,originalSourceIds:card.evidenceIds})),exampleStages:step,sourceIds,notice:"Some references are vendor examples or historical contracts, not universal rules. Regulatory applicability requires qualified review."};
}
/** tool schemas are STRICT. The model cannot authorize mutations through these functions. */
const tools=[
 {name:"get_source",description:"Read exact source text as displayed in the workspace. REG- IDs are derived register snapshots; DOC/STD IDs are documents. Do not treat an associated document as proof of register fields.",properties:{source_id:{type:"string"}}},
 {name:"conversation_context",description:"Read a bounded directory of projects and contacts for conversational clarification. Not permission to approve or change records.",properties:{}},
 {name:"operations_snapshot",description:"Fetch demo-workspace metrics as of the snapshot date: projects, pending approvals, blockers, quote versions marked Sent, sum of latest draft quotes, and weighted proposed gross margin. Never use for live today data.",properties:{}},
 {name:"search_projects",description:"Search projects/jobs by name, city, manager, stage or ID in the selected sample workspace.",properties:{query:{type:"string"}}},
 {name:"get_project",description:"Get one matching project/job, sample tasks, approvals, documents and latest draft quote.",properties:{project_id:{type:"string"}}},
 {name:"get_quote",description:"Get current draft quotation and version history for a project/job. Exact deterministic recorded values, not revenue.",properties:{project_id:{type:"string"}}},
 {name:"list_priorities",description:"Review ALL approvals, open work, deadlines and related document statuses before returning a project-diverse shortlist. Not a business-impact ranking. Read-only.",properties:{limit:{type:"integer"}}},
 {name:"search_company_knowledge",description:"Retrieve source-linked passages from the industry demo corpus and public Taiwan reference notes.",properties:{query:{type:"string"}}},
 {name:"get_suppliers",description:"Retrieve the sample supplier directory; pricing and lead times are unverified.",properties:{query:{type:"string"}}},
 {name:"find_historical_jobs",description:"Find completed sample jobs by category and quantity; do not infer current prices.",properties:{category:{type:"string"},quantity:{type:"integer"}}},
 {name:"industry_guidance",description:"Find cited Taiwan industry workflow guidance and important applicability cautions.",properties:{query:{type:"string"}}}
];
export const copilotTools=tools.map(x=>({type:"function",name:x.name,description:x.description,strict:true,parameters:{type:"object",properties:x.properties,required:Object.keys(x.properties),additionalProperties:false}}));
export function runCopilotTool(industry,name,args={}){
 if(!validIndustry(industry))return {error:"Invalid industry.",sourceIds:[]};
 const a=typeof args==="object"&&args&&!Array.isArray(args)?args:{};
 try{
 switch(name){
 case "get_source":{const d=allDemoSources(industry).find(d=>d.id===text(a.source_id));return d?{id:d.id,projectId:d.projectId,kind:d.kind,evidenceKind:d.basisType==="DEMO_REGISTER"?"register":"document",title:d.title,version:d.version,body:d.body,sourceIds:[d.id]}:{found:false,sourceIds:[]};}
 case "conversation_context":{const {seed}=pack(industry);return {asOf:seed.meta.date,projects:seed.projects.map(p=>({id:p.id,name:p.name,manager:p.manager,sourceId:registerSourceId(p.id)})),sourceIds:seed.projects.map(p=>registerSourceId(p.id)),note:"Managers are contacts, not assumed authorized approvers."};}
 case "operations_snapshot":return snapshot(industry);
 case "search_projects":return projects(industry,text(a.query).slice(0,130));
 case "get_project":return project(industry,text(a.project_id).slice(0,120));
 case "get_quote":return quote(industry,text(a.project_id).slice(0,120));
 case "list_priorities":return priorities(industry,a.limit);
 case "search_company_knowledge":return {matches:retrieveDocs(industry,text(a.query),5),sourceIds:retrieveDocs(industry,text(a.query),5).map(x=>x.id)};
 case "get_suppliers":return suppliers(industry,text(a.query).slice(0,120));
 case "find_historical_jobs":return historical(industry,text(a.category).slice(0,80),a.quantity);
 case "industry_guidance":return workflow(industry,text(a.query).slice(0,140));
 default:return {error:"Tool not available.",sourceIds:[]};
 }
 }catch{return {error:"Requested sample record could not be retrieved.",sourceIds:[]};}
}
export const toolNames=tools.map(x=>x.name);
export function toolsForSourceIds(industry,ids){const trusted=demoSourceIds(industry);return distinct(ids).filter(x=>trusted.has(x)).slice(0,16);}
export const allowedActionsFromTools=names=>{
 const map={get_source:"knowledge",conversation_context:"projects",operations_snapshot:"overview",search_projects:"projects",get_project:"projects",get_quote:"quotes",list_priorities:"approvals",search_company_knowledge:"knowledge",get_suppliers:"suppliers",find_historical_jobs:"history",industry_guidance:"playbook"};
 return distinct(names.map(n=>map[n]).filter(Boolean)).slice(0,5);
};
