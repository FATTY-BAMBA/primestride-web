import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../public/stridebrain-demo/app.js",import.meta.url),"utf8");
const primary=readFileSync(new URL("../public/stridebrain-demo/views-primary.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../public/stridebrain-demo/index.html",import.meta.url),"utf8");
test("Taiwanese-first workspace has persistable, accessible bilingual selector",()=>{
 assert.match(html,/data-action="language" data-value="zh-TW"/);
 assert.match(html,/data-action="language" data-value="en"/);
 assert.match(app,/sessionStorage\.setItem\("stridebrain-interface-locale"/);
 assert.match(app,/document\.documentElement\.lang/);
});
test("owner brief uses project-linked approvals and distinguishes sample snapshot",()=>{
 assert.match(primary,/m\.approvals\(s\)\.filter/);
 assert.match(primary,/m\.project\(a\.projectId\)/);
 assert.match(primary,/每日營運晨報/);
 assert.match(primary,/不是即時|非即時監控/);
});
test("language switch works without weakening guest/staff access",()=>{
 assert.match(app,/if\(action==="language"\)/);
 assert.match(app,/applyWorkspaceLanguage\(\)/);
 assert.match(app,/restoreStaffPreview/);
});
