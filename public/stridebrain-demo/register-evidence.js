/** Derived, inspectable snapshot evidence. Never rewrites source documents or business rows. */
export const registerSourceId=id=>'REG-'+id;
export function enrichedDocuments(seed,overrides={}){
 return (seed.documents||[]).map(d=>({...d,body:Object.prototype.hasOwnProperty.call(overrides,d.id)?overrides[d.id]:d.body}));
}
export function registerSources(seed){
 const date=seed.meta?.date||'undated';
 return [['projects','project','專案紀錄'],['quotes','quotation','報價紀錄'],['workOrders','work order','工作單紀錄'],['approvals','approval','審核紀錄']].flatMap(([key,type,label])=>(seed[key]||[]).map(row=>{
  const projectId=key==='projects'?row.id:row.projectId;
  const fields={...row};
  const computed=key==='quotes'&&Number.isFinite(row.amountExTax)&&Number.isFinite(row.directCost)?{
   grossProfit:row.amountExTax-row.directCost,
   grossMarginPct:row.amountExTax>0?Math.round((row.amountExTax-row.directCost)/row.amountExTax*10000)/100:null,
   formula:'grossProfit = amountExTax - directCost; grossMarginPct = grossProfit / amountExTax * 100'
  }:null;
  return {id:registerSourceId(row.id),recordId:row.id,recordType:type,projectId,
   title:label+' '+row.id+' · '+type+' register',kind:'Register snapshot',version:'snapshot-'+date,status:'Snapshot',
   owner:row.owner||row.manager||row.requestedBy||(seed.projects||[]).find(p=>p.id===projectId)?.manager||'Not recorded',date,
   basisType:'DEMO_REGISTER',sourceType:'Derived read-only register snapshot',
   body:'# '+label+' / '+type+' register: '+row.id+'\n\n資料日期 / Snapshot: '+date+'\n專案 / Project: '+projectId+
    '\n\n## 紀錄欄位 / Recorded fields\n'+JSON.stringify(fields,null,2)+
    (computed?'\n\n## 計算值 / Calculations (not separately recorded)\n'+JSON.stringify(computed,null,2):'')+
    '\n\n## 來源範圍 / Evidence scope\n這是示範資料的結構化紀錄，不是供應商文件或已簽署的核准。關聯文件不一定含有這筆紀錄的金額或狀態。\nThis is a derived view of the bundled demo register, not an original supplier document or signed approval. A linked document does not independently establish these register fields. Browser-local workflow edits are not reflected in this server snapshot.'};
 }));
}
