import {createHash} from "node:crypto";
import {decryptGoogleRefreshToken,googleConnectionStatus,readGoogleConnection} from "./google-oauth.js";
import {findVerifiedContactIdentity} from "./contact-identity-registry.js";

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean=(value,max)=>String(value??"").trim().slice(0,max);
const list=value=>String(value||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);

function supabaseConfig(env,organizationId){
 const url=clean(env.STRIDEBRAIN_DEMO_SUPABASE_URL,500);
 const key=String(env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"").trim();
 const organization=clean(organizationId,120);
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key||!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(organization)){
  throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
 }
 return {url,key,organizationId:organization};
}
function headers(cfg,extra={}){
 return {apikey:cfg.key,Authorization:"Bearer "+cfg.key,Accept:"application/json",...extra};
}
function allowedRecipients(env,sender){
 const configured=list(env.STRIDEBRAIN_GOOGLE_ALLOWED_RECIPIENTS);
 return configured.length?configured:[sender];
}
function validateShape(input){
 const to=clean(input?.to,180).toLowerCase();
 const subject=clean(input?.subject,160);
 const body=clean(input?.body,5000);
 const actionId=clean(input?.actionId,140);
 const projectId=clean(input?.projectId,40);
 const recordId=clean(input?.recordId,90);
 if(!EMAIL_RE.test(to))return {ok:false,code:"EMAIL_RECIPIENT_INVALID"};
 if(subject.length<2||body.length<5)return {ok:false,code:"EMAIL_CONTENT_INVALID"};
 if(!/^[A-Za-z0-9_-]{6,140}$/.test(actionId))return {ok:false,code:"EMAIL_ACTION_INVALID"};
 if(!/^(PRJ|JOB)-\d{1,8}$/.test(projectId)||recordId.length<3)return {ok:false,code:"EMAIL_CONTEXT_INVALID"};
 return {ok:true,value:{to,subject,body,actionId,projectId,recordId}};
}
async function authorizeRecipient({organizationId,to,sender,env,requestFn}){
 try{
  const identity=await findVerifiedContactIdentity({organizationId,channel:"email",externalIdentity:to,provider:"google-workspace",env,requestFn});
  if(identity)return {ok:true,identity,source:"verified-contact"};
 }catch(error){
  if(!allowedRecipients(env,sender).includes(to))throw error;
 }
 if(allowedRecipients(env,sender).includes(to))return {ok:true,identity:null,source:"pilot-allowlist"};
 return {ok:false,code:"EMAIL_RECIPIENT_NOT_ALLOWED"};
}
function encodeHeader(value){
 return "=?UTF-8?B?"+Buffer.from(value,"utf8").toString("base64")+"?=";
}
function rawMessage({from,to,subject,body}){
 const mime=[
  "From: "+from,
  "To: "+to,
  "Subject: "+encodeHeader(subject),
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=\"UTF-8\"",
  "Content-Transfer-Encoding: 8bit",
  "",
  body
 ].join("\r\n");
 return Buffer.from(mime,"utf8").toString("base64url");
}
async function refreshAccessToken({env,organizationId,requestFn}){
 const connection=await readGoogleConnection({env,organizationId,requestFn});
 if(!connection)throw Error("GOOGLE_CONNECTION_UNAVAILABLE");
 const refreshToken=decryptGoogleRefreshToken(connection,{env,organizationId});
 const clientId=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_ID||env.GOOGLE_OAUTH_CLIENT_ID,300);
 const clientSecret=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_SECRET||env.GOOGLE_OAUTH_CLIENT_SECRET,500);
 if(!clientId||!clientSecret)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const response=await requestFn("https://oauth2.googleapis.com/token",{
  method:"POST",
  headers:{"Content-Type":"application/x-www-form-urlencoded"},
  body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:"refresh_token"}),
  cache:"no-store"
 });
 if(!response.ok)throw Error("GOOGLE_ACCESS_TOKEN_REFRESH_FAILED");
 const payload=await response.json();
 if(!payload?.access_token)throw Error("GOOGLE_ACCESS_TOKEN_REFRESH_FAILED");
 return payload.access_token;
}
async function getAction({env,organizationId,actionId,requestFn}){
 const cfg=supabaseConfig(env,organizationId);
 const url=new URL(cfg.url+"/rest/v1/stridebrain_message_actions");
 url.searchParams.set("organization_id","eq."+cfg.organizationId);
 url.searchParams.set("action_id","eq."+actionId);
 url.searchParams.set("select","status,receipt_id,provider_message_id,accepted_at,recipient,subject,provider,project_id,record_id,error_code");
 url.searchParams.set("limit","1");
 const response=await requestFn(url.toString(),{headers:headers(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)});
 if(!response.ok)throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
 const rows=await response.json();
 return Array.isArray(rows)?rows[0]||null:null;
}
async function reserveAction({env,organizationId,value,requestFn,now}){
 const cfg=supabaseConfig(env,organizationId);
 const url=new URL(cfg.url+"/rest/v1/stridebrain_message_actions");
 const body={
  organization_id:cfg.organizationId,action_id:value.actionId,provider:"google-workspace",channel:"email",
  recipient:value.to,subject:value.subject,project_id:value.projectId,record_id:value.recordId,status:"pending",
  created_at:new Date(now).toISOString(),updated_at:new Date(now).toISOString()
 };
 const response=await requestFn(url.toString(),{
  method:"POST",
  headers:headers(cfg,{"Content-Type":"application/json",Prefer:"return=minimal"}),
  body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(3000)
 });
 if(response.ok)return {reserved:true,existing:null};
 if(response.status===409){
  const existing=await getAction({env,organizationId,actionId:value.actionId,requestFn});
  return {reserved:false,existing};
 }
 throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
}
async function updateAction({env,organizationId,actionId,requestFn,patch}){
 const cfg=supabaseConfig(env,organizationId);
 const url=new URL(cfg.url+"/rest/v1/stridebrain_message_actions");
 url.searchParams.set("organization_id","eq."+cfg.organizationId);
 url.searchParams.set("action_id","eq."+actionId);
 const response=await requestFn(url.toString(),{
  method:"PATCH",
  headers:headers(cfg,{"Content-Type":"application/json",Prefer:"return=minimal"}),
  body:JSON.stringify({...patch,updated_at:new Date().toISOString()}),cache:"no-store",signal:AbortSignal.timeout(3000)
 });
 if(!response.ok)throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
}
function receiptFromExisting(row){
 if(!row||row.status!=="accepted")return null;
 return {receiptId:row.receipt_id,provider:"gmail",providerMessageId:row.provider_message_id,status:"accepted",
  acceptedAt:row.accepted_at,to:row.recipient,subject:row.subject,projectId:row.project_id,recordId:row.record_id,duplicate:true};
}
export async function gmailConnectorStatus({env=process.env,role=null,organizationId,requestFn=fetch}={}){
 const status=await googleConnectionStatus({env,role,organizationId,requestFn});
 return {...status,enabled:status.configured,limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}};
}
export async function sendControlledGmail({organizationId,input,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const status=await gmailConnectorStatus({env,role:"staff",organizationId,requestFn});
 if(!status.configured||!status.connected)throw Error(status.connectionCode||"GOOGLE_CONNECTION_UNAVAILABLE");
 const checked=validateShape(input);if(!checked.ok)throw Error(checked.code);
 const value=checked.value;
 const recipientAuth=await authorizeRecipient({organizationId,to:value.to,sender:status.sender,env,requestFn});
 if(!recipientAuth.ok)throw Error(recipientAuth.code);
 const reservation=await reserveAction({env,organizationId,value,requestFn,now});
 if(!reservation.reserved){
  const duplicate=receiptFromExisting(reservation.existing);if(duplicate)return duplicate;
  if(reservation.existing?.status==="pending")throw Error("EMAIL_SEND_IN_PROGRESS");
  if(reservation.existing?.status==="failed"){
   await updateAction({env,organizationId,actionId:value.actionId,requestFn,patch:{status:"pending",error_code:null}});
  }else throw Error("EMAIL_SEND_IN_PROGRESS");
 }
 try{
  const accessToken=await refreshAccessToken({env,organizationId,requestFn});
  const response=await requestFn("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",{
   method:"POST",
   headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json"},
   body:JSON.stringify({raw:rawMessage({from:status.sender,to:value.to,subject:value.subject,body:value.body})}),
   cache:"no-store"
  });
  if(!response.ok)throw Error("GMAIL_PROVIDER_REJECTED");
  const payload=await response.json();
  if(!payload?.id)throw Error("GMAIL_PROVIDER_INVALID_RESPONSE");
  const acceptedAt=new Date(now).toISOString();
  const receiptId="gmail_"+createHash("sha256").update(organizationId+":"+value.actionId+":"+payload.id).digest("hex").slice(0,20);
  const receipt={receiptId,provider:"gmail",providerMessageId:payload.id,status:"accepted",acceptedAt,sender:status.sender,
   to:value.to,subject:value.subject,projectId:value.projectId,recordId:value.recordId,actionId:value.actionId};
  await updateAction({env,organizationId,actionId:value.actionId,requestFn,patch:{
   status:"accepted",receipt_id:receiptId,provider_message_id:payload.id,accepted_at:acceptedAt,error_code:null
  }});
  return receipt;
 }catch(error){
  await updateAction({env,organizationId,actionId:value.actionId,requestFn,patch:{status:"failed",error_code:String(error?.message||"GMAIL_SEND_FAILED").slice(0,120)}}).catch(()=>{});
  throw error;
 }
}
