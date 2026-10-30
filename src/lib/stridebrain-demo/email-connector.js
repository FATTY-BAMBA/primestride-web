import {createHash} from "node:crypto";

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean=(v,max)=>String(v??"").trim().slice(0,max);
const list=v=>String(v||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
const HEALTH_KEY="stridebrain:email:v1:last-accepted";
const redisConfig=env=>{
 const url=env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"";
 const token=env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 return url.startsWith("https://")&&token?{url:url.replace(/\/$/,""),token}:null;
};
export function emailConnectorStatus({env=process.env,role=null}={}){
 const enabled=env.STRIDEBRAIN_EMAIL_ENABLED==="true";
 const sender=clean(env.STRIDEBRAIN_EMAIL_SENDER,180).toLowerCase();
 const configured=enabled&&env.STRIDEBRAIN_EMAIL_PROVIDER==="microsoft-graph"&&
  Boolean(env.STRIDEBRAIN_MS_TENANT_ID&&env.STRIDEBRAIN_MS_CLIENT_ID&&env.STRIDEBRAIN_MS_CLIENT_SECRET&&sender)&&
  list(env.STRIDEBRAIN_EMAIL_ALLOWED_RECIPIENTS).length>0&&Boolean(redisConfig(env));
 return {enabled,configured,provider:configured?"microsoft-graph":null,sender:configured?sender:null,roleAllowed:role==="staff",
  limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}};
}
async function redisPipeline(commands,{env,requestFn}){
 const cfg=redisConfig(env);if(!cfg)throw Error("EMAIL_IDEMPOTENCY_UNAVAILABLE");
 const r=await requestFn(cfg.url+"/pipeline",{method:"POST",headers:{Authorization:"Bearer "+cfg.token,"Content-Type":"application/json"},body:JSON.stringify(commands)});
 if(!r.ok)throw Error("EMAIL_IDEMPOTENCY_UNAVAILABLE");
 const data=await r.json();return Array.isArray(data)?data.map(x=>x?.result):[];
}
async function accessToken({env,requestFn}){
 const body=new URLSearchParams({client_id:env.STRIDEBRAIN_MS_CLIENT_ID,client_secret:env.STRIDEBRAIN_MS_CLIENT_SECRET,
  grant_type:"client_credentials",scope:"https://graph.microsoft.com/.default"});
 const r=await requestFn("https://login.microsoftonline.com/"+encodeURIComponent(env.STRIDEBRAIN_MS_TENANT_ID)+"/oauth2/v2.0/token",
  {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
 if(!r.ok)throw Error("EMAIL_PROVIDER_AUTH_FAILED");
 const data=await r.json();if(!data?.access_token)throw Error("EMAIL_PROVIDER_AUTH_FAILED");return data.access_token;
}
export async function emailConnectorHealth({env=process.env,role=null,requestFn=fetch,now=Date.now()}={}){
 const status=emailConnectorStatus({env,role});
 const result={configured:status.configured,roleAllowed:status.roleAllowed,provider:status.provider,sender:status.sender,
  checks:{configuration:{ok:status.configured},idempotency:{ok:false},authentication:{ok:false},send:{proven:false,lastAcceptedAt:null}},ready:false};
 if(role!=="staff"||!status.configured)return result;
 const probeKey="stridebrain:email:v1:health-probe:"+String(now);
 try{
  const values=await redisPipeline([["SET",probeKey,"1","EX","30"],["GET",probeKey],["GET",HEALTH_KEY],["DEL",probeKey]],{env,requestFn});
  result.checks.idempotency.ok=values[0]==="OK"&&values[1]==="1";
  result.checks.send.lastAcceptedAt=values[2]||null;
  result.checks.send.proven=Boolean(values[2]);
 }catch{}
 try{
  await accessToken({env,requestFn});
  result.checks.authentication.ok=true;
 }catch{}
 result.ready=result.checks.configuration.ok&&result.checks.idempotency.ok&&result.checks.authentication.ok;
 return result;
}

export function validateEmailRequest(input,{env=process.env}={}){
 const to=clean(input?.to,180).toLowerCase(),subject=clean(input?.subject,160),body=clean(input?.body,5000),actionId=clean(input?.actionId,140);
 const projectId=clean(input?.projectId,40),recordId=clean(input?.recordId,90);
 if(!EMAIL_RE.test(to))return {ok:false,code:"EMAIL_RECIPIENT_INVALID"};
 if(!list(env.STRIDEBRAIN_EMAIL_ALLOWED_RECIPIENTS).includes(to))return {ok:false,code:"EMAIL_RECIPIENT_NOT_ALLOWED"};
 if(subject.length<2||body.length<5)return {ok:false,code:"EMAIL_CONTENT_INVALID"};
 if(!/^[A-Za-z0-9_-]{6,140}$/.test(actionId))return {ok:false,code:"EMAIL_ACTION_INVALID"};
 if(!/^(PRJ|JOB)-\d{1,8}$/.test(projectId)||recordId.length<3)return {ok:false,code:"EMAIL_CONTEXT_INVALID"};
 return {ok:true,value:{to,subject,body,actionId,projectId,recordId}};
}
export async function sendControlledEmail({sessionScope,input,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const status=emailConnectorStatus({env,role:"staff"});if(!status.configured)throw Error("EMAIL_CONNECTOR_UNAVAILABLE");
 const checked=validateEmailRequest(input,{env});if(!checked.ok)throw Error(checked.code);
 const v=checked.value,key="stridebrain:email:v1:"+createHash("sha256").update(String(sessionScope||"")+":"+v.actionId).digest("hex");
 const existing=(await redisPipeline([["GET",key]],{env,requestFn}))[0];
 if(existing&&existing!=="pending"){try{return {...JSON.parse(existing),duplicate:true};}catch{}}
 if(existing==="pending")throw Error("EMAIL_SEND_IN_PROGRESS");
 const reserved=(await redisPipeline([["SET",key,"pending","NX","EX","120"]],{env,requestFn}))[0];
 if(reserved!=="OK")throw Error("EMAIL_SEND_IN_PROGRESS");
 try{
  const token=await accessToken({env,requestFn});
  const sender=status.sender,endpoint="https://graph.microsoft.com/v1.0/users/"+encodeURIComponent(sender)+"/sendMail";
  const graph=await requestFn(endpoint,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
   body:JSON.stringify({message:{subject:v.subject,body:{contentType:"Text",content:v.body},toRecipients:[{emailAddress:{address:v.to}}],
    internetMessageHeaders:[{name:"x-stridebrain-action-id",value:v.actionId},{name:"x-stridebrain-project-id",value:v.projectId}]},saveToSentItems:true})});
  if(graph.status!==202)throw Error("EMAIL_PROVIDER_REJECTED");
  const receipt={receiptId:"email_"+createHash("sha256").update(v.actionId+":"+now).digest("hex").slice(0,20),provider:"microsoft-graph",
   status:"accepted",acceptedAt:new Date(now).toISOString(),sender,to:v.to,subject:v.subject,projectId:v.projectId,recordId:v.recordId,actionId:v.actionId};
  await redisPipeline([["SET",key,JSON.stringify(receipt),"EX","604800"],["SET",HEALTH_KEY,receipt.acceptedAt,"EX","2592000"]],{env,requestFn});
  return receipt;
 }catch(error){
  await redisPipeline([["DEL",key]],{env,requestFn}).catch(()=>{});
  throw error;
 }
}
