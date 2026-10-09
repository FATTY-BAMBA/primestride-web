import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StrideBrainOrbit from "@/components/StrideBrainOrbit";
import OperationsDemo from "@/components/OperationsDemo";
import { isLocale, locales } from "@/i18n";
import "./operations.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const content = {
  en: {
    metaTitle: "StrideBrain | SME Operations Platform | PrimeStride AI",
    productName: "StrideBrain",
    productAlias: "AI 營運大腦",
    metaDescription: "One company knowledge hub supporting an AI knowledge assistant, customer service, quoting, work orders and analytics. Bring your existing files; PrimeStride handles the preparation and setup.",
    eyebrow: "The operations platform for SMEs",
    endorsement: "Built by PrimeStride AI",
    promise: "Put your company’s knowledge to work.",
    lead: "Give your team a shared foundation for answers, quotes and job tracking. StrideBrain connects five applications to the knowledge your business already has.",
    cta: "Let’s talk about your workflow",
    seeHow: "Explore one customer job",
    prep: "Bring your files as they are. We handle the preparation and setup.",
    live: "Knowledge hub + five applications · Live today",
    visualLabel: "Your company’s shared knowledge",
    visualSources: ["SOPs", "Pricing rules", "Work records"],
    visualOutcome: "A common starting point for every team.",
    frictionTitle: "When everyday work keeps coming back to one person.",
    friction: ["Which document is current?", "Who needs to approve this quote?", "Where does this job stand?"],
    modulesEyebrow: "The complete product",
    modulesTitle: "One knowledge hub. Five ways to put it to work.",
    modulesIntro: "Knowledge management is the foundation. The five applications use it across your daily operation. Start with the workflow that needs it most.",
    hubLabel: "Shared foundation · Knowledge management",
    hubTitle: "Company knowledge hub",
    hubBody: "Bring your SOPs, specifications, pricing rules and confirmed experience into one place. Give each application the same company context, with sources your team can check.",
    hubTags: ["Existing documents", "Confirmed rules", "Source records"],
    apps: [
      { title: "AI knowledge assistant", task: "Help your team find answers", desc: "Look up SOPs, specifications and past experience without interrupting the same senior colleague." },
      { title: "AI customer service", task: "Answer everyday enquiries", desc: "Use company knowledge to answer questions about specifications, lead times and requirements." },
      { title: "AI quoting", task: "Prepare a quote for review", desc: "Bring requirements and pricing rules together in a suggestion your team can check and approve." },
      { title: "Work orders & production", task: "Keep the work moving", desc: "See each job’s stage, pending information and next action, from confirmation to production." },
      { title: "AI analytics", task: "Make decisions with context", desc: "Review margins, efficiency and product trends using the operational data available to your business." },
    ],
    trustEyebrow: "Why PrimeStride",
    trustTitle: "Your knowledge behind the answer. Your judgment where it matters.",
    trust: [
      { title: "Specific to your company", desc: "Use your documents and confirmed business rules as the basis for day-to-day work." },
      { title: "Sources you can inspect", desc: "Check the document or record behind an answer, so your team can review its basis." },
      { title: "Exceptions stay with people", desc: "Conflicting information, missing details and special conditions go to your team for confirmation." },
    ],
    stepsEyebrow: "Implementation, handled with you",
    stepsTitle: "Bring what you have. We help make it usable.",
    stepsIntro: "You know the business. We handle the review, organization and setup, and bring you the questions that need your judgment.",
    steps: [
      { when: "You provide", title: "Existing files, as they are", desc: "Start with the quote sheets, Excel files, SOPs and work notes you already use. You do not need to build a new database first." },
      { when: "PrimeStride handles", title: "Review, organization and setup", desc: "We inventory the material, organize the knowledge and configure your chosen applications. Gaps become specific questions for your team." },
      { when: "We confirm together", title: "Check the rules in a real workflow", desc: "Confirm pricing rules and exceptions, check the results, and agree what is ready to use. Expand from the first workflow as your needs develop." },
    ],
    valueEyebrow: "Define success before rollout",
    valueTitle: "What should improve in your business?",
    valueIntro: "Agree on a starting point and review the same workflow after implementation. Measure the change instead of assuming a savings percentage.",
    value: [
      { title: "Time", question: "How long does an answer or quote take?", desc: "Compare time spent searching, preparing and waiting for confirmation." },
      { title: "Quality", question: "Can the team verify and use the answer?", desc: "Review sources, missing details and the corrections still needed." },
      { title: "Flow", question: "Where does work still get stuck?", desc: "Track repeated handoffs, unresolved exceptions and incomplete job information." },
    ],
    faqEyebrow: "Before we start",
    faqTitle: "A few practical questions.",
    faqs: [
      { question: "Do we need all five applications at once?", answer: "No. The knowledge hub and all five applications are live, but your rollout can start with one workflow. We agree the applications, connections and delivery scope around what your team needs." },
      { question: "Is this only for printing businesses?", answer: "No. Printing is the example in the walkthrough. The same approach can support manufacturing, interior design, trading and other SMEs. The documents, rules and workflow are specific to each business." },
      { question: "Can government grants support the rollout?", answer: "We can discuss whether a relevant programme is worth checking. Eligibility, eligible solutions, application dates and approval must be confirmed against the current programme requirements. Grants are not guaranteed or assumed in the proposed cost." },
    ],
    closingEyebrow: "StrideBrain · By PrimeStride AI",
    closingTitle: "Start with the work that keeps getting stuck.",
    closingBody: "Bring one recurring question, quote or handoff. Tell us how you handle it today. Together, we’ll identify where StrideBrain can help and what your first rollout should include.",
    closingNote: "No polished project brief needed. Your existing workflow is enough to start.",
  },
  zh: {
    metaTitle: "AI 營運大腦 StrideBrain｜中小企業智慧營運平台｜首越人工智慧",
    productName: "AI 營運大腦",
    productAlias: "StrideBrain",
    metaDescription: "一個企業知識中樞，支援 AI 知識助理、AI 客服、AI 報價、工單／生產管理與 AI 數據分析。現有資料原樣交給我們，由 PrimeStride 首越人工智慧負責整理與建置。",
    eyebrow: "為中小企業打造的智慧營運平台",
    endorsement: "由 PrimeStride AI 首越人工智慧打造",
    promise: "讓公司的經驗，接上每天的營運。",
    lead: "把公司知識集中起來，讓團隊查得到、回得出、接得上。AI 營運大腦以同一個知識中樞，支援從內部查詢、客戶回覆到報價與生產的日常工作。",
    cta: "聊聊你的工作流程",
    seeHow: "體驗一筆訂單的流程",
    prep: "現有資料原樣交給我們，整理與建置由我們負責。",
    live: "知識中樞＋五大應用，現已上線",
    visualLabel: "全公司的共同知識依據",
    visualSources: ["作業規範", "報價規則", "工作紀錄"],
    visualOutcome: "讓團隊的每一步，都有共同起點。",
    frictionTitle: "日常工作，是不是總要回頭問同一個人？",
    friction: ["哪份規格才是最新的？", "這張報價，要找誰確認？", "這筆工單，現在做到哪？"],
    modulesEyebrow: "產品全貌",
    modulesTitle: "一個企業知識中樞，支援五大營運應用。",
    modulesIntro: "知識管理是共同基礎，五大應用把知識帶進日常工作。先從最需要改善的流程開始，再逐步擴大。",
    hubLabel: "共同基礎 · 知識管理",
    hubTitle: "企業知識中樞",
    hubBody: "集中 SOP、規格、報價規則與確認過的經驗，保留可核對的來源，讓每個應用都從同一份公司知識出發。",
    hubTags: ["既有文件", "已確認的規則", "可核對的來源"],
    apps: [
      { title: "AI 知識助理", task: "團隊查得到", desc: "內部查詢 SOP、規格與過往經驗，減少反覆打斷資深同事。" },
      { title: "AI 客服", task: "客戶問得到", desc: "依公司知識回答規格、交期與需求，支援日常客戶詢問。" },
      { title: "AI 報價", task: "報價有依據", desc: "整合需求與價格規則，產出可供團隊核對、確認的報價建議。" },
      { title: "工單／生產管理", task: "進度接得上", desc: "從確認到生產，掌握每筆工單的狀態、待補資訊與下一步。" },
      { title: "AI 數據分析", task: "決策看得清", desc: "依可用的營運資料檢視毛利、效率與品項趨勢，讓判斷有依據。" },
    ],
    trustEyebrow: "選擇首越的理由",
    trustTitle: "回答依據公司的知識，關鍵判斷交給懂業務的人。",
    trust: [
      { title: "用你公司的知識", desc: "以既有文件與確認過的業務規則，作為日常回覆與作業的依據。" },
      { title: "有答案，也有出處", desc: "回到文件或紀錄核對來源，讓團隊看得懂回答的依據。" },
      { title: "遇到例外，由人確認", desc: "資料矛盾、資訊不足或特殊條件，交由團隊確認後再處理。" },
    ],
    stepsEyebrow: "整理到導入，我們一起完成",
    stepsTitle: "資料不用先整理，照原樣交給我們。",
    stepsIntro: "你熟悉業務，我們負責盤點、整理與建置。需要專業判斷的地方，再帶著具體問題一起確認。",
    steps: [
      { when: "你提供", title: "現有資料，原樣開始", desc: "平常用的報價單、Excel、SOP 與工作筆記，就能開始。不用為了導入，先重新建一套資料庫。" },
      { when: "PrimeStride 負責", title: "盤點、整理與建置", desc: "整理公司知識，設定適合的應用；發現缺漏時，提出具體問題，集中向團隊確認。" },
      { when: "一起確認", title: "放進真實流程，核對再使用", desc: "確認報價規則與例外處理，核對結果、約定使用範圍，再依需求逐步擴大導入。" },
    ],
    valueEyebrow: "導入前，先定義成功",
    valueTitle: "什麼改善，對你的公司才有價值？",
    valueIntro: "先記錄現況，再用同一個流程檢視導入後的變化。不預設節省比例，把改善落在看得見的工作上。",
    value: [
      { title: "時間", question: "一個回答、一張報價，要多久？", desc: "比較查資料、準備內容與等待確認的時間。" },
      { title: "品質", question: "答案能核對，也能交給團隊用嗎？", desc: "檢視來源、資訊缺口與仍需修正的地方。" },
      { title: "流程", question: "工作還在哪個環節卡住？", desc: "追蹤重複交接、未解例外與工單資訊缺漏。" },
    ],
    faqEyebrow: "開始之前",
    faqTitle: "你可能還想知道。",
    faqs: [
      { question: "一定要一次導入五大應用嗎？", answer: "不用。知識中樞與五大應用皆已上線，但可以先跑順一個流程。我們會依團隊需求，一起確認應用、串接方式與交付範圍。" },
      { question: "這是專門給印刷業的工具嗎？", answer: "不是。印刷是互動體驗中的應用案例。製造、室內設計、貿易及其他中小企業，也能從相同方法出發；實際使用的文件、規則與工作流程，則依各公司的情況設定。" },
      { question: "可以搭配政府補助嗎？", answer: "可一起評估是否有值得查核的計畫。企業資格、適用方案、申請時程與核定結果，均須依當期計畫確認。補助不保證取得，也不預先從方案費用中扣除。" },
    ],
    closingEyebrow: "AI 營運大腦 · PrimeStride AI 首越人工智慧",
    closingTitle: "先從最常卡住的一個流程開始。",
    closingBody: "帶一個反覆被問的問題、一張報價，或一次常常卡關的交接，告訴我們現在怎麼做。一起找出 AI 營運大腦能幫上忙的地方，規劃第一步的導入範圍。",
    closingNote: "不用先寫好專案需求。你現在的工作方式，就是起點。",
  },
};

