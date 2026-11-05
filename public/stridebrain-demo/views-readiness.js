import {escapeHtml as e} from "./core-model.js";
import {getReadinessPack,evaluateReadiness} from "./readiness-rules.js";
import {heading,section,button,source,tag} from "./ui-shared.js";
import {readinessText} from "./readiness-locale.js";
/**
 * UI operates on MANUALLY ENTERED conditions. It is not a PDF parser,
 * a legal determination, a site inspection or a regulatory approval.
 */
export function readinessView(c){
 const {pack,state}=c,config=getReadinessPack(pack.id),zh=c.locale!=="en",L=(en,zhText)=>zh?zhText:en,t=x=>readinessText(x,zh);
 if(!config)return '<div class="panel"><h2>'+L("No readiness template exists for this industry.","此產業尚無作業檢查範本。")+'</h2></div>';
 const current=state.readiness?.inputs||config.defaults;
 const assessment=evaluateReadiness(pack.id,current);
 const saved=state.readiness?.assessment;
 const recorded=saved&&JSON.stringify(saved.inputs)===JSON.stringify(assessment.inputs);
 const workCreated=!!state.readiness?.reviewTaskCreated;
 const statusWord=assessment.status==="HOLD_FOR_EVIDENCE"?L("On hold · missing evidence","暫停 · 缺少依據"):L("Prepared for human review","已備妥，待人工審查");
 const statusPill=assessment.status==="HOLD_FOR_EVIDENCE"?"warning":"success";
 const itemTitle=pack.id==="interior"?L("Songshan Residence · Quartz countertop change","松山靜宅 · 廚房石英石檯面變更"):L("Minquan Poster Run · A3 paper-stock substitution","民權海報印製 · A3 紙材替換");
 const opts=f=>f.type==="number"?'<input type="number" class="readiness-input" data-readiness="'+e(f.id)+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" value="'+e(assessment.inputs[f.id])+'" aria-label="'+e(t(f.label))+'">':
 '<select class="readiness-select" data-readiness="'+e(f.id)+'" aria-label="'+e(t(f.label))+'">'+f.options.map(op=>'<option value="'+e(op[0])+'"'+(op[0]===assessment.inputs[f.id]?" selected":"")+'>'+e(t(op[1]))+'</option>').join("")+'</select>';
 let out=zh?heading(config.chineseTitle,t(config.purpose),tag("人工評估範例"),"產業作業檢查"):heading(config.title,config.purpose,tag("Manually assessed example · "+e(config.chineseTitle)),"INDUSTRY READINESS WORKBENCH");
 out+='<div class="readiness-context"><div><div class="suite-eyebrow">'+e(config.project)+' · '+L('SCENARIO','情境')+'</div><h3>'+e(itemTitle)+'</h3><p>'+e(t(config.notice))+'</p></div>'+button(L("Open industry sources ↗","查看產業依據 ↗"),"nav","playbook","button-outline")+'</div>';
 out+='<section class="section readiness-layout"><div class="panel">'+section(L("Record what is actually known","記錄目前實際已知的狀況"),L("Change the example details and watch issues update. Nothing has been automatically inspected.","修改範例條件，檢核結果會即時更新。系統沒有自動檢查任何項目。"))+'<div class="readiness-fields">'+config.fields.map(field=>'<label class="form-field"><span>'+e(t(field.label))+'</span>'+opts(field)+'</label>').join("")+'</div><div class="readiness-disclosure">'+L('These selections are staff-entered representations of a fictional job. They must be verified against actual drawings, artwork, vendor commitments and customer approvals in a real deployment.','這些選項是員工為虛構案件輸入的狀況。實際導入時，必須對照真實圖說、美工稿、供應商承諾與客戶核准。')+'</div><div class="action-stack">'+button(L("Reset screening inputs","重設檢核條件"),"readinessReset","","button-outline")+button(L("Record this assessment","記錄這次評估"),"readinessRecord","","button-primary")+'</div></div>';
 out+='<div class="panel">'+section(L("Findings & next steps","檢核結果與下一步"),L("Each result includes its basis and a relevant evidence source.","每一項結果都附判斷依據與相關來源。"))+'<div class="readiness-status '+statusPill+'"><div><small>'+L('Current decision support','目前決策建議')+'</small><strong>'+e(statusWord)+'</strong><span>'+e(t(assessment.message))+'</span></div><div class="readiness-status-numbers"><span>'+assessment.counts.pass+' ✓</span><span>'+assessment.counts.hold+' '+L('to resolve','待補')+'</span><span>'+assessment.counts.review+' '+L('review','待審')+'</span></div></div>';
 if(recorded)out+='<div class="notice green">'+(zh?'評估已於 '+e(saved.recordedAt||'先前的工作階段')+' 記錄在此瀏覽器。這不是授權核准，也不是經確認的技術檢查。':'Assessment recorded in this browser on '+e(saved.recordedAt||"a previous session")+'. This is NOT an authorized approval or verified technical inspection.')+'</div>';
 else out+='<div class="secondary-note">'+L('This is a live preview of the entered conditions. Select “Record this assessment” to preserve the sample findings and enable a linked review work order.','這是依輸入條件的即時預覽。按「記錄這次評估」可保存範例結果，並建立連結的審查工單。')+'</div>';
 out+='<div class="readiness-list">'+assessment.checks.map((x,i)=>{
  const title=x.status==="pass"?L("Recorded as checked","已記錄確認"):x.status==="hold"?L("Blocking information gap","阻擋項目 · 資訊缺口"):L("Requires professional or process review","需專業或流程審查");
  return '<div class="readiness-finding '+x.status+'"><div class="readiness-finding-head"><span class="readiness-indicator">'+(x.status==="pass"?"✓":x.status==="hold"?"!":"?")+'</span><div><strong>'+e(t(x.title))+'</strong><small>'+title+'</small></div></div><p>'+e(t(x.detail))+'</p>'+(x.status==="pass"?"":'<div class="readiness-next">'+L('Next: ','下一步：')+e(t(x.nextAction))+'</div>')+'<div class="readiness-sources">'+x.sourceIds.map(id=>source(id)).join(" ")+'</div></div>';
 }).join("")+'</div>';
 out+='<div class="readiness-task-actions">'+button(workCreated?L("Review task created ✓","已建立審查待辦 ✓"):L("Create linked review work item","建立連結的審查工單"),"readinessCreateTask","","button-secondary")+button(L("Open work orders ↗","查看工作單 ↗"),"nav","work","button-outline")+'</div>';
 if(workCreated)out+='<p class="disclosure">'+(zh?'待辦 '+e(config.reviewWorkId)+' 已連結至 '+e(config.project)+'，會顯示在工作單中，僅儲存在此瀏覽器。':'Task ID '+e(config.reviewWorkId)+' is linked to '+e(config.project)+' and appears in Work Orders. It is stored only in this browser.')+'</p>';
 out+='</div></section>';
 const files=pack.id==="interior"?[
  {label:L("Site measurement record","現場丈量紀錄"),meta:L("CSV · opens in Excel","CSV · 可用 Excel 開啟"),href:"./fixtures/interior/site-measurements.csv",download:true},
  {label:L("Quartz cost breakdown","石英石成本明細"),meta:L("CSV · opens in Excel","CSV · 可用 Excel 開啟"),href:"./fixtures/interior/quartz-costs.csv",download:true},
  {label:L("Change review sheet","變更審查表"),meta:L("Printable HTML · Save as PDF","可列印 HTML · 另存 PDF"),href:"./fixtures/interior/change-review.html",download:false}
 ]:[
  {label:L("Manual artwork preflight log","人工印前檢查紀錄"),meta:L("CSV · opens in Excel","CSV · 可用 Excel 開啟"),href:"./fixtures/printing/preflight-manual.csv",download:true},
  {label:L("Paper change cost sheet","紙材變更成本表"),meta:L("CSV · opens in Excel","CSV · 可用 Excel 開啟"),href:"./fixtures/printing/recycled-stock-cost.csv",download:true},
  {label:L("Preflight review sheet","印前審查表"),meta:L("Printable HTML · Save as PDF","可列印 HTML · 另存 PDF"),href:"./fixtures/printing/preflight-review.html",download:false}
 ];
 out+='<section class="section">'+section(L("Sample business documents","範例業務文件"),L("Open realistic example sheets linked to the same case. These are preloaded example files; no customer documents are connected.","開啟與同一案件連結的範例表單。這些是預先載入的範例檔，未連接任何客戶文件。"))+'<div class="readiness-fixtures">'+files.map(file=>'<a class="readiness-fixture" href="'+e(file.href)+'"'+(file.download?' download':' target="_blank" rel="noopener noreferrer"')+'><span class="readiness-fixture-icon">'+(file.download?'▧':'▤')+'</span><span><strong>'+e(file.label)+'</strong><small>'+e(file.meta)+'</small></span><span>↗</span></a>').join("")+'</div><p class="disclosure" style="margin-top:10px">'+L('The CSV sheets can be opened in spreadsheet software. Printable HTML opens a new tab for printing to PDF; no uploaded files have been parsed by StrideBrain.','CSV 可用試算表軟體開啟；可列印 HTML 會開新分頁，可另存為 PDF。StrideBrain 沒有解析任何上傳檔案。')+'</p></section>';
 out+='<section class="section">'+section(L("Where this fits in daily operations","在日常營運中的位置"),L("Readiness checks are one stage of a larger company workflow, not an artificial green light.","作業檢查是公司整體流程中的一個階段，不是自動亮綠燈。"))+'<div class="readiness-flow">'+(zh?'<div><small>01 · 詢問</small><strong>確認案件範圍</strong></div><div><small>02 · 依據</small><strong>檢查目前來源</strong></div><div><small>03 · 決策</small><strong>處理例外</strong></div><div><small>04 · 執行</small><strong>授權施工</strong></div>':'<div><small>01 · Inquiry</small><strong>Capture job scope</strong></div><div><small>02 · Evidence</small><strong>Inspect current sources</strong></div><div><small>03 · Decisions</small><strong>Resolve exceptions</strong></div><div><small>04 · Execution</small><strong>Authorized work</strong></div>')+'</div><div class="readiness-links">'+button(L("Company knowledge ↗","公司知識 ↗"),"nav","knowledge","button-outline")+button(L("Quotations & approvals ↗","報價與核准 ↗"),"nav","quotes","button-secondary")+'</div></section>';
 return out;
}
