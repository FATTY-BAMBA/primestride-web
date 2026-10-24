import {buildConversationEvidence,createEvidenceLedger} from "./conversation-evidence.js";
import {needsPriorityReview,citedSourceIds,verifiedAnswer,requirePriorityCitations} from "./answer-quality.js";
/**
 * OpenRouter multi-model adapter for StrideBrain's INTERNAL synthetic Copilot.
 *
 * The OpenRouter Chat Completions API returns assistant tool_calls, followed
 * by application-executed tool replies. Both sides share the server-only
 * read-only company tool registry and a strict model allowlist.
 *
 * No live customer/private tenant data or browser-uploaded files are used.
 * No automatic action/sending tools are exposed.
 */
import {copilotTools,runCopilotTool,toolsForSourceIds,validIndustry,allowedActionsFromTools,toolNames} from "./copilot-tools.js";
import {COPILOT_INSTRUCTIONS,normaliseMessages} from "./copilot-runner.js";
import {findAllowedModel} from "../../../public/stridebrain-demo/model-catalog.js";
import {copilotLanguageDirective} from "./copilot-locale.js";

const MAX_TOOL_ROUNDS=3;
const MAX_TOOL_CALLS_PER_ROUND=3;
const MAX_OUTPUT_CHARS=3800;
const MAX_TOOL_RESULT_CHARS=14000;
const MAX_REASONING_MESSAGE_CHARS=6000;
export const OPENROUTER_CHAT_URL="https://openrouter.ai/api/v1/chat/completions";
const unique=items=>[...new Set(items)];
const toolSchema=copilotTools.map(item=>({
 type:"function",
 function:{name:item.name,description:item.description,parameters:item.parameters}
}));
function parseToolArguments(raw){
 if(typeof raw!=="string"||raw.length>1800)return {};
 try{const obj=JSON.parse(raw);return obj&&typeof obj==="object"&&!Array.isArray(obj)?obj:{};}catch{return {};}
}
function takeAnswer(message){
 if(typeof message?.content==="string")return message.content.slice(0,MAX_OUTPUT_CHARS).trim();
 if(Array.isArray(message?.content))return message.content
  .filter(part=>part&&part.type==="text"&&typeof part.text==="string")
  .map(part=>part.text).join("\n").slice(0,MAX_OUTPUT_CHARS).trim();
 return "";
}
function citationValidation(industry,ids,answer){
 const sourceIds=toolsForSourceIds(industry,citedSourceIds(answer,ids));
 return {sourceIds,answer:verifiedAnswer(answer,sourceIds)};
}
export async function callOpenRouter(payload,{apiKey,requestFn=fetch,timeout=24000}={}){
 if(typeof apiKey!=="string"||apiKey.length<8)throw Error("OpenRouter is not configured.");
 const ctrl=new AbortController(),timeoutId=setTimeout(()=>ctrl.abort(),timeout);
 try{
  const response=await requestFn(OPENROUTER_CHAT_URL,{
   method:"POST",
   headers:{
    "Authorization":"Bearer "+apiKey,
    "Content-Type":"application/json",
    "HTTP-Referer":"https://www.primestrideai.com",
    "X-Title":"StrideBrain · Internal SME demo"
   },
   signal:ctrl.signal,
   body:JSON.stringify(payload)
  });
  if(!response.ok){
   const status=response.status;
   // Record only safe provider error classifications, never the raw message.
   let providerReason="unknown";
   if(status===400||status===422){
    try{
     const detail=await response.json();
     const message=String(detail?.error?.message||"").toLowerCase();
     if(/tool_choice|required tool|tool call/.test(message))providerReason="tool_choice";
     else if(/schema|parameters|function|strict/.test(message))providerReason="tool_schema";
     else if(/temperature|parallel_tool_calls|max_tokens|unsupported parameter/.test(message))providerReason="optional_parameter";
     else if(/model/.test(message))providerReason="model_compatibility";
    }catch{}
   }
   const code=status===401?"PROVIDER_AUTH":status===402?"PROVIDER_CREDITS":status===403?"PROVIDER_ACCESS":status===404?"MODEL_UNAVAILABLE":status===408||status===504?"PROVIDER_TIMEOUT":status===429?"PROVIDER_RATE_LIMIT":status===400||status===422?"MODEL_REQUEST_REJECTED":"PROVIDER_FAILURE";
   // OpenRouter distinguishes platform-side 429s from upstream provider capacity.
   // Record only a safe classification; never surface raw provider error text.
   let origin="unknown";
   if(status===429){
    const hasPlatformRateHeaders=response.headers?.has?.("x-ratelimit-limit")||response.headers?.has?.("x-ratelimit-remaining");
    if(hasPlatformRateHeaders)origin="openrouter";
    else {
     try{
      const payload=await response.json();
      if(payload?.error?.metadata?.provider_code)origin="upstream_provider";
     }catch{}
    }
   }
   const rateCode=status===429?(origin==="openrouter"?"OPENROUTER_RATE_LIMIT":origin==="upstream_provider"?"UPSTREAM_CAPACITY":"PROVIDER_RATE_LIMIT"):code;
   throw Object.assign(Error("Provider request failed."),{copilotCode:rateCode,providerStatus:status,rateLimitOrigin:origin,providerReason});
  }
  const data=await response.json();
  if(!Array.isArray(data?.choices)||!data.choices[0]?.message)
   throw Object.assign(Error("Unexpected provider response."),{copilotCode:"PROVIDER_BAD_RESPONSE"});
  return data;
 }catch(error){
  if(error?.name==="AbortError")throw Object.assign(Error("Provider timed out."),{copilotCode:"PROVIDER_TIMEOUT"});
  throw error;
 }finally{clearTimeout(timeoutId);}
}
/** Stream only the final answer, after the server has completed its read-only tool calls.
 * Never stream unvalidated citations as trusted links; the final result is validated separately.
 */
