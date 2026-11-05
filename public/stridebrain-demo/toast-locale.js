/** Traditional Chinese text for app toasts that are written in English in app.js. */
const ZH={
 "A current human-reviewed draft is required for export.":"需要一份最新且經人工審閱的草稿才能匯出。",
 "Assessment recorded. Not a technical certification.":"評估已記錄。這不是技術認證。",
 "Browser storage unavailable. Changes may not survive a refresh.":"瀏覽器儲存無法使用，重新整理後變更可能會遺失。",
 "Clipboard unavailable. You may select the text manually.":"無法使用剪貼簿，請手動選取文字。",
 "Cost categories suggested from line descriptions. Verify every mapping.":"已依品項描述建議成本類別，請逐筆確認。",
 "Create a supported historical estimate first.":"請先建立可支援的歷史估價。",
 "Customer response prepared. Review required before copy.":"客戶回覆已準備好，複製前需先審閱。",
 "Draft created. Human review is required.":"草稿已建立，需要人工審閱。",
 "Draft reviewed locally. No message sent.":"草稿已在本機審閱，沒有寄出任何訊息。",
 "Draft reviewed locally. No quotation was sent.":"草稿已在本機審閱，沒有寄出任何報價。",
 "Extracted local file. Review every source value before using it.":"已擷取本機檔案，使用前請逐項審閱來源數值。",
 "Feedback captured for human review.":"回饋已記錄，待人工審閱。",
 "Human review is required before export.":"匯出前需要人工審閱。",
 "Inputs have changed; generate a fresh draft.":"條件已變更，請重新產生草稿。",
 "Inquiry settings restored to the industry default.":"詢價設定已恢復為產業預設值。",
 "Keep this review task blocked until the latest operational assessment has no outstanding holds.":"在最新評估沒有阻擋項目前，請保持此審查待辦為受阻。",
 "Line item review decision recorded in this tab.":"品項審閱決定已記錄在此分頁。",
 "Local document and any derived precedent cleared from this tab.":"已從此分頁清除本機文件與衍生案例。",
 "Price recalculated; previous approvals require fresh review.":"價格已重新計算，先前的核准需要重新審閱。",
 "Record the current assessment before creating a follow-up.":"建立追蹤待辦前，請先記錄目前的評估。",
 "Review a document first.":"請先審閱一份文件。",
 "Review recorded; source text was not changed.":"審閱已記錄，來源文字未變更。",
 "Review task already exists in Work Orders.":"審查待辦已存在於工作單中。",
 "Review the current draft before copying.":"複製前請先審閱目前的草稿。",
 "Reviewed extraction exported with original source references.":"已匯出審閱後的擷取結果，並附原始來源。",
 "Reviewed sample draft copied. No message was sent.":"已複製審閱後的範例草稿，沒有寄出任何訊息。",
 "Reviewed sample estimate exported. This is not a commercial offer.":"已匯出審閱後的範例估價，這不是正式報價。",
 "Sample approval recorded locally.":"範例核准已記錄在本機。",
 "Sample state restored.":"範例狀態已恢復。",
 "Sample work status updated.":"範例工作狀態已更新。",
 "Sample workspace approval recorded.":"範例工作區核准已記錄。",
 "Screening reset. Existing follow-up work remains for review.":"檢核條件已重設，既有追蹤待辦仍保留待審。",
 "Session-only historical example removed. Original upload remains in the tab until cleared.":"已移除本次工作階段的歷史範例，原始上傳檔仍保留在分頁中直到清除。",
 "Source document not found.":"找不到來源文件。",
 "Source flagged in the learning queue.":"來源已標記到回饋佇列。",
 "Source opened in the evidence panel.":"已在依據面板開啟來源。",
 "Temporary sandbox precedent added. Not a verified real-world cost.":"已加入暫時的沙盒案例，並非經確認的實際成本。",
 "Unable to read file. Check the source or try a sample file.":"無法讀取檔案，請檢查來源或改用範例檔。",
 "Value updated as an explicit human edit; source amount is unchanged.":"數值已以人工修改更新，來源金額不變。"
};
const PATTERNS=[
 [/^Cannot create a draft: (.*)$/,m=>"無法建立草稿："+m[1]],
 [/^Cannot create sample: (.*)$/,m=>"無法建立範例："+m[1]],
 [/^Could not load the selected industry: (.*)$/,m=>"無法載入所選產業："+m[1]],
 [/^Created (\S+) in the sample work register\.$/,m=>"已在範例工作登記中建立 "+m[1]+"。"],
 [/^Linked (\S+) to the example work-order register\.$/,m=>"已將 "+m[1]+" 連結至範例工單登記。"],
 [/^Sample (\S+) file downloaded\. Select it in Document Intelligence to test\.$/,m=>"已下載範例 "+m[1]+" 檔，可在文件智慧整理中選取測試。"]
];
export function toastText(message,zh){
 if(!zh||typeof message!=="string")return message;
 if(Object.prototype.hasOwnProperty.call(ZH,message))return ZH[message];
 for(const [re,fn] of PATTERNS){const m=message.match(re);if(m)return fn(m);}
 return message;
}
