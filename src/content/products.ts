import type { Locale } from "@/i18n";

export interface ProductCopy {
  tagline: string;
  stats: string[];
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  zhName: string;
  pillarTag: string;
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
    live: true,
    en: {
      tagline: "AI-native HR built for Taiwan's newest labor rules.",
      stats: [
        "Leave requests: 5–10 min → under 30 sec",
        "HR admin: 20 hrs → under 3 hrs/week",
        "100% auto-checked against 2026 amendments",
      ],
      description:
        "Atlas EIP is the AI-native HR system for Taiwan SMEs (20–500 employees) still running leave, OT, and compliance through LINE, Excel, or legacy ERP. Employees file requests in plain language; every submission is auto-checked against current Taiwan labor regulations. A handbook conflict scanner flags clauses that break the rules, a subsidy hunter tracks eligibility, and a one-click labor-inspection report is generated the moment a notice arrives.",
    },
    zh: {
      tagline: "為台灣最新勞動法規打造的 AI 原生人資系統。",
      stats: [
        "請假申請：5–10 分 → 30 秒內",
        "人資行政：每週 20 小時 → 3 小時內",
        "100% 自動比對 2026 年新制",
      ],
      description:
        "Atlas EIP 是為台灣中小企業（20–500 人）打造的 AI 原生人資系統，取代靠 LINE、Excel 或舊 ERP 處理請假、加班與合規的方式。員工用自然語言提出申請，系統自動比對現行勞動法規；員工手冊衝突掃描標記違規條款，補助獵手追蹤申請資格，勞檢通知一到即可一鍵產出完整合規報告。",
    },
  },
  {
    slug: "lyra-ai",
    name: "LyraAI",
    zhName: "語音面試教練 · Voice Interview Coach",
    pillarTag: "發 · Talent",
    live: true,
    en: {
      tagline: "Real voice. Honest scores. Built for Taiwan.",
      stats: [
        "10-competency evaluation framework",
        "Bilingual 繁中 + English, Traditional-Chinese native",
        "3-layer anti-inflation scoring",
      ],
      description:
        "LyraAI is a real-time voice interview coach for three audiences: corporate HR standardizing interviews, universities and bootcamps preparing students, and individual candidates. Sub-second voice exchange trains pacing, clarity, and structure; a ten-competency framework scores each session; and a three-layer anti-inflation mechanism means shallow or incomplete answers can't earn inflated scores. Full sessions are recorded for candidate review and HR transparency.",
    },
    zh: {
      tagline: "真實語音 · 誠實評分 · 為台灣打造。",
      stats: [
        "十項能力評估框架",
        "雙語 繁中 + 英文，繁體中文原生",
        "三層防虛高評分機制",
      ],
      description:
        "LyraAI 是即時語音面試教練，服務三類使用者：統一面試標準的企業 HR、為學生求職做準備的大專院校與訓練機構，以及個人求職者。次秒級語音互動訓練節奏、清晰度與結構；十項能力框架為每場面試評分；三層防虛高機制讓淺薄或未完成的回答無法取得灌水分數。完整面試全程錄音，供求職者複習與 HR 檢視。",
    },
  },
  {
    slug: "edusense-ai",
    name: "EduSense AI",
    zhName: "教育智慧平台 · Learning Intelligence",
    pillarTag: "發 · Talent",
    live: true,
    en: {
      tagline: "Understand how students learn—not just whether they passed.",
      stats: [
        "Turns class video into a structured intelligence layer",
        "Flags at-risk students & predicts dropout",
        "Per-institution isolation · 9-stage pipeline",
      ],
      description:
        "EduSense AI ingests educational video and recorded classes and turns them into a structured intelligence layer for students, teachers, and administrators. It generates chapters, lecture notes, and review Q&A automatically, then classifies students into learning-well / needs-attention / needs-urgent-support, surfaces knowledge gaps on a dashboard, and predicts dropout risk from login and interaction patterns—each institution fully isolated in its own namespace.",
    },
    zh: {
      tagline: "理解學員「如何學」，而不只是「是否通過」。",
      stats: [
        "把課堂影片變成結構化智慧層",
        "標記高風險學員並預測流失",
        "機構獨立隔離 · 九階段管線",
      ],
      description:
        "EduSense AI 收錄教學影片與課堂錄影，轉化為供學生、老師與管理者使用的結構化智慧層。自動生成分章、講義筆記與複習題庫，並將學員分級為「學習良好／需要關注／需要緊急協助」，在儀表板上呈現知識缺口，並依登入與互動模式預測流失風險——每個機構皆在獨立命名空間中隔離。",
    },
  },
  {
    slug: "ai-customer-assistant",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    pillarTag: "銷 · Service",
    live: true,
    en: {
      tagline: "24/7 Traditional-Chinese customer service.",
      stats: [
        "70%+ automation rate, production-verified",
        "0.5-sec first response · 20-turn memory",
        "Excel-managed knowledge base—no IT queue",
      ],
      description:
        "A 24/7 customer service assistant built for Traditional Chinese from the ground up. SSE streaming delivers the first token in half a second; conversations carry 20 turns of memory; and below a confidence threshold the system escalates automatically to a human. The client team manages the knowledge base in a spreadsheet—no IT, no redeployment—while a weekly gap report flags exactly what content to add.",
    },
    zh: {
      tagline: "24 小時繁體中文客服。",
      stats: [
        "70%+ 自動化率，實證數據",
        "0.5 秒首字回應 · 20 輪對話記憶",
        "Excel 管理知識庫——不必等 IT",
      ],
      description:
        "24 小時繁體中文原生客服助理。SSE 串流讓首字在半秒內出現，對話保有 20 輪記憶；當信心度低於門檻，系統自動轉接真人。客戶團隊以試算表管理知識庫——不需 IT、不需重新部署——每週知識缺口報告會明確指出應補充哪些內容。",
    },
  },
  {
    slug: "pulse",
    name: "Pulse · 脈動",
    zhName: "AI 智慧行銷 · Marketing Intelligence",
    pillarTag: "銷 · Marketing",
    live: true,
    en: {
      tagline: "Run Meta & Google ads from LINE.",
      stats: [
        "24/7 budget anomaly protection",
        "One consolidated report, auto-sent Monday 8am",
        "Competitor intelligence & creative-fatigue alerts",
      ],
      description:
        "Pulse puts marketing control in LINE: send a message and it executes in Meta or Google Ads within seconds. It watches budgets around the clock and pauses campaigns when CPC spikes, flags creative fatigue before ROAS drops, dedupes audiences against your CRM, and consolidates GA, Meta, Google, CRM, and email into a single report delivered automatically every Monday at 8am.",
    },
    zh: {
      tagline: "從 LINE 操控 Meta 與 Google 廣告。",
      stats: [
        "24/7 預算異常防護",
        "一份整合報告，週一早上 8 點自動寄送",
        "競品情報與素材疲乏預警",
      ],
      description:
        "Pulse 把行銷操控放進 LINE：發一則訊息，幾秒內就在 Meta 或 Google Ads 執行。它全天候監看預算，CPC 飆高時自動暫停廣告，在 ROAS 下滑前預警素材疲乏，依 CRM 去重受眾，並把 GA、Meta、Google、CRM 與 Email 整合成一份報告，每週一早上 8 點自動送達。",
    },
  },
  {
    slug: "ai-knowledge-assistant",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    pillarTag: "跨 · Cross-pillar",
    live: true,
    en: {
      tagline: "Every answer cited to the exact SOP page.",
      stats: [
        "Ingests Word & PDF, diagrams indexed too",
        "Role-based access: HR, factory, admin",
        "Flags knowledge gaps from repeated questions",
      ],
      description:
        "The shared internal knowledge layer every product draws on. Employees ask the way they'd ask a colleague and get answers from your SOPs with the exact document, section, and page cited. Role-based access keeps sensitive policies with authorized roles, an onboarding mode walks new hires through real company SOPs, and a weekly coverage score shows how many employee questions the base can confidently answer.",
    },
    zh: {
      tagline: "每個答案都引用到 SOP 的確切頁碼。",
      stats: [
        "接入 Word 與 PDF，圖表也一併索引",
        "角色權限：人資、廠務、管理",
        "從重複問題中標記知識缺口",
      ],
      description:
        "每項產品共用的內部知識層。員工像問同事一樣提問，從公司 SOP 得到答案，並附上確切的文件、章節與頁碼。角色權限讓敏感政策只留給授權角色，新進員工到職模式帶新人走過真實的公司 SOP，每週覆蓋率評分則顯示知識庫能有把握回答多少員工問題。",
    },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function copy(p: Product, locale: Locale): ProductCopy {
  return locale === "zh" ? p.zh : p.en;
}
