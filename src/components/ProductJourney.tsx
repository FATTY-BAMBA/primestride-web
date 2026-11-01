import type { Locale } from "@/i18n";
import { getProductStory } from "@/content/product-stories";

export default function ProductJourney({ slug, locale }: { slug: string; locale: Locale }) {
  const story = getProductStory(slug, locale);
  return <ol className="product-journey">{story.steps.map((step, index) => <li key={step.label}>
    <span className="journey-number" aria-hidden="true">0{index + 1}</span><h3>{step.label}</h3><p>{step.body}</p>
  </li>)}</ol>;
}
