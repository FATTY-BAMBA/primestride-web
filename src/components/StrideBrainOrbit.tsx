"use client";

import { useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import StrideBrainSample from "./StrideBrainSample";
import type { Locale } from "@/i18n";

const images = ["zg-module-assistant.png", "product-customer-ai.png", "zg-module-quoting.png", "zg-module-workorders.png", "zg-module-analytics.png"];
const copy = {
  en: {
    hub: "Company knowledge", sub: "One shared foundation", label: "Explore the five applications", pause: "Pause motion", play: "Resume motion", sample: "Illustrative workflow", source: "Your documents. Your rules.",
    apps: ["Knowledge assistant", "Customer service", "Quoting", "Work orders", "Analytics"],
    titles: ["An answer with its source.", "A reply grounded in your business.", "A quote ready for human review.", "The next action, in view.", "Your operations, in context."],
    bodies: ["Find specifications and SOPs in the knowledge your team already has.", "Use the same confirmed knowledge to answer a customer’s question.", "Bring requirements and pricing rules together before approval.", "Carry confirmed details forward and see what the job still needs.", "Explore margins and trends using the operational data available."],
    tags: ["Source available", "Company context", "Approval required", "Track the next step", "Available business data"],
  },
  zh: {
    hub: "企業知識中樞", sub: "團隊共同的知識基礎", label: "探索五大營運應用", pause: "暫停動畫", play: "繼續動畫", sample: "工作流程示意", source: "你的文件，你的業務規則。",
    apps: ["知識助理", "AI 客服", "AI 報價", "工單管理", "數據分析"],
    titles: ["有答案，也有出處。", "讓客戶收到有依據的回答。", "準備報價，交由團隊確認。", "下一步要做什麼，一目了然。", "讓營運資料，成為判斷依據。"],
    bodies: ["從團隊既有的知識，查詢規格、SOP 與過往經驗。", "用同一份確認過的公司知識，回覆客戶的日常詢問。", "整合需求與報價規則，核對確認後再交給客戶。", "延續已確認的資訊，掌握工單進度與待補事項。", "依可用的營運資料，檢視毛利、效率與品項趨勢。"],
    tags: ["可核對來源", "依據公司知識", "需要人工確認", "掌握下一步", "依可用資料分析"],
  },
};

export default function StrideBrainOrbit({ locale, explorer = false }: { locale: Locale; explorer?: boolean }) {
  const t = copy[locale];
  const panelId = useId();
  const [active, setActive] = useState(0);
  return <div className={`sb-system${explorer ? " sb-explorer" : ""}`} style={{ "--selection": `${active * -72}deg`, "--selection-counter": `${active * 72}deg` } as CSSProperties}>
    {!explorer && <div className="sb-orbit-scene" aria-hidden="true">
      <div className="sb-track" /><div className="sb-track sb-track-inner" />
      <div className="sb-core"><div className="sb-core-symbol"><i /><i /><i /></div><strong>{t.hub}</strong><span>{t.sub}</span></div>
      <div className="sb-orbit">
        {images.map((src, i) => <div className="sb-arm" key={src} style={{ "--angle": `${i * 72}deg`, "--counter": `${i * -72}deg` } as CSSProperties}><div className="sb-satellite"><div className={`sb-icon${active === i ? " is-active" : ""}`}><Image src={`/visuals/${src}`} alt="" width={80} height={80} sizes="80px" priority={i === 0} /></div></div></div>)}
      </div>
      <span className="sb-source-note">{t.source}</span>
    </div>}
    <div className="sb-app-selector" role="group" aria-label={t.label}>{t.apps.map((name, i) => <button type="button" key={name} aria-pressed={active === i} aria-controls={panelId} onClick={() => setActive(i)}><span>0{i + 1}</span>{explorer && <Image src={`/visuals/${images[i]}`} alt="" width={56} height={56} />}<strong>{name}</strong>{explorer && <small>{t.bodies[i]}</small>}</button>)}</div>
    <div id={panelId} className="sb-preview" aria-live="polite" aria-atomic="true"><div className="sb-preview-content" key={active}><div className="sb-preview-top"><span>{t.sample}</span><span>0{active + 1} / 05</span></div><h3>{t.titles[active]}</h3><StrideBrainSample locale={locale} active={active} /><span className="sb-proof"><span aria-hidden="true">↳</span> {t.tags[active]}</span></div></div>
  </div>;
}
