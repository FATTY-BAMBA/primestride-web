import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../public/stridebrain-demo/",import.meta.url);
const view=readFileSync(new URL("views-primary.js",root),"utf8");
const app=readFileSync(new URL("app.js",root),"utf8");
const catalog=readFileSync(new URL("record-locale.js",root),"utf8");
test("Chinese dashboard translates high-visibility sample record titles without changing IDs",()=>{
 for(const label of ["材料選定","報價修訂","圖面問題","客戶需求摘要","設計合約","工程範圍"]){
  assert.ok(catalog.includes(label),label);
 }
 assert.match(view,/localizedName\(a\.title,zh\)/);
 assert.match(view,/source\(a\.sourceDocId\)/);
});
test("Chinese shell uses local company and industry names and language switch updates shell",()=>{
 assert.match(app,/zh\?pack\.company:pack\.companyEn/);
 assert.match(app,/印刷與包裝/);
 assert.match(app,/updateShell\(\);render\(\);return/);
});
