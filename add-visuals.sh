#!/usr/bin/env bash
# PrimeStride — add 3D visuals v2 (retry-safe, safe to re-run)
# Usage: drop this file in the repo root, then:  bash add-visuals.sh
set -e
cd "$(dirname "$0")"

dl() { # dl <url> <out> — retry up to 5 times
  for i in 1 2 3 4 5; do
    if curl -fsSL --connect-timeout 20 "$1" -o "$2"; then return 0; fi
    echo "  retry $i for $(basename "$2")"; sleep 2
  done
  echo "FAILED to download $2 after 5 tries"; exit 1
}

echo "→ downloading visuals to public/visuals/"
mkdir -p public/visuals
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F1bd05f4d460b0c72b54c9ec4669b01b043b7f6fa2026d69659753baef4319a09?filename=hero-core-network.png&sig=2o_KD_xvWiIGluwbkDVnyWTtbqnCwXCO4Yydxe8lVAY=&t=o" public/visuals/hero-core-network.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fb7af9d40d4d59d2def88bd354f55c1b092227f9f6d7a6c94975ad80a758fd6b7?filename=product-atlas-eip.png&sig=OkhSsJDaiEounBH3O2OTpW63K65PU4Hnwd8lYjQUwZQ=&t=o" public/visuals/product-atlas-eip.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F687a4ef18b821c89bb58504359ab1836d575105664d50772ab4c6d2133af9e09?filename=product-lyraai.png&sig=ci5anTu5kEyd9j_jeXJ9gDWP6tzvU3w0RoXzuEFqbEg=&t=o" public/visuals/product-lyraai.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F388a51f8d87b19ba92966704338d8bf2f54fe0fcea880bdcf007722569cf40c7?filename=product-edusense.png&sig=TzbksctjPxQdlK8i-HNyCms7HkMJbwCmECaKkCqOoYc=&t=o" public/visuals/product-edusense.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F22f948b14004745d34350b8df3e09b2a9385e6677df93c8f8e86588317201de7?filename=product-customer-ai.png&sig=comKZ4GgBWxkPmrnpnSHXDvDAAgTvQJzb2YcwL7ISBM=&t=o" public/visuals/product-customer-ai.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fd3d7a540b9550b093d24bbdc20b0b5b982784319586f9f41f6f3de916df66746?filename=product-pulse.png&sig=o-j5mmNyIWeNDeGoLogYnnxDqd8gd1YoVmKgaSeu94U=&t=o" public/visuals/product-pulse.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fe8acf7d9ccb39331ddcf5ce77433dfaeae07fe1e480ca30905249738d40cdd6f?filename=product-knowledge-ai.png&sig=SYXHuQU0tQRPFQB8DqIspfmmnp8SgG7Rz3u7S46d15g=&t=o" public/visuals/product-knowledge-ai.png
dl "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F35871802fd0cbedf1dc02a91c815a4e008e6cb7907a6e5a9fa5833d95ede52f8?filename=section-compounds.png&sig=V9Pz8C7X5HPnJCazwQJvLfWsCIWwW2fTkPtRfKn1DQQ=&t=o" public/visuals/section-compounds.png
echo "  8 images saved"

echo "→ patching src/content/products.ts, homepage, product page, globals.css"
python3 - <<'PY'
import io, sys

def patch(path, pairs, done_marker):
    s = io.open(path, encoding="utf-8").read()
    if done_marker in s:
        print(f"  {path}: already patched, skipped"); return
    hits = 0
    for a, b in pairs:
        if a in s:
            s = s.replace(a, b, 1); hits += 1
        else:
            sys.exit(f"ANCHOR NOT FOUND in {path}: {a[:60]!r} — repo may have changed; aborting safely.")
    io.open(path, "w", encoding="utf-8").write(s)
    print(f"  {path}: {hits} edit(s)")

