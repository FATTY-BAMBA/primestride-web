import {money,escapeHtml as e} from "./core-model.js";
import {badge,button,source,sources,metric,heading,section,tag,recordCard,documentRow,quoteTable} from "./ui-shared.js";
import {sourceUrlForDocument} from "./industry-evidence.js";
import {getReadinessPack} from "./readiness-rules.js";
import {MODEL_CATALOG,DEFAULT_MODEL_ID,findAllowedModel} from "./model-catalog.js";
import {quickActionsFor,ideasFor,followUpsFor} from "./copilot-suggestions.js";
export function overview(c){
 const {model:m,pack:p,state:s}=c,sm=m.summary(s),open=m.approvals(s).filter(a=>a.status==="Pending").slice(0,3);
 let out='<section class="brief-header"><div class="suite-eyebrow">BUSINESS PULSE · '+e(p.companyEn)+'</div><h1>Know what matters.<br>Move work forward.</h1><p>'+e(p.companyLine)+' '+e(p.outcomeLine)+'</p><div class="brief-actions">'+button("Ask StrideBrain ↗","nav","copilot","button-primary")+'<span class="brief-date">'+e(p.dateLabel)+'</span></div></section>';
 out+='<div class="operational-cards">'+metric(p.projectLabel,sm.projects,"Connected demo records")+metric("Open approvals",sm.pending,"Decisions require review")+metric("Blocked work items",sm.blocked,"Dependencies need attention")+metric("Proposed quote portfolio",money(sm.latestQuoteTotal),"Latest proposals; not revenue")+'</div>';
 out+='<section class="section">'+section("Start with a question","One entry point for knowledge, quotations and daily work.")+'<form id="ask-form" class="quick-command"><span style="font-size:20px;color:var(--mint)">✦</span><input aria-label="Ask StrideBrain" placeholder="'+e(p.cue)+'" autocomplete="off"><button type="submit" class="button-primary">Ask ↗</button></form><div class="suggest-line">'+p.promptSuggestions.map(t=>'<button type="button" data-action="ask" data-prompt="'+e(t)+'">'+e(t)+'</button>').join("")+'</div></section>';
 out+='<div class="readiness-mini"><span><strong>Before a job can proceed:</strong> assess the drawings, technical checks and outstanding approvals for this industry.</span>'+button("Run operational checks ↗","nav","readiness","button-secondary")+'</div>';
 out+='<div class="history-mini"><span><strong>New customer inquiry?</strong> Find relevant past jobs and prepare a traceable historical estimate.</span>'+button("Estimate from history ↗","nav","history","button-secondary")+'</div>';
 out+='<div class="history-mini"><span><strong>Received a document?</strong> Upload a sanitized Excel quotation or PDF specification, inspect source locations, and prepare a reviewed draft.</span>'+button("Open document intelligence ↗","nav","intake","button-secondary")+'</div>';
 out+='<section class="section split-feature"><div class="panel">'+section("Decisions waiting for you","Every action links to a specific work record.",button("View all ↗","nav","approvals","button-link"))+open.map((a,i)=>'<div class="prio-row"><span class="prio-index">0'+(i+1)+'</span><div class="prio-main"><div class="prio-title">'+e(a.title)+'</div><div class="prio-sub">'+e(m.project(a.projectId)?.name)+' · '+e(a.id)+'</div></div><button type="button" class="prio-link" data-action="approval" data-id="'+e(a.id)+'">Review ↗</button></div>').join("")+'</div><div class="feature-banner"><div class="suite-eyebrow">FEATURED END-TO-END WORKFLOW</div><h2>'+e(p.scenario.name)+'</h2><p>'+e(p.scenario.risk)+' Trace sources, review the price and manage approvals before creating work.</p>'+button("Open controlled workflow ↗","nav","quotes","button-primary")+'</div></section>';
 out+='<section class="section">'+section(p.projectLabel+" at a glance","Quotations, source documents, status and responsibilities remain connected.",button("All "+p.projectLabel+" ↗","nav","projects","button-link"))+'<div class="cards-two">'+m.seed.projects.slice(0,4).map(recordCard).join("")+'</div></section>';
 out+='<section class="section split-feature"><div class="panel">'+section("Shared company memory","Existing rules and project files support all applications.",button("Knowledge hub ↗","nav","knowledge","button-link"))+'<div class="pulse-grid"><div class="pulse-item"><strong>'+sm.documents+'</strong><small>Knowledge sources</small></div><div class="pulse-item"><strong>'+sm.suppliers+'</strong><small>Supplier examples</small></div><div class="pulse-item"><strong>'+sm.quotes+'</strong><small>Quote versions</small></div></div></div><div class="panel">'+section("Better over time","Capture corrections and send them through responsible review.")+'<p class="text-small muted">Feedback is recorded as a review task, not silently promoted into approved company knowledge.</p>'+button("Learning & feedback ↗","nav","learning","button-secondary")+'</div></section>';
 return out;
}
export function copilot(c){
 const {pack:p,view:v,copilotSession:session={}}=c;
 const isConnectedMode=session.mode==="gpt",connected=!!session.connected,busy=!!session.busy;
 const empty=v.chat.length===0,model=findAllowedModel(session.selectedModelId)||findAllowedModel(DEFAULT_MODEL_ID);
 const menuOpen=!!session.modelMenuOpen&&!busy;
 const greetingHour=new Date().getHours();
 const greeting=greetingHour<12?"Good morning":greetingHour<17?"Good afternoon":"Good evening";
 const displayStatus=isConnectedMode?(connected?"Connected · Read-only synthetic records":"Staff AI requested · Connection not yet verified"):"Sample mode · No AI provider call";
 const brandLabel=isConnectedMode?"STAFF AI COPILOT":"DETERMINISTIC EXAMPLE COPILOT";
 const quick=quickActionsFor(p.id),ideas=ideasFor(p.id);
 const hideIfBusy=busy?" disabled":"";
 const menu=MODEL_CATALOG.map(item=>{
  const selected=item.id===model.id;
  return '<button type="button" role="option" aria-selected="'+(selected?"true":"false")+'" class="sb-model-option'+(selected?" selected":"")+'" data-action="modelSelect" data-value="'+e(item.id)+'"'+hideIfBusy+'>'+
    '<span class="sb-model-option-main"><strong>'+e(item.label)+'</strong><span class="sb-model-check">'+(selected?"✓":"")+'</span></span>'+
    '<span class="sb-model-purpose">'+e(item.purpose)+'</span>'+
    '<span class="sb-model-desc">'+e(item.description)+'</span>'+
    '<span class="sb-model-maker">'+e(item.provider==="openrouter"?"Via OpenRouter · "+item.maker:"Direct API · "+item.maker)+'</span></button>';
 }).join("");
 let out='<div class="sb-copilot '+(empty?"is-empty":"is-active")+'">';
 if(empty){
  out+='<section class="sb-copilot-welcome">'+
   '<div class="sb-copilot-eyebrow"><span class="sb-brand-spark">✳</span> STRIDEBRAIN · '+e(p.companyEn.toUpperCase())+'</div>'+
   '<h1>'+e(greeting)+', '+e(p.owner)+'.</h1>'+
   '<p>What can I help with across your '+e(p.short.toLowerCase())+' business today?</p>'+
   '</section>';
 }else{
  out+='<div class="sb-copilot-session-head"><div><div class="sb-copilot-eyebrow">STRIDEBRAIN · '+e(p.companyEn.toUpperCase())+'</div><h1>Business conversation</h1><p>Ask follow-ups, explore sources, and move into the right workflow.</p></div>'+
    '<button type="button" class="button-outline sb-new-chat" data-action="newChat">＋ New conversation</button></div>';
 }
 out+='<div class="sb-conversation">'+v.chat.map((msg,i)=>msg.role==="user"?
  '<div class="chat-message">'+e(msg.text)+'</div>':
  '<div class="chat-answer"><div class="chat-answer-head"><span class="sb-answer-symbol">✳</span> STRIDEBRAIN · '+(msg.mode==="gpt"?e(msg.modelLabel||"CONNECTED MODEL")+" / SYNTHETIC BUSINESS TOOLS":"SOURCE-LINKED SAMPLE")+'</div>'+
  msg.html+(msg.pending?'':'<div class="feedback-row"><span class="disclosure">Was this useful?</span><span><button type="button" class="feedback-btn" data-action="feedback" data-kind="Helpful" data-index="'+i+'">✓ Helpful</button> <button type="button" class="feedback-btn" data-action="feedback" data-kind="Needs review" data-index="'+i+'">⚑ Needs review</button></span></div>')+'</div>'
 ).join("")+'</div>';
 const last=v.chat[v.chat.length-1];
 if(last?.role==="assistant"&&!last.pending&&last.mode==="gpt"){
  const next=followUpsFor(last.query,p.id,last.actions||[]);
  out+='<div class="sb-context-ideas sb-followup-ideas"><span class="sb-context-label">CONTINUE INVESTIGATING</span><div class="sb-context-idea-row">'+next.map(item=>
   '<button type="button" data-action="ask" data-prompt="'+e(item.prompt)+'" class="sb-context-idea"'+hideIfBusy+'>'+e(item.label)+' ↗</button>'
  ).join("")+'</div></div>';
 }
 out+='<div class="sb-copilot-compose">';
 out+='<form id="ask-form" class="sb-composer">'+
  '<label class="sr-only" for="sb-composer-input">Ask StrideBrain</label>'+
  '<textarea id="sb-composer-input" data-copilot-input rows="2" maxlength="1200" placeholder="Ask about quotes, priorities, suppliers, or your projects..."'+hideIfBusy+'>'+e(session.draft||"")+'</textarea>'+
  '<div class="sb-composer-bottom">'+
   '<div class="sb-composer-left">'+
    '<button type="button" data-action="nav" data-value="intake" class="sb-composer-add" aria-label="Open Document Intelligence" title="Open Document Intelligence (files are not attached to Copilot)">＋</button>'+
    '<span class="sb-composer-hint">Enter to send · Shift+Enter for a new line</span>'+
   '</div>'+
   '<div class="sb-composer-right">'+
    '<div class="sb-model-container">'+
     '<button type="button" class="sb-model-trigger" data-action="modelMenu" aria-haspopup="listbox" aria-expanded="'+(menuOpen?"true":"false")+'" aria-controls="sb-model-menu" title="Choose an approved AI model"'+hideIfBusy+'>'+
      '<span class="sb-model-label">'+e(model.label)+'</span><span class="sb-model-arrow">⌄</span></button>'+
     (menuOpen?'<div class="sb-model-menu" id="sb-model-menu" role="listbox" aria-label="Approved model choices">'+
      '<div class="sb-model-menu-heading">CHOOSE AI MODEL</div>'+menu+
      '<div class="sb-model-menu-note">Model choice takes effect only in a connected staff preview. All business tools remain read-only.</div></div>':'')+
    '</div>'+
    '<button type="submit" class="sb-send" aria-label="Send question" title="Send question"'+hideIfBusy+'>'+(busy?"···":"↑")+'</button>'+
   '</div>'+
  '</div></form>';
 out+='<div class="sb-shortcut-row">'+quick.map(item=>
   '<button type="button" class="sb-shortcut" data-action="ask" data-prompt="'+e(item.prompt)+'" title="'+e(item.description)+'"'+hideIfBusy+'><span aria-hidden="true">'+e(item.glyph)+'</span>'+e(item.label)+'</button>'
 ).join("")+'</div>';
 if(empty){
  out+='<div class="sb-context-ideas"><span class="sb-context-label">SUGGESTED FOR '+e(p.companyEn.toUpperCase())+'</span>'+
   '<div class="sb-context-idea-row">'+ideas.map(item=>
    '<button type="button" data-action="ask" data-prompt="'+e(item.prompt)+'" class="sb-context-idea"'+hideIfBusy+'><span>'+e(item.glyph)+'</span>'+e(item.label)+' ↗</button>'
   ).join("")+'</div></div>';
 }
 out+='<div class="sb-copilot-status"><span class="sb-status-dot"></span><span>'+e(displayStatus)+'</span><span class="sb-status-divider">·</span><span>Fictional company records · No automatic customer actions</span></div>';
 out+='</div>';
 if(!isConnectedMode){
  out+='<details class="copilot-operator-box"><summary><span><span aria-hidden="true">⚙</span> Connect an approved AI provider (internal staff only)</span><span>▾</span></summary>'+
   '<div class="copilot-operator-inner"><p>Model selection is already visible in the composer, just like the reference. To actually use OpenRouter or the direct OpenAI model, an administrator must configure the provider API key <strong>on the server</strong> and enable the internal demo endpoint. Enter only your <strong>separate staff operator access token</strong> here—not an OpenRouter or OpenAI API key.</p>'+
   '<label for="copilot-access-token" class="form-field">Internal staff operator token<input type="password" id="copilot-access-token" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Private demo operator token"></label>'+
   '<div class="action-stack">'+button("Connect selected AI model ↗","enableGpt","","button-secondary")+'</div>'+
   '<p class="disclosure">Selected model: '+e(model.label)+' ('+e(model.provider==="openrouter"?"OpenRouter":"Direct OpenAI")+
   '). Staff prompts are sent to the configured provider after authorization. Demo materials stay fictional; uploaded files are never forwarded to the model.</p></div></details>';
 }else{
  out+='<div class="sb-copilot-connected-foot"><span><strong>Internal staff AI mode</strong> · Selected model: '+e(model.label)+' · Read-only synthetic tools.</span>'+
   button("Disconnect model","disableGpt","","button-outline")+'</div>';
 }
 out+='</div>';
 return out;
}

