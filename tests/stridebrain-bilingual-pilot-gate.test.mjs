import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {quickActionsFor,ideasFor,followUpsFor} from "../public/stridebrain-demo/copilot-suggestions.js";
const primary=readFileSync(new URL("../public/stridebrain-demo/views-primary.js",import.meta.url),"utf8");
const operations=readFileSync(new URL("../public/stridebrain-demo/views-operations.js",import.meta.url),"utf8");
for(const industry of ["interior","printing"]){
 test(industry+" offers zh-TW and EN entry paths",()=>{
  const zh=quickActionsFor(industry,"zh-TW"),en=quickActionsFor(industry,"en");
  assert.equal(zh.length,en.length);
  assert.equal(ideasFor(industry,"zh-TW").length,ideasFor(industry,"en").length);
  assert.ok(zh.every(x=>/[\u3400-\u9fff]/.test(x.label)&&/[\u3400-\u9fff]/.test(x.prompt)));
  assert.ok(en.every(x=>/^[^\u3400-\u9fff]+$/.test(x.label)));
  assert.ok(followUpsFor("Show quotation risks",industry,[],"","zh-TW").every(x=>/[\u3400-\u9fff]/.test(x.label)));
 });
}
test("source and quotation screens honor workspace locale",()=>{
 assert.match(primary,/zh\?"相關來源資料"/);
 assert.match(primary,/zh\?"下載來源文件"/);
 assert.match(primary,/zh\?"標記待審"/);
 assert.match(operations,/zh\?"報價與毛利管理"/);
 assert.match(operations,/zh\?"客戶回覆與來源依據"/);
});
test("Copilot localization preserves guest vs staff separation",()=>{
 assert.match(primary,/isGuest\?\(zh\?'這是受邀訪客 AI 工作階段。'/);
 assert.match(primary,/zh\?'這是內部人員 AI 工作階段/);
 assert.match(primary,/isGuest\?\(zh\?"離開訪客體驗"/);
});
