import {renderOverview,renderConversationInspector,renderEvidenceDocument,roleChooser,renderProjectSignals} from "./experience-views.js";
import {money,escapeHtml as e} from "./core-model.js";
import {badge,button,source,sources,metric,heading,section,tag,recordCard,documentRow,quoteTable} from "./ui-shared.js";
import {sourceUrlForDocument} from "./industry-evidence.js";
import {getReadinessPack} from "./readiness-rules.js";
import {MODEL_CATALOG,DEFAULT_MODEL_ID,findAllowedModel} from "./model-catalog.js";
import {activeAgentRun,listAgents} from "./ai-team.js";
import {quickActionsFor,ideasFor,followUpsFor} from "./copilot-suggestions.js";
import {operationalSignals,riskRadarSignals} from "./operational-signals.js";
import {displayRecordText} from "./record-locale.js";
const localizedName=(value,zh)=>displayRecordText(value,zh?"zh-TW":"en");
export function overview(c){return renderOverview(c);}
export function copilot(c){
 const {pack:p,view:v,copilotSession:session={}}=c;
 const zh=c.locale!=="en";
 const isConnectedMode=session.mode==="gpt",isGuest=!!session.guest,connected=!!session.connected,busy=!!session.busy;
 const empty=v.chat.length===0,model=findAllowedModel(session.selectedModelId)||findAllowedModel(DEFAULT_MODEL_ID);
 const menuOpen=!!session.modelMenuOpen&&!busy;
 const greetingHour=new Date().getHours();
 const greeting=zh?(greetingHour<12?"早安":greetingHour<17?"午安":"晚安"):(greetingHour<12?"Good morning":greetingHour<17?"Good afternoon":"Good evening");
 const displayStatus=isConnectedMode?(connected?(zh?"已連線 · 唯讀工作區工具":"Connected · Read-only workspace tools"):(zh?"可以開始提問":"Ready for your question")):(zh?"示範回答 · 尚未連接 AI 模型":"Sample answers · AI provider not connected");
 const brandLabel=isConnectedMode?(isGuest?"STRIDEBRAIN AI COPILOT":"STAFF AI COPILOT"):(zh?"範例資料瀏覽":"SAMPLE DATA EXPLORER");
 const quick=quickActionsFor(p.id,c.locale),ideas=ideasFor(p.id,c.locale);
 const hideIfBusy=busy?" disabled":"";
 const ZH_MODELS={
 "anthropic/claude-sonnet-5.5":["日常營運","適合一般營運問題與自然對話"],
 "openai/gpt-6-sol":["複雜分析","適合結構化分析與多步驟問題"],
 "google/gemini-3.1-pro-preview-customtools":["深入推理","適合長篇資料及多工具分析（預覽）"],
 "deepseek/deepseek-v4.1-flash":["快速回覆","適合重視效率的工具查詢"],
 "openai-direct/gpt-5.6":["直接 API","使用另外設定的 OpenAI API 專案"]
};
 const menu=MODEL_CATALOG.filter(item=>(session.allowedModelIds||[]).includes(item.id)).map(item=>{
  const selected=item.id===model.id;
  return '<button type="button" role="option" aria-selected="'+(selected?"true":"false")+'" class="sb-model-option'+(selected?" selected":"")+'" data-action="modelSelect" data-value="'+e(item.id)+'"'+hideIfBusy+'>'+
    '<span class="sb-model-option-main"><strong>'+e(item.label)+'</strong><span class="sb-model-check">'+(selected?"✓":"")+'</span></span>'+
    '<span class="sb-model-purpose">'+e(zh?(ZH_MODELS[item.id]?.[0]||item.purpose):item.purpose)+'</span>'+
    '<span class="sb-model-desc">'+e(zh?(ZH_MODELS[item.id]?.[1]||item.description):item.description)+'</span>'+
    '<span class="sb-model-maker">'+e(item.maker)+'</span></button>';
 }).join("");
 let out='<div class="sb-copilot '+(empty?"is-empty":"is-active")+'">';
 if(empty){
  out+='<section class="sb-copilot-welcome">'+
   '<div class="sb-copilot-eyebrow"><span class="sb-brand-spark">✳</span> STRIDEBRAIN · '+e(p.companyEn.toUpperCase())+'</div>'+
   '<h1>'+e(greeting)+', '+e(p.owner)+'.</h1>'+
   '<p>'+(zh?'今天想先了解哪些專案、報價或待辦事項？':'What can I help with across your '+e(p.short.toLowerCase())+' business today?')+'</p>'+
   '</section>';
 }else{
  out+='<div class="sb-copilot-session-head"><div><div class="sb-copilot-eyebrow">STRIDEBRAIN · '+e(p.companyEn.toUpperCase())+'</div><h1>'+(zh?"營運對話":"Business conversation")+'</h1><p>'+(zh?"追問細節、查看資料來源，直接進入相關作業。":"Ask follow-ups, explore sources, and move into the right workflow.")+'</p></div>'+
    '<button type="button" class="button-outline sb-new-chat" data-action="newChat">'+(zh?"＋ 新對話":"＋ New conversation")+'</button></div>';
 }
 out+='<div class="sb-conversation">'+v.chat.map((msg,i)=>msg.role==="user"?
  '<div class="chat-message">'+e(msg.text)+'</div>':
  '<div class="chat-answer"><div class="chat-answer-head"><span class="sb-answer-symbol">✳</span> STRIDEBRAIN · '+(msg.mode==="error"?(zh?"回覆尚未完成":"Answer not completed"):msg.mode==="gpt"?e(msg.modelLabel||"CONNECTED MODEL")+(zh?" / 唯讀工作區工具":" / WORKSPACE TOOLS"):(zh?"預設範例回答 · 非即時 AI":"PREWRITTEN EXAMPLE · NOT LIVE AI"))+'</div>'+
  msg.html+(msg.pending?'':'<div class="feedback-row"><span class="disclosure">'+(zh?"這個回答有幫助嗎？":"Was this useful?")+'</span><span><button type="button" class="feedback-btn" data-action="feedback" data-kind="Helpful" data-index="'+i+'">'+(zh?"✓ 有幫助":"✓ Helpful")+'</button> <button type="button" class="feedback-btn" data-action="feedback" data-kind="Needs review" data-index="'+i+'">'+(zh?"⚑ 需要改善":"⚑ Needs review")+'</button></span></div>')+'</div>'
 ).join("")+'</div>';
 const last=v.chat[v.chat.length-1];
 if(last?.role==="assistant"&&!last.pending&&last.mode==="gpt"){
  const next=followUpsFor(last.query,p.id,last.actions||[],last.text||"",c.locale);
  const q=String(last.query||"").toLowerCase(),handoff=/worry|risk|block|deadline|handoff|approval|priority|受阻|交接|核准|風險|擔心|到期/.test(q)||(last.actions||[]).includes("approvals");
  out+='<div class="sb-context-ideas sb-followup-ideas"><span class="sb-context-label">'+(zh?"繼續深入了解":"CONTINUE INVESTIGATING")+'</span><div class="sb-context-idea-row">'+next.map(item=>
   '<button type="button" data-action="ask" data-prompt="'+e(item.prompt)+'" class="sb-context-idea"'+hideIfBusy+'>'+e(item.label)+' ↗</button>'
  ).join("")+'</div></div>';
  if(handoff)out+='<section class="sb-copilot-handoff"><div><div class="suite-eyebrow">'+(zh?"從問答到主動協調":"FROM ANSWER TO ACTION")+'</div><h3>'+(zh?"不用每天記得問同一個問題":"Don’t rely on remembering the right question")+'</h3><p>'+(zh?"把這類風險交給專案協調員，讓它主動巡檢受阻、交期、核准與交接。":"Hand this class of risk to Project Coordinator so it can proactively review blockers, deadlines, approvals and handoffs.")+'</p></div><button type="button" class="button-primary" data-action="agentHandoff" data-value="project-coordinator">'+(zh?"交給專案協調員 ↗":"Hand off to Project Coordinator ↗")+'</button></section>';
 }
 out+='<div class="sb-copilot-compose">';
 out+='<form id="ask-form" class="sb-composer">'+
  '<label class="sr-only" for="sb-composer-input">'+(zh?'詢問 StrideBrain':'Ask StrideBrain')+'</label>'+
  '<textarea id="sb-composer-input" data-copilot-input rows="2" maxlength="1200" placeholder="'+(zh?"詢問報價、待辦事項、供應商或專案進度…":"Ask about quotes, priorities, suppliers, or your projects...")+'"'+hideIfBusy+'>'+e(session.draft||"")+'</textarea>'+
  '<div class="sb-composer-bottom">'+
   '<div class="sb-composer-left">'+
    '<button type="button" data-action="nav" data-value="intake" class="sb-composer-add" aria-label="'+(zh?"開啟文件智慧整理":"Open Document Intelligence")+'" title="'+(zh?"開啟文件智慧整理（不會將檔案直接附加到 AI 對話）":"Open Document Intelligence (files are not attached to Copilot)")+'">＋</button>'+
    '<span class="sb-composer-hint">'+(zh?"Enter 送出 · Shift+Enter 換行":"Enter to send · Shift+Enter for a new line")+'</span>'+
   '</div>'+
   '<div class="sb-composer-right">'+
    '<div class="sb-model-container">'+
     '<button type="button" class="sb-model-trigger" data-action="modelMenu" aria-haspopup="listbox" aria-expanded="'+(menuOpen?"true":"false")+'" aria-controls="sb-model-menu" title="'+(zh?"選擇允許使用的 AI 模型":"Choose an approved AI model")+'"'+hideIfBusy+'>'+
      '<span class="sb-model-label">'+e(model.label)+'</span><span class="sb-model-arrow">⌄</span></button>'+
     (menuOpen?'<div class="sb-model-menu" id="sb-model-menu" role="listbox" aria-label="'+(zh?"可選擇的 AI 模型":"Approved model choices")+'">'+
      '<div class="sb-model-menu-heading">'+(zh?"選擇 AI 模型":"CHOOSE AI MODEL")+'</div>'+menu+
      '<div class="sb-model-menu-note">'+(zh?"可用模型依工作區權限而定；所有業務工具目前僅供查詢。":"Available models depend on your workspace access. Business tools remain read-only.")+'</div></div>':'')+
    '</div>'+
    '<button type="submit" class="sb-send" aria-label="'+(zh?"送出問題":"Send question")+'" title="'+(zh?"送出問題":"Send question")+'"'+hideIfBusy+'>'+(busy?"···":"↑")+'</button>'+
   '</div>'+
  '</div></form>';
 out+='<div class="sb-shortcut-row">'+quick.map(item=>
   '<button type="button" class="sb-shortcut" data-action="ask" data-prompt="'+e(item.prompt)+'" title="'+e(item.description)+'"'+hideIfBusy+'><span aria-hidden="true">'+e(item.glyph)+'</span>'+e(item.label)+'</button>'
 ).join("")+'</div>';
 if(empty){
  out+='<div class="sb-context-ideas"><span class="sb-context-label">'+(zh?"你可以這樣問 · ":"SUGGESTED FOR ")+''+e(zh?p.company:p.companyEn.toUpperCase())+'</span>'+
   '<div class="sb-context-idea-row">'+ideas.map(item=>
    '<button type="button" data-action="ask" data-prompt="'+e(item.prompt)+'" class="sb-context-idea"'+hideIfBusy+'><span>'+e(item.glyph)+'</span>'+e(item.label)+' ↗</button>'
   ).join("")+'</div></div>';
 }
 out+='<div class="sb-copilot-status"><span class="sb-status-dot"></span><span>'+e(displayStatus)+'</span><span class="sb-status-divider">·</span><span>'+(zh?"示範資料 · 不會自動對外執行操作":"Demo data · No automatic external actions")+'</span></div>';
 out+='</div>';
 if(!isConnectedMode){
  const staffAccess=new URLSearchParams(location.search).has("staff");
  out+='<div class="sb-sample-disclosure" role="status" style="margin:12px 0;padding:12px 14px;border:1px solid #dce5df;border-radius:10px;background:#f5f9f6;color:#355447;font-size:.87rem"><strong>'+(zh?"AI 試用尚未啟用":"AI trial not activated")+'</strong><p style="margin:5px 0 0">'+(zh?"目前可瀏覽示範資料與範例回答。使用專屬邀請連結後，就能開始與 AI 對話。":"You can explore sample data and example answers. Open your personal invitation link to start chatting with AI.")+'</p></div>';
  if(staffAccess){
   out+='<details class="copilot-operator-box"><summary><span><span aria-hidden="true">⚙</span> '+(zh?"管理員登入":"Administrator sign-in")+'</span><span>▾</span></summary>'+
    '<div class="copilot-operator-inner"><p>'+(zh?"請輸入管理員提供的內部存取碼，以在此瀏覽器啟用 AI 助理。":"Enter your administrator-issued staff access code to activate AI on this browser.")+'</p>'+
    '<label for="copilot-access-token" class="form-field">'+(zh?"內部人員存取碼":"Staff access code")+'<input type="password" id="copilot-access-token" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+(zh?"輸入存取碼":"Enter access code")+'"></label>'+
    '<div class="action-stack">'+button(zh?"啟用 AI 助理 ↗":"Activate AI assistant ↗","enableGpt","","button-secondary")+'</div>'+
    '<p class="disclosure">'+(zh?"所有示範資料僅供查詢，不會自動對外執行操作。":"Demo data is read-only and no external actions run automatically.")+'</p></div></details>';
  }
 }else{
  out+='<div class="sb-copilot-connected-foot"><span><strong>'+(isGuest?(zh?'訪客 AI 工作區':'Guest AI workspace'):(zh?'內部人員 AI 模式':'Internal staff AI mode'))+'</strong>'+ (zh?' · 已選模型：':' · Selected model: ')+e(model.label)+(zh?' · 工作區資料僅供查詢。':' · Read-only workspace tools.')+'</span>'+
   button(isGuest?(zh?"離開訪客體驗":"Leave guest session"):(zh?"登出內部 AI":"Sign out of staff AI"),"disableGpt","","button-outline")+'</div>';
 }
 if(empty)out+=roleChooser(c);
 out+='</div>';
 return out;
}

