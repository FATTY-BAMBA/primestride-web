/**
 * Same-origin UI integration smoke test.
 * Loads the ACTUAL flagship demo interface in an iframe, clicks browser controls
 * and verifies them without provider credentials or network model calls.
 */
const $=id=>document.getElementById(id);
const frame=$("preview-frame"),button=$("run"),status=$("status"),rows=$("results");
const once=(target,event,timeout=14000)=>new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>{target.removeEventListener(event,handler);reject(Error("Timed out waiting for "+event));},timeout);
 function handler(e){clearTimeout(timer);target.removeEventListener(event,handler);resolve(e);}
 target.addEventListener(event,handler,{once:true});
});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,ms=15000,label="element"){
 const start=Date.now();while(Date.now()-start<ms){try{const x=fn();if(x)return x;}catch{}await pause(100);}throw Error("Timed out waiting for "+label);
}
async function openIndustry(id){
 const url="./index.html?industry="+encodeURIComponent(id);
 const waiting=once(frame,"load",18000);
 frame.src=url;
 await waiting;
 const doc=frame.contentDocument;
 await until(()=>doc.querySelector("#main .tile")&&doc.querySelector('[data-action="nav"][data-value="copilot"]'),19000,"demo workspace");
 doc.querySelector('[data-action="nav"][data-value="copilot"]').click();
 await until(()=>doc.querySelector(".sb-composer textarea"),3500,"Copilot composer");
 return doc;
}
function report(label,details,ok){
 const row=document.createElement("tr");
 const a=document.createElement("td"),b=document.createElement("td"),c=document.createElement("td");
 a.textContent=label;b.textContent=ok?"PASS":"FAIL";b.className=ok?"good":"bad";c.textContent=details;
 row.append(a,b,c);rows.appendChild(row);
 return !!ok;
}
async function run(){
 button.disabled=true;rows.innerHTML="";status.textContent="Opening the real StrideBrain demo in a same-origin iframe…";
 let passed=0,failed=0,callCount=0;
 try{
  for(const industry of ["interior","printing"]){
   const doc=await openIndustry(industry),win=frame.contentWindow;
   const originalFetch=win.fetch.bind(win);
   win.fetch=(...args)=>{
    const dest=String(args[0]||"");
    if(dest.includes("/api/stridebrain-demo/copilot")){callCount++;throw Error("Unexpected model request from sample mode");}
    return originalFetch(...args);
   };
   const suffix=industry==="interior"?"interior":"printing";
   let chips=[...doc.querySelectorAll(".sb-shortcut")];
   let ideas=[...doc.querySelectorAll(".sb-context-idea")];
   if(report(suffix+" · business suggestions",chips.map(b=>b.textContent.trim()).join(" · "),chips.length===5&&ideas.length===3))passed++;else failed++;

   let trigger=doc.querySelector(".sb-model-trigger");
   trigger.click();
   const choices=[...doc.querySelectorAll(".sb-model-option")];
   if(report(suffix+" · model picker",choices.length+" curated model options",choices.length===5&&doc.querySelector('.sb-model-menu[role="listbox"]')))passed++;else failed++;

   // Check draft state survives menu rendering and selection.
   let field=doc.querySelector("[data-copilot-input]");
   field.value="Will this question stay in the composer?";
   field.dispatchEvent(new win.Event("input",{bubbles:true}));
   const selected=doc.querySelector('.sb-model-option[data-value="openai/gpt-6-sol"]');
   if(!selected)throw Error("GPT-6 model not listed");
   selected.click();
   field=doc.querySelector("[data-copilot-input]");
   trigger=doc.querySelector(".sb-model-trigger");
   if(report(suffix+" · model selection + draft",trigger.textContent.trim()+" · draft still present",trigger.textContent.includes("GPT-6 Sol")&&field.value.includes("stay in the composer")))passed++;else failed++;

   // Sample mode must answer the shortcut without requesting an AI provider.
   chips=[...doc.querySelectorAll(".sb-shortcut")];
   const follow=chips.find(b=>b.textContent.includes("Follow-ups"));
   if(!follow)throw Error("Follow-ups shortcut missing");
   follow.click();
   await until(()=>doc.querySelector(".sb-conversation .chat-answer"),4500,"sample assistant response");
   const answer=doc.querySelector(".sb-conversation .chat-answer").textContent;
   if(report(suffix+" · follow-ups answer","Source-linked sample response, "+answer.length+" characters",answer.includes("Who to follow up with first")&&doc.querySelectorAll(".sb-conversation .chat-message").length===1))passed++;else failed++;
   if(report(suffix+" · no unexpected provider call",callCount+" model calls",callCount===0))passed++;else failed++;

   const reset=doc.querySelector('[data-action="newChat"]');
   reset?.click();
   await until(()=>doc.querySelectorAll(".sb-conversation .chat-answer").length===0,3000,"empty new chat");
   if(report(suffix+" · new conversation","Conversation cleared locally",!!doc.querySelector(".sb-copilot.is-empty")))passed++;else failed++;
  }
  status.textContent=passed+" passed · "+failed+" failed. Tested conversation UI and sample shortcuts, not live OpenRouter inference or private-company security.";
 }catch(err){
  failed++;
  report("Test harness encountered an error",String(err?.message||err),false);
  status.textContent=passed+" passed · "+failed+" failed. Inspect the error and retest.";
 }finally{button.disabled=false;frame.src="about:blank";}
}
button.addEventListener("click",run);
if(new URLSearchParams(location.search).get("run")==="1")run();
