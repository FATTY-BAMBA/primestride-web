import test from "node:test";
import assert from "node:assert/strict";
import {safeCopilotMarkdown} from "../public/stridebrain-demo/copilot-format.js";

test("actual Claude portfolio comparison renders two HTML tables",()=>{
 const answer=[
  "Portfolio-level comparison (12 projects, latest draft quotes)",
  "| Metric | Value (NT$, ex-tax) | Source |",
  "",
  "|---|---:|---|",
  "",
  "| Sum of latest draft quotes | 24,138,200 | [DOC-1006] |",
  "",
  "| Direct costs | 17,944,700 | same |",
  "",
  "Projects found (8 of 12 returned)",
  "| Project | Stage | Budget (NT$) | Source |",
  "",
  "|---|---|---:|---|",
  "",
  "| PRJ-101 Songshan Residence | In construction | 2,450,000 | [DOC-1001] |"
 ].join("\n");
 const output=safeCopilotMarkdown(answer);
 assert.equal((output.match(/<table class="copilot-result-table">/g)||[]).length,2);
 assert.equal((output.match(/<th scope="col">/g)||[]).length,7);
 assert.ok(output.includes("<td>24,138,200</td>"));
 assert.ok(output.includes("<td>PRJ-101 Songshan Residence</td>"));
 assert.ok(!output.includes("|---|"));
});
