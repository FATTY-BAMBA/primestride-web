import test from "node:test";
import assert from "node:assert/strict";
import {safeCopilotMarkdown} from "../public/stridebrain-demo/copilot-format.js";
test("English discrepancy heading gets a clear visual marker",()=>{
 const html=safeCopilotMarkdown("### Evidence discrepancy\nAPR-1008 and DOC-1028 report different states.");
 assert.match(html,/data-evidence-conflict="true"/);
 assert.match(html,/APR-1008 and DOC-1028/);
});
test("Traditional Chinese discrepancy heading gets a clear visual marker",()=>{
 assert.match(safeCopilotMarkdown("### 資料不一致\nAPR-1008 與 DOC-1028 狀態不同"),/copilot-evidence-discrepancy/);
});
test("ordinary headings do not imply conflict",()=>{
 assert.doesNotMatch(safeCopilotMarkdown("### Next steps\nReview the source"),/data-evidence-conflict/);
});
