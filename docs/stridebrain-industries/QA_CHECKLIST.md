# StrideBrain Multi-Industry Smoke Tests

## Static and domain checks (2026-10-18)
✅ 2 sample industry datasets loaded and validated through WorkspaceModel.
✅ Interior: 12 project records / 204 knowledge sources / 60 quotation versions / 120 work items / 48 approvals.
✅ Printing: 8 job records / 114 sources / 24 quotation versions / 64 work items / 24 approvals.
✅ Exactly one latest quotation per project/job.
✅ All quote, task, approval and activity evidence links resolve to known source IDs.
✅ All 22 module render functions produced output with no evaluation exceptions.
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
