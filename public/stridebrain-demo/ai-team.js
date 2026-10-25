import {reviewPriorities} from "./priority-review.js";

const clean=x=>String(x??"").trim();
const now=()=>new Date().toISOString();
export function defaultAiTeamState(){return {activeRunId:null,runs:[],generatedTasks:[]};}
export function normaliseAiTeamState(value){
 const fresh=defaultAiTeamState(),v=value&&typeof value==="object"?value:{};
 return {activeRunId:typeof v.activeRunId==="string"?v.activeRunId:null,
  runs:Array.isArray(v.runs)?v.runs.slice(0,12):[],
  generatedTasks:Array.isArray(v.generatedTasks)?v.generatedTasks.slice(0,40):[]};
}
const sourceIdsFor=item=>[...new Set(["REG-"+item.primaryAction.id,...(item.sourceIds||[])].filter(Boolean))];
const draftFor=(item,contact,locale)=>locale==="en"
 ? "Hi "+contact+", StrideBrain flagged "+item.primaryAction.id+" ("+item.primaryAction.title+") with a recorded due date of "+(item.primaryAction.dueDate||"not recorded")+". Could you confirm the current status and any remaining decision? This is a draft only."
 : contact+" 您好，StrideBrain 注意到 "+item.primaryAction.id+"「"+item.primaryAction.title+"」的記錄到期日為 "+(item.primaryAction.dueDate||"未記錄")+"。想請您確認目前進度，以及是否還有未完成的決定。此訊息僅為草稿，尚未送出。";

export function runOperationsAssistant(state,model){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 const review=reviewPriorities(model.seed,{limit:3}),id="OPS-"+Date.now().toString(36);
 const items=review.items.map((item,index)=>{
  const a=item.primaryAction,contact=clean(a.owner||item.manager||model.pack.owner||"負責人");
  return {id:id+"-"+(index+1),projectId:item.projectId,projectName:item.projectName,recordId:a.id,
   title:a.title,contact,dueDate:a.dueDate||null,sourceIds:sourceIdsFor(item),
   taskTitle:"Follow-up · "+a.title,draftZh:draftFor(item,contact,"zh-TW"),draftEn:draftFor(item,contact,"en"),
   state:"prepared",preparedAt:now(),approvedAt:null,executedAt:null,generatedTaskId:null};
 });
 const run={id,agentId:"operations-assistant",createdAt:now(),asOf:review.asOf,status:"waiting_for_approval",items,
  summary:{prepared:items.length,completed:0},notice:"Read-only investigation and drafts are automatic. Creating demo follow-up tasks requires human approval; no outbound message is sent."};
 state.aiTeam.runs.unshift(run);state.aiTeam.runs=state.aiTeam.runs.slice(0,12);state.aiTeam.activeRunId=id;
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:"AI teammate prepared "+items.length+" follow-up actions for human review."});
 state.audit=state.audit.slice(0,60);
 return run;
}
export function activeOperationsRun(state){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 return state.aiTeam.runs.find(r=>r.id===state.aiTeam.activeRunId)||null;
}
export function approveAndExecuteAgentAction(state,itemId){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 const run=state.aiTeam.runs.find(r=>r.id===state.aiTeam.activeRunId),item=run?.items.find(x=>x.id===itemId);
 if(!run||!item)return {ok:false,reason:"Prepared action not found."};
 if(item.state==="completed")return {ok:false,reason:"This action has already been completed."};
 const approvedAt=now(),taskId="AI-WO-"+item.id.split("-").slice(-1)[0]+"-"+run.id.slice(-5).toUpperCase();
 item.approvedAt=approvedAt;item.executedAt=approvedAt;item.state="completed";item.generatedTaskId=taskId;
 if(!state.aiTeam.generatedTasks.some(t=>t.id===taskId))state.aiTeam.generatedTasks.unshift({
  id:taskId,projectId:item.projectId,title:item.taskTitle,owner:item.contact,status:"Upcoming",
  dueDate:"Owner to schedule",blockedBy:null,sourceDocId:item.sourceIds[0],synthetic:true,createdBy:"StrideBrain 營運特助",createdAt:approvedAt
 });
 run.summary.completed=run.items.filter(x=>x.state==="completed").length;
 run.status=run.summary.completed===run.items.length?"completed":"waiting_for_approval";
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:"Human approved AI teammate action "+item.id+"; created demo follow-up "+taskId+"."});
 state.audit=state.audit.slice(0,60);
 return {ok:true,taskId,item};
}
