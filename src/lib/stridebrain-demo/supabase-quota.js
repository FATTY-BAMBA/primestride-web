/** Supabase REST RPC adapter. Secret stays server-only; quotas fail closed. */
export async function enforceSupabaseDemoQuota({sessionId,requestFn=fetch}={}){
 if(process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED!=="true")return {ok:true,enabled:false};
 if(!/^[a-f0-9]{64}$/.test(sessionId||""))return {ok:false,code:"DEMO_QUOTA_SESSION_INVALID"};
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"";
 const key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 const organization=process.env.STRIDEBRAIN_DEMO_ORGANIZATION_ID||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key||!organization)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
 const sessionLimit=Number(process.env.STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS||100);
 const globalLimit=Number(process.env.STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS||500);
 if(!Number.isInteger(sessionLimit)||sessionLimit<1||sessionLimit>1000||!Number.isInteger(globalLimit)||globalLimit<1||globalLimit>10000)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
 try{
  const response=await requestFn(url+"/rest/v1/rpc/stridebrain_reserve_demo_quota",{
   method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:JSON.stringify({p_organization_id:organization,p_subject_hash:sessionId,p_session_limit:sessionLimit,p_global_limit:globalLimit}),
   signal:AbortSignal.timeout(3000)
  });
  if(!response.ok)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
  const body=await response.json(),result=Array.isArray(body)?body[0]:body;
  if(result?.allowed===true)return {ok:true,enabled:true,remaining:sessionLimit-result.session_used};
  if(result?.reason==="session_limit")return {ok:false,code:"DEMO_QUOTA_EXCEEDED"};
  if(result?.reason==="global_limit")return {ok:false,code:"DEMO_GLOBAL_QUOTA_EXCEEDED"};
  return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
 }catch{return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};}
}
