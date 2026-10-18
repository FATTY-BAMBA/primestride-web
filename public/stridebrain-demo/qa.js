import {getPack} from "./industry-packs.js";
import {WorkspaceModel,approveVariationGate,commitVariation} from "./core-model.js";
import {validateIndustryEvidence} from "./industry-evidence.js";
import {validateHistory,historicalEstimate} from "./historical-estimator.js";
import {getReadinessPack,initialReadiness,evaluateReadiness,validateReadinessSources} from "./readiness-rules.js";
const $=id=>document.getElementById(id);
const get=async path=>{const response=await fetch(path,{cache:"no-store"});if(!response.ok)throw Error(path+" returned HTTP "+response.status);return response;};
const load=async path=>(await get(path)).json();
const row=(name,pass,detail="")=>({name,pass:!!pass,detail:detail?String(detail):""});
const goodInput=(industry,initial)=>industry==="interior"?{...initial,approvedDrawing:"approved",siteMeasure:"verified",supplierStatus:"written",fireImpact:"no",professionalReview:"documented",scheduleReview:"reviewed",clientConsent:"written"}:{...initial,fileFormat:"pdf",widthMm:303,heightMm:426,bleedMm:3,resolutionDpi:300,fonts:"embedded",colorMode:"cmyk",proof:"approved",stock:"confirmed",pressSlot:"confirmed"};
async function industrySmoke(id,evidence){
 const res=[],pack=getPack(id),config=getReadinessPack(id);
 try{
  const [base,history]=await Promise.all([load(pack.dataset),load("./seeds/historical-"+id+".json")]);
  res.push(row("Correct synthetic company dataset",base.meta.mode==="SYNTHETIC_DEMO",base.meta.company));
  res.push(row("Historical cost schema and source files",validateHistory(history).ok,history.records.length+" precedent records"));
  base.documents.push(...history.documents,...evidence.documents.filter(x=>x.industry===id));
  const model=new WorkspaceModel(base,pack);
  res.push(row("Project, quote and source references validate",model.validation.ok,base.projects.length+" work records"));
  res.push(row("Industry evidence references validate",validateReadinessSources(config,model).ok,config.title));
  const initial=initialReadiness(id),report=evaluateReadiness(id,initial),clear=evaluateReadiness(id,goodInput(id,initial));
  res.push(row("Incomplete initial conditions cause a hold",report.counts.hold>0,report.counts.hold+" unresolved items"));
  res.push(row("Fully entered example clears checklist blockers",clear.counts.hold===0&&clear.status==="READY_FOR_HUMAN_REVIEW",clear.message));
  res.push(row("All findings cite inspectable sources",[...report.checks,...clear.checks].every(x=>x.sourceIds.every(ref=>model.document(ref))),"Cited evidence links"));
  const risk=id==="interior"?evaluateReadiness(id,{...goodInput(id,initial),fireImpact:"yes"}):evaluateReadiness(id,{...goodInput(id,initial),widthMm:297});
  res.push(row("Unsafe or mismatched technical details cause a hold",risk.counts.hold>0,"Safety / artwork constraint"));
  const state={variation:{cost:pack.scenario.cost,margin:pack.scenario.margin,supplier:false,owner:false,customer:false,committed:false},readiness:{inputs:initial,assessment:null,reviewTaskCreated:false},tasks:{},approvals:{},audit:[]};
  approveVariationGate(state,"supplier",model);approveVariationGate(state,"owner",model);approveVariationGate(state,"customer",model);
  res.push(row("Commercial approvals alone do not release work",!commitVariation(state,model).ok,"Industry check required"));
  state.readiness.assessment=report;
  res.push(row("Recorded assessment with blockers refuses release",!commitVariation(state,model).ok,"Critical information unresolved"));
  state.readiness.inputs=goodInput(id,initial);state.readiness.assessment=clear;
  const committed=commitVariation(state,model);
  res.push(row("Complete screening + approvals create a work order",committed.ok&&model.tasks(state).some(x=>x.id===pack.scenario.newWorkId),committed.workOrderId||""));
  res.push(row("Duplicate change-order release is prevented",!commitVariation(state,model).ok,"Idempotent sample state"));
  state.readiness.reviewTaskCreated=true;state.readiness.reviewTaskId=config.reviewWorkId;state.readiness.reviewTaskSourceId=config.workSourceId;state.readiness.reviewTaskTitle=config.reviewWorkTitle;
  const linked=model.tasks(state).find(x=>x.id===config.reviewWorkId);
  res.push(row("Readiness task enters shared work register",!!linked&&!!model.document(linked.sourceDocId),linked?.id));
  const estimate=historicalEstimate(history,history.defaults);
  res.push(row("Historical quote derives from eligible costs",estimate.ok&&estimate.lines.reduce((n,x)=>n+x.baseCost,0)===estimate.historicalDirectCost,estimate.comparables.length+" comparable jobs"));
  const files=id==="interior"?["./fixtures/interior/site-measurements.csv","./fixtures/interior/quartz-costs.csv","./fixtures/interior/change-review.html"]:["./fixtures/printing/preflight-manual.csv","./fixtures/printing/recycled-stock-cost.csv","./fixtures/printing/preflight-review.html"];
  const samples=await Promise.all(files.map(async path=>{try{return {path,text:await (await get(path)).text(),ok:true};}catch(error){return {path,error:String(error),ok:false};}}));
  res.push(row("Downloadable sample business files are present",samples.every(x=>x.ok&&x.text.length>200),samples.filter(x=>!x.ok).map(x=>x.path).join(", ")||"2 CSV + 1 printable HTML"));
  const doc=id==="interior"?"./library/industry/interior/REF-I01.md":"./library/industry/printing/REF-P02.md";
  const historyDoc=id==="interior"?"./library/history/interior/HIST-INT-001.md":"./library/history/printing/HIST-PRT-001.md";
  const checked=await Promise.all([doc,historyDoc].map(async path=>{try{const text=await (await get(path)).text();return text.length>100;}catch{return false;}}));
  res.push(row("Curated and historical source files are served",checked.every(Boolean),"Public industry + synthetic cost evidence"));
 }catch(error){res.push(row("Dataset or required module can be loaded",false,String(error)));}
 return res;
}
async function run(){
 const container={interior:$("interior"),printing:$("printing")};
 for(const target of Object.values(container))target.textContent="Loading live preview assets…";
 try{
  const evidence=await load("./seeds/taiwan-industry-evidence.json");
  const verified=validateIndustryEvidence(evidence);
  const results=await Promise.all(["interior","printing"].map(id=>industrySmoke(id,evidence)));
  let count=0,ok=0;
  results.forEach((list,i)=>{
   const id=["interior","printing"][i];
   container[id].innerHTML=list.map(item=>{
    count++;if(item.pass)ok++;
    return '<div class="test '+(item.pass?"pass":"fail")+'"><span class="icon">'+(item.pass?"✓":"×")+'</span><span><strong>'+escapeText(item.name)+'</strong>'+(item.detail?'<br><small>'+escapeText(item.detail)+'</small>':"")+'</span></div>';
   }).join("");
  });
  $("summary").textContent=ok+"/"+count+" checks passed";
  $("meta").textContent="15 public source records · "+verified.referenceCount+" curated references · "+verified.workflowSteps+" workflow stages. Tests do not inspect real files or customer systems.";
 }catch(error){
  $("summary").textContent="Unable to start QA";
  $("meta").textContent=String(error);
  for(const target of Object.values(container))target.textContent="Cannot run until required files are reachable.";
 }
}
function escapeText(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("rerun").addEventListener("click",run);run();
