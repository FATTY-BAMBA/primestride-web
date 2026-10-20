import test from "node:test";
import assert from "node:assert/strict";
import {COPILOT_INSTRUCTIONS} from "../src/lib/stridebrain-demo/copilot-runner.js";
test("shared cross-provider instructions use product-led sample workspace terms",()=>{
 assert.match(COPILOT_INSTRUCTIONS,/sample workspace/);
 assert.match(COPILOT_INSTRUCTIONS,/Demo data/);
 assert.match(COPILOT_INSTRUCTIONS,/Do not call records synthetic or fictional/i);
});
test("shared instructions surface conflicting records without inventing resolutions",()=>{
 assert.match(COPILOT_INSTRUCTIONS,/Evidence discrepancy/);
 assert.match(COPILOT_INSTRUCTIONS,/資料不一致/);
 assert.match(COPILOT_INSTRUCTIONS,/both record IDs/);
 assert.match(COPILOT_INSTRUCTIONS,/Do not resolve the discrepancy/);
});
