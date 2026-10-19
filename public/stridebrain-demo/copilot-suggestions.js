/**
 * Conversation entry points that mirror real recurring SME decisions.
 * Labels are compact; prompts are explicit, honest about the dated sample data.
 * All suggestions are read-only, work in deterministic sample mode, and can be
 * answered with tools once the optional AI model connection is configured.
 */
export const QUICK_ACTIONS=Object.freeze([
 Object.freeze({id:"numbers",label:"Today's numbers",glyph:"◷",description:"Snapshot of quotations and operational priorities",prompts:{
  interior:"What needs my attention in our fictional operations snapshot? Include pending approvals, blocked work and quote activity.",
  printing:"Give me today's numbers from the fictional print-shop snapshot: jobs, blocked production work, approvals and quote activity."
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
  interior:"What is our overall weighted proposed gross margin across the latest fictional renovation quotations?",
  printing:"What is our overall weighted proposed gross margin across the latest fictional print quotations?"
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
export function quickActionsFor(industry){
 const key=industry==="printing"?"printing":"interior";
 return QUICK_ACTIONS.map(({id,label,glyph,description,prompts})=>({id,label,glyph,description,prompt:prompts[key]}));
}
export function ideasFor(industry){return INDUSTRY_IDEAS[industry==="printing"?"printing":"interior"].map(item=>({...item}));}

/**
 * Contextual next questions, derived from the user's current topic and safe
 * read-only workflow signals. Never imply a message was sent or quote approved.
 */
export function followUpsFor(lastQuestion="",industry="interior",actions=[]){
 const q=String(lastQuestion||"").toLowerCase();
 const a=new Set(Array.isArray(actions)?actions:[]);
 let prompts;
 if(/quote|quotation|estimate|margin|成本|報價|毛利|financial/.test(q)||a.has("quotes")||a.has("history")){
  prompts=[
   ["Review cost evidence","Which approved or historical source records support this quotation, and what remains unverified?"],
   ["Compare alternatives","Which comparable completed fictional jobs could inform the estimate? Explain the limitations."],
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
   ["Explore costs","What do the latest fictional quotations and historical costs tell us?"],
   ["Plan next actions",industry==="printing"?"What should the print production team check next?":"What should the renovation project team check next?"]
  ];
 }
 return prompts.map(([label,prompt])=>({label,prompt}));
}
