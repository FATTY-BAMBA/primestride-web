import {NextResponse} from "next/server";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request){
 const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))
  return NextResponse.json({code:"DEMO_ACCESS_DENIED"},{status:401,headers});
 const enabled=process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED==="true";
 const backend=process.env.STRIDEBRAIN_DEMO_QUOTA_BACKEND==="supabase"?"supabase":"redis";
 const url=process.env[backend==="supabase"?"STRIDEBRAIN_DEMO_SUPABASE_URL":"STRIDEBRAIN_DEMO_REDIS_REST_URL"]||"";
 const token=process.env[backend==="supabase"?"STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY":"STRIDEBRAIN_DEMO_REDIS_REST_TOKEN"]||"";
 const configured=url.startsWith("https://")&&token.length>0&&(backend!=="supabase"||Boolean(process.env.STRIDEBRAIN_DEMO_ORGANIZATION_ID));
 return NextResponse.json({
  quotaEnabled:enabled,
  quotaBackend:backend,
  quotaConfigured:configured,
  quotaReadyForIntegrationTest:enabled&&configured,
  budgetEnabled:process.env.STRIDEBRAIN_DEMO_BUDGET_ENABLED==="true",
  dailyBudgetReservationUsd:Number(process.env.STRIDEBRAIN_DEMO_DAILY_BUDGET_MICROUSD||10000000)/1000000,
  perRequestReservationUsd:Number(process.env.STRIDEBRAIN_DEMO_BUDGET_RESERVE_MICROUSD||500000)/1000000,
  concurrencyEnabled:process.env.STRIDEBRAIN_DEMO_CONCURRENCY_ENABLED==="true",
  maxConcurrentRequests:Number(process.env.STRIDEBRAIN_DEMO_MAX_CONCURRENT_REQUESTS||3),
  guestAccessEnabled:process.env.STRIDEBRAIN_DEMO_GUEST_ENABLED==="true",
  sessionDailyLimit:Number(process.env.STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS||100),
  globalDailyLimit:Number(process.env.STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS||500),
  scope:"internal-staff-synthetic-preview",
  note:"Configuration checks do not establish backend reachability or enforcement correctness."
 },{headers});
}
