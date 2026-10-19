import test from "node:test";
import assert from "node:assert/strict";
import {copilotReplyLocale,copilotLanguageDirective} from "../src/lib/stridebrain-demo/copilot-locale.js";

test("English requests remain English with Chinese project names and prior Thai output",()=>{
 const history=[
  {role:"user",content:"請問目前有哪些待核准案件？"},
  {role:"assistant",content:"ข้อมูลทั้งหมดเป็นข้อมูลสมมติ"},
  {role:"user",content:"Which projects need my attention first? Include 松山靜宅 and cite the sources."}
 ];
 assert.equal(copilotReplyLocale(history),"en");
 assert.match(copilotLanguageDirective(history),/MUST BE ENGLISH/);
});
test("Traditional Chinese questions and explicit language instructions",()=>{
 assert.equal(copilotReplyLocale([{role:"user",content:"哪些專案需要優先處理？請列出原因與資料來源。"}]),"zh-TW");
 assert.equal(copilotReplyLocale([{role:"user",content:"Which projects are blocked? Please respond in Traditional Chinese."}]),"zh-TW");
 assert.equal(copilotReplyLocale([{role:"user",content:"請用英文回答有哪些專案要處理"}]),"en");
 assert.match(copilotLanguageDirective([{role:"user",content:"請用繁體中文回答"}]),/TRADITIONAL CHINESE/);
});
test("Latest user question determines language, not historical assistant output",()=>{
 assert.equal(copilotReplyLocale([{role:"user",content:"請用中文回答"},{role:"assistant",content:"中文內容"},{role:"user",content:"What are our latest draft quotes?"}]),"en");
 assert.equal(copilotReplyLocale([]),"en");
});