const appImages = [
  "/visuals/zg-module-assistant.png",
  "/visuals/product-customer-ai.png",
  "/visuals/zg-module-quoting.png",
  "/visuals/zg-module-workorders.png",
  "/visuals/zg-module-analytics.png",
];

type PageProps = { params: { locale: string } };

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = content[params.locale];
  const url = `https://www.primestrideai.com/${params.locale}/stridebrain`;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: url,
      languages: { en: "/en/stridebrain", "zh-TW": "/zh/stridebrain" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url,
      siteName: "PrimeStride AI",
      locale: params.locale === "zh" ? "zh_TW" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: t.metaTitle, description: t.metaDescription },
  };
}

export default function StrideBrainPage({ params }: PageProps) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = content[locale];
  const contactHref = `/${locale}/contact?p=stridebrain`;

  return (
    <main className="operations-product">
      <section className="ops-hero" aria-labelledby="ops-product-title">
        <div className="wrap ops-hero-grid">
          <div className="ops-hero-copy">
            <span className="eyebrow">{t.eyebrow}</span>
            <h1 id="ops-product-title">{t.productName}</h1>
            <p className="ops-product-alias">{t.productAlias}</p>
            <p className="ops-endorsement">{t.endorsement}</p>
            <p className="ops-promise">{t.promise}</p>
            <p className="ops-lead">{t.lead}</p>
            <div className="hero-cta">
              <Link href={contactHref} className="btn btn-primary">{t.cta}<span aria-hidden="true">↗</span></Link>
              <Link href="#demo" className="btn btn-ghost">{t.seeHow}<span aria-hidden="true">↓</span></Link>
            </div>
            <p className="ops-prep">{t.prep}</p>
          </div>
          <StrideBrainOrbit locale={locale} />
        </div>
        <div className="wrap"><div className="ops-availability"><span className="ops-live-dot" aria-hidden="true" />{t.live}<Link href="#modules">{locale === "zh" ? "看完整產品" : "See the complete product"}<span aria-hidden="true"> ↓</span></Link></div></div>
      </section>

      <section className="ops-friction" aria-labelledby="ops-friction-title">
        <div className="wrap">
          <h2 id="ops-friction-title">{t.frictionTitle}</h2>
          <ul>{t.friction.map((question) => <li key={question}>{question}</li>)}</ul>
        </div>
      </section>

      <section className="block ops-architecture" id="modules" aria-labelledby="ops-modules-title">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.modulesEyebrow}</span><h2 id="ops-modules-title">{t.modulesTitle}</h2><p>{t.modulesIntro}</p></div>
          <div className="ops-hub">
            <div><span className="ops-hub-label">{t.hubLabel}</span><h3>{t.hubTitle}</h3><div className="ops-hub-tags">{t.hubTags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
            <p>{t.hubBody}</p>
          </div>
          <div className="ops-apps">
            {t.apps.map((app, index) => (
              <article className="ops-app" key={app.title}>
                <div className="ops-app-art"><Image src={appImages[index]} alt="" width={180} height={150} sizes="(max-width: 600px) 80px, 120px" /></div>
                <div><span className="ops-app-task">{app.task}</span><h3>{app.title}</h3><p>{app.desc}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <OperationsDemo locale={locale} />

      <section className="block ops-trust" aria-labelledby="ops-trust-title">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.trustEyebrow}</span><h2 id="ops-trust-title">{t.trustTitle}</h2></div>
          <div className="ops-trust-grid">{t.trust.map((item, index) => <article key={item.title}><span className="ops-index">0{index + 1}</span><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div>
        </div>
      </section>

      <section className="block ops-onboarding" id="onboarding" aria-labelledby="ops-onboarding-title">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.stepsEyebrow}</span><h2 id="ops-onboarding-title">{t.stepsTitle}</h2><p>{t.stepsIntro}</p></div>
          <ol className="ops-steps">{t.steps.map((step, index) => <li key={step.title}><span className="ops-step-number">0{index + 1}</span><span className="ops-step-owner">{step.when}</span><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
        </div>
      </section>

      <section className="block ops-value" aria-labelledby="ops-value-title">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.valueEyebrow}</span><h2 id="ops-value-title">{t.valueTitle}</h2><p>{t.valueIntro}</p></div>
          <div className="ops-value-grid">{t.value.map((item) => <article key={item.title}><span>{item.title}</span><h3>{item.question}</h3><p>{item.desc}</p></article>)}</div>
        </div>
      </section>

      <section className="block ops-faq" aria-labelledby="ops-faq-title">
        <div className="wrap ops-faq-grid">
          <div className="sec-head"><span className="eyebrow">{t.faqEyebrow}</span><h2 id="ops-faq-title">{t.faqTitle}</h2></div>
          <div>{t.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="ops-closing" aria-labelledby="ops-closing-title">
        <div className="wrap"><div className="ops-closing-panel"><span className="eyebrow">{t.closingEyebrow}</span><h2 id="ops-closing-title">{t.closingTitle}</h2><p>{t.closingBody}</p><Link href={contactHref} className="btn btn-light">{t.cta}<span aria-hidden="true">↗</span></Link><p className="ops-closing-note">{t.closingNote}</p></div></div>
      </section>
    </main>
  );
}
