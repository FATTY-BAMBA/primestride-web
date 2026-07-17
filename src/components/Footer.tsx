import Link from "next/link";
import { products } from "@/content/products";
import type { Locale } from "@/i18n";
import type { Dictionary } from "@/dictionaries/en";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-top">
          <div>
            <div className="brand"><span className="mark"><i /><i /><i /></span> PrimeStride&nbsp;AI</div>
            <p className="fdesc">{dict.footer.desc}</p>
          </div>
          <div className="foot-col">
            <h4>{dict.footer.productsTitle}</h4>
            {products.map((p) => (
              <Link key={p.slug} href={`${base}/products/${p.slug}`}>{p.name}</Link>
            ))}
          </div>
          <div className="foot-col">
            <h4>{dict.footer.platformTitle}</h4>
            <Link href={`${base}#platform`}>{dict.footer.howItWorks}</Link>
            <Link href={`${base}#pillars`}>{dict.footer.fivePillars}</Link>
            <Link href={`${base}#connections`}>{dict.footer.compounds}</Link>
          </div>
          <div className="foot-col">
            <h4>{dict.footer.companyTitle}</h4>
            <Link href={`${base}#contact`}>{dict.footer.contact}</Link>
            <Link href="#">{dict.footer.privacy}</Link>
            <a href="mailto:hello@primestrideai.com">hello@primestrideai.com</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 PrimeStride AI · 首越人工智慧</span>
          <span>{dict.footer.location}</span>
        </div>
      </div>
    </footer>
  );
}
