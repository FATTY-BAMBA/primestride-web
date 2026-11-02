/** Display-only Taiwan terminology. Canonical IDs and source records never change. */
const TERMS={
 "Material selection":"材料選定","Quotation revision":"報價修訂","Drawing issue":"圖面發行",
 "Client brief":"客戶需求摘要","Design agreement":"設計合約","Scope of works":"工程範圍",
 "Moodboard notes":"風格提案紀錄","Materials schedule":"材料排程表",
 "Supplier quotation":"供應商報價單","Change-order approval":"工程變更核准",
 "Gross-margin calculation":"毛利率計算","Forest Office":"森嶼辦公室",
 "Songshan Residence":"松山靜宅","Approved":"已核准","Pending review":"待審閱",
 "Pending":"待確認","Blocked":"受阻","Complete":"已完成",
 "In progress":"進行中","Upcoming":"即將開始","In construction":"施工中",
 "Design":"設計階段","Production":"生產中","Proof":"打樣","Artwork":"美工稿",
 "Paper":"紙材","Delivery":"交付","Jobs":"印刷案件","Projects":"專案",
 "Quotations":"報價單","Work orders":"工作單","Suppliers":"供應商",
"Site measure":"現場丈量",
"Handover preparation":"交接準備",
"Quality inspection":"品質檢驗",
"Change-order assessment":"變更單評估",
"Company policy":"公司規範",
"Draft":"草稿",
"Sent":"已送出",
"Needs review":"需審查",
"Handover":"交接",
"Procurement":"採購",
"Residential":"住宅",
"Commercial":"商業空間",
"Taipei":"台北",
"New Taipei":"新北",
"Taichung":"台中",
"Design approval":"設計核准",
"Drawing revision":"圖面修訂",
"Supplier confirmation":"供應商確認",
"Procurement request":"採購申請",
"Carpentry works":"木作工程",
"MEP coordination":"機電協調",
"Snapshot":"紀錄快照",
"Songshan Residence":"松山靜宅",
"Qingguang Apartment":"晴光寓所",
"Wuqih Home":"梧棲之間",
"Forest Office":"森嶼辦公室",
"Riverside Home":"河岸新居",
"Little Light Cafe":"微光咖啡",
"Warmwood Family Home":"暖木親子宅",
"Zhongshan Showroom":"中山展示間",
"Anping Guesthouse":"安平民宿",
"Highland Retreat":"清境山居",
"Nanjing Residence":"南京輕奢宅",
"Daylight Clinic":"日和診所",
"Minquan Poster Run":"民權海報",
"Spring Catalog":"春山型錄",
"Coffee Packaging":"咖啡包裝",
"Exhibition Graphics":"展場輸出",
"Annual Handbook":"年度手冊",
"Label Refresh":"標籤改版",
"Invitation Suite":"喜帖印製",
"Retail Menus":"門市菜單",
"Awaiting approved specification / supplier response":"等待核准規格／供應商回覆"
};
const SORTED=Object.entries(TERMS).sort((a,b)=>b[0].length-a[0].length);
export function displayRecordText(value,locale="en"){
 const text=String(value??"");
 if(locale!=="zh-TW")return text;
 const translated=text.split(/(\s*[·—]\s*)/).map(part=>{
  let out=part;
  for(const [original,translation] of SORTED){
   const escaped=original.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g,"\\$&");
   out=out.replace(new RegExp("(^|[^A-Za-z])("+escaped+")(?=$|[^A-Za-z])","g"),(match,prefix)=>prefix+translation);
  }
  return out;
 }).join("");
 return translated.split(" · ").filter((part,i,all)=>i===0||part!==all[i-1]).join(" · ");
}

