import {money,escapeHtml as e} from './core-model.js';
import {button,source,section} from './ui-shared.js';
import {displayRecordText} from './record-locale.js';
import {reviewPriorities} from './priority-review.js';
import {commercialReview} from './commercial-review.js';
import {resolveConversation} from './conversation-state.js';
import {evidenceList} from './evidence-presentation.js';
export const DEMO_ROLES={
 owner:{zh:'老闆／經營者',en:'Owner',promptZh:'目前哪些工作與報價需要我關注？請附資料來源。',promptEn:'Which work and quotations need my attention? Include sources.'},
 manager:{zh:'專案經理',en:'Project manager',promptZh:'哪些專案有受阻工作，應該找誰確認？',promptEn:'Which projects have blocked work and who should confirm next steps?'},
 estimator:{zh:'估價人員',en:'Estimator',promptZh:'請比較目前報價版本的成本與試算毛利率。',promptEn:'Compare costs and calculated margins across quotation revisions.'},
 service:{zh:'客服／業務',en:'Customer-facing team',promptZh:'幫我草擬一則專案進度詢問訊息，先列出需要確認的資訊，不要發送。',promptEn:'Draft a project-status inquiry, identify missing facts, and do not send it.'}
};
export function roleChooser(c,{compact=false}={}){
 const zh=c.locale!=='en';
 const controls='<div class="btn-row">'+Object.entries(DEMO_ROLES).map(([id,r])=>'<button type="button" class="button-outline" data-action="demoRole" data-value="'+id+'" aria-pressed="'+String(c.view.demoRole===id)+'">'+e(zh?r.zh:r.en)+'</button>').join('')+button(zh?'直接進入對話':'Open conversation','nav','copilot','button-link')+'</div>'+(DEMO_ROLES[c.view.demoRole]?'<button type="button" class="sb-role-question" data-action="ask" data-prompt="'+e(zh?DEMO_ROLES[c.view.demoRole].promptZh:DEMO_ROLES[c.view.demoRole].promptEn)+'">'+e(zh?DEMO_ROLES[c.view.demoRole].promptZh:DEMO_ROLES[c.view.demoRole].promptEn)+' ↗</button>':'');
 if(compact)return '<details class="sb-role-entry sb-role-entry-compact"'+(c.view.demoRole?' open':'')+' aria-label="'+(zh?'選擇檢視角度':'Choose a perspective')+'"><summary><span>'+(zh?'依角色調整建議':'Tailor suggestions by role')+'</span><small>'+(zh?'選填':'Optional')+'</small></summary><div class="sb-role-entry-inner">'+controls+'</div></details>';
 return '<section class="sb-role-entry" aria-label="'+(zh?'選擇檢視角度':'Choose a perspective')+'"><p>'+(zh?'從你的工作開始（可略過）':'Start with your role (optional)')+'</p>'+controls+'</section>';
}
const focus=(id,prompt,label)=>'<button type="button" class="button-secondary" data-action="focusQuestion" data-id="'+e(id)+'" data-prompt="'+e(prompt)+'">'+e(label)+' ↗</button>';
export function renderOverview(c){
 const {model:m,view:v,state:s}=c,zh=c.locale!=='en',t=x=>displayRecordText(x,c.locale),seed=m.seed;
 const review=reviewPriorities(seed,{limit:3}),commercial=commercialReview(seed),asOf=seed.meta.date;
 let out='<section class="brief-header"><div class="suite-eyebrow">'+(zh?'StrideBrain · 營運工作區':'StrideBrain · Operations workspace')+'</div><h1>'+(zh?'問清楚。查得到。<br>知道下一步。':'Ask your business.<br>See the evidence.')+'</h1><p>'+(zh?'把專案、報價、成本與待審事項串在一起。直接提問，查核依據，再找到下一步該確認的人。':'Connect projects, quotations, costs and pending decisions. Ask a question, inspect the evidence and find the next person to consult.')+'</p>'+button(zh?'開始提問 ↗':'Ask a question ↗','nav','copilot','button-primary')+'</section>';
 out+=roleChooser(c);
 out+='<nav class="sb-guided-path" aria-label="'+(zh?'體驗路徑':'Guided journey')+'">'+[['overview','1 · 需要關注','1 · Attention'],['projects','2 · 選擇專案','2 · Project'],['knowledge','3 · 查核依據','3 · Evidence'],['copilot','4 · 確認下一步','4 · Next person']].map(([page,cn,en])=>button(zh?cn:en,'nav',page,'button-outline')).join('')+'</nav>';
 out+='<section class="section sb-owner-brief"><div class="suite-eyebrow">'+e(zh?'共同資料日期 · '+asOf:'Shared snapshot · '+asOf)+'</div><h2>'+(zh?'值得先確認的三件事':'Three items worth reviewing')+'</h2><p>'+(zh?'與助理使用相同紀錄及排序。依記錄日期、受阻狀態與待確認事項整理；並列不代表營運影響相同。':'The same records and ordering used by Copilot: recorded dates, blockers and unresolved decisions. Tied signals do not prove equal business impact.')+'</p>';
 out+=review.items.map((item,i)=>{const a=item.primaryAction;return '<article class="sb-brief-item" data-priority-id="'+e(a.id)+'"><span>0'+(i+1)+'</span><div><strong>'+e(t(item.projectName))+' · '+e(t(a.title))+'</strong><small>'+e(a.id)+' · '+e(t(a.status))+' · '+(zh?'記錄到期日 ':'Recorded due date ')+e(a.dueDate||'—')+'</small><p>'+e((zh?'確認對象：':'Contact: ')+(a.owner||'—'))+'。'+e(zh?'請確認工作進度及仍缺少的決定。':'Confirm progress and any outstanding decision.')+'</p><div>'+source('REG-'+a.id)+'</div>'+(item.equalPriorityProjectIds.length?'<small>'+e(zh?'另有 '+item.equalPriorityProjectIds.length+' 個專案具相同排序訊號。':item.equalPriorityProjectIds.length+' other projects have tied ranking signals.')+'</small>':'')+'</div>'+focus(item.projectId,zh?'請說明 '+item.projectId+' 的這項待辦 '+a.id+'，並列出要確認的人。':'Explain '+a.id+' in '+item.projectId+' and who should confirm it.',zh?'查看依據與下一步':'Inspect next step')+'</article>';}).join('');
 out+='</section><section class="section sb-commercial"><h2>'+(zh?'報價與毛利：先看變化，再查原因':'Quotations and margins: inspect changes, then causes')+'</h2><p>'+(zh?'以下為報價紀錄的試算，不是已實現的損失。版本範圍是否相同，仍需確認。':'Calculated from quote records, not realized losses. Confirm that revision scopes are comparable.')+'</p>';
 out+=commercial.map(x=>'<article class="sb-commercial-item"><div><strong>'+e(t(x.projectName))+' · '+e(x.quoteId)+'</strong><small>'+e(t(x.status))+' · '+e(x.manager||'—')+'</small><p>'+(zh?'未稅報價 ':'Price ex tax ')+money(x.priceExTax)+' · '+(zh?'直接成本 ':'Direct cost ')+money(x.directCost)+'</p><p>'+(zh?'試算毛利率 ':'Calculated margin ')+e(x.marginPct===null?'—':x.marginPct.toFixed(1)+'%')+(x.marginChangePoints===null?'':' · '+e(zh?'較 '+x.previousQuoteId+' 變動 ':'vs '+x.previousQuoteId+' ')+e((x.marginChangePoints>=0?'+':'')+x.marginChangePoints.toFixed(1))+' '+(zh?'個百分點':'percentage points'))+'</p>'+x.sourceIds.map(source).join(' ')+'</div>'+focus(x.projectId,zh?'請核對 '+x.projectId+' 的報價版本、直接成本與試算毛利，分開說明紀錄與推論。':'Review quote revisions, direct costs and calculated margins for '+x.projectId+'. Separate recorded facts from inference.',zh?'核對報價':'Review quotation')+'</article>').join('');
 out+='</section>';
 if(Object.keys(s.tasks||{}).length||Object.keys(s.approvals||{}).length||s.variation?.committed)out+='<p class="disclosure">'+(zh?'你另有瀏覽器內的流程演練變更。此總覽與 AI 引用的是原始示範紀錄，演練變更尚未同步。':'Local workflow simulation changes exist. This overview and AI use the original snapshot; local changes are not synchronized.')+'</p>';
 return out;
}
export function conversationPanelState(c){
 const last=[...(c.view.chat||[])].reverse().find(m=>m.role==='assistant'&&m.mode==='gpt'&&!m.pending);
 const messages=(c.view.chat||[]).filter(m=>m.role==='user'||(m.mode==='gpt'&&m.text)).map(m=>({role:m.role,content:m.text||''}));
 const lastUser=messages.map(m=>m.role).lastIndexOf('user');
 const requestHistory=lastUser>=0?messages.slice(0,lastUser+1):[];
 const ctx=resolveConversation(c.model.seed,requestHistory,{selectedProjectId:c.view.copilotProjectId||null});
 const pending=c.view.chat?.at(-1)?.pending||c.view.chat?.at(-1)?.role==='user';
 const stored=pending?null:last?.context;
 const valid=id=>c.model.project(id);
 return {mode:stored?.mode||ctx.mode,pendingProjectSelection:stored?.pendingProjectSelection??ctx.pendingProjectSelection,
  selectedProjectId:valid(stored?.selectedProjectId)?stored.selectedProjectId:ctx.selectedProjectId,
  candidateProjectIds:(Array.isArray(stored?.candidateProjectIds)?stored.candidateProjectIds:ctx.candidateProjectIds).filter(valid),
  sourceIds:(Array.isArray(last?.sources)?last.sources:[]).filter(id=>c.model.document(id))};
}
export function renderConversationInspector(c){
 const {model:m,view:v}=c,zh=c.locale!=='en',t=x=>displayRecordText(x,c.locale),x=conversationPanelState(c),d=m.document(v.docId);
 let out='<div class="inspector-eyebrow">'+(zh?'工作脈絡與資料來源':'CONTEXT & EVIDENCE')+'</div>';
 if(d)return out+renderEvidenceDocument(d,c);
 const pr=m.project(x.selectedProjectId);
 if(pr){out+='<h3>'+e(t(pr.name))+'</h3><p>'+e(pr.id)+' · '+e(pr.manager)+'</p><p>'+e(t(pr.stage))+'</p><div class="action-stack">'+focus(pr.id,zh?'請核對 '+pr.id+' 的報價、成本與資料來源。':'Review quotations, costs and sources for '+pr.id+'.',zh?'查看報價依據':'Review quote evidence')+focus(pr.id,zh?'請確認 '+pr.id+' 下一步應該找誰。':'Who should confirm the next step for '+pr.id+'?',zh?'找確認對象':'Find contact')+focus(pr.id,zh?'請草擬給 '+pr.manager+' 的 '+pr.id+' 確認訊息，只提供草稿，不要發送。':'Draft a confirmation message to '+pr.manager+' about '+pr.id+'. Draft only; do not send.',zh?'草擬詢問訊息':'Draft an inquiry')+'</div>';}
 else if(x.candidateProjectIds.length){out+='<h3>'+(zh?(x.pendingProjectSelection?'請選擇專案':'目前討論的專案'):(x.pendingProjectSelection?'Choose a project':'Projects in this conversation'))+'</h3><div class="action-stack">'+x.candidateProjectIds.map(id=>{const p=m.project(id);return focus(id,id, t(p.name));}).join('')+'</div>';}
 else out+='<h3>'+(zh?'從一個問題開始':'Start with a question')+'</h3><p>'+(zh?'選定專案或開啟來源後，這裡會顯示對應的紀錄。不預設任何專案。':'This panel follows the project or evidence you select. No project is selected by default.')+'</p>';
 out+=evidenceList(x.sourceIds,m,c.locale);
 return out;
}
export function renderEvidenceDocument(d,c){
 const zh=c.locale!=='en',t=x=>displayRecordText(x,c.locale),register=d.basisType==='DEMO_REGISTER';
 return '<section class="inspector-section"><div class="suite-eyebrow">'+e(d.id)+' · '+e(d.version)+'</div><h3>'+e(t(d.title))+'</h3><p>'+e(t(d.status))+' · '+e(zh?'紀錄負責人：':'Record owner: ')+e(d.owner||'—')+'</p><p class="disclosure">'+(register?(zh?'示範紀錄快照；計算值另列，不是供應商原始文件。':'Demo register snapshot; calculations are identified separately. Not a supplier document.'):(zh?'來源原文。文件內容與其他紀錄的狀態或金額應分別查核。':'Original source text. Verify document content separately from linked register values.'))+'</p><div class="doc-body">'+e(d.body)+'</div><div class="action-stack">'+button(zh?'下載來源':'Download source','download',d.id,'button-secondary')+button(zh?'關閉來源':'Close source','closeSource','','button-outline')+'</div></section>';
}
export function renderProjectSignals(c,p){
 const seed=c.model.seed,zh=c.locale!=='en',tasks=seed.workOrders.filter(w=>w.projectId===p.id&&w.status==='Blocked'),pending=seed.approvals.filter(a=>a.projectId===p.id&&a.status==='Pending'),q=seed.quotes.find(q=>q.projectId===p.id&&q.isLatest);
 return '<div class="sb-project-signals"><span>'+e(zh?tasks.length+' 筆受阻工作':tasks.length+' blocked work items')+'</span><span>'+e(zh?pending.length+' 件待確認':pending.length+' pending decisions')+'</span><span>'+e(q?q.id+' · '+displayRecordText(q.status,c.locale):(zh?'尚無報價':'No quotation'))+'</span></div>';
}
