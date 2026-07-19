#!/usr/bin/env bash
# PrimeStride — custom pages: Atlas EIP, LyraAI, Pulse, AI Knowledge Assistant (safe to re-run)
# Usage: drop this file in the repo root, then:  bash add-remaining-product-pages.sh
set -e
cd "$(dirname "$0")"

dl() { # dl <url> <out> — retry up to 5 times
  for i in 1 2 3 4 5; do
    if curl -fsSL --connect-timeout 20 "$1" -o "$2"; then return 0; fi
    echo "  retry $i for $(basename "$2")"; sleep 2
  done
  echo "FAILED to download $2 after 5 tries"; exit 1
}

echo "→ downloading visuals to public/visuals/"
mkdir -p public/visuals
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F877a0a103874405674ec27918767e3af4fc62352ef8421b3f170ba50f3593894?filename=atlas-flow-wide.png&sig=avrbk2APIdS2_7pFEhjmZUJ9nwy0I5aYw680hMsM2m0=&t=o" public/visuals/atlas-flow-wide.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F9b05cdf3e52d07e72eb70317a8353c8572309230774d95ad30c46dd168868912?filename=lyra-flow-wide.png&sig=sLKJgXO2ARDYINrvnvkxraMRzNufjQ7ZymSPhYoNh8E=&t=o" public/visuals/lyra-flow-wide.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F4fac36db47108b202ec9bb1d5c0172e81a2d84851f69045b4354a4f832209781?filename=pulse-flow-wide.png&sig=_C9DLXT3sNpZhPAvMVhAqn7iEmvYJ2upOYpq3ZIY-xA=&t=o" public/visuals/pulse-flow-wide.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F1b7530bac25a7cf94091cc3a8cb5c8439dae7ab5e1ade1e6f28f10ff0d0973e5?filename=knowledge-flow-wide.png&sig=AyIHP8Hh9epmb73SitnVrfNORdfqs6ESDX2ra8BqUGA=&t=o" public/visuals/knowledge-flow-wide.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fb7af9d40d4d59d2def88bd354f55c1b092227f9f6d7a6c94975ad80a758fd6b7?filename=product-atlas-eip.png&sig=OkhSsJDaiEounBH3O2OTpW63K65PU4Hnwd8lYjQUwZQ=&t=o" public/visuals/product-atlas-eip.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F687a4ef18b821c89bb58504359ab1836d575105664d50772ab4c6d2133af9e09?filename=product-lyraai.png&sig=ci5anTu5kEyd9j_jeXJ9gDWP6tzvU3w0RoXzuEFqbEg=&t=o" public/visuals/product-lyraai.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fd3d7a540b9550b093d24bbdc20b0b5b982784319586f9f41f6f3de916df66746?filename=product-pulse.png&sig=o-j5mmNyIWeNDeGoLogYnnxDqd8gd1YoVmKgaSeu94U=&t=o" public/visuals/product-pulse.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fe8acf7d9ccb39331ddcf5ce77433dfaeae07fe1e480ca30905249738d40cdd6f?filename=product-knowledge-ai.png&sig=SYXHuQU0tQRPFQB8DqIspfmmnp8SgG7Rz3u7S46d15g=&t=o" public/visuals/product-knowledge-ai.png
echo "  8 images saved"

