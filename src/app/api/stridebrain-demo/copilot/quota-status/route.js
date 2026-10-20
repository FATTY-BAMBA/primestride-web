import {NextResponse} from "next/server";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request){
 const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))
  return NextResponse.json({code:"DEMO_ACCESS_DENIED"},{status:401,headers});
 const enabled=process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED==="true";
 const url=process.env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"";
 const token=process.env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 const configured=url.startsWith("https://")&&token.length>0;
 return NextResponse.json({
  quotaEnabled:enabled,
  quotaConfigured:configured,
  quotaReadyForIntegrationTest:enabled&&configured,
  sessionDailyLimit:Number(process.env.STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS||100),
  globalDailyLimit:Number(process.env.STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS||500),
  scope:"internal-staff-synthetic-preview",
  note:"Configuration checks do not establish backend reachability or enforcement correctness."
 },{headers});
}
