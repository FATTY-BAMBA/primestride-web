/**
 * StrideBrain Taiwan Industry Readiness Workbench
 * Explicitly asks users to manually attest demo conditions. Never claims to inspect
 * a physical site, actually preflight a PDF or determine legal permit eligibility.
 */
export const READINESS_PACKS={
 interior:{
  id:"interior",
  title:"Renovation change readiness",
  chineseTitle:"室內裝修變更事前檢核",
  purpose:"Inspect a proposed change, drawing authority, site conditions, supplier status and professional review before releasing work.",
  project:"PRJ-101",reviewWorkId:"RVW-INT-101",reviewWorkTitle:"Review Songshan change and outstanding evidence",workSourceId:"REF-I07",
  sourceIds:["REF-I01","REF-I03","REF-I04","REF-I07","DOC-1005","DOC-1006","DOC-1010"],
  notice:"This is an internal intake and release-preparation checklist. It does not determine whether a legal renovation permit is needed or certify professional compliance.",
  fields:[
   {id:"changeType",label:"Proposed work · 變更範圍",type:"select",options:[["countertop","Kitchen countertop / material substitution"],["fixed_partition","Fixed partition or wall/layout change"],["fixed_ceiling","Fixed ceiling or interior finish works"],["other","Other or not yet classified"]]},
   {id:"approvedDrawing",label:"Current drawing authority · 圖說版本",type:"select",options:[["approved","Latest approved drawing recorded"],["draft","Only a draft revision is available"],["unknown","Current approved revision unknown"]]},
   {id:"siteMeasure",label:"Site measurements · 現場丈量",type:"select",options:[["verified","Measurements independently checked"],["pending","Site verification pending"]]},
   {id:"supplierStatus",label:"Supplier evidence · 供應商報價",type:"select",options:[["written","Written cost and availability checked"],["estimated","Estimate only; no verified supply commitment"]]},
   {id:"fireImpact",label:"Fire / escape systems · 消防避難",type:"select",options:[["no","No known changes, based on reviewed scope"],["yes","May affect fire or escape systems"],["unknown","Not assessed"]]},
   {id:"professionalReview",label:"Qualified professional determination · 專業審查",type:"select",options:[["documented","Relevant professional review documented"],["pending","Applicability / technical review not yet completed"]]},
   {id:"scheduleReview",label:"Schedule / work sequencing · 工期影響",type:"select",options:[["reviewed","Work sequence and dependencies reviewed"],["pending","Impact not checked"]]},
   {id:"clientConsent",label:"Client acceptance · 業主確認",type:"select",options:[["written","Customer accepted revised scope in writing"],["pending","Customer acceptance still pending"]]}
  ],
  defaults:{changeType:"countertop",approvedDrawing:"draft",siteMeasure:"pending",supplierStatus:"estimated",fireImpact:"unknown",professionalReview:"pending",scheduleReview:"pending",clientConsent:"pending"},
  checks:{
   drawing:{title:"Controlled drawing issue",sourceIds:["DOC-1005","REF-I07"]},
   measure:{title:"Site dimension confirmation",sourceIds:["DOC-1006","REF-I03"]},
   supplier:{title:"Supplier written offer and feasibility",sourceIds:["DOC-1010"]},
   fire:{title:"Fire / escape impacts screened by a professional",sourceIds:["REF-I04","REF-I01"]},
   regulatory:{title:"Renovation scope and local review pathway",sourceIds:["REF-I01","REF-I10"]},
   schedule:{title:"Installation and handover impact",sourceIds:["DOC-1006","REF-I07"]},
   client:{title:"Customer signed change acceptance",sourceIds:["REF-I07"]}
  }
 },
 printing:{
  id:"printing",
  title:"A3 artwork & production readiness",
  chineseTitle:"印前檔案與工單檢核",
  purpose:"Screen manually entered job specifications against one named printer's published A3 poster requirements, then track proof, paper and press release.",
  project:"JOB-201",reviewWorkId:"RVW-PRT-201",reviewWorkTitle:"Resolve Minquan poster prepress and stock exceptions",workSourceId:"REF-P02",
  sourceIds:["REF-P02","REF-P03","REF-P04","REF-P07","PRDOC-2002","PRDOC-2004","PRDOC-2005"],
  notice:"File properties are entered manually. NO uploaded file has been parsed, rendered or technically preflighted. The A3 bleed and resolution examples are specific to the referenced printer, not universal Taiwan law.",
  fields:[
   {id:"fileFormat",label:"Source file type · 檔案格式",type:"select",options:[["pdf","PDF"],["ai","Adobe Illustrator"],["jpg","JPG / PNG"],["unknown","Unknown"]]},
   {id:"widthMm",label:"Artwork width (mm) · 含出血寬度",type:"number",min:50,max:3000,step:0.5},
   {id:"heightMm",label:"Artwork height (mm) · 含出血高度",type:"number",min:50,max:3000,step:0.5},
   {id:"bleedMm",label:"Bleed per side (mm) · 出血",type:"number",min:0,max:20,step:0.5},
   {id:"resolutionDpi",label:"Placed image resolution (dpi)",type:"number",min:30,max:2400,step:1},
   {id:"fonts",label:"Font treatment · 字型",type:"select",options:[["embedded","Embedded or outlined"],["unresolved","Unknown / missing fonts"]]},
   {id:"colorMode",label:"Color mode · 色彩模式",type:"select",options:[["cmyk","CMYK"],["rgb","RGB"],["unknown","Unknown"]]},
   {id:"proof",label:"Customer proof revision · 客戶校稿",type:"select",options:[["approved","Latest proof accepted in writing"],["pending","Proof approval pending"]]},
   {id:"stock",label:"Paper stock · 紙材",type:"select",options:[["confirmed","Chosen stock verified with supplier"],["pending","Alternative stock not yet verified"]]},
   {id:"pressSlot",label:"Press and finishing schedule · 排程",type:"select",options:[["confirmed","Production and finishing window reviewed"],["pending","Capacity / finishing slot not confirmed"]]}
  ],
  defaults:{fileFormat:"pdf",widthMm:300,heightMm:423,bleedMm:1.5,resolutionDpi:200,fonts:"unresolved",colorMode:"rgb",proof:"pending",stock:"pending",pressSlot:"pending"},
  checks:{
   format:{title:"File format suitable for referenced vendor process",sourceIds:["REF-P02"]},
   dimensions:{title:"A3 trim and file dimensions with bleed",sourceIds:["REF-P03"]},
   resolution:{title:"Artwork raster image resolution",sourceIds:["REF-P02"]},
   fonts:{title:"Font/embed treatment",sourceIds:["REF-P02"]},
   color:{title:"Color conversion and proof expectations",sourceIds:["REF-P04"]},
   proof:{title:"Latest approved customer proof",sourceIds:["REF-P07","PRDOC-2005"]},
   stock:{title:"Approved substrate and supplier stock",sourceIds:["PRDOC-2004","REF-P11"]},
   capacity:{title:"Printing and finishing production readiness",sourceIds:["REF-P06","REF-P08"]}
  }
 }
};
const item=(def,key,status,detail,next)=>{
 const meta=def.checks[key];return {id:key,title:meta.title,status,detail,nextAction:next||"",sourceIds:meta.sourceIds};
};
export const getReadinessPack=id=>READINESS_PACKS[id]||null;
export const initialReadiness=id=>{
 const pack=getReadinessPack(id);
 if(!pack)throw Error("Unsupported industry readiness pack");
 return {...pack.defaults};
};
export function normalizeReadinessInput(industry,value){
 const def=getReadinessPack(industry);
 if(!def)throw Error("Unsupported industry readiness pack");
 const out={};
 for(const field of def.fields){
  const incoming=value?.[field.id];
  if(field.type==="number"){
   const candidate=incoming===undefined||incoming===null||incoming===""?def.defaults[field.id]:Number(incoming);
   out[field.id]=Number.isFinite(candidate)?Math.min(field.max,Math.max(field.min,candidate)):def.defaults[field.id];
  }else{
   const valid=field.options.some(x=>x[0]===incoming);
   out[field.id]=valid?incoming:def.defaults[field.id];
  }
 }
 return out;
}
const matches=(v,expected)=>v===expected;
export function evaluateReadiness(industry,raw){
 const def=getReadinessPack(industry);
 if(!def)throw Error("Unsupported industry readiness pack");
 const value=normalizeReadinessInput(industry,raw);
 const results=[];
 const add=(key,status,detail,next)=>results.push(item(def,key,status,detail,next));
 if(industry==="interior"){
  add("drawing",matches(value.approvedDrawing,"approved")?"pass":"hold",
   matches(value.approvedDrawing,"approved")?"Current approved revision is recorded as manually checked.":"A draft, unknown, or superseded drawing cannot be assumed to authorize work.",
   "Verify the current approved drawing and keep drafts separate.");
  add("measure",matches(value.siteMeasure,"verified")?"pass":"hold",
   matches(value.siteMeasure,"verified")?"Field measurements are recorded as checked.":"Dimensions, cutouts and cabinet support remain unconfirmed.",
   "Arrange a qualified field measure and record the signed result.");
  add("supplier",matches(value.supplierStatus,"written")?"pass":"hold",
   matches(value.supplierStatus,"written")?"A written supplier offer is recorded as checked, not fetched from a live API.":"Historical or illustrative supplier costs are insufficient for a customer commitment.",
   "Confirm actual cost, material suitability and availability directly with the supplier.");
  add("fire",matches(value.fireImpact,"no")?"pass":"hold",
   value.fireImpact==="yes"?"The work may affect fire-safety or escape systems. Refer it to appropriately qualified parties; this form cannot clear that impact.":value.fireImpact==="unknown"?"Fire/escape impacts have not been assessed.":"The declared scope indicates no known change to fire/escape systems; this is a manual record, not technical certification.",
   "Have the responsible professional review escape and fire-protection implications.");
  const complex=value.changeType!=="countertop";
  add("regulatory",value.professionalReview==="documented"?"review":"hold",
   value.professionalReview==="documented"?"A professional review is recorded. Follow its documented outcome and any required authority process; no permit decision is made here.":complex?"The selected scope may fall under regulated renovation activities. A professional must assess the current Taiwan and local requirements.":"Even an apparently minor surface change requires scope confirmation; do not infer blanket legal exemption.",
   "Record the qualified professional's applicability assessment and any required authority decision.");
  add("schedule",value.scheduleReview==="reviewed"?"pass":"hold",
   value.scheduleReview==="reviewed"?"Work sequencing and schedule dependencies are recorded as checked.":"Unverified supply and installation work could affect completion dates.",
   "Record supplier lead-time evidence and the updated work sequence.");
  add("client",value.clientConsent==="written"?"pass":"hold",
   value.clientConsent==="written"?"Written customer acceptance is recorded in the example.":"The customer has not approved the revised scope and cost in writing.",
   "Attach the signed change order before work release.");
 }else{
  add("format",value.fileFormat==="pdf"?"pass":"hold",
   value.fileFormat==="pdf"?"Manually declared PDF format matches the cited vendor's suggested handoff.":"The cited vendor's guidance describes PDF delivery; other formats need that provider's explicit confirmation.",
   "Request an agreed, production-ready PDF version.");
  const expectedW=297+2*value.bleedMm,expectedH=420+2*value.bleedMm;
  const bleedValid=value.bleedMm>=3;
  const dimensionMatch=Math.abs(value.widthMm-expectedW)<=.5&&Math.abs(value.heightMm-expectedH)<=.5;
  add("dimensions",bleedValid&&dimensionMatch?"pass":"hold",
   "A3 target: 297 × 420 mm trim. At "+value.bleedMm+" mm declared bleed per side, an illustrative file size is "+expectedW.toFixed(1)+" × "+expectedH.toFixed(1)+" mm; entered size is "+value.widthMm+" × "+value.heightMm+" mm. "+(!bleedValid?"The example vendor recommends 3 mm bleed.":dimensionMatch?"The manually entered dimensions are consistent.":"File dimensions and bleed do not reconcile."),
   "Verify trim size, actual artwork geometry, safety area and the selected printer's specifications.");
  add("resolution",value.resolutionDpi>=300?"pass":"hold",
   "Declared placed-image resolution: "+value.resolutionDpi+" dpi. The cited provider's example recommends at least 300 dpi at final output size.",
   "Check actual raster assets and print-scale image resolution in the original file.");
  add("fonts",value.fonts==="embedded"?"pass":"hold",
   value.fonts==="embedded"?"Fonts are declared embedded/outlined, but the actual file was not inspected.":"Font embedding/outline handling has not been verified.",
   "Open and inspect embedded fonts or request outlined type.");
  add("color",value.colorMode==="cmyk"?"pass":"review",
   value.colorMode==="cmyk"?"CMYK mode declared; an actual color proof may still be needed.":value.colorMode==="rgb"?"RGB may be printable after conversion but can shift appearance. Vendor-specific approval and color proof are recommended.":"Color mode has not been specified.",
   "Confirm the receiving printer's color workflow and proof requirements.");
  add("proof",value.proof==="approved"?"pass":"hold",
   value.proof==="approved"?"The latest customer proof is recorded as accepted in writing; verify version.":"Customer approval of the latest proof remains pending.",
   "Attach the signed or recorded approval to the correct proof revision.");
  add("stock",value.stock==="confirmed"?"pass":"hold",
   value.stock==="confirmed"?"Paper stock is declared confirmed; the demo cannot independently verify inventory.":"The requested substrate or substitution lacks confirmed availability.",
   "Check the selected supplier's stock, cost and material specifications.");
  add("capacity",value.pressSlot==="confirmed"?"pass":"hold",
   value.pressSlot==="confirmed"?"Press and postpress windows are recorded as reviewed.":"Press or finishing capacity is not confirmed.",
   "Reserve a realistic machine/finishing slot before communicating delivery.");
 }
 const holds=results.filter(x=>x.status==="hold"),reviews=results.filter(x=>x.status==="review"),passes=results.filter(x=>x.status==="pass");
 const status=holds.length?"HOLD_FOR_EVIDENCE":"READY_FOR_HUMAN_REVIEW";
 const message=holds.length?holds.length+" blocking information gap"+(holds.length===1?"":"s")+" remain. Create a review task; do not release production or promise dates.":"No checklist blockers remain in the manually entered facts. An authorized person must still inspect the real documents and decide what may proceed.";
 return {industry,inputs:value,status,message,checks:results,counts:{pass:passes.length,hold:holds.length,review:reviews.length},sourceIds:[...new Set(results.flatMap(r=>r.sourceIds))],evaluatedFrom:"MANUAL_DEMO_INPUT",isRegulatoryCertification:false,isActualFilePreflight:false};
}
export function validateReadinessSources(pack,model){
 const missing=[];
 for(const item of Object.values(pack.checks))for(const id of item.sourceIds)if(!model.document(id))missing.push(id);
 if(!model.document(pack.workSourceId))missing.push(pack.workSourceId);
 if(missing.length)throw Error("Missing source IDs for "+pack.id+": "+[...new Set(missing)].join(","));
 return {ok:true,refs:Object.values(pack.checks).reduce((n,item)=>n+item.sourceIds.length,0)};
}
