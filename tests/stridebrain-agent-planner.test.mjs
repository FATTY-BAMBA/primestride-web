import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {MockLanguageModelV4,mockValues} from "ai/test";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {runAgentPlanner}=await import("../src/lib/stridebrain-demo/agent-planner-runner.js");

const usage={inputTokens:{total:10,noCache:10,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:10,text:10,reasoning:undefined}};
const call=(toolName,input,id)=>({content:[{type:"tool-call",toolCallId:id,toolName,input:JSON.stringify(input)}],finishReason:{unified:"tool-calls",raw:undefined},usage,warnings:[]});
const done=text=>({content:[{type:"text",text}],finishReason:{unified:"stop",raw:undefined},usage,warnings:[]});
const mock=(...steps)=>new MockLanguageModelV4({doGenerate:mockValues(...steps)});

test("operations assistant uses read tools before proposing work",async()=>{
 const model=mock(
  call("list_priorities",{limit:3},"o1"),
  call("get_project",{project_id:"PRJ-101"},"o2"),
  call("propose_followup",{project_id:"PRJ-101",record_id:"WO-1001",contact:"Mei Lin",title:"確認現場丈量進度",rationale:"工作單接近到期日，需要確認進度。",source_ids:["REG-WO-1001"],draft_zh:"請確認 WO-1001 現場丈量目前進度。此訊息尚未送出。",draft_en:"Please confirm WO-1001 status. This message has not been sent."},"o3"),
  done("已準備一項追蹤工作。")
 );
 const r=await runAgentPlanner({industry:"interior",goal:"請幫我看今天要先追什麼",locale:"zh-TW",agentId:"operations-assistant",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.equal(r.proposals.length,1);
 assert.deepEqual(r.timeline.map(x=>x.tool),["list_priorities","get_project","propose_followup"]);
 assert.deepEqual(r.executionPolicy.approval,["create_internal_task"]);
});

test("project coordinator inspects priority, project and evidence before proposing coordination",async()=>{
 const model=mock(
  call("review_coordination",{limit:3},"p1"),
  call("get_project",{project_id:"PRJ-104"},"p2"),
  call("get_source",{source_id:"REG-WO-1040"},"p3"),
  call("propose_followup",{project_id:"PRJ-104",record_id:"WO-1040",contact:"Leo Huang",title:"確認交接準備進度",rationale:"交接工作接近記錄到期日，需要確認目前狀態與下一位負責人。",source_ids:["REG-WO-1040"],draft_zh:"請確認 WO-1040 目前進度與下一個交接人。此訊息尚未送出。",draft_en:"Please confirm WO-1040 status and next handoff owner. This message has not been sent."},"p4"),
  done("已準備一項專案協調工作。")
 );
 const r=await runAgentPlanner({industry:"interior",goal:"檢查專案交接風險",locale:"zh-TW",agentId:"project-coordinator",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.equal(r.proposals.length,3);
 assert.deepEqual(r.proposals.map(x=>x.coordination?.signal),["recorded_blocker","near_term_handoff","status_verification"]);
 assert.equal(r.proposals[1].projectId,"PRJ-104");
 assert.equal(r.proposals[1].recordId,"WO-1040");
 assert.deepEqual(r.timeline.slice(0,4).map(x=>x.tool),["review_coordination","get_project","get_source","propose_followup"]);
 assert.ok(r.timeline.some(x=>x.tool==="coordination_guard"));
 assert.ok(r.executionPolicy.blocked.includes("send_external_message"));
});

test("quote guardian starts from quotation review and prepares only a Q record review",async()=>{
 const model=mock(
  call("review_quotations",{},"q1"),
  call("get_quote",{project_id:"PRJ-101"},"q2"),
  call("get_project",{project_id:"PRJ-101"},"q3"),
  call("get_source",{source_id:"REG-Q-1005"},"q4"),
  call("propose_followup",{project_id:"PRJ-101",record_id:"Q-1005",contact:"Mei Lin",title:"複核 Q-1005 報價與試算毛利",rationale:"需要確認報價版本、直接成本與試算毛利是否仍為目前可比範圍。",source_ids:["REG-Q-1005"],draft_zh:"請複核 Q-1005 的版本、直接成本與試算毛利；這不是實際獲利判定。",draft_en:"Review Q-1005 version, direct cost and calculated margin; this is not a realized-profit determination."},"q5"),
  done("已準備一項報價複核工作。")
 );
 const r=await runAgentPlanner({industry:"interior",goal:"檢查報價和毛利",locale:"zh-TW",agentId:"quote-margin-guardian",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.equal(r.proposals.length,1);
 assert.equal(r.proposals[0].recordId,"Q-1005");
 assert.deepEqual(r.timeline.map(x=>x.tool),["review_quotations","get_quote","get_project","get_source","propose_followup"]);
});

test("quote guardian rejects non-quotation proposal records",async()=>{
 const model=mock(
  call("review_quotations",{},"x1"),
  call("propose_followup",{project_id:"PRJ-101",record_id:"WO-1001",contact:"Mei Lin",title:"錯誤類型",rationale:"這不是報價紀錄，不應被接受。",source_ids:["REG-WO-1001"],draft_zh:"不應接受。",draft_en:"Should not be accepted."},"x2"),
  done("完成。")
 );
 const r=await runAgentPlanner({industry:"interior",goal:"檢查報價",locale:"zh-TW",agentId:"quote-margin-guardian",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.equal(r.proposals.length,0);
 assert.equal(r.timeline.some(x=>x.tool==="propose_followup"),false);
});

test("project coordinator owns a distinct coordination review instead of the generic priority scan",async()=>{
 const model=mock(
  call("review_coordination",{limit:3},"c1"),
  done("協調風險已整理。")
 );
 const r=await runAgentPlanner({industry:"interior",goal:"這週什麼可能卡住",locale:"zh-TW",agentId:"project-coordinator",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.deepEqual(r.timeline.map(x=>x.tool),["review_coordination"]);
});