echo "→ creating Atlas EIP page"
mkdir -p "src/app/[locale]/products/atlas-eip"
cat > "src/app/[locale]/products/atlas-eip/page.tsx" <<'TSX'
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Atlas EIP · 企業智慧平台 · PrimeStride AI",
  description:
    "AI-native HR built for Taiwan's newest labor rules: natural-language leave & OT, a compliance engine checked against the 2026 amendments, handbook conflict scanning, and one-click inspection reports.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "人 · HR",
    live: "LIVE",
    name: "Atlas EIP",
    zhName: "企業智慧平台 · Enterprise Intelligence",
    tagline: "AI-native HR built for Taiwan's newest labor rules.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "Atlas EIP is the AI-native HR system for Taiwan SMEs still running leave, overtime, and compliance through LINE, Excel, or legacy ERP.",
    ov2: "Employees file requests in plain language and every submission is auto-checked against current Taiwan labor regulations — compliance stops being a manual, error-prone scramble and becomes something that just happens in the background.",
    chips: ["5–10 min → under 30 sec per request", "HR admin 20 → under 3 hrs/week", "100% checked vs 2026 amendments", "Live in 7 days"],
    flowEyebrow: "How it works",
    flowTitle: "Every request in. Compliance out — automatically.",
    flowBody: "Each submission flows through the compliance engine and is checked against current labor rules, including the 2026 amendments. What passes routes for approval; what doesn't gets flagged with the exact regulation — before it becomes a fine.",
    demoEyebrow: "See it in action",
    demoTitle: "What employees file — and what HR sees.",
    chatTitle: "Atlas 助手",
    chatSub: "compliance engine · on",
    st1: "I want to take one day of annual leave next Wednesday.",
    ai1: "Leave request created: Wed 3/18, 1 day annual leave. Balance after: 7 days. Compliant with Labor Standards Act §38 — sent to your manager for approval.",
    ai1meta: "auto-checked · compliant",
    st2: "Also — I plan to work overtime 4 days in a row next month.",
    ai2: "That would exceed the 46-hour monthly OT cap (LSA §32) and needs labor-management approval first. I've routed this to HR with your request history attached.",
    ai2meta: "compliance flag · §32",
    chatCaption: "Employee side · plain-language requests, every one auto-checked",
    scanTitle: "Handbook conflict scan",
    scanSub: "2026 AMENDMENTS",
    stats: [
      { n: "128", label: "Clauses scanned" },
      { n: "3", label: "Conflicts found" },
      { n: "2", label: "Update suggested" },
      { n: "100%", label: "vs 2026 rules" },
    ],
    gapHead: "CONFLICTS TO FIX BEFORE AN INSPECTION DOES",
    gaps: [
      { q: "§7.2 Annual-leave days below 2026 minimum", n: "conflict", fix: "→ Suggested rewrite ready · LSA §38" },
      { q: "§4.1 Probation pay below new minimum wage", n: "conflict", fix: "→ Suggested rewrite ready · 2026 schedule" },
      { q: "§9.3 OT notice period wording unclear", n: "review", fix: "→ Flagged for HR review" },
    ],
    scanCaption: "HR side · your handbook, audited against the newest rules",
    featEyebrow: "Key features",
    featTitle: "Compliance that happens in the background.",
    feats: [
      { t: "Natural-language leave & OT", d: "Employees file requests in plain language; Atlas parses intent and routes approvals automatically." },
      { t: "Compliance engine", d: "Every submission is auto-checked against current Taiwan labor rules, including the 2026 amendments." },
      { t: "Handbook conflict scanner", d: "Upload your handbook and Atlas flags every clause that conflicts with the regulations." },
      { t: "Government subsidy hunter", d: "Tracks eligibility for SBIR, parental-leave, flexible-work, and minimum-wage-offset grants." },
      { t: "One-click inspection report", d: "A labor-inspection notice arrives and a full, traceable compliance report is generated instantly." },
      { t: "Built-in knowledge assistant", d: "Policy questions answered from your own documents, cited to the exact handbook section." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "HR managers and general managers at Taiwan SMEs (20–500 staff) still handling leave, OT, and compliance through LINE, Excel, or a legacy ERP.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "人 · 人資",
    live: "LIVE",
    name: "Atlas EIP",
    zhName: "企業智慧平台 · Enterprise Intelligence",
    tagline: "為台灣最新勞動法規打造的 AI 原生人資系統。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "Atlas EIP 是為台灣中小企業打造的 AI 原生人資系統，取代仍以 LINE、Excel 或舊 ERP 處理請假、加班與合規的方式。",
    ov2: "員工用自然語言提出申請，每一筆都自動比對現行勞動法規——合規不再是容易出錯的人工作業，而是在背景自動完成的事。",
    chips: ["請假申請 5–10 分 → 30 秒內", "人資行政每週 20 → 3 小時內", "100% 比對 2026 年新制", "7 天上線"],
    flowEyebrow: "怎麼運作",
    flowTitle: "每筆申請進來，合規自動完成。",
    flowBody: "每筆申請都經過合規引擎，比對含 2026 年新制在內的現行勞動法規。通過的自動送簽；有問題的，在變成罰單之前，就附上確切法條標記出來。",
    demoEyebrow: "實際看一下",
    demoTitle: "員工送出的，和人資看到的。",
    chatTitle: "Atlas 助手",
    chatSub: "合規引擎 · 開啟",
    st1: "我下週三想請特休一天。",
    ai1: "已為您建立特休申請：3/18（三）1 天，特休餘額尚有 7 天，符合勞基法 §38。已送簽主管。",
    ai1meta: "已自動比對 · 合規",
    st2: "那我下個月想連續加班 4 天。",
    ai2: "這會超過單月加班 46 小時上限（勞基法 §32），需先經勞資會議同意。我已轉人資確認，並附上您的申請紀錄。",
    ai2meta: "合規警示 · §32",
    chatCaption: "員工端 · 自然語言申請，每筆自動比對法規",
    scanTitle: "員工手冊衝突掃描",
    scanSub: "2026 年新制",
    stats: [
      { n: "128", label: "條款掃描" },
      { n: "3", label: "發現衝突" },
      { n: "2", label: "建議更新" },
      { n: "100%", label: "比對新制" },
    ],
    gapHead: "在勞檢發現之前，先修好的衝突",
    gaps: [
      { q: "§7.2 特休天數低於 2026 新制下限", n: "衝突", fix: "→ 修正建議已備妥 · 勞基法 §38" },
      { q: "§4.1 試用期薪資低於新基本工資", n: "衝突", fix: "→ 修正建議已備妥 · 2026 公告" },
      { q: "§9.3 加班通知期限文字不明確", n: "待確認", fix: "→ 已標記請人資複核" },
    ],
    scanCaption: "人資端 · 你的手冊，對最新法規做完健檢",
    featEyebrow: "核心功能",
    featTitle: "合規，在背景自動完成。",
    feats: [
      { t: "自然語言請假與加班", d: "員工用自然語言提出申請，Atlas 判讀意圖並自動送簽。" },
      { t: "勞動法規合規引擎", d: "每筆申請自動比對現行台灣勞動法規，涵蓋 2026 年新制。" },
      { t: "員工手冊衝突掃描", d: "上傳員工手冊，Atlas 標出每一條與法規衝突的條文。" },
      { t: "政府補助獵人", d: "追蹤 SBIR、育嬰留停、彈性工時與基本工資補貼等資格。" },
      { t: "一鍵勞檢報告", d: "收到勞檢通知時，立即產出完整、可追溯的合規報告。" },
      { t: "內建知識助理", d: "政策問題直接從你的文件回答，引用到確切的手冊章節。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "仍以 LINE、Excel 或舊 ERP 處理請假、加班與合規的台灣中小企業（20–500 人）人資主管與總經理。",
  },
};

export default function AtlasEipPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main>
      <section className="zg-hero">
        <div className="wrap zg-hero-grid">
          <div>
            <Link href={`${base}/products`} className="pd-back">{t.back}</Link>
            <div className="pd-tags" style={{ marginTop: 14 }}>
              <span className="pill-tag">{t.pillar}</span>
              <span className="badge-live">{t.live}</span>
            </div>
            <h1>{t.name}</h1>
            <div className="zh" style={{ fontSize: "1.15rem", color: "var(--iris)", fontWeight: 600, marginTop: 6 }}>{t.zhName}</div>
            <p className="lead" style={{ marginTop: 16 }}>{t.tagline}</p>
            <div className="hero-cta">
              <Link href={`${base}/contact?p=atlas-eip`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image src="/visuals/product-atlas-eip.png" alt="Atlas EIP — HR compliance shield" width={812} height={827} priority style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head" style={{ textAlign: "left", marginBottom: 22 }}>
            <span className="eyebrow" style={{ justifyContent: "flex-start" }}>{t.ovEyebrow}</span>
          </div>
          <div style={{ maxWidth: 780 }}>
            <p style={{ fontSize: "1.12rem", color: "var(--ink)", marginBottom: 14 }}>{t.ov1}</p>
            <p style={{ fontSize: "1.05rem", color: "var(--muted)" }}>{t.ov2}</p>
            <div className="edu-chips">{t.chips.map((c, i) => (<span className="edu-chip" key={i}>{c}</span>))}</div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="who-band" style={{ background: "linear-gradient(160deg,#f3f1ff,#fff)", color: "var(--ink)", border: "1px solid #d9d3ff" }}>
            <span className="eyebrow">{t.flowEyebrow}</span>
            <h2 style={{ color: "var(--ink)", fontSize: "clamp(1.7rem,3.2vw,2.4rem)", margin: "14px 0 12px" }}>{t.flowTitle}</h2>
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-plex)", fontWeight: 400, fontSize: "1.06rem" }}>{t.flowBody}</p>
            <div className="zg-hub-img">
              <Image src="/visuals/atlas-flow-wide.png" alt="Handbook clauses flowing into the compliance shield, emerging as verified checks" width={2048} height={1037} style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="demo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.demoEyebrow}</span>
            <h2>{t.demoTitle}</h2>
          </div>
          <div className="zg-demo-grid">
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.chatTitle}</span>
                  <span className="edu-panel-sub">{t.chatSub}</span>
                </div>
                <div className="edu-chat">
                  <div className="edu-msg st">{t.st1}</div>
                  <div className="edu-msg ai">{t.ai1}<span className="meta">{t.ai1meta}</span></div>
                  <div className="edu-msg st">{t.st2}</div>
                  <div className="edu-msg ai">{t.ai2}<span className="meta esc">{t.ai2meta}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.scanTitle}</span>
                  <span className="edu-panel-sub">{t.scanSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="ca-stats">
                    {t.stats.map((s, i) => (<div className="ca-stat" key={i}><b>{s.n}</b><span>{s.label}</span></div>))}
                  </div>
                  <div className="ca-gaphead">{t.gapHead}</div>
                  {t.gaps.map((g, i) => (
                    <div className="ca-gap" key={i}>
                      <div className="ca-gap-q">{g.q}<span className="ca-n">{g.n}</span></div>
                      <div className="ca-gap-fix">{g.fix}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="zg-demo-cap">{t.scanCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.featEyebrow}</span>
            <h2>{t.featTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.feats.map((f, i) => (<div className="feat" key={i}><h3>{f.t}</h3><p>{f.d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=atlas-eip`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
TSX
echo "→ creating LyraAI page"
mkdir -p "src/app/[locale]/products/lyra-ai"
cat > "src/app/[locale]/products/lyra-ai/page.tsx" <<'TSX'
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "LyraAI · 語音面試教練 · PrimeStride AI",
  description:
    "A real-time voice interview coach: sub-second voice conversation, a 10-competency framework, three-layer anti-inflation scoring, and full session recording — built natively for Traditional Chinese.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "發 · Talent",
    live: "LIVE",
    name: "LyraAI",
    zhName: "語音面試教練 · Voice Interview Coach",
    tagline: "Real voice. Honest scores. Built for Taiwan.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "LyraAI is a real-time voice interview coach. Candidates hold a genuine sub-second voice conversation, training the pacing, clarity, and structure that actually matter in a room.",
    ov2: "Answers are scored across ten competencies by a system engineered to resist grade inflation — and it's built for Traditional Chinese from the ground up, so the phrasing and conventions reflect how interviews really run in Taiwan.",
    chips: ["10-competency framework", "Bilingual 繁中 + English", "3-layer anti-inflation scoring", "Full audio recorded"],
    flowEyebrow: "How it works",
    flowTitle: "A real conversation in. An honest scorecard out.",
    flowBody: "The candidate speaks; Lyra listens, probes, and follows up like a real interviewer. Every answer is then scored across ten competencies, with shallow or incomplete answers unable to earn inflated marks.",
    demoEyebrow: "See it in action",
    demoTitle: "What the candidate hears — and what HR sees.",
    chatTitle: "面試進行中 · Live session",
    chatSub: "VOICE · 00:12:34",
    lyra1: "Tell me about a time you led a team through a difficult situation.",
    cand1: "Uh… our project was falling behind, so I just had everyone work overtime to push it through…",
    coach1: "Good setup, but your specific actions and a measurable result are missing. Try STAR: name what you personally did, and how many days early you delivered.",
    coach1meta: "Structure 8/10 · Specifics 4/10 · anti-inflation: no points",
    chatCaption: "Candidate side · real voice, real coaching, mid-session",
    repTitle: "Session report",
    repSub: "CANDIDATE #1042",
    gapHead: "COMPETENCY SCORES · 10-FRAMEWORK",
    bars: [
      { name: "Communication", pct: 82, level: "ok" },
      { name: "Problem solving", pct: 74, level: "ok" },
      { name: "Adaptability", pct: 68, level: "ok" },
      { name: "Leadership", pct: 61, level: "warn" },
    ],
    stats: [
      { n: "12:34", label: "Session length" },
      { n: "23", label: "Filler words" },
      { n: "3", label: "Questions done" },
      { n: "✓", label: "Audio recorded" },
    ],
    repNote: "Leadership answer lacked concrete examples — under layer-3 anti-inflation rules, no inflated points were given.",
    repCaption: "HR side · comparable scores you can actually trust",
    featEyebrow: "Key features",
    featTitle: "Practice that transfers to the room.",
    feats: [
      { t: "Real-time voice interview", d: "Sub-second voice exchange trains pacing, clarity, and structure, not just what you'd type." },
      { t: "10-competency framework", d: "Scores leadership, teamwork, problem-solving, communication, adaptability, and more." },
      { t: "Anti-inflation scoring", d: "Three layers mean shallow or incomplete answers can't earn inflated scores." },
      { t: "Full session recording", d: "Candidate and AI tracks are both recorded, for self-review and HR transparency." },
      { t: "HR upload mode", d: "Upload a JD and Lyra generates role-specific questions and scoring rubrics." },
      { t: "Emotional safety", d: "Detects frustration and alerts HR. The AI never argues, human-in-the-loop by design." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Corporate HR teams standardizing their interviews, universities and bootcamps preparing students, and individual candidates prepping for top-tier interviews.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "發 · 人才",
    live: "LIVE",
    name: "LyraAI",
    zhName: "語音面試教練 · Voice Interview Coach",
    tagline: "真實語音 · 誠實評分 · 為台灣打造。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "LyraAI 是即時語音面試教練。求職者進行真正的次秒級語音對話，訓練在現場真正重要的節奏、清晰度與結構。",
    ov2: "回答由一套刻意抗分數膨脹的系統，就十項能力給予評分。它從底層為繁體中文打造，用語與慣例反映台灣面試的真實情況。",
    chips: ["十項能力評估框架", "雙語 繁中 + 英文", "三層防虛高評分", "全程錄音"],
    flowEyebrow: "怎麼運作",
    flowTitle: "真實對話進來，誠實的成績單出去。",
    flowBody: "求職者開口，Lyra 像真正的面試官一樣傾聽、追問。每個回答接著以十項能力評分——淺薄或未完成的回答，無法取得灌水的分數。",
    demoEyebrow: "實際看一下",
    demoTitle: "求職者聽到的，和 HR 看到的。",
    chatTitle: "面試進行中 · Live session",
    chatSub: "VOICE · 00:12:34",
    lyra1: "請談談你帶領團隊度過困難的一次經驗。",
    cand1: "呃…那時候專案延誤，我就叫大家加班把它趕完…",
    coach1: "有場景，但少了你的具體行動與量化結果。試試 STAR：說明『你』做了什麼，以及最後提前幾天交付。",
    coach1meta: "結構 8/10 · 具體性 4/10 · 防虛高：未加分",
    chatCaption: "求職者端 · 真語音、即時教練回饋",
    repTitle: "面試報告",
    repSub: "候選人 #1042",
    gapHead: "能力評分 · 十項框架",
    bars: [
      { name: "溝通表達", pct: 82, level: "ok" },
      { name: "問題解決", pct: 74, level: "ok" },
      { name: "應變能力", pct: 68, level: "ok" },
      { name: "領導力", pct: 61, level: "warn" },
    ],
    stats: [
      { n: "12:34", label: "面試時長" },
      { n: "23", label: "填充詞次數" },
      { n: "3", label: "完成題數" },
      { n: "✓", label: "雙軌錄音" },
    ],
    repNote: "領導力回答缺少具體事例——依第三層防虛高機制，未給予灌水分數。",
    repCaption: "HR 端 · 可比較、可信賴的分數",
    featEyebrow: "核心功能",
    featTitle: "練習，真正帶得進面試間。",
    feats: [
      { t: "即時語音面試", d: "次秒級語音互動，訓練節奏、清晰度與結構，而非只是打字。" },
      { t: "十項能力框架", d: "評估領導、團隊合作、問題解決、溝通、應變等能力。" },
      { t: "防虛高評分", d: "三層機制，讓淺薄或未完成的回答無法取得灌水分數。" },
      { t: "完整面試錄音", d: "求職者與 AI 雙軌錄音，供自我複習與 HR 檢視。" },
      { t: "HR 自訂上傳", d: "上傳職缺說明，Lyra 產生該職缺專屬的題目與評分規準。" },
      { t: "情緒安全", d: "偵測挫折並通知 HR。AI 不與人爭辯，全程有人在迴路中。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "統一面試標準的企業 HR、為學生做準備的大專院校與訓練機構，以及準備頂尖企業面試的個人求職者。",
  },
};

export default function LyraAiPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main>
      <section className="zg-hero">
        <div className="wrap zg-hero-grid">
          <div>
            <Link href={`${base}/products`} className="pd-back">{t.back}</Link>
            <div className="pd-tags" style={{ marginTop: 14 }}>
              <span className="pill-tag">{t.pillar}</span>
              <span className="badge-live">{t.live}</span>
            </div>
            <h1>{t.name}</h1>
            <div className="zh" style={{ fontSize: "1.15rem", color: "var(--iris)", fontWeight: 600, marginTop: 6 }}>{t.zhName}</div>
            <p className="lead" style={{ marginTop: 16 }}>{t.tagline}</p>
            <div className="hero-cta">
              <Link href={`${base}/contact?p=lyra-ai`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image src="/visuals/product-lyraai.png" alt="LyraAI — real-time voice interview coach" width={1091} height={738} priority style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head" style={{ textAlign: "left", marginBottom: 22 }}>
            <span className="eyebrow" style={{ justifyContent: "flex-start" }}>{t.ovEyebrow}</span>
          </div>
          <div style={{ maxWidth: 780 }}>
            <p style={{ fontSize: "1.12rem", color: "var(--ink)", marginBottom: 14 }}>{t.ov1}</p>
            <p style={{ fontSize: "1.05rem", color: "var(--muted)" }}>{t.ov2}</p>
            <div className="edu-chips">{t.chips.map((c, i) => (<span className="edu-chip" key={i}>{c}</span>))}</div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="who-band" style={{ background: "linear-gradient(160deg,#f3f1ff,#fff)", color: "var(--ink)", border: "1px solid #d9d3ff" }}>
            <span className="eyebrow">{t.flowEyebrow}</span>
            <h2 style={{ color: "var(--ink)", fontSize: "clamp(1.7rem,3.2vw,2.4rem)", margin: "14px 0 12px" }}>{t.flowTitle}</h2>
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-plex)", fontWeight: 400, fontSize: "1.06rem" }}>{t.flowBody}</p>
            <div className="zg-hub-img">
              <Image src="/visuals/lyra-flow-wide.png" alt="Voice waves flowing into the interview engine, emerging as an honest scorecard" width={2048} height={1037} style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="demo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.demoEyebrow}</span>
            <h2>{t.demoTitle}</h2>
          </div>
          <div className="zg-demo-grid">
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.chatTitle}</span>
                  <span className="edu-panel-sub">{t.chatSub}</span>
                </div>
                <div className="ly-wave" aria-hidden="true">
                  {[38,62,45,80,55,92,70,48,88,60,74,42,66,84,52,72,46,90,58,40,68,82,50,76].map((h, i) => (<i key={i} style={{ height: `${h}%` }}></i>))}
                </div>
                <div className="edu-chat">
                  <div className="edu-msg ai">{t.lyra1}</div>
                  <div className="edu-msg st">{t.cand1}</div>
                  <div className="edu-msg ai">{t.coach1}<span className="meta esc">{t.coach1meta}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.repTitle}</span>
                  <span className="edu-panel-sub">{t.repSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="edu-gaphead">{t.gapHead}</div>
                  {t.bars.map((g, i) => (
                    <div className="gap-row" key={i}>
                      <span className="gap-name">{g.name}</span>
                      <span className="gap-pct">{g.pct}</span>
                      <div className="gap-bar"><div className={`gap-fill ${g.level}`} style={{ width: `${g.pct}%` }}></div></div>
                    </div>
                  ))}
                  <div className="ca-stats">
                    {t.stats.map((s, i) => (<div className="ca-stat" key={i}><b>{s.n}</b><span>{s.label}</span></div>))}
                  </div>
                  <div className="edu-gapnote">{t.repNote}</div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.repCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.featEyebrow}</span>
            <h2>{t.featTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.feats.map((f, i) => (<div className="feat" key={i}><h3>{f.t}</h3><p>{f.d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=lyra-ai`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
TSX
echo "→ creating Pulse page"
mkdir -p "src/app/[locale]/products/pulse"
cat > "src/app/[locale]/products/pulse/page.tsx" <<'TSX'
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Pulse · 脈動 · AI 智慧行銷 · PrimeStride AI",
  description:
    "Run Meta & Google ads from LINE: commands execute in seconds, 24/7 budget protection, creative-fatigue alerts, competitor intelligence, and one consolidated report every Monday morning.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "銷 · Marketing",
    live: "LIVE",
    name: "Pulse · 脈動",
    zhName: "AI 智慧行銷 · Marketing Intelligence",
    tagline: "Run Meta & Google ads from LINE.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "Pulse puts marketing control inside LINE: send a message and it executes in Meta or Google Ads within seconds.",
    ov2: "It watches your budgets around the clock and pauses campaigns when CPC spikes, warns you about creative fatigue before ROAS drops, and consolidates every channel into one report that lands automatically every Monday morning — so you stop babysitting dashboards.",
    chips: ["Commands execute in seconds", "24/7 budget protection", "One report, Monday 8am", "Meta + Google Ads"],
    flowEyebrow: "How it works",
    flowTitle: "Every channel in. One pulse out.",
    flowBody: "Meta, Google, GA, CRM and email flow into one watchful hub. You talk to it in LINE like a colleague — it executes, guards the budget while you sleep, and tells you what matters before it costs you.",
    demoEyebrow: "