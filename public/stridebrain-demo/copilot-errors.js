/** Keep provider diagnostics out of visitor-facing messages. */
export function copilotErrorMessage(code,locale="zh-TW"){
 const messages={
  DEMO_ACCESS_DENIED:["體驗已到期，請返回體驗入口。你的問題已保留。","Your access has expired. Return to the invitation page. Your question is saved here."],
  DEMO_QUOTA_EXCEEDED:["今天的體驗次數已用完，請明天再試。","You have used today's trial allowance. Please try again tomorrow."],
  DEMO_GLOBAL_QUOTA_EXCEEDED:["今天的體驗額度已用完，請明天再試。","Today's shared trial allowance has been reached. Please try again tomorrow."],
  DEMO_BUDGET_EXCEEDED:["今天的 AI 體驗額度已用完，請明天再試。","Today's AI trial allowance has been reached. Please try again tomorrow."],
  DEMO_CONCURRENCY_EXCEEDED:["目前使用人數較多，請稍後重試。","The assistant is busy. Please retry shortly."],
  PROVIDER_TIMEOUT:["回覆時間較長，這次尚未完成。請重試。","The answer took too long and was not completed. Please retry."],
  GUEST_MODEL_NOT_ALLOWED:["此模型目前不提供體驗，請重新連線以更新可用選項。","This model is not available for your trial. Reconnect to refresh your choices."]
 };
 return (messages[code]||["這次未能完成回覆。你的問題已保留，請重試。","The answer could not be completed. Your question is saved here; please retry."])[locale==="en"?1:0];
}
