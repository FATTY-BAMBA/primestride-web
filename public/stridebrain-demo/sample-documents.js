/**
 * Fully fictional sample files, generated on demand in the visitor's browser.
 * No company data and no external document generators are needed.
 */
const escXml=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const txt=new TextEncoder();
const write16=(v,o,n)=>v.setUint16(o,n,true),write32=(v,o,n)=>v.setUint32(o,n>>>0,true);
const concat=arr=>{const size=arr.reduce((n,a)=>n+a.length,0),u=new Uint8Array(size);let at=0;for(const a of arr){u.set(a,at);at+=a.length;}return u;};
function crc32(bytes){
 let crc=-1;for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}
 return (crc^-1)>>>0;
}
export function zipStored(files){
 const local=[],central=[];let offset=0;
 for(const f of files){
  const name=txt.encode(f.name),data=typeof f.data==="string"?txt.encode(f.data):f.data,crc=crc32(data);
  const header=new Uint8Array(30+name.length),v=new DataView(header.buffer);
  write32(v,0,0x04034b50);write16(v,4,20);write16(v,6,0x0800);write16(v,8,0);
  write32(v,14,crc);write32(v,18,data.length);write32(v,22,data.length);write16(v,26,name.length);
  header.set(name,30);local.push(header,data);
  const dir=new Uint8Array(46+name.length),dv=new DataView(dir.buffer);
  write32(dv,0,0x02014b50);write16(dv,4,20);write16(dv,6,20);write16(dv,8,0x0800);
  write32(dv,16,crc);write32(dv,20,data.length);write32(dv,24,data.length);write16(dv,28,name.length);write32(dv,42,offset);
  dir.set(name,46);central.push(dir);offset+=header.length+data.length;
 }
 const cd=concat(central),eocd=new Uint8Array(22),ev=new DataView(eocd.buffer);
 write32(ev,0,0x06054b50);write16(ev,8,files.length);write16(ev,10,files.length);write32(ev,12,cd.length);write32(ev,16,offset);
 return concat([...local,cd,eocd]);
}
function sheetXml(rows){
 const cells=rows.map((row,i)=>'<row r="'+(i+1)+'">'+row.map((x,j)=>{
  const addr=String.fromCharCode(65+j)+(i+1);
  if(typeof x==="number")return '<c r="'+addr+'"><v>'+x+'</v></c>';
  return '<c r="'+addr+'" t="inlineStr"><is><t xml:space="preserve">'+escXml(x)+'</t></is></c>';
 }).join("")+'</row>').join("");
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+cells+'</sheetData></worksheet>';
}
export function createExampleXlsx(rows){
 const files=[
  {name:"[Content_Types].xml",data:'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},
  {name:"_rels/.rels",data:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:"xl/workbook.xml",data:'<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Estimate Example" sheetId="1" r:id="rId1"/></sheets></workbook>'},
  {name:"xl/_rels/workbook.xml.rels",data:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'},
  {name:"xl/worksheets/sheet1.xml",data:sheetXml(rows)}
 ];
 return zipStored(files);
}
const docs={
 interior:{
  base:"Horizon-Atelier-Songshan-Example",
  rows:[
   ["Item","Quantity","Unit","Unit Price","Total","Notes"],
   ["Site measurement",1,"job",3800,3800,"Measured dimensions still subject to confirmation"],
   ["Cabinetry revision",3.5,"ping",19600,68600,"Illustrative cost; 3.5 × 19,600 = 68,600"],
   ["Quartz slab supply",1,"job",36000,36000,"QZ-04 sample not yet accepted"],
   ["Stone fabrication and installation",1,"job",24000,24000,"Supplier lead time unverified"],
   ["Lighting replacement",8,"piece",1500,12000,"No customer approval yet"],
   ["Delivery contingency",1,"job","",2800,"Unit price deliberately missing for review"]
  ],
  pdf:[
   "HORIZON ATELIER - FICTIONAL PROJECT SPECIFICATION",
   "Project: Songshan Residence / PRJ-101",
   "Document: Kitchen Worktop Variation CHG-101-QZ",
   "Revision: A2 (DRAFT - NOT FOR CONSTRUCTION)",
   "Baseline: approved solid-surface countertop.",
   "Requested: quartz material QZ-04 in warm stone finish.",
   "Dimensions: field measurement and support checks required.",
   "Artwork/Drawing reference: Kitchen elevation ID-102 A2 draft.",
   "Supplier: Stonefield Surfaces (fictional, NOT verified).",
   "Cost: sample supplier estimate only; no valid quote.",
   "Approval: supplier pending; owner pending; client pending.",
   "Schedule impact: unknown until stock and fabrication confirmed.",
   "Safety/regulatory requirements: refer to a qualified reviewer.",
   "This PDF is a generated DEMONSTRATION, not a real project record."
  ]
 },
 printing:{
  base:"Clearprint-MinQuan-A3-Example",
  rows:[
   ["Item","Quantity","Unit","Unit Price","Total","Notes"],
   ["Prepress / proof review",1,"job",950,950,"Customer proof approval pending"],
   ["A3 poster run",500,"piece",38,19000,"Trim A3; actual PDF dimensions unverified"],
   ["Recycled 170gsm stock uplift",500,"piece",4.8,2400,"Supplier certification not verified"],
   ["Finishing",500,"piece",2.5,1250,"Exact coating requirements to confirm"],
   ["Packing",1,"job",600,600,"Sample allocation"],
   ["Delivery",1,"job",850,700,"Deliberate mismatch for source review"]
  ],
  pdf:[
   "CLEARPRINT STUDIO - FICTIONAL PRINT JOB INTAKE",
   "Job: Minquan Poster Run / JOB-201",
   "Quantity: 500 A3 posters.",
   "Nominal trim size: 297 x 420 mm.",
   "Example printer bleed: 3 mm each side.",
   "Corresponding file canvas: 303 x 426 mm if 3 mm bleed.",
   "File format expected: PDF; fonts embedded or outlined.",
   "Placed images: 300dpi example vendor guideline.",
   "Print: CMYK workflow to confirm with selected printer.",
   "Stock request: change 150gsm coated to recycled 170gsm.",
   "Proof approval: not yet received.",
   "Supplier stock and certified recycled status: unverified.",
   "Production date: not confirmed.",
   "This PDF is a generated DEMONSTRATION, not real artwork."
  ]
 }
};
export function sampleRows(industry){const k=industry==="printing"?"printing":"interior";return docs[k].rows.map(row=>row.slice());}
export function sampleFile(industry,format){
 const config=docs[industry==="printing"?"printing":"interior"];
 if(format==="csv"){
  const data="\uFEFF"+config.rows.map(r=>r.map(v=>{const s=String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(",")).join("\r\n");
  return {filename:config.base+".csv",type:"text/csv;charset=utf-8",bytes:txt.encode(data)};
 }
 if(format==="xlsx")return {filename:config.base+".xlsx",type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",bytes:createExampleXlsx(config.rows)};
 if(format==="pdf")return {filename:config.base+".pdf",type:"application/pdf",bytes:createSimplePdf(config.pdf)};
 throw Error("Unknown example file type.");
}
function ascii(s){return String(s).replace(/[^\x20-\x7E]/g,"?");}
const pdfEscape=s=>ascii(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
export function createSimplePdf(lines){
 const content="BT\n/F1 11 Tf\n48 795 Td\n"+lines.map((t,i)=>(i?"0 -22 Td\n":"")+"("+pdfEscape(t)+") Tj").join("\n")+"\nET\n";
 const objects=[
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  "<< /Length "+txt.encode(content).length+" >>\nstream\n"+content+"endstream"
 ];
 let output="%PDF-1.4\n",offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(txt.encode(output).length);output+=(i+1)+" 0 obj\n"+objects[i]+"\nendobj\n";}
 const xrefAt=txt.encode(output).length;output+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
 for(let i=1;i<offsets.length;i++)output+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
 output+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xrefAt+"\n%%EOF\n";
 return txt.encode(output);
}