export function projects(c){
 const {model:m,pack:p,state:s,view:v}=c;
 if(v.projectDetail&&m.project(v.projectId)){
  const pr=m.project(v.projectId),docs=m.documentsFor(pr.id),work=m.tasksFor(pr.id,s),q=m.quotationsFor(pr.id),a=m.approvalsFor(pr.id,s);
  let out=heading(pr.name,pr.id+" · "+pr.city+" · "+pr.manager,button("← All "+p.projectLabel,"projectBack","","button-outline"),"CONNECTED WORK RECORD");
  out+='<div class="info-grid"><div class="info-field"><small>Sample budget</small><strong>'+money(pr.budget)+'</strong></div><div class="info-field"><small>Progress</small><strong>'+pr.progress+'%</strong></div><div class="info-field"><small>Sample target</small><strong>'+e(pr.targetDate)+'</strong></div></div>';
  out+='<section class="section split-page"><div class="panel">'+section("Project knowledge",docs.length+" traceable source documents")+docs.slice(0,7).map(documentRow).join("")+'</div><div class="panel">'+section("Execution", "Derived from the same work record")+'<div class="pulse-grid"><div class="pulse-item"><strong>'+work.length+'</strong><small>Tasks</small></div><div class="pulse-item"><strong>'+a.filter(x=>x.status==="Pending").length+'</strong><small>Pending approvals</small></div><div class="pulse-item"><strong>'+q.length+'</strong><small>Quote versions</small></div></div>'+work.slice(0,5).map(t=>'<div class="prio-row"><div class="prio-main"><div class="prio-title">'+e(t.title)+'</div><div class="prio-sub">'+e(t.owner)+' · '+e(t.dueDate)+'</div></div>'+badge(t.status)+'</div>').join("")+'</div></section>';
  out+='<section class="section">'+section("Quotation revision history","Each historical version remains inspectable; only latest totals appear in analytics.")+quoteTable(c,q)+'</section>';return out;
 }
 const list=m.searchProjects(v.search);
 return heading(p.projectLabel,"One identity for source documents, quotations, work and approvals.",tag(list.length+" example "+p.itemLabelPlural),"CONNECTED WORK PORTFOLIO")+'<div class="filter-bar"><input class="input" data-input="search" aria-label="Find work" value="'+e(v.search)+'" placeholder="Search '+e(p.itemLabelPlural)+', team members and cities…"></div><div class="cards-two">'+list.map(recordCard).join("")+'</div>';
}
export function knowledge(c){
 const {model:m,view:v}=c,kinds=["all",...new Set(m.seed.documents.map(d=>d.kind))],hits=m.searchDocuments(v.search,v.filter),pages=Math.max(1,Math.ceil(hits.length/18)),page=Math.min(v.pageIndex,pages-1),rows=hits.slice(page*18,(page+1)*18);
 v.pageIndex=page;
 let out=heading("Company knowledge hub","Inspect sources, revision labels, and clearly separated public guidance versus fictional company records.",tag(m.seed.documents.length+" indexed knowledge records"),"ONE SHARED KNOWLEDGE FOUNDATION");
 const imported=c.documentSession?.report||null;
 if(imported){
  out+='<div class="history-mini"><span><strong>Temporary source in this browser:</strong> '+e(imported.fileName)+' · '+e(imported.classification.replace(/_/g," "))+' · '+(imported.reviewed?'Reviewed extraction':'Requires review')+'. This file is not part of the company knowledge index and disappears after refresh.</span>'+button("Inspect local file ↗","nav","intake","button-secondary")+'</div>';
 }
 const publicCount=m.seed.documents.filter(d=>d.basisType==="PUBLIC_REFERENCE").length;
 const historicalCount=m.seed.documents.filter(d=>d.kind==="Historical cost record").length;
 const sampleCount=m.seed.documents.length-publicCount-historicalCount;
 out+='<div class="operational-cards">'+metric("Public references",publicCount,"Taiwan sources · original URLs")+metric("Fictional company files",sampleCount,"Sample company operations")+metric("Historical sample costs",historicalCount,"Not actual customer history")+metric("Pending company reviews",m.seed.documents.filter(d=>d.status==="Pending review").length,"Needs responsible review")+'</div>';
 out+='<div class="secondary-note" style="margin:15px 0">The knowledge hub deliberately separates <strong>publicly cited industry guidance</strong> from <strong>fictional company records and cost examples</strong>. Neither one verifies a specific customer’s pricing, permits or supplier status. Explore the <button type="button" class="table-btn" data-action="nav" data-value="playbook">industry operations playbook ↗</button>.</div>';
 const featuredPublic=m.seed.documents.filter(d=>d.basisType==="PUBLIC_REFERENCE").slice(0,3);
 if(featuredPublic.length)out+='<section class="section">'+section("Taiwan industry references","Original public sources with documented scope and applicability.",button("View all public references ↗","publicFilter","","button-secondary"))+'<div class="panel">'+featuredPublic.map(documentRow).join("")+'</div></section>';
 out+='<div class="filter-bar"><input class="input" data-input="search" value="'+e(v.search)+'" aria-label="Search knowledge" placeholder="Search names, IDs and full document text…"><select class="select" data-input="filter" aria-label="Filter document category">'+kinds.map(k=>'<option value="'+e(k)+'"'+(k===v.filter?" selected":"")+'>'+e(k==="all"?"All categories":k)+'</option>').join("")+'</select></div>';
 out+='<div class="panel">'+section(hits.length+" matching documents","Page "+(page+1)+" of "+pages)+(rows.length?rows.map(documentRow).join(""):'<div class="empty">No sources match this filter.</div>')+'<div class="btn-row" style="justify-content:space-between;margin-top:17px">'+button("← Previous","page","-1","button-outline")+button("Next →","page","1","button-outline")+'</div></div>';return out;
}
function sourceProvenance(d,registry){
 if(d?.basisType==="BROWSER_LOCAL_SANDBOX")return '<div class="source-provenance synthetic"><strong>Local hypothetical cost precedent · temporary</strong><span>Derived from reviewer-mapped source rows in this browser tab. Completion and cost coverage were assumed for the fictional scenario. The file is not verified as real job history and the record is not persisted or shared.</span></div>';
 if(d?.basisType!=="PUBLIC_REFERENCE")return '<div class="source-provenance synthetic"><strong>Fictional demo record</strong><span>This content is illustrative company data, not independent evidence of prices, permits, employees or transactions.</span></div>';
 const sources=(d.evidenceIds||[]).map(id=>registry?.sources?.find(x=>x.id===id)).filter(Boolean);
 if(!sources.length)return '<div class="source-provenance"><strong>Public reference · original link</strong><span>No source registry available; verify the reference independently.</span></div>';
 return '<div class="source-provenance"><strong>Public-reference provenance · '+sources.length+' original source'+(sources.length===1?'':'s')+'</strong>'+
 sources.map(src=>{const url=sourceUrlForDocument({...d,sourceUrl:src.url});return url?'<a href="'+e(url)+'" target="_blank" rel="noopener noreferrer"><span>'+e(src.title)+'</span><small>'+e(src.publisher)+' · '+e(src.kind)+' · '+e(src.locator)+'</small><b>↗</b></a>':'';}).join('')+
 '<p>Scope: '+e(sources.map(x=>x.caveat).join(' · '))+'</p></div>';
}
export function renderInspector(c){
 const {model:m,pack:p,state:s,view:v}=c,pr=m.project(v.projectId)||m.project(p.scenario.projectId),d=m.document(v.docId);
 let out='<div class="inspector-eyebrow">CONTEXT & EVIDENCE</div><h3>Working context</h3>';
 if(d){out+='<div class="inspector-section"><div class="suite-eyebrow">'+e(d.id)+' · '+e(d.version)+'</div><h3>'+e(d.title)+'</h3>'+badge(d.status)+'<p class="disclosure" style="margin:9px 0">Owner: '+e(d.owner)+'</p><div class="doc-body">'+e(d.body)+'</div>'+sourceProvenance(d,c.industryEvidence)+'<div class="action-stack">'+button("Download source","download",d.id,"button-primary")+button("Close","closeSource","","button-outline")+'</div><div class="action-stack">'+button("Flag for review","sourceFeedback",d.id,"button-secondary")+'</div></div>';}
 else {out+='<div class="inspector-section"><div class="inspector-context"><div class="suite-eyebrow">SELECTED '+e(p.entityLabel.toUpperCase())+'</div><strong>'+e(pr.name)+'</strong><small>'+e(pr.stage)+' · '+e(pr.manager)+'</small><div class="progress-line"><i style="width:'+pr.progress+'%"></i></div><small>'+pr.progress+'% recorded progress</small></div>'+button("Open work ↗","project",pr.id,"button-secondary")+'</div>';}
 const ids=v.page==="readiness"?(getReadinessPack(p.id)?.sourceIds||[]):v.page==="playbook"?(c.industryEvidence?.cards.filter(x=>x.industry===p.id).slice(0,5).map(x=>x.id)||[]):v.page==="history"?(c.history?.records.filter(x=>x.status==="COMPLETE").slice(0,4).map(x=>x.sourceDocId)||[]):["copilot","service","quotes"].includes(v.page)?p.scenario.sourceIds:m.documentsFor(pr.id).slice(0,4).map(d=>d.id);
 out+='<div class="inspector-section">'+section("Relevant source evidence","Inspect the original sample content")+ids.map(id=>{let d=m.document(id);return d?'<button class="inspector-source" data-action="source" data-id="'+e(d.id)+'"><strong>'+e(d.title)+'</strong><small>'+e(d.id)+' · '+e(d.version)+' · '+e(d.status)+'</small></button>':"";}).join("")+'</div>';
 if(v.page==="quotes"){const x=s.variation;out+='<div class="inspector-section">'+section("Approval gates","Simulated local state")+'<div class="inspector-context"><strong>Supplier '+(x.supplier?"✓":"○")+' · Owner '+(x.owner?"✓":"○")+' · Customer '+(x.customer?"✓":"○")+'</strong></div></div>';}
 out+='<div class="inspector-section"><div class="suite-eyebrow">PROTOTYPE BOUNDARY</div><p class="disclosure">Data, companies and prices are fictional. No live AI, vendor feeds, LINE integration or server-side production storage is enabled.</p></div>';return out;
}
export function renderSourceModal(d,registry){return '<div class="evidence-modal"><div class="panel-header"><div><div class="suite-eyebrow">'+e(d.id)+' · '+e(d.version)+'</div><h2>'+e(d.title)+'</h2></div>'+button("Close ×","closeSource","","button-outline")+'</div>'+badge(d.status)+'<div class="doc-body" style="margin-top:14px">'+e(d.body)+'</div>'+sourceProvenance(d,registry)+'<div class="action-stack">'+button("Download .md","download",d.id,"button-primary")+button("Flag for review","sourceFeedback",d.id,"button-secondary")+'</div></div>';}
