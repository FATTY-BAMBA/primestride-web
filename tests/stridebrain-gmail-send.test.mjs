import test from "node:test";
import assert from "node:assert/strict";
const {completeGoogleOAuth,DEFAULT_GOOGLE_REDIRECT_URI}=await import("../src/lib/stridebrain-demo/google-oauth.js");
const {sendControlledGmail}=await import("../src/lib/stridebrain-demo/gmail-connector.js");

const organizationId="org-demo";
const env={
 GOOGLE_OAUTH_CLIENT_ID:"client-id.apps.googleusercontent.com",
 GOOGLE_OAUTH_CLIENT_SECRET:"client-secret",
 STRIDEBRAIN_GOOGLE_SENDER:"hello@primestrideai.com",
 STRIDEBRAIN_GOOGLE_ALLOWED_RECIPIENTS:"test@example.com",
 STRIDEBRAIN_DEMO_OPERATOR_SECRET:"operator-secret-at-least-twenty-characters",
 STRIDEBRAIN_DEMO_SUPABASE_URL:"https://demo-project.supabase.co",
 STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY:"server-secret",
 STRIDEBRAIN_DEMO_ORGANIZATION_ID:organizationId
};

function createBackend(){
 let connection=null,gmailSends=0;
 const actions=new Map();
 const requestFn=async(url,options={})=>{
  const u=String(url);
  if(u==="https://oauth2.googleapis.com/token"){
   const body=String(options.body);
   if(body.includes("grant_type=authorization_code")){
    return {ok:true,json:async()=>({access_token:"bootstrap-access",refresh_token:"refresh-secret",scope:"https://www.googleapis.com/auth/gmail.send",token_type:"Bearer"})};
   }
   assert.match(body,/grant_type=refresh_token/);
   assert.match(body,/refresh_token=refresh-secret/);
   return {ok:true,json:async()=>({access_token:"fresh-access",expires_in:3600,token_type:"Bearer"})};
  }
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_google_connections")){
   if(options.method==="POST"){connection=JSON.parse(options.body);return {ok:true,status:201,json:async()=>null};}
   return {ok:true,status:200,json:async()=>connection?[{
    provider:connection.provider,sender:connection.sender,scope:connection.scope,connected_at:connection.connected_at,
    encrypted_refresh_token:connection.encrypted_refresh_token
   }]:[]};
  }
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_contact_identities")){
   const parsed=new URL(u);
   const identity=(parsed.searchParams.get("normalized_identity")||"").replace(/^eq\./,"");
   const verified=new Map([
    ["test@example.com",{contact_ref:"contact-test",display_name:"Test Recipient",channel:"email",provider:"google-workspace",external_identity:"test@example.com",verified_at:"2026-10-29T08:00:00Z",verification_method:"pilot-admin-approved"}]
   ]);
   return {ok:true,status:200,json:async()=>verified.has(identity)?[verified.get(identity)]:[]};
  }
  if(u.startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_message_actions")){
   const parsed=new URL(u),org=(parsed.searchParams.get("organization_id")||"").replace(/^eq\./,"");
   const action=(parsed.searchParams.get("action_id")||"").replace(/^eq\./,"");
   if(options.method==="POST"){
    const row=JSON.parse(options.body),key=row.organization_id+":"+row.action_id;
    if(actions.has(key))return {ok:false,status:409,json:async()=>({})};
    actions.set(key,row);return {ok:true,status:201,json:async()=>null};
   }
   if(options.method==="PATCH"){
    const key=org+":"+action,current=actions.get(key);actions.set(key,{...current,...JSON.parse(options.body)});return {ok:true,status:204,json:async()=>null};
   }
   const row=actions.get(org+":"+action);
   return {ok:true,status:200,json:async()=>row?[{
    status:row.status,receipt_id:row.receipt_id,provider_message_id:row.provider_message_id,accepted_at:row.accepted_at,
    recipient:row.recipient,subject:row.subject,provider:row.provider,project_id:row.project_id,record_id:row.record_id,error_code:row.error_code
   }]:[]};
  }
  if(u==="https://gmail.googleapis.com/gmail/v1/users/me/messages/send"){
   gmailSends++;
   assert.equal(options.headers.Authorization,"Bearer fresh-access");
   const body=JSON.parse(options.body);
   const decoded=Buffer.from(body.raw,"base64url").toString("utf8");
   assert.match(decoded,/From: hello@primestrideai\.com/);
   assert.match(decoded,/To: test@example\.com/);
   assert.match(decoded,/Content-Type: text\/plain; charset="UTF-8"/);
   assert.match(decoded,/Please confirm the revised quote\./);
   return {ok:true,status:200,json:async()=>({id:"gmail-message-123",threadId:"thread-123"})};
  }
  throw Error("unexpected "+u);
 };
 return {requestFn,actions,get gmailSends(){return gmailSends;}};
}

test("approved Gmail send refreshes token, sends once and records durable receipt",async()=>{
 const backend=createBackend(),now=1761386400000;
 await completeGoogleOAuth({code:"auth-code",redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env,requestFn:backend.requestFn,now});
 const input={to:"test@example.com",subject:"Quote follow-up",body:"Please confirm the revised quote.",actionId:"action_abc123",projectId:"PRJ-107",recordId:"APR-1026"};
 const receipt=await sendControlledGmail({organizationId,input,env,requestFn:backend.requestFn,now:now+1000});
 assert.equal(receipt.provider,"gmail");
 assert.equal(receipt.providerMessageId,"gmail-message-123");
 assert.equal(receipt.status,"accepted");
 assert.equal(backend.gmailSends,1);
 const stored=backend.actions.get(organizationId+":"+input.actionId);
 assert.equal(stored.status,"accepted");
 assert.equal(stored.recipient,"test@example.com");
 assert.equal(stored.provider_message_id,"gmail-message-123");

 const duplicate=await sendControlledGmail({organizationId,input,env,requestFn:backend.requestFn,now:now+2000});
 assert.equal(duplicate.duplicate,true);
 assert.equal(backend.gmailSends,1);
});

test("Gmail send rejects recipients outside the controlled allowlist",async()=>{
 const backend=createBackend(),now=1761386400000;
 await completeGoogleOAuth({code:"auth-code",redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env,requestFn:backend.requestFn,now});
 await assert.rejects(()=>sendControlledGmail({organizationId,env,requestFn:backend.requestFn,now:now+1000,input:{
  to:"outside@example.com",subject:"Follow-up",body:"This should not send.",actionId:"action_abc124",projectId:"PRJ-107",recordId:"APR-1026"
 }}),/EMAIL_RECIPIENT_NOT_ALLOWED/);
 assert.equal(backend.gmailSends,0);
});
