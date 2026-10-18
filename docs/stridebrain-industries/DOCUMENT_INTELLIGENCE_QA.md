# Document Intelligence — acceptance and limitations

Implemented as an isolated, client-side synthetic demonstration. This is NOT server-side ingestion, OCR, a trained AI document classifier, or automatically verified commercial pricing.

## Current formats and behaviors
- CSV and TSV: delimited row parsing with quoted fields and item cost detection.
- XLSX: locally inspect workbook XML, sheets, stored cell values and cached formulas (does not evaluate formulas).
- DOCX: local text extraction from Word document content.
- PDF: embedded text extraction through a pinned PDF.js dependency when available; scanned PDFs are NOT OCR-processed.
- File size capped at 8 MB and spreadsheet/table extractors use row/cell limits.
- Candidate cost lines preserve sheet/row/column provenance; detection is heuristic.
- Quantity, unit cost and extended-amount mismatches are flagged; review/edits are attributed to local reviewer action.
- Document-level blocking errors (including malformed CSV quoting or no embedded text) now prevent final review approval.
- Draft cost totals only include approved candidate lines.
- Uploaded data stays in the current browser tab memory; no upload to a PrimeStride backend; do not store confidential company files in a public demo.
- Final markdown is clearly labeled as human-reviewed extraction, not signed customer quotation or verified supplier price.

## QA to complete before demonstrating to prospects
- [ ] Test CSV, XLSX, DOCX and PDF fixtures in actual browser (including corrupted files, formulas and multiple sheets).
- [ ] Verify blocking errors cannot be bypassed by approving all candidate rows.
- [ ] Confirm editing input invalidates approvals.
- [ ] Test exported Markdown and preserved source references.
- [ ] Test scanned-PDF behavior and CDN failure, including clear fallback.
- [ ] Verify local-only upload using browser network inspector.
- [ ] Check keyboard/mobile accessibility and memory limits.
- [ ] Confirm selected industry remains isolated when switching packs.

## Production milestones
Tenant-isolated encrypted object storage and database; server-side parse jobs, PDF table extraction/OCR, authenticated reviewer permissions, source version lineage, enterprise retention/deletion, validation against current supplier records, and signed quotation exports. These are not currently implemented.
