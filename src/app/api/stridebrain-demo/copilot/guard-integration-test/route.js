import {NextResponse} from "next/server";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
function reply(data,status=200){return NextResponse.json(data,{status,headers});}
export async function POST(request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return reply({ok:false,code:"ORIGIN_DENIED"},403);
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))return reply({ok:false,code:"DEMO_ACCESS_DENIED"},401);
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"",key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)return reply({ok:false,code:"SUPABASE_NOT_CONFIGURED"},503);
 try{
  const r=await fetch(url+"/rest/v1/rpc/stridebrain_preview_guard_self_test",{method:"POST",headers:{"apikey":key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:"{}",cache:"no-store",signal:AbortSignal.timeout(7000)});
  if(!r.ok)return reply({ok:false,code:"GUARD_TEST_RPC_FAILED",httpStatus:r.status},502);
  const data=await r.json();
  return reply({ok:data?.ok===true,concurrencyLimitPassed:data?.concurrencyLimitPassed===true,leaseReleasePassed:data?.leaseReleasePassed===true,budgetLimitPassed:data?.budgetLimitPassed===true,paidModelCalls:0,liveDemoQuotaUsed:0},data?.ok===true?200:502);
 }catch{return reply({ok:false,code:"GUARD_TEST_UNREACHABLE"},503);}
}
