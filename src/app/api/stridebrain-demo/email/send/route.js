import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {messageConnectorStatus,sendApprovedMessage} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function POST(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"EMAIL_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"EMAIL_STAFF_ONLY"});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json(403,{code:"EMAIL_ORIGIN_DENIED"});
 const connector=messageConnectorStatus({providerId:"microsoft365",role:session.role});if(!connector.configured)return json(503,{code:"EMAIL_CONNECTOR_UNAVAILABLE"});
 let body;try{body=await request.json();}catch{return json(400,{code:"EMAIL_REQUEST_INVALID"});}
 try{
  const receipt=await sendApprovedMessage({providerId:"microsoft365",channel:"email",sessionScope:session.chatScope,input:body});
  return json(200,{ok:true,receipt});
 }catch(error){
  const code=String(error?.message||"EMAIL_SEND_FAILED");
  const status=code.includes("NOT_ALLOWED")||code.includes("INVALID")||code.includes("CONTEXT")?400:code.includes("IN_PROGRESS")?409:code.includes("UNAVAILABLE")?503:502;
  return json(status,{code});
 }
}
