import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
const {
 verifyLineWebhookSignature,lineWebhookSignatureDiagnostic,processLineWebhook,lineConnectorHealth,sendControlledLinePush,DEFAULT_LINE_WEBHOOK_URL
}=await import("../src/lib/stridebrain-demo/line-connector.js");

const organizationId="org-demo";
const userId="U0123456789abcdef0123456789abcdef";
const env={
 STRIDEBRAIN_LINE_CHANNEL_ID:"2001234567",
 STRIDEBRAIN_LINE_CHANNEL_SECRET:"line-secret-at-least-sixteen",
 STRIDEBRAIN_LINE_CHANNEL_ACCESS_TOKEN:"line-access-token-at-least-twenty-characters",
 STRIDEBRAIN_DEMO_ORGANIZATION_ID:organizationId,
 STRIDEBRAIN_DEMO_SUPABASE_URL:"https://demo-project.supabase.co",
 STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY:"server-secret"
};

function signature(raw){return createHmac("sha256",env.STRIDEBRAIN_LINE_CHANNEL_SECRET).update(raw).digest("base64");}

test("LINE webhook signature is verified against the raw body",()=>{
 const raw=JSON.stringify({events:[]});
 assert.equal(verifyLineWebhookSignature({rawBody:raw,signature:signature(raw),organizationId,env}),true);
 assert.equal(verifyLineWebhookSignature({rawBody:raw+"x",signature:signature(raw),organizationId,env}),false);
});

test("LINE webhook stores bounded event and creates pending identity",async()=>{
 const writes=[];
 const raw=JSON.stringify({events:[{
  type:"message",webhookEventId:"01HWEBHOOK",timestamp:1761386400000,replyToken:"reply-token",
  deliveryContext:{isRedelivery:false},
  source:{type:"user",userId},
  message:{id:"123456789",type:"text",text:"Hello from LINE"}
 }]});
 const requestFn=async(url,options={})=>{
  const u=String(url);
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_line_events")){
   writes.push({kind:"event",body:JSON.parse(options.body)});return {ok:true,status:201,json:async()=>null};
  }
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_contact_identities")){
   writes.push({kind:"identity",body:JSON.parse(options.body)});return {ok:true,status:201,json:async()=>null};
  }
  throw Error("unexpected "+u);
 };
 const result=await processLineWebhook({rawBody:raw,signature:signature(raw),organizationId,env,requestFn});
 assert.deepEqual(result,{received:1,stored:1});
 assert.equal(writes[0].body.message_text,"Hello from LINE");
 assert.equal(writes[0].body.source_user_id,userId);
 assert.equal(writes[1].body.status,"pending");
 assert.equal(writes[1].body.external_identity,userId);
});

test("invalid LINE webhook signature fails closed before storage",async()=>{
 let calls=0;
 const raw=JSON.stringify({events:[]});
 await assert.rejects(()=>processLineWebhook({rawBody:raw,signature:"invalid",organizationId,env,requestFn:async()=>{calls++;}}),/LINE_WEBHOOK_SIGNATURE_INVALID/);
 assert.equal(calls,0);
});

test("LINE health verifies the channel access token with bot info",async()=>{
 const health=await lineConnectorHealth({organizationId,role:"staff",env,requestFn:async(url,options={})=>{
  assert.equal(url,"https://api.line.me/v2/bot/info");
  assert.equal(options.headers.Authorization,"Bearer "+env.STRIDEBRAIN_LINE_CHANNEL_ACCESS_TOKEN);
  return {ok:true,json:async()=>({userId:"Uaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",basicId:"@stridebrain",displayName:"StrideBrain Demo"})};
 }});
 assert.equal(health.ready,true);
 assert.equal(health.sender,"StrideBrain Demo");
 assert.equal(health.basicId,"@stridebrain");
 assert.equal(DEFAULT_LINE_WEBHOOK_URL,"https://line-webhook.primestrideai.com/api/stridebrain-demo/line/webhook");
});

test("controlled LINE push requires verified identity and is idempotent",async()=>{
 const actions=new Map(),calls={push:0};
 const requestFn=async(url,options={})=>{
  const u=String(url);
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_contact_identities")){
   return {ok:true,json:async()=>[{contact_ref:"contact-line",display_name:"Pilot LINE user",channel:"line",provider:"line",external_identity:userId,verified_at:"2026-10-29T08:00:00Z",verification_method:"pilot-admin-approved"}]};
  }
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_message_actions")){
   const parsed=new URL(u),org=(parsed.searchParams.get("organization_id")||"").replace(/^eq\./,""),action=(parsed.searchParams.get("action_id")||"").replace(/^eq\./,"");
   if(options.method==="POST"){
    const row=JSON.parse(options.body),key=row.organization_id+":"+row.action_id;actions.set(key,{...(actions.get(key)||{}),...row});return {ok:true,status:201,json:async()=>null};
   }
   const row=actions.get(org+":"+action);
   return {ok:true,json:async()=>row?[{
    status:row.status,receipt_id:row.receipt_id,provider_message_id:row.provider_message_id,accepted_at:row.accepted_at,
    recipient:row.recipient,project_id:row.project_id,record_id:row.record_id
   }]:[]};
  }
  if(u==="https://api.line.me/v2/bot/message/push"){
   calls.push++;
   assert.match(options.headers["X-Line-Retry-Key"],/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
   const payload=JSON.parse(options.body);
   assert.equal(payload.to,userId);
   assert.equal(payload.messages[0].text,"Please confirm the site update.");
   return {ok:true,status:200,headers:{get:name=>name.toLowerCase()==="x-line-request-id"?"line-request-123":null},json:async()=>({})};
  }
  throw Error("unexpected "+u);
 };
 const input={to:userId,body:"Please confirm the site update.",actionId:"line_action_123",projectId:"PRJ-107",recordId:"APR-1026"};
 const first=await sendControlledLinePush({organizationId,input,env,requestFn,now:1761386400000});
 assert.equal(first.provider,"line");assert.equal(first.status,"accepted");assert.equal(calls.push,1);
 const second=await sendControlledLinePush({organizationId,input,env,requestFn,now:1761386401000});
 assert.equal(second.duplicate,true);assert.equal(calls.push,1);
});

test("controlled LINE push rejects unverified LINE user IDs",async()=>{
 const requestFn=async(url,options={})=>{
  if(String(url).includes("stridebrain_contact_identities"))return {ok:true,json:async()=>[]};
  if(String(url).includes("stridebrain_message_actions"))return {ok:true,json:async()=>[]};
  throw Error("unexpected "+url);
 };
 await assert.rejects(()=>sendControlledLinePush({organizationId,env,requestFn,input:{
  to:userId,body:"Should not send",actionId:"line_action_124",projectId:"PRJ-107",recordId:"APR-1026"
 }}),/LINE_RECIPIENT_NOT_VERIFIED/);
});

test("LINE signature diagnostics expose only safe fingerprints",()=>{
 const raw=JSON.stringify({destination:"U0123456789abcdef0123456789abcdef",events:[]});
 const diag=lineWebhookSignatureDiagnostic({rawBody:raw,signature:signature(raw),organizationId,env});
 assert.equal(diag.configured,true);
 assert.equal(diag.channelId,"2001234567");
 assert.equal(diag.signaturePresent,true);
 assert.equal(diag.signatureBytes,32);
 assert.equal(typeof diag.bodyHash,"string");
 assert.equal(typeof diag.secretFingerprint,"string");
 assert.equal("channelSecret" in diag,false);
 assert.equal("accessToken" in diag,false);
 assert.doesNotMatch(JSON.stringify(diag),/line-secret-at-least-sixteen/);
});
