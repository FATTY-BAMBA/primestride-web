import {money,calculateVariation,escapeHtml as e} from "./core-model.js";
import {button,source,sources,documentRow} from "./ui-shared.js";
import {referenceForPrompt} from "./industry-evidence.js";
import {evaluateReadiness,initialReadiness} from "./readiness-rules.js";
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
 if(/uploaded|upload|imported|my pdf|my excel|spreadsheet file|document intake|file extraction|上傳|文件解析|檔案解析|試算表|匯入的文件/.test(question)){
  const report=c.documentSession?.report;
  const body=report?
   '<p>I read the file locally in this browser. The extraction found <strong>'+report.candidates.length+' candidate cost items</strong>, '+report.parts.length+' page or sheet sections, and '+report.findings.length+' review warnings. The detected type is <strong>'+e(report.classification.replace(/_/g," "))+'</strong>. This is not a verified company fact or a customer-ready quote.</p><p>Sample source positions: '+e(report.candidates.slice(0,3).map(x=>x.sourceRef).join(", ")||report.facts?.slice(0,3).map(x=>x.sourceRef).join(", ")||"not yet identified")+'</p>':
   '<p>No uploaded source is available in this browser session. Open Document Intelligence, download a fictional sample PDF/Excel file, and select it to inspect.</p>';
  return {sources:[],html:wrap("Document extraction status",body,actions(button("Open document intelligence ↗","nav","intake","button-primary")))};
 }
 if(/past projects|previous jobs|historical|quote from history|similar jobs|past quotes|歷史|以往|過去|類似案例|歷史報價|智能報價/.test(question)){
  const h=c.history,ref=h?.records.filter(x=>x.status==="COMPLETE").slice(0,3).map(x=>x.sourceDocId)||[];
  const body='<p>Use comparable completed work, normalized cost lines, explicit price adjustments, and human approval to prepare a source-linked new estimate. The current precedents are fictional sample jobs.</p>'+relevant(ref);
  return {sources:ref,html:wrap("Historical Quotation Intelligence",body,actions(button("Review similar projects ↗","nav","history","button-primary")))};
 }
 if(/ready to|ready for|can we (start|proceed|release|print)|what.{0,40}(missing|blocking|ready)|release (the )?(job|project|press)|檢核結果|缺少什麼|可以開工|可否印刷|印前準備|施工前|進場前|準備好了/.test(question)){
  const report=evaluateReadiness(p.id,s.readiness?.inputs||initialReadiness(p.id));
  const latest=s.readiness?.assessment;
  const counted=latest&&JSON.stringify(latest.inputs)===JSON.stringify(report.inputs);
  const issues=report.checks.filter(x=>x.status==="hold");
  const cited=[...new Set(issues.slice(0,3).flatMap(x=>x.sourceIds))];
  let body='<p>Based on manually entered <strong>fictional job conditions</strong>, this '+e(p.itemLabel)+' has <strong>'+report.counts.hold+' blocking evidence gaps</strong> and '+report.counts.review+' additional review flags. '+e(report.message)+'</p>';
  body+='<div class="pulse-grid"><div class="pulse-item"><strong>'+report.counts.pass+'</strong><small>Recorded as checked</small></div><div class="pulse-item"><strong>'+report.counts.hold+'</strong><small>Blocking gaps</small></div><div class="pulse-item"><strong>'+report.counts.review+'</strong><small>Expert/process review</small></div></div>';
  body+=issues.slice(0,3).map(x=>'<div class="prio-row"><div class="prio-main"><div class="prio-title">'+e(x.title)+'</div><div class="prio-sub">'+e(x.nextAction)+'</div></div>'+source(x.sourceIds[0])+'</div>').join("");
  body+='<p class="disclosure">'+(counted?'A browser-local screening has been recorded.':'This is a preview; the screening is not yet recorded.')+' No actual building review or print-file preflight was performed.</p>'+relevant(cited);
  return {sources:cited,html:wrap("Operational release readiness",body,actions(button("Review all checks ↗","nav","readiness","button-primary"),button("View linked work","nav","work","button-outline")))};
 }
 if(c.industryEvidence&&(
   (p.id==="interior"&&/permit|regulation|regulatory|renovation rules|building rules|code compliance|fire.safety|registered|licensed|contract form|drawing revision|completion inspection|裝修法規|室內裝修|室內設計法規|圖說|申請|驗收|建築法|契約範本|防火|證照/.test(question))
   ||(p.id==="printing"&&/preflight|bleed|dpi|\bpdf\b|\ba3\b|artwork|font embed|proof approval|color management|CMYK|binding|印前|出血|校稿|打樣|色彩|裝訂|印刷檔案|油墨|空污/.test(question))
  )){
  let selected=referenceForPrompt(c.industryEvidence,p.id,question);
  if(!selected.length){
   const ids=p.id==="interior"?( /contract|契約/.test(question)?["REF-I05","REF-I08"]: /fire|防火/.test(question)?["REF-I04","REF-I07"]: /inspection|驗收/.test(question)?["REF-I09"]:["REF-I01","REF-I03","REF-I10"]):
    (/bleed|dpi|pdf|出血|印前|檔案/.test(question)?["REF-P02","REF-P03","REF-P04"]:/proof|打樣|校稿/.test(question)?["REF-P07","REF-P09"]:["REF-P01","REF-P05","REF-P06"]);
   selected=c.industryEvidence.cards.filter(x=>ids.includes(x.id));
  }
  const ids=selected.map(x=>x.id);
  const paragraphs=selected.slice(0,3).map(x=>'<div class="prio-row"><div class="prio-main"><div class="prio-title">'+e(x.titleZh)+' · '+e(x.titleEn)+'</div><div class="prio-sub">'+e(x.summary)+'</div><div class="disclosure" style="margin-top:5px">Scope limitation: '+e(x.limits)+'</div></div>'+source(x.id)+'</div>').join("");
  const content='<p>I found '+selected.length+' relevant Taiwan public-reference notes. These are laws, official guidance or documented examples depending on the source type. They do not prove this fictional client is compliant or that vendor requirements are universal.</p>'+paragraphs+'<div class="answer-actions">'+button("Explore Taiwan guidance ↗","nav","playbook","button-primary")+button("Run operational check ↗","nav","readiness","button-outline")+'</div>';
  return {sources:ids,html:wrap("Published Taiwan industry guidance",content)};
 }
 if(packTerm.test(question)||/change order|variation|material change|substitution|變更|替換/.test(question)){
  const changed=s.variation.cost!==sc.cost||s.variation.margin!==sc.margin;
  let desc='<p>'+e(pr.name)+' has a proposed change: '+e(sc.name)+'. The current draft input is '+money(cost.cost)+' incremental direct cost. At '+cost.margin+'% target gross margin, the calculated pre-tax amount is '+money(cost.beforeTax)+'; illustrative tax-inclusive total '+money(cost.total)+'.</p>';
  desc+='<div class="pulse-grid"><div class="pulse-item"><strong>'+money(cost.cost)+'</strong><small>Input direct cost</small></div><div class="pulse-item"><strong>'+money(cost.beforeTax)+'</strong><small>Proposed price ex tax</small></div><div class="pulse-item"><strong>'+money(cost.total)+'</strong><small>Total incl. sample tax</small></div></div>';
  if(changed)desc+='<div class="divergence">Pricing was adjusted in this demo. The original supplier document still contains its old sample estimate, and the difference requires renewed validation before approval.</div>';
  desc+='<p>'+e(sc.unresolved)+'</p>'+relevant(sc.sourceIds);
  return {sources:sc.sourceIds,html:wrap("Review the proposed change",desc,actions(button("Open quotation review ↗","nav","quotes","button-primary")))};
 }
 if(/who.{0,50}(call|follow|contact|first)|call first|follow.up first|誰.{0,20}(先|聯絡|追蹤)|先(聯絡|跟進)|優先(聯絡|追蹤)/.test(question)){
  const approvals=m.approvals(s).filter(a=>a.status==="Pending");
  const blocked=m.tasks(s).filter(t=>t.status==="Blocked");
  const recommended=[...approvals.slice(0,3).map(a=>({projectId:a.projectId,title:a.title,reason:"Pending owner review before dependent work or customer promises",sourceDocId:a.sourceDocId,person:m.project(a.projectId)?.manager})),
  ...blocked.slice(0,2).map(t=>({projectId:t.projectId,title:t.title,reason:t.blockedBy||"Recorded work blockage",sourceDocId:t.sourceDocId,person:t.owner}))].slice(0,5);
  const refs=[...new Set(recommended.map(x=>x.sourceDocId))];
  const body='<p>For the <strong>fictional example workspace</strong>, the recommended follow-up order is pending decisions first, then blocked work—not a learned customer lifetime-value ranking. No actual phone numbers or contact availability are connected.</p>'+
   recommended.map((r,i)=>'<div class="prio-row"><span class="prio-index">'+(i+1)+'</span><div class="prio-main"><div class="prio-title">'+e(r.person||"Assigned owner")+' · '+e(m.project(r.projectId)?.name)+'</div><div class="prio-sub">'+e(r.title)+' — '+e(r.reason)+'</div></div>'+source(r.sourceDocId)+'</div>').join("")+
   '<p class="disclosure">Before any external customer call, check the latest approved quote and account relationship. No call was made.</p>';
  return {sources:refs,html:wrap("Who to follow up with first",body,actions(button("Review approval queue","nav","approvals","button-primary"),button("Work blockers","nav","work","button-outline")))};
 }
 if(/(how many|number of|count).{0,45}(quotes|quotations).{0,35}(today|sent)|(today|今天).{0,45}(quotes|quotations|報價)|今天.{0,35}(送出|報價)/.test(question)){
  const day=m.seed.meta.date||"2026-10-18";
  const sent=m.seed.quotes.filter(q=>q.status==="Sent"&&q.lastUpdated===day);
  const priced=sent.reduce((sum,q)=>sum+q.amountExTax,0),refs=[...new Set(sent.map(q=>q.sourceDocId))];
  const body='<p>On the fictional dataset’s recorded date <strong>'+e(day)+'</strong>, <strong>'+sent.length+'</strong> quote version(s) were marked “Sent”, with a proposed pre-tax total of <strong>'+money(priced)+'</strong>. This is not a live count for the real current date; delivery to a customer has not been independently verified.</p>'+relevant(refs)+
   '<p class="disclosure">Drafts, accepted contracts, invoices, and cash receipts are different operational states.</p>';
  return {sources:refs,html:wrap("Recorded quotation activity",body,actions(button("Inspect quotations","nav","quotes","button-primary")))};
 }
 if(/(weighted|blended|average|overall).{0,42}(margin|profit)|margin.{0,22}(today|overall)|平均毛利|整體毛利/.test(question)){
  const latest=m.latestQuotes(),costs=latest.reduce((x,q)=>x+q.directCost,0),sell=latest.reduce((x,q)=>x+q.amountExTax,0);
  const margin=sell>0?(sell-costs)/sell*100:0;
  const refs=[...new Set(latest.slice(0,6).map(q=>q.sourceDocId))];
  const body='<p>The sample current proposal portfolio has a <strong>'+margin.toFixed(1)+'% weighted proposed gross margin</strong> calculated from '+latest.length+' latest quote versions, using proposed pre-tax price and recorded direct cost. It does <strong>not</strong> represent realized company profit or any live sales activity.</p>'+relevant(refs);
  return {sources:refs,html:wrap("Weighted draft-quote margin",body,actions(button("Inspect source calculations","nav","analytics","button-primary")))};
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
