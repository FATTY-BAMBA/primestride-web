import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {listLineIdentityReview} from "@/lib/stridebrain-demo/line-inbox";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function GET(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"LINE_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"LINE_STAFF_ONLY"});
 const context=resolveRuntimeContext({session});if(!context.ok)return json(503,{code:context.code});
 try{
  const identities=await listLineIdentityReview({organizationId:context.organizationId});
  return json(200,{ok:true,organizationId:context.organizationId,identities});
 }catch(error){return json(503,{code:String(error?.message||"LINE_INBOX_UNAVAILABLE")});}
}
