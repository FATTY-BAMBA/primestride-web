const $=id=>document.getElementById(id),frame=$("preview"),status=$("status"),results=$("results");
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,max=16000){const start=Date.now();while(Date.now()-start<max){const value=fn();if(value)return value;await wait(100)}throw Error("Timed out waiting for workspace");}
function row(name,ok,detail){const tr=document.createElement("tr");for(const t of [name,ok?"PASS":"FAIL",detail]){const cell=document.createElement("td");cell.textContent=t;tr.append(cell)}tr.children[1].className=ok?"pass":"fail";results.append(tr);return ok;}
async function load(path,width){frame.style.width=width+"px";frame.style.maxWidth="100%";const pending=new Promise((res,rej)=>{const timeout=setTimeout(()=>rej(Error("iframe load timed out")),20000);frame.onload=()=>{clearTimeout(timeout);res()};});frame.src=path;await pending;return frame.contentDocument;}
$("run").onclick=async()=>{results.textContent="";$("run").disabled=true;let passed=0,failed=0;const report=(name,ok,detail)=>{(row(name,!!ok,detail)?passed++:failed++);};try{
 const access=await fetch("/api/stridebrain-demo/copilot/guest-session",{credentials:"same-origin",cache:"no-store"}).then(r=>r.json());
 report("Guest access feature flag",access.available===false||access.available===true,"Reported available: "+String(access.available)+"; session active: "+String(access.active));
 for(const industry of ["interior","printing"]){
  for(const width of [1100,390]){
   const doc=await load("./index.html?industry="+industry+"&view=copilot",width);
   await until(()=>doc.querySelector(".sb-composer textarea"));
   report(industry+" · "+width+"px workspace",!!doc.querySelector(".sb-composer textarea")&&!!doc.querySelector(".sb-model-trigger"),"Copilot composer and model picker rendered");
   report(industry+" · "+width+"px demo label",!!doc.querySelector(".demo-status")||!!doc.querySelector(".syn-label"),"Sample-data context present");
  }
 }
 const doc=await load("./guest.html",390);await until(()=>doc.querySelector("#invite-form"));
 report("Mobile guest entry",!!doc.querySelector("#code")&&!!doc.querySelector("#submit"),"No account-registration field required");
 report("No signup required",!doc.querySelector('input[type="email"]')&&!doc.querySelector('input[name="password"]'),"Only access-code entry");
 }catch(e){report("Browser acceptance run",false,String(e.message||e));}
 status.textContent=passed+" passed · "+failed+" failed";$("run").disabled=false;};
