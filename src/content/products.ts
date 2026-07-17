import type { Locale } from "@/i18n";

export interface Feature {
  title: string;
  desc: string;
}

export interface ProductCopy {
  tagline: string;
  stats: string[];
  description: string;
  whoFor: string;
  features: Feature[];
}

export interface Product {
  slug: string;
  name: string;
  zhName: string;
  pillarTag: string;
  visual: string;
  live: boolean;
  en: ProductCopy;
  zh: ProductCopy;
}

export const products: Product[] = [
  {
    slug: "atlas-eip",
    name: "Atlas EIP",
    zhName: "企業智慧平台 · Enterprise Intelligence",
    pillarTag: "人 · HR",
    visual: "hr",
    live: true,
    en: {
      tagline: "AI-native HR built for Taiwan's newest labor rules.",
      stats: [
        "Leave requests: 5–10 min → under 30 sec",
        "HR admin: 20 hrs → under 3 hrs/week",
        "100% auto-checked against 2026 amendments",
        "Live in 7 days",
      ],
      description:
        "Atlas EIP is the AI-native HR system for Taiwan SMEs still running leave, overtime, and compliance through LINE, Excel, or legacy ERP. Employees file requests in plain language and every submission is auto-checked against current Taiwan labor regulations—so compliance stops being a manual, error-prone scramble and becomes something that just happens in the background.",
      whoFor:
        "HR managers and general managers at Taiwan SMEs (20–500 staff) still handling leave, OT, and compliance through LINE, Excel, or a legacy ERP.",
      features: [
        { title: "Natural-language leave & OT", desc: "Employees file requests in plain language; Atlas parses intent and routes approvals automatically." },
        { title: "Compliance engine", desc: "Every submission is auto-checked against current Taiwan labor rules, including the 2026 amendments." },
        { title: "Handbook conflict scanner", desc: "Upload your handbook and Atlas flags every clause that conflicts with the regulations." },
        { title: "Government subsidy hunter", desc: "Tracks eligibility for SBIR, parental-leave, flexible-work, and minimum-wage-offset grants." },
        { title: "One-click inspection report", desc: "A labor-inspection notice arrives and a full, traceable compliance report is generated instantly." },
        { title: "Built-in knowledge assistant", desc: "Policy questions answered from your own documents, cited to the exact handbook section." },
      ],
    },
    zh: {
      tagline: "為台灣最新勞動法規打造的 AI 原生人資系統。",
      stats: [
        "請假申請：5–10 分 → 30 秒內",
        "人資行政：每週 20 小時 → 3 小時內",
        "100% 自動比對 2026 年新制",
        "7 天上線",
      ],
      description:
        "Atlas EIP 是為台灣中小企業打造的 AI 原生人資系統，取代仍以 LINE、Excel 或舊 ERP 處理請假、加班與合規的方式。員工用自然語言提出申請，每一筆都自動比對現行勞動法規——讓合規不再是容易出錯的人工作業，而是在背景自動完成的事。",
      whoFor:
        "仍以 LINE、Excel 或舊 ERP 處理請假、加班與合規的台灣中小企業（20–500 人）人資主管與總經理。",
      features: [
        { title: "自然語言請假與加班", desc: "員工用自然語言提出申請，Atlas 判讀意圖並自動送簽。" },
        { title: "勞動法規合規引擎", desc: "每筆申請自動比對現行台灣勞動法規，涵蓋 2026 年新制。" },
        { title: "員工手冊衝突掃描", desc: "上傳員工手冊，Atlas 標記每一條與法規衝突的條款。" },
        { title: "政府補助追蹤", desc: "追蹤 SBIR、育嬰、彈性工時與薪資補貼等補助資格。" },
        { title: "一鍵勞檢報告", desc: "勞檢通知一到，立即產出完整且可追溯的合規報告。" },
        { title: "內建知識助理", desc: "從你自己的文件回答政策問題，並引用到確切的手冊章節。" },
      ],
    },
  },
  {
    slug: "lyra-ai",
    name: "LyraAI",
    zhName: "語音面試教練 · Voice Interview Coach",
    pillarTag: "發 · Talent",
    visual: "interview",
    live: true,
    en: {
      tagline: "Real voice. Honest scores. Built for Taiwan.",
      stats: [
        "10-competency evaluation framework",
        "Bilingual 繁中 + English",
        "3-layer anti-inflation scoring",
        "Full candidate + AI audio recorded",
      ],
      description:
        "LyraAI is a real-time voice interview coach. Candidates hold a genuine sub-second voice conversation—training the pacing, clarity, and structure that actually matter in a room—and get scored across ten competencies by a system engineered to resist grade inflation. It's built for Traditional Chinese from the ground up, so the phrasing and conventions reflect how interviews really run in Taiwan.",
      whoFor:
        "Corporate HR teams standardizing their interviews, universities and bootcamps preparing students, and individual candidates prepping for top-tier interviews.",
      features: [
        { title: "Real-time voice interview", desc: "Sub-second voice exchange trains pacing, clarity, and structure—not just what you'd type." },
        { title: "10-competency framework", desc: "Scores leadership, teamwork, problem-solving, communication, adaptability, and more." },
        { title: "Anti-inflation scoring", desc: "Three layers mean shallow or incomplete answers can't earn inflated scores." },
        { title: "Full session recording", desc: "Candidate and AI tracks are both recorded—for self-review and HR transparency." },
        { title: "HR upload mode", desc: "Upload a JD and Lyra generates role-specific questions and scoring rubrics." },
        { title: "Emotional safety", desc: "Detects frustration and alerts HR. The AI never argues—human-in-the-loop by design." },
      ],
    },
    zh: {
      tagline: "真實語音 · 誠實評分 · 為台灣打造。",
      stats: [
        "十項能力評估框架",
        "雙語 繁中 + 英文",
        "三層防虛高評分機制",
        "求職者與 AI 全程錄音",
      ],
      description:
        "LyraAI 是即時語音面試教練。求職者進行真正的次秒級語音對話——訓練在現場真正重要的節奏、清晰度與結構——並由一套刻意抗分數膨脹的系統，就十項能力給予評分。它從底層為繁體中文打造，用語與慣例反映台灣面試的真實情況。",
      whoFor:
        "統一面試標準的企業 HR、為學生做準備的大專院校與訓練機構，以及準備頂尖企業面試的個人求職者。",
      features: [
        { title: "即時語音面試", desc: "次秒級語音互動，訓練節奏、清晰度與結構，而非只是打字。" },
        { title: "十項能力框架", desc: "評估領導、團隊合作、問題解決、溝通、應變等能力。" },
        { title: "防虛高評分", desc: "三層機制，讓淺薄或未完成的回答無法取得灌水分數。" },
        { title: "完整面試錄音", desc: "求職者與 AI 雙軌錄音——供自我複習與 HR 檢視。" },
        { title: "HR 自訂上傳", desc: "上傳職缺，Lyra 產出對應職位的題目與評分標準。" },
        { title: "情緒安全機制", desc: "偵測挫折並提醒 HR。AI 從不爭辯——以人為本設計。" },
      ],
    },
  },
  {
    slug: "edusense-ai",
    name: "EduSense AI",
    zhName: "教育智慧平台 · Learning Intelligence",
    pillarTag: "發 · Talent",
    visual: "edu",
    live: true,
    en: {
      tagline: "Understand how students learn—not just whether they passed.",
      stats: [
        "9-stage processing pipeline",
        "Per-institution data isolation",
        "10-turn conversation memory",
        "Traditional Chinese native",
      ],
      description:
        "EduSense AI ingests educational video and recorded classes and turns them into a structured intelligence layer for students, teachers, and administrators. On top of the pipeline sits real insight: it classifies which students are thriving and which need urgent support, surfaces the exact knowledge gaps a class shares, and predicts dropout risk early enough to do something about it.",
      whoFor:
        "Universities, vocational schools, cram schools, and corporate training departments that need to understand how students are learning—not just whether they passed.",
      features: [
        { title: "Smart chaptering", desc: "Automatically splits class video into natural, topic-based chapters." },
        { title: "Auto notes & Q&A bank", desc: "Generates concise lecture notes and review questions from class content." },
        { title: "AI teaching assistant", desc: "Answers from the teacher's real class content, with video timestamps." },
        { title: "Student classification", desc: "Sorts students into learning-well, needs-attention, or needs-urgent-support." },
        { title: "Knowledge gap dashboard", desc: "Shows unmastered points and repeatedly-asked topics so teachers can adjust." },
        { title: "Dropout prediction", desc: "Login frequency and interaction depth flag at-risk students early." },
      ],
    },
    zh: {
      tagline: "理解學員「如何學」，而不只是「是否通過」。",
      stats: [
        "九階段處理管線",
        "機構資料獨立隔離",
        "10 輪對話記憶",
        "繁體中文原生",
      ],
      description:
        "EduSense AI 收錄教學影片與課堂錄影，轉化為供學生、老師與管理者使用的結構化智慧層。管線之上是真正的洞察：分辨哪些學員表現良好、哪些需要緊急協助，呈現全班共同的知識缺口，並及早預測流失風險，讓你來得及行動。",
      whoFor:
        "需要理解學員「如何學」、而不只是「是否通過」的大專院校、職訓學校、補習班與企業內訓單位。",
      features: [
        { title: "影片智慧分章", desc: "自動將課堂影片依主題切分成自然的章節。" },
        { title: "自動筆記與題庫", desc: "從課程內容生成精要筆記與複習題庫。" },
        { title: "AI 助教", desc: "依老師的真實課程內容作答，並附上影片時間戳。" },
        { title: "學員狀況分級", desc: "將學員分為學習良好、需要關注或需要緊急協助。" },
        { title: "知識缺口儀表板", desc: "呈現未掌握的知識點與重複詢問的主題，供老師調整。" },
        { title: "流失預測", desc: "以登入頻率與互動深度，提早標記高風險學員。" },
      ],
    },
  },
  {
    slug: "ai-customer-assistant",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    pillarTag: "銷 · Service",
    visual: "chat",
    live: true,
    en: {
      tagline: "24/7 Traditional-Chinese customer service.",
      stats: [
        "70%+ automation rate, production-verified",
        "0.5-sec first-token response",
        "20-turn conversation memory",
        "Escalates below 0.75 confidence",
      ],
      description:
        "A 24/7 customer service assistant built for Traditional Chinese from the ground up—not translated from Simplified. It answers instantly, remembers the whole conversation, and knows when it's unsure: below a confidence threshold it hands off to a human. Your team manages the knowledge base in a spreadsheet, so there's no IT queue and no redeployment when content changes.",
      whoFor:
        "Taiwan retail, service, hospitality, and professional-services businesses whose staff currently spend 3+ hours a day answering the same website enquiries.",
      features: [
        { title: "24/7 繁中 chatbot", desc: "Built for Traditional Chinese from the ground up—not converted from Simplified." },
        { title: "0.5-second first response", desc: "SSE streaming delivers the first word in half a second—conversations feel instant." },
        { title: "Excel-managed knowledge", desc: "Your team updates content in a spreadsheet. No IT, no developer queue." },
        { title: "Confidence-gated escalation", desc: "Below 0.75 confidence, the system automatically escalates to a human." },
        { title: "20-turn memory", desc: "Follow-up questions get coherent, connected answers across the whole chat." },
        { title: "Weekly gap report", desc: "Flags what the AI couldn't answer well and tells you what content to add." },
      ],
    },
    zh: {
      tagline: "24 小時繁體中文客服。",
      stats: [
        "70%+ 自動化率，實證數據",
        "0.5 秒首字回應",
        "20 輪對話記憶",
        "信心度低於 0.75 自動轉真人",
      ],
      description:
        "24 小時繁體中文原生客服助理——並非由簡中翻譯而來。它即時回應、記得整段對話，也知道自己何時不確定：信心度低於門檻即自動轉接真人。你的團隊以試算表管理知識庫，內容變更不必等 IT、也不需重新部署。",
      whoFor:
        "員工每日花 3 小時以上回答相同網站詢問的台灣零售、服務、餐旅與專業服務業。",
      features: [
        { title: "24/7 繁中客服", desc: "繁體中文原生打造，並非由簡中轉換而來。" },
        { title: "0.5 秒首字回應", desc: "SSE 串流讓首字在半秒內出現，對話即時流暢。" },
        { title: "Excel 知識庫", desc: "團隊用試算表更新內容，不需 IT、不需重新部署。" },
        { title: "信心度轉真人", desc: "信心度低於 0.75 時，系統自動轉接真人。" },
        { title: "20 輪對話記憶", desc: "追問也能在整段對話中得到連貫、連結的回答。" },
        { title: "每週缺口報告", desc: "標記 AI 答不好的問題，並告訴你該補充哪些內容。" },
      ],
    },
  },
  {
    slug: "pulse",
    name: "Pulse · 脈動",
    zhName: "AI 智慧行銷 · Marketing Intelligence",
    pillarTag: "銷 · Marketing",
    visual: "marketing",
    live: true,
    en: {
      tagline: "Run Meta & Google ads from LINE.",
      stats: [
        "Command response within seconds",
        "24/7 budget protection",
        "One report, auto-sent Monday 8am",
        "Meta + Google Ads",
      ],
      description:
        "Pulse puts marketing control inside LINE: send a message and it executes in Meta or Google Ads within seconds. It watches your budgets around the clock and pauses campaigns when CPC spikes, warns you about creative fatigue before ROAS drops, and consolidates every channel into one report that lands automatically every Monday morning—so you stop babysitting dashboards.",
      whoFor:
        "Taiwan marketing managers and business owners running Meta and Google campaigns who currently check dashboards manually and miss overnight anomalies.",
      features: [
        { title: "LINE command control", desc: "Send a LINE message and Pulse executes in Meta or Google Ads within seconds." },
        { title: "24/7 budget protection", desc: "CPC spikes above your threshold trigger an automatic campaign pause." },
        { title: "Creative fatigue alerts", desc: "Flags fatigue before ROAS drops and triggers variant testing automatically." },
        { title: "Competitor intelligence", desc: "A weekly read on competitor spend trends and messaging shifts." },
        { title: "Taiwan-native content", desc: "Ad copy tuned for Traditional Chinese—zero Mainland slang." },
        { title: "One Monday report", desc: "GA, Meta, Google, CRM, and email in one report, auto-sent Monday 8am." },
      ],
    },
    zh: {
      tagline: "從 LINE 操控 Meta 與 Google 廣告。",
      stats: [
        "指令數秒內回應",
        "24/7 預算防護",
        "一份報告，週一 8 點自動寄送",
        "Meta + Google Ads",
      ],
      description:
        "Pulse 把行銷操控放進 LINE：發一則訊息，幾秒內就在 Meta 或 Google Ads 執行。它全天候監看預算，CPC 飆高時暫停廣告，在 ROAS 下滑前提醒素材疲乏，並把每個通路整合成一份報告，每週一早上自動送達——讓你不再緊盯儀表板。",
      whoFor:
        "手動查看儀表板、常錯過深夜異常，經營 Meta 與 Google 廣告的台灣行銷主管與企業主。",
      features: [
        { title: "LINE 指令操控", desc: "發一則 LINE 訊息，Pulse 幾秒內就在 Meta 或 Google Ads 執行。" },
        { title: "24/7 預算防護", desc: "CPC 超過門檻即自動暫停廣告。" },
        { title: "素材疲乏預警", desc: "在 ROAS 下滑前預警，並自動啟動變體測試。" },
        { title: "競品情報", desc: "每週掌握競品的投放趨勢與訊息變化。" },
        { title: "台灣在地內容", desc: "廣告文案為繁體中文調校，零中國大陸用語。" },
        { title: "週一整合報告", desc: "GA、Meta、Google、CRM 與 Email 整合，週一 8 點自動寄送。" },
      ],
    },
  },
  {
    slug: "ai-knowledge-assistant",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    pillarTag: "跨 · Cross-pillar",
    visual: "knowledge",
    live: true,
    en: {
      tagline: "Every answer cited to the exact SOP page.",
      stats: [
        "Word & PDF, visuals indexed too",
        "Role-based access control",
        "Gap alert after 3+ low-confidence hits",
        "Weekly coverage score",
      ],
      description:
        "The shared internal knowledge layer every product draws on. Employees ask the way they'd ask a colleague and get answers straight from your SOPs—with the exact document, section, and page cited, auditable in one click. New hires self-serve from day one instead of interrupting seniors, and a weekly coverage score tells you how much of what your team asks the knowledge base can confidently answer.",
      whoFor:
        "Companies where employees keep interrupting managers, where critical knowledge lives only in senior staff's heads, and where onboarding drags on for weeks.",
      features: [
        { title: "Natural-language Q&A", desc: "Employees ask the way they'd ask a colleague—answers come from your SOPs." },
        { title: "Source-cited answers", desc: "Every answer cites the exact document, section, and page—auditable in one click." },
        { title: "Word & PDF ingestion", desc: "Upload manuals and policies; diagrams and flowcharts are indexed alongside text." },
        { title: "Role-based access", desc: "HR sees HR docs, the factory sees factory SOPs—sensitive policies stay protected." },
        { title: "Onboarding mode", desc: "New hires walk through real company SOPs from day one, self-service." },
        { title: "Coverage score", desc: "A weekly score shows what share of employee questions the base can answer." },
      ],
    },
    zh: {
      tagline: "每個答案都引用到 SOP 的確切頁碼。",
      stats: [
        "Word 與 PDF，圖表也一併索引",
        "角色權限管控",
        "3 次以上低信心即通報缺口",
        "每週知識覆蓋率評分",
      ],
      description:
        "每項產品共用的內部知識層。員工像問同事一樣提問，直接從你的 SOP 得到答案——並附上確切的文件、章節與頁碼，一鍵即可稽核。新人第一天起就能自助查詢，不必打斷資深同事；每週覆蓋率評分則告訴你，知識庫能有把握回答團隊多少提問。",
      whoFor:
        "員工不斷打斷主管詢問、關鍵知識只存在資深員工腦中、新人到職要花數週的企業。",
      features: [
        { title: "自然語言問答", desc: "員工像問同事一樣提問——答案來自你的 SOP。" },
        { title: "附出處作答", desc: "每個答案引用確切文件、章節與頁碼，一鍵即可稽核。" },
        { title: "Word 與 PDF 接入", desc: "上傳手冊與規範，圖表與流程圖與文字一併索引。" },
        { title: "角色權限", desc: "人資看人資文件、廠務看廠務 SOP——敏感政策受保護。" },
        { title: "到職模式", desc: "新人第一天起透過真實公司 SOP 自助上手。" },
        { title: "覆蓋率評分", desc: "每週評分顯示知識庫能回答多少比例的員工提問。" },
      ],
    },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function copy(p: Product, locale: Locale): ProductCopy {
  return locale === "zh" ? p.zh : p.en;
}
