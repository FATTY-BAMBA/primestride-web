# Interactive Industry Readiness Workbenches — QA
Date: 2026-10-18

## Implemented in isolated demo branch
- Interior-design renovation-change intake: 8 manually entered fields, 7 generated readiness checks and linked Taiwan public references.
- Printing A3 preflight and release intake: 10 manually entered fields, 8 generated checks and linked public examples.
- States distinguish blocking evidence gaps, review items and conditional manually declared facts.
- Users can record an assessment and create a linked browser-local review work order.
- The system explicitly warns that it has not inspected real site documents, scanned a PDF, approved a permit or confirmed supplier availability.
- Readiness data is per demo industry pack, browser-local; no private company account or production data is involved.

## Source-level smoke checks passed
- [x] Both industry engines return explicit holds when required information is missing.
- [x] 7 renovation and 8 printing checks generated.
- [x] References in all checks resolve to public-reference or fictional company source records.
- [x] UI markup for both workbenches renders.
- [x] Record-assessment button present for both.
- [x] Work-order handoff is explicitly a review task, not an authorization to execute.
- [x] Industry template architecture reused.

## Manual browser validation outstanding
- [ ] Desktop/tablet/mobile layout and keyboard navigation.
- [ ] Changing each scenario input recomputes warnings accurately.
- [ ] Record, reset, reload and stale-assessment behavior.
- [ ] Review work item appears once; no duplicate creation.
- [ ] Browser source inspector shows corresponding public-source URLs and applicability limits.
- [ ] Verify accessibility labels, contrasts and error handling.
- [ ] Test from live authenticated Vercel browser.

## Production capability NOT yet provided
- No automatic PDF preflight, geometry detection, CAD/drawing classification, image-resolution OCR, building compliance determination or external supplier verification.
- No authenticated company tenancy, immutable audit logs, real uploads or operational integrations.
- No industry specialist has certified the scenario decisions or source freshness.
