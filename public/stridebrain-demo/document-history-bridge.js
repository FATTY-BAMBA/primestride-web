/**
 * Document -> provisional historical-cost reference.
 * IMPORTANT: SANDBOX ONLY. The upload is neither proof of a completed project
 * nor actual incurred costs. Nothing is persisted or transmitted by this module.
 * An extraction-approved row is not independently verified as a cost.
 */
import {reviewSummary} from "./document-intelligence.js";

export const BRIDGE_BLOCKING_CODES=["ROW_LIMIT","TRUNCATED_LINES","SHEET_TRUNCATED","CACHED_FORMULA","UNCACHED_FORMULA","PAGE_LIMIT","CSV_QUOTING","EMPTY_DOCUMENT","NO_EMBEDDED_TEXT"];
export function bridgeDefaults(report,history,industry){
  const name=String(report?.fileName||"").replace(/\.(csv|tsv|xlsx|pdf|docx)$/i,"").slice(0,100);
  const defaults=history.defaults;
  return {
    title:name||"Fictional imported job",
    category:defaults.category,tier:defaults.tier,location:defaults.location,
    jobQuantity:defaults.quantity,completedAt:"2026-09-15",
    workMode:"fictional_sandbox",
    acknowledged:false,scopeComplete:false,sourceExplained:false,
    codeMapping:Object.fromEntries((report?.candidates||[]).filter(x=>x.reviewStatus==="approved").map(x=>[x.id,"unmapped"]))
  };
}
export function bridgePreview(report,history,form){
  const issues=[],sum=reviewSummary(report);
  if(!report?.reviewed)issues.push("Review and approve the extracted document first.");
  if(report?.currencyConfirmed!==true)issues.push("Confirm the file's cost currency before history use.");
  if(!sum.ready||sum.approved===0)issues.push("At least one accepted, reconciled cost line is required.");
  const blockers=(report?.findings||[]).filter(f=>(f.severity==="blocker"&&f.code!=="ROW_ISSUES")||BRIDGE_BLOCKING_CODES.includes(f.code));
  if(blockers.length)issues.push("The source has unresolved parsing/coverage issues ("+blockers.map(x=>x.code).join(", ")+").");
  const validCodes=new Set((history?.costCodes||[]).map(c=>c.id));
  const accepted=(report?.candidates||[]).filter(c=>c.reviewStatus==="approved");
  const mappings=[],unmapped=[];
  for(const c of accepted){
    const code=form?.codeMapping?.[c.id];
    if(!validCodes.has(code))unmapped.push(c.id+": "+c.description);
    else mappings.push({code,itemId:c.id,description:c.description,sourceRef:c.sourceRef,quantity:c.quantity,sourceUnit:c.unit,unitCost:c.unitCost,cost:c.calculatedAmount,edited:!!c.edited});
  }
  if(unmapped.length)issues.push("Map every accepted cost line to a company cost code.");
  const groups=new Map();
  for(const row of mappings){if(!Number.isFinite(row.cost)||row.cost<0){issues.push("Invalid extracted cost at "+row.sourceRef);continue;}const g=groups.get(row.code)||{code:row.code,actualCost:0,refs:[],description:[]};g.actualCost+=row.cost;g.refs.push(row.sourceRef);g.description.push(row.description);groups.set(row.code,g);}
  const lines=[...groups.values()].map(x=>({...x,actualCost:Math.round(x.actualCost*100)/100}));
  const cost=lines.reduce((v,l)=>v+l.actualCost,0);
  if(Math.abs(cost-sum.directCost)>.01)issues.push("Mapped cost total must reconcile with the accepted extraction.");
  const q=Number(form?.jobQuantity);
  if(!Number.isFinite(q)||q<=0||!Number.isInteger(q)||q>100000)issues.push("Enter a valid positive whole-job quantity (e.g. ping or pieces).");
  if(!form?.title?.trim()||form.title.length>120)issues.push("Enter a concise fictional case title.");
  const cat=new Set((history?.categories||[]).map(c=>c.id)),tier=new Set(history?.tiers||[]),location=new Set(history?.locations||[]);
  if(!cat.has(form?.category))issues.push("Select a supported business category.");
  if(!tier.has(form?.tier))issues.push("Select a supported finish tier.");
  if(!location.has(form?.location))issues.push("Select a supported location.");
  const completedAt=String(form?.completedAt||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(completedAt)||!Number.isFinite(Date.parse(completedAt))||completedAt>"2026-10-18"||completedAt<"2021-01-01")issues.push("Enter a valid completed-date example (2021-01-01 through 2026-10-18).");
  if(form?.workMode!=="fictional_sandbox")issues.push("Only fictional/sanitized sandbox cases can be promoted in this public demo.");
  if(!form?.acknowledged)issues.push("Acknowledge that this is fictional demo data, not independently confirmed actual cost.");
  if(!form?.scopeComplete)issues.push("Confirm that the selected lines represent a *hypothetical* complete direct-cost scope for this demo.");
  if(!form?.sourceExplained)issues.push("Confirm the source rows and manual cost-code mappings were reviewed.");
  const excluded=(report?.candidates||[]).filter(x=>x.reviewStatus==="excluded");
  if(excluded.length&&!String(form?.excludedReason||"").trim())issues.push("Explain why excluded source lines are outside the sample completed-cost scope.");
  return {ok:issues.length===0,issues,accepted:accepted.length,excluded:excluded.length,lines,baseCost:cost,quantity:q,unit:history?.unit||"",sourceReport:report?.id||null};
}
export function createSandboxPrecedent(report,history,form){
  const preview=bridgePreview(report,history,form);
  if(!preview.ok)return {ok:false,issues:preview.issues};
  const suffix=String(report.id||"unknown").replace(/[^a-zA-Z0-9-]/g,"").slice(-45);
  const id="LOCAL-H-"+suffix,sourceDocId="LOCAL-HSRC-"+suffix;
  if(history.records.some(r=>r.id===id)||history.documents.some(d=>d.id===sourceDocId))return {ok:false,issues:["This source file was already added to the session. Clear it before importing a replacement."]};
  const q=preview.quantity,lines=preview.lines.map(x=>({
    code:x.code,label:history.costCodes.find(c=>c.id===x.code)?.label||x.code,
    quantity:q,unit:history.unit,unitCost:x.actualCost/q,actualCost:Math.round(x.actualCost),
    originalSourceRefs:x.refs.slice(),originalDescriptions:x.description.slice()
  }));
  // historicalEstimate uses an exact integer total. Rounded ledger lines may differ by
  // cents, so financial reconciliation occurs on rounded line extended amounts only.
  const directCost=lines.reduce((n,x)=>n+x.actualCost,0);
  const netQuote=Math.round(directCost/.75);
  const record={
    id,sourceDocId,title:form.title.trim().slice(0,120),category:form.category,tier:form.tier,location:form.location,
    completedAt:form.completedAt,quantity:q,unit:history.unit,scope:lines.map(x=>x.code),
    lines,finalDirectCost:directCost,historicQuoteExTax:netQuote,status:"COMPLETE",currency:"TWD",
    synthetic:true,provenance:"LOCAL_SANDBOX_SELF_ATTESTED",costEvidenceStatus:"FICTIONAL_COMPLETENESS_ASSUMED",
    originalFile:report.fileName,exclusionReason:String(form.excludedReason||"").slice(0,500),reviewedAt:report.reviewedAt
  };
  const markdown=[
    "# Sandbox reconstruction of a hypothetical completed job",
    "",
    "Case: "+record.title,
    "Source ID: "+sourceDocId+" · "+record.id,
    "Source file (browser-local only): "+report.fileName,
    "Extraction review timestamp: "+report.reviewedAt,
    "Hypothetical job end-date: "+record.completedAt,
    "Category: "+record.category+" · Tier: "+record.tier+" · Location: "+record.location,
    "Job normalization: "+q+" "+history.unit,
    "Status: FICTIONAL, MANUALLY ATTESTED SANDBOX COST COMPLETENESS",
    "",
    "## Reviewed extracted direct costs",
    "| Industry cost category | Mapped total (TWD) | Original source cells |",
    "|---|---:|---|",
    ...preview.lines.map(x=>"| "+(history.costCodes.find(c=>c.id===x.code)?.label||x.code)+" | "+x.actualCost.toFixed(2)+" | "+x.refs.join(", ")+" |"),
    "",
    "Direct cost total (rounded by historical engine): NT$"+directCost.toLocaleString("en-US"),
    "Excluded source rows: "+preview.excluded,
    "Exclusion note: "+(form.excludedReason||"None"),
    "",
    "## Uncertainty and lineage",
    "The source itself was reviewed only in a local browser. The project completion, its cost completeness and the mapping to cost codes are user-entered fictional sandbox assumptions; they are NOT checked against a real company ledger, supplier invoices or customer contracts.",
    "Original file contents stay in this browser session and are not stored as production company knowledge. The generated sample reference disappears when the session resets or the industry changes.",
    "This note is not evidence of actual past construction/printing prices and must not support a real commercial offer."
  ].join("\n");
  const document={id:sourceDocId,projectId:null,title:"Session-only cost precedent · "+record.title,kind:"Sandbox historical cost record",version:"session-only",status:"Fictional / reviewer supplied",owner:"Local demo reviewer",date:form.completedAt,sourceType:"Browser-local synthetic extraction",basisType:"BROWSER_LOCAL_SANDBOX",body:markdown};
  return {ok:true,record,document,preview};
}
export function attachSandboxPrecedent(history,model,result){
  if(!result?.ok)return {ok:false,reason:"No reviewed sandbox precedent."};
  if(history.records.some(r=>r.id===result.record.id)||model.bySource.has(result.document.id))return {ok:false,reason:"Duplicate source; clear the prior import."};
  history.records.push(result.record);
  history.documents.push(result.document);
  model.seed.documents.push(result.document);
  model.bySource.set(result.document.id,result.document);
  return {ok:true,id:result.record.id};
}
export function detachSandboxPrecedent(history,model,recordId){
  const item=history?.records?.find(r=>r.id===recordId);
  if(!item||item.provenance!=="LOCAL_SANDBOX_SELF_ATTESTED")return {ok:false,reason:"Session record unavailable."};
  history.records=history.records.filter(r=>r.id!==recordId);
  history.documents=history.documents.filter(d=>d.id!==item.sourceDocId);
  model.seed.documents=model.seed.documents.filter(d=>d.id!==item.sourceDocId);
  model.bySource.delete(item.sourceDocId);
  return {ok:true};
}


