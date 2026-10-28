import test from "node:test";
import assert from "node:assert/strict";
import {register} from "node:module";
import {readFileSync} from "node:fs";
register("./helpers/stridebrain-json-loader.mjs",import.meta.url);
const {communicationConnectionsSnapshot,messageConnectorStatus,checkMessageConnectorHealth,sendApprovedMessage}=await import("../src/lib/stridebrain-demo/message-connectors.js");
const {buildContactChannelRegistry,linkedChannelFor}=await import("../public/stridebrain-demo/contact-channels.js");

const env={
 STRIDEBRAIN_EMAIL_ENABLED:"true",
 STRIDEBRAIN_EMAIL_PROVIDER:"microsoft-graph",
 STRIDEBRAIN_EMAIL_SENDER:"ops@example.com",
 STRIDEBRAIN_EMAIL_ALLOWED_RECIPIENTS:"leo@example.com",
 STRIDEBRAIN_MS_TENANT_ID:"tenant",
 STRIDEBRAIN_MS_CLIENT_ID:"client",
 STRIDEBRAIN_MS_CLIENT_SECRET:"secret",
 STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.com",
 STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"redis-token"
};

test("connection snapshot exposes provider capabilities without secrets",()=>{
 const snap=communicationConnectionsSnapshot({role:"staff",env,organizationId:"org-demo"});
 assert.equal(snap.organizationId,"org-demo");
 assert.equal(snap.storage,"pilot-env");
 assert.deepEqual(snap.connections.map(x=>x.id),["microsoft365","line","google-workspace"]);
 const ms=snap.connections.find(x=>x.id==="microsoft365");
 assert.equal(ms.configured,true);assert.equal(ms.sender,"ops@example.com");assert.equal(ms.roleAllowed,true);
 assert.equal("apiKey" in ms,false);assert.equal("secret" in ms,false);
 const line=snap.connections.find(x=>x.id==="line");assert.equal(line.implemented,false);assert.equal(line.configured,false);
});
test("connector registry rejects unknown, channel mismatch and unimplemented providers",async()=>{
 await assert.rejects(()=>sendApprovedMessage({providerId:"unknown",channel:"email"}),/MESSAGE_PROVIDER_UNKNOWN/);
 await assert.rejects(()=>sendApprovedMessage({providerId:"microsoft365",channel:"line"}),/MESSAGE_CHANNEL_MISMATCH/);
 await assert.rejects(()=>sendApprovedMessage({providerId:"line",channel:"line"}),/MESSAGE_PROVIDER_NOT_IMPLEMENTED/);
 assert.equal(messageConnectorStatus({providerId:"google-workspace",role:"staff",env}).implemented,false);
});
test("generic Microsoft adapter preserves controlled send receipt",async()=>{
 const store=new Map();
 const requestFn=async(url,options={})=>{
  if(url==="https://redis.example.com/pipeline"){
   const commands=JSON.parse(options.body),results=commands.map(cmd=>{const [op,key,...args]=cmd;if(op==="GET")return {result:store.get(key)??null};if(op==="SET"){if(args.includes("NX")&&store.has(key))return {result:null};store.set(key,args[0]);return {result:"OK"};}if(op==="DEL"){store.delete(key);return {result:1};}return {result:null};});
   return {ok:true,json:async()=>results};
  }
  if(url.includes("login.microsoftonline.com"))return {ok:true,json:async()=>({access_token:"token"})};
  if(url.includes("graph.microsoft.com"))return {ok:true,status:202};
  throw Error("unexpected "+url);
 };
 const receipt=await sendApprovedMessage({providerId:"microsoft365",channel:"email",sessionScope:"scope",env,requestFn,now:1761386400000,input:{to:"leo@example.com",subject:"Follow-up",body:"Please confirm status.",actionId:"message_abc123",projectId:"PRJ-104",recordId:"WO-1040"}});
 assert.equal(receipt.provider,"microsoft-graph");assert.equal(receipt.status,"accepted");
});
test("contact-channel registry never invents email or LINE identities",()=>{
 const seed=JSON.parse(readFileSync("public/stridebrain-interiors/seed.json","utf8"));
 const registry=buildContactChannelRegistry(seed);
 assert.ok(registry.length>0);
 assert.ok(registry.every(c=>c.channels.every(ch=>ch.status==="unlinked"&&ch.externalIdentity===null&&ch.verifiedAt===null)));
 assert.equal(linkedChannelFor(registry,{contactId:registry[0].contactId,channel:"line"}),null);
});

test("unimplemented connector health fails closed without provider calls",async()=>{
 let calls=0;
 const health=await checkMessageConnectorHealth({providerId:"line",role:"staff",env,requestFn:async()=>{calls++;throw Error("must not call");}});
 assert.equal(health.known,true);
 assert.equal(health.implemented,false);
 assert.equal(health.ready,false);
 assert.equal(calls,0);
});

test("staff connections endpoint upgrades Google from planned fallback to live OAuth status",()=>{
 const route=readFileSync("src/app/api/stridebrain-demo/connections/status/route.js","utf8");
 assert.match(route,/googleConnectionStatus/);
 assert.match(route,/conn\.id==="google-workspace"/);
 assert.match(route,/implemented:true/);
 assert.match(route,/configured:google\.configured===true/);
 assert.match(route,/connected:google\.connected===true/);
 const browser=readFileSync("public/stridebrain-demo/app.js","utf8");
 assert.equal(browser.includes('/api/stridebrain-demo/google/status'),false);
});
