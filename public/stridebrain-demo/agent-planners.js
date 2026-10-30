import {reviewPriorities,reviewCoordination} from "./priority-review.js";
import {commercialReview} from "./commercial-review.js";

const clean=x=>String(x??"").trim();
const unique=xs=>[...new Set(xs.filter(Boolean))];

function taskAction({id,projectId,projectName,recordId,title,contact,dueDate,sourceIds,taskTitle,draftZh,draftEn,draftKind="message",rationale="",coordination=null}){
 return {id,projectId,projectName,recordId,title,contact,dueDate:dueDate||null,sourceIds:unique(sourceIds),
  taskTitle,draftZh,draftEn,draftKind,rationale,coordination,state:"prepared",preparedAt:new Date().toISOString(),approvedAt:null,executedAt:null,generatedTaskId:null,
  proposedAction:{kind:"create_internal_task"}};
}
const prioritySources=item=>unique(["REG-"+item.primaryAction.id,item.primaryAction.sourceDocId,...(item.sourceIds||[])]);

export function planOperationsAssistant(model,runId){
 const review=reviewPriorities(model.seed,{limit:3});
 const items=review.items.map((item,index)=>{
  const a=item.primaryAction,contact=clean(a.owner||item.manager||model.pack.owner||"負責人");
  return taskAction({id:runId+"-"+(index+1),projectId:item.projectId,projectName:item.projectName,recordId:a.id,title:a.title,contact,dueDate:a.dueDate,
   sourceIds:prioritySources(item),taskTitle:"Follow-up · "+a.title,
   draftZh:contact+" 您好，StrideBrain 注意到 "+a.id+"「"+a.title+"」的記錄到期日為 "+(a.dueDate||"未記錄")+"。想請您確認目前進度，以及是否還有未完成的決定。此訊息僅為草稿，尚未送出。",
   draftEn:"Hi "+contact+", StrideBrain flagged "+a.id+" ("+a.title+") with a recorded due date of "+(a.dueDate||"not recorded")+". Could you confirm the current status and any remaining decision? This is a draft only."});
 });
 return {asOf:review.asOf,items,basis:"Shared workspace priority review; not an overall business-impact ranking."};
}

export function planProjectCoordinator(model,runId){
 const review=reviewCoordination(model.seed,{limit:3});
 const items=review.items.map((item,index)=>{
  const contact=clean(item.recordedOwner||item.manager||model.pack.owner||"負責人");
  const signalZh=item.coordinationSignal==="recorded_blocker"?"目前記錄為受阻":item.coordinationSignal==="status_verification"?"有待確認的核准／狀態紀錄":"接近記錄到期日";
  const signalEn=item.coordinationSignal==="recorded_blocker"?"is recorded as blocked":item.coordinationSignal==="status_verification"?"has an approval/status record that needs verification":"is approaching its recorded due date";
  const nextZh=item.coordinationSignal==="recorded_blocker"?"請確認目前卡點、負責人與下一個交接。":item.coordinationSignal==="status_verification"?"請先確認目前核准狀態、負責人與是否需要下一步協調。":"請確認目前進度、下一個交接人與是否需要專案經理介入。";
  const nextEn=item.coordinationSignal==="recorded_blocker"?"Please confirm the blocker, recorded owner and next handoff.":item.coordinationSignal==="status_verification"?"Please verify the current approval status, recorded owner and whether coordination is needed.":"Please confirm current status, the next handoff owner and whether the project manager needs to step in.";
  return taskAction({id:runId+"-"+(index+1),projectId:item.projectId,projectName:item.projectName,recordId:item.recordId,title:item.title,contact,dueDate:item.dueDate,
   sourceIds:item.sourceIds,taskTitle:"Project coordination · "+item.title,
   rationale:item.coordinationSignal==="recorded_blocker"?"Recorded blocker: "+(item.recordedBlocker||"status requires confirmation")+".":item.coordinationSignal==="status_verification"?"Pending approval/status records should be reconciled before the next handoff.":"Recorded due date is near the workspace snapshot; confirm handoff readiness.",
   coordination:{signal:item.coordinationSignal,dueDate:item.dueDate||null,recordedBlocker:item.recordedBlocker||null,recordedOwner:item.recordedOwner||contact,nextStep:item.nextStep||null},
   draftZh:contact+" 您好，"+item.projectName+" 的 "+item.recordId+"「"+item.title+"」"+signalZh+"。"+nextZh+" 此訊息僅為草稿，尚未送出。",
   draftEn:"Hi "+contact+", "+item.projectName+"'s "+item.recordId+" ("+item.title+") "+signalEn+". "+nextEn+" This is a draft only."});
 });
 return {asOf:review.asOf,items,basis:"Coordination review intentionally covers recorded blockers, near-term handoffs/deadlines and pending approval/status checks when available; no undocumented dependency or critical path is inferred."};
}

export function planQuoteGuardian(model,runId){
 const rows=commercialReview(model.seed,{limit:3});
 const items=rows.map((row,index)=>{
  const contact=clean(row.manager||model.pack.owner||"負責人");
  const margin=row.marginPct==null?"未能計算":row.marginPct.toFixed(1)+"%";
  const target=row.targetMarginPct==null?"未記錄":row.targetMarginPct.toFixed(1)+"%";
  const note=row.belowTarget?"目前試算毛利低於記錄的目標毛利":"目前試算毛利未低於記錄的目標毛利";
  return taskAction({id:runId+"-"+(index+1),projectId:row.projectId,projectName:row.projectName,recordId:row.quoteId,title:"Quote margin review",contact,
   sourceIds:row.sourceIds,taskTitle:"Quote review · "+row.quoteId,draftKind:"review",
   draftZh:"請複核 "+row.quoteId+"：記錄報價未稅 "+row.priceExTax.toLocaleString("en-US")+"，直接成本 "+row.directCost.toLocaleString("en-US")+"，試算毛利率 "+margin+"，目標 "+target+"。"+note+"。請先確認版本與範圍是否可比；這不是實際獲利判定。",
   draftEn:"Review "+row.quoteId+": recorded pre-tax price "+row.priceExTax.toLocaleString("en-US")+", direct cost "+row.directCost.toLocaleString("en-US")+", calculated margin "+margin+", target "+target+". "+(row.belowTarget?"The calculated margin is below the recorded target.":"The calculated margin is not below the recorded target.")+" Confirm version and scope comparability first; this is not a realized-profit determination."});
 });
 return {asOf:model.seed.meta?.date||null,items,basis:"Calculated only from recorded quotation price and direct cost; no loss or causal claim is made."};
}
