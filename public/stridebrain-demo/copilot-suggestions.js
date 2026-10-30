/**
 * Conversation entry points that mirror real recurring SME decisions.
 * Labels are compact; prompts are explicit, honest about the dated sample data.
 * All suggestions are read-only, work in deterministic sample mode, and can be
 * answered with tools once the optional AI model connection is configured.
 */
export const QUICK_ACTIONS=Object.freeze([
 Object.freeze({id:"numbers",label:"This week's risks",glyph:"◷",description:"Blockers, near-term handoffs and approvals with evidence",prompts:{
  interior:"What should I worry about this week in the sample workspace? Prioritize recorded blockers, near-term due work or handoffs, and pending approvals. Cite the evidence for each.",
  printing:"What should I worry about this week in the sample print-shop workspace? Prioritize blocked production work, near-term deadlines or handoffs, and pending approvals. Cite the evidence for each."
 }}),
 Object.freeze({id:"quotes",label:"Quotes",glyph:"▧",description:"Dated quotation activity and review status",prompts:{
  interior:"How many quotations were marked sent on the sample snapshot date? Which current quotations need review?",
  printing:"How many print-job quotations were marked sent on the sample snapshot date? Which estimates need review?"
 }}),
 Object.freeze({id:"followups",label:"Follow-ups",glyph:"☎",description:"Prioritize approvals and stalled work",prompts:{
  interior:"Who should I follow up with first on our renovation projects, and why?",
  printing:"Who should I follow up with first on our print jobs, and why?"
 }}),
 Object.freeze({id:"suppliers",label:"Materials & suppliers",glyph:"⬡",description:"Example stock and supplier dependencies",prompts:{
  interior:"What should we check with material suppliers before making a project delivery promise?",
  printing:"Which sample printing suppliers and delivery lead-time assumptions need verification?"
 }}),
 Object.freeze({id:"financials",label:"Financials",glyph:"↗",description:"Explain proposed margins, never invent revenue",prompts:{
  interior:"What is our overall weighted proposed gross margin across the latest sample renovation quotations?",
  printing:"What is our overall weighted proposed gross margin across the latest sample print quotations?"
 }})
]);
const INDUSTRY_IDEAS={
 interior:[
  {label:"Review Songshan change",glyph:"◇",prompt:"Review the Songshan quartz countertop variation, its cost evidence and missing approvals."},
  {label:"Quote a new renovation",glyph:"◈",prompt:"Can we use similar completed renovation projects to estimate a new customer inquiry?"},
  {label:"Renovation rules",glyph:"▣",prompt:"Which Taiwan renovation rules should we check before releasing the updated drawing?"}
 ],
 printing:[
  {label:"Check A3 artwork",glyph:"▤",prompt:"What prepress checks are needed for a 500-piece A3 poster PDF, and which remain unverified?"},
  {label:"Quote a new print run",glyph:"◈",prompt:"Can we compare completed print jobs to prepare a new quotation for a 500-piece A3 order?"},
  {label:"Production blockers",glyph:"◇",prompt:"Which current print jobs are blocked and who should resolve their dependencies?"}
 ]
};
const ZH_SHORTCUTS={
 numbers:["本週風險","查看受阻、近期交接與待確認核准"],
 quotes:["報價狀況","查看報價與待確認事項"],
 followups:["追蹤待辦","優先處理卡關工作與審核"],
 suppliers:["材料與供應商","查詢材料與供應商風險"],
 financials:["財務與毛利","分析報價毛利與成本"]
};
const ZH_IDEAS={
 interior:[
  {label:"檢查松山變更單",prompt:"請用繁體中文整理松山石英檯面變更的成本依據與尚未核准事項。"},
  {label:"估算新裝修案件",prompt:"請用繁體中文說明如何參考已完成的室內裝修案例來估算新客戶詢價。"},
  {label:"查詢裝修規範",prompt:"請用繁體中文列出修訂圖面放行前應核對的台灣室內裝修規範及尚未確認事項。"}
 ],
 printing:[
  {label:"檢查 A3 印前文件",prompt:"請用繁體中文說明 500 張 A3 海報印刷的印前檢查與未確認事項。"},
  {label:"估算新印刷訂單",prompt:"請用繁體中文說明如何利用歷史印刷案件估算 500 張 A3 新訂單。"},
  {label:"找出印製卡關項目",prompt:"請用繁體中文指出目前有哪些印刷工作卡關，以及需要確認的依賴事項。"}
 ]
};
const ZH_QUICK_PROMPTS={
 interior:{
 numbers:"請用繁體中文整理這週最值得我擔心的三件事：受阻工作、近期到期或交接、待確認核准，並附上每項來源依據。",
 quotes:"請用繁體中文整理目前的報價數量、待確認版本及來源。",
 followups:"請用繁體中文整理裝修專案最值得優先追蹤的待辦與原因。",
 suppliers:"請用繁體中文指出材料供應商有哪些資訊尚待確認，切勿假設即時庫存。",
 financials:"請用繁體中文分析示範報價的預估毛利率與成本限制。"
 },
 printing:{
 numbers:"請用繁體中文整理這週最值得我擔心的三件印刷營運事項：受阻工作、近期交期或交接、待確認核准，並附上每項來源依據。",
 quotes:"請用繁體中文整理印刷訂單報價與待確認事項。",
 followups:"請用繁體中文說明應優先追蹤的印刷工單及原因。",
 suppliers:"請用繁體中文指出紙材、交期與供應商有哪些事項需要查證。",
 financials:"請用繁體中文分析印刷示範報價的成本與預估毛利率。"
 }
};
export function quickActionsFor(industry,locale="en"){
 const key=industry==="printing"?"printing":"interior";
 return QUICK_ACTIONS.map(({id,label,glyph,description,prompts})=>locale==="zh-TW"?{id,label:ZH_SHORTCUTS[id][0],glyph,description:ZH_SHORTCUTS[id][1],prompt:ZH_QUICK_PROMPTS[key][id]}:{id,label,glyph,description,prompt:prompts[key]});
}
export function ideasFor(industry,locale="en"){const key=industry==="printing"?"printing":"interior";return INDUSTRY_IDEAS[key].map((item,i)=>locale==="zh-TW"?{...item,...ZH_IDEAS[key][i]}:{...item});}