const hasCjk=value=>/[\u3400-\u9fff]/.test(String(value||""));
/** Chinese display for an AI rationale written in English; the stored record is unchanged. */
export function displayRationale(item,locale="en"){
 const raw=String(item?.rationale||"");
 if(locale!=="zh-TW"||!raw||hasCjk(raw))return raw;
 const meta=item.coordination||{},owner=meta.recordedOwner||item.contact||"負責人",id=item.recordId||"這項工作";
 const due=meta.dueDate?"，到期日 "+meta.dueDate:"";
 if(meta.signal==="recorded_blocker")return id+" 目前記錄為受阻"+(meta.recordedBlocker?"（"+displayRecordText(meta.recordedBlocker,"zh-TW")+"）":"")+"，負責人 "+owner+due+"。紀錄中未載明對工期與關鍵路徑的影響。";
 if(meta.signal==="status_verification")return id+" 有待確認的核准／狀態紀錄，負責人 "+owner+due+"。交接前請先確認實際狀態。";
 if(meta.signal==="near_term_handoff"||meta.signal==="near_term_due")return id+" 接近記錄到期日，負責人 "+owner+due+"。請先確認進度與下一個交接。";
 return "根據目前記錄，"+id+" 值得先確認狀態與下一步（負責人 "+owner+due+"）。";
}

/** Chinese display for audit-log lines stored in English; stored text is unchanged. */
const AUDIT_ZH=[
 [/^Human approved external (email|line) for (\S+); provider accepted receipt (\S+)\.$/i,(m,c,id,r)=>"人工批准對外"+(c.toLowerCase()==="line"?" LINE 訊息":"郵件")+"（"+id+"）；服務商已受理，收據 "+r+"。"],
 [/^Human approved (.+?) action (\S+); created demo follow-up (\S+)\.$/,(m,a,id,t)=>"人工批准"+agentZh(a)+"的動作 "+id+"；已建立示範追蹤待辦 "+t+"。"],
 [/^Human edited prepared action (\S+) before approval; evidence and recorded source fields were unchanged\.$/,(m,id)=>"批准前人工修改了準備內容 "+id+"；查核依據與原始紀錄未變更。"],
 [/^Model-driven (.+?) prepared (\d+) validated proposals for human review\.$/,(m,a,n)=>agentZh(a)+"（AI 模型）準備了 "+n+" 項已驗證的提案，等待人工審核。"],
 [/^(.+?) prepared (\d+) actions for human review\.$/,(m,a,n)=>agentZh(a)+"準備了 "+n+" 項動作，等待人工審核。"],
 [/^Price input changed\. Prior simulated confirmations invalidated\.$/,()=>"價格輸入已變更；先前的模擬確認已失效。"],
 [/^Simulated supplier estimate checked against (\S+)$/,(m,id)=>"已依 "+id+" 檢查模擬供應商估價"],
 [/^Simulated owner approval for (.+) before tax$/,(m,v)=>"模擬負責人核准：未稅 "+v],
 [/^Simulated customer written acceptance$/,()=>"模擬客戶書面同意"],
 [/^Variation committed to demo work orders as (\S+)$/,(m,id)=>"變更已轉為示範工作單 "+id],
 [/^Demo reviewer accepted the customer response draft \(not sent\)\.$/,()=>"示範審閱者已接受客戶回覆草稿（未送出）。"],
 [/^Work status changed: (\S+) → (.+)$/,(m,id,s)=>"工作狀態變更："+id+" → "+displayRecordText(s,"zh-TW")],
 [/^Sample approval (\S+) · (\S+)$/,(m,id,p)=>"示範核准 "+id+" · "+p],
 [/^Historical draft prepared from (\d+) sample cost records\.$/,(m,n)=>"已依 "+n+" 筆示範成本紀錄準備歷史估價草稿。"],
 [/^Sample estimate reviewed locally\.$/,()=>"示範估價已在本機審閱。"],
 [/^Drafted (Traditional Chinese|English) sample response$/,(m,l)=>"已擬好"+(l==="English"?"英文":"繁體中文")+"示範回覆"],
 [/^A sample cost example was added to this browser workspace after review\.$/,()=>"審閱後已將一筆示範成本範例加入此瀏覽器工作區。"],
 [/^Manual screening reset; any prior assessment became stale\.$/,()=>"已重設人工檢核；先前的評估已失效。"]
];
const agentZh=name=>({"Project Coordinator":"專案協調員","Operations Assistant":"營運助理","Quote & Margin Guardian":"報價與毛利守門員"}[name]||name);
export function displayAuditText(value,locale="en"){
 const text=String(value??"");
 if(locale!=="zh-TW")return text;
 for(const [pattern,render] of AUDIT_ZH){const m=text.match(pattern);if(m)return render(...m);}
 return text;
}
