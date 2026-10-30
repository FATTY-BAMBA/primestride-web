import {getPack} from "./industry-packs.js";
import {WorkspaceModel} from "./core-model.js";
import {extractDocument,reviewCandidate,approveDocument,reviewSummary} from "./document-intelligence.js";
import {sampleFile} from "./sample-documents.js";
import {bridgeDefaults,bridgePreview,suggestCostCodes,createSandboxPrecedent,attachSandboxPrecedent,detachSandboxPrecedent} from "./document-history-bridge.js";
import {historicalEstimate} from "./historical-estimator.js";

function assertion(ok,message){if(!ok)throw Error(message);}
async function check(industry,format){
 const seedUrl=industry==="interior"?"../stridebrain-interiors/seed.json":"./seeds/printing.json";
 const [seed,h]=await Promise.all([fetch(seedUrl).then(r=>r.json()),fetch("./seeds/historical-"+industry+".json").then(r=>r.json())]);
 const pack=getPack(industry);
 seed.documents.push(...h.documents);
 const model=new WorkspaceModel(seed,pack);
 const example=sampleFile(industry,format);
 const file=new File([example.bytes],example.filename,{type:example.type});
 const report=await extractDocument(file);
 assertion(report.candidates.length>=4,"No extracted cost lines from "+format);
 assertion(new Set(report.candidates.map(x=>x.id)).size===report.candidates.length,"Duplicate candidate IDs");
 assertion(report.candidates.every(x=>x.sourceRef&&x.sourceRef.includes("!")),"Missing source cells");
 const invalid=report.candidates.filter(x=>x.flags.some(f=>f.severity==="blocker"));
 assertion(invalid.length>=1,"Sample should contain an intentionally invalid cost line");
 const firstInvalid=invalid[0];
 assertion(!reviewCandidate(report,firstInvalid.id,"approved").ok,"Blocked cost line must not be approved");
 for(const x of report.candidates){
  const flag=x.flags.some(f=>f.severity==="blocker");
  const result=reviewCandidate(report,x.id,flag?"excluded":"approved");
  assertion(result.ok,"Could not review line "+x.id);
 }
 report.currencyConfirmed=true;
 const approved=approveDocument(report,"Only fictional sample data; invalid lines excluded for the sandbox.");
 assertion(approved.ok,"Cannot finish sample file review: "+(approved.reason||""));
 const mapped=bridgeDefaults(report,h,industry);
 mapped.codeMapping=suggestCostCodes(report,h,industry);
 Object.assign(mapped,{acknowledged:true,scopeComplete:true,sourceExplained:true,excludedReason:"Invalid line excluded; fictional hypothetical cost scope only."});
 const preview=bridgePreview(report,h,mapped);
 assertion(preview.ok,"Bridge review blocked: "+preview.issues.join("; "));
 const one=createSandboxPrecedent(report,h,mapped);
 assertion(one.ok,"History record cannot be built: "+(one.issues||[]).join("; "));
 const initialSize=h.records.length,initialDocuments=model.seed.documents.length;
 const added=attachSandboxPrecedent(h,model,one);
 assertion(added.ok,"Failed to attach local precedent");
 assertion(h.records.length===initialSize+1,"Wrong precedent count");
 assertion(model.bySource.get(one.document.id)===one.document,"Local evidence source not indexed");
 const request={...h.defaults,category:mapped.category,tier:mapped.tier,location:mapped.location,quantity:mapped.jobQuantity,scope:one.record.scope};
 const result=historicalEstimate(h,request);
 assertion(result.ok,"Synthetic historical quote did not calculate: "+result.reason);
 assertion(result.localSandboxCount>0,"Local precedent was not considered");
 assertion(result.sourceIds.includes(one.document.id),"Quote missing local source citation");
 const double=attachSandboxPrecedent(h,model,one);
 assertion(!double.ok,"Duplicate import must be denied");
 const removed=detachSandboxPrecedent(h,model,one.record.id);
 assertion(removed.ok,"Local source detach failed");
 assertion(h.records.length===initialSize&&model.seed.documents.length===initialDocuments,"Clear did not restore document counts");
 assertion(!model.bySource.has(one.document.id),"Local evidence survived clear");
 const trunc=JSON.parse(JSON.stringify(report));trunc.findings.push({code:"ROW_LIMIT",severity:"review",message:"Truncated",ref:"Sheet"});
 assertion(!bridgePreview(trunc,h,mapped).ok,"Truncated source should be rejected");
 const consent=bridgePreview(report,h,{...mapped,acknowledged:false});
 assertion(!consent.ok,"Missing consent should be rejected");
 return {industry,format,sourceLines:report.candidates.length,accepted:reviewSummary(report).approved,blockedRows:invalid.length,costBasis:one.record.finalDirectCost,comparables:result.comparables.length,source:one.document.id};
}
async function run(){
 const button=document.getElementById("run"),status=document.getElementById("status"),tbody=document.getElementById("results");
 button.disabled=true;status.textContent="Testing fictional CSV and Excel fixtures in your browser…";tbody.innerHTML="";
 let pass=0,fail=0;
 for(const industry of ["interior","printing"])for(const format of ["csv","xlsx"]){
  const tr=document.createElement("tr");
  try{
   const result=await check(industry,format);
   pass++;
   tr.innerHTML='<td>'+industry+'</td><td>'+format.toUpperCase()+'</td><td class="good">PASS</td><td>'+result.sourceLines+' lines · '+result.accepted+' accepted · '+result.blockedRows+' blocked · '+result.comparables+' matches</td>';
  }catch(e){
   fail++;
   tr.innerHTML='<td>'+industry+'</td><td>'+format.toUpperCase()+'</td><td class="bad">FAIL</td><td></td>';
   const text=document.createElement("span");text.textContent=String(e?.message||e);tr.lastElementChild.appendChild(text);
  }
  tbody.appendChild(tr);
 }
 button.disabled=false;status.textContent=pass+" passed · "+fail+" failed. This checks only sample parsing and cost-bridge logic; it does not verify real customer pricing, production security or PDF/OCR.";
}
document.getElementById("run").addEventListener("click",run);
if(new URLSearchParams(location.search).get("run")==="1")run();
