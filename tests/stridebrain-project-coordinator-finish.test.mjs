import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {readFileSync} from "node:fs";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);

const {reviewCoordination}=await import("../public/stridebrain-demo/priority-review.js");
const {WorkspaceModel}=await import("../public/stridebrain-demo/core-model.js");
const {getPack}=await import("../public/stridebrain-demo/industry-packs.js");
const {runAgent,listAgents,defaultAiTeamState}=await import("../public/stridebrain-demo/ai-team.js");
const seed=JSON.parse(readFileSync("public/stridebrain-interiors/seed.json","utf8"));
const model=new WorkspaceModel(seed,getPack("interior"));

test("Project Coordinator review covers blocker, handoff/deadline, and approval status deterministically",()=>{
 const review=reviewCoordination(seed,{limit:3});
 assert.equal(review.items.length,3);
 assert.deepEqual(review.items.map(x=>x.coordinationSignal),["recorded_blocker","near_term_handoff","status_verification"]);
 assert.equal(new Set(review.items.map(x=>x.projectId)).size,3);
 assert.ok(review.items.every(x=>x.recordId&&x.recordedOwner&&x.sourceIds.length>=2));
 assert.ok(review.items[0].recordedBlocker);
 assert.equal(review.items[1].recordId,"WO-1040");
 assert.match(review.items[2].recordId,/^APR-/);
});

test("Project Coordinator runtime carries evidence-locked coordination metadata",()=>{
 const state={variation:{},tasks:{},approvals:{},readiness:{},aiTeam:defaultAiTeamState(),audit:[]};
 const result=runAgent(state,model,"project-coordinator");
 assert.equal(result.ok,true);
 assert.equal(result.run.items.length,3);
 assert.deepEqual(result.run.items.map(x=>x.coordination?.signal),["recorded_blocker","near_term_handoff","status_verification"]);
 assert.ok(result.run.items.every(x=>x.coordination?.recordedOwner===x.contact));
 assert.equal(listAgents().find(x=>x.id==="project-coordinator").version,"v0.6");
});

test("Project Coordinator presentation exposes the three coordination concepts and opens selected draft",()=>{
 const view=readFileSync("public/stridebrain-demo/views-ai-team.js","utf8");
 assert.match(view,/Recorded blocker/);
 assert.match(view,/Near-term handoff/);
 assert.match(view,/Approval \/ status check/);
 assert.match(view,/selected\.id===["']project-coordinator["']\?["'] open["']/);
 assert.match(view,/coordination_guard/);
});

test("Project Coordinator has a safe record-grounded fallback when live planning is unavailable",()=>{
 const app=readFileSync("public/stridebrain-demo/app.js","utf8");
 assert.match(app,/agentId===["']project-coordinator["']/);
 assert.match(app,/runAgent\(state,model,agentId\)/);
 assert.match(app,/verified workspace records|可驗證的工作區紀錄/);
});
