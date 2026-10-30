import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {findVerifiedContactIdentityByContactRef} from "./contact-identity-registry.js";

const LINE_USER_ID=/^U[0-9a-f]{32}$/;
const clean=(value,max)=>String(value??"").trim().slice(0,max);
function deterministicRetryKey(organizationId,actionId){
 const hex=createHash("sha256").update(organizationId+":"+actionId).digest("hex").slice(0,32);
 return hex.slice(0,8)+"-"+hex.slice(8,12)+"-4"+hex.slice(13,16)+"-a"+hex.slice(17,20)+"-"+hex.slice(20,32);
}

function supabaseConfig(env=process.env,organizationId){
 const url=clean(env.STRIDEBRAIN_DEMO_SUPABASE_URL,500);
 const key=String(env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"").trim();
 const organization=clean(organizationId,120);
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key||!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(organization)){
  throw Error("LINE_STORAGE_UNAVAILABLE");
 }
 return {url,key,organizationId:organization};
}
function apiHeaders(cfg,extra={}){
 return {apikey:cfg.key,Authorization:"Bearer "+cfg.key,Accept:"application/json",...extra};
}
function lineConfig(env=process.env,organizationId){
 const channelId=clean(env.STRIDEBRAIN_LINE_CHANNEL_ID,120);
 const channelSecret=String(env.STRIDEBRAIN_LINE_CHANNEL_SECRET||"").trim();
 const accessToken=String(env.STRIDEBRAIN_LINE_CHANNEL_ACCESS_TOKEN||"").trim();
 const organization=clean(organizationId||env.STRIDEBRAIN_DEMO_ORGANIZATION_ID,120);
 const configured=Boolean(channelId&&channelSecret.length>=16&&accessToken.length>=20&&/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(organization));
 return {configured,channelId:configured?channelId:null,channelSecret:configured?channelSecret:null,accessToken:configured?accessToken:null,organizationId:configured?organization:null};
}
export const LINE_WEBHOOK_PATH="/api/stridebrain-demo/line/webhook";
export const DEFAULT_LINE_WEBHOOK_URL="https://line-webhook.primestrideai.com"+LINE_WEBHOOK_PATH;

