import {planOperationsAssistant,planProjectCoordinator,planQuoteGuardian} from "./agent-planners.js";

const now=()=>new Date().toISOString();
const registry={
 "operations-assistant":{
  id:"operations-assistant",nameZh:"營運特助",nameEn:"Operations Assistant",version:"v0.3",
  descriptionZh:"整理優先事項、查核來源、準備追蹤訊息與待辦。",descriptionEn:"Reviews priorities and prepares evidence-backed follow-ups and tasks.",
  planner:planOperationsAssistant,
  permissions:{automatic:["read_records","calculate","draft"],approval:["create_internal_task"],blocked:["send_external_message","modify_business_records","approve_quote","payment"]}
 },
 "project-coordinator":{
  id:"project-coordinator",nameZh:"專案協調員",nameEn:"Project Coordinator",version:"v0.4",
  descriptionZh:"盯期限、受阻工作、交接與責任人，準備協調動作。",descriptionEn:"Tracks deadlines, blockers, handoffs and owners, then prepares coordination actions.",
  planner:planProjectCoordinator,
  permissions:{automatic:["read_records","calculate","draft"],approval:["create_internal_task"],blocked:["send_external_message","modify_business_records","approve_quote","payment"]}
 },
 "quote-margin-guardian":{
  id:"quote-margin-guardian",nameZh:"估價與毛利守門員",nameEn:"Quote & Margin Guardian",version:"v0.4",
  descriptionZh:"檢查報價版本、成本與試算毛利，準備需要人工複核的工作。",descriptionEn:"Reviews quote versions, costs and calculated margins, then prepares human review work.",
  planner:planQuoteGuardian,
  permissions:{automatic:["read_records","calculate","draft"],approval:["create_internal_task"],blocked:["send_external_message","modify_business_records","approve_quote","payment"]}
 }
};
export const AGENT_DEFINITIONS=Object.freeze(Object.fromEntries(Object.entries(registry).map(([k,v])=>[k,Object.freeze({...v,permissions:Object.freeze({...v.permissions})})])));
export function listAgents(){return Object.values(AGENT_DEFINITIONS);}
export function defaultAiTeamState(){return {activeAgentId:"operations-assistant",activeRunId:null,runs:[],generatedTasks:[],emailReceipts:[]};}
export function normaliseAiTeamState(value){
 const fresh=defaultAiTeamState(),v=value&&typeof value==="object"?value:{},agent=AGENT_DEFINITIONS[v.activeAgentId]?v.activeAgentId:fresh.activeAgentId;
 return {activeAgentId:agent,activeRunId:typeof v.activeRunId==="string"?v.activeRunId:null,
  runs:Array.isArray(v.runs)?v.runs.slice(0,24):[],generatedTasks:Array.isArray(v.generatedTasks)?v.generatedTasks.slice(0,80):[],emailReceipts:Array.isArray(v.emailReceipts)?v.emailReceipts.slice(0,40):[]};
}
export function selectAgent(state,agentId){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 if(!AGENT_DEFINITIONS[agentId])return {ok:false,reason:"Unknown AI teammate."};
 state.aiTeam.activeAgentId=agentId;
 const latest=state.aiTeam.runs.find(r=>r.agentId===agentId);
 state.aiTeam.activeRunId=latest?.id||null;
 return {ok:true,agent:AGENT_DEFINITIONS[agentId]};
}
export function runAgent(state,model,agentId=state.aiTeam?.activeAgentId){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 const agent=AGENT_DEFINITIONS[agentId];if(!agent)return {ok:false,reason:"Unknown AI teammate."};
 const runId="AG-"+agentId.split("-").map(x=>x[0]).join("").toUpperCase()+"-"+Date.now().toString(36);
 const plan=agent.planner(model,runId);
 const run={id:runId,agentId,createdAt:now(),asOf:plan.asOf||null,status:"waiting_for_approval",items:plan.items||[],
  summary:{prepared:(plan.items||[]).length,completed:0},basis:plan.basis||"",permissions:agent.permissions,
  notice:"Read-only investigation and drafts are automatic. Internal task creation requires human approval. External actions are blocked in this demo."};
 state.aiTeam.runs.unshift(run);state.aiTeam.runs=state.aiTeam.runs.slice(0,24);state.aiTeam.activeAgentId=agentId;state.aiTeam.activeRunId=runId;
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:agent.nameEn+" prepared "+run.items.length+" actions for human review."});
 state.audit=state.audit.slice(0,60);
 return {ok:true,run};
}
export function activeAgentRun(state,agentId=state.aiTeam?.activeAgentId){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 return state.aiTeam.runs.find(r=>r.agentId===agentId&&r.id===state.aiTeam.activeRunId)||state.aiTeam.runs.find(r=>r.agentId===agentId)||null;
}
export function recordModelAgentPlan(state,model,plan){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 const agent=AGENT_DEFINITIONS[plan?.agentId];
 if(!agent||!Array.isArray(plan?.proposals))return {ok:false,reason:"Invalid AI teammate plan."};
 const initials=agent.id.split("-").map(x=>x[0]).join("").toUpperCase();
 const runId="MP-"+initials+"-"+Date.now().toString(36);
 const items=plan.proposals.slice(0,3).flatMap((p,index)=>{
  const project=model.project?.(p?.projectId);
  const sourceIds=Array.isArray(p?.sourceIds)?[...new Set(p.sourceIds.filter(x=>typeof x==="string"&&x.length>=3&&x.length<=90))].slice(0,6):[];
  if(!project||!sourceIds.length||typeof p?.recordId!=="string"||typeof p?.contact!=="string"||typeof p?.title!=="string")return [];
  if(agent.id==="quote-margin-guardian"&&!/^Q-[A-Z0-9-]+$/.test(p.recordId))return [];
  return [{
   id:runId+"-"+(index+1),projectId:project.id,projectName:project.name,recordId:String(p.recordId).slice(0,90),
   title:String(p.title).slice(0,120),contact:String(p.contact).slice(0,80),dueDate:null,sourceIds,
   taskTitle:agent.nameEn+" · "+String(p.title).slice(0,100),draftZh:String(p.draftZh||"").slice(0,600),draftEn:String(p.draftEn||"").slice(0,600),
   draftKind:agent.id==="quote-margin-guardian"?"review":"message",rationale:String(p.rationale||"").slice(0,320),state:"prepared",preparedAt:now(),approvedAt:null,executedAt:null,generatedTaskId:null,
   proposedAction:{kind:"create_internal_task"}
  }];
 });
 if(!items.length)return {ok:false,reason:"The model plan did not contain a valid evidence-backed proposal."};
 const run={id:runId,agentId:agent.id,createdAt:now(),asOf:plan.asOf||null,status:"waiting_for_approval",items,
  summary:{prepared:items.length,completed:0},basis:plan.summary||"Model-driven plan grounded in read-only StrideBrain tools.",
  permissions:agent.permissions,modelDriven:true,modelLabel:String(plan.modelLabel||plan.modelId||"AI model").slice(0,100),
  timeline:Array.isArray(plan.timeline)?plan.timeline.slice(0,12).map(x=>({tool:String(x?.tool||"").slice(0,60),status:String(x?.status||"").slice(0,30),label:String(x?.label||"").slice(0,160)})):[],
  notice:"The model prepared proposals only. StrideBrain revalidated them and still requires human approval before creating any internal task."};
 state.aiTeam.runs.unshift(run);state.aiTeam.runs=state.aiTeam.runs.slice(0,24);state.aiTeam.activeAgentId=agent.id;state.aiTeam.activeRunId=runId;
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:"Model-driven "+agent.nameEn+" prepared "+items.length+" validated proposals for human review."});
 state.audit=state.audit.slice(0,60);
 return {ok:true,run};
}
export function recordEmailReceipt(state,itemId,receipt){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 if(!itemId||!receipt?.receiptId||receipt.status!=="accepted")return {ok:false};
 const entry={itemId,receiptId:String(receipt.receiptId),provider:String(receipt.provider||""),status:"accepted",acceptedAt:String(receipt.acceptedAt||""),to:String(receipt.to||""),subject:String(receipt.subject||"")};
 state.aiTeam.emailReceipts=state.aiTeam.emailReceipts.filter(x=>x.itemId!==itemId);
 state.aiTeam.emailReceipts.unshift(entry);state.aiTeam.emailReceipts=state.aiTeam.emailReceipts.slice(0,40);
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:"Human approved external email for "+itemId+"; provider accepted receipt "+entry.receiptId+"."});
 state.audit=state.audit.slice(0,60);
 return {ok:true,entry};
}
export function approveAndExecuteAgentAction(state,itemId){
 state.aiTeam=normaliseAiTeamState(state.aiTeam);
 const run=state.aiTeam.runs.find(r=>r.id===state.aiTeam.activeRunId),agent=run&&AGENT_DEFINITIONS[run.agentId],item=run?.items.find(x=>x.id===itemId);
 if(!run||!agent||!item)return {ok:false,reason:"Prepared action not found."};
 if(item.state==="completed")return {ok:false,reason:"This action has already been completed."};
 const kind=item.proposedAction?.kind;
 if(agent.permissions.blocked.includes(kind))return {ok:false,reason:"This action is blocked for this AI teammate."};
 if(!agent.permissions.approval.includes(kind))return {ok:false,reason:"This action is not approved for execution by this AI teammate."};
 if(kind!=="create_internal_task")return {ok:false,reason:"Unsupported approved action."};
 const approvedAt=now(),taskId="AI-WO-"+run.agentId.split("-").map(x=>x[0]).join("").toUpperCase()+"-"+item.id.split("-").at(-1)+"-"+run.id.slice(-5).toUpperCase();
 item.approvedAt=approvedAt;item.executedAt=approvedAt;item.state="completed";item.generatedTaskId=taskId;
 if(!state.aiTeam.generatedTasks.some(t=>t.id===taskId))state.aiTeam.generatedTasks.unshift({
  id:taskId,projectId:item.projectId,title:item.taskTitle,owner:item.contact,status:"Upcoming",dueDate:"Owner to schedule",
  blockedBy:null,sourceDocId:item.sourceIds[0]||null,synthetic:true,createdBy:agent.nameZh,agentId:agent.id,createdAt:approvedAt
 });
 run.summary.completed=run.items.filter(x=>x.state==="completed").length;
 run.status=run.summary.completed===run.items.length?"completed":"waiting_for_approval";
 state.audit=Array.isArray(state.audit)?state.audit:[];
 state.audit.unshift({at:new Date().toLocaleString("en-TW",{hour12:false}),text:"Human approved "+agent.nameEn+" action "+item.id+"; created demo follow-up "+taskId+"."});
 state.audit=state.audit.slice(0,60);
 return {ok:true,taskId,item,agent};
}