patch("src/content/products.ts", [
    ("  visual: string;\n", "  visual: string;\n  img: string;\n"),
    ('    visual: "hr",',        '    visual: "hr",\n    img: "/visuals/product-atlas-eip.png",'),
    ('    visual: "interview",', '    visual: "interview",\n    img: "/visuals/product-lyraai.png",'),
    ('    visual: "edu",',       '    visual: "edu",\n    img: "/visuals/product-edusense.png",'),
    ('    visual: "chat",',      '    visual: "chat",\n    img: "/visuals/product-customer-ai.png",'),
    ('    visual: "marketing",', '    visual: "marketing",\n    img: "/visuals/product-pulse.png",'),
    ('    visual: "knowledge",', '    visual: "knowledge",\n    img: "/visuals/product-knowledge-ai.png",'),
], done_marker='img: "/visuals/product-atlas-eip.png"')

patch("src/app/[locale]/page.tsx", [
    ('import CoreNetwork from "@/components/CoreNetwork";',
     'import Image from "next/image";'),
    ("""          <div>
            <CoreNetwork />
          </div>""",
     """          <div className="hero-visual">
            <Image
              src="/visuals/hero-core-network.png"
              alt="PrimeStride Core — one intelligence layer connecting six live products"
              width={991}
              height={679}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </div>"""),
    ('          <div className="conn-merged">',
     """          <div className="conn-visual">
            <Image
              src="/visuals/section-compounds.png"
              alt="Six product data streams converging into one shared intelligence layer"
              width={2048}
              height={1037}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className="conn-merged">"""),
], done_marker="hero-visual")

patch("src/app/[locale]/products/[slug]/page.tsx", [
    ('import ProductVisual from "@/components/ProductVisual";',
     'import Image from "next/image";'),
    ('            <ProductVisual variant={product.visual} />',
     """            <Image
              src={product.img}
              alt={`${product.name} — ${product.zhName}`}
              width={900}
              height={760}
              priority
              style={{ width: "100%", height: "auto" }}
            />"""),
], done_marker="product.img")

css_path = "src/app/globals.css"
css = io.open(css_path, encoding="utf-8").read()
if ".pcard-img" not in css:
    css += """

/* ── 3D product visuals ─────────────────────────────── */
.pcard-img{margin:-26px -26px 18px;padding:30px 22px 6px;background:radial-gradient(120% 110% at 50% 0%,#f3f1ff 0%,#ffffff 72%);border-bottom:1px solid var(--line);border-radius:16px 16px 0 0;display:flex;justify-content:center;overflow:hidden}
.pcard-img img{display:block;transition:transform .35s ease}
.pcard:hover .pcard-img img{transform:translateY(-5px) scale(1.025)}
.hero-visual{display:flex;justify-content:center;align-items:center}
.hero-visual img{width:100%;max-width:560px;height:auto;filter:drop-shadow(0 34px 54px rgba(61,44,224,.20));animation:heroFloat 7s ease-in-out infinite}
@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
.pd-visual img{width:100%;height:auto;display:block;animation:heroFloat 8s ease-in-out infinite}
.conn-visual{margin:38px auto 4px;max-width:980px}
.conn-visual img{width:100%;height:auto;display:block;border-radius:20px;border:1px solid var(--line)}
@media(prefers-reduced-motion:reduce){.hero-visual img,.pd-visual img{animation:none}}
"""
    io.open(css_path, "w", encoding="utf-8").write(css)
    print(f"  {css_path}: styles appended")
else:
    print(f"  {css_path}: styles already present, skipped")
PY

echo "→ writing src/components/ProductCard.tsx (adds image to every product card)"
cat > src/components/ProductCard.tsx <<'TSX'
import Link from "next/link";
import Image from "next/image";
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
      <div className="pcard-img">
        <Image
          src={product.img}
          alt={`${product.name} — ${product.zhName}`}
          width={760}
          height={620}
          style={{ width: "78%", height: "auto" }}
        />
      </div>
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
TSX

echo ""
echo "DONE. Next:  npm run build  &&  git add -A && git commit -m 'Add 3D visuals: hero, product cards, product pages, compounds section' && git push"
