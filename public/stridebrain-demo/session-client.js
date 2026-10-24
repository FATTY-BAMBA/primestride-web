/** Shared invitation/session transport. No provider keys or persistent credentials. */
export const SESSION_STATUS_URL="/api/stridebrain-demo/copilot/status";
export const GUEST_SESSION_URL="/api/stridebrain-demo/copilot/guest-session";
export class SessionError extends Error{
 constructor(code,status=0){super(code);this.name="SessionError";this.code=code;this.status=status;}
}
export function createSessionTransport(fetchImpl=(...args)=>fetch(...args),timeoutMs=8000){
 async function request(url,options={}){
  const controller=new AbortController();let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{reject(new SessionError("SESSION_TIMEOUT"));controller.abort();},timeoutMs);});
  try{
   return await Promise.race([deadline,(async()=>{
    const response=await fetchImpl(url,{...options,credentials:"same-origin",cache:"no-store",signal:controller.signal});
    let data;try{data=await response.json();}catch{throw new SessionError("SESSION_BAD_RESPONSE",response.status);}
    if(!response.ok)throw new SessionError(typeof data?.code==="string"?data.code:"SESSION_UNAVAILABLE",response.status);
    if(!data||typeof data!=="object"||Array.isArray(data))throw new SessionError("SESSION_BAD_RESPONSE");
    return data;
   })()]);
  }catch(error){
   if(error instanceof SessionError)throw error;
   throw new SessionError("SESSION_NETWORK");
  }finally{clearTimeout(timer);}
 }
 async function read(){
  const info=await request(SESSION_STATUS_URL);
  if(!["ready","signed_out","unavailable"].includes(info.state)||typeof info.active!=="boolean")throw new SessionError("SESSION_BAD_RESPONSE");
  if(info.state==="signed_out"){
   if(info.active)throw new SessionError("SESSION_BAD_RESPONSE");
   return {...info,allowedModelIds:[]};
  }
  if(!info.active||!["guest","staff"].includes(info.role)||!/^[a-f0-9]{24}$/.test(info.chatScope||"")||!Array.isArray(info.allowedModelIds)||info.allowedModelIds.some(id=>typeof id!=="string"||id.length>120))throw new SessionError("SESSION_BAD_RESPONSE");
  if(info.state==="ready"&&(!info.allowedModelIds.length||!info.allowedModelIds.includes(info.defaultModelId)))throw new SessionError("SESSION_BAD_RESPONSE");
  return info;
 }
 async function redeem(code){
  if(typeof code!=="string"||code.length<24||code.length>256)throw new SessionError("INVALID_INVITATION",401);
  const accepted=await request(GUEST_SESSION_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inviteCode:code})});
  if(accepted.active!==true)throw new SessionError("SESSION_BAD_RESPONSE");
  // POST success alone does not prove that the browser retained the HttpOnly cookie.
  const verified=await read();
  if(!verified.active)throw new SessionError("SESSION_NOT_RETAINED");
  return verified;
 }
 return {read,redeem,request};
}

/** Capture and erase a fragment before any asynchronous loading or navigation. */
export function captureInvitation(location,history){
 if(!location.hash?.startsWith("#invite="))return null;
 const match=location.hash.match(/^#invite=([^&]+)$/);let code="";
 try{if(match)code=decodeURIComponent(match[1]);}catch{}
 history.replaceState(history.state,"",location.pathname+location.search);
 return code;
}
export function createInvitationAttempt(code,transport,now=()=>Date.now()){
 let secret=code,expires=now()+5*60*1000;
 return {
  clear(){secret=null;},
  async redeem(){
   if(secret===null||now()>=expires){secret=null;throw new SessionError("INVALID_INVITATION",401);}
   try{const result=await transport.redeem(secret);secret=null;return result;}
   catch(error){if(error.status===401||error.code==="INVALID_INVITATION")secret=null;throw error;}
  }
 };
}
