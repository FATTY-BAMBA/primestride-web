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
