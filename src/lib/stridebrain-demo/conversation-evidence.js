import {workspaceEvidenceSeed,runCopilotTool,allDemoSources} from './copilot-tools.js';
/** Every turn gets fresh, bounded evidence. Transcript references guide lookup, never authorize facts. */
export const CONVERSATION_EVIDENCE_POLICY=[
 'The server supplies fresh conversation_context on EVERY turn. A plain answer is allowed when this context is sufficient; do not invent another tool requirement.',
 'Use resolution and candidateProjects to resolve follow-ups. If clarificationRequired is true, ask one brief question listing the possible projects. Do not produce a multi-project quote table for a singular ambiguous request. Prior assistant messages are not evidence.',
 'Quote totals/costs and task/approval statuses are register facts: cite their REG- source. Calculated gross profit is price minus cost, not a supplier-document value. Linked DOC sources support only their actual contents; their number suffix does not identify a work order.',
 'When asked where figures come from, name the quotation row and REG- source, then distinguish any linked supplier estimate. Never say a document was rechecked unless get_source or provided sourcePassages includes its actual text.',
 'For who-to-contact questions, use the freshly read manager or task owner. Never infer approval authority. If several projects remain in discussion, ask which project or give a short clearly separated contact list.',
 'Preserve exact record type, ID and project relationship. Do not convert DOC-1055 to WO-1055. If you cannot substantiate a claim, omit it or ask a question; do not improvise a record.'
].join('\n');
const clean=s=>String(s||'').trim().replace(/^[「『“"\s]+|[」』”"\s]+$/g,'');
export function buildConversationEvidence(industry,messages){
 const seed=workspaceEvidenceSeed(industry),directory=runCopilotTool(industry,'conversation_context',{});
 const rows=[...seed.projects,...seed.quotes,...seed.workOrders,...seed.approvals,...seed.documents];
 const byId=new Map(rows.map(r=>[r.id,r]));
 function projectsIn(value){
  const s=clean(value),ids=new Set();
  for(const p of seed.projects){const names=p.name.split(' · ').filter(x=>x.length>=3);if(s.includes(p.id)||names.some(x=>s.toLowerCase().includes(x.toLowerCase())))ids.add(p.id);}
  for(const id of s.match(/\b(?:PRJ|JOB|Q|WO|APR|DOC|PRQ|PRWO|PRAPR|PRDOC)-\d+\b/g)||[]){const r=byId.get(id);if(r?.projectId)ids.add(r.projectId);}
  return [...ids];
 }
 const recent=messages.slice(-12),latest=clean(recent.at(-1)?.content);
 let candidates=projectsIn(latest),resolution=candidates.length?'explicit':'none';
 if(!candidates.length){
  for(const m of [...recent.slice(0,-1)].reverse()){
   const found=projectsIn(m.content);if(found.length){candidates=found;resolution='prior_mentions_revalidated';break;}
  }
 }
 const singular=/這個專案|這個案|這筆報價|該專案|這個項目|\b(?:this|that) (?:project|job|quote)\b/i.test(latest);
 const previousAssistant=recent.slice(0,-1).reverse().find(m=>m.role==='assistant')?.content||'';
 const awaitingChoice=resolution!=='explicit'&&candidates.length>1&&/[?？]/.test(previousAssistant)&&/哪|which|指的是|還是/i.test(previousAssistant);
 const clarificationRequired=(singular&&candidates.length!==1)||awaitingChoice;
 const candidateProjects=directory.projects.filter(p=>candidates.includes(p.id)).slice(0,6);
 const selected=clarificationRequired?[]:candidateProjects.slice(0,3);
 const details=selected.map(p=>({project:p,quotation:runCopilotTool(industry,'get_quote',{project_id:p.id})}));
 const sourceIds=[...new Set([...directory.sourceIds,...details.flatMap(x=>x.quotation.sourceIds)])];
 const sourcePassages=[];
 // Read the actual last-cited documents when the user asks about sources. Do not claim their contents from a link alone.
 if(/來源|哪份|文件|證據|\bsource|\bdocument|\bevidence/i.test(latest)){
  const prev=recent.slice(0,-1).reverse().find(m=>m.role==='assistant')?.content||'';
  const ids=[...new Set([...latest.matchAll(/\b(?:REG-)?(?:DOC|PRDOC|STD|PRSTD|Q|PRQ)-[A-Z0-9-]+\b/g),...prev.matchAll(/\[(REG-[A-Z0-9-]+|(?:DOC|PRDOC|STD|PRSTD)-[A-Z0-9-]+)\]/g)].map(m=>m[1]||m[0]))].slice(0,3);
  let size=0;
  for(const id of ids){const d=runCopilotTool(industry,'get_source',{source_id:id});if(d.found===false||!d.body||size+d.body.length>6500)continue;sourcePassages.push(d);sourceIds.push(...d.sourceIds);size+=d.body.length;}
 }
 return {asOf:seed.meta.date,resolution,clarificationRequired,candidateProjects,projectDirectory:directory.projects,
  details,sourcePassages,sourceIds:[...new Set(sourceIds)],
  evidenceScope:'Fresh demo register reads. Quotation sources are REG- snapshots; document passages are the same text shown in the UI. Browser edits and uploaded files are not included.'};
}
export function createEvidenceLedger(industry){
 const seed=workspaceEvidenceSeed(industry),docs=new Map(allDemoSources(industry).map(d=>[d.id,d]));
 const records=new Map([...seed.projects.map(p=>({...p,projectId:p.id})),...seed.quotes,...seed.workOrders,...seed.approvals,...allDemoSources(industry)].map(r=>[r.id,r]));
 const supplied=new Set(),sources=new Set();let needsSelection=false;
 const idsIn=s=>String(s).match(/\b(?:REG-)?(?:PRJ|JOB|Q|WO|APR|DOC|STD|PRQ|PRWO|PRAPR|PRDOC|PRSTD)-[A-Z0-9-]+\b/g)||[];
 function add(data){
  if(data?.clarificationRequired)needsSelection=true;
  for(const id of idsIn(JSON.stringify(data)))if(records.has(id))supplied.add(id);
  for(const id of data?.sourceIds||[])if(docs.has(id))sources.add(id);
 }
 function issues(answer){
  const out=[];
  if(needsSelection&&(/\b(?:Q|PRQ|WO|PRWO|APR|PRAPR)-\d+\b/.test(answer)||/\d{1,3}(?:,\d{3})+/.test(answer)))out.push('PROJECT_SELECTION_REQUIRED');
  for(const m of String(answer).matchAll(/\[([A-Z][A-Z0-9-]+)\]/g))if(!sources.has(m[1]))out.push('UNREAD_SOURCE:'+m[1]);
  for(const id of idsIn(answer))if(!supplied.has(id))out.push('UNVERIFIED_ID:'+id);
  for(const line of String(answer).split(/\n|[。！？]/)){
   const ids=idsIn(line),projects=[...new Set(ids.filter(id=>/^(PRJ|JOB)-/.test(id)))];
   if(projects.length===1)for(const id of ids){const r=records.get(id);if(r?.projectId&&r.projectId!==projects[0])out.push('PROJECT_MISMATCH:'+id);}
   const cited=[...line.matchAll(/\[([A-Z][A-Z0-9-]+)\]/g)].map(m=>m[1]).filter(id=>sources.has(id));
   const amounts=line.match(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g)||[];
   if(cited.length&&amounts.length){const evidence=cited.map(id=>docs.get(id)?.body||'').join('\n').replace(/,/g,'');for(const amount of amounts)if(!new RegExp('(^|[^0-9])'+amount.replace(/,/g,'').replace('.','\\.')+'([^0-9]|$)').test(evidence))out.push('UNSUPPORTED_CITED_AMOUNT');}
  }
  return [...new Set(out)].slice(0,8);
 }
 return {add,issues,sourceIds:()=>[...sources],repairInstruction:problems=>'Correct this draft before returning it. Problems: '+problems.join(', ')+'. Use only supplied evidence; preserve exact ID types/projects. Cite REG- rows for register amounts; DOC- only for actual document content. Ask a short clarification if ambiguous. Do not add tools or new facts.'};
}
