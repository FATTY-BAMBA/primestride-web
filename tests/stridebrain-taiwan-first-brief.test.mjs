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
test("owner brief uses the shared snapshot priority implementation and read-only navigation",()=>{
 const experience=readFileSync(new URL("../public/stridebrain-demo/experience-views.js",import.meta.url),"utf8");
 assert.match(primary,/renderOverview\(c\)/);
 assert.match(experience,/reviewPriorities\(seed,/);
 assert.match(experience,/共同資料日期/);
 assert.match(experience,/data-priority-id/);
 assert.doesNotMatch(experience,/data-action="approval"/);
});
test("language switch works without weakening guest/staff access",()=>{
 assert.match(app,/if\(action==="language"\)/);
 assert.match(app,/applyWorkspaceLanguage\(\)/);
 assert.match(app,/restoreStaffPreview/);
});
