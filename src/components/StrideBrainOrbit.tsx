"use client";

import { useId, useState } from "react";
import StrideBrainSample from "./StrideBrainSample";
import type { Locale } from "@/i18n";

const iconPaths = [
  "M12 5v15m0-15C9 3 5 3 2 5v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Z",
  "M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6",
  "M7 3h10a2 2 0 0 1 2 2v16l-3-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2ZM9 8h6M9 12h6M9 16h3",
  "M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM8 3v4m8-4v4M7 11h3m4 0h3M7 15h3",
  "M4 3v18h17M8 16v-5m5 5V7m5 9V4",
];

function ApplicationIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[index]} /></svg>;
}
const copy = {
  en: {
    hub: "Company knowledge", sub: "One shared foundation", label: "Explore the five applications", sample: "Sample demonstration", source: "Your documents. Your rules.", sources: ["SOPs", "Pricing", "Work records"], hint: "Choose an application. See it at work.",
    apps: ["Knowledge assistant", "Customer service", "Quoting", "Work orders", "Analytics"],
    titles: ["An answer with its source.", "A reply grounded in your business.", "A quote ready for human review.", "The next action, in view.", "Your operations, in context."],
    bodies: ["Find specifications and SOPs in the knowledge your team already has.", "Use the same confirmed knowledge to answer a customer’s question.", "Bring requirements and pricing rules together before approval.", "Carry confirmed details forward and see what the job still needs.", "Explore margins and trends using the operational data available."],
    tags: ["Source available", "Company context", "Approval required", "Track the next step", "Available business data"],
  },
  zh: {
    hub: "企業知識中樞", sub: "團隊共同的知識基礎", label: "探索五大營運應用", sample: "示範資料", source: "你的文件，你的業務規則。", sources: ["作業規範", "報價規則", "工作紀錄"], hint: "點選一個應用，看看它如何幫忙。",
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
  return <div className={`sb-system${explorer ? " sb-explorer" : " sb-connected-hero"}`}>
    {!explorer && <div className="sb-knowledge-scene">
      <div className="sb-scene-heading"><span>StrideBrain</span><span>{t.source}</span></div>
      <div className="sb-source-chips">{t.sources.map(source => <span key={source}>{source}</span>)}</div>
      <div className="sb-knowledge-core">
        <span className="sb-core-mark"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M16 4 28 10 16 16 4 10Z M4 16l12 6 12-6M4 22l12 6 12-6" /></svg></span>
        <div><strong>{t.hub}</strong><span>{t.sub}</span></div>
      </div>
      <svg className="sb-connectors" viewBox="0 0 500 46" preserveAspectRatio="none" aria-hidden="true">
        <path d="M250 0V20 M50 46V20H450V46 M150 20V46 M250 20V46 M350 20V46" />
        <path className="is-active" d={`M250 0 V20 H${50 + active * 100} V46`} />
        <path key={active} className="sb-connection-signal" pathLength="1" d={`M250 0 V20 H${50 + active * 100} V46`} />
      </svg>
    </div>}
    <div className="sb-app-selector" role="group" aria-label={t.label}>
      {t.apps.map((name, i) => <button type="button" key={name} aria-pressed={active === i} aria-controls={panelId} onClick={() => setActive(i)}>
        {explorer && <span className="sb-app-index">0{i + 1}</span>}
        <span className="sb-app-icon"><ApplicationIcon index={i} /></span>
        <strong>{name}</strong>
        {explorer && <small>{t.bodies[i]}</small>}
      </button>)}
    </div>
    {!explorer && <p className="sb-interaction-hint">{t.hint}<span aria-hidden="true"> ↓</span></p>}
    <div id={panelId} className="sb-preview" aria-live="polite" aria-atomic="true">
      <div className="sb-preview-content" key={active}>
        <div className="sb-preview-top"><span>{t.sample} · {t.apps[active]}</span><span>0{active + 1} / 05</span></div>
        <h3>{t.titles[active]}</h3>
        <StrideBrainSample locale={locale} active={active} compact={!explorer} />
        {explorer && <span className="sb-proof"><span aria-hidden="true">↳</span> {t.tags[active]}</span>}
      </div>
    </div>
  </div>;
}
