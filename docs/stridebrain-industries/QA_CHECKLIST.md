# StrideBrain Multi-Industry Smoke Tests

## Static and domain checks (2026-10-18)
✅ 2 sample industry datasets loaded and validated through WorkspaceModel.
✅ Interior: 12 project records / 204 base knowledge sources plus 16 historical sources / 60 quotation versions / 120 work items / 48 approvals.
✅ Printing: 8 job records / 114 base sources plus 16 historical sources / 24 quotation versions / 64 work items / 24 approvals.
✅ Exactly one latest quotation per project/job.
✅ All quote, task, approval and activity evidence links resolve to known source IDs.
✅ All 24 module render functions produced output with no evaluation exceptions.
✅ Four sample questions per industry produced sample answers and resolvable citations.
✅ Inspector and source dialog templates rendered for both industries.
✅ Simulated commit is refused before supplier/owner/customer review.
✅ Approvals must be supplier → owner → customer; duplicate commits are refused.
✅ A successful commit adds one work item and updates calculated quote totals.
✅ Feedback marked reviewed does not mutate the document.

## Manual browser acceptance (still open)
- [ ] Desktop 1440px/1920px / tablet 1024px / mobile 390px layout.
- [ ] Switch interior ↔ printing and verify counts, vocabulary, sources, project/job identities.
- [ ] All 11 pages show appropriate content for the selected pack.
- [ ] Open DOC-1006 / PRDOC-2004 in evidence inspector and mobile modal.
- [ ] Change variation cost and margin; verify formula and stale approval invalidation.
- [ ] Supplier, owner, customer gates plus one work item, persistence after reload.
- [ ] Bilingual customer draft, edit invalidation, and copy after review.
- [ ] Search full-text documents and export source Markdown.
- [ ] Feedback captured and reviewed with source unchanged.
- [ ] No unauthorized network calls, real messages or real customer claims.
- [ ] Accessibility / keyboard navigation / color contrast review.
- [ ] Browser console clean, no failed module imports or missing static assets.
- [ ] Actual PDF/Excel fixtures and file ingestion (not yet implemented).

## Claim discipline
The preview is a synthetic prototype, NOT an LLM, live RAG system, multi-tenant server, supplier integration or production customer deployment. Business value must be validated in actual pilot workflows.

## Historical quotation module
- [x] 16 fabricated past-cost precedents per pack (13 synthetic cost-complete each); 32 source documents.
- [x] Insufficient history refuses rather than invents a quote.
- [x] Unit costs and totals reconcile for interior and printing sample estimates.
- [x] Contextual past-project quote access in Copilot and Quotations.
- [ ] Manual confirmation of draft creation, review, invalidation and export in a browser.
- [ ] Production cost source verification, secure tenant data, real document intake, PDF quotes.


## Taiwan evidence and multi-tenancy design checks
- [x] 15 source IDs unique and original URLs use HTTPS.
- [x] 25 reference documents and every workflow/reference link resolve in the curated pack.
- [x] Nine workflow stages for each of two industries.
- [x] Original publisher, source type, locator and applicability warnings are visible in source inspector and narrow-screen modal templates.
- [x] Copilot routes Taiwan renovation requirements and A3 artwork-preflight questions to original citations rather than company cost data.
- [x] Public reference documents and fictitious company/history records are labeled separately.
- [x] 26 module screens and 8 supplemental checks passed in source-level V8 rendering smoke test.
- [ ] Full visual desktop/mobile walkthrough, focus/accessibility review and browser networking.
- [ ] Public-source freshness recheck and legal/professional applicability review before launch.
- [ ] Real private company accounts and cross-organization RLS/access-control security tests; schema design only.
- [ ] Real customer PDF, Excel, historical actual-cost imports and production AI evaluations.


## v0.4 readiness gates and business artifacts
- [x] Source-level tests verify 14 module screens × 2 industry packs, readiness citations, and release-gate refusal/approval.
- [x] Interior initial sample: 7 holds + 0 review flags; printing initial sample: 6 holds + 1 review flag.
- [x] Quote commitment is now refused without a current recorded readiness assessment, even after simulated commercial approval.
- [x] Change commitment is blocked with unresolved readiness holds; one successful commit only after clear recorded screening and commercial gates.
- [x] Linked review task creation validated with a resolvable source.
- [x] Four CSV files and two printable HTML review sheets committed.
- [ ] Run actual browser QA smoke harness and inspect asset HTTP loads.
- [ ] Human review of desktop/mobile layout, keyboard UX and realistic workflow transitions.
- [ ] Real PDF/Excel ingestion, supplier current pricing, authenticated professional sign-offs and customer sending.
