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
