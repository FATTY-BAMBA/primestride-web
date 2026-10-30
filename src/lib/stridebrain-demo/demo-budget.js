/** Conservative, non-refundable reservation ceiling. This is not actual provider spend accounting. */
export async function reserveDemoBudget({requestFn=fetch}={}){
 if(process.env.STRIDEBRAIN_DEMO_BUDGET_ENABLED!=="true")return {ok:true,enabled:false};
 const url=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"",key=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"",org=process.env.STRIDEBRAIN_DEMO_ORGANIZATION_ID||"";
 const per=Number(process.env.STRIDEBRAIN_DEMO_BUDGET_RESERVE_MICROUSD||500000),cap=Number(process.env.STRIDEBRAIN_DEMO_DAILY_BUDGET_MICROUSD||10000000);
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!key||!org||!Number.isSafeInteger(per)||per<1||per>100000000||!Number.isSafeInteger(cap)||cap<1||cap>10000000000)return {ok:false,code:"DEMO_BUDGET_UNAVAILABLE"};
 try{
  const response=await requestFn(url+"/rest/v1/rpc/stridebrain_reserve_demo_budget",{method:"POST",headers:{"apikey":key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({p_organization_id:org,p_request_microusd:per,p_daily_cap_microusd:cap}),signal:AbortSignal.timeout(3500)});
  if(!response.ok)return {ok:false,code:"DEMO_BUDGET_UNAVAILABLE"};
  const result=await response.json();
  if(result?.ok===true)return {ok:true,enabled:true};
  return {ok:false,code:result?.reason==="budget_exceeded"?"DEMO_BUDGET_EXCEEDED":"DEMO_BUDGET_UNAVAILABLE"};
 }catch{return {ok:false,code:"DEMO_BUDGET_UNAVAILABLE"};}
}
