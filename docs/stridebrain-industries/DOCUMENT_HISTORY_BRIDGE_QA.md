# Document → Historical Cost Bridge: QA Matrix (2026-10-18)

## Source-level validations completed
- [x] CSV full parse → 5 interior cost candidates; 1 deliberately unresolved row.
- [x] CSV full parse → 6 printing cost candidates; 1 deliberately mismatched row.
- [x] Human review excludes unresolved row; document extraction approval succeeds only after source review and TWD confirmation.
- [x] Accepted rows map to valid interior/printing industry cost codes; unmapped codes prevent import.
- [x] Attestations and exclusion reason mandatory for hypothetical cost completeness.
- [x] Impossible/future dates rejected; quantity and scope validated.
- [x] Files with truncation warnings or file-level blockers rejected from historical costing.
- [x] Browser-local evidence document created and indexed; no duplicate import allowed.
- [x] Historical estimator uses the temporary record as one of six comparable examples in both industries, with a LOCAL DEMO marker.
- [x] Clearing the file detaches its history record and source citation.
- [x] Extracted candidate IDs unique across two worksheets (previous issue fixed).
- [x] Self-attested session-derived history request and draft are scrubbed from persisted localStorage state.

## Browser QA page
URL path: /stridebrain-demo/bridge-qa.html
- [x] Interior fixture CSV: PASS in actual browser.
- [x] Interior fixture XLSX: PASS in actual browser.
- [x] Printing fixture CSV: PASS in actual browser.
- [x] Printing fixture XLSX: PASS in actual browser.
- [ ] Check all errors, keyboard focus, mobile layout, source evidence drawer.
- [ ] Confirm localStorage/network inspector contains no uploaded bytes.
- [ ] Check switching industries while a file parses does not move uploaded data into the wrong pack.

## Real-product blockers
- [ ] Authenticated tenant accounts and organization-membership access controls.
- [ ] Per-company encrypted file and versioned cost lineage.
- [ ] Real PDF table extraction/OCR and malformed Office-file tests.
- [ ] Approval with actual cost-completeness evidence vs sales quote.
- [ ] Supplier price date validity, company tax rules, user permissions.
- [ ] Human-reviewed customer PDF export, delivery authorization and audit.
- [ ] Source-aware AI evaluations, error handling, retention and deletion policy.

All test data is fictional. This checklist must not be used as evidence of real quoting accuracy or production privacy/security certification.

## Browser execution evidence — 2026-10-18

Observed from the user's executed StrideBrain QA page (also visible in the connected browser tab): **4 passed, 0 failed**.

| Industry | Format | Browser result | Evidence reported by the harness |
|---|---|---|---|
| Interior | CSV | PASS | 6 lines, 5 accepted, 1 blocked, 6 matches |
| Interior | XLSX | PASS | 6 lines, 5 accepted, 1 blocked, 6 matches |
| Printing | CSV | PASS | 6 lines, 5 accepted, 1 blocked, 6 matches |
| Printing | XLSX | PASS | 6 lines, 5 accepted, 1 blocked, 6 matches |

**Scope:** These are four automated sample-fixture checks executed in a browser. They do not verify the manual drag-and-drop UX, PDF/DOCX/OCR, keyboard/mobile accessibility, production security, tenant isolation, or quote accuracy with real transactions. Mark the sample CSV/XLSX smoke gate complete only. Preserve earlier separate source-level test counts; the browser fixture row counts are reported as displayed by the QA harness.
