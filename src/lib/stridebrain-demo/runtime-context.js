const ORG_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/;
const clean=value=>String(value??"").trim();

export function resolveRuntimeContext({session,env=process.env}={}){
 const requestedMode=clean(env.STRIDEBRAIN_RUNTIME_MODE).toLowerCase();
 const mode=requestedMode==="tenant"?"tenant":"demo";

 if(mode==="tenant"){
  const organizationId=clean(session?.organizationId);
  const membershipVerified=session?.membershipVerified===true;
  if(session?.active!==true||!membershipVerified||!ORG_ID.test(organizationId)){
   return {ok:false,mode,code:"TENANT_CONTEXT_REQUIRED",organizationId:null,role:session?.role||null,dataClassification:null};
  }
  return {
   ok:true,
   mode,
   organizationId,
   role:session.role||null,
   dataClassification:"TENANT_PRIVATE",
   membershipVerified:true
  };
 }

 const organizationId=clean(env.STRIDEBRAIN_DEMO_ORGANIZATION_ID)||"demo-workspace";
 if(!ORG_ID.test(organizationId)){
  return {ok:false,mode,code:"DEMO_ORGANIZATION_INVALID",organizationId:null,role:session?.role||null,dataClassification:null};
 }
 return {
  ok:true,
  mode,
  organizationId,
  role:session?.role||null,
  dataClassification:"DEMO_SYNTHETIC",
  membershipVerified:false
 };
}
