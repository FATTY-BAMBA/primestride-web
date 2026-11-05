import {money,escapeHtml as e} from "./core-model.js";
import {historicalEstimate} from "./historical-estimator.js";
import {button,source,heading,section,tag} from "./ui-shared.js";
/** Display-only Taiwan Chinese labels for the synthetic history packs. Stored IDs and option values never change. */
const HISTORY_ZH={
 "Residential renovation":"住宅翻修","Office fit-out":"辦公室裝修","Retail fit-out":"店面裝修",
 "Posters":"海報","Catalogs":"型錄","Paper packaging":"紙盒包裝",
 "standard":"標準","premium":"高級","economy":"經濟",
 "Taipei":"台北","New Taipei":"新北","Taoyuan":"桃園","Taichung":"台中","Hsinchu":"新竹",
 "Design & planning":"設計規劃","Site preparation & demolition":"現場準備與拆除","Cabinetry and carpentry":"系統櫃與木作",
 "Electrical works":"電氣工程","Plumbing & wet areas":"給排水與濕區工程","Flooring & finishes":"地坪與表面裝修",
 "Painting & surface prep":"油漆與批土","Site coordination":"現場協調",
 "Prepress & proof":"印前與打樣","Paper stock":"紙材","Press operation":"印刷上機","Finishing":"後加工",
 "Packing & inspection":"包裝與檢驗","Delivery allocation":"配送分攤",
 "ping":"坪","piece":"件","pieces":"件"
};
export function historyZhLabel(value,zh=true){const text=String(value??"");return zh&&Object.prototype.hasOwnProperty.call(HISTORY_ZH,text)?HISTORY_ZH[text]:text;}
const ESTIMATOR_ZH={
 "Choose at least one scope item.":"請至少選擇一項工作範圍。",
 "Margin outside the supported demo range.":"毛利率超出示範支援的範圍。",
 "No live supplier quotations are connected.":"尚未連接即時供應商報價。",
 "Synthetic cost records must not be treated as verified market pricing.":"示範成本紀錄不可視為已查證的市場價格。",
 "All historical costs and precedents in this preview are fictional.":"此預覽中的所有歷史成本與過往案例皆為虛構。",
 "Cost escalation is an editable assumption, not a live materials-price index.":"成本調整幅度是可編輯的假設，並非即時材料價格指數。",
 "No current supplier price or jobsite/print specification has been verified.":"目前的供應商價格與工地／印刷規格皆尚未查證。",
 "Missing line items, site constraints, specifications and contractual exclusions require human review.":"缺漏項目、現場限制、規格與合約除外條款都需要人員審查。",
 "At least one comparable job is over 18 months old.":"至少有一件可比較的過往案件已超過 18 個月。"
};
/** Chinese display for reasons and limitations produced by historical-estimator.js; English stays untouched. */
export function historyEstimatorText(value,zh=true){
 const text=String(value??"");
 if(!zh)return text;
 if(ESTIMATOR_ZH[text])return ESTIMATOR_ZH[text];
 let m=text.match(/^Only (\d+) eligible completed (.+)-based jobs match this category, finish tier and scope\. At least three reconciled precedents are required\.$/);
 if(m)return "符合此類別、完工等級與工作範圍、以「"+historyZhLabel(m[2])+"」計量的已完工案件只有 "+m[1]+" 件；至少需要三件已核對的過往案例。";
 m=text.match(/^Insufficient comparable line-item history for: (.+)$/);
 if(m)return "以下成本項目的可比較歷史資料不足："+m[1].split(", ").map(x=>historyZhLabel(x)).join("、");
 m=text.match(/^(\d+) matching precedent\(s\) were reconstructed from a local, hypothetical cost ledger and self-attested only for this sandbox; not independently verified\.$/);
 if(m)return "有 "+m[1]+" 件相符的過往案例是由本機假設性成本帳重建，僅在此沙盒中自行聲明，未經獨立查證。";
 return text;
}
export function historyView(c){
 const h=c.history,s=c.state,zh=c.locale!=="en";
 const L=v=>historyZhLabel(v,zh);
 if(!h)return '<div class="panel"><h2>'+(zh?"歷史成本資料目前無法使用":"Historical cost pack unavailable")+'</h2></div>';
 const r=s.historyRequest||h.defaults;
 const sandboxRows=h.records.filter(z=>z.provenance==="LOCAL_SANDBOX_SELF_ATTESTED");
 const x=historicalEstimate(h,r),draft=s.historyDraft;
 const select=(label,key,opts)=>'<label class="form-field">'+e(label)+'<select data-history="'+key+'" class="history-select">'+opts.map(z=>'<option value="'+e(z.id)+'"'+(r[key]===z.id?' selected':'')+'>'+e(L(z.label))+'</option>').join('')+'</select></label>';
 const number=(label,key,max)=>'<label class="form-field">'+e(label)+'<input class="history-input" type="number" min="0" max="'+max+'" data-history="'+key+'" value="'+e(r[key])+'"></label>';
 let out=heading(zh?'歷史成本估價':'Estimate from past work',zh?'比對已完工的類似案件、可追溯的成本，並產生可供審閱的報價草稿。':'Comparable completed projects, traceable costs, and a reviewable draft.',tag(zh?'歷史案件智慧報價 · 示範':'歷史案件智慧報價 · DEMO'),zh?'歷史案件智慧報價':'HISTORICAL QUOTATION INTELLIGENCE');
 out+='<div class="quote-journey">'+(zh?['新詢價','過往案件依據','報價假設','人員審查']:['New inquiry','Past job evidence','Pricing assumptions','Human review']).map((t,i)=>'<div class="journey-step"><span>0'+(i+1)+'</span><strong>'+t+'</strong></div>').join('')+'</div>';
 out+='<div class="history-mini"><span><strong>'+(zh?'手上有過往案件的成本試算表嗎？':'Have a past job cost spreadsheet?')+'</strong> '+(zh?'請到「文件智慧整理」檢查來源儲存格、對應成本代碼，並為本次工作階段新增一筆暫時的示範成本紀錄。單憑過去的報價單或預算，無法證明實際成本。':'Open Document Intelligence, review the source cells, map cost codes and add a temporary sample cost record for this session. A historical quotation or budget alone never proves actual cost.')+'</span>'+button(zh?"檢視文件 ↗":"Review a document ↗","nav","intake","button-secondary")+'</div>';
 if(sandboxRows.length)out+='<section class="section"><div class="history-shortcut"><div><div class="suite-eyebrow">'+(zh?'僅限目前分頁 · 示範資料':'CURRENT TAB ONLY · DEMO DATA')+'</div><h3>'+(zh?'目前有 '+sandboxRows.length+' 筆已審閱、由文件轉入的過往案例':sandboxRows.length+' reviewed document-derived precedent'+(sandboxRows.length===1?'':'s')+' available')+'</h3><p>'+(zh?'來源明細已對應為假設性的完整成本案例，可用於此示意比較。這些並非已查證的歷史實際成本，重新整理頁面或切換產業後就會消失。':'Source lines were mapped into hypothetical cost-complete cases and can be used for this illustrative comparison. They are not verified historical actual costs and will disappear on refresh or industry switch.')+'</p></div>'+button(zh?"檢視匯入的依據 ↗":"Inspect imported evidence ↗","nav","intake","button-outline")+'</div></section>';
 out+='<div class="history-banner"><strong>'+(zh?'關於這份示範歷史資料':'About this sample history')+'</strong><p>'+(zh?'以下紀錄皆為示範資料，不代表實際專案成本，也未連接已查證的供應商價格或客戶交易。':'The records below are demo data. They do not establish actual project costs, verified supplier prices or customer transactions are connected.')+'</p></div>';
 out+='<section class="section split-page"><div class="panel">'+section(zh?'新的客戶詢價':'New customer inquiry',zh?'先說明案件內容，再請系統比對類似案件的成本估價。':'Specify the job before requesting a comparable-cost estimate.');
 out+='<label class="form-field">'+(zh?'客戶詢價內容':'Customer inquiry · 客戶詢價')+'<textarea id="history-inquiry" data-history="inquiry" rows="3" placeholder="'+(zh?'請描述工作範圍、限制條件與希望的時程。':'Describe the scope, constraints, and requested timing.')+'">'+e(r.inquiry||'')+'</textarea></label>';
 out+='<div class="history-form-grid">'+select(zh?'專案／案件類型':'Project / job type','category',h.categories)+select(zh?'完工等級':'Finish tier','tier',h.tiers.map(z=>({id:z,label:z})))+number((zh?'數量（':'Quantity (')+L(h.unit)+(zh?'）':')'),'quantity',100000)+select(zh?'地點':'Location','location',h.locations.map(z=>({id:z,label:z})))+'</div>';
 out+='<div class="history-group-title">'+(zh?'工作範圍':'Included scope · 工作範圍')+'</div><div class="history-scope-grid">'+h.costCodes.map(z=>'<label class="history-check"><input type="checkbox" data-history-scope="'+e(z.id)+'" '+(r.scope.includes(z.id)?'checked':'')+'><span>'+e(L(z.label))+'</span></label>').join('')+'</div>';
 out+='<div class="history-group-title">'+(zh?'報價條件':'Commercial assumptions · 報價條件')+'</div><div class="history-assumptions">'+number(zh?'目標毛利率 %':'Target gross margin %','margin',65)+number(zh?'過往成本調整 %':'Past-cost adjustment %','escalation',30)+number(zh?'預備金 %':'Contingency %','contingency',25)+'</div>';
 out+='<p class="disclosure">'+(zh?'成本調整與預備金都是明確列出的假設，並非即時供應商報價或官方成本指數。':'Adjustment and contingency are explicit assumptions. They are not live supplier quotations or an official cost index.')+'</p><div class="action-stack">'+button(zh?'重設條件':'Reset inputs','historyReset','','button-outline')+button(zh?'建立報價草稿供審閱 ↗':'Create draft for review ↗','historyDraft','','button-primary')+'</div></div>';
 out+='<div class="panel">'+section(zh?'建議的歷史成本估價':'Suggested historical estimate',zh?'已完工的類似案件，依詢價數量換算。':'Comparable completed jobs normalized to the requested quantity.');
 out+='<div class="history-evidence-meta"><div><strong>'+h.records.filter(z=>z.status==='COMPLETE').length+'</strong><small>'+(zh?'已完工示範紀錄':'Completed sample records')+'</small></div><div><strong>'+(x.comparables?.length||0)+'</strong><small>'+(zh?'選用的相符案件':'Selected matches')+'</small></div><div><strong>'+h.records.filter(z=>z.status!=='COMPLETE').length+'</strong><small>'+(zh?'未完工／僅有報價，已排除':'Incomplete / quote-only excluded')+'</small></div></div>';
 if(x.ok){
 out+='<div class="history-main-price"><small>'+(zh?'參考價格 · 未稅':'Indicative price · before tax')+'</small><strong>'+money(x.preTax)+'</strong><span>'+(zh?'含稅示例：'+money(x.total)+' · 毛利率 '+x.margin+'%':'Inclusive example: '+money(x.total)+' · gross margin '+x.margin+'%')+'</span></div>';
 out+='<div class="history-sensitivity"><strong>'+(zh?'示意價格區間：':'Illustrative sensitivity: ')+money(x.rangeLow)+'–'+money(x.rangeHigh)+'</strong><small>'+(zh?'這不是統計信賴區間，也不是具約束力的報價。':'Not a statistical confidence interval or a binding quote.')+'</small></div>';
 out+='<div class="history-breakdown">'+[[zh?'歷史直接成本':'Historical direct cost',x.historicalDirectCost],[zh?'過往成本調整':'Past-cost adjustment',x.escalationAmount],[zh?'預備金':'Contingency',x.contingencyAmount],[zh?'預估直接成本':'Forecast direct cost',x.forecastCost],[zh?'建議未稅價':'Proposed before tax',x.preTax]].map((a,i)=>'<div class="'+(i===4?'total':'')+'"><span>'+a[0]+'</span><strong>'+money(a[1])+'</strong></div>').join('')+'</div>';
 }else out+='<div class="divergence" style="margin-top:15px"><strong>'+(zh?'可比較的已完工案件不足。':'Not enough comparable completed work.')+'</strong><p>'+e(historyEstimatorText(x.reason,zh))+'</p>'+(zh?'系統不會憑空產生價格。請調整需求條件，或請估價人員以人工方式審查。':'The engine will not invent a price. Revise the requirements or ask an estimator to review manually.')+'</div>';
 out+='<div class="history-draft-status"><strong>'+(draft?(draft.reviewed?(zh?'已經人員審閱的示範草稿':'Human-reviewed demo draft'):(zh?'已儲存的示範草稿 · 尚未審閱':'Saved sample draft · not reviewed')):(zh?'尚未建立報價草稿':'No quotation draft yet'))+'</strong><small>'+e(draft?(zh?'這只是瀏覽器中的本機狀態，並非已寄出的客戶報價。':'This is local browser state, not a sent customer quote.'):(zh?'以目前選取的過往案例建立草稿。':'Create a draft from the currently selected precedent records.'))+'</small></div>';
 if(draft)out+='<div class="action-stack">'+button(zh?'審閱示範估價':'Review sample estimate','historyApprove','','button-secondary')+button(zh?'匯出已審閱草稿':'Export reviewed draft','historyExport','','button-outline')+'</div>';
 out+='</div></section>';
 if(x.ok){
 out+='<section class="section">'+section(zh?'可稽核的成本計算':'Auditable cost calculation',zh?'單位成本取自類似案件的示範成本紀錄。':'Unit costs are drawn from comparable sample cost records.')+'<div class="data-table-wrap"><table class="data-table"><thead><tr><th>'+(zh?'成本項目':'Cost line')+'</th><th>'+(zh?'歷史單價 / ':'Historical rate / ')+e(L(h.unit))+'</th><th>'+(zh?'數量':'Quantity')+'</th><th>'+(zh?'基本直接成本':'Base direct cost')+'</th><th>'+(zh?'依據筆數':'Evidence count')+'</th></tr></thead><tbody>'+x.lines.map(l=>'<tr><td>'+e(L(l.label))+'</td><td>'+money(l.unitRate)+'</td><td>'+l.quantity+'</td><td><strong>'+money(l.baseCost)+'</strong></td><td>'+l.observations+'</td></tr>').join('')+'</tbody></table></div></section>';
 }
 out+='<section class="section">'+section(zh?'可比較的過往案件':'Comparable past jobs',zh?'採用任何成本前，請先檢查來源。':'Review the source before relying on a cost.')+'<div class="history-comps">'+(x.comparables?.length?x.comparables.map(z=>'<div class="history-comp"><div class="history-comp-top"><span class="history-match">'+(zh?'相似度 ':'Match ')+z.similarity+'%</span><small>'+e(z.completedAt)+'</small></div><h3>'+e(z.title)+'</h3><p>'+e(L(z.location))+' · '+z.quantity+' '+e(L(z.unit))+' · '+e(L(z.tier))+'</p><div class="history-comp-bottom"><strong>'+(zh?'虛構成本 ':'Fictional cost ')+money(z.finalDirectCost)+'</strong>'+(z.provenance==="LOCAL_SANDBOX_SELF_ATTESTED"?'<span class="history-session-tag">'+(zh?'本機示範':'LOCAL DEMO')+'</span>':"")+source(z.sourceDocId)+'</div></div>').join(''):'<div class="empty">'+(zh?'沒有符合這些條件的已完工案件。':'No eligible complete cases meet these requirements.')+'</div>')+'</div></section>';
 if(x.ok)out+='<section class="section">'+section(zh?'為什麼仍需要人員審查':'Why human review is still essential',zh?'這份估價只是起點，還不能直接作為對客戶的承諾。':'The estimate is a starting point, not a customer-ready promise.')+'<div class="history-warnings">'+x.limitations.map(z=>'<div class="history-warning"><span>!</span>'+e(historyEstimatorText(z,zh))+'</div>').join('')+'</div></section>';
 return out;
}
