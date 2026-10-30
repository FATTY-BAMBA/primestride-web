import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {verifyObservedLineIdentity} from "@/lib/stridebrain-demo/line-inbox";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
export async function POST(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return json(401,{code:"LINE_SESSION_REQUIRED"});
 if(session.role!=="staff")return json(403,{code:"LINE_STAFF_ONLY"});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json(403,{code:"LINE_ORIGIN_DENIED"});
 const context=resolveRuntimeContext({session});if(!context.ok)return json(503,{code:context.code});
 let body;try{body=await request.json();}catch{return json(400,{code:"LINE_VERIFY_REQUEST_INVALID"});}
 try{
  const identity=await verifyObservedLineIdentity({
   organizationId:context.organizationId,
   identityId:body?.identityId,
   contactRef:body?.contactRef,
   displayName:body?.displayName
  });
  return json(200,{ok:true,identity});
 }catch(error){
  const code=String(error?.message||"LINE_IDENTITY_VERIFY_FAILED");
  const status=code.includes("INVALID")||code.includes("LINK_INVALID")?400:code.includes("NOT_PENDING")?409:503;
  return json(status,{code});
 }
}
