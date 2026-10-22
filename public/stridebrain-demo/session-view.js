import {escapeHtml as e} from "./core-model.js";
export function sessionGate(c){
 const zh=c.locale!=="en",session=c.copilotSession||{},phase=session.access||"checking";
 const words={
  checking:["正在開啟你的 AI 工作區…","Opening your AI workspace…","正在確認你的體驗資格，無須再次輸入體驗碼。","Checking your existing access. No need to enter your code again."],
  error:["連線暫時中斷","Connection interrupted","無法確認目前的連線狀態。你的問題已保留，請重試。","We could not check your connection. Your question is saved here; please retry."],
  unavailable:["AI 助理暫時無法使用","AI is temporarily unavailable","你的體驗資格已確認。請稍後重試，無須重新輸入體驗碼。","Your access is confirmed. Please retry shortly; no new access code is needed."],
  signed_out:["請從體驗入口繼續","Continue from the invitation page","此瀏覽器尚未登入，或體驗已到期。請返回原本的體驗入口。","This browser is not signed in, or access has expired. Continue from the original invitation page."]
 };
 const pair=words[phase]||words.error;
 let out='<section class="panel sb-session-gate" data-session-state="'+e(phase)+'" style="max-width:760px;margin:32px auto;padding:28px" aria-busy="'+(phase==="checking")+'"><div role="status" aria-live="polite"><h1>'+pair[zh?0:1]+'</h1><p>'+pair[zh?2:3]+'</p></div>';
 if(phase==="checking")out+='<div class="loader-ring" aria-hidden="true"></div>';
 if(session.draft)out+='<label for="sb-held-question">'+(zh?'保留的問題':'Your saved question')+'</label><textarea id="sb-held-question" class="input" rows="3" maxlength="1200" data-copilot-input>'+e(session.draft)+'</textarea>';
 if(phase==="error"||phase==="unavailable")out+='<button type="button" class="button-primary" data-action="retrySession">'+(zh?'重新連線':'Retry connection')+'</button>';
 if(phase==="signed_out")out+='<a class="button-primary" href="./guest.html">'+(zh?'返回體驗入口':'Return to invitation page')+'</a>';
 if(phase==="signed_out"&&c.staffAccess)out+='<details class="copilot-operator-box"><summary>'+(zh?'管理員登入':'Administrator sign-in')+'</summary><label for="copilot-access-token">'+(zh?'內部人員存取碼':'Staff access code')+'</label><input type="password" id="copilot-access-token" autocomplete="off"><button type="button" class="button-secondary" data-action="enableGpt">'+(zh?'登入':'Sign in')+'</button></details>';
 return out+'</section>';
}
