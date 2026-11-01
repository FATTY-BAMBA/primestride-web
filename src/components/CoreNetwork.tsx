"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n";

type Node = { slug: string; name: string; description: string };

const productDetails: Record<string, { en: string; zh: string; icon: string }> = {
  "atlas-eip": { en: "People & HR", zh: "人資與團隊", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8m4 9v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
  "lyra-ai": { en: "Interview coaching", zh: "面試與人才", icon: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" },
  "edusense-ai": { en: "Learning intelligence", zh: "教育與培訓", icon: "m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v9" },
  "ai-customer-assistant": { en: "Customer service", zh: "客戶服務", icon: "M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 19 0ZM7 9h10M7 13h6" },
  pulse: { en: "Marketing", zh: "行銷與成長", icon: "M3 20h18M5 16l5-6 4 3 6-9M15 4h5v5" },
  "ai-knowledge-assistant": { en: "Company knowledge", zh: "企業知識", icon: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" },
};

export default function CoreNetwork({ locale, nodes }: { locale: Locale; nodes: Node[] }) {
  const [selected, setSelected] = useState(0);
  const detailId = useId();
  const zh = locale === "zh";
  const active = nodes[selected];

  return <div className="core-explorer">
    <div className="core-caption">
      <span>{zh ? "探索產品家族" : "Explore the product family"}</span>
      <span className="core-live"><i aria-hidden="true" />{zh ? `${nodes.length} 項產品已上線` : `${nodes.length} products live`}</span>
    </div>
    <div className="core-foundation">
      <div className="core-foundation-heading">
        <span className="core-brand-mark" aria-hidden="true"><span className="mark"><i /><i /><i /></span></span>
        <div><strong>PrimeStride AI</strong><span>{zh ? "為企業日常，打造實用的 AI。" : "AI built around your business."}</span></div>
      </div>
      <div className="core-foundation-foot"><span>{zh ? "從一項產品開始" : "Start with one product"}</span><span>{zh ? "隨需求逐步擴展" : "Grow with your needs"}</span></div>
    </div>
    <p className="core-selection-hint">{zh ? "選一項產品，看看它能幫上什麼忙。" : "Choose a product. Find your starting point."}</p>
    <div className="core-nodes" role="group" aria-label={zh ? "選擇產品" : "Select a product"}>
      {nodes.map((node, index) => {
        const details = productDetails[node.slug];
        return <button key={node.slug} type="button" className={`core-node${selected === index ? " is-selected" : ""}`}
          aria-pressed={selected === index} aria-controls={detailId} onClick={() => setSelected(index)}>
          <span className="core-node-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={details?.icon} /></svg><span className="core-node-index" aria-hidden="true">0{index + 1}</span></span>
          <strong>{node.name}</strong><small>{details?.[locale]}</small>
        </button>;
      })}
    </div>
    <div className="core-detail" id={detailId} aria-live="polite" aria-atomic="true">
      <div className="core-detail-content" key={active.slug}>
        <div className="core-detail-label"><span>{zh ? "產品介紹" : "Product spotlight"}</span><span>0{selected + 1} / 0{nodes.length}</span></div>
        <strong>{active.name}</strong><p>{active.description}</p>
        <Link href={`/${locale}/products/${active.slug}`}>{zh ? "了解產品" : "Explore product"}<span aria-hidden="true"> ↗</span></Link>
      </div>
    </div>
  </div>;
}
