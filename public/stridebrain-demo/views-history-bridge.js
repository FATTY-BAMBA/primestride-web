import {escapeHtml as e,money} from "./core-model.js";
import {reviewSummary} from "./document-intelligence.js";
import {bridgeDefaults,bridgePreview} from "./document-history-bridge.js";
import {button,section,source} from "./ui-shared.js";
import {historyZhLabel} from "./views-history.js";
/** Display-only Chinese for readiness conditions returned by document-history-bridge.js. */
const ISSUE_ZH={
 "Review and approve the extracted document first.":"請先審閱並核准擷取出的文件內容。",
 "Confirm the file's cost currency before history use.":"納入歷史資料前，請先確認檔案中的成本幣別。",
 "At least one accepted, reconciled cost line is required.":"至少需要一筆已接受且已核對的成本明細。",
 "Map every accepted cost line to a company cost code.":"請將每一筆已接受的成本明細對應到公司的成本代碼。",
 "Mapped cost total must reconcile with the accepted extraction.":"對應後的成本總額必須與已接受的擷取結果相符。",
 "Enter a valid positive whole-job quantity (e.g. ping or pieces).":"請輸入有效的整案數量（正整數，例如坪數或件數）。",
 "Enter a concise fictional case title.":"請輸入簡短的虛構案例名稱。",
 "Select a supported business category.":"請選擇支援的業務類別。",
 "Select a supported finish tier.":"請選擇支援的完工等級。",
 "Select a supported location.":"請選擇支援的地點。",
 "Enter a valid completed-date example (2021-01-01 through 2026-10-18).":"請輸入有效的完工日期示例（2021-01-01 至 2026-10-18）。",
 "Only fictional/sanitized sandbox cases can be promoted in this public demo.":"此公開示範只能加入虛構或已去識別化的沙盒案例。",
 "Acknowledge that this is fictional demo data, not independently confirmed actual cost.":"請確認這是虛構的示範資料，並非經獨立確認的實際成本。",
 "Confirm that the selected lines represent a *hypothetical* complete direct-cost scope for this demo.":"請確認所選明細構成此示範中「假設性」完整的直接成本範圍。",
 "Confirm the source rows and manual cost-code mappings were reviewed.":"請確認已審閱來源列與人工設定的成本代碼對應。",
 "Explain why excluded source lines are outside the sample completed-cost scope.":"請說明被排除的來源明細為何不屬於示範完工成本範圍。"
};
function issueText(value,zh){
 const text=String(value??"");
 if(!zh)return text;
 if(ISSUE_ZH[text])return ISSUE_ZH[text];
 let m=text.match(/^The source has unresolved parsing\/coverage issues \((.+)\)\.$/);
 if(m)return "來源仍有未解決的解析／涵蓋範圍問題（"+m[1]+"）。";
 m=text.match(/^Invalid extracted cost at (.+)$/);
 if(m)return "擷取的成本無效："+m[1];
 return text;
}
/**
 * Applied only after a source document has been reviewed line-by-line.
 * This UI never claims that an uploaded quote proves actual completed cost.
 */
