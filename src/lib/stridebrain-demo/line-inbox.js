const clean=(value,max)=>String(value??"").trim().slice(0,max);
const CONTACT_REF=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/;

function config(env=process.env,organizationId){
 const url=clean(env.STRIDEBRAIN_DEMO_SUPABASE_URL,500);
 const key=String(env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"").trim();
 const org=clean(organizationId,120);
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key||!CONTACT_REF.test(org))throw Error("LINE_INBOX_STORAGE_UNAVAILABLE");
 return {url,key,organizationId:org};
}
const headers=(cfg,extra={})=>({apikey:cfg.key,Authorization:"Bearer "+cfg.key,Accept:"application/json",...extra});

export async function listLineIdentityReview({organizationId,env=process.env,requestFn=fetch}={}){
 const cfg=config(env,organizationId);
 const identitiesUrl=new URL(cfg.url+"/rest/v1/stridebrain_contact_identities");
 identitiesUrl.searchParams.set("organization_id","eq."+cfg.organizationId);
 identitiesUrl.searchParams.set("channel","eq.line");
 identitiesUrl.searchParams.set("provider","eq.line");
 identitiesUrl.searchParams.set("status","in.(pending,verified)");
 identitiesUrl.searchParams.set("select","id,contact_ref,display_name,external_identity,status,verification_method,verified_at,created_at,updated_at");
 identitiesUrl.searchParams.set("order","updated_at.desc");
 identitiesUrl.searchParams.set("limit","40");

 const eventsUrl=new URL(cfg.url+"/rest/v1/stridebrain_line_events");
 eventsUrl.searchParams.set("organization_id","eq."+cfg.organizationId);
 eventsUrl.searchParams.set("source_type","eq.user");
 eventsUrl.searchParams.set("select","source_user_id,message_type,message_text,received_at,webhook_event_id");
 eventsUrl.searchParams.set("order","received_at.desc");
 eventsUrl.searchParams.set("limit","100");

 const [identityResponse,eventResponse]=await Promise.all([
  requestFn(identitiesUrl.toString(),{headers:headers(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)}),
  requestFn(eventsUrl.toString(),{headers:headers(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)})
 ]);
 if(!identityResponse.ok||!eventResponse.ok)throw Error("LINE_INBOX_STORAGE_UNAVAILABLE");
 const identities=await identityResponse.json(),events=await eventResponse.json();
 const latest=new Map();
 for(const event of Array.isArray(events)?events:[]){
  const userId=String(event?.source_user_id||"");
  if(!userId||latest.has(userId))continue;
  latest.set(userId,{
   messageType:String(event?.message_type||"").slice(0,40),
   messageText:event?.message_type==="text"?String(event?.message_text||"").slice(0,800):"",
   receivedAt:event?.received_at||null,
   eventId:String(event?.webhook_event_id||"").slice(0,180)
  });
 }
 return (Array.isArray(identities)?identities:[]).map(row=>{
  const event=latest.get(String(row.external_identity||""))||null;
  return {
   identityId:Number(row.id),
   contactRef:row.contact_ref||null,
   displayName:String(row.display_name||"LINE contact").slice(0,120),
   status:row.status==="verified"?"verified":"pending",
   verificationMethod:String(row.verification_method||"").slice(0,80),
   verifiedAt:row.verified_at||null,
   observedAt:row.created_at||null,
   updatedAt:row.updated_at||null,
   latestMessage:event?.messageText||"",
   latestMessageType:event?.messageType||null,
   latestMessageAt:event?.receivedAt||null,
   latestEventId:event?.eventId||null
  };
 });
}

export async function verifyObservedLineIdentity({
 organizationId,identityId,contactRef,displayName,env=process.env,requestFn=fetch,now=Date.now()
}={}){
 const cfg=config(env,organizationId),id=Number(identityId),ref=clean(contactRef,120),name=clean(displayName,120);
 if(!Number.isInteger(id)||id<1||id>Number.MAX_SAFE_INTEGER)throw Error("LINE_IDENTITY_INVALID");
 if(!CONTACT_REF.test(ref)||name.length<2)throw Error("LINE_CONTACT_LINK_INVALID");
 const url=new URL(cfg.url+"/rest/v1/stridebrain_contact_identities");
 url.searchParams.set("organization_id","eq."+cfg.organizationId);
 url.searchParams.set("id","eq."+id);
 url.searchParams.set("channel","eq.line");
 url.searchParams.set("provider","eq.line");
 url.searchParams.set("status","eq.pending");
 url.searchParams.set("select","id,contact_ref,display_name,status,verified_at,verification_method");
 const verifiedAt=new Date(now).toISOString();
 const response=await requestFn(url.toString(),{
  method:"PATCH",
  headers:headers(cfg,{"Content-Type":"application/json",Prefer:"return=representation"}),
  body:JSON.stringify({
   contact_ref:ref,
   display_name:name,
   status:"verified",
   verification_method:"staff-confirmed-link",
   verified_at:verifiedAt,
   verified_by:"stridebrain-staff",
   updated_at:verifiedAt
  }),
  cache:"no-store",
  signal:AbortSignal.timeout(3000)
 });
 if(!response.ok)throw Error("LINE_IDENTITY_VERIFY_FAILED");
 const rows=await response.json(),row=Array.isArray(rows)?rows[0]:null;
 if(!row)throw Error("LINE_IDENTITY_NOT_PENDING");
 return {
  identityId:Number(row.id),
  contactRef:row.contact_ref,
  displayName:row.display_name,
  status:row.status,
  verifiedAt:row.verified_at,
  verificationMethod:row.verification_method
 };
}
