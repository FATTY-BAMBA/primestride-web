import test from "node:test";
import assert from "node:assert/strict";
import {riskRadarSignals} from "../public/stridebrain-demo/operational-signals.js";
test("risk radar lists verified blockers and known source documents only",()=>{
 const documents=new Set(["DOC-1"]);
 const model={tasks:()=>[{id:"WO-1",projectId:"P1",status:"Blocked",sourceDocId:"DOC-1"},{id:"WO-2",projectId:"P1",status:"Blocked",sourceDocId:"DOC-MISSING"},{id:"WO-3",projectId:"P2",status:"In progress"}],approvals:()=>[{id:"APR-1",projectId:"P1",status:"Pending",sourceDocId:"DOC-MISSING"}],document:id=>documents.has(id)?{id}:null};
 const result=riskRadarSignals(model,{});
 assert.equal(result.blocked[0].blockedCount,2);
 assert.deepEqual(result.blocked[0].sourceIds,["DOC-1"]);
 assert.deepEqual(result.missing.map(x=>x.approvalId),["APR-1"]);
});
test("risk radar doesn't fabricate issues for clear workspaces",()=>{
 const model={tasks:()=>[],approvals:()=>[],document:()=>null};
 assert.deepEqual(riskRadarSignals(model,{}),{blocked:[],missing:[],count:0});
});
