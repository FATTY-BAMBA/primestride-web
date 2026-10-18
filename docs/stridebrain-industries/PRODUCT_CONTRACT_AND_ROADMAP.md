# StrideBrain SME Platform — Multi-Industry Foundation (v0.2)

**Source of truth:** https://www.primestrideai.com/en/stridebrain
**Live site is not changed.** Implementation is on feature/stridebrain-interiors-flagship-demo.
**Preview:** /stridebrain-demo/index.html?industry=interior or ?industry=printing.
**Current status:** Synthetic, browser-local, client-side prototype. NOT multi-tenant production SaaS.

## What StrideBrain is
An adaptable knowledge-grounded operations platform for Taiwanese SMEs: one shared knowledge foundation; Knowledge Assistant; Customer Service; Quoting; Work Orders; Analytics; human review and measurable improvements. The whole product must not be modeled around a specific vertical. Start from a painful existing workflow; extend gradually.

## Industry-pack contract
A template pack defines industry-specific language, customer-facing vocabulary, company identity, demo questions, material/quote semantics, approval checklist, workflow stage labels, supporting source IDs and a complete synthetic dataset.

Currently implemented packs:
- **interior:** Horizon Atelier / 禾序空間設計. 12 projects; 204 base docs + 16 fictional historical cost sources; 20 supplier records; 60 quote versions; 120 work items; 48 approval requests. Flagship change: Songshan Residence quartz countertop.
- **printing:** Clearprint Studio / 晴川印務. 8 jobs; 114 base docs + 16 fictional historical cost sources; 8 supplier records; 24 quote versions; 64 work items; 24 approval requests. Flagship change: 500 A3 posters switching paper stock.

The platform must use the same code for both packs. Industry-specific language and workflow rules live in industry-packs.js and each source file/seed, rather than being embedded in the UI.

