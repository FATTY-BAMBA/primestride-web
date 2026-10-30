/** Shared conversational selection. Transcript hints select records, never prove their contents. */
const clean=s=>String(s||'').trim().replace(/^[「『“"\s]+|[」』”"\s]+$/g,'');
const unique=xs=>[...new Set(xs)];
export function resolveConversation(seed,messages,{selectedProjectId=null}={}){
 const projects=seed.projects||[],rows=[...projects,...(seed.quotes||[]),...(seed.workOrders||[]),...(seed.approvals||[]),...(seed.documents||[])];
 const byId=new Map(rows.map(x=>[x.id,x]));
 const valid=id=>projects.some(p=>p.id===id);
 const recent=(Array.isArray(messages)?messages:[]).slice(-12),latest=clean(recent.at(-1)?.content);
 function mentions(text){
  const s=clean(text),ids=[];
  for(const id of s.match(/\b(?:PRJ|JOB|Q|WO|APR|DOC|PRQ|PRWO|PRAPR|PRDOC)-\d+\b/g)||[]){const r=byId.get(id);if(r){const p=valid(r.id)?r.id:r.projectId;if(valid(p))ids.push(p);}}
  for(const p of projects)if(p.name.split(' · ').some(n=>n.length>=3&&s.toLowerCase().includes(n.toLowerCase())))ids.push(p.id);
  return unique(ids);
 }
 let candidateProjectIds=mentions(latest),resolution=candidateProjectIds.length?'explicit':'none';
 const explicitUnknown=/\b(?:PRJ|JOB)-\d+\b/.test(latest)&&!candidateProjectIds.length;
 const overviewRequest=/今天.*(?:處理|待辦)|全(?:部|公司|工作區)|整體|有哪些.*(?:優先|待辦)|\ball projects\b|\b(?:top|three) priorit|what.*(?:attention|first)/i.test(latest);
 if(!candidateProjectIds.length&&!explicitUnknown&&!overviewRequest){
  if(valid(selectedProjectId)){candidateProjectIds=[selectedProjectId];resolution='selected_project';}
  else for(const m of [...recent.slice(0,-1)].reverse()){const found=mentions(m.content);if(found.length){candidateProjectIds=found;resolution='prior_mentions_revalidated';break;}}
 }
 const previousAssistant=recent.slice(0,-1).reverse().find(m=>m.role==='assistant')?.content||'';
 const singular=/這個專案|這個案|這筆報價|該專案|這個項目|\b(?:this|that) (?:project|job|quote)\b/i.test(latest);
 const awaitingChoice=resolution!=='explicit'&&resolution!=='selected_project'&&candidateProjectIds.length>1&&/[?？]/.test(previousAssistant)&&/哪|which|指的是|還是/i.test(previousAssistant);
 const evidenceFollowup=/來源|哪份|文件|證據|\bsource|\bdocument|\bevidence/i.test(latest);
 const clarificationRequired=explicitUnknown||(singular&&candidateProjectIds.length!==1)||awaitingChoice;
 // Look past clarification-only turns to the last answer that actually cited evidence.
 const clarificationLike=value=>/[?？]/.test(String(value||''))&&/(哪一個|哪個|指的是|還是|which (?:project|one)|which one)/i.test(String(value||''));
 const previousEvidence=recent.slice(0,-1).reverse().find(m=>m.role==='assistant'&&!clarificationLike(m.content)&&/\[(?:REG-|DOC-|PRDOC-|STD-|PRSTD-)/.test(m.content||''))?.content||'';
 const citationIds=text=>[...String(text).matchAll(/\[([A-Z][A-Z0-9-]{2,85})\]/g)].map(m=>m[1]);
 const directIds=latest.match(/\b(?:REG-)?(?:PRJ|JOB|DOC|PRDOC|STD|PRSTD|Q|PRQ|WO|PRWO|APR|PRAPR)-[A-Z0-9-]+\b/g)||[];
 return {resolution,clarificationRequired,evidenceFollowup,pendingProjectSelection:clarificationRequired,
  mode:evidenceFollowup?'evidence':clarificationRequired?'choose_project':candidateProjectIds.length===1?'project':candidateProjectIds.length>1?'comparison':'workspace',
  selectedProjectId:!clarificationRequired&&candidateProjectIds.length===1?candidateProjectIds[0]:null,
  candidateProjectIds,requestedSourceIds:evidenceFollowup?unique([...directIds,...citationIds(previousEvidence)]):[],
  previousEvidenceAvailable:!!previousEvidence};
}
