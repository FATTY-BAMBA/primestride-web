import test from "node:test";
import assert from "node:assert/strict";
const {emailConnectorStatus,validateEmailRequest,sendControlledEmail}=await import("../src/lib/stridebrain-demo/email-connector.js");

const env={
 STRIDEBRAIN_EMAIL_ENABLED:"true",
 STRIDEBRAIN_EMAIL_PROVIDER:"microsoft-graph",
 STRIDEBRAIN_EMAIL_SENDER:"ops@example.com",
 STRIDEBRAIN_EMAIL_ALLOWED_RECIPIENTS:"leo@example.com,hanna@example.com",
 STRIDEBRAIN_MS_TENANT_ID:"tenant",
 STRIDEBRAIN_MS_CLIENT_ID:"client",
 STRIDEBRAIN_MS_CLIENT_SECRET:"secret",
 STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.com",
 STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"redis-token"
};
const input={to:"leo@example.com",subject:"Project follow-up",body:"Please confirm the current handoff status.",actionId:"decision_abc123",projectId:"PRJ-104",recordId:"WO-1040"};

test("email connector fails closed unless fully configured and staff-only",()=>{
 assert.equal(emailConnectorStatus({env,role:"staff"}).configured,true);
 assert.equal(emailConnectorStatus({env,role:"staff"}).roleAllowed,true);
 assert.equal(emailConnectorStatus({env,role:"guest"}).roleAllowed,false);
 assert.equal(emailConnectorStatus({env:{...env,STRIDEBRAIN_MS_CLIENT_SECRET:""},role:"staff"}).configured,false);
});
test("email request enforces exact recipient allowlist and bounded context",()=>{
 assert.equal(validateEmailRequest(input,{env}).ok,true);
 assert.equal(validateEmailRequest({...input,to:"outside@example.com"},{env}).code,"EMAIL_RECIPIENT_NOT_ALLOWED");
 assert.equal(validateEmailRequest({...input,to:"not-an-email"},{env}).code,"EMAIL_RECIPIENT_INVALID");
 assert.equal(validateEmailRequest({...input,projectId:"PRJ-X"},{env}).code,"EMAIL_CONTEXT_INVALID");
});
test("controlled Microsoft Graph send is idempotent and records accepted not delivered",async()=>{
 const store=new Map(),calls={graph:0,token:0,redis:0};
 const requestFn=async(url,options={})=>{
  if(url==="https://redis.example.com/pipeline"){
   calls.redis++;
   const commands=JSON.parse(options.body),results=commands.map(cmd=>{
    const [op,key,...args]=cmd;
    if(op==="GET")return {result:store.get(key)??null};
    if(op==="SET"){
     if(args.includes("NX")&&store.has(key))return {result:null};
     store.set(key,args[0]);return {result:"OK"};
    }
    if(op==="DEL"){store.delete(key);return {result:1};}
    return {result:null};
   });
   return {ok:true,json:async()=>results};
  }
  if(url.includes("login.microsoftonline.com")){calls.token++;return {ok:true,json:async()=>({access_token:"token"})};}
  if(url.includes("graph.microsoft.com")){calls.graph++;assert.equal(options.method,"POST");const body=JSON.parse(options.body);assert.equal(body.message.toRecipients.length,1);assert.equal(body.message.toRecipients[0].emailAddress.address,"leo@example.com");return {status:202,ok:true};}
  throw Error("unexpected "+url);
 };
 const a=await sendControlledEmail({sessionScope:"scope",input,env,requestFn,now:1761386400000});
 assert.equal(a.status,"accepted");assert.equal("delivered" in a,false);assert.equal(calls.graph,1);
 const b=await sendControlledEmail({sessionScope:"scope",input,env,requestFn,now:1761386460000});
 assert.equal(b.duplicate,true);assert.equal(b.receiptId,a.receiptId);assert.equal(calls.graph,1);
});
test("provider failure clears pending idempotency reservation for a later retry",async()=>{
 const store=new Map();let graphCalls=0;
 const requestFn=async(url,options={})=>{
  if(url==="https://redis.example.com/pipeline"){
   const commands=JSON.parse(options.body),results=commands.map(cmd=>{const [op,key,...args]=cmd;if(op==="GET")return {result:store.get(key)??null};if(op==="SET"){if(args.includes("NX")&&store.has(key))return {result:null};store.set(key,args[0]);return {result:"OK"};}if(op==="DEL"){store.delete(key);return {result:1};}return {result:null};});
   return {ok:true,json:async()=>results};
  }
  if(url.includes("login.microsoftonline.com"))return {ok:true,json:async()=>({access_token:"token"})};
  if(url.includes("graph.microsoft.com")){graphCalls++;return {status:500,ok:false};}
 };
 await assert.rejects(()=>sendControlledEmail({sessionScope:"scope2",input:{...input,actionId:"decision_retry1"},env,requestFn}),/EMAIL_PROVIDER_REJECTED/);
 assert.equal(graphCalls,1);
 assert.equal([...store.values()].includes("pending"),false);
});
