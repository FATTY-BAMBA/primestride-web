import {ToolLoopAgent,isStepCount,tool} from "ai";
import {createOpenAICompatible} from "@ai-sdk/openai-compatible";
import {z} from "zod";
import {runCopilotTool,workspaceEvidenceSeed,validIndustry} from "./copilot-tools.js";

const sourcePattern=/^(?:REG-)?(?:PRJ|JOB|Q|WO|APR|DOC|STD|PRQ|PRWO|PRAPR|PRDOC|PRSTD)-[A-Z0-9-]+$/;
const bounded=(value,max)=>String(value??"").trim().slice(0,max);
const unique=xs=>[...new Set(xs.filter(Boolean))];
const AGENT_CONFIG={
 "operations-assistant":{
  opening:"list_priorities",
  tools:["list_priorities","get_project","get_source","propose_followup"],
  role:"StrideBrain Operations Assistant",
  rules:[
   "Focus on the current workspace priority shortlist.",
   "Prepare practical internal follow-ups for the most useful items."
  ]
 },
 "project-coordinator":{
  opening:"list_priorities",
  tools:["list_priorities","get_project","get_source","propose_followup"],
  role:"StrideBrain Project Coordinator",
  rules:[
   "Focus on recorded blockers, due dates, pending approvals and handoffs.",
   "Inspect project context before proposing coordination work.",
   "Do not infer undocumented dependencies or approval authority."
  ]
 },
 "quote-margin-guardian":{
  opening:"review_quotations",
  tools:["review_quotations","get_quote","get_project","get_source","propose_followup"],
  role:"StrideBrain Quote & Margin Guardian",
  rules:[
   "Focus on recorded quotation versions, direct costs and calculated gross margins.",
   "Inspect the quotation record before proposing review work.",
   "Use calculated/proposed margin language. Do not claim realized profit, realized loss, cause, or comparable scope unless explicitly recorded."
  ]
 }
};

function modelFor({apiKey,modelId,fetchImpl}){
 const provider=createOpenAICompatible({
  name:"openrouter",
  apiKey,
  baseURL:"https://openrouter.ai/api/v1",
  includeUsage:true,
  fetch:fetchImpl,
  headers:{"HTTP-Referer":"https://demo.primestrideai.com","X-Title":"StrideBrain Internal Demo"}
 });
 return provider.chatModel(modelId);
}
function projectExists(industry,id){return workspaceEvidenceSeed(industry).projects.some(p=>p.id===id);}
function validSource(industry,id){
 if(!sourcePattern.test(id))return false;
 const x=runCopilotTool(industry,"get_source",{source_id:id});
 return x?.found!==false&&Boolean(x?.id);
}
function timelineLabel(toolName,locale,detail=""){
 const zh=locale!=="en";
 const map={
  list_priorities:zh?"已查閱目前優先紀錄":"Reviewed current priority records",
  review_quotations:zh?"已檢查報價版本、成本與試算毛利":"Reviewed quote versions, costs and calculated margins",
  get_project:(zh?"已查閱專案 ":"Reviewed project ")+detail,
  get_quote:(zh?"已查閱報價 ":"Reviewed quotation for ")+detail,
  get_source:(zh?"已讀取依據 ":"Read evidence ")+detail,
  propose_followup:zh?"已準備一項需批准的追蹤工作":"Prepared an approval-required follow-up"
 };
 return map[toolName]||toolName;
}