## Source layout
- public/stridebrain-demo/index.html — new shared demo shell
- public/stridebrain-demo/app.js — navigation, state coordination and UX actions
- public/stridebrain-demo/industry-packs.js — pack configuration
- public/stridebrain-demo/core-model.js — validation, calculations, gates, persistence, feedback
- public/stridebrain-demo/assistant-rules.js — **deterministic** sample answers with source citations
- public/stridebrain-demo/ui-shared.js — neutral component templates
- public/stridebrain-demo/views-primary.js — overview, projects, knowledge, Copilot, evidence
- public/stridebrain-demo/views-operations.js — customer service, quoting, work, suppliers, approvals, analytics, learning
- public/stridebrain-demo/seeds/printing.json — print shop synthetic work records
- public/stridebrain-interiors/seed.json — interior synthetic work records from prior milestone
- public/stridebrain-demo/seeds/source-enrichment.json — detailed example documents shared with the demo loader
- public/stridebrain-demo/library/printing/*.md — 114 actual print document files
- public/stridebrain-interiors/library/*.md — 204 actual interior document files, with core flagship sources enriched

## Promise-to-acceptance traceability

| Public promise | Current demo proof | Production readiness gap |
|---|---|---|
| Company knowledge hub | Searchable synthetic text, document IDs and revision evidence | Upload PDF/Excel/DOCX, parse tables, page-level provenance, source access controls, document lifecycle |
| Knowledge Assistant | Cited deterministic routes and text-match retrieval; abstains when none | Permission-aware RAG/LLM, retrieval evaluations, prompt injection defenses, accurate citations |
| Customer Service | Source-based bilingual replies, editable drafts, review and clipboard | Authorized channels, inbound threading, staff permissions, delivery logs, escalation |
| Quoting | Cost / (1 - margin) formula, example variation, versioned quotes | Itemized estimator with actual supplier rates, approved company price rules, taxes, signed proposal PDFs |
| Work Orders | Task status simulation, linked source IDs, gated generated task | Durable work planning, dependencies, assignments, notifications, multiuser transactions |
| Analytics | Same core records, latest quote versions, blocker/approval counts | Actual costs, invoices, revenue, service metrics, traceable time series |
| Approved information reused | Shared project/quote/source ID across UI | Event-driven domain writes, robust conflict handling, immutable audit logs |
| No data cleanup required | Representative source files seeded manually | Actual intake classification & human-assisted mapping of messy real documents |
| Sources staff can inspect | Open and download source Markdown | Page-accurate PDF/XLSX source previews, confidence and source validity |
| Human exception handling | Sequential supplier, owner and customer gates | Authenticated approval rights, authorization checking on server, lock and reversal |
| Success measured | Derived operational counts | Baseline time/quality/flow tracked before and after go-live |
| Expand from one workflow | Same UI runs two distinct SME template packs | Feature flags, onboarding, tenant-specific workflow adapters |
| Intelligence improves over time | Feedback capture / review without mutating knowledge | Approved corrections version/publish process, tests and quality monitoring |

## Nonnegotiable architecture guardrails for production
- Organization isolation and role-based authorization must be applied at retrieval and action time, not just the UI.
- Company rules and price calculations belong to typed business logic, not free-form model text.
- Financial/contractual actions require authenticated human approvals and an event audit.
- Document chunks must be indexed with organization, effective date, version and source provenance.
- Any action to contact a customer must be reviewed and authorized; no autonomous sends by default.
- Negative feedback never silently rewrites approved knowledge; it creates a review case.
- Every template pack must pass the same baseline behavior tests and then its own industry-specific scenarios.
- Sample numbers must always be distinguished from client data. Do not advertise a feature as operational until verified.
- Taiwan Traditional Chinese should become a first-class UI language, not just a customer reply output.

## Improvement roadmap

**R0 — Completed in isolated branch:** generic industry packs; 2 synthetic sectors; shared schema and calculations; full-text source search; source-linked historical quotation estimates; quote/approval/work-order demonstration; feedback review queue; primary visual refinement; automated in-memory functional checks.

**R1 — Next:** human visual QA, accessibility, richer sample source files and representative PDF/Excel samples; complete Traditional Chinese interface; edit/revision tests; address empty/error states; performance checks.

**R2 — Real platform:** Next.js/TypeScript, Postgres, object storage, tenant authentication/roles, audit events, document versions, import pipeline, robust itemized quoting and signed approvals.

**R3 — Genuine AI:** grounded RAG with evaluations, permission-aware tool usage, careful model routing, stable refusal on missing records, multi-turn project context and controlled corrections.

**R4 — Taiwan go-to-market:** authorized LINE integration, appropriate ERP and accounting connectors, printing and interior design reference stories, measured before/after ROI pilots. Later add manufacturing/trading/service packs by configuration and domain extensions.

## Quality evidence from source-level checks
- 22 view render functions invoked (11 per pack), 8 sample prompts, 2 source inspector previews; no thrown exceptions.
- Per-pack schema validation passed. No unresolved project/source IDs in seeded quotes, tasks, approvals and activity.
- Premature commits were denied; approval sequence enforced; duplicate commit denied.
- Commitment generated exactly one new work item and updated latest-quotation analytics consistently.
- Feedback review was recorded without modifying source documents.
- Browser runtime / visual QA and real external integration tests are **not** complete.

**This specification governs the customer-facing platform, not the internal PrimeStride opportunity-intelligence OS.**

## Historical quote milestone (2026-10-18)
The same historical cost engine is now used by both industry packs. It matches cost-complete synthetic past jobs by category, tier, quantity, recency and location; calculates from normalized actual-cost example lines; excludes quote-only records; rejects inadequate history; applies explicit escalation/contingency/margin; creates a browser-local reviewed draft. It cannot produce valid real prices without current suppliers and actual completed-job costs. See HISTORICAL_QUOTATION_ENGINE.md and HISTORICAL_ESTIMATOR_QA.md.


## Research evidence and organization accounts (2026-10-18)
- Verified 15 public Taiwan reference sources, with 25 original paraphrased industry knowledge notes and 18 modelled stages.
- Cited references are clearly distinguished from the two synthetic company datasets and historical cost examples.
- Real estate/renovation regulations are scoped by their actual legal applicability; individual company compliance and registration require professional verification.
- Printing PDF, bleed, fonts and resolution examples belong to individual providers; they are not national standards applying automatically to all print vendors.
- Industry Playbook shows inputs, outputs, review gates and links to original public publishers and source locators.
- Copilot can route selected Taiwan practice questions to source-linked answers with applicability warnings; it remains deterministic and not an LLM.
- Original public sources appear in the Knowledge Hub, with buttons to open the issuing authority/publisher.
- Private company accounts are explicitly a future authenticated organization/membership model, separate from the switchable public demo; see ADR_004_ORG_ACCOUNTS_AND_TENANCY.md.
- Taiwan source-level smoke test: 26 screens + 8 additional checks passed, but authenticated browser UX, PDF/Excel ingestion, production permissions, true AI and security tests are not complete.

See TAIWAN_FIELD_RESEARCH_AND_DEMO_SPEC.md and the live source registry public/stridebrain-demo/seeds/taiwan-industry-evidence.json.
