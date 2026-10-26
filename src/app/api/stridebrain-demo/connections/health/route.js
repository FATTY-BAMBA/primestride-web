import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {checkMessageConnectorHealth} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function POST(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"CONNECTION_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"CONNECTION_STAFF_ONLY"});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json(403,{code:"CONNECTION_ORIGIN_DENIED"});
 let body;try{body=await request.json();}catch{return json(400,{code:"CONNECTION_REQUEST_INVALID"});}
 const providerId=String(body?.providerId||"");
 const health=await checkMessageConnectorHealth({providerId,role:session.role});
 if(health.known===false)return json(400,{code:"MESSAGE_PROVIDER_UNKNOWN"});
 return json(200,{ok:true,health});
}
