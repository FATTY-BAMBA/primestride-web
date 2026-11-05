import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {readFileSync} from "node:fs";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {WorkspaceModel}=await import("../public/stridebrain-demo/core-model.js");
const {getPack}=await import("../public/stridebrain-demo/industry-packs.js");
const {recordModelAgentPlan,updatePreparedAgentAction,defaultAiTeamState}=await import("../public/stridebrain-demo/ai-team.js");
const {isDraftAnswer,extractDraft,buildDraftHandoffPlan}=await import("../public/stridebrain-demo/copilot-draft-handoff.js");
const seed=JSON.parse(readFileSync("public/stridebrain-interiors/seed.json","utf8")),model=new WorkspaceModel(seed,getPack("interior"));
const state=()=>({variation:{},tasks:{},approvals:{},readiness:{},aiTeam:defaultAiTeamState(),audit:[]});

const quartzAnswer="目前還不能向業主承諾可以改。業主要求的石英石檯面已列為變更 CHG-101-QZ，但尚未核准採購。供應商估算的直接增加成本為 NT$60,000。";
const draftAnswer=[
 "以下是未寄出的詢問草稿：",
 "",
 "**收件人：** Mei Lin",
 "**主旨：** PRJ-101 松山靜宅廚房檯面改石英石，請協助確認",
 "",
 "Mei Lin 您好：",
 "業主想把廚房檯面改成石英石（樣品 QZ-04）。請協助確認供應商庫存與加工交期，以及 APR-1004 變更單評估的核准進度。",
 "謝謝。",
 "",
 "---",
 "注意：此草稿尚未寄出，請確認後再送出。"
].join("\n");
const chat=[
 {role:"user",text:"松山靜宅的業主問：我們能不能把廚房檯面改成石英石？大概會增加多少費用？會影響完工日期嗎？"},
 {role:"assistant",mode:"gpt",text:quartzAnswer,query:"松山靜宅的業主問…",sources:["DOC-1006","DOC-1010","REG-PRJ-101"],context:{selectedProjectId:"PRJ-101"}},
 {role:"user",text:"請草擬一封詢問訊息"},
 {role:"assistant",mode:"gpt",text:draftAnswer,query:"請草擬一封詢問訊息",sources:["DOC-1006","REG-APR-1004"],context:{selectedProjectId:"PRJ-101"}}
];

test("a Copilot message draft is recognised, an analysis answer is not",()=>{
 assert.equal(isDraftAnswer(chat[3]),true);
 assert.equal(isDraftAnswer(chat[1]),false);
});

test("draft extraction keeps the message body and drops the intro, header lines and notes",()=>{
 const d=extractDraft(draftAnswer);
 assert.equal(d.subject,"PRJ-101 松山靜宅廚房檯面改石英石，請協助確認");
 assert.equal(d.recipient,"Mei Lin");
 assert.match(d.draft,/^Mei Lin 您好/);
 assert.match(d.draft,/謝謝。$/);
 assert.doesNotMatch(d.draft,/以下是|主旨|注意|尚未寄出/);
});

test("the quartz draft becomes an editable Project Coordinator card for CHG-101-QZ",()=>{
 const built=buildDraftHandoffPlan(chat,model,{locale:"zh-TW"});
 assert.equal(built.ok,true,built.reason);
 const p=built.plan.proposals[0];
 assert.equal(p.projectId,"PRJ-101");
 assert.equal(p.recordId,"CHG-101-QZ");
 assert.equal(p.contact,"Mei Lin");
 assert.equal(p.title,"廚房檯面改石英石，請協助確認");
 const s=state(),result=recordModelAgentPlan(s,model,built.plan);
 assert.equal(result.ok,true,result.reason);
 const item=result.run.items[0];
 assert.equal(item.recordId,"CHG-101-QZ");
 assert.match(item.draftZh,/QZ-04/);
 assert.equal(s.aiTeam.activeAgentId,"project-coordinator");
 const edited=updatePreparedAgentAction(s,item.id,{draftZh:item.draftZh+"\n請今天下午 3 點前回覆我。"});
 assert.equal(edited.ok,true,edited.reason);
});

test("no draft in the chat means nothing is handed off",()=>{
 const built=buildDraftHandoffPlan(chat.slice(0,2),model,{locale:"zh-TW"});
 assert.equal(built.ok,false);
});
