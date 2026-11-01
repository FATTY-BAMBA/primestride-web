import Link from "next/link";
import ProductHero from "@/components/ProductHero";
import ProductJourney from "@/components/ProductJourney";
import "../product-detail.css";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title: params.locale === "zh"
      ? "AI Customer Assistant · 多語言智慧客服 · PrimeStride AI"
      : "AI Customer Assistant · Multilingual Customer Service · PrimeStride AI",
    description: params.locale === "zh"
      ? "24 小時多語言客服，以公司知識為依據回答客戶問題，保留對話脈絡、適時轉接真人，並透過每週缺口報告持續改善服務內容。"
      : "24/7 multilingual customer service grounded in your company’s knowledge, with source-cited answers, conversation context, human handoff and weekly knowledge-gap reports.",
  };
}

const content = {
  en: {
    back: "← All products",
    pillar: "銷 · Service",
    live: "LIVE",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    tagline: "24/7 customer service, across languages.",
    cta: "Book a consult",
    ovEyebrow: "Overview",
    ov1: "A multilingual customer service assistant grounded in your company’s knowledge, with language coverage configured for your customers. It answers instantly, remembers the whole conversation, and knows when it's unsure.",
    ov2: "Below a confidence threshold it hands off to a human, with full history attached. Your team manages the knowledge base in a spreadsheet, so there's no IT queue and no redeployment when content changes.",
    chips: ["Multilingual support", "0.5-sec first response", "70%+ auto-resolved, production-verified", "20-turn memory", "Spreadsheet knowledge base"],
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
      { t: "Multilingual conversations", d: "Serve customers in multiple languages, including Traditional Chinese. Language coverage is configured for your audience." },
      { t: "0.5-second first response", d: "SSE streaming delivers the first word in half a second, so conversations feel instant." },
      { t: "Excel-managed knowledge", d: "Your team updates content in a spreadsheet. No IT, no developer queue." },
      { t: "Confidence-gated escalation", d: "Below 0.75 confidence, the system automatically escalates to a human." },
      { t: "20-turn memory", d: "Follow-up questions get coherent, connected answers across the whole chat." },
      { t: "Weekly gap report", d: "Flags what the AI couldn't answer well and tells you what content to add." },
    ],
    whoEyebrow: "Who it's for",
    whoBody: "Retail, service, hospitality, and professional-services teams handling repeated customer enquiries across languages.",
  },
  zh: {
    back: "← 全部產品",
    pillar: "銷 · 客服",
    live: "LIVE",
    name: "AI Customer Assistant",
    zhName: "AI 智慧客服助理 · 24/7 Service",
    tagline: "24 小時多語言客服。",
    cta: "預約諮詢",
    ovEyebrow: "總覽",
    ov1: "以公司知識為依據的多語言客服助理，依你的客戶需求設定支援語言。它即時回應、記得整段對話，也知道自己何時不確定。",
    ov2: "信心度低於門檻即自動轉接真人，並附上完整對話。你的團隊以試算表管理知識庫，內容變更不必等 IT、也不需重新部署。",
    chips: ["多語言服務", "0.5 秒首字回應", "70%+ 自動解決，實證數據", "20 輪對話記憶", "試算表知識庫"],
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
      { t: "多語言客服", d: "支援包含繁體中文在內的多語言服務，依客群需求設定語言範圍。" },
      { t: "0.5 秒首字回應", d: "SSE 串流讓首字在半秒內出現，對話即時流暢。" },
      { t: "Excel 知識庫", d: "團隊用試算表更新內容，不需 IT、不需重新部署。" },
      { t: "信心度轉真人", d: "信心度低於 0.75 時，系統自動轉接真人。" },
      { t: "20 輪對話記憶", d: "追問也能在整段對話中得到連貫、連結的回答。" },
      { t: "每週缺口報告", d: "標記 AI 答不好的問題，並告訴你該補充哪些內容。" },
    ],
    whoEyebrow: "適合誰",
    whoBody: "需要以不同語言處理重複客戶詢問的零售、服務、餐旅與專業服務團隊。",
  },
};

export default function CustomerAssistantPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = content[locale];
  const base = `/${locale}`;

  return (
    <main className="product-page" lang={locale === "zh" ? "zh-Hant" : "en"}>
      <ProductHero slug="ai-customer-assistant" locale={locale} name={t.name} tagline={t.tagline} category={locale === "zh" ? t.zhName.split(" · ")[0] : t.zhName.split(" · ")[1]} />
      <nav className="product-subnav wrap" aria-label={locale === "zh" ? "產品頁導覽" : "On this page"}>
        <a href="#demo">{locale === "zh" ? "實際情境" : "In practice"}</a>
        <a href="#overview">{locale === "zh" ? "產品總覽" : "Overview"}</a>
        <a href="#workflow">{locale === "zh" ? "運作方式" : "How it works"}</a>
        <a href="#features">{locale === "zh" ? "核心功能" : "Capabilities"}</a>
      </nav>

      <section className="block product-demo" id="demo">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.demoEyebrow}</span>
            <h2>{t.demoTitle}</h2>
            <p className="product-demo-note">{locale === "zh" ? "產品畫面示例 · 以下皆為示範資料" : "Illustrative product views · Sample data"}</p>
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

      <section className="block product-overview" id="overview">
        <div className="wrap product-overview-grid">
          <div><span className="eyebrow">{t.ovEyebrow}</span><h2>{locale === "zh" ? "從日常工作，看見實際價值。" : "A practical place in your team’s day."}</h2></div>
          <div><p>{t.ov1}</p><p>{t.ov2}</p><div className="edu-chips">{t.chips.map(chip => <span className="edu-chip" key={chip}>{chip}</span>)}</div></div>
        </div>
      </section>

      <section className="block product-workflow" id="workflow">
        <div className="wrap">
          <div className="product-workflow-panel">
            <div className="product-workflow-heading"><div><span className="eyebrow">{t.flowEyebrow}</span><h2>{t.flowTitle}</h2></div><p>{t.flowBody}</p></div>
            <ProductJourney slug="ai-customer-assistant" locale={locale} />
          </div>
        </div>
      </section>

      <section className="block product-features" id="features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{t.featEyebrow}</span>
            <h2>{t.featTitle}</h2>
          </div>
          <div className="feat-grid">
            {t.feats.map((f, i) => (
              <div className="feat" key={i}><span className="feature-number" aria-hidden="true">0{i + 1}</span><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="block product-fit" id="fit">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{t.whoEyebrow}</span>
            <h2>{locale === "zh" ? "讓 " + t.name + " 走進你的工作流程。" : "See where " + t.name + " fits."}</h2>
            <p>{t.whoBody}</p>
            <Link href={`${base}/contact?p=ai-customer-assistant`} className="btn btn-light" style={{ marginTop: 24 }}>{t.cta} <span className="chev">›</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
