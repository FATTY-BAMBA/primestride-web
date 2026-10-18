# StrideBrain — Taiwan Industry Readiness Workbench
Milestone v0.4 · 2026-10-18 · Branch: feature/stridebrain-interiors-flagship-demo

## Purpose
Move beyond synthetic dashboards: allow a user to update realistic, manually entered industry conditions, see evidence-linked exceptions, create a follow-up task, and block work-release until the required information is checked. Preserve the goal of ONE multi-industry StrideBrain core.

**No actual files, buildings, supplier inventories or permits are inspected in this prototype.** All responses are based on manually entered sample facts and cited public references. An outcome of "ready for human review" does NOT establish legal compliance or authorize production.

## Interior design / renovation
Featured project: PRJ-101 Songshan Residence, quartz countertop change. The user records:
- Nature of changes (countertop, fixed partitions, fixed ceilings or other scope).
- Whether approved construction drawing issues exist, distinct from drafts.
- Site measurement status and cabinet/installation implications.
- Whether supplier cost and supply commitments are supported by written evidence.
- Fire/escape and regulatory applicability questions for professional assessment.
- Schedule impacts and written customer change acceptance.

The check reports seven findings: controlled drawing, measurements, supplier offer, fire/escape impact, professional/regulatory review, schedule, and customer acceptance. A fixed partition or known fire impact triggers further review/holds. It never automatically declares permit requirements or exemptions.

## Printing / packaging
Featured job: JOB-201, 500 A3 posters; optional recycled-stock substitution. Inputs are manually entered:
- PDF/AI/image format (the cited vendor example recommends PDF).
- File dimensions and per-side bleed, compared with A3 297 × 420 mm trim and 3 mm example bleed (303 × 426 mm).
- Placed image DPI versus the vendor's 300 DPI recommendation.
- Embedded/outlined font declaration and color mode (RGB is advisory/possible conversion, not categorically rejected).
- Customer approval of the latest proof, supplier paper stock, and press/finishing schedule.

Eight structured findings; no binary file parser or real artifact analysis is running. Technical checks are specific to a publicly cited vendor's examples and must be adapted to the customer's actual printer/job.

## Cross-module behavior
1. Form fields update a deterministic source-based readiness assessment.
2. Current status distinguishes pass, blocking evidence gap, and professional/process review.
3. A user explicitly saves the assessment in browser-local demo state.
4. "Create linked review work item" adds RVW-INT-101 or RVW-PRT-201 to the common work register, with source ID and owner.
5. An edited input invalidates the recorded assessment and re-blocks the follow-up work.
6. A quotation variation can no longer be committed merely with supplier, owner and customer gate clicks. It ALSO requires a current, recorded industry assessment with zero open blockers.
7. Copilot questions about readiness summarize the latest manually entered conditions with citations and offer navigation to the checklist.
8. All operations are confined to synthetic local state; no messages, procurement or site/press instructions are actually issued.

## Sample operational artifacts
Interior fixtures:
- /stridebrain-demo/fixtures/interior/site-measurements.csv (Excel-compatible, fictional missing dimensions)
- /stridebrain-demo/fixtures/interior/quartz-costs.csv (fictional direct cost breakdown)
- /stridebrain-demo/fixtures/interior/change-review.html (printable to PDF, deliberately not approved)

Printing fixtures:
- /stridebrain-demo/fixtures/printing/preflight-manual.csv (manual example PDF/preflight fields, not extracted)
- /stridebrain-demo/fixtures/printing/recycled-stock-cost.csv (fictional paper-stock cost uplift)
- /stridebrain-demo/fixtures/printing/preflight-review.html (printable example, no actual file inspection)

CSV opens in Excel and similar spreadsheet software but is not an XLSX workbook. Printable HTML can be saved as a PDF via the browser print dialog; it is not an actual verified professional PDF report. Real upload, Office parsing and PDF extraction are future work.

## Production requirements
- Authenticated company accounts, role-based scopes and per-organization data isolation.
- Real document intake (PDF/Word/Excel) with page/version-accurate provenance and correct parser results.
- Actual drawing and artwork extraction/geometry/rendering where feasible; do not label human-entered form fields as machine-verified.
- Permissions to perform work release, scope changes, customer sending and formal approvals, with immutable server audit.
- Professional/legal decisions routed to appropriately qualified reviewers; keep regulatory sources current.
- Verified supplier estimates, schedules and actual cost history before binding customer quotes.
- Mobile/accessibility QA and real-world pilot with Taiwanese practitioners.

## Testing
A browser QA harness lives at /stridebrain-demo/qa.html. It runs source, file-availability, readiness, pricing and cross-module integration checks against the deployed static files. QA harness PASS is not equivalent to production readiness.

Underlying source registry: /stridebrain-demo/seeds/taiwan-industry-evidence.json.
Source-of-truth market positioning: https://www.primestrideai.com/en/stridebrain.