export async function streamOpenRouterFinal(payload,{apiKey,onDelta,requestFn=fetch,timeout=30000}={}){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
 let answer="",buffer="";
 try{
  const response=await requestFn(OPENROUTER_CHAT_URL,{
   method:"POST",signal:ctrl.signal,
   headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json","Accept":"text/event-stream",
    "HTTP-Referer":"https://www.primestrideai.com","X-Title":"StrideBrain · Internal SME demo"},
   body:JSON.stringify({...payload,stream:true,tool_choice:undefined,tools:undefined})
  });
  if(!response.ok)throw Object.assign(Error("Streaming provider request failed."),{copilotCode:response.status===429?"PROVIDER_RATE_LIMIT":"PROVIDER_FAILURE",providerStatus:response.status});
  if(!response.body)throw Error("Provider returned no streaming body.");
  const reader=response.body.getReader(),decoder=new TextDecoder();
  let done=false;
  while(!done){
   const part=await reader.read();if(part.done)break;
   buffer+=decoder.decode(part.value,{stream:true}).replace(/\r\n/g,"\n");
   if(buffer.length>100000)throw Error("Provider stream buffer exceeded limit.");
   let end;
   while((end=buffer.indexOf("\n\n"))>=0){
    const event=buffer.slice(0,end);buffer=buffer.slice(end+2);
    for(const line of event.split("\n")){
     if(!line.startsWith("data:"))continue;
     const data=line.slice(5).trim();
     if(data==="[DONE]"){done=true;break;}
     let chunk;try{chunk=JSON.parse(data);}catch{continue;}
     if(chunk.error)throw Error("Provider stream reported an error.");
     const delta=chunk.choices?.[0]?.delta?.content;
     const text=typeof delta==="string"?delta:Array.isArray(delta)?delta.filter(x=>x.type==="text").map(x=>x.text||"").join(""):"";
     if(text){
      const remaining=MAX_OUTPUT_CHARS-answer.length;
      if(remaining>0){const safe=text.slice(0,remaining);answer+=safe;onDelta?.(safe);}
     }
    }
   }
  }
  if(!done)throw Error("Provider stream ended without completion.");
  if(!answer.trim())throw Error("Provider returned no streaming answer.");
  return answer.trim();
 }catch(error){
  if(error?.name==="AbortError")throw Object.assign(Error("Provider stream timed out."),{copilotCode:"PROVIDER_TIMEOUT"});
  throw error;
 }finally{clearTimeout(timer);}
}

