import {escapeHtml as e,money} from "./core-model.js";
import {reviewSummary} from "./document-intelligence.js";
import {bridgeDefaults,bridgePreview} from "./document-history-bridge.js";
import {button,section,source} from "./ui-shared.js";
/**
 * Applied only after a source document has been reviewed line-by-line.
 * This UI never claims that an uploaded quote proves actual completed cost.
 */
export function historyBridgeSection(c){
 const {documentSession:session,history,pack}=c,report=session?.report;
 if(!report||!history)return "";
 if(!report.reviewed)return '<section class="section"><div class="history-shortcut"><div><div class="suite-eyebrow">NEXT · REVIEWED DOCUMENT TO HISTORICAL COST</div><h3>Turn a reviewed document into a temporary historical cost example</h3><p>First inspect and approve the extracted cost lines. A document estimate is not evidence of a completed project: the sandbox will require an additional, explicit fictitious cost-completeness acknowledgement.</p></div>'+button("Explore history ↗","nav","history","button-secondary")+'</div></section>';
 const summary=reviewSummary(report);
 if(!summary.approved)return '<section class="section"><div class="secondary-note"><strong>No eligible cost lines found.</strong> Reviewed narrative/PDF text can support knowledge questions, but cannot be used to create a historical actual-cost benchmark. Upload an itemized CSV or XLSX example.</div></section>';
 if(session.imported)return '<section class="section"><div class="history-shortcut imported"><div><div class="suite-eyebrow">IN THIS BROWSER SESSION ONLY</div><h3>Temporary historical cost example connected</h3><p>'+e(session.imported.record.title)+' · '+e(session.imported.record.id)+' · '+e(session.imported.record.scope.length)+' mapped cost categories. The record remains fictional and disappears on clear, reload or industry change.</p><div class="intake-bridge-links">'+source(session.imported.document.id)+'</div></div><div class="action-stack">'+button("Compare in historical estimates ↗","nav","history","button-primary")+button("Remove local precedent","bridgeRemove","","button-outline")+'</div></div></section>';
 const form=session.bridgeForm||bridgeDefaults(report,history,pack.id);
 const preview=bridgePreview(report,history,form);
 const categoryOpts=history.categories.map(x=>'<option value="'+e(x.id)+'"'+(form.category===x.id?" selected":"")+'>'+e(x.label)+'</option>').join("");
 const tiers=history.tiers.map(x=>'<option value="'+e(x)+'"'+(form.tier===x?" selected":"")+'>'+e(x)+'</option>').join("");
 const places=history.locations.map(x=>'<option value="'+e(x)+'"'+(form.location===x?" selected":"")+'>'+e(x)+'</option>').join("");
 let out='<section class="section" id="history-bridge"><div class="panel">';
 out+=section("Connect to historical quotation intelligence","Build a temporary fictional completed-cost case using only line items that have been individually reviewed.");
 out+='<div class="intake-bridge-notice"><strong>Source extraction is not proof of historical actual costs.</strong> The original document may be a quotation or incomplete budget. This step deliberately asks the reviewer to define a <b>hypothetical completed-cost scenario</b> for the demo. Never claim it represents a verified customer, project, tax invoice or supplier rate.</div>';
 out+='<div class="history-form-grid"><label class="form-field">Hypothetical case title<input type="text" maxlength="120" data-bridge="title" value="'+e(form.title)+'"></label><label class="form-field">Category<select data-bridge="category" class="history-select">'+categoryOpts+'</select></label><label class="form-field">Finish level<select data-bridge="tier" class="history-select">'+tiers+'</select></label><label class="form-field">Location<select data-bridge="location" class="history-select">'+places+'</select></label><label class="form-field">Completed-date example<input type="date" data-bridge="completedAt" min="2021-01-01" max="2026-10-18" value="'+e(form.completedAt)+'"></label><label class="form-field">Whole-job quantity ('+e(history.unit)+')<input type="number" step="1" min="1" max="100000" data-bridge="jobQuantity" value="'+e(form.jobQuantity)+'"></label></div>';
 out+='<div class="intake-bridge-mapping-head"><h3>Map approved cost lines to this industry’s cost codes</h3>'+button("Suggest codes (review each)","bridgeSuggest","","button-outline")+'</div>';
 out+='<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Reviewed line / original cell</th><th>Extracted cost</th><th>Industry cost code</th></tr></thead><tbody>';
 for(const line of report.candidates.filter(x=>x.reviewStatus==="approved")){
 const options='<option value="unmapped">— Needs mapping —</option>'+history.costCodes.map(code=>'<option value="'+e(code.id)+'"'+(form.codeMapping?.[line.id]===code.id?" selected":"")+'>'+e(code.label)+'</option>').join("");
 out+='<tr><td><strong>'+e(line.description)+'</strong><br><small class="muted">'+e(line.sourceRef)+' · '+e(line.quantity)+' '+e(line.unit||"source units")+'</small></td><td>'+money(line.calculatedAmount)+'</td><td><select class="history-select" data-bridge="codeMapping" data-line-id="'+e(line.id)+'" aria-label="Cost code for '+e(line.description)+'">'+options+'</select></td></tr>';
 }
 out+='</tbody></table></div><p class="disclosure" style="margin-top:9px">Source line quantities may be pieces, hours or one-off fees; the selected <strong>whole-job</strong> quantity is what the historical estimator uses to normalize the total direct cost. Each map must be checked by a human.</p>';
 const excluded=report.candidates.filter(x=>x.reviewStatus==="excluded");
 if(excluded.length)out+='<label class="form-field" style="margin-top:16px">Why were '+excluded.length+' original source lines excluded?<textarea data-bridge="excludedReason" rows="2" placeholder="Explain the excluded rows and why the remaining scope is complete…">'+e(form.excludedReason||"")+'</textarea></label>';
 const check=(id,text)=>'<label class="intake-bridge-check"><input type="checkbox" data-bridge="'+id+'"'+(form[id]?" checked":"")+'><span>'+text+'</span></label>';
 out+='<div class="intake-bridge-attestations">'+check("acknowledged","I understand this creates <strong>fictional sandbox cost history</strong>, not proof of actual incurred costs or a current price.")+check("scopeComplete","I confirm the remaining mapped lines form a <strong>hypothetically complete</strong> direct-cost scope for this exercise.")+check("sourceExplained","I reviewed the original file cells, currency, excluded rows and every proposed cost-code mapping.")+'</div>';
 out+='<div class="intake-bridge-evaluation"><div class="intake-bridge-summary"><span><strong>'+summary.approved+'</strong> reviewed lines</span><span><strong>'+preview.lines.length+'</strong> cost categories</span><span><strong>'+money(preview.baseCost)+'</strong> historical cost illustration</span></div>';
 if(preview.issues.length)out+='<div class="intake-bridge-problems"><strong>'+preview.issues.length+' conditions remain</strong><ul>'+preview.issues.map(i=>'<li>'+e(i)+'</li>').join("")+'</ul></div>';
 else out+='<div class="notice green">Ready to add as a <strong>session-only fictional precedent</strong>. It is still not a real company cost ledger.</div>';
 out+='</div><div class="action-stack">'+button("Add reviewed example to historical estimates ↗","bridgeCommit","","button-primary")+'</div>';
 out+='</div></section>';
 return out;
}