/**
 * These mappings are suggestions only. A reviewer must confirm the industry code
 * and attest that their hypothetical cost scenario includes all direct costs.
 */
export function suggestCostCodes(report,history,industry){
 const codes=new Set(history.costCodes.map(c=>c.id));
 const rules=industry==="printing"?[
  [/prepress|proof|打樣|印前/i,"prepress"],[/paper|stock|substrate|紙材|紙張/i,"paper"],
  [/print|press|poster|海報|印刷/i,"printing"],[/finish|laminat|coating|binding|裝訂|加工/i,"finishing"],
  [/pack|包裝/i,"packing"],[/deliver|freight|ship|運送|配送/i,"delivery"]
 ]:[
  [/measure|plan|design|survey|丈量|設計/i,"design"],[/demol|拆除|清運/i,"demolition"],
  [/cabinet|carpent|quartz|stone|slab|millwork|木作|櫥櫃|石英/i,"carpentry"],
  [/light|electric|wiring|燈|電/i,"electrical"],[/plumb|bath|pipe|水電|管/i,"plumbing"],
  [/floor|tile|地板|磁磚/i,"flooring"],[/paint|wall finish|油漆|塗料/i,"painting"],
  [/coord|site admin|management|工務|管理/i,"coordination"]
 ];
 const mapped={};
 for(const c of report?.candidates||[]){if(c.reviewStatus!=="approved")continue;const guess=rules.find(([regex,k])=>regex.test(c.description)&&codes.has(k));mapped[c.id]=guess?guess[1]:"unmapped";}
 return mapped;
}
