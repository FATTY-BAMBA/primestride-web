import test from "node:test";
import assert from "node:assert/strict";
import {resolveRuntimeContext} from "../src/lib/stridebrain-demo/runtime-context.js";

test("demo runtime derives controlled organization context from server environment",()=>{
 const ctx=resolveRuntimeContext({
  session:{active:true,role:"staff"},
  env:{STRIDEBRAIN_RUNTIME_MODE:"demo",STRIDEBRAIN_DEMO_ORGANIZATION_ID:"demo-horizon"}
 });
 assert.deepEqual(ctx,{
  ok:true,mode:"demo",organizationId:"demo-horizon",role:"staff",dataClassification:"DEMO_SYNTHETIC",membershipVerified:false
 });
});

test("demo runtime has an explicit safe fixture fallback",()=>{
 const ctx=resolveRuntimeContext({session:{active:false,role:null},env:{}});
 assert.equal(ctx.ok,true);
 assert.equal(ctx.organizationId,"demo-workspace");
 assert.equal(ctx.dataClassification,"DEMO_SYNTHETIC");
});

test("tenant runtime fails closed without verified membership context",()=>{
 const ctx=resolveRuntimeContext({
  session:{active:true,role:"owner",organizationId:"org-client",membershipVerified:false},
  env:{STRIDEBRAIN_RUNTIME_MODE:"tenant"}
 });
 assert.equal(ctx.ok,false);
 assert.equal(ctx.code,"TENANT_CONTEXT_REQUIRED");
 assert.equal(ctx.organizationId,null);
});

test("tenant runtime accepts only server-verified organization membership",()=>{
 const ctx=resolveRuntimeContext({
  session:{active:true,role:"owner",organizationId:"org-client-001",membershipVerified:true},
  env:{STRIDEBRAIN_RUNTIME_MODE:"tenant"}
 });
 assert.equal(ctx.ok,true);
 assert.equal(ctx.mode,"tenant");
 assert.equal(ctx.organizationId,"org-client-001");
 assert.equal(ctx.dataClassification,"TENANT_PRIVATE");
 assert.equal(ctx.membershipVerified,true);
});
