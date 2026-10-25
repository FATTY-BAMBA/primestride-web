import {escapeHtml as e} from "./core-model.js";
import {button,source} from "./ui-shared.js";
import {displayRecordText} from "./record-locale.js";
import {activeOperationsRun} from "./ai-team.js";

const formatTime=(value,zh)=>{if(!value)return "—";try{return new Date(value).toLocaleString(zh?"zh-TW":"en-TW",{hour12:false,month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return value;}};
export function aiTeamView(c){
 const {model:m,state:s}=c,zh=c.locale!=="en",run=activeOperationsRun(s),t=x=>displayRecordText(x,c.locale);
 const prepared=run?.items.filter(x=>x.state!=="completed").length||0,completed=run?.items.filter(x=>x.state==="completed").length||0;
 let out='<section class="brief-header"><div class="suite-eyebrow">'+(zh?'STRIDEBRAIN · AI 營運團隊':'STRIDEBRAIN · AI OPERATING TEAM')+'</div>'+
  '<h1>'+(zh?'不只回答。<br>開始把事情做完。':'Not just answers.<br>Move work forward.')+'</h1>'+
  '<p>'+(zh?'AI 同事會先查資料、準備工作，再把需要你決定的部分交給你。每一步都有來源與紀錄。':'AI teammates investigate and prepare work first, then bring you the decisions that need human approval. Every step stays traceable.')+'</p></section>';
 out+='<section class="section sb-agent-roster"><h2>'+(zh?'我的 AI 團隊':'My AI team')+'</h2><div class="sb-agent-grid">'+
  '<article class="sb-agent-card active"><div class="suite-eyebrow">'+(zh?'已啟用 · V0.1':'ACTIVE · V0.1')+'</div><h3>'+(zh?'營運特助':'Operations Assistant')+'</h3><p>'+(zh?'每天整理優先事項、查核來源、準備追蹤訊息與待辦。':'Reviews priorities, evidence and prepares follow-ups and tasks.')+'</p><span class="tag">'+(zh?'觀察 + 準備 + 經批准執行':'Observe + prepare + approved execution')+'</span></article>'+
  '<article class="sb-agent-card"><div class="suite-eyebrow">'+(zh?'下一階段':'NEXT')+'</div><h3>'+(zh?'專案協調員':'Project Coordinator')+'</h3><p>'+(zh?'專案期限、受阻工作、交接與責任人追蹤。':'Deadlines, blockers, handoffs and owners.')+'</p></article>'+
  '<article class="sb-agent-card"><div class="suite-eyebrow">'+(zh?'下一階段':'NEXT')+'</div><h3>'+(zh?'估價與毛利守門員':'Quote & Margin Guardian')+'</h3><p>'+(zh?'報價版本、成本變化、試算毛利與審核提醒。':'Quote revisions, costs, calculated margins and review prompts.')+'</p></article>'+
  '</div></section>';
 out+='<section class="section sb-agent-control"><div><div class="suite-eyebrow">'+(zh?'營運特助 · 今日工作':'OPERATIONS ASSISTANT · TODAY')+'</div><h2>'+(run?(zh?'已準備 '+run.items.length+' 項工作':'Prepared '+run.items.length+' actions'):(zh?'讓特助先替你跑一輪':'Let your assistant do the first pass'))+'</h2>'+
  '<p>'+(zh?'自動：讀取示範紀錄、整理優先事項、草擬訊息。需要你批准：建立追蹤待辦。此版本不會自動送出外部訊息。':'Automatic: inspect demo records, prioritize, draft messages. Human approval required: create follow-up tasks. This version does not send external messages.')+'</p></div>'+
  button(run?(zh?'重新整理今日工作 ↻':'Refresh today’s work ↻'):(zh?'開始今日工作 ↗':'Start today’s work ↗'),'agentRun','','button-primary')+'</section>';
 if(run){
  out+='<div class="operational-cards"><div class="metric-card"><small>'+(zh?'已準備':'Prepared')+'</small><strong>'+prepared+'</strong><span>'+(zh?'等待你的決定':'waiting for you')+'</span></div><div class="metric-card"><small>'+(zh?'已完成':'Completed')+'</small><strong>'+completed+'</strong><span>'+(zh?'已建立示範待辦':'demo tasks created')+'</span></div><div class="metric-card"><small>'+(zh?'上次執行':'Last run')+'</small><strong>'+e(formatTime(run.createdAt,zh))+'</strong><span>'+e(run.asOf||'')+'</span></div></div>';
  out+='<section class="section"><h2>'+(zh?'等你確認的工作':'Work waiting for you')+'</h2><div class="sb-agent-action-list">'+run.items.map((item,index)=>{
   const pr=m.project(item.projectId),done=item.state==="completed",draft=zh?item.draftZh:item.draftEn;
   return '<article class="sb-agent-action '+(done?'done':'')+'"><div class="sb-agent-action-head"><span>0'+(index+1)+'</span><div><strong>'+e(t(pr?.name||item.projectName))+' · '+e(t(item.title))+'</strong><small>'+e(item.recordId)+' · '+e(item.contact)+' · '+e(item.dueDate||'—')+'</small></div><b>'+(done?(zh?'已完成 ✓':'Completed ✓'):(zh?'待你批准':'Approval needed'))+'</b></div>'+
    '<p>'+(zh?'特助已完成：查核紀錄、找到聯絡人、準備追蹤訊息。':'Assistant completed: evidence review, contact lookup and follow-up draft.')+'</p>'+
    '<div class="sb-agent-draft"><small>'+(zh?'訊息草稿 · 尚未送出':'MESSAGE DRAFT · NOT SENT')+'</small><p>'+e(draft)+'</p></div>'+
    '<div class="sb-agent-sources">'+item.sourceIds.slice(0,6).map(source).join(' ')+'</div>'+
    '<div class="action-stack">'+(done?'<span class="notice green">'+e((zh?'已建立追蹤待辦 ':'Created follow-up task ')+item.generatedTaskId)+'</span>':button(zh?'批准並建立追蹤待辦 ↗':'Approve & create follow-up task ↗','agentExecute',item.id,'button-primary'))+'</div></article>';
  }).join('')+'</div></section>';
  out+='<section class="section panel"><div class="suite-eyebrow">'+(zh?'權限與稽核':'PERMISSIONS & AUDIT')+'</div><h3>'+(zh?'特助目前能做什麼？':'What can this teammate do?')+'</h3><div class="sb-permission-grid"><div><strong>'+(zh?'自動允許':'Automatic')+'</strong><p>'+(zh?'唯讀查詢、整理、計算、草擬。':'Read-only lookup, organization, calculations and drafts.')+'</p></div><div><strong>'+(zh?'需要批准':'Human approval')+'</strong><p>'+(zh?'建立內部示範待辦。':'Create an internal demo follow-up task.')+'</p></div><div><strong>'+(zh?'目前禁止':'Not enabled')+'</strong><p>'+(zh?'寄信、傳 LINE、修改客戶或供應商資料、付款或核准報價。':'Email/LINE sending, customer/vendor edits, payments or quote approval.')+'</p></div></div></section>';
 }
 return out;
}
