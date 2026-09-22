"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n";

const copy = {
  en: {
    eyebrow: "Explore the workflow", title: "One customer question. See what happens next.",
    intro: "Follow a printing job through four modules, using the same company knowledge.",
    sample: "Interactive example · Sample data", business: "Printing studio", job: "500 A3 posters · 150gsm coated paper",
    steps: ["Find the knowledge", "Answer on LINE", "Review the quote", "See job status"],
    headings: ["Start with what your team already knows.", "Give customers an answer they can trust.", "Bring the pricing knowledge into view.", "Give everyone a clear view of the job."],
    descriptions: [
      "Your specifications, lead times and past quotes provide the context for the next steps.",
      "A source-backed reply answers the customer’s question. Your team can inspect the underlying document.",
      "A quote suggestion brings the requirements and past pricing together for your team to review.",
      "An example order shows how staff can see its current stage and what still needs attention.",
    ],
    docs: ["Price & lead-time sheet", "Artwork checklist", "Past quotes"], docMeta: ["Lead times · p.2", "File specifications · p.1", "14 similar jobs · sample archive"],
    question: "Hi — 500 A3 posters. What’s the lead time, and what file do you need?",
    answer: "The standard lead time is 3 working days after artwork approval. Please send a PDF or AI file at 300 dpi, with 3 mm bleed.",
    source: "Inspect the sample source", excerpt: "Price & lead-time sheet, p.2: A3, 500 copies — standard production: 3 working days after artwork approval. Artwork checklist, p.1: PDF/AI, 300 dpi, 3 mm bleed.",
    quoteLabel: "Suggested range", quote: "NT$ 6,800–7,400", quoteBasis: "Illustrative range from the existing product example. A real quote depends on your company’s pricing rules.",
    review: "Human review", checks: ["Confirm material and quantity", "Check margin and delivery date", "Approve before sharing with the customer"],
    order: "Sample order · PS-0500", states: ["Artwork review", "Production", "Ready"], current: "Awaiting artwork approval", nextAction: "Next action: confirm the customer’s print-ready file.",
    next: "Next step", restart: "Start again", footer: "All six modules are live. This walkthrough uses sample data and does not send messages or create orders.",
    cta: "Show me this with my business",
  },
  zh: {
    eyebrow: "互動體驗", title: "從客戶的一個問題，看見接下來每一步。",
    intro: "以一筆印刷訂單為例，看看同一份公司知識如何支援四個模組。",
    sample: "互動示例 · 示範資料", business: "印刷工作室", job: "500 張 A3 海報 · 150g 銅版紙",
    steps: ["找到公司知識", "回覆 LINE 詢問", "審核報價建議", "查看工單進度"],
    headings: ["從團隊已經累積的經驗開始。", "給客戶有依據的回答。", "讓報價的依據看得見。", "讓每個人都掌握訂單進度。"],
    descriptions: [
      "規格、交期與歷史報價，成為接下來每一步的參考依據。",
      "依公司文件回答客戶問題，團隊可以展開查看原始出處。",
      "把需求與歷史價格整理成報價建議，交由團隊確認。",
      "用一筆示範工單，看看員工如何掌握目前進度與待辦事項。",
    ],
    docs: ["報價與交期表", "收檔規範", "歷史報價"], docMeta: ["交期 · 第 2 頁", "檔案規格 · 第 1 頁", "14 筆類似訂單 · 示範資料"],
    question: "你好，500 張 A3 海報，交期多久？需要什麼檔案？",
    answer: "稿件確認後，標準交期為 3 個工作天。請提供 PDF 或 AI 檔，解析度 300 dpi，並保留 3 mm 出血。",
    source: "查看示範出處", excerpt: "報價與交期表，第 2 頁：A3、500 張，稿件確認後標準製作時間為 3 個工作天。收檔規範，第 1 頁：PDF／AI、300 dpi、3 mm 出血。",
    quoteLabel: "建議價格區間", quote: "NT$ 6,800–7,400", quoteBasis: "沿用產品頁範例的示意價格。實際報價須依貴公司的價格規則計算。",
    review: "由人員確認", checks: ["確認材質與數量", "檢查毛利與交期", "核准後再提供給客戶"],
    order: "示範工單 · PS-0500", states: ["確認稿件", "製作中", "可出貨"], current: "等待稿件確認", nextAction: "下一步：確認客戶提供的完稿檔案。",
    next: "看下一步", restart: "重新體驗", footer: "六大模組皆已上線。此體驗使用示範資料，不會傳送訊息或建立實際訂單。",
    cta: "看看我的公司如何應用",
  },
};