export function historyBridgeSection(c){
 const {documentSession:session,history,pack}=c,report=session?.report,zh=c.locale!=="en";
 const L=v=>historyZhLabel(v,zh);
 if(!report||!history)return "";
 if(!report.reviewed)return '<section class="section"><div class="history-shortcut"><div><div class="suite-eyebrow">'+(zh?'下一步 · 將已審閱文件轉為歷史成本':'NEXT · REVIEWED DOCUMENT TO HISTORICAL COST')+'</div><h3>'+(zh?'把已審閱的文件轉成暫時的歷史成本示例':'Turn a reviewed document into a temporary historical cost example')+'</h3><p>'+(zh?'請先檢查並核准擷取出的成本明細。文件上的估價並不能證明案件已完工：沙盒還會要求您另外明確確認，這是虛構的完整成本案例。':'First inspect and approve the extracted cost lines. A document estimate is not evidence of a completed project: the sandbox will require an additional, explicit fictitious cost-completeness acknowledgement.')+'</p></div>'+button(zh?"前往歷史成本估價 ↗":"Explore history ↗","nav","history","button-secondary")+'</div></section>';
 const summary=reviewSummary(report);
 if(!summary.approved)return '<section class="section"><div class="secondary-note"><strong>'+(zh?'沒有符合條件的成本明細。':'No eligible cost lines found.')+'</strong> '+(zh?'已審閱的敘述性文字或 PDF 內容可用於知識問答，但不能用來建立歷史實際成本基準。請上傳逐項列出的 CSV 或 XLSX 範例。':'Reviewed narrative/PDF text can support knowledge questions, but cannot be used to create a historical actual-cost benchmark. Upload an itemized CSV or XLSX example.')+'</div></section>';
 if(session.imported)return '<section class="section"><div class="history-shortcut imported"><div><div class="suite-eyebrow">'+(zh?'僅限本次瀏覽器工作階段':'IN THIS BROWSER SESSION ONLY')+'</div><h3>'+(zh?'已連接暫時的歷史成本示例':'Temporary historical cost example connected')+'</h3><p>'+e(session.imported.record.title)+' · '+e(session.imported.record.id)+' · '+e(session.imported.record.scope.length)+(zh?' 個已對應的成本類別。此紀錄仍屬虛構，清除、重新載入或切換產業後就會消失。':' mapped cost categories. The record remains fictional and disappears on clear, reload or industry change.')+'</p><div class="intake-bridge-links">'+source(session.imported.document.id)+'</div></div><div class="action-stack">'+button(zh?"在歷史成本估價中比較 ↗":"Compare in historical estimates ↗","nav","history","button-primary")+button(zh?"移除本機過往案例":"Remove local precedent","bridgeRemove","","button-outline")+'</div></div></section>';
 const form=session.bridgeForm||bridgeDefaults(report,history,pack.id);
 const preview=bridgePreview(report,history,form);
 const categoryOpts=history.categories.map(x=>'<option value="'+e(x.id)+'"'+(form.category===x.id?" selected":"")+'>'+e(L(x.label))+'</option>').join("");
 const tiers=history.tiers.map(x=>'<option value="'+e(x)+'"'+(form.tier===x?" selected":"")+'>'+e(L(x))+'</option>').join("");
 const places=history.locations.map(x=>'<option value="'+e(x)+'"'+(form.location===x?" selected":"")+'>'+e(L(x))+'</option>').join("");
 let out='<section class="section" id="history-bridge"><div class="panel">';
 out+=section(zh?"連接歷史案件智慧報價":"Connect to historical quotation intelligence",zh?"只使用逐筆審閱過的明細，建立暫時的示範完工成本案例。":"Build a temporary sample completed-cost case using only line items that have been individually reviewed.");
 out+='<div class="intake-bridge-notice">'+(zh?'<strong>從來源擷取的內容並不能證明歷史實際成本。</strong>原始文件可能只是報價單或不完整的預算。此步驟刻意要求審閱人員為示範定義一個<b>假設性的完工成本情境</b>。切勿聲稱它代表已查證的客戶、專案、統一發票或供應商單價。':'<strong>Source extraction is not proof of historical actual costs.</strong> The original document may be a quotation or incomplete budget. This step deliberately asks the reviewer to define a <b>hypothetical completed-cost scenario</b> for the demo. Never claim it represents a verified customer, project, tax invoice or supplier rate.')+'</div>';
 out+='<div class="history-form-grid"><label class="form-field">'+(zh?'假設案例名稱':'Hypothetical case title')+'<input type="text" maxlength="120" data-bridge="title" value="'+e(form.title)+'"></label><label class="form-field">'+(zh?'類別':'Category')+'<select data-bridge="category" class="history-select">'+categoryOpts+'</select></label><label class="form-field">'+(zh?'完工等級':'Finish level')+'<select data-bridge="tier" class="history-select">'+tiers+'</select></label><label class="form-field">'+(zh?'地點':'Location')+'<select data-bridge="location" class="history-select">'+places+'</select></label><label class="form-field">'+(zh?'完工日期示例':'Completed-date example')+'<input type="date" data-bridge="completedAt" min="2021-01-01" max="2026-10-18" value="'+e(form.completedAt)+'"></label><label class="form-field">'+(zh?'整案數量（'+e(L(history.unit))+'）':'Whole-job quantity ('+e(history.unit)+')')+'<input type="number" step="1" min="1" max="100000" data-bridge="jobQuantity" value="'+e(form.jobQuantity)+'"></label></div>';
 out+='<div class="intake-bridge-mapping-head"><h3>'+(zh?'將已核准的成本明細對應到本產業的成本代碼':'Map approved cost lines to this industry’s cost codes')+'</h3>'+button(zh?"建議成本代碼（請逐筆審閱）":"Suggest codes (review each)","bridgeSuggest","","button-outline")+'</div>';
 out+='<div class="data-table-wrap"><table class="data-table"><thead><tr><th>'+(zh?'已審閱明細 / 原始儲存格':'Reviewed line / original cell')+'</th><th>'+(zh?'擷取成本':'Extracted cost')+'</th><th>'+(zh?'產業成本代碼':'Industry cost code')+'</th></tr></thead><tbody>';
 for(const line of report.candidates.filter(x=>x.reviewStatus==="approved")){
 const options='<option value="unmapped">'+(zh?'— 尚待對應 —':'— Needs mapping —')+'</option>'+history.costCodes.map(code=>'<option value="'+e(code.id)+'"'+(form.codeMapping?.[line.id]===code.id?" selected":"")+'>'+e(L(code.label))+'</option>').join("");
 out+='<tr><td><strong>'+e(line.description)+'</strong><br><small class="muted">'+e(line.sourceRef)+' · '+e(line.quantity)+' '+e(line.unit||(zh?"來源單位":"source units"))+'</small></td><td>'+money(line.calculatedAmount)+'</td><td><select class="history-select" data-bridge="codeMapping" data-line-id="'+e(line.id)+'" aria-label="'+(zh?'成本代碼：':'Cost code for ')+e(line.description)+'">'+options+'</select></td></tr>';
 }
 out+='</tbody></table></div><p class="disclosure" style="margin-top:9px">'+(zh?'來源明細的數量可能是件數、工時或一次性費用；歷史估價引擎是以所選的<strong>整案</strong>數量換算直接成本總額。每一筆對應都必須由人員確認。':'Source line quantities may be pieces, hours or one-off fees; the selected <strong>whole-job</strong> quantity is what the historical estimator uses to normalize the total direct cost. Each map must be checked by a human.')+'</p>';
 const excluded=report.candidates.filter(x=>x.reviewStatus==="excluded");
 if(excluded.length)out+='<label class="form-field" style="margin-top:16px">'+(zh?'為什麼排除了 '+excluded.length+' 筆原始來源明細？':'Why were '+excluded.length+' original source lines excluded?')+'<textarea data-bridge="excludedReason" rows="2" placeholder="'+(zh?'請說明被排除的列，以及為何其餘範圍已完整…':'Explain the excluded rows and why the remaining scope is complete…')+'">'+e(form.excludedReason||"")+'</textarea></label>';
 const check=(id,text)=>'<label class="intake-bridge-check"><input type="checkbox" data-bridge="'+id+'"'+(form[id]?" checked":"")+'><span>'+text+'</span></label>';
 out+='<div class="intake-bridge-attestations">'+check("acknowledged",zh?"我了解這會建立<strong>示範成本歷史</strong>，並不能證明實際發生的成本或目前價格。":"I understand this creates <strong>sample cost history</strong>, not proof of actual incurred costs or a current price.")+check("scopeComplete",zh?"我確認其餘已對應的明細，在此練習中構成<strong>假設性完整</strong>的直接成本範圍。":"I confirm the remaining mapped lines form a <strong>hypothetically complete</strong> direct-cost scope for this exercise.")+check("sourceExplained",zh?"我已檢查原始檔案儲存格、幣別、被排除的列，以及每一筆建議的成本代碼對應。":"I reviewed the original file cells, currency, excluded rows and every proposed cost-code mapping.")+'</div>';
 out+='<div class="intake-bridge-evaluation"><div class="intake-bridge-summary"><span><strong>'+summary.approved+'</strong> '+(zh?'筆已審閱明細':'reviewed lines')+'</span><span><strong>'+preview.lines.length+'</strong> '+(zh?'個成本類別':'cost categories')+'</span><span><strong>'+money(preview.baseCost)+'</strong> '+(zh?'歷史成本示意':'historical cost illustration')+'</span></div>';
 if(preview.issues.length)out+='<div class="intake-bridge-problems"><strong>'+(zh?'尚有 '+preview.issues.length+' 項條件未完成':preview.issues.length+' conditions remain')+'</strong><ul>'+preview.issues.map(i=>'<li>'+e(issueText(i,zh))+'</li>').join("")+'</ul></div>';
 else out+='<div class="notice green">'+(zh?'已可新增為<strong>僅限本次工作階段的示範成本紀錄</strong>。它仍然不是真實的公司成本帳。':'Ready to add as a <strong>session-only sample cost record</strong>. It is still not a real company cost ledger.')+'</div>';
 out+='</div><div class="action-stack">'+button(zh?"將已審閱示例加入歷史成本估價 ↗":"Add reviewed example to historical estimates ↗","bridgeCommit","","button-primary")+'</div>';
 out+='</div></section>';
 return out;
}
