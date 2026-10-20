import {NextResponse} from "next/server";
import {isStaffSessionValid,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
function reply(data,status=200){return NextResponse.json(data,{status,headers});}
export async function GET(request){
 if(!isStaffSessionValid(request.cookies.get(SESSION_COOKIE)?.value||""))return reply({connected:false,code:"DEMO_ACCESS_DENIED"},401);
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"";
 const key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)return reply({connected:false,code:"SUPABASE_NOT_CONFIGURED"},503);
 try{
  const response=await fetch(url+"/rest/v1/rpc/stridebrain_demo_connection_check",{
   method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:"{}",cache:"no-store",signal:AbortSignal.timeout(4000)
  });
  if(!response.ok)return reply({connected:false,code:"SUPABASE_RPC_FAILED",httpStatus:response.status},502);
  const result=await response.json();
  if(result?.connected!==true||result?.quota_schema_ready!==true||result?.organization_scope_ready!==true)return reply({connected:false,code:"SUPABASE_SCHEMA_NOT_READY"},502);
  return reply({connected:true,quotaSchemaReady:true,organizationScopeReady:true,checkedAt:result.database_time_utc});
 }catch{return reply({connected:false,code:"SUPABASE_UNREACHABLE"},503);}
}
