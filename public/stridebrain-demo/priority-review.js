import {registerSourceId} from "./register-evidence.js";
/** Read-only review of structured registers. No model-generated scores or writes. */
const DAY=86400000;
const list=x=>Array.isArray(x)?x:[];
const text=x=>typeof x==='string'?x:'';
const unique=xs=>[...new Set(xs.filter(Boolean))];
const norm=x=>text(x).toLowerCase().replace(/\s+/g,' ').trim();
function day(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(text(value)))return null;
 const n=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n:null;
}
const delta=(value,asOf)=>day(value)!==null&&day(asOf)!==null?(day(value)-day(asOf))/DAY:null;
const complete=w=>['complete','completed','cancelled','canceled'].includes(norm(w.status));
const pending=a=>norm(a.status)==='pending';
const blocked=w=>norm(w.status)==='blocked';
const compare=(a,b)=>{
 for(let i=0;i<a.rankKey.length;i++)if(a.rankKey[i]!==b.rankKey[i])return a.rankKey[i]-b.rankKey[i];
 return text(a.id).localeCompare(text(b.id)); // Stable display only, never an importance signal.
};
function key(item,asOf){
 const d=delta(item.dueDate,asOf);
 return [d!==null&&d<0?0:d!==null&&d<=7?1:2,d??1000000,item.blocked?0:1,item.needsReconciliation?0:1];
}
function approvalCheck(a,project,tasks,docs){
 const doc=docs.get(a.sourceDocId);
 const related=tasks.filter(w=>w.projectId===a.projectId&&((norm(a.title)&&norm(w.title)===norm(a.title))||(a.sourceDocId&&w.sourceDocId===a.sourceDocId)));
 const completed=related.filter(w=>['complete','completed'].includes(norm(w.status))).sort((a,b)=>text(a.id).localeCompare(text(b.id)));
 const reasons=[];
 if(!doc)reasons.push('referenced_document_missing');
 if(norm(doc?.status)==='approved')reasons.push('document_approved_but_approval_pending');
 if(completed.length)reasons.push('related_task_complete_but_approval_pending');
 return {approvalId:a.id,title:a.title,approvalStatus:a.status,
  document:doc?{id:doc.id,status:doc.status,version:doc.version}:null,
  relatedCompletedTasks:completed.slice(0,2).map(w=>({id:w.id,status:w.status,sourceDocId:w.sourceDocId,
   relationship:norm(w.title)===norm(a.title)?'same_project_and_title':'shared_source_document'})),
  relatedCompletedTaskCount:completed.length,needsReconciliation:reasons.length>0,reasons,
  interpretation:'Different record types can legitimately have different statuses; not a proven contradiction or dependency.',
  suggestedContact:project?.manager||a.requestedBy||null,
  contactBasis:project?.manager?'project_manager':a.requestedBy?'requester_not_assigned_approver':'not_recorded',
  sourceIds:unique([registerSourceId(a.id),doc?.id,...completed.slice(0,2).map(w=>registerSourceId(w.id))])};
}
function dependencies(task,approvals){
 const raw=[task.blockedBy,task.approvalId,...list(task.dependsOn)].filter(x=>typeof x==='string').join(' ');
 const ids=new Set(raw.match(/\b[A-Z][A-Z0-9]*-\d+\b/g)||[]);
 return approvals.filter(a=>a.projectId===task.projectId&&ids.has(a.id)).map(a=>({id:a.id,status:a.status}));
}
export function reviewPriorities(seed,{limit=3,projectId=null}={}){
 const allProjects=list(seed.projects),allTasks=list(seed.workOrders),allApprovals=list(seed.approvals),allDocs=list(seed.documents);
 const projects=projectId?allProjects.filter(p=>p.id===projectId):allProjects;
 const projectIds=new Set(projects.map(p=>p.id));
 const tasks=allTasks.filter(w=>projectIds.has(w.projectId)),approvals=allApprovals.filter(a=>projectIds.has(a.projectId));
 const docs=new Map(allDocs.map(d=>[d.id,d]));
 const asOf=day(seed.meta?.date)!==null?seed.meta.date:null;
 const max=Math.max(1,Math.min(6,Math.floor(Number(limit)||3)));
 const actions=[],checks=new Map();
 for(const a of approvals.filter(pending)){
  const p=projects.find(p=>p.id===a.projectId),check=approvalCheck(a,p,tasks,docs);checks.set(a.id,check);
  const item={id:a.id,projectId:a.projectId,title:a.title,status:a.status,dueDate:day(a.dueDate)!==null?a.dueDate:null,
   owner:check.suggestedContact,ownerBasis:check.contactBasis,blocked:false,needsReconciliation:check.needsReconciliation,
   nextAction:check.needsReconciliation?'verify_approval_status':'review_pending_decision',sourceDocId:a.sourceDocId,
   recordedBlocker:null,explicitApprovalReferences:[]};
  item.rankKey=key(item,asOf);actions.push(item);
 }
 for(const w of tasks.filter(w=>!complete(w))){
  const d=delta(w.dueDate,asOf);
  if(!blocked(w)&&(d===null||d>7))continue;
  const refs=dependencies(w,approvals),p=projects.find(p=>p.id===w.projectId);
  const item={id:w.id,projectId:w.projectId,title:w.title,status:w.status,dueDate:day(w.dueDate)!==null?w.dueDate:null,
   owner:w.owner||p?.manager||null,ownerBasis:w.owner?'task_owner':p?.manager?'project_manager':'not_recorded',blocked:blocked(w),
   needsReconciliation:refs.some(a=>checks.get(a.id)?.needsReconciliation),
   nextAction:blocked(w)?'confirm_and_resolve_recorded_blocker':'confirm_due_work',sourceDocId:w.sourceDocId,
   recordedBlocker:text(w.blockedBy)||null,explicitApprovalReferences:refs};
  item.rankKey=key(item,asOf);actions.push(item);
 }
 const projectReviews=projects.flatMap(p=>{
  const work=actions.filter(a=>a.projectId===p.id).sort(compare);if(!work.length)return [];
  const primary=work[0],relatedChecks=[...checks.values()].filter(c=>approvals.some(a=>a.id===c.approvalId&&a.projectId===p.id)&&c.needsReconciliation)
   .sort((a,b)=>Number(primary.explicitApprovalReferences.some(x=>x.id===b.approvalId))-Number(primary.explicitApprovalReferences.some(x=>x.id===a.approvalId))||text(a.approvalId).localeCompare(text(b.approvalId)));
  const sourceIds=unique([registerSourceId(primary.id),registerSourceId(p.id),...relatedChecks.slice(0,2).flatMap(c=>c.sourceIds)]);
  return [{id:primary.id,projectId:p.id,projectName:p.name,projectStage:p.stage,manager:p.manager||null,
   primaryAction:primary,rankKey:primary.rankKey,daysFromSnapshot:delta(primary.dueDate,asOf),
   openApprovalCount:approvals.filter(a=>a.projectId===p.id&&pending(a)).length,
   blockedTaskCount:tasks.filter(w=>w.projectId===p.id&&blocked(w)).length,
   statusChecks:relatedChecks.slice(0,2),statusChecksTotal:relatedChecks.length,sourceIds}];
 }).sort(compare);
 const selected=projectReviews.slice(0,max).map((item,index)=>{
  const equalSignals=projectReviews.filter(other=>other.projectId!==item.projectId&&JSON.stringify(other.rankKey)===JSON.stringify(item.rankKey)).map(x=>x.projectId);
  const {rankKey,...rest}=item;const {rankKey:unused,...primaryAction}=rest.primaryAction;
  return {...rest,primaryAction,displayPosition:index+1,equalPriorityProjectIds:equalSignals,
   rankingBasis:'Overdue at snapshot first; then due within seven days; earlier recorded due date, then blocked work, then status verification. IDs only break display ties.'};
 });
 return {isSynthetic:true,asOf,scope:projectId||'whole_workspace',kind:'review_shortlist_not_business_impact_ranking',
  coverage:{projectsChecked:projects.length,approvalsChecked:approvals.length,workOrdersChecked:tasks.length,documentMetadataChecked:allDocs.length,
   candidateActions:actions.length,projectsWithActions:projectReviews.length,itemsShown:selected.length,
   openRecordsWithoutDueDate:approvals.filter(pending).filter(a=>day(a.dueDate)===null).length+tasks.filter(w=>!complete(w)&&day(w.dueDate)===null).length},
  items:selected,sourceIds:unique(selected.flatMap(x=>x.sourceIds)),
  evidenceBasis:'REG- sources prove structured register fields. DOC- sources prove only their displayed document contents, not linked register values.',
  limitations:['Dates are compared with the dataset snapshot, not the current calendar.','Business impact, customer commitments and a complete critical path are not recorded.','Same project, title or source does not prove a dependency. Verify status before recommending approval.']};
}
