import {money,calculateVariation,escapeHtml as e} from "./core-model.js";
import {button,source,sources,documentRow} from "./ui-shared.js";
/**
 * Deterministic explainability examples — not an actual AI agent.
 * A production LLM would route to typed tools, verify claims and cite permission-filtered evidence.
 */
export function exampleAnswer(prompt,c){
 const {model:m,pack:p,state:s}=c,question=String(prompt).toLowerCase(),sc=p.scenario,pr=m.project(sc.projectId),sm=m.summary(s);
 const cost=calculateVariation(s.variation.cost,s.variation.margin,sc.tax);
 const packTerm=p.id==="interior"?/kitchen|countertop|quartz|stone|石英|廚房|檯面/:/recycled|paper|stock|poster|印刷|再生紙|海報|紙材/;
 const relevant=ids=>'<div class="disclosure" style="margin-top:10px">Inspect source records: '+sources(ids)+'</div>';
 const wrap=(heading,body,actions)=>'<div class="answer-card"><div class="suite-eyebrow">SOURCE-AWARE DEMO</div><h3>'+heading+'</h3>'+body+(actions||"")+'</div>';
 const actions=(...btns)=>'<div class="answer-actions">'+btns.join("")+'</div>';
 if(/past projects|previous jobs|historical|quote from history|similar jobs|past quotes|歷史|以往|過去|類似案例|歷史報價|智能報價/.test(question)){
  const h=c.history,ref=h?.records.filter(x=>x.status==="COMPLETE").slice(0,3).map(x=>x.sourceDocId)||[];
  const body='<p>Use comparable completed work, normalized cost lines, explicit price adjustments, and human approval to prepare a source-linked new estimate. The current precedents are fictional sample jobs.</p>'+relevant(ref);
  return {sources:ref,html:wrap("Historical Quotation Intelligence",body,actions(button("Review similar projects ↗","nav","history","button-primary")))};
 }
 if(packTerm.test(question)||/change order|variation|material change|substitution|變更|替換/.test(question)){
  const changed=s.variation.cost!==sc.cost||s.variation.margin!==sc.margin;
  let desc='<p>'+e(pr.name)+' has a proposed change: '+e(sc.name)+'. The current draft input is '+money(cost.cost)+' incremental direct cost. At '+cost.margin+'% target gross margin, the calculated pre-tax amount is '+money(cost.beforeTax)+'; illustrative tax-inclusive total '+money(cost.total)+'.</p>';
  desc+='<div class="pulse-grid"><div class="pulse-item"><strong>'+money(cost.cost)+'</strong><small>Input direct cost</small></div><div class="pulse-item"><strong>'+money(cost.beforeTax)+'</strong><small>Proposed price ex tax</small></div><div class="pulse-item"><strong>'+money(cost.total)+'</strong><small>Total incl. sample tax</small></div></div>';
  if(changed)desc+='<div class="divergence">Pricing was adjusted in this demo. The original supplier document still contains its old sample estimate, and the difference requires renewed validation before approval.</div>';
  desc+='<p>'+e(sc.unresolved)+'</p>'+relevant(sc.sourceIds);
  return {sources:sc.sourceIds,html:wrap("Review the proposed change",desc,actions(button("Open quotation review ↗","nav","quotes","button-primary")))};
 }
 if(/today|priority|attention|numbers|status|brief|overview|今天|狀態|優先|待辦/.test(question)){
  const pending=m.approvals(s).filter(a=>a.status==="Pending"),blocked=m.tasks(s).filter(t=>t.status==="Blocked"),ref=[pending[0]?.sourceDocId,blocked[0]?.sourceDocId].filter(Boolean);
  const body='<p>In this fictional operational dataset there are <strong>'+sm.pending+' pending approvals</strong> and <strong>'+sm.blocked+' blocked work items</strong> across '+sm.projects+' '+e(p.itemLabelPlural)+'. These counts update when you change work and approval state.</p><div class="pulse-grid"><div class="pulse-item"><strong>'+sm.projects+'</strong><small>'+e(p.projectLabel)+'</small></div><div class="pulse-item"><strong>'+sm.pending+'</strong><small>Pending decisions</small></div><div class="pulse-item"><strong>'+sm.blocked+'</strong><small>Blocked tasks</small></div></div>'+relevant(ref);
  return {sources:ref,html:wrap("Your business pulse",body,actions(button("Review approvals","nav","approvals","button-primary"),button("Open work","nav","work","button-outline")))};
 }
 if(/quote|margin|profit|price|cost|financial|報價|毛利|成本|利潤/.test(question)){
  const q=m.latestQuoteFor(pr.id),ref=[q.sourceDocId,...sc.sourceIds.slice(0,1)];
  const body='<p>The latest sample quote '+e(q.id)+' for '+e(pr.name)+' records direct costs of <strong>'+money(q.directCost)+'</strong> and a proposed selling price before tax of <strong>'+money(q.amountExTax)+'</strong>. This is not an invoice, signed contract or collected revenue.</p><div class="pulse-grid"><div class="pulse-item"><strong>'+money(q.directCost)+'</strong><small>Direct cost</small></div><div class="pulse-item"><strong>'+money(q.amountExTax)+'</strong><small>Before tax</small></div><div class="pulse-item"><strong>'+Math.round(q.grossMarginTarget*100)+'%</strong><small>Target margin</small></div></div>'+relevant(ref);
  return {sources:ref,html:wrap("Current recorded quotation",body,actions(button("Inspect quote records","nav","quotes","button-secondary")))};
 }
 if(/blocked|delay|schedule|work|job ticket|project progress|task|milestone|延期|排程|工單|施工/.test(question)){
  const blocked=m.tasks(s).filter(t=>t.status==="Blocked"),shown=blocked.slice(0,3),ref=shown.map(t=>t.sourceDocId);
  const body='<p>'+sm.blocked+' example tasks are blocked. These are operational records, not estimates generated by an AI model.</p>'+shown.map((t,i)=>'<div class="prio-row"><span class="prio-index">'+(i+1)+'</span><div class="prio-main"><div class="prio-title">'+e(t.title)+' · '+e(m.project(t.projectId)?.name)+'</div><div class="prio-sub">'+e(t.blockedBy||"Review needed")+'</div></div>'+source(t.sourceDocId)+'</div>').join("");
  return {sources:ref,html:wrap("Blocked work",body,actions(button("Open work tracker","nav","work","button-secondary")))};
 }
 if(/supplier|lead time|inventory|material|sourcing|vendor|供應商|庫存|材料/.test(question)){
  const body='<p>The dataset has '+sm.suppliers+' fictional suppliers. Their sample prices and lead times are not externally verified. Do not infer confirmed stock or make delivery commitments from these records.</p>'+m.seed.suppliers.slice(0,4).map(x=>'<div class="line-item"><span>'+e(x.name)+' · '+e(x.category)+'</span><strong>'+x.leadTimeDays+' sample days</strong></div>').join("")+relevant(sc.sourceIds.slice(0,2));
  return {sources:sc.sourceIds.slice(0,2),html:wrap("Materials and supplier context",body,actions(button("Open supplier records","nav","suppliers","button-secondary")))};
 }
 if(/customer|client|reply|email|line|message|客戶|客服|回覆|訊息/.test(question)){
  const body='<p>A customer-facing response should be grounded in approved facts and reviewed before use. This demo prepares editable Chinese/English drafts but does not send messages through external channels.</p>'+relevant(sc.sourceIds.slice(0,2));
  return {sources:sc.sourceIds.slice(0,2),html:wrap("Prepare a customer response",body,actions(button("Open customer service","nav","service","button-primary")))};
 }
 // Full-text retrieval without inventing a narrative: return candidate documents and their states.
 const words=question.replace(/[^a-z0-9\u4e00-\u9fff ]/gi," ").split(/\s+/).filter(t=>t.length>=4);
 const ranked=m.seed.documents.map(d=>({d,score:words.reduce((n,w)=>n+(d.title+" "+d.body).toLowerCase().includes(w),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
 if(!ranked.length)return {sources:[],html:wrap("More context needed",'<p>I could not identify an adequately relevant source from this synthetic company dataset. Please search by project/job, supplier, document type or a specific business rule. I will not fabricate an answer.</p>',actions(button("Browse knowledge","nav","knowledge","button-secondary")))};
 const sourceIds=ranked.map(x=>x.d.id),body='<p>I found '+ranked.length+' potentially relevant documents. Check their actual text, version and review status before using the information.</p>'+ranked.map(x=>documentRow(x.d)).join("");
 return {sources:sourceIds,html:wrap("Matching company documents",body,actions(button("Open knowledge search","nav","knowledge","button-secondary")))};
}
