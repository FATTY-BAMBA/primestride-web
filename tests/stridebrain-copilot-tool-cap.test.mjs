import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {runOpenRouterCopilot}=await import("../src/lib/stridebrain-demo/openrouter-runner.js");

test("a model that asks for many lookups at once still gets an answer",async()=>{
 let round=0;
 const many={choices:[{message:{role:"assistant",content:null,tool_calls:Array.from({length:6},(_,i)=>({id:"call_"+i,type:"function",function:{name:"get_suppliers",arguments:"{}"}}))}}]};
 const final={choices:[{message:{role:"assistant",content:"供應商交期與價格尚未查證，請先向供應商確認。"}}]};
 const r=await runOpenRouterCopilot({industry:"interior",modelId:"anthropic/claude-sonnet-5.5",apiKey:"test-key-123",locale:"zh-TW",
  messages:[{role:"user",content:"請用繁體中文指出材料供應商有哪些資訊尚待確認，切勿假設即時庫存。"}],
  requestModel:async payload=>{round++;if(round===1){return many;}return final;}});
 assert.match(r.answer,/供應商/);
});
