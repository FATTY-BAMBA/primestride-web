import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("canonical client demo is a focused five-minute Copilot to Coordinator to approved-action story",()=>{
 const script=readFileSync("docs/stridebrain-interiors/DEMO_SCRIPT.md","utf8");
 assert.match(script,/5 minutes/i);
 assert.match(script,/Company knowledge → proactive AI teammate → human-controlled real action/);
 assert.match(script,/本週風險 \/ This week’s risks/);
 assert.match(script,/AI Team → Project Coordinator/);
 assert.match(script,/Prepare email → review → approve & send/);
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
