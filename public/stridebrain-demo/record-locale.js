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
"Retail Menus":"門市菜單"
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
