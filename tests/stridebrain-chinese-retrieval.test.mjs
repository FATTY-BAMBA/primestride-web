import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
register('./helpers/stridebrain-json-loader.mjs',import.meta.url);
const {runCopilotTool}=await import('../src/lib/stridebrain-demo/copilot-tools.js');

test('long Chinese questions keep translated domain terms and find the quartz change records',()=>{
 const result=runCopilotTool("interior","search_company_knowledge",{query:"我們能不能把廚房檯面改成石英石？大概會增加多少費用？會影響完工日期嗎？",limit:5});
 const ids=JSON.stringify(result).match(/"id":"[A-Z]+-[A-Z0-9-]+"/g)||[];
 assert.ok(ids.includes('"id":"DOC-1006"'),"materials schedule with CHG-101-QZ should be retrieved: "+ids.join(" "));
 assert.ok(ids.includes('"id":"DOC-1011"'),"client discussion record should be retrieved: "+ids.join(" "));
});

test('get_project outlines documents so the quartz estimate and change request are discoverable',()=>{
 const result=runCopilotTool("interior","get_project",{project_id:"PRJ-101"});
 const byId=Object.fromEntries(result.documents.map(d=>[d.id,d.covers]));
 assert.match(byId["DOC-1010"],/Quartz Supplier Estimate/);
 assert.match(byId["DOC-1006"],/CHG-101-QZ/);
});

test('get_project carries the quartz cost facts and stays under the tool result limit',()=>{
 const result=runCopilotTool("interior","get_project",{project_id:"PRJ-101"});
 const facts=Object.fromEntries(result.documents.filter(d=>d.keyFacts).map(d=>[d.id,d.keyFacts]));
 assert.match(facts["DOC-1006"],/NT\$60,000/);
 assert.match(facts["DOC-1006"],/NT\$84,000/);
 assert.ok(result.sourceIds.includes("DOC-1006"));
 for(const [industry,prefix] of [["interior","PRJ-10"],["printing","JOB-20"]])for(let i=1;i<=9;i++){
  const r=runCopilotTool(industry,"get_project",{project_id:prefix+i});
  if(r.found)assert.ok(JSON.stringify(r).length<14000,industry+" "+prefix+i+" too large");
 }
});
