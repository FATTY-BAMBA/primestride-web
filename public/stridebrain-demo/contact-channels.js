const clean=v=>String(v??"").trim();
const slug=value=>clean(value).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
export function buildContactChannelRegistry(seed){
 const names=new Set();
 for(const p of seed?.projects||[]){if(clean(p.client))names.add(clean(p.client));if(clean(p.manager))names.add(clean(p.manager));}
 for(const w of seed?.workOrders||[])if(clean(w.owner))names.add(clean(w.owner));
 for(const a of seed?.approvals||[])if(clean(a.requestedBy))names.add(clean(a.requestedBy));
 return [...names].sort((a,b)=>a.localeCompare(b)).map((displayName,index)=>({
  contactId:"contact-"+(slug(displayName)||String(index+1)),
  displayName,
  channels:[
   {channel:"email",providerHint:null,status:"unlinked",externalIdentity:null,verifiedAt:null},
   {channel:"line",providerHint:"line",status:"unlinked",externalIdentity:null,verifiedAt:null}
  ]
 }));
}
export function linkedChannelFor(registry,{contactId,channel}={}){
 const contact=(registry||[]).find(x=>x.contactId===contactId);
 return contact?.channels?.find(x=>x.channel===channel&&x.status==="linked"&&x.externalIdentity)||null;
}
