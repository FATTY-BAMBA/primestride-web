import {NextResponse} from "next/server";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
function result(status,body){return NextResponse.json(body,{status,headers:noStore});}
export async function POST(request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return result(403,{ok:false,code:"ORIGIN_DENIED"});
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))return result(401,{ok:false,code:"DEMO_ACCESS_DENIED"});
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"";
 const key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)return result(503,{ok:false,code:"SUPABASE_NOT_CONFIGURED"});
 try {
  const response=await fetch(url+"/rest/v1/rpc/stridebrain_quota_self_test",{
   method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:"{}",cache:"no-store",signal:AbortSignal.timeout(7000)
  });
  if(!response.ok)return result(502,{ok:false,code:"SELF_TEST_RPC_FAILED",httpStatus:response.status});
  const checked=await response.json();
  return result(checked?.ok===true?200:502,{ok:checked?.ok===true,sessionLimitPassed:checked?.sessionLimitPassed===true,globalLimitPassed:checked?.globalLimitPassed===true,liveDemoQuotaUsed:0,paidModelCalls:0});
 }catch{return result(503,{ok:false,code:"SELF_TEST_UNREACHABLE"});}

}
