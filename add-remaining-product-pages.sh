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
    demoEyebrow: "See it in action",
    demoTitle: "What you send — and what lands Monday 8am.",
    chatTitle: "Pulse 脈動",
    chatSub: "online · watching 4 campaigns",
    cust1: "Pause anything with CPC over NT$8 yesterday.",
    ai1: "Done — paused 2 ad sets: Summer-B and Remarketing-3. Estimated NT$1,400 saved today.",
    ai1meta: "executed in 3.2s",
    ai2: "⚠ Creative fatigue: ad A-17 frequency hit 4.8 and ROAS has slid for 3 days. I've started 3 variant tests automatically.",
    cust2: "Got it. And the report on Monday?",
    ai3: "Already scheduled — lands 08:00 sharp.",
    chatCaption: "Your side · marketing control, from a LINE chat",
    repTitle: "Monday report",
    repSub: "AUTO-SENT · 08:00",
    gapHead: "LAST WEEK ACROSS EVERY CHANNEL",
    rows: [
      { k: "Meta Ads", v: "ROAS 3.2", d: "spend NT$48,200" },
      { k: "Google Ads", v: "CPC NT$6.4", d: "2,180 clicks" },
      { k: "GA", v: "412 conversions", d: "+18% WoW" },
      { k: "Email / CRM", v: "31% open rate", d: "96 new leads" },
    ],
    repNote: "Top insight: Remarketing-3 fatigued — budget shifted to Summer-A (+22% ROAS after change).",
    repCaption: "Your inbox · one report instead of five dashboards",
    featEyebrow: "Key features",
    featTitle: "Stop babysitting dashboards.",
    feats: [
      { t: "LINE command control", d: "Send a LINE message and Pulse executes in Meta or Google Ads within seconds." },
      { t: "24/7 budget protection", d: "CPC spikes above your threshold trigger an automatic campaign pause." },
      { t: "Creative fatigue alerts", d: "Flags fatigue before ROAS drops and triggers variant testing automatically." },
      { t: "Competitor intelligence", d: "A weekly read on competitor spend trends and messaging shifts." },
      { t: "Taiwan-native content", d: "Ad copy tuned for Traditional Chinese, zero Mainland slang." },
      { t: "One Monday report", d: "GA, Meta, Google, CRM, and email in one report, auto-sent Monday 8am." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Taiwan marketing managers and business owners running Meta and Google campaigns who currently check dashboards manually and miss overnight anomalies.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "銷 · 行銷",
    live: "LIVE",
    name: "Pulse · 脈動",
    zhName: "AI 智慧行銷 · Marketing Intelligence",
    tagline: "從 LINE 操控 Meta 與 Google 廣告。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "Pulse 把行銷操控放進 LINE：發一則訊息，幾秒內就在 Meta 或 Google Ads 執行。",
    ov2: "它全天候監看預算，CPC 飆高時暫停廣告，在 ROAS 下滑前提醒素材疲乏，並把每個通路整合成一份報告，每週一早上自動送達——讓你不再緊盯儀表板。",
    chips: ["指令數秒內執行", "24/7 預算防護", "週一 8 點一份報告", "Meta + Google Ads"],
    flowEyebrow: "怎麼運作",
    flowTitle: "所有通路進來，一個脈動出去。",
    flowBody: "Meta、Google、GA、CRM 與 Email 匯入同一個警戒中的中樞。你像跟同事一樣在 LINE 吩咐它——它執行指令、在你睡著時守住預算，並在事情花到你錢之前告訴你。",
    demoEyebrow: "實際看一下",
    demoTitle: "你發出的指令，和週一早上收到的報告。",
    chatTitle: "Pulse 脈動",
    chatSub: "online · 監看 4 個廣告活動",
    cust1: "幫我暫停昨天 CPC 超過 8 元的廣告。",
    ai1: "完成——已暫停 2 個廣告組合：夏季促銷-B、再行銷-3。今日預估省下 NT$1,400。",
    ai1meta: "3.2 秒執行",
    ai2: "⚠ 素材疲乏：廣告 A-17 頻率達 4.8，ROAS 連續 3 天下滑。已自動啟動 3 個變體測試。",
    cust2: "收到。週一的報告記得給我。",
    ai3: "已排程——08:00 準時寄出。",
    chatCaption: "你的 LINE · 用聊天操控行銷",
    repTitle: "週一整合報告",
    repSub: "自動寄送 · 08:00",
    gapHead: "上週全通路一覽",
    rows: [
      { k: "Meta Ads", v: "ROAS 3.2", d: "花費 NT$48,200" },
      { k: "Google Ads", v: "CPC NT$6.4", d: "2,180 次點擊" },
      { k: "GA", v: "412 次轉換", d: "週增 +18%" },
      { k: "Email / CRM", v: "開信率 31%", d: "96 筆新名單" },
    ],
    repNote: "本週重點：再行銷-3 素材疲乏——預算已移至夏季促銷-A（調整後 ROAS +22%）。",
    repCaption: "你的收件匣 · 一份報告取代五個儀表板",
    featEyebrow: "核心功能",
    featTitle: "不用再緊盯儀表板。",
    feats: [
      { t: "LINE 指令操控", d: "發一則 LINE 訊息，Pulse 幾秒內就在 Meta 或 Google Ads 執行。" },
      { t: "24/7 預算防護", d: "CPC 超過門檻即自動暫停廣告。" },
      { t: "素材疲乏預警", d: "在 ROAS 下滑前預警，並自動啟動變體測試。" },
      { t: "競品情報", d: "每週掌握競品的投放趨勢與訊息變化。" },
      { t: "台灣在地內容", d: "廣告文案為繁體中文調校，零中國大陸用語。" },
      { t: "週一整合報告", d: "GA、Meta、Google、CRM 與 Email 整合，週一 8 點自動寄送。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "手動查看儀表板、常錯過深夜異常，經營 Meta 與 Google 廣告的台灣行銷主管與企業主。",
  },
};

export default function PulsePage({ params }: { params: { locale: string } }) {
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
              <Link href={`${base}/contact?p=pulse`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image src="/visuals/product-pulse.png" alt="Pulse — marketing intelligence with live budget protection" width={1129} height={889} priority style={{ width: "100%", height: "auto" }} />
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
              <Image src="/visuals/pulse-flow-wide.png" alt="Ad channels flowing into one watchful hub, out to a report and alerts" width={2048} height={1037} style={{ width: "100%", height: "auto" }} />
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
              <div className="line-phone">
                <div className="line-head">
                  <span className="line-avatar">脈</span>
                  <span className="line-name">{t.chatTitle}<span className="line-status">{t.chatSub}</span></span>
                </div>
                <div className="line-body">
                  <div className="msg in">{t.cust1}</div>
                  <div className="msg out">{t.ai1}<span className="meta">{t.ai1meta}</span></div>
                  <div className="msg out">{t.ai2}</div>
                  <div className="msg in">{t.cust2}</div>
                  <div className="msg out">{t.ai3}</div>
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
                  {t.rows.map((r, i) => (
                    <div className="pl-row" key={i}>
                      <span className="pl-k">{r.k}</span>
                      <b className="pl-v">{r.v}</b>
                      <span className="pl-d">{r.d}</span>
                    </div>
                  ))}
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
            <Link href={`${base}/contact?p=pulse`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
TSX
echo "→ creating AI Knowledge Assistant page"
mkdir -p "src/app/[locale]/products/ai-knowledge-assistant"
cat > "src/app/[locale]/products/ai-knowledge-assistant/page.tsx" <<'TSX'
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "AI Knowledge Assistant · AI 知識助理 · PrimeStride AI",
  description:
    "Every answer cited to the exact SOP page: natural-language Q&A over your documents, role-based access, onboarding mode, and a weekly coverage score.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "跨 · Cross-pillar",
    live: "LIVE",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    tagline: "Every answer cited to the exact SOP page.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "The shared internal knowledge layer every product draws on. Employees ask the way they'd ask a colleague and get answers straight from your SOPs — with the exact document, section, and page cited, auditable in one click.",
    ov2: "New hires self-serve from day one instead of interrupting seniors, and a weekly coverage score tells you how much of what your team asks the knowledge base can confidently answer.",
    chips: ["Word & PDF, visuals indexed too", "Role-based access", "Gap alert after 3+ low-confidence hits", "Weekly coverage score"],
    flowEyebrow: "How it works",
    flowTitle: "Scattered knowledge in. Cited answers out.",
    flowBody: "Handbooks, SOPs, PDFs, flowcharts — everything gets indexed into one layer with role-based access. Questions come back with answers and receipts: the exact document, section, and page.",
    demoEyebrow: "See it in action",
    demoTitle: "What employees ask — and what admins see.",
    chatTitle: "知識助理",
    chatSub: "role: 業務部 · SOPs indexed",
    st1: "What's the hotel budget cap for domestic business trips?",
    ai1: "NT$2,400 per night, NT$3,000 in special municipalities.",
    ai1cite: "Source: Travel Policy §4.2 · p.3",
    st2: "And for overseas trips?",
    ai2: "Tiered by region: NT$4,500 for major Asian cities, NT$6,000 for Europe and the Americas.",
    ai2cite: "Source: Travel Policy §4.3 · p.4",
    ai2meta: "20-turn memory",
    chatCaption: "Employee side · ask like a colleague, get the SOP page",
    covTitle: "Coverage report",
    covSub: "THIS WEEK",
    covBig: "87%",
    covLabel: "of team questions answered confidently",
    srcHead: "INDEXED SOURCES",
    rows: [
      { k: "SOP manuals", v: "42" },
      { k: "PDF documents", v: "136" },
      { k: "Flowcharts & diagrams", v: "58" },
    ],
    gapAlert: "“Approval authority limits” hit low confidence 3 times — the document owner has been notified.",
    gapFix: "→ Suggested: upload the 2026 approval-authority table",
    covCaption: "Admin side · you always know what the base can and can't answer",
    featEyebrow: "Key features",
    featTitle: "Stop interrupting the senior people.",
    feats: [
      { t: "Natural-language Q&A", d: "Employees ask the way they'd ask a colleague, answers come from your SOPs." },
      { t: "Source-cited answers", d: "Every answer cites the exact document, section, and page, auditable in one click." },
      { t: "Word & PDF ingestion", d: "Upload manuals and policies; diagrams and flowcharts are indexed alongside text." },
      { t: "Role-based access", d: "HR sees HR docs and the factory sees factory SOPs, so sensitive policies stay protected." },
      { t: "Onboarding mode", d: "New hires walk through real company SOPs from day one, self-service." },
      { t: "Coverage score", d: "A weekly score shows what share of employee questions the base can answer." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Companies where employees keep interrupting managers, where critical knowledge lives only in senior staff's heads, and where onboarding drags on for weeks.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "跨 · 跨域",
    live: "LIVE",
    name: "AI Knowledge Assistant",
    zhName: "AI 知識助理 · Internal Knowledge",
    tagline: "每個答案都引用到 SOP 的確切頁碼。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "每項產品共用的內部知識層。員工像問同事一樣提問，直接從你的 SOP 得到答案——並附上確切的文件、章節與頁碼，一鍵即可稽核。",
    ov2: "新人第一天起就能自助查詢，不必打斷資深同事；每週覆蓋率評分則告訴你，知識庫能有把握回答團隊多少提問。",
    chips: ["Word 與 PDF，圖表一併索引", "角色權限管控", "3 次低信心即通報缺口", "每週覆蓋率評分"],
    flowEyebrow: "怎麼運作",
    flowTitle: "散落的知識進來，附出處的答案出去。",
    flowBody: "手冊、SOP、PDF、流程圖，全部以角色權限索引進同一層知識。問題回來時帶著答案，也帶著收據：確切的文件、章節與頁碼。",
    demoEyebrow: "實際看一下",
    demoTitle: "員工問的，和管理者看到的。",
    chatTitle: "知識助理",
    chatSub: "角色：業務部 · 已索引 SOP",
    st1: "國內出差的住宿上限是多少？",
    ai1: "每晚 NT$2,400，直轄市 NT$3,000。",
    ai1cite: "出自：差旅管理辦法 §4.2 · p.3",
    st2: "那國外出差呢？",
    ai2: "依地區分級：亞洲主要城市 NT$4,500，歐美 NT$6,000。",
    ai2cite: "出自：差旅管理辦法 §4.3 · p.4",
    ai2meta: "20 輪對話記憶",
    chatCaption: "員工端 · 像問同事一樣問，拿到 SOP 頁碼",
    covTitle: "覆蓋率報告",
    covSub: "本週",
    covBig: "87%",
    covLabel: "團隊提問能被有把握回答的比例",
    srcHead: "已索引來源",
    rows: [
      { k: "SOP 手冊", v: "42" },
      { k: "PDF 文件", v: "136" },
      { k: "流程圖與圖表", v: "58" },
    ],
    gapAlert: "「簽核權限上限」3 次低信心回答——已通知文件管理者。",
    gapFix: "→ 建議：上傳 2026 簽核權限表",
    covCaption: "管理端 · 永遠知道知識庫答得出什麼、答不出什麼",
    featEyebrow: "核心功能",
    featTitle: "別再打斷資深同事。",
    feats: [
      { t: "自然語言問答", d: "員工像問同事一樣提問，答案來自你的 SOP。" },
      { t: "附出處作答", d: "每個答案引用確切文件、章節與頁碼，一鍵即可稽核。" },
      { t: "Word 與 PDF 接入", d: "上傳手冊與規範，圖表與流程圖與文字一併索引。" },
      { t: "角色權限", d: "人資看人資文件、廠務看廠務 SOP，敏感政策受保護。" },
      { t: "到職模式", d: "新人第一天起透過真實公司 SOP 自助上手。" },
      { t: "覆蓋率評分", d: "每週評分顯示知識庫能回答多少比例的員工提問。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "員工不斷打斷主管詢問、關鍵知識只存在資深員工腦中、新人到職要花數週的企業。",
  },
};

export default function KnowledgeAssistantPage({ params }: { params: { locale: string } }) {
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
              <Link href={`${base}/contact?p=ai-knowledge-assistant`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image src="/visuals/product-knowledge-ai.png" alt="AI Knowledge Assistant — answers with cited sources" width={917} height={777} priority style={{ width: "100%", height: "auto" }} />
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
              <Image src="/visuals/knowledge-flow-wide.png" alt="Scattered documents gathered into one knowledge hub, answers flowing out with citations" width={2048} height={1037} style={{ width: "100%", height: "auto" }} />
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
                  <div className="edu-msg ai">{t.ai1}<span className="cite">{t.ai1cite}</span></div>
                  <div className="edu-msg st">{t.st2}</div>
                  <div className="edu-msg ai">{t.ai2}<span className="cite">{t.ai2cite}</span><span className="meta">{t.ai2meta}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.covTitle}</span>
                  <span className="edu-panel-sub">{t.covSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="kn-cov">
                    <b>{t.covBig}</b>
                    <span>{t.covLabel}</span>
                  </div>
                  <div className="edu-gaphead">{t.srcHead}</div>
                  {t.rows.map((r, i) => (
                    <div className="pl-row" key={i}>
                      <span className="pl-k">{r.k}</span>
                      <b className="pl-v">{r.v}</b>
                    </div>
                  ))}
                  <div className="edu-risk">
                    <span>{t.gapAlert}</span><span className="flag">GAP</span>
                  </div>
                  <div className="ca-gap-fix" style={{ marginTop: 0 }}>{t.gapFix}</div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.covCaption}</p>
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
            <Link href={`${base}/contact?p=ai-knowledge-assistant`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
TSX

echo "→ patching products/[slug]/page.tsx (exclude all six custom pages from dynamic route)"
python3 - <<'PY'
import io, re, sys
path = "src/app/[locale]/products/[slug]/page.tsx"
s = io.open(path, encoding="utf-8").read()
new_expr = 'products.filter((p) => !["atlas-eip","lyra-ai","edusense-ai","ai-customer-assistant","pulse","ai-knowledge-assistant"].includes(p.slug)).map((p) => ({ locale, slug: p.slug }))'
if '"ai-knowledge-assistant"' in s and ".includes(p.slug)" in s:
    print(f"  {path}: already patched, skipped")
else:
    m = re.search(r'products(?:\.filter\(\(p\) => [^)]*\))?\.map\(\(p\) => \(\{ locale, slug: p\.slug \}\)\)', s)
    if not m:
        sys.exit(f"ANCHOR NOT FOUND in {path} — repo may have changed; aborting safely.")
    s = s.replace(m.group(0), new_expr, 1)
    io.open(path, "w", encoding="utf-8").write(s)
    print(f"  {path}: 1 edit(s)")
PY

echo "→ appending styles to src/app/globals.css"
python3 - <<'PY'
import io
css_path = "src/app/globals.css"
css = io.open(css_path, encoding="utf-8").read()

if ".zg-demo-grid" not in css:
    css += """

/* ── shared demo/hero layout ── */
.zg-hero{padding:84px 0 44px;text-align:center}
.zg-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;text-align:left}
.zg-hero-grid .eyebrow{justify-content:flex-start}
.zg-hero-grid h1{margin-left:0;margin-right:0}
.zg-hero-grid .lead{margin-left:0;margin-right:0}
.zg-hero-grid .hero-cta{justify-content:flex-start}
.zg-lantern{display:flex;justify-content:center}
.zg-lantern img{width:100%;max-width:400px;height:auto;filter:drop-shadow(0 34px 54px rgba(61,44,224,.22));animation:heroFloat 7s ease-in-out infinite}
@media(max-width:860px){.zg-hero-grid{grid-template-columns:1fr;text-align:center}.zg-hero-grid .eyebrow{justify-content:center}.zg-hero-grid h1,.zg-hero-grid .lead{margin-left:auto;margin-right:auto}.zg-hero-grid .hero-cta{justify-content:center}.zg-lantern img{max-width:260px;margin:0 auto}}
.zg-hub-img{margin-top:26px;border-radius:16px;overflow:hidden;border:1px solid #d9d3ff}
.zg-hub-img img{width:100%;height:auto;display:block}
.zg-demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
@media(max-width:900px){.zg-demo-grid{grid-template-columns:1fr}}
.zg-demo-cap{margin-top:16px;font-family:var(--font-plex-mono);font-size:.7rem;letter-spacing:.07em;color:var(--muted);text-align:center}
@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@media(prefers-reduced-motion:reduce){.zg-lantern img{animation:none}}
.line-phone{max-width:380px;margin:0 auto;background:#8ba3c7;border-radius:28px;border:1px solid var(--line);box-shadow:0 24px 60px rgba(14,17,22,.10);overflow:hidden}
.line-head{display:flex;align-items:center;gap:10px;background:#fff;padding:12px 16px;border-bottom:1px solid rgba(14,17,22,.08)}
.line-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--iris),var(--iris-bright));color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex:none}
.line-name{font-weight:600;font-size:.92rem;display:flex;flex-direction:column;line-height:1.2}
.line-status{font-family:var(--font-plex-mono);font-size:.62rem;color:var(--live);letter-spacing:.05em}
.line-body{padding:20px 14px 22px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:84%;padding:10px 13px;border-radius:14px;font-size:.88rem;line-height:1.5}
.msg.in{align-self:flex-start;background:#fff;border:1px solid rgba(14,17,22,.08);border-top-left-radius:4px}
.msg.out{align-self:flex-end;background:#d9f4e3;border:1px solid #bfe8cd;border-top-right-radius:4px}
.msg .cite{display:block;margin-top:7px;font-size:.68rem;color:var(--iris);font-family:var(--font-plex-mono)}
.msg .meta{display:inline-block;margin-top:8px;margin-left:8px;font-family:var(--font-plex-mono);font-size:.62rem;color:#0d8a63;border:1px solid rgba(18,158,116,.55);border-radius:100px;padding:3px 10px;letter-spacing:.05em;background:rgba(255,255,255,.55)}
.msg .meta.esc{color:#E8552B;border-color:rgba(232,85,43,.55)}
"""
    print("  globals.css: shared layout styles appended")

if ".edu-panel" not in css:
    css += """

/* ── demo panels ── */
.edu-chips{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.edu-chip{border:1px solid var(--line);background:var(--surface);border-radius:100px;padding:9px 18px;font-size:.85rem;font-weight:600;color:var(--ink)}
.edu-panel{background:var(--surface);border:1px solid var(--line);border-radius:20px;box-shadow:0 20px 50px rgba(14,17,22,.07);overflow:hidden;max-width:520px;margin:0 auto;width:100%}
.edu-panel-head{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#fbfaff,#f4f2ff)}
.edu-dot{width:10px;height:10px;border-radius:50%;background:var(--live);flex:none}
.edu-panel-title{font-weight:700;font-size:.95rem}
.edu-panel-sub{margin-left:auto;font-family:var(--font-plex-mono);font-size:.62rem;color:var(--muted);letter-spacing:.06em}
.edu-chat{padding:20px 18px;display:flex;flex-direction:column;gap:10px;background:#fafaff}
.edu-msg{max-width:86%;padding:11px 14px;border-radius:14px;font-size:.9rem;line-height:1.55}
.edu-msg.st{align-self:flex-start;background:#fff;border:1px solid var(--line);border-top-left-radius:4px}
.edu-msg.ai{align-self:flex-end;background:linear-gradient(135deg,#efedff,#e4e0ff);border:1px solid #d9d3ff;border-top-right-radius:4px}
.edu-msg .cite{display:block;margin-top:7px;font-size:.68rem;color:var(--iris);font-family:var(--font-plex-mono)}
.edu-dash{padding:20px 22px;display:flex;flex-direction:column;gap:13px;background:#fafaff}
.edu-gaphead{font-family:var(--font-plex-mono);font-size:.66rem;letter-spacing:.12em;color:var(--muted)}
.gap-row{display:grid;grid-template-columns:1fr auto;gap:5px 14px;align-items:center}
.gap-name{font-size:.9rem;font-weight:600}
.gap-pct{font-family:var(--font-plex-mono);font-size:.78rem;color:var(--muted)}
.gap-bar{grid-column:1/-1;height:10px;border-radius:5px;background:#efedff;overflow:hidden}
.gap-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,var(--iris),var(--iris-bright))}
.gap-fill.ok{background:linear-gradient(90deg,#129E74,#3fbf95)}
.gap-fill.warn{background:linear-gradient(90deg,#E8552B,#f0946a)}
.edu-gapnote{font-size:.8rem;color:#c1492b;background:#fff2ec;border:1px solid #f3c9b8;border-radius:10px;padding:8px 12px}
.edu-risk{display:flex;align-items:center;gap:9px;border:1px solid #f3c9b8;background:#fff6f2;border-radius:12px;padding:11px 14px;font-size:.83rem;color:var(--muted);flex-wrap:wrap}
.edu-risk b{color:var(--ink)}
.edu-risk .flag{font-family:var(--font-plex-mono);font-size:.6rem;color:#E8552B;border:1px solid #E8552B;border-radius:100px;padding:3px 10px;letter-spacing:.1em;margin-left:auto;white-space:nowrap}
.ca-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.ca-stat{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:12px 8px;text-align:center}
.ca-stat b{display:block;font-family:var(--font-bricolage);font-size:1.4rem;color:var(--iris)}
.ca-stat span{font-size:.64rem;color:var(--muted)}
@media(max-width:560px){.ca-stats{grid-template-columns:repeat(2,1fr)}}
.ca-gaphead{font-family:var(--font-plex-mono);font-size:.66rem;letter-spacing:.12em;color:var(--muted);margin-top:6px}
.ca-gap{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:12px 14px}
.ca-gap-q{font-size:.9rem;font-weight:600;display:flex;justify-content:space-between;gap:10px}
.ca-n{font-family:var(--font-plex-mono);font-size:.75rem;color:#E8552B;white-space:nowrap}
.ca-gap-fix{margin-top:6px;font-size:.8rem;color:var(--live)}
"""
    print("  globals.css: panel styles appended")

if ".ly-wave" not in css:
    css += """

/* ── product demo extras ────────────────────────────── */
.edu-msg .meta{display:inline-block;margin-top:8px;margin-left:8px;font-family:var(--font-plex-mono);font-size:.62rem;color:#0d8a63;border:1px solid rgba(18,158,116,.55);border-radius:100px;padding:3px 10px;letter-spacing:.05em;background:rgba(255,255,255,.55)}
.edu-msg .meta.esc{color:#E8552B;border-color:rgba(232,85,43,.55)}
.ly-wave{display:flex;align-items:flex-end;gap:5px;height:56px;padding:16px 20px 4px;background:#fafaff}
.ly-wave i{flex:1;background:linear-gradient(180deg,var(--iris-bright),var(--iris));border-radius:3px;opacity:.85;min-height:8%}
.pl-row{display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:12px 16px;font-size:.9rem}
.pl-k{color:var(--muted);min-width:110px}
.pl-v{color:var(--iris);font-weight:700}
.pl-d{margin-left:auto;font-family:var(--font-plex-mono);font-size:.68rem;color:var(--muted)}
.kn-cov{display:flex;align-items:baseline;gap:12px;border:1px solid #d9d3ff;background:linear-gradient(135deg,#f6f4ff,#fff);border-radius:14px;padding:18px 20px}
.kn-cov b{font-family:var(--font-bricolage);font-size:2.6rem;color:var(--iris);line-height:1}
.kn-cov span{font-size:.8rem;color:var(--muted);max-width:200px}
"""
    io.open(css_path, "w", encoding="utf-8").write(css)
    print("  globals.css: demo extras appended")
else:
    print("  globals.css: demo extras already present, skipped")
PY

echo ""
echo "DONE. Next:  npm run build  &&  git add -A && git commit -m 'Custom pages: Atlas EIP, LyraAI, Pulse, AI Knowledge Assistant — flow visuals + demos' && git push"
