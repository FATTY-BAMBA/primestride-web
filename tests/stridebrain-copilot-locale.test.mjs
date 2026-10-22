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

test('short Chinese follow-ups remain Traditional Chinese',()=>{assert.equal(copilotReplyLocale([{role:'user',content:'為什麼？'}]),'zh-TW');assert.equal(copilotReplyLocale([{role:'user',content:'好'}]),'zh-TW');});
test('validated interface locale governs ambiguous short questions',()=>{assert.equal(copilotReplyLocale([{role:'user',content:'Why?'}],'zh-TW'),'zh-TW');assert.equal(copilotReplyLocale([{role:'user',content:'？'}],'en'),'en');});
test('explicit requested language overrides interface setting',()=>{assert.equal(copilotReplyLocale([{role:'user',content:'請用英文回答'}],'zh-TW'),'en');assert.equal(copilotReplyLocale([{role:'user',content:'Please answer in Traditional Chinese'}],'en'),'zh-TW');});
test('punctuation-only follow-up inherits previous user language without UI setting',()=>{assert.equal(copilotReplyLocale([{role:'user',content:'有哪些待辦？'},{role:'assistant',content:'Prior English output'},{role:'user',content:'？'}]),'zh-TW');});