/**
 * Contextual next questions, derived from the user's current topic and safe
 * read-only workflow signals. Never imply a message was sent or quote approved.
 */
export function followUpsFor(lastQuestion="",industry="interior",actions=[],lastAnswer="",locale="en"){
 const answer=String(lastAnswer||"").slice(0,3800);
 const projectId=(answer.match(/\bPRJ-\d{3,6}\b/i)||[])[0]||"";
 const context=projectId?"For the sample project "+projectId+", ":"";
 const chinese=/[\u3400-\u9fff]/.test(String(lastQuestion||""))&&
  (String(lastQuestion||"").match(/[\u3400-\u9fff]/g)||[]).length>=4;

 const q=String(lastQuestion||"").toLowerCase();
 const a=new Set(Array.isArray(actions)?actions:[]);
 let prompts;
 if(/quote|quotation|estimate|margin|成本|報價|毛利|financial/.test(q)||a.has("quotes")||a.has("history")){
  prompts=[
   ["Review cost evidence","Which approved or historical source records support this quotation, and what remains unverified?"],
   ["Compare alternatives","Which comparable completed sample jobs could inform the estimate? Explain the limitations."],
   ["Identify approval gaps","What approvals are missing before this quotation could be released?"]
  ];
 }else if(/supplier|material|vendor|stock|paper|供應商|材料|紙材|交期/.test(q)||a.has("suppliers")){
  prompts=[
   ["Supplier risks","Which supplier assumptions or lead times require confirmation?"],
   ["Affected work","Which projects or production orders might be affected by those risks?"],
   ["Draft a request","Draft an unsent message asking the relevant supplier to confirm availability and timing."]
  ];
 }else if(/approval|blocked|delay|priority|follow|待辦|卡住|進度|核准/.test(q)||a.has("approvals")){
  prompts=[
   ["Root causes","What source-linked issues are blocking the highest-priority project?"],
   ["Deadline exposure","Which unresolved items might threaten the earliest target date?"],
   ["Draft follow-up","Draft an unsent follow-up to the responsible team member in a professional tone."]
  ];
 }else{
  prompts=[
   ["Investigate blockers","Which approvals or blocked work items deserve attention first?"],
   ["Explore costs","What do the latest sample quotations and historical costs tell us?"],
   ["Plan next actions",industry==="printing"?"What should the print production team check next?":"What should the renovation project team check next?"]
  ];
 }
 if(context){
  prompts=prompts.map(([label,prompt])=>[label,context+prompt.charAt(0).toLowerCase()+prompt.slice(1)]);
 }
 if(chinese||locale==="zh-TW"){
  const zhLabels={
   "Review cost evidence":"查看成本來源","Compare alternatives":"比較歷史案例","Identify approval gaps":"確認核准缺口",
   "Supplier risks":"供應商風險","Affected work":"影響哪些工作","Draft a request":"草擬詢價訊息",
   "Root causes":"找出卡關原因","Deadline exposure":"查看交期風險","Draft follow-up":"草擬追蹤訊息",
   "Investigate blockers":"查看待處理事項","Explore costs":"分析報價成本","Plan next actions":"規劃下一步"
  };
  prompts=prompts.map(([label,prompt])=>[zhLabels[label]||label,"請用繁體中文回答："+prompt]);
 }
 return prompts.map(([label,prompt])=>({label,prompt}));
}
