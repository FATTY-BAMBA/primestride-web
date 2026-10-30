/** Small, deterministic quotation margin scenarios. Amounts are examples, not vendor offers. */
export function marginScenarios(cost,margin,tax){
 const c=Number(cost),m=Number(margin),t=Number(tax);
 if(!Number.isFinite(c)||c<0||!Number.isFinite(m)||m<0||m>=100||!Number.isFinite(t)||t<0||t>100)return [];
 return [m-5,m,m+5].filter(n=>n>=0&&n<100).map(target=>{
  const beforeTax=c/(1-target/100);
  const grossProfit=beforeTax-c;
  return {margin:target,cost:c,preTax:beforeTax,grossProfit,total:beforeTax*(1+t/100),current:target===m};
 });
}

/** Review prompts, never asserted missing charges: comparable completed jobs only. */
export function historicalScopeWarnings(history,request){
 if(!Array.isArray(history?.records)||!Array.isArray(history?.costCodes)||!request||!Array.isArray(request.scope))return [];
 const scope=new Set(request.scope);
 const matches=history.records.filter(r=>r.status==="COMPLETE"&&r.category===request.category&&r.tier===request.tier&&Array.isArray(r.lines)&&r.sourceDocId);
 if(matches.length<3)return [];
 return history.costCodes.filter(c=>!scope.has(c.id)).map(code=>{
  const supported=matches.filter(r=>r.lines.some(line=>line.code===code.id&&Number.isFinite(line.actualCost)&&line.actualCost>0));
  return {code:code.id,label:String(code.label||code.id),observations:supported.length,totalComparables:matches.length,
   sourceIds:[...new Set(supported.map(r=>r.sourceDocId))].slice(0,4)};
 }).filter(w=>w.observations>=3&&w.observations/matches.length>=0.6).sort((a,b)=>b.observations-a.observations||a.code.localeCompare(b.code));
}
