import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {readFileSync} from "node:fs";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {WorkspaceModel}=await import("../public/stridebrain-demo/core-model.js");
const {getPack}=await import("../public/stridebrain-demo/industry-packs.js");
const {listAgents,runAgent,selectAgent,recordModelAgentPlan,recordEmailReceipt,approveAndExecuteAgentAction,defaultAiTeamState}=await import("../public/stridebrain-demo/ai-team.js");
const seed=JSON.parse(readFileSync("public/stridebrain-interiors/seed.json","utf8")),model=new WorkspaceModel(seed,getPack("interior"));
const state=()=>({variation:{},tasks:{},approvals:{},readiness:{},aiTeam:defaultAiTeamState(),audit:[]});

test("shared runtime exposes three active specialist teammates",()=>{assert.deepEqual(listAgents().map(x=>x.id),["operations-assistant","project-coordinator","quote-margin-guardian"]);assert.ok(listAgents().every(x=>x.permissions.approval.includes("create_internal_task")&&x.permissions.blocked.includes("send_external_message")));});
for(const id of ["operations-assistant","project-coordinator","quote-margin-guardian"]){
 test(id+" prepares bounded evidence-linked actions without executing",()=>{const s=state();selectAgent(s,id);const r=runAgent(s,model,id);assert.equal(r.ok,true);assert.ok(r.run.items.length>=1);assert.equal(s.aiTeam.generatedTasks.length,0);assert.ok(r.run.items.every(x=>x.state==="prepared"&&x.sourceIds.length&&x.proposedAction.kind==="create_internal_task"));});
}
test("quote guardian uses recorded quotation evidence and calculation language",()=>{const s=state(),r=runAgent(s,model,"quote-margin-guardian").run;assert.ok(r.items.every(x=>x.recordId.startsWith("Q-")&&x.sourceIds.some(id=>id.startsWith("REG-Q-"))));assert.match(r.items[0].draftZh,/試算毛利率|複核/);});
test("human approval creates one internal demo follow-up task and audit entry",()=>{const s=state(),r=runAgent(s,model,"project-coordinator").run,x=approveAndExecuteAgentAction(s,r.items[0].id);assert.equal(x.ok,true);assert.equal(s.aiTeam.generatedTasks.length,1);assert.match(s.aiTeam.generatedTasks[0].id,/^AI-WO-PC-/);assert.equal(r.items[0].state,"completed");assert.ok(s.audit.some(a=>a.text.includes("Human approved")));});
test("generated AI task becomes visible in the normal work-order model",()=>{const s=state(),r=runAgent(s,model,"operations-assistant").run;approveAndExecuteAgentAction(s,r.items[0].id);assert.ok(model.tasks(s).some(x=>x.id===r.items[0].generatedTaskId&&x.synthetic));});
test("runtime rejects a blocked outbound action even after a user click",()=>{const s=state(),r=runAgent(s,model,"operations-assistant").run;r.items[0].proposedAction.kind="send_external_message";const x=approveAndExecuteAgentAction(s,r.items[0].id);assert.equal(x.ok,false);assert.match(x.reason,/blocked/i);assert.equal(s.aiTeam.generatedTasks.length,0);});
test("runtime rejects unregistered execution kinds",()=>{const s=state(),r=runAgent(s,model,"operations-assistant").run;r.items[0].proposedAction.kind="delete_project";const x=approveAndExecuteAgentAction(s,r.items[0].id);assert.equal(x.ok,false);assert.match(x.reason,/not approved/i);});
test("model plans are normalized into the same approval-required runtime action",()=>{const s=state();const x=recordModelAgentPlan(s,model,{agentId:"operations-assistant",modelLabel:"Test model",asOf:"2026-10-18",summary:"Prepared from tools.",timeline:[{tool:"list_priorities",status:"completed",label:"已查閱"}],proposals:[{projectId:"PRJ-101",recordId:"WO-1001",contact:"Mei Lin",title:"確認丈量",rationale:"接近到期",sourceIds:["REG-WO-1001"],draftZh:"請確認進度。",draftEn:"Please confirm."}]});assert.equal(x.ok,true);assert.equal(x.run.modelDriven,true);assert.equal(x.run.items[0].proposedAction.kind,"create_internal_task");assert.equal(s.aiTeam.generatedTasks.length,0);});
test("browser runtime rejects model proposals without a valid project or evidence",()=>{const s=state();const x=recordModelAgentPlan(s,model,{agentId:"operations-assistant",proposals:[{projectId:"PRJ-999",recordId:"WO-X",contact:"Nobody",title:"Bad",sourceIds:[],draftZh:"x",draftEn:"x"}]});assert.equal(x.ok,false);assert.equal(s.aiTeam.generatedTasks.length,0);});

