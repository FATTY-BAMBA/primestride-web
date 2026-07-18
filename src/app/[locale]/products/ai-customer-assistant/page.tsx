import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "AI Customer Assistant · 24/7 智慧客服 · PrimeStride AI",
  description:
    "A 24/7 customer service assistant built natively for Traditional Chinese: instant cited answers, confidence-gated human handoff, spreadsheet-managed knowledge, and a weekly gap report.",
};

const content = {
  en: {
    back: "← All products",
    pillar: "銷 · Service",
    live: "LIVE",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    tagline: "24/7 Traditional-Chinese customer service.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "A 24/7 customer service assistant built for Traditional Chinese from the ground up — not converted from Simplified. It answers instantly, remembers the whole conversation, and knows when it's unsure.",
    ov2: "Below a confidence threshold it hands off to a human, with full history attached. Your team manages the knowledge base in a spreadsheet, so there's no IT queue and no redeployment when content changes.",
    chips: ["Traditional-Chinese native", "0.5-sec first response", "70%+ auto-resolved, production-verified", "20-turn memory", "Spreadsheet knowledge base"],
    flowEyebrow: "How it works",
    flowTitle: "Every question in. The right answer out — or the right person.",
    flowBody: "Customer messages flow into one hub trained on your own content. Most questions resolve instantly with a cited answer; the few it's unsure about route straight to your team, with the whole conversation attached.",
    demoEyebrow: "See it in action",
    demoTitle: "What your customers see — and what you see.",
    chatTitle: "AI 客服",
    chatSub: "online · 24/7",
    cust1: "Has my order shipped yet? #A-102",
    ai1: "Hi! #A-102 shipped this afternoon via T-Cat, tracking no. 8321-4602, arriving tomorrow.",
    ai1cite: "Source: Shipping SOP",
    ai1meta: "0.4s",
    cust2: "Can I switch to convenience-store pickup?",
    ai2: "Yes — within 24 hours of shipping you can switch to store pickup. Want me to change it for you?",
    cust3: "Actually, I want a refund — the last item arrived damaged",
    ai3: "I'm sorry about that. Damage refunds need a person to verify, so I've handed this conversation — with full history — to our team. They'll reply within about 3 minutes.",
    ai3meta: "Human handoff · confidence 0.62",
    chatCaption: "What your customers see · instant answers, honest handoffs",
    gapTitle: "Weekly gap report",
    gapSub: "WEEK 29",
    stats: [
      { n: "312", label: "Conversations" },
      { n: "71%", label: "Auto-resolved" },
      { n: "0.4s", label: "Avg first response" },
      { n: "41%", label: "After-hours" },
    ],
    gapHead: "TOP UNANSWERED — AND WHAT TO ADD",
    gaps: [
      { q: "“How do I get an invoice for a return?”", n: "×14", fix: "→ Add: invoicing & credit-note SOP" },
      { q: "“Bulk-order discounts?”", n: "×9", fix: "→ Add: volume pricing table" },
      { q: "“Do you ship to outlying islands?”", n: "×6", fix: "→ Add: island shipping rules" },
    ],
    gapCaption: "What you see · the AI tells you what content to add next",
    featEyebrow: "Key features",
    featTitle: "Instant for customers. Honest with you.",
    feats: [
      { t: "24/7 繁中 chatbot", d: "Built for Traditional Chinese from the ground up, not converted from Simplified." },
      { t: "0.5-second first response", d: "SSE streaming delivers the first word in half a second, so conversations feel instant." },
      { t: "Excel-managed knowledge", d: "Your team updates content in a spreadsheet. No IT, no developer queue." },
      { t: "Confidence-gated escalation", d: "Below 0.75 confidence, the system automatically escalates to a human." },
      { t: "20-turn memory", d: "Follow-up questions get coherent, connected answers across the whole chat." },
      { t: "Weekly gap report", d: "Flags what the AI couldn't answer well and tells you what content to add." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Taiwan retail, service, hospitality, and professional-services businesses whose staff currently spend 3+ hours a day answering the same website enquiries.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "銷 · 客服",
    live: "LIVE",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    tagline: "24 小時繁體中文客服。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "24 小時繁體中文原生客服助理，並非由簡中翻譯而來。它即時回應、記得整段對話，也知道自己何時不確定。",
    ov2: "信心度低於門檻即自動轉接真人，並附上完整對話。你的團隊以試算表管理知識庫，內容變更不必等 IT、也不需重新部署。",
    chips: ["繁體中文原生", "0.5 秒首字回應", "70%+ 自動解決，實證數據", "20 輪對話記憶", "試算表知識庫"],
    flowEyebrow: "怎麼運作",
    flowTitle: "每個問題進來，對的答案出去——或對的人接手。",
    flowBody: "客戶訊息匯入以你公司內容訓練的中樞。多數問題即時解決、答案附出處；少數不確定的，連同完整對話紀錄，直接轉給你的團隊。",
    demoEyebrow: "實際看一下",
    demoTitle: "客戶看到的，和你看到的。",
    chatTitle: "AI 客服",
    chatSub: "online · 24/7",
    cust1: "請問我的訂單出貨了嗎？#A-102",
    ai1: "您好！#A-102 已於今天下午出貨，黑貓單號 8321-4602，預計明天送達。",
    ai1cite: "出自：出貨作業流程",
    ai1meta: "0.4 秒",
    cust2: "可以改成超商取貨嗎？",
    ai2: "可以，出貨後 24 小時內都能改超商取貨。我直接幫您改，還是您自己選門市？",
    cust3: "其實我要退款，上次收到的商品有瑕疵",
    ai3: "很抱歉造成您的不便。瑕疵退款需要專人確認，我已將對話完整轉接給真人客服，約 3 分鐘內回覆您。",
    ai3meta: "轉接真人 · 信心度 0.62",
    chatCaption: "客戶端畫面 · 即時回答，誠實轉接",
    gapTitle: "每週缺口報告",
    gapSub: "第 29 週",
    stats: [
      { n: "312", label: "本週對話" },
      { n: "71%", label: "自動解決" },
      { n: "0.4s", label: "平均首字" },
      { n: "41%", label: "非上班時段" },
    ],
    gapHead: "最常被問倒的問題——以及該補的內容",
    gaps: [
      { q: "「退換貨發票怎麼開？」", n: "×14", fix: "→ 建議新增：發票與折讓 SOP" },
      { q: "「大量訂購有折扣嗎？」", n: "×9", fix: "→ 建議新增：批量價格表" },
      { q: "「可以配送到離島嗎？」", n: "×6", fix: "→ 建議新增：離島配送規則" },
    ],
    gapCaption: "老闆端畫面 · AI 主動告訴你該補什麼內容",
    featEyebrow: "核心功能",
    featTitle: "對客戶即時，對你誠實。",
    feats: [
      { t: "24/7 繁中客服", d: "繁體中文原生打造，並非由簡中轉換而來。" },
      { t: "0.5 秒首字回應", d: "SSE 串流讓首字在半秒內出現，對話即時流暢。" },
      { t: "Excel 知識庫", d: "團隊用試算表更新內容，不需 IT、不需重新部署。" },
      { t: "信心度轉真人", d: "信心度低於 0.75 時，系統自動轉接真人。" },
      { t: "20 輪對話記憶", d: "追問也能在整段對話中得到連貫、連結的回答。" },
      { t: "每週缺口報告", d: "標記 AI 答不好的問題，並告訴你該補充哪些內容。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "員工每日花 3 小時以上回答相同網站詢問的台灣零售、服務、餐旅與專業服務業。",
  },
};

export default function CustomerAssistantPage({ params }: { params: { locale: string } }) {
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
              <Link href={`${base}/contact?p=ai-customer-assistant`} className="btn btn-primary">{t.cta} <span className="chev">›</span></Link>
            </div>
          </div>
          <div className="zg-lantern">
            <Image
              src="/visuals/product-customer-ai.png"
              alt="AI Customer Assistant — always-on chat service"
              width={905}
              height={697}
              priority
              style={{ width: "100%", height: "auto" }}
            />
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
            <div className="edu-chips">
              {t.chips.map((c, i) => (<span className="edu-chip" key={i}>{c}</span>))}
            </div>
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
              <Image
                src="/visuals/ca-flow-wide.png"
                alt="Customer messages flowing into one hub — most resolved automatically, some routed to a human"
                width={2048}
                height={1037}
                style={{ width: "100%", height: "auto" }}
              />
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
                  <span className="line-avatar">AI</span>
                  <span className="line-name">{t.chatTitle}<span className="line-status">{t.chatSub}</span></span>
                </div>
                <div className="line-body">
                  <div className="msg in">{t.cust1}</div>
                  <div className="msg out">{t.ai1}<span className="cite">{t.ai1cite}</span><span className="meta">{t.ai1meta}</span></div>
                  <div className="msg in">{t.cust2}</div>
                  <div className="msg out">{t.ai2}</div>
                  <div className="msg in">{t.cust3}</div>
                  <div className="msg out">{t.ai3}<span className="meta esc">{t.ai3meta}</span></div>
                </div>
              </div>
              <p className="zg-demo-cap">{t.chatCaption}</p>
            </div>
            <div>
              <div className="edu-panel">
                <div className="edu-panel-head">
                  <span className="edu-dot"></span>
                  <span className="edu-panel-title">{t.gapTitle}</span>
                  <span className="edu-panel-sub">{t.gapSub}</span>
                </div>
                <div className="edu-dash">
                  <div className="ca-stats">
                    {t.stats.map((s, i) => (
                      <div className="ca-stat" key={i}><b>{s.n}</b><span>{s.label}</span></div>
                    ))}
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
              <p className="zg-demo-cap">{t.gapCaption}</p>
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
            {t.feats.map((f, i) => (
              <div className="feat" key={i}><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=ai-customer-assistant`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
