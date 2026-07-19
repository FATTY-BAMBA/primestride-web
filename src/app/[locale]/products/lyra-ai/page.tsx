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
