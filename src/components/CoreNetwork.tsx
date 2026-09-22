"use client";

import { useId, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";

type Node = { slug: string; name: string; description: string };

export default function CoreNetwork({ locale, nodes }: { locale: Locale; nodes: Node[] }) {
  const [selected, setSelected] = useState(0);
  const detailId = useId();
  const zh = locale === "zh";
  const active = nodes[selected];

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--tilt-x", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -6}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 6}deg`);
  }

  return (
    <div className="core-explorer">
      <div className="core-caption"><span>{zh ? "探索 PrimeStride" : "Explore PrimeStride"}</span><span>01 — 06</span></div>
      <div className="core-stage" onPointerMove={tilt} onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--tilt-x", "0deg");
        event.currentTarget.style.setProperty("--tilt-y", "0deg");
      }}>
        <div className="core-art">
          <Image src="/visuals/hero-core-network.png" alt="" width={991} height={679} sizes="(max-width: 600px) 90vw, 540px" priority />
        </div>
      </div>
      <div className="core-nodes" role="group" aria-label={zh ? "選擇產品" : "Select a product"}>
          {nodes.map((node, index) => (
            <button key={node.slug} type="button" className={`core-node${selected === index ? " is-selected" : ""}`}
              aria-pressed={selected === index} aria-controls={detailId} onClick={() => setSelected(index)}>
              <span className="core-node-index" aria-hidden="true">0{index + 1}</span>{node.name}
            </button>
          ))}
      </div>
      <div className="core-detail" id={detailId}>
        <div aria-live="polite" aria-atomic="true"><strong>{active.name}</strong><p>{active.description}</p></div>
        <Link href={`/${locale}/products/${active.slug}`}>{zh ? "探索產品" : "Explore product"}<span aria-hidden="true"> ↗</span></Link>
      </div>
    </div>
  );
}
