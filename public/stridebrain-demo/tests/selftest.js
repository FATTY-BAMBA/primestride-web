import {sampleFile} from "../sample-documents.js";
import {extractDocument} from "../document-intelligence.js";
const $=id=>document.getElementById(id),formats=["csv","xlsx","pdf"],industries=["interior","printing"];
async function run(){
 $("run").disabled=true;$("results").innerHTML="";const failures=[],lines=[];
 for(const industry of industries)for(const format of formats){
  const fixture=sampleFile(industry,format),tr=document.createElement("tr");
  tr.innerHTML="<td>"+industry+"</td><td>"+format.toUpperCase()+"</td><td>Local parsing, source references and expected diagnostics</td><td>Running…</td>";
  $("results").appendChild(tr);
  try{
   const file=new File([fixture.bytes],fixture.filename,{type:fixture.type});
   const report=await extractDocument(file);
   let pass=true,detail="";
   if(format==="pdf"){
    const lines=report.parts.flatMap(p=>p.lines||[]);
    pass=lines.some(x=>x.text.includes("FICTIONAL"))&&lines.length>=5;
    detail=lines.length+" embedded-text lines";
   }else{
    const issue=industry==="interior"?"MISSING_UNIT_COST":"AMOUNT_MISMATCH";
    const flags=report.candidates.flatMap(x=>x.flags.map(z=>z.code));
    pass=report.candidates.length===6&&flags.includes(issue);
    detail=report.candidates.length+" lines; "+issue+" = "+flags.includes(issue);
   }
   tr.lastElementChild.textContent=(pass?"PASS · ":"FAIL · ")+detail;
   tr.lastElementChild.className=pass?"pass":"fail";
   if(!pass)failures.push(industry+" / "+format+": "+detail);
   lines.push(industry+" / "+format+" — "+detail);
  }catch(error){
   const msg=String(error?.message||error);tr.lastElementChild.textContent="FAIL · "+msg;tr.lastElementChild.className="fail";
   failures.push(industry+" / "+format+": "+msg);
  }
 }
 $("details").textContent=failures.length?"Failures:\n"+failures.join("\n")+"\n\nSome browsers or network policies may block PDF.js or ZIP decompression.":"All six fictional documents parsed in this browser.\n\n"+lines.join("\n");
 $("run").disabled=false;
}
$("run").addEventListener("click",run);
