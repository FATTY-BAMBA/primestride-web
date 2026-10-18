import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { runGptCopilot } from "@/lib/stridebrain-demo/copilot-runner";
import { validIndustry } from "@/lib/stridebrain-demo/copilot-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * INTERNAL DEMO OPERATOR ENDPOINT — disabled by default.
 *
 * This is NOT a tenant-authenticated production API. The shared operator secret
 * is a temporary extra guard for synthetic internal preview use only.
 *
 * Configure on preview deployment only:
 * STRIDEBRAIN_DEMO_GPT_ENABLED=true
 * STRIDEBRAIN_DEMO_OPERATOR_SECRET=<private strong random string>
 * OPENAI_API_KEY=<server-side provider key>
 * STRIDEBRAIN_DEMO_OPENAI_MODEL=gpt-5.6 (optional)
 *
 * Never put OPENAI_API_KEY in NEXT_PUBLIC_ or in browser JS.
 */
const noStore = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" };

function json(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, {status,headers:noStore});
}
function equalSecrets(actual: string, expected: string) {
  if (!actual || !expected || expected.length < 20) return false;
  const a=createHash("sha256").update(actual).digest();
  const b=createHash("sha256").update(expected).digest();
  return timingSafeEqual(a,b);
}
type ChatTurn = {role: "user" | "assistant"; content: string};
function parseRequest(input: unknown): {industry: "interior" | "printing"; messages: ChatTurn[]} | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const body=input as Record<string,unknown>;
  if (!validIndustry(body.industry)) return null;
  if (!Array.isArray(body.messages) || body.messages.length===0 || body.messages.length>12) return null;
  const msgs: ChatTurn[]=[];
  for (const item of body.messages) {
    if (!item || typeof item!=="object" || Array.isArray(item)) return null;
    const msg=item as Record<string,unknown>;
    if ((msg.role!=="user"&&msg.role!=="assistant")||typeof msg.content!=="string") return null;
    if (msg.content.trim().length<1||msg.content.length>1800) return null;
    msgs.push({role:msg.role as ChatTurn["role"],content:msg.content});
  }
  if (msgs.at(-1)?.role!=="user" || msgs.at(-1)!.content.length>1200) return null;
  return {industry:body.industry as "interior"|"printing",messages:msgs};
}
export async function POST(request: NextRequest) {
  if (process.env.STRIDEBRAIN_DEMO_GPT_ENABLED!=="true") return json(503,{
    error:"GPT is not enabled for this internal synthetic demo. Read-only sample mode remains available.",
    code:"DEMO_GPT_DISABLED"
  });
  const origin=request.headers.get("origin");
  if (origin && origin!==new URL(request.url).origin) return json(403,{error:"Cross-origin requests are not allowed.",code:"ORIGIN_DENIED"});
  const secret=process.env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||"";
  const supplied=request.headers.get("x-stridebrain-operator-token")||"";
  if (!equalSecrets(supplied,secret)) return json(401,{error:"Internal demo access was not authorized.",code:"DEMO_ACCESS_DENIED"});
  if (!process.env.OPENAI_API_KEY) return json(503,{error:"The model provider is not configured.",code:"MODEL_NOT_CONFIGURED"});
  if ((Number(request.headers.get("content-length"))||0)>24000) return json(413,{error:"This request is too large.",code:"REQUEST_TOO_LARGE"});
  let body:unknown;
  try{
    const content=await request.text();
    if (content.length>24000) return json(413,{error:"This request is too large.",code:"REQUEST_TOO_LARGE"});
    body=JSON.parse(content);
  }catch{return json(400,{error:"Invalid chat request format.",code:"BAD_REQUEST"});}
  const parsed=parseRequest(body);
  if (!parsed) return json(400,{error:"Expected an industry and a bounded synthetic conversation.",code:"INVALID_CHAT"});
  try{
    const result=await runGptCopilot({
      industry:parsed.industry,
      messages:parsed.messages,
      apiKey:process.env.OPENAI_API_KEY,
      model:process.env.STRIDEBRAIN_DEMO_OPENAI_MODEL||"gpt-5.6"
    });
    return json(200,result);
  }catch{
    // Never expose secrets, provider request payloads, stack traces or prompt contents.
    return json(502,{error:"The internal GPT demo could not complete this request. Try deterministic mode.",code:"COPILOT_UNAVAILABLE"});
  }
}
