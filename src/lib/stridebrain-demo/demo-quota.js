/**
 * Protected staff preview request gate. Explicitly opt in to distributed quotas
 * before allowing a shareable AI demo. No local-memory counters: serverless
 * instances do not share state. Fail closed on absent/unreachable storage.
 */
function config(){
 const url=process.env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"";
 const token=process.env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 if(!url.startsWith("https://")||!token)return null;
 return {url:url.endsWith("/")?url.slice(0,-1):url,token};
}
export async function enforceDemoQuota({sessionId,now=Date.now(),requestFn=fetch}={}){
 if(process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED!=="true")
  return {ok:true,enabled:false};
 if(!/^[a-f0-9]{64}$/.test(sessionId||""))return {ok:false,code:"DEMO_QUOTA_SESSION_INVALID"};
 const settings=config();
 if(!settings)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
 const MAX_REQUESTS=Number(process.env.STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS||"100");
 const limit=Number.isInteger(MAX_REQUESTS)&&MAX_REQUESTS>=1&&MAX_REQUESTS<=1000?MAX_REQUESTS:100;
 const date=new Date(now).toISOString().slice(0,10);
 const key="stridebrain:demo:v1:"+date+":"+sessionId;
 const globalKey="stridebrain:demo:v1:"+date+":global";
 const requestedGlobal=Number(process.env.STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS||"500");
 const globalLimit=Number.isInteger(requestedGlobal)&&requestedGlobal>=1&&requestedGlobal<=10000?requestedGlobal:500;
 // Atomically reserve both a session and global allowance. No counter increments once blocked.
 const script="local a=tonumber(redis.call('GET',KEYS[1]) or '0'); local b=tonumber(redis.call('GET',KEYS[2]) or '0'); if a>=tonumber(ARGV[1]) then return -1 end; if b>=tonumber(ARGV[2]) then return -2 end; a=redis.call('INCR',KEYS[1]); b=redis.call('INCR',KEYS[2]); if a==1 then redis.call('EXPIRE',KEYS[1],172800) end; if b==1 then redis.call('EXPIRE',KEYS[2],172800) end; return a";
 try{
  const response=await requestFn(settings.url+"/pipeline",{
   method:"POST",headers:{Authorization:"Bearer "+settings.token,"Content-Type":"application/json"},
   body:JSON.stringify([["EVAL",script,"2",key,globalKey,String(limit),String(globalLimit)]]),
   signal:AbortSignal.timeout(2500)
  });
  if(!response.ok)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
  const result=await response.json();
  const count=Number(result?.[0]?.result);
  if(count===-1)return {ok:false,code:"DEMO_QUOTA_EXCEEDED"};
  if(count===-2)return {ok:false,code:"DEMO_GLOBAL_QUOTA_EXCEEDED"};
  if(!Number.isInteger(count)||count<1||count>limit)return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};
  return {ok:true,enabled:true,remaining:limit-count};
 }catch{return {ok:false,code:"DEMO_QUOTA_UNAVAILABLE"};}
}
