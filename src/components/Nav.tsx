"use client";
import { useState } from "react";
import Link from "next/link";
import LangToggle from "./LangToggle";
import type { Locale } from "@/i18n";
import type { Dictionary } from "@/dictionaries/en";

export default function Nav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;
  const links = [
    { href: `${base}#platform`, label: dict.nav.platform },
    { href: `${base}#pillars`, label: dict.nav.pillars },
    { href: `${base}/products`, label: dict.nav.products },
    { href: `${base}#connections`, label: dict.nav.compounds },
    { href: `${base}#contact`, label: dict.nav.contact },
  ];

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href={base} className="brand">
          <span className="mark"><i /><i /><i /></span> PrimeStride&nbsp;AI <small>首越人工智慧</small>
        </Link>
        <nav className={`nav-links${open ? " open" : ""}`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <LangToggle locale={locale} />
          <Link href={`${base}#contact`} className="btn btn-primary">
            {dict.nav.bookConsult} <span className="chev">›</span>
          </Link>
          <button className="burger" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
