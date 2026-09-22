import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { notFound } from "next/navigation";
import { products, copy } from "@/content/products";
import { pillars, pillarCopy } from "@/content/pillars";
import ProductCard from "@/components/ProductCard";
import CoreNetwork from "@/components/CoreNetwork";
import ConnectionExplorer from "@/components/ConnectionExplorer";
import OperationsSpotlight from "@/components/OperationsSpotlight";

export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);
  const base = `/${locale}`;

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{dict.hero.eyebrow}</span>
            <h1>
              {dict.hero.title} <span className="accent">{dict.hero.titleAccent}</span>
            </h1>
            <p className="lead">{dict.hero.lead}</p>
            <div className="hero-cta">
              <Link href={`${base}/products`} className="btn btn-primary">
                {dict.hero.ctaPrimary} <span className="chev">›</span>
              </Link>
              <Link href={`${base}#platform`} className="btn btn-ghost">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </div>
          <CoreNetwork locale={locale} nodes={products.map((product) => ({
            slug: product.slug,
            name: product.name === "AI Customer Assistant" ? (locale === "zh" ? "AI 客服" : "Customer AI") : product.name === "AI Knowledge Assistant" ? (locale === "zh" ? "AI 知識助理" : "Knowledge AI") : product.name,
            description: copy(product, locale).tagline,
          }))} />
        </div>
      </section>

      {/* METRICS */}
      <div className="metrics">
        <div className="wrap metrics-in">
          {dict.metrics.map((m, i) => (
            <div key={i}>
              <b>{m.n}</b>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PLATFORM */}
      <section className="block arch" id="platform">
        <div className="wrap">
          <span className="eyebrow">{dict.platform.eyebrow}</span>
          <h2>{dict.platform.title}</h2>
          <p>{dict.platform.intro}</p>
          <div className="row">
            {dict.platform.boxes.map((b, i) => (
              <div className="box" key={i}>
                <h3>{b.h}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OperationsSpotlight locale={locale} />

      {/* PILLARS */}
      <section className="block" id="pillars">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{dict.pillarsSec.eyebrow}</span>
            <h2>{dict.pillarsSec.title}</h2>
            <p>{dict.pillarsSec.intro}</p>
          </div>
          <div className="pillars">
            {pillars.map((p) => {
              const c = pillarCopy(p, locale);
              return (
                <div className={`pillar${p.finance ? " fin" : ""}`} key={p.char}>
                  <div className="ch">{p.char}</div>
                  <h3>{c.name}</h3>
                  <div className="en">{c.domain}</div>
                  <p>{c.desc}</p>
                  <div className="who">{c.who}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="block" id="products" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{dict.productsSec.eyebrow}</span>
            <h2>{dict.productsSec.title}</h2>
            <p>{dict.productsSec.intro}</p>
          </div>
          <div className="prodgrid">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      {/* CONNECTIONS */}
      <section className="block conn-sec" id="connections">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">{dict.connections.eyebrow}</span>
            <h2>{dict.connections.title}</h2>
            <p>{dict.connections.intro}</p>
          </div>
          <ConnectionExplorer locale={locale} live={dict.connections.live} planned={dict.connections.plan} />
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="wrap cta-in">
          <h2>{dict.cta.title}</h2>
          <p>{dict.cta.desc}</p>
          <div className="hero-cta">
            <a href={`${base}/contact`} className="btn btn-light">
              {dict.cta.primary} <span className="chev">›</span>
            </a>
            <Link href={`${base}/products`} className="btn btn-outline-light">
              {dict.cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
