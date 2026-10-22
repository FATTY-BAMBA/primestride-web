/** Display-only Taiwan terminology. Canonical IDs and source records never change. */
const TERMS={
 "Material selection":"材料選定","Quotation revision":"報價修訂","Drawing issue":"圖面問題",
 "Client brief":"客戶需求摘要","Design agreement":"設計合約","Scope of works":"工程範圍",
 "Moodboard notes":"風格提案紀錄","Materials schedule":"材料排程表",
 "Supplier quotation":"供應商報價單","Change-order approval":"工程變更核准",
 "Gross-margin calculation":"毛利率計算","Forest Office":"森境辦公室",
 "Songshan Residence":"松山住宅","Approved":"已核准","Pending review":"待審閱",
 "Pending":"待確認","Blocked":"受阻","Complete":"已完成",
 "In progress":"進行中","Upcoming":"即將開始","In construction":"施工中",
 "Design":"設計階段","Production":"生產中","Proof":"打樣","Artwork":"美工稿",
 "Paper":"紙材","Delivery":"交付","Jobs":"印刷案件","Projects":"專案",
 "Quotations":"報價單","Work orders":"工作單","Suppliers":"供應商"
};
const SORTED=Object.entries(TERMS).sort((a,b)=>b[0].length-a[0].length);
export function displayRecordText(value,locale="en"){
 const text=String(value??"");
 if(locale!=="zh-TW")return text;
 return text.split(/(\s*[·—]\s*)/).map(part=>{
  let out=part;
  for(const [original,translation] of SORTED){
   const escaped=original.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g,"\\$&");
   out=out.replace(new RegExp("(^|[^A-Za-z])("+escaped+")(?=$|[^A-Za-z])","g"),(match,prefix)=>prefix+translation);
  }
  return out;
 }).join("");
}
