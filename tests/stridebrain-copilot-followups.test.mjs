import test from "node:test";
import assert from "node:assert/strict";
import {followUpsFor} from "../public/stridebrain-demo/copilot-suggestions.js";

test("follow-ups are grounded in an actual project ID from an answer",()=>{
 const options=followUpsFor("Which projects are blocked?","interior",["approvals"],"PRJ-101 Songshan Residence has pending approvals.");
 assert.equal(options.length,3);
 assert.ok(options.every(x=>x.prompt.includes("PRJ-101")));
 assert.ok(options.some(x=>x.label==="Root causes"));
});
test("no invented project context when evidence contains no project ID",()=>{
 const options=followUpsFor("Which suppliers are late?","printing",["suppliers"],"Supplier lead times require confirmation.");
 assert.equal(options.length,3);
 assert.ok(options.every(x=>!x.prompt.includes("PRJ-")));
 assert.ok(options.every(x=>!(/\bsent\b|approved automatically/i.test(x.prompt))));
});
test("Traditional Chinese input produces localized follow-up labels and instructions",()=>{
 const options=followUpsFor("哪些專案需要先處理？","interior",["approvals"],"PRJ-103 尚有待核准項目");
 assert.equal(options.length,3);
 assert.ok(options.every(x=>x.prompt.startsWith("請用繁體中文回答：")));
 assert.ok(options.every(x=>x.prompt.includes("PRJ-103")));
 assert.equal(options[0].label,"找出卡關原因");
});
