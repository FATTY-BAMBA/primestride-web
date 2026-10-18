/**
 * StrideBrain Historical Quotation Intelligence — prototype.
 * Independent of the industry: historical schema/config belongs to the data pack.
 * Inputs and outputs are entirely synthetic, with no live pricing assertions.
 */
export function validateHistory(data){
 const errors=[];
 if(data?.meta?.mode!=="SYNTHETIC_HISTORY")errors.push("Not an authorized synthetic history pack");
 if(!Array.isArray(data?.records)||!Array.isArray(data?.documents))errors.push("Missing records or documents");
 if(errors.length)throw Error(errors.join("; "));
 const keys=new Set(),sources=new Set(data.documents.map(d=>d.id));
 if(sources.size!==data.documents.length)errors.push("Duplicate history source IDs");
 const categories=new Set((data.categories||[]).map(c=>c.id));
 const codes=new Set((data.costCodes||[]).map(c=>c.id));
 for(const r of data.records){
  if(keys.has(r.id))errors.push("Duplicate precedent "+r.id);keys.add(r.id);
  if(!sources.has(r.sourceDocId))errors.push("Missing source document "+r.id);
  if(!categories.has(r.category))errors.push("Unknown category "+r.id);
  if(!Number.isFinite(r.quantity)||r.quantity<=0)errors.push("Bad quantity "+r.id);
  if(r.unit!==data.unit)errors.push("Wrong unit "+r.id);
  if(r.completedAt>"2026-10-18")errors.push("Future completion "+r.id);
  if(!Array.isArray(r.scope)||!Array.isArray(r.lines))errors.push("Bad line structure "+r.id);
  if(r.status==="COMPLETE"){
    if(r.finalDirectCost===null||r.finalDirectCost===undefined)errors.push("Missing actual cost "+r.id);
    const total=r.lines.reduce((sum,x)=>sum+x.actualCost,0);
    if(total!==r.finalDirectCost)errors.push("Unreconciled total "+r.id);
    if(r.lines.some(x=>!codes.has(x.code)||!Number.isFinite(x.actualCost)||x.actualCost<0))errors.push("Bad costs "+r.id);
  }
 }
 if(errors.length)throw Error(errors.slice(0,12).join("; "));
 return {ok:true,records:data.records.length,eligible:data.records.filter(r=>r.status==="COMPLETE").length};
}
export function historicalDefaults(data){return {...data.defaults,scope:[...data.defaults.scope],inquiry:""};}
export function safeRequest(data,input){
 const allowCategories=new Set(data.categories.map(c=>c.id));
 const allowTiers=new Set(data.tiers);
 const allowLocations=new Set(data.locations);
 const allowCodes=new Set(data.costCodes.map(c=>c.id));
 const cat=allowCategories.has(input?.category)?input.category:data.defaults.category;
 const tier=allowTiers.has(input?.tier)?input.tier:data.defaults.tier;
 const location=allowLocations.has(input?.location)?input.location:data.defaults.location;
 const quantity=Math.max(1,Math.min(100000,Math.round(Number(input?.quantity)||data.defaults.quantity)));
 const margin=Math.max(0,Math.min(65,Number(input?.margin)??data.defaults.margin));
 const escalation=Math.max(0,Math.min(30,Number(input?.escalation)??data.defaults.escalation));
 const contingency=Math.max(0,Math.min(25,Number(input?.contingency)??data.defaults.contingency));
 const rawScopes=Array.isArray(input?.scope)?input.scope:data.defaults.scope;
 const scope=[...new Set(rawScopes.filter(code=>allowCodes.has(code)))];
 return {category:cat,tier,location,quantity,margin,escalation,contingency,scope,inquiry:String(input?.inquiry||"").slice(0,1200)};
}
const money=n=>Math.round(n).toLocaleString("en-US");
const weightedMedian=items=>{
 const s=items.slice().sort((a,b)=>a.value-b.value),total=s.reduce((x,r)=>x+r.weight,0);
 if(!total)return null;let cumulative=0;
 for(const x of s){cumulative+=x.weight;if(cumulative>=total/2)return x.value;}
 return s.at(-1)?.value??null;
};
const quantile=(arr,p)=>{
 const a=arr.slice().sort((x,y)=>x-y);if(!a.length)return null;
 const idx=(a.length-1)*p,lo=Math.floor(idx),hi=Math.ceil(idx);
 return a[lo]+(a[hi]-a[lo])*(idx-lo);
};
const monthsOld=date=>{
 const now=new Date("2026-10-18T00:00:00Z"),then=new Date(date+"T00:00:00Z");
 return Math.max(0,Math.round((now.getTime()-then.getTime())/(1000*60*60*24*30.4375)));
};
export function historicalEstimate(data,requested){
 validateHistory(data);
 const r=safeRequest(data,requested);
 const noResult=(reason,comparables=[])=>({ok:false,reason,request:r,comparables,excludedQuoteOnly:data.records.filter(x=>x.status!=="COMPLETE").length,limitations:["No live supplier quotations are connected.","Synthetic cost records must not be treated as verified market pricing."],sourceIds:[]});
 if(r.scope.length===0)return noResult("Choose at least one scope item.");
 if(r.margin>=65)return noResult("Margin outside the supported demo range.");
 const completed=data.records.filter(x=>x.status==="COMPLETE");
 // Avoid incorrect comparisons across fundamentally different job classes or finish tiers.
 const eligible=completed.filter(x=>
   x.category===r.category&&x.tier===r.tier&&r.scope.every(code=>x.scope.includes(code))&&x.unit===data.unit
 );
 const ranked=eligible.map(x=>{
  const sizeSimilarity=Math.max(0,1-Math.abs(Math.log(r.quantity/x.quantity))/2.5);
  const recency=Math.max(0,1-monthsOld(x.completedAt)/42);
  const location=x.location===r.location?1:0.45;
  const score=.55*sizeSimilarity+.30*recency+.15*location;
  return {...x,similarity:Math.round(score*100),ageMonths:monthsOld(x.completedAt),weight:Math.max(.15,score)};
 }).sort((a,b)=>b.similarity-a.similarity||a.ageMonths-b.ageMonths);
 const matches=ranked.slice(0,6);
 if(matches.length<3)return noResult("Only "+matches.length+" eligible completed "+data.unit+"-based jobs match this category, finish tier and scope. At least three reconciled precedents are required.",matches);
 const lines=[],missing=[];
 for(const code of r.scope){
  const label=data.costCodes.find(x=>x.id===code)?.label||code;
  const observations=matches.map(m=>{
   const x=m.lines.find(z=>z.code===code);
   return x?{value:x.actualCost/m.quantity,weight:m.weight,id:m.id,sourceDocId:m.sourceDocId}:null;
  }).filter(Boolean);
  if(observations.length<3){missing.push(label);continue;}
  const rate=weightedMedian(observations);
  lines.push({code,label,unit:data.unit,unitRate:rate,quantity:r.quantity,baseCost:Math.round(rate*r.quantity),observations:observations.length,sourceIds:observations.map(x=>x.sourceDocId)});
 }
 if(missing.length)return noResult("Insufficient comparable line-item history for: "+missing.join(", "),matches);
 const historicalDirectCost=lines.reduce((t,x)=>t+x.baseCost,0);
 const escalationAmount=Math.round(historicalDirectCost*r.escalation/100);
 const adjustedCost=historicalDirectCost+escalationAmount;
 const contingencyAmount=Math.round(adjustedCost*r.contingency/100);
 const forecastCost=adjustedCost+contingencyAmount;
 const preTax=Math.round(forecastCost/(1-r.margin/100));
 const sampleTax=Math.round(preTax*.05);
 const precedentUnitCosts=matches.map(m=>r.scope.reduce((t,code)=>t+(m.lines.find(l=>l.code===code)?.actualCost||0)/m.quantity,0));
 const bandLow=quantile(precedentUnitCosts,.2),bandHigh=quantile(precedentUnitCosts,.8);
 const multiplier=(1+r.escalation/100)*(1+r.contingency/100)/(1-r.margin/100);
 const lowPrice=Math.round(bandLow*r.quantity*multiplier),highPrice=Math.round(bandHigh*r.quantity*multiplier);
 const ageMax=Math.max(...matches.map(x=>x.ageMonths)),recencyWarning=ageMax>18;
 const limitations=[
   "All historical costs and precedents in this preview are fictional.",
   "Cost escalation is an editable assumption, not a live materials-price index.",
   "No current supplier price or jobsite/print specification has been verified.",
   "Missing line items, site constraints, specifications and contractual exclusions require human review."
 ];
 if(recencyWarning)limitations.push("At least one comparable job is over 18 months old.");
 const result={ok:true,request:r,method:"Similarity ranking + weighted median unit costs + explicit escalation and contingency + company margin",comparables:matches.map(x=>({id:x.id,title:x.title,category:x.category,tier:x.tier,location:x.location,quantity:x.quantity,unit:x.unit,completedAt:x.completedAt,similarity:x.similarity,ageMonths:x.ageMonths,finalDirectCost:x.finalDirectCost,sourceDocId:x.sourceDocId})),lines,historicalDirectCost,escalationAmount,contingencyAmount,forecastCost,margin:r.margin,preTax,sampleTax,total:preTax+sampleTax,rangeLow:Math.min(lowPrice,highPrice),rangeHigh:Math.max(lowPrice,highPrice),rangeType:"Illustrative sensitivity band from comparable synthetic unit costs, not a statistical confidence interval or binding quote",excludedQuoteOnly:data.records.filter(x=>x.status!=="COMPLETE").length,limitations,sourceIds:matches.map(x=>x.sourceDocId),quality:"Illustrative only — no real pricing verified"};
 return result;
}
export function estimateFingerprint(estimate){
 if(!estimate?.ok)return null;
 return JSON.stringify({request:estimate.request,unitPrices:estimate.lines.map(x=>[x.code,Math.round(x.unitRate*100)/100]),preTax:estimate.preTax,sources:estimate.sourceIds});
}
export function estimateMarkdown(data,estimate,review){
 if(!estimate?.ok)return "No historical estimate is available.";
 const p=estimate.request,category=data.categories.find(x=>x.id===p.category)?.label||p.category;
 const lines=[
 "# SYNTHETIC Draft Historical Estimate",
 "",
 "For a hypothetical "+category+" project",
 "Quantity: "+p.quantity+" "+data.unit+" · Finish: "+p.tier+" · City: "+p.location,
 "Status: "+(review?.reviewed?"Simulated human review completed":"DRAFT — unreviewed"),
 "",
 "## Comparable projects",
 ...estimate.comparables.map(x=>"- "+x.title+" ("+x.id+"): "+x.quantity+" "+x.unit+", "+x.completedAt+", source "+x.sourceDocId),
 "",
 "## Historical normalized direct costs",
 "| Cost line | Unit | Rate (TWD) | Quantity | Direct cost (TWD) |",
 "|---|---|---:|---:|---:|",
 ...estimate.lines.map(x=>"| "+x.label+" | "+x.unit+" | "+x.unitRate.toFixed(2)+" | "+x.quantity+" | "+money(x.baseCost)+" |"),
 "",
 "Historical base cost: NT$"+money(estimate.historicalDirectCost),
 "Escalation assumption "+p.escalation+"%: NT$"+money(estimate.escalationAmount),
 "Contingency "+p.contingency+"%: NT$"+money(estimate.contingencyAmount),
 "Adjusted forecast direct cost: NT$"+money(estimate.forecastCost),
 "Target gross margin: "+p.margin+"%",
 "Proposed price before illustrative tax: NT$"+money(estimate.preTax),
 "Illustrative tax (5%): NT$"+money(estimate.sampleTax),
 "Illustrative total: NT$"+money(estimate.total),
 "Sensitivity band before tax: NT$"+money(estimate.rangeLow)+"–"+money(estimate.rangeHigh),
 "",
 "## Limitations",
 ...estimate.limitations.map(x=>"- "+x),
 "",
 "This is a fictional, source-linked planning demonstration. It is NOT a commercial quotation, current vendor offer or evidence of actual historical project prices."
 ];
 return lines.join("\n");
}
