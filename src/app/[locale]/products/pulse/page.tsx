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
