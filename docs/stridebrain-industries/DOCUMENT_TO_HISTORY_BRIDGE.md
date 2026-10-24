# StrideBrain — Reviewed Document to Historical Quotation Bridge
Milestone: v0.4 demo · 2026-10-18 · STATUS: synthetic browser-only prototype

## End-to-end purpose
A Taiwanese SME may have old quotations, completed-job cost files, supplier purchase records and project specifications in Excel/PDF/Word. StrideBrain should eventually extract these into an auditable, company-owned cost history. A new inquiry should then use only suitably comparable, verified cost-complete jobs as possible estimate evidence, with current supplier rates and a responsible person's review.

The first **demonstration bridge** now shows that full interaction, but does NOT claim the uploaded file is a real completed job or that its costs are verified.

## Implemented workflow

1. Navigate to Document Intelligence.
2. Download a fictional CSV/XLSX example for the selected industry; upload it in the browser (do not use real confidential data).
3. Inspect source cells; correct valid numeric errors; flag or exclude unresolved rows with an explanation.
4. Confirm TWD currency and record a reviewer note. Final extraction approval requires no file-level blocking problems.
5. An added section, "Connect to historical quotation intelligence", asks the reviewer for job type, finish tier, location, fictional completion date and normalized whole-job quantity (ping for interiors, pieces for printing).
6. Every accepted source line must be mapped to one of the **industry pack's cost codes**. "Suggest cost codes" offers deterministic guesses but never counts as an approval.
7. Confirm three explicit human declarations: fictional demo status; hypothetical cost completeness; direct source/mapping review. Excluded rows require a rationale.
8. Once validated, the app creates a session-only historical record and an inspectable Markdown evidence document containing source filename, cell IDs, mapped cost totals, disclaimers and review status.
9. Historical Estimates includes this local record alongside its intentionally fictional seed cost histories, visibly labels it **LOCAL DEMO**, and cites its generated evidence. It can prepare a local draft quote for simulated approval.
10. The Quotations module can show that historical draft, without treating it as billed, accepted or collected revenue.
11. Clearing the source, loading another file or switching industries removes its ephemeral history reference. Nothing is posted to a server or added to persistent customer knowledge.

## Data/control model
- Report source ID and candidate IDs are distinct; XLSX candidates have unique sheet/row-qualified IDs, preventing collisions across worksheets.
- Extracted line sourceRefs identify the sheet/cell or other detected location.
- A cost entry stores code, label, source review, accepted cost and original source references.
- Whole-job quantity normalizes the mapped total; individual input lines may be pieces, hours, jobs or ping.
- A line cannot be used when quantities, unit prices or source totals are unresolved unless responsibly corrected and then reviewed.
- A document cannot become even a fictional history entry until human-approved extraction, explicit mapping and project-level disclaimers are confirmed.
- Truncated spreadsheets, unresolved file-level blockers, cached/uncached formulas and unsupported source coverage prevent cost-history promotion.
- A history record is tagged LOCAL_SANDBOX_SELF_ATTESTED and FICTIONAL_COMPLETENESS_ASSUMED, even when a user has mapped data.
- Source review and simulated owner approval are different events; no formal client-facing commercial offer is generated.

## Privacy boundary and future company accounts
The entire imported data report, mapping choices and generated Markdown are held **only in memory within the browser tab**. The app scrubs import-derived history drafts and request metadata from localStorage. The app intentionally never sends document bytes to StrideBrain endpoints. PDF.js library code may be loaded from a third-party CDN, so only fictional/sanitized documents should be used in this public preview.

Actual customer onboarding will require verified identity, company membership, encrypted tenant object storage, safe upload processing, role-authorized mapping, audit trails, source document versions, retention controls and strong org-scoped retrieval. The current browser demo cannot substitute for any of this.

## Future real historical-cost service
1. Company imports final reconciled actual costs, not merely a sales estimate.
2. Upload service checks virus/mime/cap limits and assigns organization, document version and permissions.
3. Parser/AI assists with extracting cost codes and quantities, storing page/cell provenance and confidence.
4. Authorized reviewer verifies actual cash/ledger source vs sales quote, date, scope and completeness.
5. Company sets a verified effective-date supplier pricebook, markups/margins, taxes, exclusions and approval limits.
6. Quote engine ranks comparable *tenant-owned, completed and reconciled* cases, with normalization and explanatory factors.
7. Human approves the proposal, then an authorized service produces signed customer PDF and an optional controlled LINE/email action.
8. On completion, actual project outcomes provide reviewable learning signals for future cost estimates.

## Integrity tests run in source-level V8
- Browser-style CSV buffer parsed through the full Document Intelligence function for both packs.
- Intentional missing/mismatched costs were blocked, excluded with reviewer rationale, and not counted as approved direct costs.
- Both packs attached local hypothetical cost history and returned source-traceable historical estimates.
- Session record and its document citation were removed from the history and knowledge maps on clear.
- Multi-sheet candidate IDs verified unique; duplicate precedent promotion rejected.
- Unreviewed docs, missing attestations, future/impossible dates and truncated sources were rejected.
- Amounts preserve source cents and history totals reconcile.
- Full XLSX parsing, DOCX/PDF and visual UX **still require browser runtime QA**.

## Browser QA entry point
Public branch preview path: /stridebrain-demo/bridge-qa.html
Runs fictional CSV + XLSX cases for both interior and printing, with no upload to a server. The site user can send pass/fail evidence from an actual authenticated browser.

## Not yet provided
No OCR or guaranteed PDF table extraction; no real supplier price verification; no tenant database; no actual client job-cost ledgers; no signed approvals; no live AI agent; no legally valid quotation.
