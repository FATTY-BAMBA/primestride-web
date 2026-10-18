import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { runGptCopilot } from "@/lib/stridebrain-demo/copilot-runner";
import { validIndustry } from "@/lib/stridebrain-demo/copilot-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * DISABLED BY DEFAULT. Only for preview deployments with a private operator token.
 * NOT production authentication or multi-tenant data access.
 *
 * Required server-only environment variables:
 * STRIDEBRAIN_DEMO_GPT_ENABLED=true
 * STRIDEBRAIN_DEMO_OPERATOR_SECRET=<strong independent internal demo secret>
 * OPENAI_API_KEY=<server-side OpenAI key>
 * Optional: STRIDEBRAIN_DEMO_OPENAI_MODEL=gpt-5.6
 */
const NO_STORE={"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"};
function json(status,payload){return NextResponse.json(payload,{status,headers:NO_STORE});}
function secretsMatch(given,expected){
 if(!given||!expected||expected.length<20)return false;
 const a=createHash("sha256").update(given).digest(),b=createHash("sha256").update(expected).digest();
 return timingSafeEqual(a,b);
}
function parseChat(body){
 if(!body||typeof body!=="object"||Array.isArray(body)||!validIndustry(body.industry))return null;
 if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>12)return null;
 const messages=[];
 for(const m of body.messages){
  if(!m||typeof m!=="object"||Array.isArray(m)||!["user","assistant"].includes(m.role)||typeof m.content!=="string")return null;
  if(!m.content.trim()||m.content.length>1800)return null;
  messages.push({role:m.role,content:m.content});
 }
 if(messages.at(-1)?.role!=="user"||messages.at(-1).content.length>1200)return null;
 return {industry:body.industry,messages};
}
export async function POST(request){
 if(process.env.STRIDEBRAIN_DEMO_GPT_ENABLED!=="true")return json(503,{error:"GPT is not enabled for this internal synthetic demo. Sample mode remains available.",code:"DEMO_GPT_DISABLED"});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return json(403,{error:"Cross-origin requests are not allowed.",code:"ORIGIN_DENIED"});
 if(!secretsMatch(request.headers.get("x-stridebrain-operator-token")||"",process.env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||""))
  return json(401,{error:"Internal demo access was not authorized.",code:"DEMO_ACCESS_DENIED"});
 if(!process.env.OPENAI_API_KEY)return json(503,{error:"The model provider is not configured.",code:"MODEL_NOT_CONFIGURED"});
 if((Number(request.headers.get("content-length"))||0)>24000)return json(413,{error:"This request is too large.",code:"REQUEST_TOO_LARGE"});
 let body;
 try{const raw=await request.text();if(raw.length>24000)return json(413,{error:"This request is too large.",code:"REQUEST_TOO_LARGE"});body=JSON.parse(raw);}
 catch{return json(400,{error:"Invalid chat request format.",code:"BAD_REQUEST"});}
 const parsed=parseChat(body);
 if(!parsed)return json(400,{error:"Expected an industry and a bounded synthetic conversation.",code:"INVALID_CHAT"});
 try{
  const result=await runGptCopilot({industry:parsed.industry,messages:parsed.messages,apiKey:process.env.OPENAI_API_KEY,model:process.env.STRIDEBRAIN_DEMO_OPENAI_MODEL||"gpt-5.6"});
  return json(200,result);
 }catch{return json(502,{error:"The internal GPT demo could not complete the request. Try deterministic mode.",code:"COPILOT_UNAVAILABLE"});}
}
