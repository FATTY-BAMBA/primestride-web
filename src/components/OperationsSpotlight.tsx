import Link from "next/link";
import type { Locale } from "@/i18n";

export default function OperationsSpotlight({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="operations-spotlight" aria-labelledby="operations-spotlight-title">
    <div className="wrap operations-spotlight-grid">
      <div>
        <span className="eyebrow">{zh ? "六大模組已上線 · AI 營運大腦" : "Six live modules · AI 營運大腦"}</span>
        <h2 id="operations-spotlight-title">{zh ? "公司的經驗，接手每天的忙。" : "Put your company’s know-how to work."}</h2>
        <p>{zh ? "現有資料不用先整理，我們負責盤點與建置，讓公司的經驗支援客戶回覆、報價與工單追蹤。" : "Bring your existing data as it is. We organize and set it up to support customer replies, quoting and order tracking."}</p>
        <Link className="btn btn-primary" href={`/${locale}/ai-zhanggui#demo`}>{zh ? "體驗一筆訂單的流程" : "Explore one customer job"}<span aria-hidden="true"> ↗</span></Link>
      </div>
      <div className="operations-preview">
        <div className="operations-preview-head"><span>{zh ? "印刷業情境" : "A printing business"}</span><span>{zh ? "流程示意" : "Illustrative workflow"}</span></div>
        <p className="operations-question">{zh ? "「500 張 A3 海報，怎麼報價？」" : "“How much for 500 A3 posters?”"}</p>
        <ol>{(zh ? ["查詢公司的報價依據", "整理建議，交由人員確認", "追蹤工單進度"] : ["Find the company’s pricing knowledge", "Prepare a suggestion for human review", "Keep the job’s status in view"]).map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
        <div className="operations-preview-foot">{zh ? "同一份知識，支援每一步。" : "The same knowledge, at every step."}</div>
      </div>
    </div>
  </section>;
}
