"use client";

import { useId, useState } from "react";
import type { Locale } from "@/i18n";
import type { ProductStory } from "@/content/product-stories";

export default function ProductExperience({ name, locale, story }: { name: string; locale: Locale; story: ProductStory }) {
  const [selected, setSelected] = useState(1);
  const panelId = useId();
  const active = story.steps[selected];
  const zh = locale === "zh";

  return <div className="product-experience">
    <div className="experience-head">
      <div><span className="experience-overline">{zh ? "產品情境" : "Inside the workflow"}</span><strong>{name}</strong></div>
      <span className="experience-sample">{zh ? "互動示例" : "Interactive example"}</span>
    </div>
    <p className="experience-context">{story.context}</p>
    <div className="experience-choices" role="group" aria-label={zh ? "探索工作流程" : "Explore the workflow"}>
      {story.steps.map((step, index) => <button type="button" key={step.label} aria-pressed={selected === index} aria-controls={panelId}
        className={selected === index ? "is-selected" : undefined} onClick={() => setSelected(index)}>
        <span aria-hidden="true">0{index + 1}</span>{step.label}
      </button>)}
    </div>
    <div className="experience-result" id={panelId} aria-live="polite" aria-atomic="true">
      <div className="experience-scene" key={active.label}>
        <div className="experience-kicker"><span>{active.kicker}</span><span aria-hidden="true">0{selected + 1} / 03</span></div>
        <h2>{active.title}</h2>
        <p>{active.body}</p>
        {active.rows ? <ul className="experience-rows">{active.rows.map(row => <li key={row.label}>
          <span>{row.label}</span><strong>{row.value}</strong>
          {row.progress !== undefined ? <span className="experience-bar" aria-hidden="true"><span style={{width:`${row.progress}%`}} /></span> : null}
        </li>)}</ul> : <div className="experience-answer-mark" aria-hidden="true"><span>↳</span><span>{zh ? "內容有脈絡，下一步更清楚。" : "Context in. A clearer next step."}</span></div>}
        <div className="experience-source"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6" /></svg><span>{active.source}</span></div>
      </div>
    </div>
    <div className="experience-foot"><span>{zh ? "點選上方步驟，探索不同畫面。" : "Choose a step to explore the workflow."}</span><span>{zh ? "示範資料" : "Sample data"}</span></div>
  </div>;
}
