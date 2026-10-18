import {escapeHtml as e} from "./core-model.js";
import {getReadinessPack,evaluateReadiness} from "./readiness-rules.js";
import {heading,section,button,source,tag} from "./ui-shared.js";
/**
 * UI operates on MANUALLY ENTERED conditions. It is not a PDF parser,
 * a legal determination, a site inspection or a regulatory approval.
 */
export function readinessView(c){
 const {pack,state}=c,config=getReadinessPack(pack.id);
 if(!config)return '<div class="panel"><h2>No readiness template exists for this industry.</h2></div>';
 const current=state.readiness?.inputs||config.defaults;
 const assessment=evaluateReadiness(pack.id,current);
 const saved=state.readiness?.assessment;
 const recorded=saved&&JSON.stringify(saved.inputs)===JSON.stringify(assessment.inputs);
 const workCreated=!!state.readiness?.reviewTaskCreated;
 const statusWord=assessment.status==="HOLD_FOR_EVIDENCE"?"On hold · missing evidence":"Prepared for human review";
 const statusPill=assessment.status==="HOLD_FOR_EVIDENCE"?"warning":"success";
 const itemTitle=pack.id==="interior"?"Songshan Residence · Quartz countertop change":"Minquan Poster Run · A3 paper-stock substitution";
 const opts=f=>f.type==="number"?'<input type="number" class="readiness-input" data-readiness="'+e(f.id)+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" value="'+e(assessment.inputs[f.id])+'" aria-label="'+e(f.label)+'">':
 '<select class="readiness-select" data-readiness="'+e(f.id)+'" aria-label="'+e(f.label)+'">'+f.options.map(op=>'<option value="'+e(op[0])+'"'+(op[0]===assessment.inputs[f.id]?" selected":"")+'>'+e(op[1])+'</option>').join("")+'</select>';
 let out=heading(config.title,config.purpose,tag("Manually assessed example · "+e(config.chineseTitle)),"INDUSTRY READINESS WORKBENCH");
 out+='<div class="readiness-context"><div><div class="suite-eyebrow">'+e(config.project)+' · SCENARIO</div><h3>'+e(itemTitle)+'</h3><p>'+e(config.notice)+'</p></div>'+button("Open industry sources ↗","nav","playbook","button-outline")+'</div>';
 out+='<section class="section readiness-layout"><div class="panel">'+section("Record what is actually known","Change the example details and watch issues update. Nothing has been automatically inspected.")+'<div class="readiness-fields">'+config.fields.map(field=>'<label class="form-field"><span>'+e(field.label)+'</span>'+opts(field)+'</label>').join("")+'</div><div class="readiness-disclosure">These selections are staff-entered representations of a fictional job. They must be verified against actual drawings, artwork, vendor commitments and customer approvals in a real deployment.</div><div class="action-stack">'+button("Reset screening inputs","readinessReset","","button-outline")+button("Record this assessment","readinessRecord","","button-primary")+'</div></div>';
 out+='<div class="panel">'+section("Findings & next steps","Each result includes its basis and a relevant evidence source.")+'<div class="readiness-status '+statusPill+'"><div><small>Current decision support</small><strong>'+e(statusWord)+'</strong><span>'+e(assessment.message)+'</span></div><div class="readiness-status-numbers"><span>'+assessment.counts.pass+' ✓</span><span>'+assessment.counts.hold+' to resolve</span><span>'+assessment.counts.review+' review</span></div></div>';
 if(recorded)out+='<div class="notice green">Assessment recorded in this browser on '+e(saved.recordedAt||"a previous session")+'. This is NOT an authorized approval or verified technical inspection.</div>';
 else out+='<div class="secondary-note">This is a live preview of the entered conditions. Select “Record this assessment” to preserve the sample findings and enable a linked review work order.</div>';
 out+='<div class="readiness-list">'+assessment.checks.map((x,i)=>{
  const title=x.status==="pass"?"Recorded as checked":x.status==="hold"?"Blocking information gap":"Requires professional or process review";
  return '<div class="readiness-finding '+x.status+'"><div class="readiness-finding-head"><span class="readiness-indicator">'+(x.status==="pass"?"✓":x.status==="hold"?"!":"?")+'</span><div><strong>'+e(x.title)+'</strong><small>'+title+'</small></div></div><p>'+e(x.detail)+'</p>'+(x.status==="pass"?"":'<div class="readiness-next">Next: '+e(x.nextAction)+'</div>')+'<div class="readiness-sources">'+x.sourceIds.map(id=>source(id)).join(" ")+'</div></div>';
 }).join("")+'</div>';
 out+='<div class="readiness-task-actions">'+button(workCreated?"Review task created ✓":"Create linked review work item","readinessCreateTask","","button-secondary")+button("Open work orders ↗","nav","work","button-outline")+'</div>';
 if(workCreated)out+='<p class="disclosure">Task ID '+e(config.reviewWorkId)+' is linked to '+e(config.project)+' and appears in Work Orders. It is stored only in this browser.</p>';
 out+='</div></section>';
 out+='<section class="section">'+section("Where this fits in daily operations","Readiness checks are one stage of a larger company workflow, not an artificial green light.")+'<div class="readiness-flow"><div><small>01 · Inquiry</small><strong>Capture job scope</strong></div><div><small>02 · Evidence</small><strong>Inspect current sources</strong></div><div><small>03 · Decisions</small><strong>Resolve exceptions</strong></div><div><small>04 · Execution</small><strong>Authorized work</strong></div></div><div class="readiness-links">'+button("Company knowledge ↗","nav","knowledge","button-outline")+button("Quotations & approvals ↗","nav","quotes","button-secondary")+'</div></section>';
 return out;
}
