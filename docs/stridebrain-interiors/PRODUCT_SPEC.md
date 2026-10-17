# StrideBrain Interiors — Flagship Demonstration Specification

> Work branch: feature/stridebrain-interiors-flagship-demo.
> Standalone preview route: /stridebrain-interiors/index.html.
> **Status: interactive synthetic prototype, NOT a production product.**
> Purpose: create a believable reference implementation for a Taiwan-based interior-design studio while keeping PrimeStride's existing live site unchanged.

## 1. Customer story
A fictional Taiwan interior design and renovation firm, 禾序空間設計 · Horizon Atelier, manages 12 sample projects. Owner Mei Lin needs one place for design decisions, project schedules, quotations, supplier estimates, customer communications, and company knowledge.

The flagship scenario: a customer wants to upgrade a kitchen countertop to quartz on project PRJ-101 (松山靜宅). StrideBrain should explain which documents it used, recalculate the variation at an explicit target gross margin, request supplier and human confirmation, and produce a new linked work order only after approval.

## 2. Source-backed data targets and current contents
- 12 fictional projects, varying by stage and locality.
- 204 synthetic text knowledge records: 180 project documents (15 per project) and 24 cross-project company SOPs.
- 20 fictional suppliers, with clearly labeled hypothetical costs and lead times.
- 60 synthetic quote versions, with direct-cost and margin calculations.
- 120 base work orders, plus a gated extra item after committing the featured variation.
- 48 synthetic approval requests.
- 260 activity records.
- Each record has a stable ID. Project-specific quotes, tasks, approvals and activity link back to project/source IDs.
- Every indexed document has its own Markdown source file under public/stridebrain-interiors/library/.

**These are generated starter records.** A professional reference demo must enrich them with varied, substantial content; consistent rooms/materials; Taiwanese industry vocabulary; representative actual PDF/XLSX samples; version conflicts; scope exceptions; and manual QA. Do not misrepresent generated files as uploaded customer documents.

## 3. Published website feature contract
Product page: https://www.primestrideai.com/en/stridebrain

| Promise | Prototype now | Required next |
|---|---|---|
| Company knowledge hub | Source-indexed synthetic records, full-text search, inspector, download | Real ingestion of PDF/XLSX/DOCX, chunking, approved revisions, citations to page/section |
| Knowledge Assistant | Rule-based sample retrieval and source links | Grounded LLM with evaluation, confidence/abstention, access controls |
| AI Customer Service | Not yet shipped | Drafting screen using confirmed project facts; source notes, human review, no auto-send |
| AI Quoting | Deterministic sample calculator; revision history; margin and tax | Itemized quote engine, real supplier/product catalog, tax/discount rules, export and approvals |
| Work Orders | Linked task directory and browser-persistent status updates | Database, assignments, dependencies, revisions, notifications and audit |
| Data Analytics | Derived portfolio totals from latest sample quote versions | Real margin actuals, multi-period comparisons, reproducible metrics |
| Reuse approved facts | Stable IDs and shared data references | Database entity history and workflow event/outbox mechanisms |
| Existing files as-is | Source material present as synthetic Markdown | Import uploaded PDF, Word, Excel without cleaning requirement |
| Checkable sources | Open/download source documents with IDs | Page-accurate provenance and revision-aware retrieval |
| Human exceptions | Gated supplier/owner/customer sample flow | RBAC, real e-sign/approval and irreversible action controls |
| Time/quality/flow measurement | Task/approval counts | Baseline measurement and before/after workflow analytics |
| Gradual rollout | Modular navigation | Tenant-by-tenant feature configuration and implementation plans |

## 4. Professional experience principles
1. Not a chatbot clone: an original PrimeStride operating canvas, with overview, copilot, projects, knowledge, quotes, work, suppliers, approvals and analytics.
2. Context over novelty: show the selected project, latest evidence and current dependencies alongside conversational answers.
3. Real calculations: calculate from recorded inputs; never ask the language model to improvise project totals.
4. Approval gates: separate source confirmation, internal approval, customer acceptance and downstream effects.
5. Honest sample status: every financial number and source is explicitly synthetic.
6. Strong industry specificity: supplier materials, drawing revisions, change orders and job-site milestones must feel specific to interior design.
7. Human-friendly bilingual target: first-class Traditional Chinese and English, with genuine Taiwan terminology.
8. Inspection and explainability: link any recommendation to the source and relevant version.
9. Responsive design, accessible controls and robust empty/error states.
10. Reusable industry pack: switch vertical vocabulary and rules without rewriting the core application.

## 5. Technical roadmap / non-claims
Current branch is static HTML/CSS/JS plus a JSON seed. Client-side localStorage is **not** secure user state, shared storage or production persistence. The Copilot is **rule-based and deterministic**, not connected to any AI model. No real supplier connection, LINE, external customer messaging, authentication or tenant isolation is running.

Production upgrade: separate customer-facing application with Next.js + TypeScript; PostgreSQL relational operational store; versioned documents and object storage; RAG with permission-aware retrieval; signed-in organizations and role checks; quote and approval state machines; analytics projections and audit events; channel integrations only after customer authorization.

Do not merge demo code into the public site or describe it as production ready without visual QA, legal/commercial review, and all five published module acceptance tests.

## 6. Minimum demo journey
1. Show owner overview and sources.
2. Ask Copilot what needs attention.
3. Open PRJ-101 and inspect current Materials Schedule and Supplier Quotation documents.
4. Navigate to Quoting and change the example direct cost or target margin.
5. Attempt commit before approval and observe the block.
6. Simulate supplier, owner and client gates in sequence.
7. Commit and verify WO-VAR-101 appears in Work Orders and analytics reflects the approved variation.
8. Reset demo to restore initial state.

## 7. MVP exit gates
- Exact reproducible math and no invented operational claims.
- Every published application has a functional representative workflow, including customer replies.
- Five+ distinct document categories and revision-aware citations are genuinely tested.
- Cross-module state consistent before and after browser refresh.
- Mobile review and keyboard testing.
- Never expose actual credentials, customer PII, or real supplier pricing.
