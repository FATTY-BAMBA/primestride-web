# Flagship Demo QA Checklist

## Data consistency
- [x] 12 project identifiers are unique.
- [x] 204 source record IDs are unique.
- [x] 60 quotation versions link to a valid project and supplier document.
- [x] 120 work items link to a valid project and source.
- [x] 48 approvals link to a valid project and source.
- [x] 260 events link to a source.
- [ ] Independent verification of all computed project and quote totals after runtime testing.
- [ ] Replace generic starter content with deep scenario-rich records and PDF/XLSX examples.

## Browser-based functional tests
- [ ] All nine nav sections render without errors.
- [ ] Overview counts match Project/Work/Approval views.
- [ ] Knowledge full-text search, kind filter and source inspector work.
- [ ] Project details include the correct linked documents, quotes and work orders.
- [ ] Copilot shows evidence links for sourced questions and refuses unsupported answers.
- [ ] Quote recalculates when cost and target gross margin change.
- [ ] Commit before three approval gates fails.
- [ ] Gates must execute in supplier → owner → client order.
- [ ] After gate completion, commit creates only one WO-VAR-101.
- [ ] Work item appears in work table; changes persist after refresh.
- [ ] Latest quote total is not double counted as multiple revisions.
- [ ] Activity audit reflects simulated actions.
- [ ] Reset clears browser decisions and restores initial values.
- [ ] Desktop/mobile sizes, touch and keyboard reviewed.

## Website promise parity (unmet in first scaffold)
- [ ] AI Customer Service sample reply with source citation and approval.
- [ ] Real PDF/Excel ingestion with evidence and pages.
- [ ] Multi-user database persistence, tenant isolation and RBAC.
- [ ] Live AI reasoning bound to tenant records and source rules.
- [ ] Real quote workflow and documents.
- [ ] Model and tool evaluation / hallucination handling.
- [ ] Business outcome measurement.

## Disclosure
All records are synthetic. Never describe the first scaffold as a deployed production implementation.
