import type { Locale } from "@/i18n";

export default function StrideBrainSample({ locale, active }: { locale: Locale; active: number }) {
  const zh = locale === "zh";
  return <div className="sb-sample">
    <div className="sb-sample-job"><span>{zh ? "印刷工作室 · 示範資料" : "PRINT STUDIO · SAMPLE DATA"}</span><strong>{zh ? "500 張 A3 海報" : "500 A3 posters"}</strong></div>
    {active === 0 && <><div className="sb-question">{zh ? "這筆訂單需要什麼檔案規格？" : "What artwork specifications does this job need?"}</div><p className="sb-answer">{zh ? "PDF 或 AI 檔案，300 dpi，四邊各留 3 mm 出血。" : "PDF or AI artwork at 300 dpi, with 3 mm bleed on each edge."}</p><details className="sb-source"><summary>{zh ? "查看來源 · 收檔規範，第 1 頁" : "View source · Artwork checklist, p.1"}</summary><p>{zh ? "示範文件摘錄：印刷檔案須為 PDF／AI，解析度 300 dpi，出血 3 mm。" : "Sample document excerpt: Supply PDF/AI files, resolution 300 dpi, bleed 3 mm."}</p></details></>}
    {active === 1 && <><div className="sb-question">{zh ? "週五前可以拿到嗎？" : "Can I collect these by Friday?"}</div><p className="sb-answer">{zh ? "標準製作時間為完稿確認後 3 個工作天。請先確認完稿時間，再核對交期。" : "Standard production takes 3 working days after artwork approval. Confirm the approval date before committing to Friday."}</p><span className="sb-evidence">{zh ? "依據：報價與交期表 · 第 2 頁" : "Basis: Price & lead-time sheet · p.2"}</span></>}
    {active === 2 && <><div className="sb-quote-row"><span>{zh ? "報價建議區間" : "Suggested quote range"}</span><strong>NT$ 6,800–7,400</strong></div><div className="sb-specs"><span>A3 / 500</span><span>{zh ? "150g 銅版紙" : "150gsm coated paper"}</span></div><p className="sb-review-note">{zh ? "待人工確認：材質、毛利與交期。確認後再分享給客戶。" : "Human review required: material, margin and delivery date. Approve before sharing."}</p></>}
    {active === 3 && <><div className="sb-order-id">PS-0500 <span>{zh ? "待確認完稿" : "Awaiting artwork approval"}</span></div><ol className="sb-job-stages">{(zh ? ["完稿確認", "生產", "完成"] : ["Artwork", "Production", "Ready"]).map((s,i)=><li key={s} className={i===0 ? "current" : ""}><span>0{i+1}</span>{s}</li>)}</ol><p className="sb-answer">{zh ? "下一步：確認客戶提供的印刷檔案。" : "Next action: confirm the customer’s print-ready file."}</p></>}
    {active === 4 && <><div className="sb-question">{zh ? "哪些訂單還在等確認？" : "Which jobs are waiting for confirmation?"}</div><div className="sb-analytics-row"><strong>PS-0500</strong><span>{zh ? "完稿確認" : "Artwork approval"}</span><b>01</b></div><p className="sb-answer">{zh ? "這份示範資料包含 1 筆待確認工單。實際分析範圍依可用營運資料而定。" : "This sample contains one job awaiting approval. Analysis depends on the operational data available."}</p></>}
  </div>;
}
