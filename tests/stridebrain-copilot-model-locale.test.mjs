import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const view=readFileSync(new URL("../public/stridebrain-demo/views-primary.js",import.meta.url),"utf8");
test("model menu copy is localized and English fallback preserved",()=>{
 for(const word of ["日常營運","複雜分析","深入推理","快速回覆","送出問題","可選擇的 AI 模型"])assert.ok(view.includes(word),word);
 assert.match(view,/ZH_MODELS\[item\.id\]/);
 assert.match(view,/Choose an approved AI model/);
});
