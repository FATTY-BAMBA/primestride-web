/**
 * Turns a Copilot-written message draft into a Project Coordinator proposal, so the draft
 * can be edited, approved and sent from AI 團隊 like any other prepared action.
 * Pure: reads the chat transcript and the workspace model, returns a plan for recordModelAgentPlan.
 */
const DRAFT_ANSWER=/(您好|你好|^hi\b|^hello\b|^dear\b)/im;
const DRAFT_QUERY=/草擬|擬一|擬好|寫一封|draft/i;
const SUBJECT_LINE=/^\s*(?:\*\*)?\s*(?:主旨|標題|subject)\s*(?:\*\*)?\s*[:：]\s*(?:\*\*)?\s*(.+?)\s*$/im;
const RECIPIENT_LINE=/^\s*(?:\*\*)?\s*(?:收件人|收件者|致|to)\s*(?:\*\*)?\s*[:：]\s*(?:\*\*)?\s*(.+?)\s*$/im;
const META_LINE=/^\s*(?:\*\*)?\s*(?:主旨|標題|subject|收件人|收件者|致|to|寄件人|from|副本|cc)\s*(?:\*\*)?\s*[:：]/i;
const NOTE_LINE=/^\s*(?:[-*>]\s*)?(?:\*\*)?\s*(?:注意|提醒|備註|說明|note)\s*(?:\*\*)?\s*[:：]|未寄出|尚未寄出|not (?:been )?sent|unsent/i;
const INTRO_LINE=/(?:以下是|下面是|這是|here is|here's).{0,30}(?:草稿|訊息|信|draft|message)/i;

const clean=s=>String(s||"").replace(/\*\*/g,"").replace(/^#+\s*/gm,"").replace(/[ \t]+$/gm,"");

export function isDraftAnswer(message){
 if(!message||message.role!=="assistant"||message.mode!=="gpt"||message.pending)return false;
 const text=String(message.text||"");
 return text.length>40&&(DRAFT_QUERY.test(String(message.query||""))||SUBJECT_LINE.test(text))&&DRAFT_ANSWER.test(text);
}

export function extractDraft(text){
 const raw=clean(text),subject=(raw.match(SUBJECT_LINE)||[])[1]||"",recipient=(raw.match(RECIPIENT_LINE)||[])[1]||"";
 const lines=raw.split("\n");
 let start=lines.findIndex(l=>DRAFT_ANSWER.test(l));
 if(start<0)start=0;
 const body=[];
 for(const line of lines.slice(start)){
  if(META_LINE.test(line)||INTRO_LINE.test(line))continue;
  if(/^\s*(?:---|___|\*\*\*)\s*$/.test(line)){if(body.some(Boolean))break;continue;}
  if(NOTE_LINE.test(line)&&body.some(Boolean))break;
  body.push(line);
 }
 const draft=body.join("\n").replace(/\n{3,}/g,"\n\n").trim();
 const greeting=(draft.match(/^\s*([^\s，,：:]{1,24}?)\s*(?:您好|你好)/)||[])[1]||"";
 return {subject:subject.trim(),recipient:recipient.trim(),greeting,draft};
}

const firstMatch=(texts,re)=>{for(const t of texts){const m=String(t||"").match(re);if(m)return m[0];}return "";};

export function buildDraftHandoffPlan(chat,model,{locale="zh-TW",fallbackProjectId=null}={}){
 const messages=Array.isArray(chat)?chat:[];
 const draftMessage=[...messages].reverse().find(isDraftAnswer);
 if(!draftMessage)return {ok:false,reason:locale==="en"?"No Copilot draft to hand off.":"找不到可交辦的 AI 草稿。"};
 const answers=messages.filter(m=>m.role==="assistant"&&m.mode==="gpt"&&m.text).map(m=>m.text);
 const texts=[draftMessage.text,...answers.slice().reverse()];
 const projectId=draftMessage.context?.selectedProjectId||firstMatch(texts,/\bPRJ-\d{3,6}\b|\bJOB-\d{3,6}\b/)||fallbackProjectId;
 const project=model?.project?.(projectId);
 if(!project)return {ok:false,reason:locale==="en"?"The draft is not linked to a project yet.":"這份草稿還沒有對應到專案。"};
 // A change request names the thing being discussed most precisely, then an approval, then a work order.
 const recordId=[/\bCHG-[A-Z0-9-]{2,24}\b/,/\bAPR-[A-Z0-9-]{2,24}\b/,/\b(?:PR)?WO-[A-Z0-9-]{2,24}\b/,/\bQ-[A-Z0-9-]{2,24}\b/].map(re=>firstMatch(texts,re)).find(Boolean)||project.id;
 const {subject,recipient,greeting,draft}=extractDraft(draftMessage.text);
 if(draft.length<20)return {ok:false,reason:locale==="en"?"The draft is too short to hand off.":"草稿內容太短，無法交辦。"};
 const contact=(recipient||greeting||project.manager||"").replace(/[，,].*$/,"").slice(0,80)||project.manager;
 const stripProject=s=>String(s||"").replace(new RegExp("\\b"+project.id+"\\b","g"),"").replace(project.name,"").replace(String(project.name).split(" · ")[0],"").replace(/^[\s·｜|,，:：-]+/,"").trim();
 const title=(stripProject(subject)||(locale==="en"?"Copilot draft follow-up":"助理草稿追蹤")).slice(0,100);
 const sourceIds=[...new Set((Array.isArray(draftMessage.sources)?draftMessage.sources:[]).concat(...messages.filter(m=>m.role==="assistant").map(m=>Array.isArray(m.sources)?m.sources:[])))].filter(x=>typeof x==="string").slice(0,6);
 const question=(messages.find(m=>m.role==="user"&&m.text)?.text||"").replace(/\s+/g," ").slice(0,90);
 const rationaleZh=(question?"源自這個問題：「"+question+"」。":"")+"StrideBrain 助理已依紀錄擬好詢問草稿，請修改並確認後再寄出。";
 const rationaleEn=(question?"From the question: \""+question+"\". ":"")+"StrideBrain prepared this draft from the records; edit and approve it before sending.";
 return {ok:true,plan:{
  agentId:"project-coordinator",modelLabel:"StrideBrain 助理",
  summary:locale==="en"?"Handed off from a StrideBrain Copilot draft.":"由 StrideBrain 助理的草稿交辦。",
  timeline:[{tool:"copilot_draft",status:"done",label:locale==="en"?"Received the Copilot draft":"已接收助理草稿"}],
  proposals:[{
   projectId:project.id,recordId,contact,title,
   sourceIds:sourceIds.length?sourceIds:[project.id],
   draftZh:draft.slice(0,600),draftEn:draft.slice(0,600),
   rationale:locale==="en"?rationaleEn:rationaleZh,
   coordination:{signal:"recorded_follow_up",recordedOwner:contact}
  }]
 }};
}
