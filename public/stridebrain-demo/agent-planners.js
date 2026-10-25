import {reviewPriorities} from "./priority-review.js";
import {commercialReview} from "./commercial-review.js";

const clean=x=>String(x??"").trim();
const unique=xs=>[...new Set(xs.filter(Boolean))];

function taskAction({id,projectId,projectName,recordId,title,contact,dueDate,sourceIds,taskTitle,draftZh,draftEn,draftKind="message"}){
 return {id,projectId,projectName,recordId,title,contact,dueDate:dueDate||null,sourceIds:unique(sourceIds),
  taskTitle,draftZh,draftEn,draftKind,state:"prepared",preparedAt:new Date().toISOString(),approvedAt:null,executedAt:null,generatedTaskId:null,
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
 const review=reviewPriorities(model.seed,{limit:8});
 const ranked=review.items.slice().sort((a,b)=>Number(Boolean(b.primaryAction.blocked))-Number(Boolean(a.primaryAction.blocked))||(a.daysFromSnapshot??999)-(b.daysFromSnapshot??999)).slice(0,3);
 const items=ranked.map((item,index)=>{
  const a=item.primaryAction,contact=clean(a.owner||item.manager||model.pack.owner||"負責人");
  const issue=a.blocked?"目前記錄為受阻":"接近記錄到期日";
  return taskAction({id:runId+"-"+(index+1),projectId:item.projectId,projectName:item.projectName,recordId:a.id,title:a.title,contact,dueDate:a.dueDate,
   sourceIds:prioritySources(item),taskTitle:"Project coordination · "+a.title,
   draftZh:contact+" 您好，"+item.projectName+" 的 "+a.id+"「"+a.title+"」"+issue+"。請確認目前卡點、下一個交接人，以及是否需要專案經理介入。此訊息僅為草稿，尚未送出。",
   draftEn:"Hi "+contact+", "+item.projectName+"'s "+a.id+" ("+a.title+") is "+(a.blocked?"recorded as blocked":"approaching its recorded due date")+". Please confirm the blocker, next handoff owner, and whether the project manager needs to step in. This is a draft only."});
 });
 return {asOf:review.asOf,items,basis:"Project coordination shortlist from recorded blockers and due dates; no inferred dependency is treated as proven."};
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
