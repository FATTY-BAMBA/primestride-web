const clean=(value,max)=>String(value??"").trim().slice(0,max);

function supabaseConfig(env=process.env){
 const url=clean(env.STRIDEBRAIN_DEMO_SUPABASE_URL,500);
 const key=String(env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"").trim();
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key)throw Error("CONTACT_IDENTITY_STORAGE_UNAVAILABLE");
 return {url,key};
}
function headers(cfg){return {apikey:cfg.key,Authorization:"Bearer "+cfg.key,Accept:"application/json"};}
function normalized(channel,value){
 const raw=clean(value,240);
 if(channel==="email")return raw.toLowerCase();
 if(channel==="line")return raw;
 return raw;
}
export async function findVerifiedContactIdentity({
 organizationId,channel,externalIdentity,provider=null,env=process.env,requestFn=fetch
}={}){
 const org=clean(organizationId,120),identity=normalized(channel,externalIdentity);
 if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(org)||!["email","line"].includes(channel)||!identity)return null;
 const cfg=supabaseConfig(env),url=new URL(cfg.url+"/rest/v1/stridebrain_contact_identities");
 url.searchParams.set("organization_id","eq."+org);
 url.searchParams.set("channel","eq."+channel);
 url.searchParams.set("normalized_identity","eq."+identity);
 url.searchParams.set("status","eq.verified");
 if(provider)url.searchParams.set("provider","eq."+clean(provider,80));
 url.searchParams.set("select","contact_ref,display_name,channel,provider,external_identity,verified_at,verification_method");
 url.searchParams.set("limit","1");
 const response=await requestFn(url.toString(),{headers:headers(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)});
 if(!response.ok)throw Error("CONTACT_IDENTITY_STORAGE_UNAVAILABLE");
 const rows=await response.json(),row=Array.isArray(rows)?rows[0]:null;
 return row?{
  contactRef:row.contact_ref||null,
  displayName:row.display_name,
  channel:row.channel,
  provider:row.provider,
  externalIdentity:row.external_identity,
  verifiedAt:row.verified_at||null,
  verificationMethod:row.verification_method||null
 }:null;
}
export async function listVerifiedContactIdentities({organizationId,channel=null,env=process.env,requestFn=fetch}={}){
 const org=clean(organizationId,120);if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(org))throw Error("CONTACT_ORGANIZATION_INVALID");
 const cfg=supabaseConfig(env),url=new URL(cfg.url+"/rest/v1/stridebrain_contact_identities");
 url.searchParams.set("organization_id","eq."+org);
 url.searchParams.set("status","eq.verified");
 if(channel)url.searchParams.set("channel","eq."+channel);
 url.searchParams.set("select","contact_ref,display_name,channel,provider,external_identity,verified_at,verification_method");
 url.searchParams.set("order","display_name.asc");
 const response=await requestFn(url.toString(),{headers:headers(cfg),cache:"no-store",signal:AbortSignal.timeout(3000)});
 if(!response.ok)throw Error("CONTACT_IDENTITY_STORAGE_UNAVAILABLE");
 const rows=await response.json();
 return Array.isArray(rows)?rows.map(row=>({
  contactRef:row.contact_ref||null,
  displayName:row.display_name,
  channel:row.channel,
  provider:row.provider,
  externalIdentity:row.external_identity,
  verifiedAt:row.verified_at||null,
  verificationMethod:row.verification_method||null
 })):[];
}