export default function OperationsDemo({ locale }: { locale: Locale }) {
  const [step, setStep] = useState(0);
  const panelId = useId();
  const t = copy[locale];
  return <section className="block operations-demo-section" id="demo" aria-labelledby="operations-demo-title">
    <div className="wrap">
      <div className="sec-head"><span className="eyebrow">{t.eyebrow}</span><h2 id="operations-demo-title">{t.title}</h2><p>{t.intro}</p></div>
      <div className="operations-demo">
        <div className="demo-topbar"><strong>AI 營運大腦</strong><span>{t.sample}</span></div>
        <div className="demo-steps" role="group" aria-label={locale === "zh" ? "選擇流程步驟" : "Select a workflow step"}>
          {t.steps.map((label, index) => <button type="button" key={label} aria-pressed={step === index} aria-controls={panelId}
            className={step === index ? "is-selected" : ""} onClick={() => setStep(index)}><span>0{index + 1}</span>{label}</button>)}
        </div>
        <div className="demo-workspace">
          <aside className="demo-context"><span className="demo-kicker">{t.business}</span><h3>{t.job}</h3>
            <div className="demo-progress" aria-hidden="true">{t.steps.map((label, index) => <div key={label} className={step === index ? "is-selected" : ""}><span>{index + 1}</span>{label}</div>)}</div>
            <Link href={`/${locale}/contact?p=ai-zhanggui`} className="demo-contact">{t.cta} <span aria-hidden="true">↗</span></Link>
          </aside>
          <div className="demo-main" id={panelId} aria-live="polite" aria-atomic="true">
            <div className="demo-panel" key={step}>
              <h3>{t.headings[step]}</h3><p className="demo-description">{t.descriptions[step]}</p>
              {step === 0 && <div className="demo-documents">{t.docs.map((doc, index) => <div className="demo-document" key={doc}><span className="document-icon" aria-hidden="true">{index === 2 ? "XLS" : "PDF"}</span><div><strong>{doc}</strong><span>{t.docMeta[index]}</span></div></div>)}</div>}
              {step === 1 && <div className="demo-conversation"><div className="demo-question">{t.question}</div><div className="demo-answer"><strong>AI 營運大腦</strong><p>{t.answer}</p><details><summary>{t.source}</summary><p>{t.excerpt}</p></details></div></div>}
              {step === 2 && <div className="demo-quote"><span className="demo-kicker">{t.quoteLabel}</span><strong className="demo-price">{t.quote}</strong><p>{t.quoteBasis}</p><div className="demo-review"><strong>{t.review}</strong><ul>{t.checks.map((check) => <li key={check}>{check}</li>)}</ul></div></div>}
              {step === 3 && <div className="demo-order"><span className="demo-kicker">{t.order}</span><strong>{t.current}</strong><ol>{t.states.map((state, index) => <li key={state} className={index === 0 ? "is-selected" : ""}><span aria-hidden="true">0{index + 1}</span>{state}</li>)}</ol><p>{t.nextAction}</p></div>}
            </div>
          </div>
        </div>
        <div className="demo-footer"><p>{t.footer}</p><button type="button" className="btn btn-primary" onClick={() => setStep((current) => (current + 1) % t.steps.length)}>{step === t.steps.length - 1 ? t.restart : t.next}<span aria-hidden="true"> →</span></button></div>
      </div>
    </div>
  </section>;
}
