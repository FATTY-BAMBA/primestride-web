import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { getProduct } from "@/content/products";
import { getProductStory } from "@/content/product-stories";
import ProductExperience from "@/components/ProductExperience";

export default function ProductHero({ slug, locale, name, tagline, category }: { slug: string; locale: Locale; name: string; tagline: string; category: string }) {
  const product = getProduct(slug)!;
  const story = getProductStory(slug, locale);
  const zh = locale === "zh";
  return <section className="product-hero" aria-labelledby="product-title">
    <div className="wrap">
      <Link href={`/${locale}/products`} className="pd-back">← {zh ? "全部產品" : "All products"}</Link>
      <div className="product-hero-grid">
        <div className="product-hero-copy">
          <div className="product-identity"><Image src={product.img} alt="" width={62} height={62} priority /><span>{category}<span className="product-live">{zh ? "已上線" : "Live product"}</span></span></div>
          <h1 id="product-title">{name}</h1>
          <p className="product-benefit">{tagline}</p>
          <p className="product-summary">{story.summary}</p>
          <div className="hero-cta">
            <Link href={`/${locale}/contact?p=${slug}`} className="btn btn-primary">{zh ? "預約產品展示" : "Book a product demo"}<span aria-hidden="true"> ↗</span></Link>
            <a href="#demo" className="btn btn-ghost">{zh ? "看看實際情境" : "See it in practice"}<span aria-hidden="true"> ↓</span></a>
          </div>
          <p className="product-family">{zh ? "由首越打造，從團隊真正需要的地方開始。" : "Built by PrimeStride. Start where your team needs it."}</p>
        </div>
        <ProductExperience name={name} locale={locale} story={story} />
      </div>
    </div>
  </section>;
}
