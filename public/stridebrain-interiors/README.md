# StrideBrain — Horizon Atelier Interactive Demo

A standalone, isolated synthetic showcase in the **primestride-web feature branch only**, available under /stridebrain-interiors/index.html on a branch preview server.

- All 204 knowledge records are also source Markdown files in library/.
- 12 projects, 20 suppliers, 60 quote versions, 120 base work orders, 48 approval requests, 260 events.
- All example entities and prices are fictional.
- Calculator: selling price = direct cost / (1 - target gross margin), plus illustrative 5% tax.
- A quartz change-order creates WO-VAR-101 only after supplier, owner, and customer gates are simulated.
- Browser changes persist only through localStorage; use "Reset demo changes" to restart.
- Copilot answers use deterministic sample logic, **not a connected AI model**.
- Customer Service prepares bilingual source-linked drafts, supports simulated reviewer approval and clipboard copy only.
- Supplier data, AI, LINE, email, real user authentication and external databases are not connected.
- A native Next.js/SaaS implementation, source-aware RAG, connected channel delivery and actual PDF/Excel ingestion remain future phases.

See docs/stridebrain-interiors/PRODUCT_SPEC.md and QA_CHECKLIST.md for milestone acceptance gates.

Start by opening /stridebrain-interiors/index.html on a site serving the repository's public/ directory.
