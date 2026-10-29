import test from "node:test";
import assert from "node:assert/strict";
const {findVerifiedContactIdentity,listVerifiedContactIdentities}=await import("../src/lib/stridebrain-demo/contact-identity-registry.js");

const env={
 STRIDEBRAIN_DEMO_SUPABASE_URL:"https://demo-project.supabase.co",
 STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY:"server-secret"
};

test("verified contact lookup is organization and channel scoped",async()=>{
 const requestFn=async(url,options={})=>{
  const parsed=new URL(url);
  assert.equal(parsed.searchParams.get("organization_id"),"eq.org-demo");
  assert.equal(parsed.searchParams.get("channel"),"eq.email");
  assert.equal(parsed.searchParams.get("normalized_identity"),"eq.person@example.com");
  assert.equal(parsed.searchParams.get("status"),"eq.verified");
  assert.equal(parsed.searchParams.get("provider"),"eq.google-workspace");
  return {ok:true,json:async()=>[{
   contact_ref:"contact-123",display_name:"Test Person",channel:"email",provider:"google-workspace",
   external_identity:"person@example.com",verified_at:"2026-10-29T08:00:00Z",verification_method:"pilot-admin-approved"
  }]};
 };
 const identity=await findVerifiedContactIdentity({
  organizationId:"org-demo",channel:"email",externalIdentity:"Person@Example.com",
  provider:"google-workspace",env,requestFn
 });
 assert.equal(identity.contactRef,"contact-123");
 assert.equal(identity.externalIdentity,"person@example.com");
});

test("unverified contact lookup returns null",async()=>{
 const requestFn=async()=>({ok:true,json:async()=>[]});
 const identity=await findVerifiedContactIdentity({
  organizationId:"org-demo",channel:"email",externalIdentity:"unknown@example.com",
  provider:"google-workspace",env,requestFn
 });
 assert.equal(identity,null);
});

test("verified contact list never exposes secrets",async()=>{
 const requestFn=async()=>({ok:true,json:async()=>[{
  contact_ref:"pilot-external-1",display_name:"Pilot external recipient",channel:"email",
  provider:"google-workspace",external_identity:"afatty13@gmail.com",
  verified_at:"2026-10-29T08:00:00Z",verification_method:"pilot-admin-approved"
 }]});
 const rows=await listVerifiedContactIdentities({organizationId:"org-demo",channel:"email",env,requestFn});
 assert.equal(rows.length,1);
 assert.equal(rows[0].externalIdentity,"afatty13@gmail.com");
 assert.equal("secret" in rows[0],false);
 assert.equal("token" in rows[0],false);
});
