import { NextResponse } from "next/server";
import {tokenMatches,isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
import { runGptCopilot } from "@/lib/stridebrain-demo/copilot-runner";
import { runOpenRouterCopilot } from "@/lib/stridebrain-demo/openrouter-runner";
import { validIndustry } from "@/lib/stridebrain-demo/copilot-tools";
import { DEFAULT_MODEL_ID,findAllowedModel,isModelAllowed } from "../../../../../public/stridebrain-demo/model-catalog.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * INTERNAL FICTIONAL PREVIEW ONLY — disabled by default.
 * This operator token is NOT customer authentication or tenancy.
 *
 * Preview-only server environment variables:
 *   STRIDEBRAIN_DEMO_GPT_ENABLED=true
 *   STRIDEBRAIN_DEMO_OPERATOR_SECRET=<strong private demo token>
 *   OPENROUTER_API_KEY=<server-side OpenRouter API key>
 *   OPENAI_API_KEY=<optional server-side OpenAI key for direct GPT>
 *   STRIDEBRAIN_DEMO_ALLOWED_MODELS=<optional comma-separated model catalog IDs>
 *   STRIDEBRAIN_DEMO_OPENAI_MODEL=gpt-5.6 (optional direct API mapping)
 */
const NO_STORE={"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"};
function json(status,payload){return NextResponse.json(payload,{status,headers:NO_STORE});}
function parseChat(body){
 if(!body||typeof body!=="object"||Array.isArray(body)||!validIndustry(body.industry))return null;
 if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>12)return null;
 if(body.modelId!==undefined&&typeof body.modelId!=="string")return null;
 const messages=[];
 for(const m of body.messages){
  if(!m||typeof m!=="object"||Array.isArray(m)||!["user","assistant"].includes(m.role)||typeof m.content!=="string")return null;
  if(!m.content.trim()||m.content.length>1800)return null;
  messages.push({role:m.role,content:m.content});
 }
 if(messages.at(-1)?.role!=="user"||messages.at(-1).content.length>1200)return null;
 return {industry:body.industry,messages,modelId:body.modelId||DEFAULT_MODEL_ID};
}
export async function POST(request){
 if(process.env.STRIDEBRAIN_DEMO_GPT_ENABLED!=="true")
  return json(503,{error:"AI models are not enabled for this internal synthetic demo. Sample mode remains available.",code:"DEMO_MODELS_DISABLED"});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)
  return json(403,{error:"Cross-origin requests are not allowed.",code:"ORIGIN_DENIED"});
 if(!(isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||"")||tokenMatches(request.headers.get("x-stridebrain-operator-token")||"")))
  return json(401,{error:"Internal demo access was not authorized.",code:"DEMO_ACCESS_DENIED"});
 if((Number(request.headers.get("content-length"))||0)>24000)
  return json(413,{error:"This chat request is too large.",code:"REQUEST_TOO_LARGE"});
 let body;
 try{
  const raw=await request.text();
  if(raw.length>24000)return json(413,{error:"This chat request is too large.",code:"REQUEST_TOO_LARGE"});
  body=JSON.parse(raw);
 }catch{return json(400,{error:"Invalid chat request format.",code:"BAD_REQUEST"});}
 const parsed=parseChat(body);
 if(!parsed)return json(400,{error:"Expected an approved model, industry and bounded conversation.",code:"INVALID_CHAT"});
 const selected=findAllowedModel(parsed.modelId);
 if(!selected||!isModelAllowed(parsed.modelId,process.env.STRIDEBRAIN_DEMO_ALLOWED_MODELS||""))
  return json(403,{error:"This model has not been enabled for the staff demo.",code:"MODEL_NOT_ALLOWED"});
 const providerKey=selected.provider==="openrouter"?process.env.OPENROUTER_API_KEY:process.env.OPENAI_API_KEY;
 if(!providerKey)return json(503,{error:"The selected provider is not configured by the administrator.",code:"MODEL_NOT_CONFIGURED"});
 if(selected.provider==="openrouter"&&request.headers.get("accept")?.includes("text/event-stream")){
  const encoder=new TextEncoder();
  const stream=new ReadableStream({
   async start(controller){
    const emit=(type,payload)=>controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`));
    try{
     emit("status",{message:"Checking the fictional company records…"});
     const answer=await runOpenRouterCopilot({industry:parsed.industry,messages:parsed.messages,modelId:selected.id,apiKey:providerKey,
      onDelta:delta=>emit("delta",{text:delta})});
     emit("result",answer);
    }catch(error){
     const safeCode=typeof error?.copilotCode==="string"?error.copilotCode:"COPILOT_UNAVAILABLE";
     console.error("stridebrain_preview_copilot_stream_failure",{code:safeCode,provider:selected.provider,modelId:selected.id});
     emit("error",{code:safeCode,error:safeCode==="PROVIDER_TIMEOUT"?"The model timed out. The answer was not completed.":"The AI response could not be completed. Please retry."});
    }finally{controller.close();}
   }
  });
  return new Response(stream,{headers:{...NO_STORE,"Content-Type":"text/event-stream; charset=utf-8","X-Accel-Buffering":"no"}});
 }
 try{
  if(selected.provider==="openrouter"){
   const answer=await runOpenRouterCopilot({
    industry:parsed.industry,messages:parsed.messages,modelId:selected.id,apiKey:providerKey
   });
   return json(200,answer);
  }
  const answer=await runGptCopilot({
   industry:parsed.industry,messages:parsed.messages,apiKey:providerKey,
   model:process.env.STRIDEBRAIN_DEMO_OPENAI_MODEL||"gpt-5.6"
  });
  return json(200,{...answer,modelId:selected.id,modelLabel:selected.label,provider:"OpenAI"});
 }catch(error){
  // Return safe diagnostics only: never echo provider response bodies, requests, or credentials.
  const recognized=new Set(["PROVIDER_AUTH","PROVIDER_CREDITS","PROVIDER_ACCESS","MODEL_UNAVAILABLE","PROVIDER_TIMEOUT","PROVIDER_RATE_LIMIT","MODEL_REQUEST_REJECTED","PROVIDER_BAD_RESPONSE","PROVIDER_FAILURE","OPENROUTER_RATE_LIMIT","UPSTREAM_CAPACITY"]);
  const code=recognized.has(error?.copilotCode)?error.copilotCode:"COPILOT_UNAVAILABLE";
  const messages={PROVIDER_AUTH:"The AI provider credentials were rejected. Ask the administrator to review the configured key.",PROVIDER_CREDITS:"The AI provider requires available credits or billing configuration.",PROVIDER_ACCESS:"The selected model is not accessible to this provider account.",MODEL_UNAVAILABLE:"The selected model was not found or is unavailable. Ask the administrator to review the model catalog.",PROVIDER_TIMEOUT:"The AI provider timed out before answering.",PROVIDER_RATE_LIMIT:"An AI request limit was reached. The provider could not identify the source.",OPENROUTER_RATE_LIMIT:"OpenRouter is limiting requests for this account or model. Review usage limits before retrying.",UPSTREAM_CAPACITY:"The selected model provider is at capacity. An administrator can choose an approved alternative model.",MODEL_REQUEST_REJECTED:"The AI provider rejected the model request or tool format. The integration needs review.",PROVIDER_BAD_RESPONSE:"The AI provider returned an unsupported response format.",PROVIDER_FAILURE:"The AI provider reported an error.",COPILOT_UNAVAILABLE:"The Copilot could not complete this request. The integration needs review."};
  console.error("stridebrain_preview_copilot_failure",{code,providerStatus:Number.isInteger(error?.providerStatus)?error.providerStatus:null,rateLimitOrigin:["openrouter","upstream_provider","unknown"].includes(error?.rateLimitOrigin)?error.rateLimitOrigin:null,provider:selected.provider,modelId:selected.id,providerReason:error?.providerReason||"unknown"});
  return json(502,{error:messages[code],code});
 }
}
