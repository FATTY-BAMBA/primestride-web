import test from "node:test";
import assert from "node:assert/strict";
import {operationalSignals} from "../public/stridebrain-demo/operational-signals.js";
test("blocked project approvals get priority, without inventing a causal link",()=>{
 const model={
  approvals:()=>[{id:"APR-2",projectId:"P2",status:"Pending"},{id:"APR-1",projectId:"P1",status:"Pending"},{id:"APR-3",projectId:"P1",status:"Approved"}],
  tasks:()=>[{projectId:"P1",status:"Blocked"},{projectId:"P1",status:"Blocked"},{projectId:"P2",status:"In progress"}]
 };
 const signals=operationalSignals(model,{});
 assert.equal(signals.ranked[0].id,"APR-1");
 assert.equal(signals.ranked[0].blockedCount,2);
 assert.equal(signals.blockedCount,2);
 assert.equal(signals.ranked.length,2);
});
test("clear projects remain reviewable and sorting is deterministic",()=>{
 const model={approvals:()=>[{id:"APR-9",projectId:"P9",status:"Pending"},{id:"APR-2",projectId:"P2",status:"Pending"}],tasks:()=>[]};
 assert.deepEqual(operationalSignals(model,{}).ranked.map(x=>x.id),["APR-2","APR-9"]);
});
