/**
 * Protected staff preview request gate. Explicitly opt in to distributed quotas
 * before allowing a shareable AI demo. No local-memory counters: serverless
 * instances do not share state. Fail closed on absent/unreachable storage.
 */
const MAX_REQUESTS=Number(process.env.STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS||"40");
function config(){
 const url=process.env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"";
 const token=process.env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 if(!url.startsWith("https://")||!token)return null;
 return {url:url.replace(/\\/$/,""),token};
}
export async function enforceDemoQuota({sessionId,now=Date.now(),requestFn=fetch}={}){
 if(process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED!=="true")
  return {ok:true,enabled:false};
 if(!/^[a-f0-9]{64}$/.test(sessionId||""))return {ok:false,code:"DEMO_QUOTA_SESSION_INVALID"};
 const settings=config();
 if(!settings)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
 const limit=Number.isInteger(MAX_REQUESTS)&&MAX_REQUESTS>=1&&MAX_REQUESTS<=1000?MAX_REQUESTS:40;
 const date=new Date(now).toISOString().slice(0,10);
 const key="stridebrain:demo:v1:"+date+":"+sessionId;
 const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],172800) end; return n";
 try{
  const response=await requestFn(settings.url+"/pipeline",{
   method:"POST",headers:{Authorization:"Bearer "+settings.token,"Content-Type":"application/json"},
   body:JSON.stringify([["EVAL",script,"1",key]]),
   signal:AbortSignal.timeout(2500)
  });
  if(!response.ok)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
  const result=await response.json();
  const count=Number(result?.[0]?.result);
  if(!Number.isInteger(count)||count<1)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
  return count>limit?{ok:false,code:"DEMO_QUOTA_EXCEEDED"}:{ok:true,enabled:true,remaining:limit-count};
 }catch{return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};}
}
