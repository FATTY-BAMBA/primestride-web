import Link from "next/link";
import { copy, type Product } from "@/content/products";
import type { Locale } from "@/i18n";
import type { Dictionary } from "@/dictionaries/en";

export default function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const c = copy(product, locale);
  return (
    <div className="pcard">
      <div className="pcard-top">
        <span className="pill-tag">{product.pillarTag}</span>
        {product.live && <span className="badge-live">{dict.common.live}</span>}
      </div>
      <h3>{product.name}</h3>
      <div className="zh">{product.zhName}</div>
      <div className="tag">{c.tagline}</div>
      <ul className="stats">
        {c.stats.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <Link href={`/${locale}/products/${product.slug}`} className="pcard-link">
        {dict.common.learnMore} <span className="chev">›</span>
      </Link>
    </div>
  );
}
