/** Deterministic and inspectable decision signals on existing demo records. */
export function operationalSignals(model,state){
 const pending=model.approvals(state).filter(a=>a.status==="Pending");
 const blocked=model.tasks(state).filter(t=>t.status==="Blocked");
 const byProject=new Map();
 for(const task of blocked)byProject.set(task.projectId,(byProject.get(task.projectId)||0)+1);
 const ranked=pending.map(a=>({
  ...a,blockedCount:byProject.get(a.projectId)||0,
  score:(byProject.get(a.projectId)||0)>0?2:1
 })).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 return {ranked,blockedCount:blocked.length,pendingCount:pending.length,
  flaggedProjects:[...byProject].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([projectId,count])=>({projectId,count}))};
}

/** Evidence-driven risk signals: observed blocker counts and missing cited records only. */
export function riskRadarSignals(model,state){
 const tasks=model.tasks(state).filter(t=>t.status==="Blocked");
 const projects=new Map();
 for(const task of tasks){
  if(!projects.has(task.projectId))projects.set(task.projectId,{projectId:task.projectId,blockedCount:0,taskIds:[],sourceIds:[]});
  const item=projects.get(task.projectId);
  item.blockedCount++;item.taskIds.push(task.id);
  if(task.sourceDocId&&model.document(task.sourceDocId)&&!item.sourceIds.includes(task.sourceDocId))item.sourceIds.push(task.sourceDocId);
 }
 const blocked=[...projects.values()].sort((a,b)=>b.blockedCount-a.blockedCount||a.projectId.localeCompare(b.projectId));
 const missing=model.approvals(state).filter(a=>a.status==="Pending"&&a.sourceDocId&&!model.document(a.sourceDocId)).map(a=>({approvalId:a.id,projectId:a.projectId,sourceDocId:a.sourceDocId}));
 return {blocked,missing,count:blocked.length};
}