export function projects(c){
 const {model:m,pack:p,state:s,view:v}=c,zh=c.locale!=="en",t=x=>displayRecordText(x,c.locale);
 if(v.projectDetail&&m.project(v.projectId)){
  const pr=m.project(v.projectId),docs=m.documentsFor(pr.id),work=m.tasksFor(pr.id,s),q=m.quotationsFor(pr.id),a=m.approvalsFor(pr.id,s);
  let out=heading(t(pr.name),pr.id+" · "+t(pr.city)+" · "+pr.manager,button(zh?"← 全部專案":"← All "+p.projectLabel,"projectBack","","button-outline"),"CONNECTED WORK RECORD");
  out+='<div class="info-grid"><div class="info-field"><small>'+(zh?'示範預算':'Sample budget')+'</small><strong>'+money(pr.budget)+'</strong></div><div class="info-field"><small>'+(zh?'紀錄進度':'Progress')+'</small><strong>'+pr.progress+'%</strong></div><div class="info-field"><small>'+(zh?'示範目標日':'Sample target')+'</small><strong>'+e(pr.targetDate)+'</strong></div></div>';
  out+='<section class="section split-page"><div class="panel">'+section("Project knowledge",docs.length+" traceable source documents")+docs.slice(0,7).map(d=>documentRow(d,c.locale)).join("")+'</div><div class="panel">'+section("Execution", "Derived from the same work record")+'<div class="pulse-grid"><div class="pulse-item"><strong>'+work.length+'</strong><small>'+(zh?'工作項目':'Tasks')+'</small></div><div class="pulse-item"><strong>'+a.filter(x=>x.status==="Pending").length+'</strong><small>'+(zh?'待確認事項':'Pending approvals')+'</small></div><div class="pulse-item"><strong>'+q.length+'</strong><small>'+(zh?'報價版本':'Quote versions')+'</small></div></div>'+work.slice(0,5).map(t=>'<div class="prio-row"><div class="prio-main"><div class="prio-title">'+e(displayRecordText(t.title,c.locale))+'</div><div class="prio-sub">'+e(t.owner)+' · '+e(t.dueDate)+'</div></div>'+badge(t.status,c.locale)+'</div>').join("")+'</div></section>';
  out+='<section class="section">'+section("Quotation revision history","Each historical version remains inspectable; only latest totals appear in analytics.")+quoteTable(c,q)+'</section>';return out;
 }
 const list=m.searchProjects(v.search);
 return heading(zh?"專案管理":p.projectLabel,zh?"從受阻工作、待確認決策與報價版本，找出要追查的專案。":"One identity for source documents, quotations, work and approvals.",tag(list.length+" example "+p.itemLabelPlural),zh?"專案紀錄":"CONNECTED WORK PORTFOLIO")+'<div class="filter-bar"><input class="input" data-input="search" aria-label="Find work" value="'+e(v.search)+'" placeholder="Search '+e(p.itemLabelPlural)+', team members and cities…"></div><div class="cards-two">'+list.map(pr=>'<div class="sb-project-tile">'+recordCard(pr,c.locale)+renderProjectSignals(c,pr)+'</div>').join("")+'</div>';
}
export function knowledge(c){
 const {model:m,view:v}=c,kinds=["all",...new Set(m.seed.documents.map(d=>d.kind))],hits=m.searchDocuments(v.search,v.filter),pages=Math.max(1,Math.ceil(hits.length/18)),page=Math.min(v.pageIndex,pages-1),rows=hits.slice(page*18,(page+1)*18);
 v.pageIndex=page;
 let out=heading("Company knowledge hub","Inspect sources, revision labels, and clearly separated public guidance versus sample company records.",tag(m.seed.documents.length+" indexed knowledge records"),"ONE SHARED KNOWLEDGE FOUNDATION");
 const imported=c.documentSession?.report||null;
 if(imported){
  out+='<div class="history-mini"><span><strong>Temporary source in this browser:</strong> '+e(imported.fileName)+' · '+e(imported.classification.replace(/_/g," "))+' · '+(imported.reviewed?'Reviewed extraction':'Requires review')+'. This file is not part of the company knowledge index and disappears after refresh.</span>'+button("Inspect local file ↗","nav","intake","button-secondary")+'</div>';
 }
 const publicCount=m.seed.documents.filter(d=>d.basisType==="PUBLIC_REFERENCE").length;
 const historicalCount=m.seed.documents.filter(d=>d.kind==="Historical cost record").length;
 const sampleCount=m.seed.documents.length-publicCount-historicalCount;
 out+='<div class="operational-cards">'+metric("Public references",publicCount,"Taiwan sources · original URLs")+metric("Sample company files",sampleCount,"Sample company operations")+metric("Historical sample costs",historicalCount,"Not actual customer history")+metric("Pending company reviews",m.seed.documents.filter(d=>d.status==="Pending review").length,"Needs responsible review")+'</div>';
 out+='<div class="secondary-note" style="margin:15px 0">The knowledge hub deliberately separates <strong>publicly cited industry guidance</strong> from <strong>sample company records and cost examples</strong>. Neither one verifies a specific customer’s pricing, permits or supplier status. Explore the <button type="button" class="table-btn" data-action="nav" data-value="playbook">industry operations playbook ↗</button>.</div>';
 const featuredPublic=m.seed.documents.filter(d=>d.basisType==="PUBLIC_REFERENCE").slice(0,3);
 if(featuredPublic.length)out+='<section class="section">'+section("Taiwan industry references","Original public sources with documented scope and applicability.",button("View all public references ↗","publicFilter","","button-secondary"))+'<div class="panel">'+featuredPublic.map(documentRow).join("")+'</div></section>';
 out+='<div class="filter-bar"><input class="input" data-input="search" value="'+e(v.search)+'" aria-label="Search knowledge" placeholder="Search names, IDs and full document text…"><select class="select" data-input="filter" aria-label="Filter document category">'+kinds.map(k=>'<option value="'+e(k)+'"'+(k===v.filter?" selected":"")+'>'+e(k==="all"?"All categories":k)+'</option>').join("")+'</select></div>';
 out+='<div class="panel">'+section(hits.length+" matching documents","Page "+(page+1)+" of "+pages)+(rows.length?rows.map(documentRow).join(""):'<div class="empty">No sources match this filter.</div>')+'<div class="btn-row" style="justify-content:space-between;margin-top:17px">'+button("← Previous","page","-1","button-outline")+button("Next →","page","1","button-outline")+'</div></div>';return out;
}
function sourceProvenance(d,registry){
 if(d?.basisType==="BROWSER_LOCAL_SANDBOX")return '<div class="source-provenance synthetic"><strong>Local hypothetical cost precedent · temporary</strong><span>Derived from reviewer-mapped source rows in this browser tab. Completion and cost coverage were assumed for the fictional scenario. The file is not verified as real job history and the record is not persisted or shared.</span></div>';
 if(d?.basisType!=="PUBLIC_REFERENCE")return '<div class="source-provenance synthetic"><strong>Demo data · Sample record</strong><span>This is sample company data, not independent evidence of prices, permits, employees or transactions.</span></div>';
 const sources=(d.evidenceIds||[]).map(id=>registry?.sources?.find(x=>x.id===id)).filter(Boolean);
 if(!sources.length)return '<div class="source-provenance"><strong>Public reference · original link</strong><span>No source registry available; verify the reference independently.</span></div>';
 return '<div class="source-provenance"><strong>Public-reference provenance · '+sources.length+' original source'+(sources.length===1?'':'s')+'</strong>'+
 sources.map(src=>{const url=sourceUrlForDocument({...d,sourceUrl:src.url});return url?'<a href="'+e(url)+'" target="_blank" rel="noopener noreferrer"><span>'+e(src.title)+'</span><small>'+e(src.publisher)+' · '+e(src.kind)+' · '+e(src.locator)+'</small><b>↗</b></a>':'';}).join('')+
 '<p>Scope: '+e(sources.map(x=>x.caveat).join(' · '))+'</p></div>';
}
function renderAiTeamInspector(c){
 const zh=c.locale!=="en",t=x=>displayRecordText(x,c.locale),run=activeAgentRun(c.state,c.state.aiTeam?.activeAgentId),agents=listAgents();
 const agent=agents.find(x=>x.id===c.state.aiTeam?.activeAgentId),item=run?.items.find(x=>x.id===c.view.agentDecisionId)||run?.items.find(x=>x.state!=="completed")||run?.items[0];
 const agentName=agent?(zh?agent.nameZh:agent.nameEn):(zh?'AI 同事':'AI teammate'),agentDesc=agent?(zh?agent.descriptionZh:agent.descriptionEn):'';
 const focus=agent?.id==="project-coordinator"?(zh?["受阻工作與交期","目前負責人","下一個交接"]:["Blockers & deadlines","Recorded owner","Next handoff"]):agent?.id==="quote-margin-guardian"?(zh?["報價版本","直接成本","試算毛利"]:["Quote version","Direct cost","Calculated margin"]):(zh?["優先事項","來源依據","準備下一步"]:["Priorities","Source evidence","Prepared next step"]);
 let out='<div class="inspector-eyebrow">'+(zh?'AI 工作脈絡':'AI WORK CONTEXT')+'</div>';
 if(!item)return out+'<div class="sb-inspector-ready"><div class="suite-eyebrow">'+(zh?'準備開始':'READY TO REVIEW')+'</div><h3>'+e(agentName)+'</h3><p>'+e(agentDesc)+'</p><div class="sb-inspector-focus">'+focus.map(x=>'<span>'+e(x)+'</span>').join('')+'</div></div><div class="inspector-section sb-inspector-control"><div class="suite-eyebrow">'+(zh?'人工控制邊界':'HUMAN APPROVAL BOUNDARY')+'</div><strong>'+(zh?'AI 可以先查資料與準備；真正執行仍由你決定。':'AI can investigate and prepare; execution stays with you.')+'</strong><small>'+(zh?'建立待辦、寄 Gmail 或傳 LINE 前，都會顯示最後確認；完成後留下可查收據。':'Before a task is created or Gmail / LINE is sent, you get a final approval step. Completed actions leave an auditable receipt.')+'</small></div>';
 const pr=c.model.project(item.projectId);
 out+='<div class="inspector-section"><div class="suite-eyebrow">'+e(agent?(zh?agent.nameZh:agent.nameEn):'AI')+' · '+e(item.recordId)+'</div><h3>'+e(t(item.title))+'</h3><p>'+e(item.projectId)+' · '+e(t(pr?.name||item.projectName))+' · '+e(item.contact)+'</p><div class="inspector-context"><strong>'+(item.state==="completed"?(zh?'已完成':'Completed'):(zh?'待你確認':'Needs your review'))+'</strong><small>'+e(item.rationale||(zh?'AI 已根據目前紀錄準備下一步。':'AI prepared a next step from the current records.'))+'</small></div></div>';
 out+='<div class="inspector-section">'+section(zh?'本項查核依據':'Evidence for this item',zh?'只顯示這項 AI 建議實際引用的來源':'Only sources actually used by this AI recommendation')+item.sourceIds.map(id=>{const d=c.model.document(id);return d?'<button class="inspector-source" data-action="source" data-id="'+e(d.id)+'"><strong>'+e(localizedName(d.title,zh))+'</strong><small>'+e(d.id)+' · '+e(d.version)+' · '+e(localizedName(d.status,zh))+'</small></button>':'';}).join('')+'</div>';
 out+='<div class="inspector-section"><div class="suite-eyebrow">'+(zh?'下一步':'NEXT STEP')+'</div><p class="disclosure">'+(item.state==="completed"?(zh?'這項工作已建立內部追蹤待辦；沒有對外發送訊息。':'An internal follow-up task was created. No external message was sent.'):(zh?'你可以回到左側查看草稿與依據，再決定是否建立內部待辦。':'Review the draft and evidence on the left, then decide whether to create the internal task.'))+'</p>'+button(zh?'查看專案 ↗':'Open project ↗','project',item.projectId,'button-secondary')+'</div>';
 return out;
}
export function renderInspector(c){
 if(c.view.page==="copilot")return renderConversationInspector(c);
 if(c.view.page==="team")return renderAiTeamInspector(c);
 const zh=c.locale!=="en";
 const {model:m,pack:p,state:s,view:v}=c,pr=m.project(v.projectId)||m.project(p.scenario.projectId),d=m.document(v.docId);
 let out='<div class="inspector-eyebrow">'+(zh?"工作脈絡與資料來源":"CONTEXT & EVIDENCE")+'</div><h3>'+(zh?"目前工作內容":"Working context")+'</h3>';
 if(d){out+='<div class="inspector-section"><div class="suite-eyebrow">'+e(d.id)+' · '+e(d.version)+'</div><h3>'+e(localizedName(d.title,zh))+'</h3>'+badge(d.status)+'<p class="disclosure" style="margin:9px 0">Owner: '+e(d.owner)+'</p><div class="doc-body">'+e(d.body)+'</div>'+sourceProvenance(d,c.industryEvidence)+'<div class="action-stack">'+button(zh?"下載來源文件":"Download source","download",d.id,"button-primary")+button(zh?"關閉":"Close","closeSource","","button-outline")+'</div><div class="action-stack">'+button(zh?"標記待審":"Flag for review","sourceFeedback",d.id,"button-secondary")+'</div></div>';}
 else {out+='<div class="inspector-section"><div class="inspector-context"><div class="suite-eyebrow">'+(zh?"目前專案":"SELECTED "+p.entityLabel.toUpperCase())+'</div><strong>'+e(localizedName(pr.name,zh))+'</strong><small>'+e(localizedName(pr.stage,zh))+' · '+e(pr.manager)+'</small><div class="progress-line"><i style="width:'+pr.progress+'%"></i></div><small>'+pr.progress+'% '+(zh?'紀錄進度':'recorded progress')+'</small></div>'+button(zh?"查看專案 ↗":"Open work ↗","project",pr.id,"button-secondary")+'</div>';}
 const ids=v.page==="readiness"?(getReadinessPack(p.id)?.sourceIds||[]):v.page==="playbook"?(c.industryEvidence?.cards.filter(x=>x.industry===p.id).slice(0,5).map(x=>x.id)||[]):v.page==="history"?(c.history?.records.filter(x=>x.status==="COMPLETE").slice(0,4).map(x=>x.sourceDocId)||[]):["copilot","service","quotes"].includes(v.page)?p.scenario.sourceIds:m.documentsFor(pr.id).slice(0,4).map(d=>d.id);
 out+='<div class="inspector-section">'+section(zh?"相關來源資料":"Relevant source evidence",zh?"查看示範資料的原始內容":"Inspect the original sample content")+ids.map(id=>{let d=m.document(id);return d?'<button class="inspector-source" data-action="source" data-id="'+e(d.id)+'"><strong>'+e(localizedName(d.title,zh))+'</strong><small>'+e(d.id)+' · '+e(d.version)+' · '+e(localizedName(d.status,zh))+'</small></button>':"";}).join("")+'</div>';
 if(v.page==="quotes"){const x=s.variation;out+='<div class="inspector-section">'+section(zh?"審核關卡":"Approval gates",zh?"目前示範審核狀態":"Simulated local state")+'<div class="inspector-context"><strong>Supplier '+(x.supplier?"✓":"○")+' · Owner '+(x.owner?"✓":"○")+' · Customer '+(x.customer?"✓":"○")+'</strong></div></div>';}
 out+='<div class="inspector-section"><div class="suite-eyebrow">'+(zh?"示範資料說明":"DEMO DATA")+'</div><p class="disclosure">'+(zh?"本工作區使用示範公司資料與價格，不會向客戶或供應商送出實際交易。":"This workspace uses demo company records and prices. No customer or supplier transactions are sent.")+'</p></div>';return out;
}
export function renderSourceModal(d,registry){return '<div class="evidence-modal"><div class="panel-header"><div><div class="suite-eyebrow">'+e(d.id)+' · '+e(d.version)+'</div><h2>'+e(d.title)+'</h2></div>'+button("Close ×","closeSource","","button-outline")+'</div>'+badge(d.status)+'<div class="doc-body" style="margin-top:14px">'+e(d.body)+'</div>'+sourceProvenance(d,registry)+'<div class="action-stack">'+button("Download .md","download",d.id,"button-primary")+button("Flag for review","sourceFeedback",d.id,"button-secondary")+'</div></div>';}
