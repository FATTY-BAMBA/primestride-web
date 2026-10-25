import {ToolLoopAgent,isStepCount,tool} from "ai";
import {createOpenAICompatible} from "@ai-sdk/openai-compatible";
import {z} from "zod";
import {runCopilotTool,workspaceEvidenceSeed,validIndustry} from "./copilot-tools.js";

const sourcePattern=/^(?:REG-)?(?:PRJ|JOB|Q|WO|APR|DOC|STD|PRQ|PRWO|PRAPR|PRDOC|PRSTD)-[A-Z0-9-]+$/;
const bounded=(value,max)=>String(value??"").trim().slice(0,max);
const unique=xs=>[...new Set(xs.filter(Boolean))];

function modelFor({apiKey,modelId,fetchImpl}){
 const provider=createOpenAICompatible({
  name:"openrouter",
  apiKey,
  baseURL:"https://openrouter.ai/api/v1",
  includeUsage:true,
  fetch:fetchImpl,
  headers:{
   "HTTP-Referer":"https://demo.primestrideai.com",
   "X-Title":"StrideBrain Internal Demo"
  }
 });
 return provider.chatModel(modelId);
}

function projectExists(industry,id){return workspaceEvidenceSeed(industry).projects.some(p=>p.id===id);}
function validSource(industry,id){
 if(!sourcePattern.test(id))return false;
 const x=runCopilotTool(industry,"get_source",{source_id:id});
 return x?.found!==false&&Boolean(x?.id);
}

export async function runAgentPlanner({
 industry,goal,locale="zh-TW",agentId="operations-assistant",modelId,apiKey,languageModel,fetchImpl
}){
 if(!validIndustry(industry))throw Error("INVALID_INDUSTRY");
 if(agentId!=="operations-assistant")throw Error("UNSUPPORTED_AGENT");
 const timeline=[],proposals=[];
 const tools={
  list_priorities:tool({
   description:"Review the current workspace priority shortlist before proposing follow-up work. This is read-only and not an overall business-impact ranking.",
   inputSchema:z.object({limit:z.number().int().min(1).max(5).default(3)}),
   execute:async({limit})=>{
    timeline.push({tool:"list_priorities",status:"completed",label:locale==="en"?"Reviewed current priority records":"已查閱目前優先紀錄"});
    return runCopilotTool(industry,"list_priorities",{limit});
   }
  }),
  get_project:tool({
   description:"Read one project and its current task, approval, document and quote context. Read-only.",
   inputSchema:z.object({project_id:z.string().regex(/^(PRJ|JOB)-\d{1,8}$/)}),
   execute:async({project_id})=>{
    timeline.push({tool:"get_project",status:"completed",label:(locale==="en"?"Reviewed project ":"已查閱專案 ")+project_id});
    return runCopilotTool(industry,"get_project",{project_id});
   }
  }),
  get_source:tool({
   description:"Read one exact source record or document before relying on a detailed claim.",
   inputSchema:z.object({source_id:z.string().max(90)}),
   execute:async({source_id})=>{
    timeline.push({tool:"get_source",status:"completed",label:(locale==="en"?"Read evidence ":"已讀取依據 ")+source_id});
    return runCopilotTool(industry,"get_source",{source_id});
   }
  }),
  propose_followup:tool({
   description:"Submit one bounded internal follow-up proposal after reviewing evidence. This does NOT create a task or send a message. StrideBrain will validate it and require human approval before any internal task is created.",
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
    const sourceIds=unique(input.source_ids).filter(id=>validSource(industry,id));
    if(!sourceIds.length)return {accepted:false,reason:"no_valid_evidence"};
    const proposal={
     projectId:input.project_id,recordId:bounded(input.record_id,90),contact:bounded(input.contact,80),
     title:bounded(input.title,120),rationale:bounded(input.rationale,320),sourceIds,
     draftZh:bounded(input.draft_zh,600),draftEn:bounded(input.draft_en,600)
    };
    proposals.push(proposal);
    timeline.push({tool:"propose_followup",status:"prepared",label:locale==="en"?"Prepared an approval-required follow-up":"已準備一項需批准的追蹤工作"});
    return {accepted:true,index:proposals.length,sourceIds};
   }
  })
 };
 const instructions=[
  "You are the StrideBrain Operations Assistant planning engine for a synthetic Taiwan SME demo workspace.",
  "Use tools before proposing company-specific work. Never invent project IDs, contacts, dates, costs or evidence.",
  "You have no execution authority. propose_followup only prepares a proposal; it never creates or sends anything.",
  "Start by calling list_priorities. Inspect project or source evidence when needed.",
  "Prepare at most three useful follow-ups, each grounded in source_ids returned by tools.",
  "Do not propose payments, quotation approval, customer/vendor record edits or external message sending.",
  locale==="en"?"Use concise English in drafts.":"Use natural Taiwan Traditional Chinese in draft_zh."
 ].join(" ");
 const agent=new ToolLoopAgent({
  model:languageModel||modelFor({apiKey,modelId,fetchImpl}),
  instructions,
  tools,
  stopWhen:isStepCount(7)
 });
 const result=await agent.generate({prompt:bounded(goal,800)||"Review today's operational priorities and prepare the most useful follow-ups."});
 return {
  mode:"agent-plan",
  agentId,
  modelId,
  summary:bounded(result.text,1200),
  proposals,
  timeline,
  steps:result.steps?.length||0,
  asOf:workspaceEvidenceSeed(industry).meta.date,
  executionPolicy:{automatic:["read_records","draft"],approval:["create_internal_task"],blocked:["send_external_message","modify_business_records","approve_quote","payment"]}
 };
}