/**
 * Mockable for unit tests: requestModel(payload) returns OpenRouter-shaped
 * {choices:[{message:{role:"assistant",content,tool_calls}}]}.
 */
export async function runOpenRouterCopilot({industry,messages,modelId,apiKey,requestModel,onDelta,onStatus,locale}){
 const selected=findAllowedModel(modelId);
 if(!selected||selected.provider!=="openrouter")throw Error("This model is not in the OpenRouter allowlist.");
 if(!validIndustry(industry))throw Error("Invalid demo industry.");
 const recent=normaliseMessages(messages);
 if(!recent.length||recent.at(-1)?.role!=="user")throw Error("A new question is required.");
 let providerCalls=0;const deadline=Date.now()+45000;
 const ask=async payload=>{if(++providerCalls>4)throw Error("Provider call limit exceeded.");const remaining=deadline-Date.now();if(remaining<500)throw Object.assign(Error("Response deadline exceeded."),{copilotCode:"PROVIDER_TIMEOUT"});return (requestModel||((p)=>callOpenRouter(p,{apiKey,timeout:Math.min(24000,remaining)})))(payload);};
 const ledger=createEvidenceLedger(industry),conversation=buildConversationEvidence(industry,recent);ledger.add(conversation);
 const chat=[
  {role:"system",content:COPILOT_INSTRUCTIONS+"\nProvider: OpenRouter. The model is a reasoning interface to server-executed read-only tools, not an authoritative business record.\n"+copilotLanguageDirective(recent,locale)},
  ...recent
 ];
 const review=needsPriorityReview(recent)?runCopilotTool(industry,"list_priorities",{limit:3}):null;
 if(review?.error)throw Error("Priority evidence review unavailable.");
 if(review)ledger.add(review);
 // Server-executed read-only review, not a fabricated model answer.
 if(review)chat.push({role:"assistant",content:null,tool_calls:[{id:"server_priority_review",type:"function",function:{name:"list_priorities",arguments:'{"limit":3}'}}]},
  {role:"tool",tool_call_id:"server_priority_review",content:JSON.stringify(review)});
 chat.push({role:"assistant",content:null,tool_calls:[{id:"server_conversation_context",type:"function",function:{name:"conversation_context",arguments:'{}'}}]},
  {role:"tool",tool_call_id:"server_conversation_context",content:JSON.stringify(conversation)});
 let usedTools=review?["list_priorities"]:[],recordIds=review?[...review.sourceIds]:[],answer="",totalCalls=0,round=0;
 for(;round<MAX_TOOL_ROUNDS;round++){
  if(round>0&&usedTools.length&&onDelta&&!requestModel){
   onStatus?.("Writing an evidence-grounded answer…");
   if(++providerCalls>4)throw Error("Provider call limit exceeded.");
   answer=await streamOpenRouterFinal({model:selected.id,messages:[...chat,{role:"system",content:"Now provide the final answer using the tool evidence already supplied. Cite only provided source IDs and do not call more tools."}],max_tokens:1800},{apiKey,timeout:Math.max(500,Math.min(30000,deadline-Date.now()))}); // Buffer until identity and citation checks pass.
   break;
  }
  onStatus?.("Finding relevant business records…");
  const result=await ask({
   model:selected.id,
   messages:chat,
   tools:toolSchema,
   tool_choice:"auto",
   max_tokens:1800,
   stream:false
  });
  const assistant=result?.choices?.[0]?.message;
  if(!assistant||assistant.role!=="assistant")throw Error("Invalid model response.");
  const calls=Array.isArray(assistant.tool_calls)?assistant.tool_calls:[];
  if(calls.length>MAX_TOOL_CALLS_PER_ROUND)throw Error("Tool request limit exceeded.");
  // Initial tool call is required. Models unable to obey are not accepted for this workflow.
  if(!calls.length){
   // Fresh server context already exists; a supported answer or clarification needs no redundant model tool call.
   answer=takeAnswer(assistant);
   if(answer)break;
   throw Error("OpenRouter returned no usable answer.");
  }
  const safeCalls=[];
  for(const raw of calls){
   const id=String(raw?.id||"").slice(0,128),name=String(raw?.function?.name||"");
   if(raw?.type!=="function"||!id||id.length<3)throw Error("Malformed function call");
   if(!toolNames.includes(name))throw Error("The model requested a tool outside the approved list.");
   safeCalls.push({id,type:"function",function:{name,arguments:String(raw.function.arguments||"{}").slice(0,1800)}});
  }
  totalCalls+=safeCalls.length;
  if(totalCalls>8)throw Error("Too many tool requests.");
  // Some reasoning models include reasoning_details on a tool call.
  // Preserve it for the immediate next provider call when safe/bounded.
  const assistantForHistory={role:"assistant",content:assistant.content??null,tool_calls:safeCalls};
  if(assistant.reasoning_details&&JSON.stringify(assistant.reasoning_details).length<MAX_REASONING_MESSAGE_CHARS)
   assistantForHistory.reasoning_details=assistant.reasoning_details;
  chat.push(assistantForHistory);
  for(const call of safeCalls){
   const args=parseToolArguments(call.function.arguments);
   const fact=runCopilotTool(industry,call.function.name,args);
   onStatus?.("Verified "+usedTools.length+" business lookups. Preparing answer…");
   usedTools.push(call.function.name);ledger.add(fact);
   recordIds.push(...(Array.isArray(fact.sourceIds)?fact.sourceIds:[]));
   if(Array.isArray(fact.matches))
    recordIds.push(...fact.matches.map(x=>x.id).filter(Boolean));
   chat.push({role:"tool",tool_call_id:call.id,content:JSON.stringify(fact).slice(0,MAX_TOOL_RESULT_CHARS)});
  }
 }
 if(!answer&&round>=MAX_TOOL_ROUNDS){
  const final=await ask({
   model:selected.id,
   messages:[...chat,{role:"system",content:"Conclude now from previously supplied tool evidence. Do not invent any new records or sources."}],
   tools:toolSchema,
   tool_choice:"none",
   max_tokens:1400,
   stream:false
  });
  const msg=final?.choices?.[0]?.message;
  if(Array.isArray(msg?.tool_calls)&&msg.tool_calls.length)throw Error("Model attempted to call a tool after the limit.");
  answer=takeAnswer(msg);
 }
 if(!answer)throw Error("The selected model produced no reliable answer.");
 const problems=ledger.issues(answer);
 if(problems.length){const fixed=await ask({model:selected.id,messages:[...chat,{role:"assistant",content:answer},{role:"system",content:ledger.repairInstruction(problems)}],tools:toolSchema,tool_choice:"none",max_tokens:1400,stream:false});answer=takeAnswer(fixed?.choices?.[0]?.message);if(!answer||ledger.issues(answer).length)throw Object.assign(Error("Answer evidence could not be verified."),{copilotCode:"EVIDENCE_MISSING"});}
 const cited=citationValidation(industry,ledger.sourceIds(),answer);
 requirePriorityCitations(conversation.clarificationRequired?null:review,cited.sourceIds);
 if(onDelta)onDelta(cited.answer);
 return {
  mode:"openrouter-readonly-demo",modelId:selected.id,modelLabel:selected.label,
  provider:"OpenRouter",answer:cited.answer,
  sourceIds:cited.sourceIds,
  actions:allowedActionsFromTools(usedTools),
  usedTools:unique(usedTools).slice(0,12),
  asOf:"2026-10-18",isSynthetic:true,noBusinessWrites:true,
  disclosure:"Source-linked fictional business snapshot. No actual sales, customer messages, approvals, job records or supplier commitments were changed."
 };
}
