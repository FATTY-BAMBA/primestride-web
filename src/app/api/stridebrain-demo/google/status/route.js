import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {googleConnectionStatus} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function GET(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"GOOGLE_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"GOOGLE_STAFF_ONLY"});
 const context=resolveRuntimeContext({session});
 if(!context.ok)return json(503,{code:context.code});
 const status=await googleConnectionStatus({role:session.role,organizationId:context.organizationId});
 return json(200,{ok:true,...status});
}
