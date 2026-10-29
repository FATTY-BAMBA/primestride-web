import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {listLineIdentityReview,verifyObservedLineIdentity}=await import("../src/lib/stridebrain-demo/line-inbox.js");

const env={
 STRIDEBRAIN_DEMO_SUPABASE_URL:"https://demo-project.supabase.co",
 STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY:"server-secret"
};
const organizationId="org-demo";
const rawUserId="U0123456789abcdef0123456789abcdef";

test("LINE identity review returns safe staff metadata without raw LINE user ID",async()=>{
 const requestFn=async(url)=>{
  const u=String(url);
  if(u.includes("stridebrain_contact_identities"))return {ok:true,json:async()=>[{
   id:3,contact_ref:null,display_name:"Unlinked LINE contact",external_identity:rawUserId,status:"pending",
   verification_method:"webhook-observed",verified_at:null,created_at:"2026-10-30T06:33:50Z",updated_at:"2026-10-30T06:33:50Z"
  }]};
  if(u.includes("stridebrain_line_events"))return {ok:true,json:async()=>[{
   source_user_id:rawUserId,message_type:"text",message_text:"StrideBrain LINE pilot test",
   received_at:"2026-10-30T06:33:49Z",webhook_event_id:"01M64WRG8CMNHV6CWRVRBD8DRA"
  }]};
  throw Error("unexpected "+u);
 };
 const rows=await listLineIdentityReview({organizationId,env,requestFn});
 assert.equal(rows.length,1);
 assert.equal(rows[0].identityId,3);
 assert.equal(rows[0].status,"pending");
 assert.equal(rows[0].latestMessage,"StrideBrain LINE pilot test");
 assert.equal("externalIdentity" in rows[0],false);
 assert.doesNotMatch(JSON.stringify(rows),new RegExp(rawUserId));
});

test("staff verification links only the pending organization-scoped LINE identity",async()=>{
 let patch=null;
 const requestFn=async(url,options={})=>{
  const parsed=new URL(url);
  assert.equal(parsed.searchParams.get("organization_id"),"eq.org-demo");
  assert.equal(parsed.searchParams.get("id"),"eq.3");
  assert.equal(parsed.searchParams.get("channel"),"eq.line");
  assert.equal(parsed.searchParams.get("provider"),"eq.line");
  assert.equal(parsed.searchParams.get("status"),"eq.pending");
  patch=JSON.parse(options.body);
  return {ok:true,json:async()=>[{
   id:3,contact_ref:patch.contact_ref,display_name:patch.display_name,status:"verified",
   verified_at:patch.verified_at,verification_method:patch.verification_method
  }]};
 };
 const result=await verifyObservedLineIdentity({
  organizationId,identityId:3,contactRef:"contact-mei-lin",displayName:"Mei Lin",env,requestFn,now:1761777600000
 });
 assert.equal(result.status,"verified");
 assert.equal(result.contactRef,"contact-mei-lin");
 assert.equal(patch.verification_method,"staff-confirmed-link");
 assert.equal(patch.verified_by,"stridebrain-staff");
});

test("LINE identity APIs are staff-only and derive organization server-side",()=>{
 const inbox=readFileSync("src/app/api/stridebrain-demo/line/inbox/route.js","utf8");
 const verify=readFileSync("src/app/api/stridebrain-demo/line/identities/verify/route.js","utf8");
 for(const route of [inbox,verify]){
  assert.match(route,/getSessionStatus/);
  assert.match(route,/session\.role!==["']staff["']/);
  assert.match(route,/resolveRuntimeContext/);
  assert.match(route,/organizationId:context\.organizationId/);
 }
 assert.match(verify,/LINE_ORIGIN_DENIED/);
});

test("AI Team LINE workflow uses safe contact refs and channel-specific action id",()=>{
 const app=readFileSync("public/stridebrain-demo/app.js","utf8");
 const view=readFileSync("public/stridebrain-demo/views-ai-team.js","utf8");
 assert.match(app,/providerId:"line",channel:"line",contactRef/);
 assert.match(app,/actionId:item\.id\+"_line"/);
 assert.match(app,/recordLineReceipt/);
 assert.match(view,/contactIdForName/);
 assert.match(view,/lineIdentityVerify/);
 assert.match(view,/agentLinePrepare/);
 assert.match(view,/agentLineSend/);
 assert.equal(view.includes("external_identity"),false);
});
