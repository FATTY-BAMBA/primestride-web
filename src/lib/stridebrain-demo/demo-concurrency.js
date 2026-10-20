/** Optional shared lease limiter; database-backed and fail-closed when enabled. */
function config(){const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"",key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"",org=process.env.STRIDEBRAIN_DEMO_ORGANIZATION_ID||"";return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&key&&/^[0-9a-f-]{36}$/.test(org)?{url,key,org}:null;}
async function rpc(settings,name,body,requestFn){const r=await requestFn(settings.url+"/rest/v1/rpc/"+name,{method:"POST",headers:{"apikey":settings.key,Authorization:"Bearer "+settings.key,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(3500)});if(!r.ok)throw Error("RPC_ERROR");return r.json();}
export async function acquireDemoLease({requestFn=fetch}={}){
 if(process.env.STRIDEBRAIN_DEMO_CONCURRENCY_ENABLED!=="true")return {ok:true,enabled:false};
 const settings=config(),limit=Number(process.env.STRIDEBRAIN_DEMO_MAX_CONCURRENT_REQUESTS||3);
 if(!settings||!Number.isInteger(limit)||limit<1||limit>20)return {ok:false,code:"DEMO_CONCURRENCY_UNAVAILABLE"};
 try{const result=await rpc(settings,"stridebrain_acquire_ai_lease",{p_organization_id:settings.org,p_limit:limit,p_ttl_seconds:120},requestFn);
 if(result?.ok===true&&/^[0-9a-f-]{36}$/.test(result.leaseId||""))return {ok:true,enabled:true,leaseId:result.leaseId};
 return {ok:false,code:result?.reason==="concurrency_exceeded"?"DEMO_CONCURRENCY_EXCEEDED":"DEMO_CONCURRENCY_UNAVAILABLE"};
 }catch{return {ok:false,code:"DEMO_CONCURRENCY_UNAVAILABLE"};}
}
export async function releaseDemoLease(lease,{requestFn=fetch}={}){
 if(!lease?.enabled||!lease.leaseId)return;
 const settings=config();if(!settings)return;
 try{await rpc(settings,"stridebrain_release_ai_lease",{p_organization_id:settings.org,p_lease_id:lease.leaseId},requestFn);}catch{/* Lease expires automatically; failure must never change completed response. */}
}
