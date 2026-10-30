import test from "node:test";
import assert from "node:assert/strict";
import {safeCopilotMarkdown} from "../public/stridebrain-demo/copilot-format.js";

test("render Markdown table with blank lines as accessible structured HTML",()=>{
 const response=[
  "### Blocked work orders",
  "| Work order | Owner | Due | Days before target |",
  "",
  "|---|---|---|---|",
  "",
  "| WO-1002 Design approval [DOC-1002] | Leo Huang | 2026-10-20 | 16 |",
  "",
  "| WO-1006 Procurement request [DOC-1006] | Leo Huang | 2026-10-24 | 12 |"
 ].join("\n");
 const rendered=safeCopilotMarkdown(response);
 assert.match(rendered,/<table class="copilot-result-table">/);
 assert.match(rendered,/<th scope="col">Work order<\/th>/);
 assert.equal((rendered.match(/<tr>/g)||[]).length,3);
 assert.ok(rendered.includes("WO-1006"));
 assert.ok(!rendered.includes("|---|"));
});
test("table cells escape untrusted HTML",()=>{
 const rendered=safeCopilotMarkdown("| Record | Note |\n|---|---|\n| X | <img src=x onerror=alert(1)> |");
 assert.ok(!rendered.includes("<img "));
 assert.ok(rendered.includes("&lt;img"));
});
test("non-table prose remains paragraphs",()=>{
 const rendered=safeCopilotMarkdown("This is not a table.\n\n- Follow up");
 assert.ok(rendered.includes("<p>This is not a table.</p>"));
 assert.ok(rendered.includes("<li>Follow up</li>"));
});
