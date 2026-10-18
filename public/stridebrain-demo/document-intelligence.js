/**
 * StrideBrain Document Intelligence — browser-local, deliberately not AI or OCR.
 * Only returns observed cell values or PDF text, not verified commercial facts.
 * No upload request is made. PDF.js program code is loaded from a pinned CDN.
 */
export const ACCEPTED_TYPES=["csv","tsv","xlsx","pdf","docx"];
export const LIMIT_BYTES=8*1024*1024;
const addr=(i)=>{let a="";for(let k=i+1;k>0;k=Math.floor((k-1)/26))a=String.fromCharCode(65+(k-1)%26)+a;return a;};
export const sourceCell=(row,col)=>addr(col)+(row+1);
const valText=(v)=>v===null||v===undefined?"":String(v).trim();
const number=(v)=>{
 if(v===null||v===undefined||String(v).trim()==="")return null;
 const text=String(v).replace(/[,\s]/g,"").replace(/^(NT\$|TWD|NTD|\$|新臺幣|元)/i,"").replace(/(元|NTD|TWD)$/i,"");
 if(!/^[+-]?\d+(\.\d+)?$/.test(text))return null;
 const n=Number(text);return Number.isFinite(n)?n:null;
};
function problem(code,message,ref,severity="review"){return {code,message,ref,severity};}
function textDecode(bytes,encoding="utf-8"){return new TextDecoder(encoding).decode(bytes);}
export function parseDelimited(input,separator=",",maxRows=1800){
 const text=String(input).replace(/^\uFEFF/,""),out=[],row=[];
 let field="",quoted=false,truncated=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;continue;}
  if(c==='"'&&field===""){quoted=true;continue;}
  if(c===separator){row.push(field);field="";continue;}
  if(c==="\r"||c==="\n"){
   if(c==="\r"&&text[i+1]==="\n")i++;
   row.push(field);if(row.some(x=>valText(x)!==""))out.push(row.slice());row.length=0;field="";
   if(out.length>=maxRows){truncated=true;break;}continue;
  }
  field+=c;
 }
 if(!truncated){row.push(field);if(row.some(x=>valText(x)!==""))out.push(row);}
 return {rows:out,truncated,unclosedQuote:quoted};
}
const norm=(x)=>valText(x).toLowerCase().replace(/[\s_\-./:（）()【】\[\]]/g,"");
const ALIASES={
 description:["description","item","itemname","workitem","costitem","material","materialname","particulars","工程項目","工項","項目","項次名稱","名稱","品名","材料","材料名稱","說明","規格","工作項目","品項"],
 quantity:["quantity","qty","amountqty","units","數量","用量","工程數量","件數","張數","坪數"],
 unit:["unit","uom","measure","單位","計量單位"],
 unitCost:["unitcost","unitprice","priceperunit","rate","costperunit","單價","材料單價","每坪單價","每件單價","成本單價","未稅單價"],
 total:["total","amount","subtotal","lineamount","totalprice","extendedcost","總計","金額","小計","總價","合計","未稅金額"],
 reference:["sku","code","itemcode","編號","材料編號","代碼"],
 notes:["remarks","notes","remark","備註"]
};
function keyFor(text){const t=norm(text);for(const [name,list] of Object.entries(ALIASES)){if(list.some(x=>t===norm(x)))return name;}return null;}
export function detectCostTable(rows,sourceName="Sheet1",maxCandidates=120){
 const findings=[],candidates=[];
 let header=-1,cols={};
 for(let i=0;i<Math.min(30,rows.length);i++){
  const check={};rows[i].forEach((x,j)=>{const name=keyFor(x);if(name&&!Object.hasOwn(check,name))check[name]=j;});
  if(Object.keys(check).length>=2&&(check.description!==undefined||check.reference!==undefined)&&(check.quantity!==undefined||check.total!==undefined||check.unitCost!==undefined)){header=i;cols=check;break;}
 }
 if(header<0)return {headerRow:null,columns:{},candidates:[],findings:[problem("NO_COST_HEADER","No identifiable itemized cost table was found. This file may be a specification, contract, or an unfamiliar quotation layout.",sourceName)]};
 const seen=new Map();
 for(let i=header+1;i<rows.length&&candidates.length<maxCandidates;i++){
  const row=rows[i],cell=k=>cols[k]===undefined?"":row[cols[k]]??"";
  const desc=valText(cell("description"))||valText(cell("reference")),lower=norm(desc);
  if(!desc||/^(subtotal|total|grandtotal|合計|總計|小計|稅|營業稅|備註)$/.test(lower))continue;
  const qty=number(cell("quantity")),unitCost=number(cell("unitCost")),stated=number(cell("total"));
  if(qty===null&&unitCost===null&&stated===null)continue;
  const loc=(name)=>sourceName+"!"+sourceCell(i,cols[name]??0);
  const ref=loc("description");const flags=[];
  if(qty===null||qty<=0)flags.push(problem("MISSING_QUANTITY","Quantity is missing or nonpositive.",loc("quantity"),"blocker"));
  if(unitCost===null||unitCost<0)flags.push(problem("MISSING_UNIT_COST","Unit cost is missing or invalid; a line cannot be priced safely.",loc("unitCost"),"blocker"));
  const expected=qty!==null&&unitCost!==null?Math.round(qty*unitCost*100)/100:null;
  if(expected!==null&&stated!==null&&Math.abs(expected-stated)>Math.max(2,Math.abs(expected)*0.02))flags.push(problem("AMOUNT_MISMATCH","Recorded amount "+stated+" differs from quantity × unit price "+expected+".",loc("total"),"blocker"));
  if(cols.total===undefined)flags.push(problem("NO_STATED_TOTAL","No extended amount column exists; the total is a calculation, not a source-stated value.",ref,"review"));
  const key=norm(desc);if(seen.has(key))flags.push(problem("REPEATED_LINE","Similar item was already found at "+seen.get(key)+". Check for duplicated charges.",ref,"review"));else seen.set(key,ref);
  candidates.push({id:"C-"+String(i+1).padStart(3,"0"),description:desc,quantity:qty,unit:valText(cell("unit")),unitCost,sourceAmount:stated,calculatedAmount:expected,sourceRef:ref,rowIndex:i+1,flags,reviewStatus:"pending",reviewNote:"",edited:false});
 }
 if(candidates.length===maxCandidates)findings.push(problem("TRUNCATED_LINES","The document has more than "+maxCandidates+" potential costing lines; only a safe preview was extracted.",sourceName));
 if(candidates.length===0)findings.push(problem("EMPTY_TABLE","A likely cost table header was found, but no priced rows were extracted.",sourceName));
 return {headerRow:header+1,columns:cols,candidates,findings};
}
function buildReport(name,extension,parts,metadata={}){
 const tabs=parts.filter(x=>x.kind==="table"),segments=parts.filter(x=>x.kind==="text"),candidates=[],findings=[];
 for(const t of tabs){const d=detectCostTable(t.rows,t.name);candidates.push(...d.candidates);findings.push(...d.findings);if(t.truncated)findings.push(problem("ROW_LIMIT","Only the first rows of "+t.name+" were examined.",t.name));}
 for(const p of segments){if(p.lines.length===0)findings.push(problem("NO_EMBEDDED_TEXT","No readable embedded text found. Scanned pages and drawings require OCR or specialist review.",p.name,"blocker"));}
 if(parts.length===0)findings.push(problem("EMPTY_DOCUMENT","No readable content was extracted.",name,"blocker"));
 const textRows=segments.flatMap(p=>p.lines.map(l=>({name:p.name,...l})));
 for(const row of textRows){if(/\b(draft|not for construction|approval pending|not approved|unverified|not yet received|not confirmed|pending)\b/i.test(row.text))findings.push(problem("SOURCE_APPROVAL_UNCERTAIN","The document contains a potentially draft, unverified or unapproved statement: "+row.text.slice(0,160),row.name+" · "+row.ref,"review"));}
 const classification=candidates.length?"POSSIBLE_ITEMIZED_COST_SCHEDULE":textRows.some(x=>/specification|drawing|revision|artwork|material|site|preflight/i.test(x.text))?"POSSIBLE_TECHNICAL_SPECIFICATION":textRows.length?"GENERAL_TEXT_DOCUMENT":"UNCLASSIFIED";
 const facts=[];for(const part of segments)for(const item of part.lines){const match=/^\s*(Project|Job|Document|Revision|Quantity|Status|Supplier|Approval|Material|Date|File format|Stock request|Baseline|Requested|Dimensions|Trim size|Finish)\s*:\s*(.+)/i.exec(item.text);if(match)facts.push({field:match[1],value:match[2],sourceRef:part.name+" · "+item.ref});}
 const id="LOCAL-"+Date.now().toString(36);
 return {id,fileName:name,extension,createdAt:new Date().toISOString(),basisType:"BROWSER_LOCAL_UPLOADED",privacy:"File content remains in this tab's memory and is not uploaded or stored as company knowledge.",metadata,parts,classification,classificationBasis:"Heuristic only — not an AI verification or legal record classification",facts:facts.slice(0,60),candidates,findings,currencyConfirmed:false,reviewed:false,reviewedAt:null,reviewerNote:"",targetMargin:25,issueCount:candidates.reduce((n,c)=>n+c.flags.length,0)+findings.length};
}
const read16=(v,i)=>v.getUint16(i,true),read32=(v,i)=>v.getUint32(i,true);
export async function unzipOffice(arrayBuffer){
 const bytes=new Uint8Array(arrayBuffer),v=new DataView(arrayBuffer),back=Math.max(0,bytes.length-65557);let eocd=-1;
 for(let i=bytes.length-22;i>=back;i--){if(read32(v,i)===0x06054b50){eocd=i;break;}}
 if(eocd<0)throw Error("The .xlsx/.docx archive has no readable ZIP directory.");
 const total=read16(v,eocd+10),dirAt=read32(v,eocd+16);
 if(total>2000)throw Error("Office file has too many ZIP entries for the public demo.");
 const files=new Map(),decoder=new TextDecoder();let accumulatedUncompressed=0;
 let p=dirAt;
 for(let n=0;n<total;n++){
  if(read32(v,p)!==0x02014b50)throw Error("ZIP directory is inconsistent.");
  const method=read16(v,p+10),compressed=read32(v,p+20),uncompressed=read32(v,p+24),len=read16(v,p+28),extra=read16(v,p+30),comment=read16(v,p+32),offset=read32(v,p+42);
  const name=decoder.decode(bytes.slice(p+46,p+46+len));p+=46+len+extra+comment;
  if(name.endsWith("/"))continue;
  if(!/^(xl\/|word\/|\[Content_Types\]|_rels\/|docProps\/)/.test(name))continue;
  if(compressed>LIMIT_BYTES||uncompressed>LIMIT_BYTES*2)throw Error("Office XML entry is too large to expand safely in the public demo.");
  accumulatedUncompressed+=uncompressed;
  if(accumulatedUncompressed>LIMIT_BYTES*3)throw Error("Total decompressed Office data exceeds the safe public-demo limit.");
  if(read32(v,offset)!==0x04034b50)throw Error("ZIP entry header mismatch.");
  const localLen=read16(v,offset+26),localExtra=read16(v,offset+28),start=offset+30+localLen+localExtra;
  const source=bytes.slice(start,start+compressed);let unpacked;
  if(method===0)unpacked=source;
  else if(method===8){
   if(typeof DecompressionStream==="undefined")throw Error("This browser cannot decompress Office files. Try the CSV sample instead.");
   let stream;try{stream=new Blob([source]).stream().pipeThrough(new DecompressionStream("deflate-raw"));}catch{throw Error("ZIP deflate decompression is not supported by this browser. Please use CSV or a newer browser.");}
   unpacked=new Uint8Array(await new Response(stream).arrayBuffer());
  }else throw Error("Unsupported ZIP compression method "+method);
  files.set(name,decoder.decode(unpacked));
 }
 return files;
}
const parseXml=(text)=>{
 if(!text)throw Error("Required XML file is missing.");
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error("Office XML declares an unsupported document type or entity. The demo refuses unsafe XML.");
 const xml=new DOMParser().parseFromString(text,"application/xml");
 if(xml.getElementsByTagName("parsererror").length)throw Error("An Office XML document could not be parsed.");
 return xml;
};
const elements=(root,name)=>Array.from(root.getElementsByTagNameNS("*",name));
const first=(root,name)=>elements(root,name)[0]||null;
const ownText=(root,name)=>first(root,name)?.textContent||"";
const tidyZipPath=(base,target)=>{
 const path=(target.startsWith("/")?target.slice(1):base+"/"+target).split("/"),out=[];
 for(const item of path){if(!item||item===".")continue;if(item==="..")out.pop();else out.push(item);}
 return out.join("/");
};
export function columnIndex(address){const m=/^([A-Z]+)\d+$/i.exec(address);if(!m)return null;return [...m[1].toUpperCase()].reduce((n,c)=>n*26+(c.charCodeAt(0)-64),0)-1;}
export async function decodeXlsx(arrayBuffer){
 const archive=await unzipOffice(arrayBuffer);
 const book=parseXml(archive.get("xl/workbook.xml")),rels=parseXml(archive.get("xl/_rels/workbook.xml.rels"));
 const relmap=new Map(elements(rels,"Relationship").map(x=>[x.getAttribute("Id"),x.getAttribute("Target")||""]));
 const ss=archive.has("xl/sharedStrings.xml")?elements(parseXml(archive.get("xl/sharedStrings.xml")),"si").map(n=>elements(n,"t").map(t=>t.textContent||"").join("")):[];
 const sheets=[];const warnings=[];
 for(const sh of elements(book,"sheet").slice(0,10)){
  const name=sh.getAttribute("name")||"Sheet",rid=sh.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id")||sh.getAttribute("r:id");
  const target=relmap.get(rid);if(!target){warnings.push(problem("SHEET_NOT_FOUND","Cannot resolve worksheet "+name,name));continue;}
  const path=tidyZipPath("xl",target);if(!archive.has(path)){warnings.push(problem("SHEET_NOT_FOUND","Missing worksheet XML "+path,name));continue;}
  const xml=parseXml(archive.get(path)),rows=[];
  for(const row of elements(xml,"row").slice(0,1200)){
   const rowNo=Number(row.getAttribute("r"))||rows.length+1;
   if(rowNo>1500){warnings.push(problem("SHEET_TRUNCATED","Only the first 1,500 rows were considered.",name));break;}
   const cells=[];
   for(const node of elements(row,"c").slice(0,70)){
    const ref=node.getAttribute("r"),index=columnIndex(ref||"");if(index===null||index>=70)continue;
    const type=node.getAttribute("t")||"",v=ownText(node,"v"),formula=first(node,"f"),str=type==="s"?ss[Number(v)]||"":type==="inlineStr"?elements(node,"t").map(x=>x.textContent||"").join(""):type==="b"?(v==="1"?"TRUE":"FALSE"):type==="str"?v:v;
    if(formula)warnings.push(problem(v?"CACHED_FORMULA":"UNCACHED_FORMULA",v?"A formula at "+name+"!"+ref+" has a cached value. The demo never recalculates Excel formulas; verify the workbook.":"A formula at "+name+"!"+ref+" has no stored result. The demo cannot execute Excel formulas.",name+"!"+ref));
    cells[index]=str;
   }
   while(rows.length<rowNo-1&&rows.length<1500)rows.push([]);
   rows.push(cells.map(x=>x===undefined?"":x));
  }
  sheets.push({kind:"table",name,rows,truncated:elements(xml,"row").length>1200});
 }
 return {parts:sheets,warnings,metadata:{sheets:sheets.length}};
}
export async function decodeDocx(arrayBuffer){
 const files=await unzipOffice(arrayBuffer),xml=parseXml(files.get("word/document.xml"));
 const lines=elements(xml,"p").slice(0,800).map((p,i)=>({ref:"paragraph "+(i+1),text:elements(p,"t").map(n=>n.textContent||"").join("")})).filter(x=>x.text.trim());
 return {parts:[{kind:"text",name:"Document body",lines}],warnings:[problem("DOCX_LIMIT","Plain document text was extracted. Comments, tracked changes, embedded drawings and page locations were not assessed.","Document body")],metadata:{paragraphs:lines.length}};
}
let pdfJs;
export async function decodePdf(buffer){
 if(!pdfJs){try{pdfJs=await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs");pdfJs.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";}catch{throw Error("PDF text reader could not load. The demo needs access to its pinned PDF.js library; please retry or use CSV/XLSX.");}}
 const loading=pdfJs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useSystemFonts:true});
 const document=await loading.promise,parts=[],warnings=[];
 const count=Math.min(document.numPages,20);
 if(document.numPages>20)warnings.push(problem("PAGE_LIMIT","Only the first 20 pages were examined; no conclusion can be made about the rest.","PDF"));
 for(let i=1;i<=count;i++){
  const pg=await document.getPage(i),content=await pg.getTextContent({includeMarkedContent:false});
  const list=content.items.filter(x=>typeof x.str==="string").map(x=>({text:x.str.trim(),x:x.transform?.[4]??0,y:x.transform?.[5]??0})).filter(x=>x.text);
  list.sort((a,b)=>Math.abs(a.y-b.y)>2?b.y-a.y:a.x-b.x);
  const groups=[];for(const item of list){let row=groups[groups.length-1];if(!row||Math.abs(item.y-row.y)>2){row={y:item.y,items:[]};groups.push(row);}row.items.push(item);}
  const lines=groups.slice(0,500).map((r,j)=>({ref:"p."+i+" line "+(j+1),text:r.items.sort((a,b)=>a.x-b.x).map(z=>z.text).join(" ")}));
  parts.push({kind:"text",name:"Page "+i,lines});
 }
 return {parts,warnings,metadata:{pages:document.numPages}};
}
export async function extractDocument(file){
 if(!file||typeof file.name!=="string")throw Error("Choose a document file.");
 const ext=file.name.split(".").pop().toLowerCase();
 if(!ACCEPTED_TYPES.includes(ext))throw Error("Supported formats are CSV, TSV, XLSX, PDF and DOCX.");
 if(!file.size||file.size>LIMIT_BYTES)throw Error("The public demo accepts nonempty files up to 8 MB.");
 const bytes=await file.arrayBuffer();let result;
 if(ext==="csv"||ext==="tsv"){
  let text=textDecode(new Uint8Array(bytes),"utf-8");
  if(text.includes("\uFFFD")){try{text=textDecode(new Uint8Array(bytes),"big5");}catch{}}
  const parsed=parseDelimited(text,ext==="tsv"?"\t":",");
  result={parts:[{kind:"table",name:ext.toUpperCase()+" · "+file.name,rows:parsed.rows,truncated:parsed.truncated}],warnings:parsed.unclosedQuote?[problem("CSV_QUOTING","The file ends inside a quoted field. Review the source for malformed rows.",file.name,"blocker")]:[],metadata:{rows:parsed.rows.length}};
 }else if(ext==="xlsx")result=await decodeXlsx(bytes);
 else if(ext==="docx")result=await decodeDocx(bytes);
 else result=await decodePdf(bytes);
 const report=buildReport(file.name,ext,result.parts,{...result.metadata,bytes:file.size});
 report.findings.push(...(result.warnings||[]));
 if(report.candidates.length){
  const unresolved=report.candidates.filter(c=>c.flags.some(f=>f.severity==="blocker"));
  if(unresolved.length)report.findings.push(problem("ROW_ISSUES","Initial extraction found "+unresolved.length+" lines with missing or conflicting values; inspect original source and record reviewer corrections.",file.name,"blocker"));
 }
 if(["pdf","docx"].includes(ext))report.findings.push(problem("NO_AUTOMATIC_PRICE","Text extraction does not prove that a document contains an approved quotation. No customer price will be generated without structured costs.",file.name));
 return report;
}
export function reviewSummary(report){
 if(!report)return {approved:0,open:0,blocked:0,directCost:0,ready:false};
 const accepted=report.candidates.filter(c=>c.reviewStatus==="approved"),blocked=report.candidates.filter(c=>c.reviewStatus==="pending"&&c.flags.some(f=>f.severity==="blocker"));
 const open=report.candidates.filter(c=>c.reviewStatus==="pending"||c.reviewStatus==="needs_review");
 return {approved:accepted.length,open:open.length,blocked:blocked.length,directCost:accepted.reduce((n,c)=>n+(c.calculatedAmount||0),0),ready:report.candidates.length>0&&open.length===0&&blocked.length===0&&accepted.length>0};
}
export function reviewCandidate(report,id,status,note=""){
 const c=report?.candidates?.find(x=>x.id===id);if(!c)return {ok:false,reason:"Item not found."};
 if(!["approved","excluded","needs_review"].includes(status))return {ok:false,reason:"Invalid review state."};
 if(status==="approved"&&c.flags.some(f=>f.severity==="blocker"))return {ok:false,reason:"Resolve the missing or inconsistent source values before approving this item."};
 c.reviewStatus=status;c.reviewNote=String(note||"").slice(0,400);report.reviewed=false;report.reviewedAt=null;
 return {ok:true};
}
export function editCandidate(report,id,field,value){
 const c=report?.candidates?.find(x=>x.id===id);if(!c)return {ok:false,reason:"Item not found"};
 if(!["quantity","unitCost"].includes(field))return {ok:false,reason:"Invalid field"};
 const n=number(value);if(n===null||n<0||(field==="quantity"&&n===0))return {ok:false,reason:"Enter a valid nonnegative number."};
 c[field]=n;c.calculatedAmount=Math.round((c.quantity||0)*(c.unitCost||0)*100)/100;c.edited=true;c.reviewStatus="pending";
 c.flags=c.flags.filter(x=>x.code!=="MISSING_QUANTITY"&&x.code!=="MISSING_UNIT_COST"&&x.code!=="AMOUNT_MISMATCH");
 if(c.quantity===null||c.quantity<=0)c.flags.push(problem("MISSING_QUANTITY","Quantity needs confirmation.",c.sourceRef,"blocker"));
 if(c.unitCost===null)c.flags.push(problem("MISSING_UNIT_COST","Unit price needs confirmation.",c.sourceRef,"blocker"));
 if(c.sourceAmount!==null&&c.calculatedAmount!==null&&Math.abs(c.sourceAmount-c.calculatedAmount)>Math.max(2,Math.abs(c.calculatedAmount)*.02))c.flags.push(problem("AMOUNT_MISMATCH","Edited line no longer agrees with recorded source amount. Explain or exclude.",c.sourceRef,"blocker"));
 report.reviewed=false;report.reviewedAt=null;
 return {ok:true};
}
export function approveDocument(report,reviewerNote){
 const s=reviewSummary(report);
 const textOnly=report.candidates.length===0&&report.parts.some(p=>p.kind==="text"&&p.lines.length>0);
 if(report.candidates.length&&report.currencyConfirmed!==true)return {ok:false,reason:"Confirm that the source pricing currency is TWD before approving a quotation-derived draft."};
 if(!s.ready&&!textOnly)return {ok:false,reason:"Every extracted cost item must be approved or excluded; blocking discrepancies must be resolved first."};
 if(!String(reviewerNote||"").trim())return {ok:false,reason:"Enter a human review note before approving this draft."};
 report.reviewed=true;report.reviewedAt=new Date().toISOString();report.reviewerNote=String(reviewerNote).slice(0,500);
 return {ok:true,summary:s,mode:textOnly?"TEXT_EXTRACTION_REVIEW":"COST_LINE_REVIEW"};
}
export function reviewReportMarkdown(report,industry){
 const s=reviewSummary(report),rows=report.candidates.filter(c=>c.reviewStatus==="approved");
 const clean=x=>valText(x).replace(/\|/g,"/").replace(/\r?\n/g," ");
 const out=[
 "# StrideBrain · Human-reviewed extraction draft",
 "",
 "Industry pack: "+industry,
 "Origin file: "+report.fileName,
 "Data classification: LOCAL_BROWSER_DOCUMENT",
 "Status: "+(report.reviewed?"REVIEWED IN THIS BROWSER":"DRAFT — NOT APPROVED"),
 "Source reference: "+report.id,
 "Cost currency: "+(report.currencyConfirmed?"TWD — manually confirmed":"UNCONFIRMED"),
 "Review timestamp: "+(report.reviewedAt||"Not reviewed"),
 "",
 "## Accepted extracted cost lines",
 "| Description | Quantity | Unit | Unit cost (TWD) | Extended cost (TWD) | Original cell |",
 "|---|---:|---|---:|---:|---|",
 ...rows.map(c=>"| "+clean(c.description)+" | "+c.quantity+" | "+clean(c.unit)+" | "+c.unitCost+" | "+c.calculatedAmount+" | "+clean(c.sourceRef)+" |"),
 "",
 "Sample extracted direct cost total: NT$"+Math.round(s.directCost).toLocaleString("en-US"),
 "Reviewer note: "+clean(report.reviewerNote||"Not recorded"),
 "",
 "## Observed document fields (not independently verified)",
 ...(report.facts||[]).map(f=>"- "+clean(f.field)+": "+clean(f.value)+" ["+clean(f.sourceRef)+"]"),
 "",
 "## Text excerpts with original locations",
 ...report.parts.filter(p=>p.kind==="text").slice(0,20).flatMap(p=>p.lines.slice(0,50).map(x=>"- "+clean(p.name)+" "+clean(x.ref)+": "+clean(x.text))),
 "",
 "## Unresolved source warnings",
 ...report.findings.map(f=>"- "+clean(f.code)+" at "+clean(f.ref)+": "+clean(f.message)),
 "",
 "**Important:** These are values observed in an uploaded file and reviewed in a temporary demo session. They are not independently verified supplier prices, legally binding offers, actual cash costs, or evidence of permission to contact a customer. Nothing was uploaded to a StrideBrain server."
 ];
 return out.join("\n");
}
