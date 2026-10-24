/**
 * Curated public industry evidence — validation and selectors.
 * Completely separate from synthetic customer/vendor data and tenant-owned content.
 */
export function validateIndustryEvidence(pack){
 const failures=[];
 if(pack?.meta?.kind!=="TAIWAN_INDUSTRY_EVIDENCE_PACK")failures.push("Unexpected evidence pack type");
 if(!Array.isArray(pack?.sources)||!Array.isArray(pack?.cards)||!Array.isArray(pack?.documents))failures.push("Invalid reference collections");
 if(failures.length)throw Error(failures.join("; "));
 const ids=(rows,key,label)=>{const seen=new Set();for(const row of rows){if(!row[key])failures.push(label+" missing "+key);if(seen.has(row[key]))failures.push("Duplicate "+label+" "+row[key]);seen.add(row[key]);}return seen;};
 const sourceIds=ids(pack.sources,"id","source");
 const cardIds=ids(pack.cards,"id","card");
 const documentIds=ids(pack.documents,"id","document");
 for(const s of pack.sources){
  if(!s.url||!s.url.startsWith("https://"))failures.push("Invalid HTTPS source URL "+s.id);
  if(!["interior","printing","shared"].includes(s.industry))failures.push("Invalid source industry "+s.id);
  if(!s.caveat||!s.locator)failures.push("Missing source scope/caveat "+s.id);
 }
 for(const c of pack.cards){
  if(!["interior","printing"].includes(c.industry))failures.push("Invalid card industry "+c.id);
  if(!Array.isArray(c.evidenceIds)||!c.evidenceIds.length)failures.push("No evidence for "+c.id);
  for(const e of c.evidenceIds||[])if(!sourceIds.has(e))failures.push("Broken source "+e+" on "+c.id);
  if(!documentIds.has(c.id))failures.push("Missing document "+c.id);
  if(c.isLiveCompanyFact!==false)failures.push("Industry reference may not claim to be a customer fact "+c.id);
 }
 for(const [industry,steps] of Object.entries(pack.workflows||{})){
  if(!["interior","printing"].includes(industry))failures.push("Unknown workflow industry "+industry);
  if(!Array.isArray(steps)||!steps.length)failures.push("Missing workflow "+industry);
  for(const stage of steps||[]){
   if(!Array.isArray(stage.referenceIds)||!stage.referenceIds.length)failures.push("Uncited step "+stage.id);
   for(const r of stage.referenceIds||[])if(!cardIds.has(r))failures.push("Missing workflow evidence "+r);
   if(stage.isAutomated!==false)failures.push("Modelled workflow cannot claim automation "+stage.id);
  }
 }
 if(failures.length)throw Error(failures.slice(0,12).join("; "));
 return {ok:true,sourceCount:sourceIds.size,referenceCount:cardIds.size,documentCount:documentIds.size,workflowSteps:Object.values(pack.workflows).reduce((n,steps)=>n+steps.length,0)};
}
export function sourceUrlForDocument(d){
 if(!d||d.basisType!=="PUBLIC_REFERENCE")return null;
 const raw=typeof d.sourceUrl==="string"?d.sourceUrl:"";
 return /^https:\/\/[A-Za-z0-9.-]+(?:[\/?#][^\s]*)?$/.test(raw)?raw:null;
}
export function industryCards(pack,industry){return pack.cards.filter(c=>c.industry===industry);}
export function referenceForPrompt(pack,industry,query){
 const q=String(query||"").trim().toLowerCase();
 if(!q||q.length<3)return [];
 const tokens=q.replace(/[^a-z0-9\u4e00-\u9fff ]/gi," ").split(/\s+/).filter(t=>t.length>=3);
 return industryCards(pack,industry).map(c=>{
  const title=(c.titleEn+" "+c.titleZh).toLowerCase(),body=(c.summary+" "+c.stage+" "+c.questions.join(" ")).toLowerCase();
  const score=tokens.reduce((sum,t)=>sum+(title.includes(t)?4:0)+(body.includes(t)?1:0),0);
  return {card:c,score};
 }).filter(r=>r.score>=2).sort((a,b)=>b.score-a.score).slice(0,4).map(r=>r.card);
}
