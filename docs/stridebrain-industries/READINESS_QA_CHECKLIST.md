# v0.4 Readiness QA — Taiwan SME Demos
2026-10-18 · Isolated GitHub draft PR #9.

## Automated source-level checks completed
- [x] 13 shared modules compiled as pure source checks, no syntax exceptions.
- [x] 14 screens per industry rendered in source-level V8 checks.
- [x] Interior checks: 7 results, 5 initial blockers, 2 review flags; valid synthetic scenario with 0 holds.
- [x] Printing checks: 8 results, 6 initial blockers, 1 review flag; valid example with 0 holds.
- [x] All readiness check citations resolve to industry or public evidence documents.
- [x] Fixed partition/fire impact scenario remains blocked pending qualified assessment.
- [x] Mismatched A3 artwork geometry remains blocked.
- [x] Complete commercial gates without readiness assessment do NOT commit a change.
- [x] Complete commercial gates with readiness holds do NOT commit a change.
- [x] Commercial gates and recorded assessment with zero holds permit ONE browser-local change.
- [x] Duplicate change-order commits are rejected.
- [x] Linked review task appears in Work Orders with valid source and company context.
- [x] Both industry Copilot readiness questions surface current form-driven gaps and citations.
- [x] Four Excel-compatible CSV fixtures + two printable review HTML sheets committed.
- [x] Browser smoke-test harness added at /stridebrain-demo/qa.html.

## Runtime tests to perform on latest Vercel preview
- [ ] Open both industry links; verify labels and company switcher.
- [ ] Use Operational checks: adjust fields and verify results change instantly.
- [ ] Save assessment; reload; verify browser-local persistence.
- [ ] Create follow-up task; confirm Work Orders shows correct ID and source.
- [ ] Edit an assessed input; verify prior assessment becomes stale and task re-blocks.
- [ ] In Quotations, attempt commit without readiness: must be rejected.
- [ ] Complete readiness and commercial gates; commit creates only one work order.
- [ ] Ask Copilot "What is missing before this renovation can proceed?" / "Is this print job ready to go to press?"
- [ ] Open cited public guidance; inspect source publisher/locator and scope warning.
- [ ] Download four CSV files and open in spreadsheet software; print two HTML sheets to PDF.
- [ ] Run /stridebrain-demo/qa.html and inspect every pass/failure, including actual HTTP asset loads.
- [ ] Test desktop 1440px/1920px, tablet 1024px, mobile 390px; keyboard/focus/screen reader.
- [ ] Review real regulatory applicability with qualified Taiwan professional and print specs with actual shop.

## Boundaries and still-missing platform capabilities
No real user-account service, tenant database, PDF/Excel upload parser, AI inference, supplier API, authorized LINE/email send, actual industrial equipment integration, invoice tracking or server-side audit logs yet. All example approvals are simulated and should NOT be treated as professional certifications.