export async function runAgentPlanner({
 industry,goal,locale="zh-TW",agentId="operations-assistant",modelId,apiKey,languageModel,fetchImpl
}){
 if(!validIndustry(industry))throw Error("INVALID_INDUSTRY");
 const config=AGENT_CONFIG[agentId];
 if(!config)throw Error("UNSUPPORTED_AGENT");
 const timeline=[],proposals=[];
 const allTools={
  list_priorities:tool({
   description:"Review the current workspace priority shortlist. Read-only; not an overall business-impact ranking.",
   inputSchema:z.object({limit:z.number().int().min(1).max(5).default(3)}),
   execute:async({limit})=>{
    timeline.push({tool:"list_priorities",status:"completed",label:timelineLabel("list_priorities",locale)});
    return runCopilotTool(industry,"list_priorities",{limit});
   }
  }),
  review_quotations:tool({
   description:"Compare recorded quote versions, direct costs and calculated margins from the same snapshot as the overview. Read-only. Does not prove realized loss, cause or comparable scope.",
   inputSchema:z.object({}),
   execute:async()=>{
    timeline.push({tool:"review_quotations",status:"completed",label:timelineLabel("review_quotations",locale)});
    return runCopilotTool(industry,"review_quotations",{});
   }
  }),
  get_project:tool({
   description:"Read one project and its current task, approval, document and latest quote context. Read-only.",
   inputSchema:z.object({project_id:z.string().regex(/^(PRJ|JOB)-\d{1,8}$/)}),
   execute:async({project_id})=>{
    timeline.push({tool:"get_project",status:"completed",label:timelineLabel("get_project",locale,project_id)});
    return runCopilotTool(industry,"get_project",{project_id});
   }
  }),
  get_quote:tool({
   description:"Read the current draft quotation and version history for one project. Recorded values only, not revenue or realized profit.",
   inputSchema:z.object({project_id:z.string().regex(/^(PRJ|JOB)-\d{1,8}$/)}),
   execute:async({project_id})=>{
    timeline.push({tool:"get_quote",status:"completed",label:timelineLabel("get_quote",locale,project_id)});
    return runCopilotTool(industry,"get_quote",{project_id});
   }
  }),
  get_source:tool({
   description:"Read one exact source record or document before relying on a detailed claim.",
   inputSchema:z.object({source_id:z.string().max(90)}),
   execute:async({source_id})=>{
    timeline.push({tool:"get_source",status:"completed",label:timelineLabel("get_source",locale,source_id)});
    return runCopilotTool(industry,"get_source",{source_id});
   }
  }),
  propose_followup:tool({
   description:"Submit one bounded internal proposal after reviewing evidence. This never creates a task or sends a message. StrideBrain validates it and requires human approval before internal task creation.",
   inputSchema:z.object({
    project_id:z.string().regex(/^(PRJ|JOB)-\d{1,8}$/),
    record_id:z.string().min(3).max(90),
    contact:z.string().min(1).max(80),
    title:z.string().min(2).max(120),
    rationale:z.string().min(5).max(320),
    source_ids:z.array(z.string().max(90)).min(1).max(6),
    draft_zh:z.string().min(5).max(600),
    draft_en:z.string().min(5).max(600)
   }),
   execute:async(input)=>{
    if(proposals.length>=3)return {accepted:false,reason:"proposal_limit"};
    if(!projectExists(industry,input.project_id))return {accepted:false,reason:"unknown_project"};
    if(agentId==="quote-margin-guardian"&&!/^Q-[A-Z0-9-]+$/.test(input.record_id))return {accepted:false,reason:"quotation_record_required"};
    const sourceIds=unique(input.source_ids).filter(id=>validSource(industry,id));
    if(!sourceIds.length)return {accepted:false,reason:"no_valid_evidence"};
    const proposal={
     projectId:input.project_id,recordId:bounded(input.record_id,90),contact:bounded(input.contact,80),
     title:bounded(input.title,120),rationale:bounded(input.rationale,320),sourceIds,
     draftZh:bounded(input.draft_zh,600),draftEn:bounded(input.draft_en,600)
    };
    proposals.push(proposal);
    timeline.push({tool:"propose_followup",status:"prepared",label:timelineLabel("propose_followup",locale)});
    return {accepted:true,index:proposals.length,sourceIds};
   }
  })
 };
 const tools=Object.fromEntries(config.tools.map(name=>[name,allTools[name]]));
 const instructions=[
  "You are the "+config.role+" planning engine for a synthetic Taiwan SME demo workspace.",
  "Use tools before proposing company-specific work. Never invent project IDs, contacts, dates, costs, margins or evidence.",
  "You have no execution authority. propose_followup only prepares a proposal; it never creates or sends anything.",
  "Start by calling "+config.opening+".",
  ...config.rules,
  "Prepare at most three useful proposals, each grounded in source_ids returned by tools.",
  "Do not propose payments, quotation approval, business-record edits or external message sending.",
  locale==="en"?"Use concise English in drafts.":"Use natural Taiwan Traditional Chinese in draft_zh."
 ].join(" ");
 const agent=new ToolLoopAgent({
  model:languageModel||modelFor({apiKey,modelId,fetchImpl}),
  instructions,
  tools,
  stopWhen:isStepCount(8)
 });
 const result=await agent.generate({prompt:bounded(goal,800)||"Review the workspace and prepare the most useful approval-required work."});
 return {
  mode:"agent-plan",agentId,modelId,summary:bounded(result.text,1200),proposals,timeline,
  steps:result.steps?.length||0,asOf:workspaceEvidenceSeed(industry).meta.date,
  executionPolicy:{automatic:["read_records","draft"],approval:["create_internal_task"],blocked:["send_external_message","modify_business_records","approve_quote","payment"]}
 };
}
