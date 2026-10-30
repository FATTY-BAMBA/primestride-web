import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("canonical client demo is a focused five-minute Copilot to Coordinator to approved-action story",()=>{
 const script=readFileSync("docs/stridebrain-interiors/DEMO_SCRIPT.md","utf8");
 assert.match(script,/5 minutes/i);
 assert.match(script,/Company knowledge → proactive AI teammate → human-controlled real action/);
 assert.match(script,/本週風險 \/ This week’s risks/);
 assert.match(script,/AI Team → Project Coordinator/);
 assert.match(script,/Edit proposal → Save edits → Prepare email → final preview → Approve & send/);
 assert.match(script,/provider-accepted receipt/);
 assert.match(script,/NOW/);
 assert.match(script,/NEXT/);
 assert.match(script,/DIRECTION/);
});

test("canonical client demo explicitly avoids feature-tour and technical-internals framing",()=>{
 const script=readFileSync("docs/stridebrain-interiors/DEMO_SCRIPT.md","utf8");
 assert.match(script,/Do not tour the sidebar/);
 assert.match(script,/Do not explain models, OpenRouter, Supabase, OAuth, webhooks, or architecture/);
 assert.match(script,/Do not demo unless the prospect specifically asks/);
 assert.match(script,/demo is not a separate fake application/i);
});


test("risk answer can hand off directly from Copilot to Project Coordinator",()=>{
 const view=readFileSync("public/stridebrain-demo/views-primary.js","utf8");
 const app=readFileSync("public/stridebrain-demo/app.js","utf8");
 assert.match(view,/FROM ANSWER TO ACTION/);
 assert.match(view,/data-action=["']agentHandoff["']/);
 assert.match(view,/project-coordinator/);
 assert.match(app,/if\(action===["']agentHandoff["']\)/);
 assert.match(app,/selectAgent\(state,value\|\|["']project-coordinator["']\)/);
});


test("Copilot keeps the business question primary while session and role controls stay secondary",()=>{
 const view=readFileSync("public/stridebrain-demo/views-primary.js","utf8");
 const roles=readFileSync("public/stridebrain-demo/experience-views.js","utf8");
 assert.match(view,/sb-shortcut.*primary/);
 assert.match(view,/AI connected/);
 assert.match(view,/sb-copilot-session-meta/);
 assert.doesNotMatch(view,/Internal staff AI mode/);
 assert.match(view,/roleChooser\(c,\{compact:true\}\)/);
 assert.match(roles,/sb-role-entry-compact/);
 assert.match(roles,/Tailor suggestions by role/);
});

test("AI Team makes prepared actions human-editable before approval while evidence stays separate",()=>{
 const view=readFileSync("public/stridebrain-demo/views-ai-team.js","utf8");
 const runtime=readFileSync("public/stridebrain-demo/agent-runtime.js","utf8");
 assert.match(view,/EDITABLE PROPOSAL/);
 assert.match(view,/agent-task-title/);
 assert.match(view,/agent-task-owner/);
 assert.match(view,/agent-draft/);
 assert.match(view,/The risk, recorded owner and source evidence above stay unchanged/);
 assert.match(runtime,/updatePreparedAgentAction/);
 assert.match(runtime,/evidence and recorded source fields were unchanged/);
});


test("secondary business pages avoid prototype language while keeping pilot limits explicit",()=>{
 const ops=readFileSync("public/stridebrain-demo/views-operations.js","utf8");
 assert.doesNotMatch(ops,/Simulate reviewer approval/);
 assert.doesNotMatch(ops,/Simulate review/);
 assert.doesNotMatch(ops,/button\("Simulate ↗"/);
 assert.match(ops,/Mark draft reviewed/);
 assert.match(ops,/Record approval ↗/);
 assert.match(ops,/Record locally ↗/);
 assert.match(ops,/Supplier references/);
 assert.match(ops,/Reference lead times/);
 assert.match(ops,/live stock and purchasing are not connected/);
});

test("evidence rail explains the current page instead of repeating a generic selected-project panel",()=>{
 const view=readFileSync("public/stridebrain-demo/views-primary.js","utf8");
 assert.match(view,/Customer reply workflow/);
 assert.match(view,/Approval queue/);
 assert.match(view,/Supplier reference directory/);
 assert.match(view,/Work register/);
 assert.match(view,/PINNED PROJECT CONTEXT/);
 assert.match(view,/m\.approvals\(s\)\.filter/);
 assert.match(view,/m\.tasksFor\(pr\.id,s\)/);
 assert.match(view,/Sources most relevant to the current view/);
});

test("demo runbook treats secondary pages as proof branches, not a feature tour",()=>{
 const script=readFileSync("docs/stridebrain-interiors/DEMO_SCRIPT.md","utf8");
 assert.match(script,/Optional proof branches/);
 assert.match(script,/Where is the AI getting this from/);
 assert.match(script,/Can this help commercially/);
 assert.match(script,/How do you keep humans in control/);
 assert.match(script,/Presenter click map/);
 assert.match(script,/make one human edit/i);
 assert.match(script,/three times in a row/i);
});
