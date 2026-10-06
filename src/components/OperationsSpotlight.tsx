import Link from "next/link";
import type { Locale } from "@/i18n";

export default function OperationsSpotlight({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="operations-spotlight" aria-labelledby="operations-spotlight-title">
    <div className="wrap operations-spotlight-grid">
      <div>
        <span className="eyebrow">{zh ? "AI 營運大腦 · 中小企業營運平台" : "StrideBrain · SME operations platform"}</span>
        <h2 id="operations-spotlight-title">{zh ? "公司的經驗，接手每天的忙。" : "Put your company’s know-how to work."}</h2>
        <p>{zh ? "一個企業知識中樞，支援五大營運應用。現有資料原樣交給我們，讓公司的經驗支援客戶回覆、報價與工單追蹤。" : "One company knowledge hub supporting five applications. Bring your existing files; we organize and set them up to support answers, quotes and job tracking."}</p>
        <Link className="btn btn-primary" href={`/${locale}/stridebrain#demo`}>{zh ? "體驗一筆訂單的流程" : "Explore one customer job"}<span aria-hidden="true"> ↗</span></Link>
      </div>
      <div className="operations-preview">
        <div className="operations-preview-head"><span>{zh ? "印刷業情境" : "A printing business"}</span><span>{zh ? "詢問 → 報價 → 生產" : "Enquiry → Quote → Production"}</span></div>
        <p className="operations-question">{zh ? "「500 張 A3 海報，怎麼報價？」" : "“How much for 500 A3 posters?”"}</p>
        <ol>{(zh ? ["查詢公司的報價依據", "整理建議，交由人員確認", "追蹤工單進度"] : ["Find the company’s pricing knowledge", "Prepare a suggestion for human review", "Keep the job’s status in view"]).map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
        <div className="operations-preview-foot">{zh ? "同一份知識，支援每一步。" : "The same knowledge, at every step."}</div>
      </div>
    </div>
  </section>;
}
