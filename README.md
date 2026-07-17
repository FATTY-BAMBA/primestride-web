# PrimeStride AI — Website

Next.js 14 (App Router) + TypeScript + Tailwind. Bilingual (English / 繁體中文) with locale routing at `/en` and `/zh`. Content is data-driven: the six products live in `src/content/products.ts` and drive both the homepage grid and each `/products/[slug]` page.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  → redirects to /en
```

Build:

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/
    layout.tsx              # fonts + <html>/<body>
    page.tsx                # redirects / → /en
    [locale]/
      layout.tsx            # Nav + Footer, validates locale
      page.tsx              # homepage (platform narrative)
      products/
        page.tsx            # products index
        [slug]/page.tsx     # product detail (static per product × locale)
  components/               # Nav, Footer, LangToggle, CoreNetwork, ProductCard, …
  content/                  # products.ts, pillars.ts  (bilingual data)
  dictionaries/             # en.ts, zh.ts  (UI strings)
  i18n.ts                   # locales + getDictionary
```

## Editing content

- **Products**: `src/content/products.ts` — each has `en` and `zh` copy (tagline, stats, description). Add a product here and it appears on the homepage, the index, and gets its own page automatically.
- **Pillars**: `src/content/pillars.ts`.
- **UI strings** (nav, section headings, CTAs): `src/dictionaries/en.ts` and `zh.ts` — keep the two in the same shape.

## Deploy to Vercel (GitHub flow)

1. Push this folder to a new GitHub repo:
   ```bash
   git init && git add . && git commit -m "PrimeStride site"
   git branch -M main
   git remote add origin git@github.com:YOUR_ORG/primestride-web.git
   git push -u origin main
   ```
2. In Vercel: **New Project → Import** the repo. Framework preset **Next.js** is auto-detected. No env vars needed. Deploy.
3. Every push to `main` redeploys automatically; open a PR for preview deployments.

## Pointing the domain (later)

Once you're happy with the Vercel deployment:
- In Vercel → Project → **Settings → Domains**, add `primestrideai.com` and `www.primestrideai.com`.
- Vercel shows the DNS records to set. Update them at Wix (or wherever the domain lives), or transfer the domain to Vercel/Cloudflare first.
- Keep the Wix site live until DNS has propagated, then retire it.

## Still to build

- Contact page with a real submitting form (Formspree, Resend, or a Next route handler).
- Blog (MDX or a CMS).
- Per-product deeper pages / roadmap sections from the Solutions Overview.
- Replace the `mailto:` CTAs with the contact form once it exists.
