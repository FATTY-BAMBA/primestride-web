import test from "node:test";
import assert from "node:assert/strict";
import {historicalScopeWarnings} from "../public/stridebrain-demo/margin-guardian.js";
const history={costCodes:[{id:"A",label:"Primary"},{id:"B",label:"Delivery"},{id:"C",label:"Rare"}],records:[
 ...[1,2,3,4].map(n=>({status:"COMPLETE",category:"interior",tier:"standard",sourceDocId:"DOC-"+n,lines:[{code:"A",actualCost:100},{code:"B",actualCost:50},...(n===1?[{code:"C",actualCost:20}]:[])]})),
 {status:"QUOTE_ONLY",category:"interior",tier:"standard",sourceDocId:"D5",lines:[{code:"C",actualCost:50}]},
 {status:"COMPLETE",category:"printing",tier:"standard",sourceDocId:"D6",lines:[{code:"C",actualCost:50}]}
]};
test("flags only repeatedly observed unselected categories with provenance",()=>{
 const result=historicalScopeWarnings(history,{category:"interior",tier:"standard",scope:["A"]});
 assert.deepEqual(result.map(x=>x.code),["B"]);
 assert.equal(result[0].observations,4);
 assert.equal(result[0].sourceIds.length,4);
});
test("does not flag selected codes or insufficient comparable records",()=>{
 assert.deepEqual(historicalScopeWarnings(history,{category:"interior",tier:"standard",scope:["A","B"]}),[]);
 assert.deepEqual(historicalScopeWarnings(history,{category:"printing",tier:"standard",scope:["A"]}),[]);
 assert.deepEqual(historicalScopeWarnings(null,null),[]);
});
test("rare costs and quote-only documents do not generate unsupported warnings",()=>{
 const result=historicalScopeWarnings(history,{category:"interior",tier:"standard",scope:["A"]});
 assert.equal(result.some(x=>x.code==="C"),false);
});
