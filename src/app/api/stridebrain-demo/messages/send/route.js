import {NextResponse} from "next/server";
import {resolveStrideBrainRequestContext} from "@/lib/stridebrain-demo/request-context";
import {messageConnectorStatus,sendApprovedMessage} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function POST(request){
 const access=resolveStrideBrainRequestContext({cookies:request.cookies});
 const session=access.session;
 if(!session.active)return json(401,{code:"MESSAGE_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"MESSAGE_STAFF_ONLY"});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json(403,{code:"MESSAGE_ORIGIN_DENIED"});
 if(!access.ok)return json(503,{code:access.code});
 const context=access.runtime;
 let body;try{body=await request.json();}catch{return json(400,{code:"MESSAGE_REQUEST_INVALID"});}
 const providerId=String(body?.providerId||""),channel=String(body?.channel||"");
 const connector=messageConnectorStatus({providerId,role:session.role,organizationId:context.organizationId});
 if(!connector.known)return json(400,{code:"MESSAGE_PROVIDER_UNKNOWN"});
 if(!connector.implemented)return json(501,{code:"MESSAGE_PROVIDER_NOT_IMPLEMENTED"});
 if(!connector.configured)return json(503,{code:"MESSAGE_CONNECTOR_UNAVAILABLE"});
 try{
  const receipt=await sendApprovedMessage({
   providerId,channel,organizationId:context.organizationId,sessionScope:session.chatScope,input:body
  });
  return json(200,{ok:true,receipt});
 }catch(error){
  const code=String(error?.message||"MESSAGE_SEND_FAILED");
  const status=code.includes("NOT_ALLOWED")||code.includes("NOT_VERIFIED")||code.includes("INVALID")||code.includes("CONTEXT")||code.includes("MISMATCH")?400:
   code.includes("IN_PROGRESS")?409:code.includes("UNAVAILABLE")||code.includes("REFRESH")?503:502;
  return json(status,{code});
 }
}
