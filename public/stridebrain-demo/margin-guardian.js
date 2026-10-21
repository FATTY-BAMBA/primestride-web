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
