export const CHECKLISTS={
 interior:{title:"Renovation readiness review",subtitle:"室內裝修 · Source-guided project readiness",scope:"Demonstration only; not a legal, engineering, fire safety or permit assessment.",projectId:"PRJ-101",checks:[
 {id:"scope",label:"Record building use and renovation scope",why:"Regulatory applicability depends on the building and actual works.",references:["REF-I01","REF-I10"],critical:true},
 {id:"qualified",label:"Check professional / contractor qualifications",why:"Verify relevant registrations with official records.",references:["REF-I02"],critical:true},
 {id:"plans",label:"Identify the latest approved construction drawings",why:"Draft design revisions must not silently replace authorized drawings.",references:["REF-I03","REF-I07"],critical:true},
 {id:"safety",label:"Escalate fire and escape-route changes to qualified reviewer",why:"Software does not certify fire or life safety compliance.",references:["REF-I04"],critical:true},
 {id:"contract",label:"Confirm signed scope, exclusions and contract version",why:"A public model form is not a customer's signed contract.",references:["REF-I05","REF-I08"],critical:true},
 {id:"material",label:"Confirm supplier sample, rate and lead time",why:"Historical estimates cannot certify current price or availability.",references:["REF-I08"],critical:true},
 {id:"change",label:"Obtain owner and written customer change acceptance",why:"No changed construction instruction before controlled review.",references:["REF-I07","REF-I08"],critical:true},
 {id:"handover",label:"Prepare relevant completion / handover evidence",why:"Official inspection is a human and authority-led process.",references:["REF-I09"],critical:false}
 ]},
 printing:{title:"Print-job preflight & release review",subtitle:"印刷印前 · Proof and production readiness",scope:"Demonstration only; no uploaded artwork is automatically inspected.",projectId:"JOB-201",checks:[
 {id:"brief",label:"Confirm trim size, quantity, stock and finish",why:"A production job ticket must have a complete specification.",references:["REF-P01"],critical:true},
 {id:"file",label:"Inspect PDF/AI artwork format and fonts",why:"Apply the selected vendor's requirements, not a universal rule.",references:["REF-P02"],critical:true},
 {id:"bleed",label:"Check requested trim, bleed and resolution",why:"One Taiwanese printer documents 3 mm bleed and 300 dpi guidance.",references:["REF-P02","REF-P03"],critical:true},
 {id:"color",label:"Confirm expected print color and proof requirement",why:"CMYK and conversion risks must be understood by the customer.",references:["REF-P04"],critical:true},
 {id:"proof",label:"Record written approval of the current proof revision",why:"The correct proof revision must govern press release.",references:["REF-P07"],critical:true},
 {id:"stock",label:"Confirm physical stock and current supplier price",why:"A fictional stock estimate does not prove available inventory.",references:["REF-P11"],critical:true},
 {id:"schedule",label:"Check capacity, finishing and dispatch dependencies",why:"A shipping date needs a feasible production plan.",references:["REF-P06","REF-P08"],critical:true},
 {id:"quality",label:"Define post-press QC and delivered-goods acceptance",why:"Inspection and reprint actions need company-specific rules.",references:["REF-P09"],critical:false}
 ]}
};
export const CHECK_STATES=["unknown","confirmed","needs_review","not_applicable"];
export function defaultInspection(industry){const cfg=CHECKLISTS[industry];if(!cfg)throw Error("Unknown industry");return {industry,projectId:cfg.projectId,checks:Object.fromEntries(cfg.checks.map(x=>[x.id,{status:"unknown",note:"",reviewer:"",updatedAt:null}])),audit:[]};}
export function evaluateInspection(cfg,state){const mandatory=cfg.checks.filter(x=>x.critical);const statusFor=x=>state?.checks?.[x.id]?.status||"unknown";const open=mandatory.filter(x=>statusFor(x)!=="confirmed"&&statusFor(x)!=="not_applicable");return {total:cfg.checks.length,confirmed:cfg.checks.filter(x=>statusFor(x)==="confirmed").length,unknown:cfg.checks.filter(x=>statusFor(x)==="unknown").length,needsReview:cfg.checks.filter(x=>statusFor(x)==="needs_review").length,openGates:open.length,readyForSimulatedHandoff:open.length===0,notAComplianceCertificate:true};}
export function setInspectionStatus(cfg,state,id,status,note=""){const check=cfg.checks.find(x=>x.id===id);if(!check) return {ok:false,reason:"Unknown check"};if(!CHECK_STATES.includes(status))return {ok:false,reason:"Invalid state"};if(status==="not_applicable"&&!String(note).trim())return {ok:false,reason:"State why the check does not apply."};const row=state.checks[id]||(state.checks[id]={});row.status=status;row.note=String(note).slice(0,500);row.updatedAt=new Date().toISOString();state.audit.unshift({checkId:id,status,at:row.updatedAt});return {ok:true};}