test("model-driven quote plan stays an internal review and approval-required task",()=>{const s=state();const x=recordModelAgentPlan(s,model,{agentId:"quote-margin-guardian",modelLabel:"Test model",asOf:"2026-10-18",summary:"Reviewed recorded quote.",timeline:[{tool:"review_quotations",status:"completed",label:"已檢查報價"}],proposals:[{projectId:"PRJ-101",recordId:"Q-1005",contact:"Mei Lin",title:"複核 Q-1005",rationale:"確認版本、成本與試算毛利。",sourceIds:["REG-Q-1005"],draftZh:"內部複核，不是實際獲利判定。",draftEn:"Internal review; not a realized-profit determination."}]});assert.equal(x.ok,true);assert.equal(x.run.agentId,"quote-margin-guardian");assert.equal(x.run.items[0].draftKind,"review");assert.equal(x.run.items[0].proposedAction.kind,"create_internal_task");assert.equal(s.aiTeam.generatedTasks.length,0);});

test("accepted external email receipt is stored separately from internal task completion",()=>{const s=state(),r=runAgent(s,model,"project-coordinator").run;const item=r.items[0];const x=recordEmailReceipt(s,item.id,{receiptId:"email_test123",provider:"microsoft-graph",status:"accepted",acceptedAt:"2026-10-25T10:00:00.000Z",to:"leo@example.com",subject:"Follow-up"});assert.equal(x.ok,true);assert.equal(s.aiTeam.emailReceipts.length,1);assert.equal(s.aiTeam.emailReceipts[0].itemId,item.id);assert.equal(item.state,"prepared");assert.equal(s.aiTeam.generatedTasks.length,0);});

test("Project Coordinator is presentation-distinct and coordination-focused",()=>{
 const coordinator=listAgents().find(x=>x.id==="project-coordinator");
 assert.equal(coordinator.version,"v0.6");
 assert.match(coordinator.descriptionEn,/blockers|deadlines|handoffs/i);
 const view=readFileSync("public/stridebrain-demo/views-ai-team.js","utf8");
 assert.match(view,/See what could slip this week/);
 assert.match(view,/Blockers/);
 assert.match(view,/Deadlines/);
 assert.match(view,/Handoffs/);
 assert.match(view,/COORDINATION REVIEW COMPLETE/);
});


test("AI Team demo surface communicates readiness, control and coordination without empty-state language",()=>{
 const view=readFileSync("public/stridebrain-demo/views-ai-team.js","utf8");
 const primary=readFileSync("public/stridebrain-demo/views-primary.js","utf8");
 assert.doesNotMatch(view,/Not run yet/);
 assert.match(view,/CONTROLLED ACTION LAYER/);
 assert.match(view,/AI prepares\. Your team approves\. Every action leaves a receipt\./);
 assert.match(view,/RECORDED OWNER/);
 assert.match(view,/NEXT HANDOFF/);
 assert.doesNotMatch(primary,/No work selected/);
 assert.match(primary,/READY TO REVIEW/);
 assert.match(primary,/HUMAN APPROVAL BOUNDARY/);
});


test("fresh AI Team view leads with the selected teammate mission before secondary controls",async()=>{
 const {aiTeamView}=await import("../public/stridebrain-demo/views-ai-team.js");
 const s=state();selectAgent(s,"project-coordinator");
 const html=aiTeamView({model,pack:getPack("interior"),state:s,view:{agentDecisionId:null,emailDecisionId:null,lineDecisionId:null},locale:"en",emailConnector:{state:"ready",configured:true,roleAllowed:true,sender:"demo@example.com",provider:"google-workspace"},messageConnections:{state:"ready",connections:[],healthByProvider:{}},lineInbox:{state:"ready",identities:[]}});
 assert.ok(html.indexOf("sb-delegate-card-primary")>0);
 assert.ok(html.indexOf("sb-delegate-card-primary")<html.indexOf("sb-control-flow"));
 assert.ok(html.indexOf("sb-control-flow")<html.indexOf("sb-agent-roster-secondary"));
 assert.match(html,/Switch AI teammate/);
 assert.match(html,/sb-permission-disclosure/);
 assert.doesNotMatch(html,/sb-action-proof/);
 assert.match(html,/CONNECTED CHANNELS/);
});

test("completed AI Team review focuses decisions before teammate switching and action proof",async()=>{
 const {aiTeamView}=await import("../public/stridebrain-demo/views-ai-team.js");
 const s=state();selectAgent(s,"project-coordinator");runAgent(s,model,"project-coordinator");
 const html=aiTeamView({model,pack:getPack("interior"),state:s,view:{agentDecisionId:s.aiTeam.runs[0].items[0].id,emailDecisionId:null,lineDecisionId:null},locale:"en",emailConnector:{state:"ready",configured:true,roleAllowed:true,sender:"demo@example.com",provider:"google-workspace"},messageConnections:{state:"ready",connections:[],healthByProvider:{}},lineInbox:{state:"ready",identities:[]}});
 assert.ok(html.indexOf("sb-decision-section")<html.indexOf("sb-agent-roster-secondary"));
 assert.match(html,/sb-action-proof/);
});
