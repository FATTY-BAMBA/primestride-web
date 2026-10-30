import test from "node:test";
import assert from "node:assert/strict";
import {marginScenarios} from "../public/stridebrain-demo/margin-guardian.js";
test("margin guardian scenarios are reproducible and current assumption is identified",()=>{
 const s=marginScenarios(80000,20,5);
 assert.deepEqual(s.map(x=>x.margin),[15,20,25]);
 assert.equal(s.filter(x=>x.current).length,1);
 assert.equal(s[1].preTax,100000);
 assert.equal(s[1].grossProfit,20000);
 assert.equal(s[1].total,105000);
});
test("reject invalid financial inputs without inventing quoted values",()=>{
 assert.deepEqual(marginScenarios(-1,20,5),[]);
 assert.deepEqual(marginScenarios(100,100,5),[]);
 assert.deepEqual(marginScenarios("invalid",20,5),[]);
});
test("near-boundary margins remain valid without impossible cases",()=>{
 assert.deepEqual(marginScenarios(100,97,5).map(x=>x.margin),[92,97]);
});
