import {NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const TEST_ORG="8733620d-3696-4d6d-a636-a8ed330b2d2d";
function result(status,body){return NextResponse.json(body,{status,headers:noStore});}
export async function POST(request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return result(403,{ok:false,code:"ORIGIN_DENIED"});
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))return result(401,{ok:false,code:"DEMO_ACCESS_DENIED"});
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"";
 const key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)return result(503,{ok:false,code:"SUPABASE_NOT_CONFIGURED"});
 async function reserve(subject,sessionLimit=2,globalLimit=3){
  const response=await fetch(url+"/rest/v1/rpc/stridebrain_reserve_demo_quota",{
   method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:JSON.stringify({p_organization_id:TEST_ORG,p_subject_hash:subject,p_session_limit:sessionLimit,p_global_limit:globalLimit}),
   cache:"no-store",signal:AbortSignal.timeout(5000)
  });
  if(!response.ok)throw Error("RPC_"+response.status);
  const payload=await response.json();return Array.isArray(payload)?payload[0]:payload;
 }
 try{
  // Same subject: allowed, allowed, rejected by session ceiling.
  const session=randomBytes(32).toString("hex");
  const s1=await reserve(session,2,3);
  // Shared global 3: two from session A and one from session B.
  const s2=await reserve(session,2,3);
  const s3=await reserve(session,2,3);
  const second=randomBytes(32).toString("hex");
  const g1=await reserve(second,2,3);
  const g2=await reserve(second,2,3);
  const passed=s1?.allowed===true&&s2?.allowed===true&&s3?.reason==="session_limit"&&g1?.allowed===true&&g2?.reason==="global_limit";
  return result(passed?200:502,{ok:passed,isolatedTestOrganization:true,sessionLimitPassed:s1?.allowed===true&&s2?.allowed===true&&s3?.reason==="session_limit",globalLimitPassed:g1?.allowed===true&&g2?.reason==="global_limit",paidModelCalls:0,liveDemoQuotaUsed:0});
 }catch{return result(502,{ok:false,code:"SUPABASE_RESERVATION_TEST_FAILED"});}
}
