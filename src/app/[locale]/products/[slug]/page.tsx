import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale, locales, type Locale } from "@/i18n";
import { products, getProduct, copy } from "@/content/products";
import ProductVisual from "@/components/ProductVisual";

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
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
        <div className="wrap pd-hero-grid">
          <div>
            <Link href={`${base}/products`} className="pd-back">← {dict.common.back}</Link>
            <div className="pd-tags">
              <span className="pill-tag">{product.pillarTag}</span>
              {product.live && <span className="badge-live">{dict.common.live}</span>}
            </div>
            <h1>{product.name}</h1>
            <div className="zh">{product.zhName}</div>
            <div className="tag">{c.tagline}</div>
            <Link href={`${base}/contact?p=${product.slug}`} className="btn btn-primary" style={{ marginTop: 26 }}>
              {dict.common.bookConsult} <span className="chev">›</span>
            </Link>
          </div>
          <div className="pd-visual">
            <ProductVisual variant={product.visual} />
          </div>
        </div>
      </section>

      <section className="pd-section">
        <div className="wrap pd-grid">
          <div>
            <span className="eyebrow">{dict.common.overview}</span>
            <p className="pd-desc">{c.description}</p>
          </div>
          <aside className="pd-side">
            <h4>{dict.common.atAGlance}</h4>
            <ul>
              {c.stats.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="pd-section pd-features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{dict.common.keyFeatures}</span>
            <h2>{c.tagline}</h2>
          </div>
          <div className="feat-grid">
            {c.features.map((f, i) => (
              <div className="feat" key={i}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-section">
        <div className="wrap">
          <div className="who-band">
            <span className="eyebrow">{dict.common.whoForLabel}</span>
            <p>{c.whoFor}</p>
            <Link href={`${base}/contact?p=${product.slug}`} className="btn btn-light" style={{ marginTop: 22 }}>
              {dict.common.bookConsult} <span className="chev">›</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
