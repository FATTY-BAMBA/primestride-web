import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {messageConnectorStatus,sendApprovedMessage} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function POST(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"MESSAGE_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"MESSAGE_STAFF_ONLY"});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json(403,{code:"MESSAGE_ORIGIN_DENIED"});
 let body;try{body=await request.json();}catch{return json(400,{code:"MESSAGE_REQUEST_INVALID"});}
 const providerId=String(body?.providerId||""),channel=String(body?.channel||"");
 const connector=messageConnectorStatus({providerId,role:session.role});
 if(!connector.known)return json(400,{code:"MESSAGE_PROVIDER_UNKNOWN"});
 if(!connector.implemented)return json(501,{code:"MESSAGE_PROVIDER_NOT_IMPLEMENTED"});
 if(!connector.configured)return json(503,{code:"MESSAGE_CONNECTOR_UNAVAILABLE"});
 try{
  const receipt=await sendApprovedMessage({providerId,channel,sessionScope:session.chatScope,input:body});
  return json(200,{ok:true,receipt});
 }catch(error){
  const code=String(error?.message||"MESSAGE_SEND_FAILED");
  const status=code.includes("NOT_ALLOWED")||code.includes("INVALID")||code.includes("CONTEXT")||code.includes("MISMATCH")?400:code.includes("IN_PROGRESS")?409:code.includes("UNAVAILABLE")?503:502;
  return json(status,{code});
 }
}