export function lineConnectorStatus({env=process.env,role=null,organizationId}={}){
 const cfg=lineConfig(env,organizationId);
 return {
  provider:"line",
  configured:cfg.configured,
  connected:cfg.configured,
  roleAllowed:role==="staff",
  webhookUrl:DEFAULT_LINE_WEBHOOK_URL,
  channelId:cfg.channelId,
  sender:cfg.configured?"LINE Official Account":null,
  limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}
 };
}
export function lineWebhookSignatureDiagnostic({rawBody,signature,env=process.env,organizationId}={}){
 const cfg=lineConfig(env,organizationId);
 let given=null;
 try{given=typeof signature==="string"&&signature?Buffer.from(signature,"base64"):null;}catch{}
 return {
  configured:cfg.configured,
  channelId:cfg.channelId,
  bodyBytes:typeof rawBody==="string"?Buffer.byteLength(rawBody,"utf8"):null,
  bodyHash:typeof rawBody==="string"?createHash("sha256").update(rawBody).digest("hex").slice(0,16):null,
  signaturePresent:Boolean(signature),
  signatureBytes:given?.length||0,
  secretFingerprint:cfg.configured?createHash("sha256").update(cfg.channelSecret).digest("hex").slice(0,12):null
 };
}
export function verifyLineWebhookSignature({rawBody,signature,env=process.env,organizationId}={}){
 const cfg=lineConfig(env,organizationId);
 if(!cfg.configured||typeof rawBody!=="string"||typeof signature!=="string"||!signature)return false;
 const expected=createHmac("sha256",cfg.channelSecret).update(rawBody,"utf8").digest();
 let given;
 try{given=Buffer.from(signature,"base64");}catch{return false;}
 return given.length===expected.length&&timingSafeEqual(given,expected);
}
function eventId(event,rawBody,index){
 const provided=clean(event?.webhookEventId,180);
 if(provided)return provided;
 return "derived_"+createHash("sha256").update(rawBody+":"+index).digest("hex").slice(0,40);
}
async function insertEvent({event,rawBody,index,organizationId,env,requestFn}){
 const cfg=supabaseConfig(env,organizationId),url=new URL(cfg.url+"/rest/v1/stridebrain_line_events");
 const source=event?.source||{},message=event?.message||{};
 const body={
  organization_id:cfg.organizationId,
  webhook_event_id:eventId(event,rawBody,index),
  event_type:clean(event?.type,60)||"unknown",
  source_type:clean(source.type,40)||null,
  source_user_id:LINE_USER_ID.test(String(source.userId||""))?source.userId:null,
  source_group_id:clean(source.groupId,120)||null,
  source_room_id:clean(source.roomId,120)||null,
  message_id:clean(message.id,120)||null,
  message_type:clean(message.type,40)||null,
  message_text:message.type==="text"?clean(message.text,4000):null,
  reply_token_present:Boolean(event?.replyToken),
  event_timestamp:Number.isFinite(Number(event?.timestamp))?Number(event.timestamp):null,
  redelivery:event?.deliveryContext?.isRedelivery===true,
  delivery_context:{isRedelivery:event?.deliveryContext?.isRedelivery===true}
 };
 const response=await requestFn(url.toString(),{
  method:"POST",
  headers:apiHeaders(cfg,{"Content-Type":"application/json",Prefer:"resolution=ignore-duplicates,return=minimal"}),
  body:JSON.stringify(body),
  cache:"no-store",
  signal:AbortSignal.timeout(3000)
 });
 if(!response.ok)throw Error("LINE_EVENT_STORAGE_UNAVAILABLE");
 return body;
}
async function ensurePendingIdentity({userId,organizationId,env,requestFn}){
 if(!LINE_USER_ID.test(String(userId||"")))return;
 const cfg=supabaseConfig(env,organizationId),url=new URL(cfg.url+"/rest/v1/stridebrain_contact_identities");
 url.searchParams.set("on_conflict","organization_id,channel,normalized_identity");
 const body={
  organization_id:cfg.organizationId,
  contact_ref:null,
  display_name:"Unlinked LINE contact",
  channel:"line",
  provider:"line",
  external_identity:userId,
  normalized_identity:userId,
  status:"pending",
  verification_method:"webhook-observed",
  verified_at:null,
  verified_by:null,
  metadata:{source:"line-webhook"},
  updated_at:new Date().toISOString()
 };
 const response=await requestFn(url.toString(),{
  method:"POST",
  headers:apiHeaders(cfg,{"Content-Type":"application/json",Prefer:"resolution=ignore-duplicates,return=minimal"}),
  body:JSON.stringify(body),
  cache:"no-store",
  signal:AbortSignal.timeout(3000)
 });
 if(!response.ok)throw Error("CONTACT_IDENTITY_STORAGE_UNAVAILABLE");
}
export async function processLineWebhook({rawBody,signature,organizationId,env=process.env,requestFn=fetch}={}){
 if(!verifyLineWebhookSignature({rawBody,signature,organizationId,env}))throw Error("LINE_WEBHOOK_SIGNATURE_INVALID");
 let payload;try{payload=JSON.parse(rawBody);}catch{throw Error("LINE_WEBHOOK_INVALID_JSON");}
 const events=Array.isArray(payload?.events)?payload.events.slice(0,100):[];
 const stored=[];
 for(let index=0;index<events.length;index++){
  const event=events[index];
  const row=await insertEvent({event,rawBody,index,organizationId,env,requestFn});
  stored.push(row.webhook_event_id);
  if(row.source_user_id)await ensurePendingIdentity({userId:row.source_user_id,organizationId,env,requestFn});
 }
 return {received:events.length,stored:stored.length};
}
export async function lineConnectorHealth({organizationId,role=null,env=process.env,requestFn=fetch}={}){
 const status=lineConnectorStatus({env,role,organizationId});
 const result={configured:status.configured,connected:false,roleAllowed:status.roleAllowed,sender:null,ready:false,
  checks:{configuration:{ok:status.configured},authentication:{ok:false}}};
 if(role!=="staff"||!status.configured)return result;
 try{
  const cfg=lineConfig(env,organizationId);
  const response=await requestFn("https://api.line.me/v2/bot/info",{
   method:"GET",headers:{Authorization:"Bearer "+cfg.accessToken,Accept:"application/json"},cache:"no-store"
  });
  if(!response.ok)return result;
  const data=await response.json();
  result.connected=true;result.ready=true;result.sender=clean(data?.displayName,120)||"LINE Official Account";
  result.basicId=clean(data?.basicId,120)||null;result.checks.authentication.ok=true;
 }catch{}
 return result;
}
function validatePush(input){
 const contactRef=clean(input?.contactRef,120),body=clean(input?.body,4000),actionId=clean(input?.actionId,140);
 const projectId=clean(input?.projectId,40),recordId=clean(input?.recordId,90);
 if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(contactRef))return {ok:false,code:"LINE_CONTACT_REF_INVALID"};
 if(body.length<1)return {ok:false,code:"LINE_CONTENT_INVALID"};
 if(!/^[A-Za-z0-9_-]{6,140}$/.test(actionId))return {ok:false,code:"LINE_ACTION_INVALID"};
 if(!/^(PRJ|JOB)-\d{1,8}$/.test(projectId)||recordId.length<3)return {ok:false,code:"LINE_CONTEXT_INVALID"};
 return {ok:true,value:{contactRef,body,actionId,projectId,recordId}};
}
async function existingAction({organizationId,actionId,env,requestFn}){
 const cfg=supabaseConfig(env,organizationId),url=new URL(cfg.url+"/rest/v1/stridebrain_message_actions");
 url.searchParams.set("organization_id","eq."+cfg.organizationId);
 url.searchParams.set("action_id","eq."+clean(actionId,140));
 url.searchParams.set("select","status,receipt_id,provider_message_id,accepted_at,recipient,project_id,record_id");
 url.searchParams.set("limit","1");
 const response=await requestFn(url.toString(),{headers:apiHeaders(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)});
 if(!response.ok)throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
 const rows=await response.json();return Array.isArray(rows)?rows[0]||null:null;
}
async function auditAction({organizationId,value,status,receiptId=null,providerMessageId=null,errorCode=null,env,requestFn,now}){
 const cfg=supabaseConfig(env,organizationId),url=new URL(cfg.url+"/rest/v1/stridebrain_message_actions");
 url.searchParams.set("on_conflict","organization_id,action_id");
 const body={
  organization_id:cfg.organizationId,action_id:value.actionId,provider:"line",channel:"line",recipient:value.to,
  subject:"LINE message",project_id:value.projectId,record_id:value.recordId,status,
  receipt_id:receiptId,provider_message_id:providerMessageId,accepted_at:status==="accepted"?new Date(now).toISOString():null,
  error_code:errorCode,updated_at:new Date().toISOString()
 };
 const response=await requestFn(url.toString(),{
  method:"POST",
  headers:apiHeaders(cfg,{"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}),
  body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(3000)
 });
 if(!response.ok)throw Error("MESSAGE_AUDIT_STORAGE_UNAVAILABLE");
}
export async function sendControlledLinePush({organizationId,input,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const cfg=lineConfig(env,organizationId);if(!cfg.configured)throw Error("LINE_CONNECTOR_UNAVAILABLE");
 const checked=validatePush(input);if(!checked.ok)throw Error(checked.code);
 const requested=checked.value;
 const identity=await findVerifiedContactIdentityByContactRef({organizationId,channel:"line",contactRef:requested.contactRef,provider:"line",env,requestFn});
 if(!identity||!LINE_USER_ID.test(String(identity.externalIdentity||"")))throw Error("LINE_RECIPIENT_NOT_VERIFIED");
 const value={...requested,to:identity.externalIdentity,recipientLabel:identity.displayName};
 const existing=await existingAction({organizationId,actionId:value.actionId,env,requestFn});
 if(existing?.status==="accepted"){
  return {receiptId:existing.receipt_id,provider:"line",providerMessageId:existing.provider_message_id,status:"accepted",
   acceptedAt:existing.accepted_at,contactRef:value.contactRef,recipientLabel:value.recipientLabel,subject:"LINE message",
   projectId:existing.project_id,recordId:existing.record_id,actionId:value.actionId,duplicate:true};
 }
 if(existing?.status==="pending")throw Error("LINE_SEND_IN_PROGRESS");
 await auditAction({organizationId,value,status:"pending",env,requestFn,now});
 try{
  const response=await requestFn("https://api.line.me/v2/bot/message/push",{
   method:"POST",
   headers:{Authorization:"Bearer "+cfg.accessToken,"Content-Type":"application/json","X-Line-Retry-Key":deterministicRetryKey(organizationId,value.actionId)},
   body:JSON.stringify({to:value.to,messages:[{type:"text",text:value.body}]}),cache:"no-store"
  });
  if(!response.ok)throw Error("LINE_PROVIDER_REJECTED");
  const requestId=response.headers?.get?.("x-line-request-id")||null;
  const receiptId="line_"+createHash("sha256").update(organizationId+":"+value.actionId+":"+(requestId||now)).digest("hex").slice(0,20);
  await auditAction({organizationId,value,status:"accepted",receiptId,providerMessageId:requestId,env,requestFn,now});
  return {receiptId,provider:"line",providerMessageId:requestId,status:"accepted",acceptedAt:new Date(now).toISOString(),
   contactRef:value.contactRef,recipientLabel:value.recipientLabel,subject:"LINE message",projectId:value.projectId,recordId:value.recordId,actionId:value.actionId};
 }catch(error){
  await auditAction({organizationId,value,status:"failed",errorCode:String(error?.message||"LINE_SEND_FAILED").slice(0,120),env,requestFn,now}).catch(()=>{});
  throw error;
 }
}
