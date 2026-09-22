"use client";

import { useId, useState } from "react";
import type { Locale } from "@/i18n";

type Connection = { pair: string; p: string };

export default function ConnectionExplorer({ locale, live, planned }: { locale: Locale; live: Connection[]; planned: Connection[] }) {
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const zh = locale === "zh";
  const connections = [...live.map((item) => ({ ...item, live: true })), ...planned.map((item) => ({ ...item, live: false }))];
  const item = connections[selected];
  const routes = zh ? [
    ["AI 知識助理", "員工手冊與政策", "Atlas EIP", "附出處的員工解答"],
    ["教材收錄", "機構教材", "EduSense AI", "學習洞察"],
    ["LyraAI", "面試能力資料", "Atlas EIP", "員工發展計畫"],
    ["AI 客服", "客戶問題", "Pulse", "行銷方向"],
    ["AI 知識助理", "公司知識", "AI 客服", "對外解答"],
  ] : [
    ["Knowledge Assistant", "Handbooks & policies", "Atlas EIP", "Source-cited staff answers"],
    ["Course ingestion", "Institution materials", "EduSense AI", "Learning insights"],
    ["LyraAI", "Interview competencies", "Atlas EIP", "Employee development"],
    ["Customer Assistant", "Customer questions", "Pulse", "Campaign direction"],
    ["Knowledge Assistant", "Company knowledge", "Customer Assistant", "Customer answers"],
  ];
  const route = routes[selected];

  return <div className="connection-explorer">
    <div className="connection-options" role="group" aria-label={zh ? "探索串聯情境" : "Explore connections"}>
      {connections.map((connection, index) => <button type="button" key={connection.pair} aria-pressed={selected === index} aria-controls={panelId}
        className={selected === index ? "is-selected" : ""} onClick={() => setSelected(index)}>
        <span className="connection-number">0{index + 1}</span>
        <span>{connection.pair}<small>{connection.live ? (zh ? "已上線" : "Live today") : (zh ? "規劃中" : "Planned")}</small></span>
        <span aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div className="connection-panel" id={panelId} aria-live="polite" aria-atomic="true">
      <span className={`connection-status${item.live ? " live" : ""}`}>{item.live ? (zh ? "已上線的應用" : "Live connection") : (zh ? "規劃中的串聯" : "Planned connection")}</span>
      <div className="connection-flow" key={selected}>
        <div className="connection-end"><span>{route[1]}</span><strong>{route[0]}</strong></div>
        <div className="connection-path" aria-hidden="true"><span /></div>
        <div className="connection-core"><span className="mark" aria-hidden="true"><i /><i /><i /></span><strong>{selected === 1 ? "EduSense" : "PrimeStride"}</strong><span>{zh ? "知識層" : "Knowledge layer"}</span></div>
        <div className="connection-path" aria-hidden="true"><span /></div>
        <div className="connection-end"><span>{route[3]}</span><strong>{route[2]}</strong></div>
      </div>
      <h3>{item.pair}</h3><p>{item.p}</p>
      {!item.live && <p className="connection-note">{zh ? "此為規劃中的應用方向；實際可用範圍請於諮詢時確認。" : "This workflow is planned. Confirm availability for your rollout during a consultation."}</p>}
    </div>
  </div>;
}
