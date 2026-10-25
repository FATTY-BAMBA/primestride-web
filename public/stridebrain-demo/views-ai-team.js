import {escapeHtml as e} from "./core-model.js";
import {button,source} from "./ui-shared.js";
import {displayRecordText} from "./record-locale.js";
import {listAgents,activeAgentRun,normaliseAiTeamState} from "./ai-team.js";

const formatTime=(value,zh)=>{if(!value)return "—";try{return new Date(value).toLocaleString(zh?"zh-TW":"en-TW",{hour12:false,month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return value;}};
const name=(agent,zh)=>zh?agent.nameZh:agent.nameEn;
const desc=(agent,zh)=>zh?agent.descriptionZh:agent.descriptionEn;
const permissionText=(agent,key,zh)=>{
 const n=agent.permissions[key]?.length||0;
 if(key==="automatic")return zh?"唯讀查詢、計算、整理與草擬。":"Read-only lookup, calculations, organization and drafts.";
 if(key==="approval")return zh?"建立內部追蹤待辦。":"Create internal follow-up tasks.";
 return zh?"對外送訊息、修改商務資料、核准報價與付款。":"External sending, business-record edits, quote approval and payments.";
};
export function aiTeamView(c){
 const {model:m,state:s}=c,zh=c.locale!=="en",team=normaliseAiTeamState(s.aiTeam),agents=listAgents();
 s.aiTeam=team;
 const selected=agents.find(a=>a.id===team.activeAgentId)||agents[0],run=activeAgentRun(s,selected.id),t=x=>displayRecordText(x,c.locale);
 const prepared=run?.items.filter(x=>x.state!=="completed").length||0,completed=run?.items.filter(x=>x.state==="completed").length||0;
 let out='<section class="brief-header"><div class="suite-eyebrow">'+(zh?'STRIDEBRAIN · AI 營運團隊':'STRIDEBRAIN · AI OPERATING TEAM')+'</div>'+
  '<h1>'+(zh?'不只回答。<br>開始把事情做完。':'Not just answers.<br>Move work forward.')+'</h1>'+
  '<p>'+(zh?'三位 AI 同事共用同一套權限、證據與稽核規則。它們先查資料與準備工作，需要你決定的部分才交回來。':'Three AI teammates share one permission, evidence and audit runtime. They investigate and prepare first, then return only the decisions that need you.')+'</p></section>';

 out+='<section class="section sb-agent-roster"><div class="section-head"><div><h2>'+(zh?'我的 AI 團隊':'My AI team')+'</h2><p>'+(zh?'選一位 AI 同事開始工作；每位都使用同一套受控執行規則。':'Choose a teammate to work; every agent uses the same controlled execution rules.')+'</p></div></div><div class="sb-agent-grid">'+
  agents.map(agent=>'<button type="button" class="sb-agent-card '+(selected.id===agent.id?'active':'')+'" data-action="agentSelect" data-value="'+e(agent.id)+'" aria-pressed="'+String(selected.id===agent.id)+'"><div class="suite-eyebrow">'+(zh?'已啟用 · ':'ACTIVE · ')+e(agent.version)+'</div><h3>'+e(name(agent,zh))+'</h3><p>'+e(desc(agent,zh))+'</p><span class="tag">'+(zh?'共用 Agent Runtime':'Shared Agent Runtime')+'</span></button>').join('')+
  '</div></section>';

 out+='<section class="section sb-agent-control"><div><div class="suite-eyebrow">'+e(name(selected,zh))+' · '+(zh?'今日工作':'TODAY')+'</div><h2>'+(run?(zh?'已準備 '+run.items.length+' 項工作':'Prepared '+run.items.length+' actions'):(zh?'讓這位 AI 同事先替你跑一輪':'Let this teammate do the first pass'))+'</h2>'+
  '<p>'+e(run?.basis||(zh?'只使用目前示範工作區的結構化紀錄與可追溯來源。':'Uses only current demo workspace records and traceable evidence.'))+'</p></div>'+
  button(run?(zh?'重新整理工作 ↻':'Refresh work ↻'):(zh?'開始工作 ↗':'Start work ↗'),'agentRun',selected.id,'button-primary')+'</section>';

 if(run){
  out+='<div class="operational-cards"><div class="metric-card"><small>'+(zh?'待確認':'Waiting')+'</small><strong>'+prepared+'</strong><span>'+(zh?'需要你的決定':'need your decision')+'</span></div><div class="metric-card"><small>'+(zh?'已完成':'Completed')+'</small><strong>'+completed+'</strong><span>'+(zh?'內部示範待辦':'internal demo tasks')+'</span></div><div class="metric-card"><small>'+(zh?'上次執行':'Last run')+'</small><strong>'+e(formatTime(run.createdAt,zh))+'</strong><span>'+e(run.asOf||'')+'</span></div></div>';

  out+='<section class="section"><h2>'+(zh?'等你確認的工作':'Work waiting for you')+'</h2><div class="sb-agent-action-list">'+run.items.map((item,index)=>{
   const pr=m.project(item.projectId),done=item.state==="completed",draft=zh?item.draftZh:item.draftEn;
   const draftLabel=item.draftKind==="review"?(zh?'內部複核摘要':'INTERNAL REVIEW NOTE'):(zh?'訊息草稿 · 尚未送出':'MESSAGE DRAFT · NOT SENT');
   return '<article class="sb-agent-action '+(done?'done':'')+'"><div class="sb-agent-action-head"><span>0'+(index+1)+'</span><div><strong>'+e(t(pr?.name||item.projectName))+' · '+e(t(item.title))+'</strong><small>'+e(item.recordId)+' · '+e(item.contact)+' · '+e(item.dueDate||'—')+'</small></div><b>'+(done?(zh?'已完成 ✓':'Completed ✓'):(zh?'待你批准':'Approval needed'))+'</b></div>'+
    '<p>'+(zh?'AI 同事已完成：查核紀錄、整理依據、準備下一步。':'AI teammate completed: record review, evidence preparation and next-step preparation.')+'</p>'+
    '<div class="sb-agent-draft"><small>'+draftLabel+'</small><p>'+e(draft)+'</p></div>'+
    '<div class="sb-agent-sources">'+item.sourceIds.slice(0,8).map(source).join(' ')+'</div>'+
    '<div class="action-stack">'+(done?'<span class="notice green">'+e((zh?'已建立追蹤待辦 ':'Created follow-up task ')+item.generatedTaskId)+'</span>':button(zh?'批准並建立追蹤待辦 ↗':'Approve & create follow-up task ↗','agentExecute',item.id,'button-primary'))+'</div></article>';
  }).join('')+'</div></section>';

  out+='<section class="section panel"><div class="suite-eyebrow">'+(zh?'共用權限與稽核層':'SHARED PERMISSION & AUDIT LAYER')+'</div><h3>'+e(name(selected,zh))+(zh?'目前能做什麼？':' permissions')+'</h3><div class="sb-permission-grid"><div><strong>'+(zh?'自動允許':'Automatic')+'</strong><p>'+e(permissionText(selected,"automatic",zh))+'</p></div><div><strong>'+(zh?'需要批准':'Human approval')+'</strong><p>'+e(permissionText(selected,"approval",zh))+'</p></div><div><strong>'+(zh?'目前禁止':'Blocked')+'</strong><p>'+e(permissionText(selected,"blocked",zh))+'</p></div></div></section>';
 }
 return out;
}
