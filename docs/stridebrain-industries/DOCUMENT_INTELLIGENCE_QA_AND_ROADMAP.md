# StrideBrain Document Intelligence — Interactive v0.1
Date: 2026-10-18 | Status: isolated synthetic prototype, NOT production intake

## Goal
Demonstrate an accountable path from an existing company document to useful structured work: read PDF/Excel/DOCX/CSV → preserve page/paragraph or worksheet/cell evidence → extract tentative fields → detect exceptions → human review → draft commercial record, without pretending a document upload becomes approved knowledge automatically.

## What is implemented in the isolated preview
- Navigation: Document intelligence.
- Drag/drop or file chooser, 8 MB per file maximum.
- CSV/TSV parsing, including quoted fields, UTF-8 BOM and conditional Big5 fallback.
- XLSX parsing from ZIP/XML in browser; reads cached cell values, shared/inline strings and source cell addresses. No formula evaluation. Unknown formula results, insufficient/ambiguous cost tables and limitations are reported.
- PDF text extraction using pinned PDF.js from a CDN. Extracts selectable embedded text and page/line references, up to 20 pages; scanned/image-only pages are not interpreted as text without OCR.
- DOCX body text and paragraph references; ignores tracked changes, comments and drawings.
- Conservative document classification and candidate quotation line extraction.
- Quantity, unit-cost, recorded total, calculated amount, source cell and explicit warnings for missing prices, arithmetic mismatch and duplicate-looking lines.
- Per-line approve, exclude or needs-review. A blocking mismatch cannot be approved directly.
- Manual editing to correct observed quantity/cost, with original source amount still inspectable.
- Explicit TWD currency confirmation required before approving a price-derived draft.
- Reviewer note required; changes to source decisions, inputs, notes or currency invalidate previous review.
- Printable text or itemized extraction can be locally reviewed and exported to a Markdown evidence report with original source references.
- Reviewed sample quote details appear in Quotation workspace, but do not count as sales, invoice revenue or customer acceptance.
- The Copilot and Knowledge Hub can see a temporary source **inside the current browser tab** but do not promote it to a company-owned record.
- The actual binary file and extraction remain in JS memory; no server upload or localStorage of the file content.
- Two types of fictional sample files per industry are generated on demand: PDF, XLSX and CSV.
- Browser test page at /stridebrain-demo/tests/index.html runs six sample format/industry checks.

## Verified locally from source tools
- Exact native ZIP headers and sample PDF xref offsets for the generated in-browser examples.
- CSV sample parser identifies 6 cost candidates for each industry.
- Interior CSV triggers MISSING_UNIT_COST; printing CSV triggers AMOUNT_MISMATCH.
- Quote review rejects unresolved items and refuses review without TWD confirmation.
- Excluded suspect rows plus accepted valid rows enable a reviewer-noted draft.
- XLSX samples created using artifact_tool were successfully re-imported and visually previewed.
- Searchable 1-page PDF samples were rendered and text-extracted with pdftotext.
- The binary sample pack ZIP passed its CRC self-test.
- Source-level JS syntax and synthetic rendering smoke tests passed; full browser functional QA remains open.

## No claim of production features
- No real multi-tenant company account or authentication; don't upload confidential customer files to this public preview.
- No server storage, antivirus, background ingestion or permitted sharing workflows.
- No OCR, deep table reconstruction from PDFs, scans, complex CAD parsing or image analysis.
- No legal/engineering/printing certification, actual supplier price confirmation or trusted billing records.
- No live LLM/RAG reasoning or autonomous delivery of messages, signed quotes and approvals.
- PDF.js library code is fetched from a third-party CDN; the application itself does not intentionally transmit file bytes there. Review dependencies and CSP policy before real deployment.

## Production plan
1. Authenticated organization-bound file ingestion with permission checks, upload quarantine, malware scanning, size/content checks and encrypted durable storage.
2. Asynchronous extractors for PDF/Office/text, including table structures and OCR for scans, with page/cell/paragraph provenance and failure tracking.
3. Document versioning, classification, retention and data-owner approval; only approved versions enter private tenant RAG.
4. Typed company cost mappings and current verified supplier data; don't learn from quotes lacking actual cost evidence.
5. Staff review workbench that records original versus corrected values, reasons, reviewer identity and immutable audit events.
6. Reusable industry pack-specific validation and quotation templates; legal/commercial actions remain controlled.
7. Export signed/customer-ready PDF only after authorised review and company-specific tax/contract calculations.

## Manual acceptance still needed
- [ ] Open latest Vercel deployment and confirm module assets load over HTTP.
- [ ] Import six generated fixtures through File inputs in modern browsers.
- [ ] PDF.js CDN worker loads with matched version; no CSP errors.
- [ ] XLSX parser works with external real-world workbook variants, merged cells, formula caches and hidden sheets.
- [ ] Fix or exclude the intentionally faulty cost line; confirm TWD; review and export.
- [ ] Refresh and verify session-only document is cleared.
- [ ] Switch industry and verify imported temporary source is cleared.
- [ ] Verified draft appears in Quotations but not recognized revenue.
- [ ] Mobile/tablet layout, keyboard focus, accessibility and error handling.
- [ ] Browser self-test page explicitly runs all six generated file scenarios.

This is a transparent demo feature, not production data intake. Publicly documented Taiwan industry references and fictional example company files remain distinct information classes.
