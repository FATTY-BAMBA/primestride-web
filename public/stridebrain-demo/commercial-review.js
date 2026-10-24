/** Comparable recorded quote revisions, not realized profit or a claim about causes. */
const margin=q=>q&&Number.isFinite(q.amountExTax)&&q.amountExTax>0&&Number.isFinite(q.directCost)?(q.amountExTax-q.directCost)/q.amountExTax*100:null;
export function commercialReview(seed,{limit=3}={}){
 return (seed.projects||[]).flatMap(p=>{
  const versions=(seed.quotes||[]).filter(q=>q.projectId===p.id).sort((a,b)=>a.revision-b.revision);
  const q=versions.find(q=>q.isLatest);if(!q)return [];
  const previous=versions.filter(x=>x.revision<q.revision).at(-1)||null;
  const currentMargin=margin(q),previousMargin=margin(previous),target=Number.isFinite(q.grossMarginTarget)?q.grossMarginTarget*100:null;
  const delta=currentMargin!==null&&previousMargin!==null?currentMargin-previousMargin:null;
  return [{projectId:p.id,projectName:p.name,manager:p.manager,quoteId:q.id,revision:q.revision,status:q.status,
   priceExTax:q.amountExTax,directCost:q.directCost,grossProfit:q.amountExTax-q.directCost,
   marginPct:currentMargin,previousQuoteId:previous?.id||null,previousMarginPct:previousMargin,marginChangePoints:delta,targetMarginPct:target,
   belowTarget:currentMargin!==null&&target!==null&&currentMargin+0.05<target,
   sourceIds:['REG-'+q.id,...(previous?['REG-'+previous.id]:[])],
   basis:'Calculated from recorded price and direct cost. Confirm scope comparability; no actual loss or material-price cause is established.'}];
 }).sort((a,b)=>Number(b.belowTarget)-Number(a.belowTarget)||(a.marginChangePoints??0)-(b.marginChangePoints??0)||a.projectId.localeCompare(b.projectId)).slice(0,Math.max(1,Math.min(12,limit)));
}
