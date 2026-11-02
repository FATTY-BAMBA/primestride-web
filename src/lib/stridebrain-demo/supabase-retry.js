/**
 * One retry for Supabase guard RPCs. A paused or cold database often times out on the
 * first call and answers on the next, which otherwise refuses an otherwise valid request.
 * Guards stay fail-closed: if the retry also fails, the caller still refuses.
 */
export async function guardFetch(requestFn,url,init,{timeoutMs=4500,attempts=2}={}){
 let lastError;
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const response=await requestFn(url,{...init,signal:AbortSignal.timeout(timeoutMs)});
   if(response?.status>=500&&attempt<attempts){lastError=Error("RPC_"+response.status);continue;}
   return response;
  }catch(error){lastError=error;}
 }
 throw lastError||Error("RPC_ERROR");
}
