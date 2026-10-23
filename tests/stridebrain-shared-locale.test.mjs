import test from "node:test";
import assert from "node:assert/strict";
import {recordCard,documentRow,quoteTable} from "../public/stridebrain-demo/ui-shared.js";
test("shared cards display Chinese labels without mutating canonical records",()=>{
 const p={id:"PRJ-101",name:"松山住宅 · Songshan Residence",stage:"In progress",city:"Taipei",type:"Design",manager:"Mei",progress:65,budget:100000};
 const original=JSON.stringify(p);
 const zh=recordCard(p,"zh-TW"),en=recordCard(p,"en");
 assert.match(zh,/松山住宅/);assert.match(zh,/進行中/);assert.match(en,/In progress/);
 assert.equal(JSON.stringify(p),original);
});
test("source document display translates but preserves ID",()=>{
 const d={id:"DOC-1001",title:"Design agreement · Songshan Residence",version:"v1",status:"Approved"};
 const zh=documentRow(d,"zh-TW");
 assert.match(zh,/設計合約/);assert.match(zh,/DOC-1001/);assert.match(zh,/已核准/);
});
test("quotation header labels change with locale, not underlying numbers",()=>{
 const m={project:()=>({name:"Songshan Residence"})};
 const q=[{id:"Q-101",projectId:"PRJ-101",directCost:8000,amountExTax:10000,grossMarginTarget:.2,sourceDocId:"DOC-1001"}];
 assert.match(quoteTable({model:m,pack:{entityLabel:"Project"},locale:"zh-TW"},q),/目標毛利率/);
 assert.match(quoteTable({model:m,pack:{entityLabel:"Project"},locale:"en"},q),/Target margin/);
});
