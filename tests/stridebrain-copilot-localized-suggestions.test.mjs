import test from "node:test";
import assert from "node:assert/strict";
import {quickActionsFor,ideasFor,followUpsFor} from "../public/stridebrain-demo/copilot-suggestions.js";
for(const industry of ["interior","printing"]){
 test(industry+" Chinese shortcuts and ideas use Chinese questions",()=>{
  const quick=quickActionsFor(industry,"zh-TW"),ideas=ideasFor(industry,"zh-TW");
  assert.equal(quick.length,5);
  for(const item of [...quick,...ideas]){assert.match(item.label,/[\u3400-\u9fff]/);assert.match(item.prompt,/[\u3400-\u9fff]/);}
 });
 test(industry+" English remains independent",()=>{
  assert.equal(quickActionsFor(industry,"en")[0].label,"This week's risks");
  assert.equal(ideasFor(industry,"en").length,3);
 });
}
test("Traditional Chinese locale controls follow-up labels even after an English question",()=>{
 const questions=followUpsFor("What about quotations?","interior",[],"","zh-TW");
 assert.match(questions[0].label,/[\u3400-\u9fff]/);
 assert.match(questions[0].prompt,/繁體中文/);
});


test("lead Copilot shortcut tees up the proactive Project Coordinator story",()=>{
 const zh=quickActionsFor("interior","zh-TW")[0],en=quickActionsFor("interior","en")[0];
 assert.equal(zh.label,"本週風險");
 assert.match(zh.prompt,/受阻工作/);
 assert.match(zh.prompt,/交接/);
 assert.match(zh.prompt,/核准/);
 assert.match(zh.prompt,/來源依據/);
 assert.equal(en.label,"This week's risks");
 assert.match(en.prompt,/blockers/i);
 assert.match(en.prompt,/handoffs/i);
 assert.match(en.prompt,/approvals/i);
 assert.match(en.prompt,/evidence/i);
});
