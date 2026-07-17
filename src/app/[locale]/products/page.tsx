import { getDictionary, isLocale, type Locale } from "@/i18n";
import { notFound } from "next/navigation";
import { products } from "@/content/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsIndex({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return (
    <main>
      <section className="block">
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
    </main>
  );
}
