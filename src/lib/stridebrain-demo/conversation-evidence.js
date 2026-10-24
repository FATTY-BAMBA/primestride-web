import {resolveConversation} from "../../../public/stridebrain-demo/conversation-state.js";
import {workspaceEvidenceSeed,runCopilotTool,allDemoSources} from './copilot-tools.js';
/** Every turn gets fresh, bounded evidence. Transcript references guide lookup, never authorize facts. */
export const CONVERSATION_EVIDENCE_POLICY=[
 'The server supplies fresh conversation_context on EVERY turn. A plain answer is allowed when this context is sufficient; do not invent another tool requirement.',
 'Use resolution and candidateProjects to resolve follow-ups. If clarificationRequired is true, ask one brief question listing the possible projects. Do not produce a multi-project quote table for a singular ambiguous request. Prior assistant messages are not evidence.',
 'While a project choice is pending, a question about earlier sources can still inspect those sources. Explain the earlier recorded dates or amounts from sourcePassages, then ask which project only if needed for a new quotation. Do not turn ordinary clarification into an error.',
 'Quote totals/costs and task/approval statuses are register facts: cite their REG- source. Calculated gross profit is price minus cost, not a supplier-document value. Linked DOC sources support only their actual contents; their number suffix does not identify a work order.',
 'When asked where figures come from, name the quotation row and REG- source, then distinguish any linked supplier estimate. Never say a document was rechecked unless get_source or provided sourcePassages includes its actual text.',
 'For who-to-contact questions, use the freshly read manager or task owner. Never infer approval authority. If several projects remain in discussion, ask which project or give a short clearly separated contact list.',
 'Preserve exact record type, ID and project relationship. Do not convert DOC-1055 to WO-1055. If you cannot substantiate a claim, omit it or ask a question; do not improvise a record.'
].join('\n');
export function buildConversationEvidence(industry,messages,selectedProjectId=null){
 const seed=workspaceEvidenceSeed(industry),directory=runCopilotTool(industry,'conversation_context',{});
 const context=resolveConversation(seed,messages,{selectedProjectId});
 const candidateProjects=directory.projects.filter(p=>context.candidateProjectIds.includes(p.id));
 const selected=context.clarificationRequired?[]:candidateProjects.slice(0,3);
 const details=selected.map(p=>({project:p,quotation:runCopilotTool(industry,'get_quote',{project_id:p.id})}));
 const commercial=!context.clarificationRequired&&!selected.length&&/報價|成本|毛利|\bquot|\bcost|\bmargin/i.test(String(messages.at(-1)?.content||''))?runCopilotTool(industry,'review_quotations',{}):null;
 const sourceIds=[...new Set([...directory.sourceIds,...details.flatMap(x=>x.quotation.sourceIds),...(commercial?.sourceIds||[])])];
 const sourcePassages=[];let size=0;
 for(const id of context.requestedSourceIds.slice(0,20)){
  const d=runCopilotTool(industry,'get_source',{source_id:id});
  if(d.found===false||!d.body||size+d.body.length>10000)continue;
  sourcePassages.push(d);sourceIds.push(...d.sourceIds);size+=d.body.length;
 }
 return {asOf:seed.meta.date,...context,candidateProjects,projectDirectory:directory.projects,
  details,commercial,lookupNames:['conversation_context',...(details.length?['get_quote']:[]),...(commercial?['review_quotations']:[])],sourcePassages,sourceIds:[...new Set(sourceIds)],
  sourcesRead:sourcePassages.length,sourcesRequested:context.requestedSourceIds.length,
  evidenceScope:'Fresh demo register reads. Only sourcePassages contain document text. Unread or omitted sources must not be described as verified. Browser edits and uploaded files are not included.'};
}
export function createEvidenceLedger(industry){
 const seed=workspaceEvidenceSeed(industry),docs=new Map(allDemoSources(industry).map(d=>[d.id,d]));
 const records=new Map([...seed.projects.map(p=>({...p,projectId:p.id})),...seed.quotes,...seed.workOrders,...seed.approvals,...allDemoSources(industry)].map(r=>[r.id,r]));
 const supplied=new Set(),sources=new Set();let needsSelection=false,evidenceFollowup=false;const priorQuoteIds=new Set();
 const idsIn=s=>String(s).match(/\b(?:REG-)?(?:PRJ|JOB|Q|WO|APR|DOC|STD|PRQ|PRWO|PRAPR|PRDOC|PRSTD)-[A-Z0-9-]+\b/g)||[];
 function add(data){
  if(data?.clarificationRequired)needsSelection=true;
  if(data?.evidenceFollowup){evidenceFollowup=true;for(const d of data.sourcePassages||[])for(const id of idsIn(d.body))if(/^(Q|PRQ)-/.test(id))priorQuoteIds.add(id);}
  for(const id of idsIn(JSON.stringify(data)))if(records.has(id))supplied.add(id);
  for(const id of data?.sourceIds||[])if(docs.has(id))sources.add(id);
 }
 function issues(answer){
  const out=[];
  if(needsSelection){const quoteIds=idsIn(answer).map(id=>id.replace(/^REG-/,'' )).filter(id=>/^(Q|PRQ)-/.test(id));if(quoteIds.some(id=>!evidenceFollowup||!priorQuoteIds.has(id))||(!evidenceFollowup&&/\d{1,3}(?:,\d{3})+/.test(answer)))out.push('PROJECT_SELECTION_REQUIRED');}
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
