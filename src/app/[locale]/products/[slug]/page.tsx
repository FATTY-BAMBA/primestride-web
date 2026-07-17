import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale, locales, type Locale } from "@/i18n";
import { products, getProduct, copy } from "@/content/products";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug }))
  );
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  return { title: `${product.name} · PrimeStride AI` };
}

export default function ProductPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);
  const product = getProduct(params.slug);
  if (!product) notFound();
  const c = copy(product, locale);
  const base = `/${locale}`;

  return (
    <main>
      <section className="pd-hero">
        <div className="wrap">
          <Link href={`${base}/products`} className="pd-back">← {dict.common.back}</Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
            <span className="pill-tag">{product.pillarTag}</span>
            {product.live && <span className="badge-live">{dict.common.live}</span>}
          </div>
          <h1>{product.name}</h1>
          <div className="zh">{product.zhName}</div>
          <div className="tag">{c.tagline}</div>
        </div>
      </section>

      <section className="pd-body">
        <div className="wrap pd-grid">
          <p className="pd-desc">{c.description}</p>
          <aside className="pd-side">
            <h4>{dict.common.highlights}</h4>
            <ul>
              {c.stats.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <Link href={`${base}#contact`} className="btn btn-primary" style={{ marginTop: 20 }}>
              {dict.common.bookConsult} <span className="chev">›</span>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
