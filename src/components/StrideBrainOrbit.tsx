"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import StrideBrainSample from "./StrideBrainSample";
import type { Locale } from "@/i18n";

const images = ["zg-module-assistant.png", "product-customer-ai.png", "zg-module-quoting.png", "zg-module-workorders.png", "zg-module-analytics.png"];
const copy = {
  en: {
    hub: "Company knowledge", sub: "One shared foundation", label: "Explore the five applications", pause: "Pause motion", play: "Resume motion", sample: "Sample demonstration", source: "Your documents. Your rules.",
    apps: ["Knowledge assistant", "Customer service", "Quoting", "Work orders", "Analytics"],
    titles: ["An answer with its source.", "A reply grounded in your business.", "A quote ready for human review.", "The next action, in view.", "Your operations, in context."],
    bodies: ["Find specifications and SOPs in the knowledge your team already has.", "Use the same confirmed knowledge to answer a customer’s question.", "Bring requirements and pricing rules together before approval.", "Carry confirmed details forward and see what the job still needs.", "Explore margins and trends using the operational data available."],
    tags: ["Source available", "Company context", "Approval required", "Track the next step", "Available business data"],
  },
  zh: {
    hub: "企業知識中樞", sub: "團隊共同的知識基礎", label: "探索五大營運應用", pause: "暫停動畫", play: "繼續動畫", sample: "示範資料", source: "你的文件，你的業務規則。",
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
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [documentHidden, setDocumentHidden] = useState(false);
  const gradientId = useId();
  useEffect(() => {
    if (explorer) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [explorer]);
  useEffect(() => {
    if (explorer) return;
    const update = () => setDocumentHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (sceneRef.current) observer.observe(sceneRef.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [explorer]);
  useEffect(() => {
    if (paused || reduced || !visible || documentHidden) svgRef.current?.pauseAnimations();
    else svgRef.current?.unpauseAnimations();
  }, [paused, reduced, visible, documentHidden]);
  return <div className={`sb-system${explorer ? " sb-explorer" : " sb-arc-hero"}`}>
    {!explorer && <div className="sb-arc-scene" ref={sceneRef}>
      <svg ref={svgRef} className="sb-arc-svg" viewBox="0 0 600 440" aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f0edf6"/><stop offset=".48" stopColor="#d5cee5"/><stop offset="1" stopColor="#eeeaf7"/></linearGradient></defs>
        <path d="M 110 610 C 55 225 330 20 760 40" fill="none" stroke={`url(#${gradientId})`} strokeWidth="112" />
        <path d="M 53 610 C 0 190 330 -39 760 -16" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2" />
        {images.map((src,i) => <g key={src}>
          {!reduced && <animateMotion path="M 110 610 C 55 225 330 20 760 40" dur="22s" begin={`${-i * 4.4}s`} repeatCount="indefinite" calcMode="paced" />}
          <g transform={reduced ? `translate(${[108,165,294,460,620][i]} ${[398,240,118,65,44][i]})` : undefined}>
            <rect x="-40" y="-40" width="80" height="80" rx="23" fill={active===i ? "#eee8ff" : "#faf9fd"} stroke={active===i ? "#8d78eb" : "#ffffff"} strokeWidth="2" />
            <image href={`/visuals/${src}`} x="-36" y="-36" width="72" height="72" />
          </g>
        </g>)}
      </svg>
      <div className="sb-arc-caption"><strong>{t.hub}</strong><p>{locale === "zh" ? "讓每個應用，都有共同依據。" : "Shared knowledge. Connected work."}</p></div>
      {!reduced && <button type="button" className="sb-motion-toggle" aria-label={paused ? t.play : t.pause} title={paused ? t.play : t.pause} aria-pressed={paused} onClick={() => setPaused(p => !p)}>{paused ? "▷" : "Ⅱ"}</button>}
    </div>}
    <div className="sb-app-selector" role="group" aria-label={t.label}>{t.apps.map((name, i) => <button type="button" key={name} aria-pressed={active === i} aria-controls={panelId} onClick={() => setActive(i)}><span>0{i + 1}</span>{explorer && <Image src={`/visuals/${images[i]}`} alt="" width={56} height={56} />}<strong>{name}</strong>{explorer && <small>{t.bodies[i]}</small>}</button>)}</div>
    <div id={panelId} className="sb-preview" aria-live="polite" aria-atomic="true"><div className="sb-preview-content" key={active}><div className="sb-preview-top"><span>{explorer ? t.sample : t.apps[active]}</span><span>0{active + 1} / 05</span></div><h3>{t.titles[active]}</h3>{explorer ? <StrideBrainSample locale={locale} active={active} /> : <p>{t.bodies[active]}</p>}{explorer && <span className="sb-proof"><span aria-hidden="true">↳</span> {t.tags[active]}</span>}</div></div>
  </div>;
}
