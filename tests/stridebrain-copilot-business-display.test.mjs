import test from "node:test";
import assert from "node:assert/strict";
import {safeCopilotMarkdown} from "../public/stridebrain-demo/copilot-format.js";

test("finance comparison renders structured values instead of pipes",()=>{
 const reply="## Proposed financial comparison\n| Quote | Price ex tax | Direct cost | Target margin |\n|---|---:|---:|---:|\n| Q-1005 | NT$1,570,800 | NT$1,193,800 | 24% |";
 const result=safeCopilotMarkdown(reply);
 assert.ok(result.includes('class="copilot-result-table"'));
 assert.ok(result.includes("NT$1,570,800"));
 assert.ok(!result.includes("|---|"));
});
test("operational priorities render a numbered list",()=>{
 const result=safeCopilotMarkdown("### Priorities\n1. Review blocked work\n2. Confirm supplier lead time");
 assert.ok(result.includes("<ol>"));
 assert.ok(result.includes("<li>Review blocked work</li>"));
});
test("unsafe tags remain escaped in table and narrative",()=>{
 const result=safeCopilotMarkdown("Summary <script>alert(1)</script>\n| Item | Note |\n|---|---|\n| A | <img src=x> |");
 assert.ok(!result.includes("<script>"));
 assert.ok(!result.includes("<img "));
 assert.ok(result.includes("&lt;img"));
});
