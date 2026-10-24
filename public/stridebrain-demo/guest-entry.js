import {createSessionTransport,captureInvitation,createInvitationAttempt} from "./session-client.js";
const form=document.getElementById("invite-form"),field=document.getElementById("code"),button=document.getElementById("submit"),status=document.getElementById("status");
const destination="/stridebrain-demo/index.html?industry=interior&view=copilot";
const messages={
 "zh-TW":{eyebrow:"探索 StrideBrain",hero:"讓每個營運決策，都更有把握。",intro:"從專案、報價、成本到供應商，透過 AI 對話快速掌握公司營運重點。",industries:"互動示範工作區 · 室內設計／印刷業",title:"幾分鐘內，體驗你的 AI 營運大腦。",description:"免註冊、免設定。輸入體驗碼，即可探索準備好的示範工作區。",codeLabel:"體驗碼",codePlaceholder:"請輸入體驗碼",submit:"進入 StrideBrain →",notice:"使用示範資料體驗專案、報價、供應商與營運分析。無須上傳公司資料。",sampleLink:"先逛逛示範工作區",checking:"正在確認體驗資格…",available:"請輸入你的體驗碼。",unavailable:"AI 體驗即將開放，目前可先探索示範工作區。",returning:"已確認體驗資格，正在開啟 StrideBrain…",error:"暫時無法確認體驗資格，請稍後重試。",missing:"請輸入 PrimeStride AI 提供的體驗碼。",verifying:"正在驗證體驗碼…",success:"驗證成功，正在開啟工作區…",disabled:"AI 體驗目前尚未開放。",invalid:"找不到此體驗碼，請確認後重試。",failed:"無法驗證體驗碼，請重試。",network:"連線中斷，請重試。"},
 en:{eyebrow:"Explore StrideBrain",hero:"See your operations from a new perspective.",intro:"Explore how an AI-powered workspace connects projects, quotations, costs, suppliers, and business knowledge—all through natural conversation.",industries:"Interactive demo workspaces · Interior design & printing",title:"Explore StrideBrain in minutes.",description:"No account or setup needed. Enter your access code to explore a ready-to-use sample workspace.",codeLabel:"Access code",codePlaceholder:"Enter your access code",submit:"Enter StrideBrain →",notice:"Explore example projects, quotations, suppliers, and business insights in a ready-to-use sample workspace. No setup or company data required.",sampleLink:"Explore the sample workspace",checking:"Checking access…",available:"Enter your access code to continue.",unavailable:"AI-powered previews are coming soon. You can explore the sample workspace now.",returning:"Your workspace is ready. Opening StrideBrain…",error:"Unable to check invitation availability. Please retry.",missing:"Enter the access code provided by PrimeStride AI.",verifying:"Checking your access code…",success:"Access confirmed. Opening your workspace…",disabled:"AI-powered previews are not available yet.",invalid:"This access code was not recognized. Please check it and try again.",failed:"The code could not be verified. Please retry.",network:"Connection interrupted. Please retry."}
};
let language="zh-TW";
function applyLanguage(next){language=next==="en"?"en":"zh-TW";try{sessionStorage.setItem("stridebrain-interface-locale",language);}catch{}const strings=messages[language];if(document.documentElement)document.documentElement.lang=language==="en"?"en":"zh-Hant";for(const node of document.querySelectorAll?.("[data-i18n]")||[])node.textContent=strings[node.dataset.i18n]||node.textContent;for(const node of document.querySelectorAll?.("[data-i18n-placeholder]")||[])node.placeholder=strings[node.dataset.i18nPlaceholder]||node.placeholder;for(const node of document.querySelectorAll?.("[data-language]")||[])node.setAttribute("aria-pressed",String(node.dataset.language===language));}
for(const node of document.querySelectorAll?.("[data-language]")||[])node.addEventListener("click",()=>applyLanguage(node.dataset.language));
applyLanguage("zh-TW");
function message(text,error=false){status.textContent=text;status.classList.toggle("error",error);}
const transport=createSessionTransport((...args)=>fetch(...args));
let captured=captureInvitation(window.location,window.history);
let pending=captured===null?null:createInvitationAttempt(captured,transport);
captured=null;
let busy=false,retryCheck=false;
field.disabled=true;
function activationError(error){
 const code=error?.code;
 if(code==="INVALID_INVITATION")return messages[language].invalid;
 if(code==="GUEST_ACCESS_DISABLED")return messages[language].disabled;
 if(code==="INVITE_RATE_LIMITED")return language==="en"?"Too many attempts. Please try again later.":"嘗試次數較多，請稍後重試。";
 if(code==="SESSION_NOT_RETAINED")return language==="en"?"Your browser could not keep the sign-in. Please allow site cookies and retry.":"瀏覽器未能保留登入狀態。請允許此網站使用 Cookie 後重試。";
 return messages[language].network;
}
async function verifyPending(){
 if(busy)return;busy=true;button.disabled=true;message(messages[language].verifying);
 try{
  const info=await pending.redeem();pending=null;
  if(info.active){message(messages[language].success);window.location.assign(destination);}
 }catch(error){
  if(error.code==="INVALID_INVITATION"){pending=null;field.disabled=false;}
  message(activationError(error),true);
  if(pending){field.disabled=true;button.textContent=language==="en"?"Retry connection":"重新連線";}
 }finally{busy=false;button.disabled=false;}
}
async function check(){
 if(pending){await verifyPending();return;}
 retryCheck=false;button.disabled=true;field.disabled=true;
 try{
  const data=await transport.read();
  if(data.active){message(messages[language].returning);window.location.assign(destination);return;}
  if(!data.available){message(messages[language].unavailable);return;}
  button.disabled=false;field.disabled=false;button.textContent=messages[language].submit;message(messages[language].available);
 }catch{retryCheck=true;button.disabled=false;button.textContent=language==="en"?"Retry connection":"重新連線";message(messages[language].error,true);}
}
form.addEventListener("submit",async event=>{
 event.preventDefault();if(busy)return;
 if(retryCheck){await check();return;}
 if(!pending){
  const code=field.value.trim();field.value="";
  if(code.length<24||code.length>256)return message(messages[language].missing,true);
  pending=createInvitationAttempt(code,transport);
 }
 await verifyPending();
});
check();
