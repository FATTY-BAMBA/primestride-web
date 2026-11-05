import {escapeHtml as e} from "./core-model.js";
import {heading,section,button,source,tag} from "./ui-shared.js";
/** Public source-derived industrial workflow map.
 * Regulatory/application checklists never determine whether an actual company is compliant.
 */
const KIND_ZH={CROSS_INDUSTRY_LAW:"跨產業法規",EDUCATIONAL:"教育資料",EDUCATIONAL_PLUS_WORKFLOW:"教育資料＋流程",INDUSTRY_CONTEXT:"產業背景",LEGAL_SCOPE:"法規適用範圍",OFFICIAL_CLARIFICATION:"官方函釋",OFFICIAL_GUIDANCE:"官方指引",OFFICIAL_TEMPLATE:"官方範本",PUBLIC_CONTRACT_EXAMPLE:"公開契約範例",REGULATION:"法規",REGULATION_PLUS_WORKFLOW:"法規＋流程",REGULATORY_SCREENING:"法規初篩",VENDOR_EXAMPLE:"廠商範例",WORKFLOW_RECOMMENDATION:"流程建議"};
const STAGE_ZH={"Change order":"變更單","Commercial & privacy":"商務與個資","Commercial proposal":"商務提案","Company knowledge":"公司知識","Design & review":"設計與審閱","Estimating":"估價","Finishing":"後加工","Handover":"交屋點交","Inquiry":"詢價","Intake & compliance":"受理與法規","Management analytics":"管理分析","Operations compliance":"營運合規","Prepress":"印前作業","Procurement":"採購","Proof approval":"打樣確認","Quality / dispatch":"品檢／出貨","Quoting":"報價","Regulatory screening":"法規初篩","Supplier / contractor onboarding":"供應商／協力廠商導入"};
const RULE_ZH={"Never advance to an irreversible/customer-facing action if required source or approval is missing.":"若缺少必要的來源或核准，絕不推進到不可逆或面向客戶的動作。"};
/** Traditional Chinese text for the modelled workflow stages: [title, input, output]. */
const STEP_ZH={
 "WF-INT-01":["客戶需求受理","客戶需求：住宅類型、樓層、地點、時程、優先事項","登錄詢問、聯絡同意與缺漏的需求"],
 "WF-INT-02":["現場與法規初篩","建物用途、固定隔間、安全、既有核准圖說","列出需由合格專業人員判斷的設計／法規問題"],
 "WF-INT-03":["設計與出圖","丈量圖、現況圖、裝修材料、材料規格","版本控管的設計圖登錄冊與客戶審閱"],
 "WF-INT-04":["預算與提案","已核准範圍、數量、成本代碼假設","價格預覽、風險／除外項目與正確的合約範本"],
 "WF-INT-05":["合約與核准","僅設計／僅施工／設計施工合併範圍、分期付款","已簽署的範圍與業主核准的交接"],
 "WF-INT-06":["採購與工班協調","已核准規格、丈量數量、供應商、協力廠商","採購／材料申請與排定的施工工項"],
 "WF-INT-07":["現場施工與查驗","已發行圖說、每日進度、安全與異常紀錄","追蹤中的工項、變更申請與矯正措施"],
 "WF-INT-08":["變更與客戶溝通","材料變更、供應商修正報價、最新圖說","獨立的變更單、客戶回覆草稿與核准"],
 "WF-INT-09":["交屋與完工知識整理","查驗、缺失清單、驗收、成本核對","已審閱的結案資料、客戶點交與可重複使用的成本依據"],
 "WF-PRI-01":["詢價與工單","成品尺寸、數量、紙張、印色、後加工、交期","完整的生產詢價與缺漏欄位提問"],
 "WF-PRI-02":["檔案與印前檢查","PDF/AI、解析度、出血、字型處理、色彩模式","印前檢查例外，並附廠商來源依據"],
 "WF-PRI-03":["稿件打樣審閱","檔案版次、印刷打樣、客戶修正","版本化的打樣狀態與客戶確認"],
 "WF-PRI-04":["成本與材料報價","紙材、拼版利用率、上機準備、數量、後加工與運送","逐項報價與即時價格查證清單"],
 "WF-PRI-05":["放行與排程","已核准打樣、供應商庫存、設備產能","經授權的生產工單與時程"],
 "WF-PRI-06":["印刷與外包作業","印刷指示、機台人員、油墨與相關作業","即時工單狀態與產能相依關係"],
 "WF-PRI-07":["印後加工與品檢","後加工、裁切、裝訂、品管、瑕疵","已檢驗工單與不良品／重印處置"],
 "WF-PRI-08":["出貨與客戶驗收","包裝數量、運送方式、簽收、更正","交貨／驗收狀態與後續處理"],
 "WF-PRI-09":["結案工單分析","實際材料、人工、機台、重印與物流","核對後的直接成本與未來報價參考"]
};
export function playbook(c){
 const {model,pack,view,industryEvidence}=c;
 const zh=c.locale!=="en",T=(z,en)=>zh?z:en;
 if(!industryEvidence)return '<div class="panel"><h2>'+T("目前無法載入產業參考資料。","Industry reference pack is not available.")+'</h2></div>';
 const steps=industryEvidence.workflows?.[pack.id]||[],records=industryEvidence.cards.filter(x=>x.industry===pack.id);
 const chosen=steps.find(x=>x.id===view.flowStep)||steps[0];
 const byId=new Map(records.map(x=>[x.id,x]));
 const kindLabel=k=>zh?(KIND_ZH[k]||k.replace(/_/g," ")):k;
 const stepText=(x,i)=>zh&&STEP_ZH[x.id]?STEP_ZH[x.id][i]:[x.title,x.input,x.output][i];
 const links=(ids)=>ids.map(id=>{const x=byId.get(id);return x?'<button type="button" class="playbook-evidence" data-action="source" data-id="'+e(x.id)+'"><span class="playbook-evidence-symbol">▤</span><span><strong>'+e(x.titleZh)+'</strong><small>'+e(x.id)+' · '+e(kindLabel(x.kind))+'</small></span><b>↗</b></button>':'';}).join('');
 const title=zh?(pack.id==="interior"?"台灣室內設計與裝修":"台灣印刷與包裝"):(pack.id==="interior"?"Taiwan Interior Design & Renovation":"Taiwan Printing & Packaging");
 let out=heading(zh?title+" — 產業作業指引":title+" — Operations Playbook",T("依據台灣公開資料整理、附來源連結的作業流程與檢核。可用範例業務紀錄試跑各流程；套用到實際專案前，請先確認各項要求。","Source-linked workflows and checks based on Taiwan public materials. Try each workflow using sample business records; verify requirements before applying them to real projects."),tag(zh?records.length+" 筆精選參考資料 · "+steps.length+" 個階段":records.length+" curated references · "+steps.length+" stages"),T("實務流程 · 產業知識","實務流程 · INDUSTRY KNOWLEDGE"));
 out+='<div class="playbook-notice"><strong>'+T("兩種不同性質的資訊","Two different kinds of information")+'</strong><span>'+T("<b>公開依據：</b>官方法規、指引，或出版者／廠商的範例，皆附原始網址。<b>範例公司紀錄：</b>僅為示範 StrideBrain 而建立的假設性工作與決策。公開法規無法證明虛構的價格或供應商供貨狀況。","<b>Public evidence:</b> official law, guidance or a publisher/vendor example with an original URL. <b>Example company records:</b> hypothetical jobs and decisions created only to demonstrate StrideBrain. Public regulations do not verify fictional prices or supplier availability.")+'</span></div>';
 out+='<section class="section">'+section(T("從詢價到交付","From inquiry to delivery"),T("選擇一個階段，檢視其輸入、產出、依據與審核關卡。","Select a stage to inspect its inputs, outputs, evidence and review gates."))+'<div class="playbook-layout"><div class="playbook-steps">'+steps.map(x=>'<button type="button" class="playbook-step '+(x.id===chosen.id?"selected":"")+'" data-action="flowStep" data-value="'+e(x.id)+'"><span class="playbook-step-num">'+String(x.index).padStart(2,"0")+'</span><span><strong>'+e(stepText(x,0))+'</strong><small>'+e(x.id)+'</small></span><span class="playbook-step-chevron">→</span></button>').join("")+'</div>';
 out+='<div class="playbook-detail"><div class="suite-eyebrow">'+T("作業階段 ","WORKFLOW STAGE ")+String(chosen.index).padStart(2,"0")+' / '+String(steps.length).padStart(2,"0")+'</div><h2>'+e(stepText(chosen,0))+'</h2><div class="playbook-detail-section"><span>'+T("預期輸入","Expected inputs")+'</span><p>'+e(stepText(chosen,1))+'</p></div><div class="playbook-detail-section"><span>'+T("預期產出","Expected result")+'</span><p>'+e(stepText(chosen,2))+'</p></div><div class="playbook-detail-section"><span>'+T("人工審核界線","Human review boundary")+'</span><p>'+e(zh?(RULE_ZH[chosen.blockingRule]||chosen.blockingRule):chosen.blockingRule)+'</p></div><h3>'+T("相關公開參考資料","Relevant public references")+'</h3>'+links(chosen.referenceIds)+'<div class="action-stack">'+button(chosen.index<steps.length?T("下一階段 →","Next stage →"):T("回到第一階段","Back to first stage"),"flowStep",chosen.index<steps.length?steps[chosen.index].id:steps[0].id,"button-secondary")+' '+button(T("查看公司來源資料 ↗","Explore company sources ↗"),"nav","knowledge","button-outline")+'</div></div></div></section>';
 const official=records.filter(x=>["REGULATION","LEGAL_SCOPE","CROSS_INDUSTRY_LAW","OFFICIAL_GUIDANCE","OFFICIAL_TEMPLATE","OFFICIAL_CLARIFICATION"].includes(x.kind)).length;
 out+='<section class="section">'+section(T("參考資料庫","Reference library"),T("閱讀整理後的解讀說明，並可開啟主管機關或出版者的原始網站。","Read the curated interpretation and open the original authority or publisher's website."))+'<div class="playbook-metrics"><div><strong>'+records.length+'</strong><span>'+T("參考筆記","Reference notes")+'</span></div><div><strong>'+official+'</strong><span>'+T("法規／官方政策主題","Legal / official-policy topics")+'</span></div><div><strong>'+steps.length+'</strong><span>'+T("模擬作業階段","Modelled work stages")+'</span></div></div><div class="playbook-card-grid">'+records.map(x=>'<div class="playbook-reference-card"><div class="playbook-reference-head"><span class="playbook-type">'+e(zh?kindLabel(x.kind):x.kind.replace(/_/g," "))+'</span><span>'+e(x.id)+'</span></div><h3>'+e(x.titleZh)+'</h3><p class="playbook-english">'+e(x.titleEn)+'</p><p>'+e(x.summary)+'</p><div class="playbook-reference-footer"><button type="button" class="table-btn" data-action="source" data-id="'+e(x.id)+'">'+T("查看依據筆記 ↗","View evidence notes ↗")+'</button><small>'+e(zh?(STAGE_ZH[x.stage]||x.stage):x.stage)+'</small></div></div>').join("")+'</div></section>';
 out+='<section class="section"><div class="playbook-cta"><div><div class="suite-eyebrow">'+T("把知識帶進日常工作","FROM KNOWLEDGE INTO DAILY WORK")+'</div><h3>'+T("用範例專案實際走一遍作業流程。","Explore a practical workflow with a sample project.")+'</h3><p>'+e(pack.id==="interior"?T("試做一次設計變更：附圖面依據、供應商成本與人工簽核。","Try a design change with drawing evidence, supplier costing and human sign-off."):T("試做一次紙材替換：含打樣確認、直接成本差異與生產作業。","Try a paper-stock substitution with proof approval, direct-cost difference and production work."))+'</p></div>'+button(T("試用互動式作業檢查 ↗","Try the interactive readiness check ↗"),"nav","readiness","button-primary")+'</div></section>';
 return out;
}
