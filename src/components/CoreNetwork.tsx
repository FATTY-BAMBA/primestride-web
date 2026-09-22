"use client";

import { useId, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";

type Node = { slug: string; name: string; description: string };
const positions = [[22, 17], [78, 17], [16, 50], [84, 50], [23, 83], [77, 83]];

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
        <svg className="core-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {positions.map(([x, y], index) => <path key={index} d={`M ${x} ${y} L 50 50`} className={index === selected ? "selected" : ""} />)}
        </svg>
        <div className="core-art">
          <Image src="/visuals/hero-core-network.png" alt="" width={991} height={679} sizes="(max-width: 960px) 80vw, 440px" priority />
        </div>
        <div className="core-nodes" role="group" aria-label={zh ? "選擇產品" : "Select a product"}>
          {nodes.map((node, index) => (
            <button key={node.slug} type="button" className={`core-node${selected === index ? " is-selected" : ""}`}
              style={{ "--node-x": `${positions[index][0]}%`, "--node-y": `${positions[index][1]}%` } as CSSProperties}
              aria-pressed={selected === index} aria-controls={detailId} onClick={() => setSelected(index)}>
              <span className="core-node-index" aria-hidden="true">0{index + 1}</span>{node.name}
            </button>
          ))}
        </div>
      </div>
      <div className="core-detail" id={detailId}>
        <div aria-live="polite" aria-atomic="true"><strong>{active.name}</strong><p>{active.description}</p></div>
        <Link href={`/${locale}/products/${active.slug}`}>{zh ? "探索產品" : "Explore product"}<span aria-hidden="true"> ↗</span></Link>
      </div>
      <p className="core-hint">{zh ? "點選產品，找到適合團隊的切入點。" : "Select a product. Find your team’s starting point."}</p>
    </div>
  );
}
