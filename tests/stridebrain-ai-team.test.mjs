import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {readFileSync} from "node:fs";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {WorkspaceModel}=await import("../public/stridebrain-demo/core-model.js");
const {getPack}=await import("../public/stridebrain-demo/industry-packs.js");
const {listAgents,runAgent,selectAgent,approveAndExecuteAgentAction,defaultAiTeamState}=await import("../public/stridebrain-demo/ai-team.js");
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
