import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {MockLanguageModelV4,mockValues} from "ai/test";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {runAgentPlanner}=await import("../src/lib/stridebrain-demo/agent-planner-runner.js");

const usage={inputTokens:{total:10,noCache:10,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:10,text:10,reasoning:undefined}};
const model=new MockLanguageModelV4({
 doGenerate:mockValues(
  ({
   content:[{type:"tool-call",toolCallId:"call-1",toolName:"list_priorities",input:JSON.stringify({limit:3})}],
   finishReason:{unified:"tool-calls",raw:undefined},usage,warnings:[]
  }),
  ({
   content:[{type:"tool-call",toolCallId:"call-2",toolName:"get_project",input:JSON.stringify({project_id:"PRJ-101"})}],
   finishReason:{unified:"tool-calls",raw:undefined},usage,warnings:[]
  }),
  ({
   content:[{type:"tool-call",toolCallId:"call-3",toolName:"propose_followup",input:JSON.stringify({
    project_id:"PRJ-101",record_id:"WO-1001",contact:"Mei Lin",title:"確認現場丈量進度",
    rationale:"工作單記錄接近到期日，需要確認進度。",
    source_ids:["REG-WO-1001"],draft_zh:"請確認 WO-1001 現場丈量目前進度。此訊息尚未送出。",
    draft_en:"Please confirm the current status of WO-1001. This message has not been sent."
   })}],
   finishReason:{unified:"tool-calls",raw:undefined},usage,warnings:[]
  }),
  ({
   content:[{type:"text",text:"已查核紀錄並準備一項追蹤工作，等待人工批准。"}],
   finishReason:{unified:"stop",raw:undefined},usage,warnings:[]
  })
 )
});

test("AI SDK ToolLoopAgent reads StrideBrain tools before preparing a bounded proposal",async()=>{
 const r=await runAgentPlanner({industry:"interior",goal:"請幫我看今天要先追什麼",locale:"zh-TW",agentId:"operations-assistant",modelId:"test/mock",apiKey:"test",languageModel:model});
 assert.equal(r.proposals.length,1);
 assert.equal(r.proposals[0].projectId,"PRJ-101");
 assert.deepEqual(r.proposals[0].sourceIds,["REG-WO-1001"]);
 assert.deepEqual(r.timeline.map(x=>x.tool),["list_priorities","get_project","propose_followup"]);
 assert.deepEqual(r.executionPolicy.approval,["create_internal_task"]);
 assert.ok(r.executionPolicy.blocked.includes("send_external_message"));
 assert.ok(r.steps>=4);
});
