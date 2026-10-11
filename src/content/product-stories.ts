import type { Locale } from "@/i18n";

export type ProductStep = {
  label: string;
  kicker: string;
  title: string;
  body: string;
  source: string;
  rows?: { label: string; value: string; progress?: number }[];
};
export type ProductStory = {
  summary: string;
  context: string;
  steps: [ProductStep, ProductStep, ProductStep];
};

// Illustrative scenarios derived from the existing product demonstrations.
// These are sample content, not live customer records or measured results.
const stories: Record<string, Record<Locale, ProductStory>> = {
  "edusense-ai": {
    en: {
      summary: "Turn recorded lessons into answers students can trace and learning gaps teachers can act on.",
      context: "Biology · From a lesson to the next teaching decision",
      steps: [
        { label: "Class content", kicker: "Start with your teaching", title: "One recorded lesson. Ready to revisit.", body: "Chapters, notes and review questions are organized around the teacher’s own content.", source: "Recorded class · Biology, Chapter 4", rows: [{ label: "12:36", value: "Light reactions" }, { label: "18:02", value: "Calvin cycle" }] },
        { label: "Student answer", kicker: "AI teaching assistant", title: "“Which stage makes ATP?”", body: "ATP is made in the light reactions, across the thylakoid membrane. The answer points the student back to the teacher’s explanation.", source: "Biology · Chapter 4 · 12:36" },
        { label: "Teacher insight", kicker: "Class mastery by topic", title: "See where to teach again.", body: "Shared knowledge gaps help teachers choose what to revisit with the class.", source: "Illustrative class learning report", rows: [{ label: "Light reactions", value: "84%", progress: 84 }, { label: "Calvin cycle", value: "61%", progress: 61 }, { label: "Electron transport", value: "47%", progress: 47 }] },
      ],
    },
    zh: {
      summary: "把錄影課程變成有依據的解答，讓學生找得到重點、老師看得見學習缺口。",
      context: "生物課 · 從一堂課，到下一個教學決定",
      steps: [
        { label: "課程內容", kicker: "從老師的教學出發", title: "一堂錄影課，隨時回到重點。", body: "依老師自己的內容整理章節、筆記與複習題，讓課後複習更有方向。", source: "課程錄影 · 生物第四章", rows: [{ label: "12:36", value: "光反應" }, { label: "18:02", value: "卡爾文循環" }] },
        { label: "學生解答", kicker: "AI 助教", title: "「哪個階段在製造 ATP？」", body: "ATP 在光反應階段、類囊體膜上產生。解答附上時間點，讓學生回到老師講解的位置。", source: "生物第四章 · 12:36" },
        { label: "教師洞察", kicker: "全班主題精熟度", title: "看見下一堂課，該補強哪裡。", body: "把共同的知識缺口整理出來，協助老師決定需要再講解的重點。", source: "班級學習報表示例", rows: [{ label: "光反應", value: "84%", progress: 84 }, { label: "卡爾文循環", value: "61%", progress: 61 }, { label: "電子傳遞鏈", value: "47%", progress: 47 }] },
      ],
    },
  },
  "atlas-eip": {
    en: {
      summary: "Bring leave requests, policy knowledge and HR review into one clear workflow for your team.",
      context: "Employee request · A clearer path to approval",
      steps: [
        { label: "Request", kicker: "Plain-language input", title: "“I need one day of annual leave.”", body: "Employees describe the request naturally. Atlas structures the information for the approval process.", source: "Illustrative employee request", rows: [{ label: "Leave type", value: "Annual leave" }, { label: "Duration", value: "1 day" }] },
        { label: "Review", kicker: "Policy and balance checks", title: "The context HR needs, together.", body: "The request is checked against leave records and applicable rules, with issues surfaced for review.", source: "Leave balance · Company policy · Applicable rules", rows: [{ label: "Balance after request", value: "7 days" }, { label: "Next step", value: "Manager approval" }] },
        { label: "Follow through", kicker: "A traceable workflow", title: "Keep the decision connected to the request.", body: "Approvals and policy questions stay connected to the employee’s request and supporting records.", source: "Request history · Employee handbook" },
      ],
    },
    zh: {
      summary: "把請假申請、公司規範與人資審核串成清楚的流程，讓團隊少一點來回確認。",
      context: "員工申請 · 更清楚的送簽流程",
      steps: [
        { label: "提出申請", kicker: "自然語言輸入", title: "「我想請一天特休。」", body: "員工用平常說話的方式提出需求，Atlas 整理成可送簽的申請內容。", source: "員工申請示例", rows: [{ label: "假別", value: "特休" }, { label: "天數", value: "1 天" }] },
        { label: "比對審核", kicker: "規範與餘額確認", title: "把人資需要的依據放在一起。", body: "比對假勤紀錄與適用規則，將需要確認的事項整理出來，供人員審核。", source: "特休餘額 · 公司規範 · 適用規則", rows: [{ label: "申請後餘額", value: "7 天" }, { label: "下一步", value: "主管簽核" }] },
        { label: "後續追蹤", kicker: "有紀錄的工作流程", title: "每個決定，都回得去原始申請。", body: "把簽核與規範詢問連回員工申請和相關紀錄，減少重複查找。", source: "申請紀錄 · 員工手冊" },
      ],
    },
  },
  "lyra-ai": {
    en: {
      summary: "Practice speaking, get specific feedback, and review the evidence behind each competency score.",
      context: "Interview practice · From an answer to useful feedback",
      steps: [
        { label: "Speak", kicker: "Voice interview practice", title: "“Tell me about a difficult team situation.”", body: "A voice conversation gives candidates space to practice pacing, structure and follow-up questions.", source: "Illustrative interview session · Leadership" },
        { label: "Get feedback", kicker: "Specific coaching", title: "A clearer answer starts with your actions.", body: "You described the situation. Now explain what you personally did and the result. Use STAR to give the answer a clearer structure.", source: "Feedback linked to the candidate’s answer" },
        { label: "Review", kicker: "Competency report", title: "Know what to practice next.", body: "Review competency feedback alongside the session recording, then focus the next practice session.", source: "Illustrative scorecard · Human review", rows: [{ label: "Communication", value: "82 / 100", progress: 82 }, { label: "Problem solving", value: "74 / 100", progress: 74 }, { label: "Leadership", value: "61 / 100", progress: 61 }] },
      ],
    },
    zh: {
      summary: "開口練習、得到具體回饋，並透過對話紀錄理解每項能力評分的依據。",
      context: "面試練習 · 從一段回答，到具體的進步方向",
      steps: [
        { label: "開口練習", kicker: "語音面試練習", title: "「談談你帶領團隊度過困難的經驗。」", body: "透過語音對話，練習回答的節奏、結構，以及如何接住面試官的追問。", source: "面試情境示例 · 領導力" },
        { label: "教練回饋", kicker: "具體的改善建議", title: "好的回答，讓人聽見你做了什麼。", body: "你已說明情境，接著補上自己採取的行動與結果。用 STAR 架構，讓回答更完整。", source: "回饋連結至求職者的回答內容" },
        { label: "回顧報告", kicker: "能力評估報告", title: "知道下一次，該練習什麼。", body: "搭配錄音檢視各項能力回饋，為下一次練習找到方向。", source: "評分示例 · 供人員檢視", rows: [{ label: "溝通表達", value: "82 / 100", progress: 82 }, { label: "問題解決", value: "74 / 100", progress: 74 }, { label: "領導力", value: "61 / 100", progress: 61 }] },
      ],
    },
  },
  "ai-customer-assistant": {
    en: {
      summary: "Answer customers across languages using your company’s knowledge, and bring in your team when a person is needed.",
      context: "Customer service · Company knowledge behind every reply",
      steps: [
        { label: "Customer asks", kicker: "Multilingual service", title: "“How does your returns process work?”", body: "Customers ask in their language. The assistant uses the company’s service knowledge to prepare a relevant reply.", source: "Language coverage configured for your customers" },
        { label: "Grounded reply", kicker: "Answers from your content", title: "A useful answer. A clear source.", body: "The reply explains the company’s returns process and points to the supporting policy. Follow-up questions keep the conversation’s context.", source: "Company returns policy · Service knowledge base" },
        { label: "Human handoff", kicker: "When a person is needed", title: "“My item arrived damaged.”", body: "The assistant passes the conversation and its context to your team for review, so the customer does not have to start again.", source: "Human review · Full conversation history" },
      ],
    },
    zh: {
      summary: "用公司的知識回覆不同語言的客戶；需要人員處理時，帶著完整脈絡交給團隊。",
      context: "客戶服務 · 每個回覆，背後都有公司知識",
      steps: [
        { label: "客戶提問", kicker: "多語言服務", title: "「請問退貨流程怎麼進行？」", body: "客戶使用熟悉的語言提問，助理依公司的服務知識準備相關回覆。", source: "依客戶需求設定支援語言" },
        { label: "依據作答", kicker: "從公司內容取得答案", title: "回答有幫助，依據也清楚。", body: "說明公司的退貨流程，並附上對應規範；客戶繼續追問時，保留前面的對話脈絡。", source: "公司退貨規範 · 客服知識庫" },
        { label: "真人接手", kicker: "需要人員處理時", title: "「商品收到時已經破損了。」", body: "把對話與相關資訊一起交給團隊確認，客戶不用重新說明一次。", source: "人員審核 · 完整對話紀錄" },
      ],
    },
  },
  pulse: {
    en: {
      summary: "Manage campaigns from a conversation, watch budget exceptions, and bring channel performance into one report.",
      context: "Marketing operations · From a command to a clearer picture",
      steps: [
        { label: "Give a command", kicker: "LINE campaign control", title: "“Pause ads above my CPC threshold.”", body: "Use a message to direct supported campaign actions in Meta and Google Ads.", source: "Your campaign rules · Connected ad accounts" },
        { label: "Watch budgets", kicker: "Budget protection", title: "Catch the exception that needs attention.", body: "Campaigns are monitored against your configured thresholds. Budget protection can pause campaigns when CPC rises above the limit.", source: "Configured CPC threshold · Campaign performance", rows: [{ label: "Meta Ads", value: "Budget monitoring" }, { label: "Google Ads", value: "Budget monitoring" }] },
        { label: "See the report", kicker: "One Monday report", title: "Start the week with the whole picture.", body: "Bring channel results and the important changes together in the scheduled report.", source: "Illustrative weekly report", rows: [{ label: "Meta Ads", value: "ROAS 3.2" }, { label: "Google Ads", value: "CPC NT$6.4" }, { label: "Delivery", value: "Monday · 08:00" }] },
      ],
    },
    zh: {
      summary: "用對話管理廣告、掌握預算異常，並把跨通路成效整理成一份看得懂的報告。",
      context: "行銷營運 · 從一句指令，到完整的成效視野",
      steps: [
        { label: "下達指令", kicker: "LINE 廣告操控", title: "「暫停 CPC 超過門檻的廣告。」", body: "用訊息操作 Meta 與 Google Ads 支援的廣告管理動作。", source: "你設定的規則 · 已串接的廣告帳戶" },
        { label: "監看預算", kicker: "預算防護", title: "把需要注意的異常，及早找出來。", body: "依設定門檻監看廣告，CPC 超過限制時可自動暫停，協助守住預算。", source: "CPC 門檻設定 · 廣告成效", rows: [{ label: "Meta Ads", value: "預算監看" }, { label: "Google Ads", value: "預算監看" }] },
        { label: "掌握報告", kicker: "週一整合報告", title: "一週的開始，先看清全貌。", body: "把跨通路結果與重要變化整理在一起，依排程送出報告。", source: "每週報表示例", rows: [{ label: "Meta Ads", value: "ROAS 3.2" }, { label: "Google Ads", value: "CPC NT$6.4" }, { label: "寄送時間", value: "週一 · 08:00" }] },
      ],
    },
  },
  "ai-knowledge-assistant": {
    en: {
      summary: "Give employees a clear answer from company documents, with the source close enough to check.",
      context: "Company knowledge · From a question to its source",
      steps: [
        { label: "Ask naturally", kicker: "An everyday staff question", title: "“What’s our business-trip hotel budget?”", body: "Employees ask a question in ordinary language instead of searching through a folder of policies.", source: "Employee question · Travel policy" },
        { label: "Check the source", kicker: "An answer with evidence", title: "The policy, with the exact page.", body: "The assistant finds the relevant company policy and cites the document, section and page alongside the answer.", source: "Travel Policy · §4.2 · Page 3", rows: [{ label: "Document", value: "Travel Policy" }, { label: "Access", value: "Role-based permissions" }] },
        { label: "Close the gap", kicker: "Knowledge coverage", title: "Find what your documents are missing.", body: "Repeated low-confidence questions flag a knowledge gap, helping the document owner decide what to add next.", source: "Coverage report · Low-confidence questions", rows: [{ label: "Repeated question", value: "Approval limits" }, { label: "Suggested content", value: "Approval-authority table" }] },
      ],
    },
    zh: {
      summary: "讓員工從公司文件找到清楚的答案，並把可以核對的出處放在答案旁邊。",
      context: "企業知識 · 從一個問題，找到原始依據",
      steps: [
        { label: "自然提問", kicker: "員工每天會問的問題", title: "「出差住宿的預算上限是多少？」", body: "像問同事一樣提問，不用先在一整個資料夾裡翻找規範。", source: "員工提問 · 差旅管理辦法" },
        { label: "核對依據", kicker: "附出處的解答", title: "找到規範，也找到確切頁碼。", body: "從公司規範找出相關內容，回答旁附上文件、章節與頁碼，方便直接核對。", source: "差旅管理辦法 · §4.2 · 第 3 頁", rows: [{ label: "引用文件", value: "差旅管理辦法" }, { label: "資料存取", value: "依角色權限" }] },
        { label: "補齊缺口", kicker: "知識覆蓋率", title: "知道文件裡，還少了什麼。", body: "反覆出現的低信心問題會標記為知識缺口，協助文件管理者決定該補充哪些內容。", source: "覆蓋率報告 · 低信心提問", rows: [{ label: "重複提問", value: "簽核權限上限" }, { label: "建議補充", value: "簽核權限表" }] },
      ],
    },
  },
};

export function getProductStory(slug: string, locale: Locale): ProductStory {
  return stories[slug][locale];
}
