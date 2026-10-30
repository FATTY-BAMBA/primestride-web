# StrideBrain Historical Quotation Intelligence · 歷史案件智慧報價

## Goal

When a customer asks for a new price, retrieve comparable completed jobs, normalize by quantity, material scope and service category, explain the cost basis, adjust for current verified costs, apply company margin rules, and prepare an authorized draft. The goal is a reusable feature of the shared StrideBrain Quotation application, not a separate interior-design product.

## Current synthetic prototype

- 16 interior precedent records, 13 with simulated cost-complete status; 16 printing precedents, 13 simulated cost-complete.
- Stable historical record and source document IDs, including 32 individual Markdown files.
- Category, tier and required scope must match; at least three completed cost records are required.
- Ranking compares quantity, date and location, choosing up to six most relevant precedents.
- Weighted medians of actual-cost samples by industry cost code provide per-unit base costs.
- Editable escalation and contingency assumptions lead to forecast direct costs.
- Selling price is forecast direct cost divided by (1 minus target gross margin).
- Shows tax assumption, sensitivity band, comparable projects, individual cost lines and missing-information warnings.
- Excludes quote-only and cost-incomplete records from cost benchmarks.
- Draft is saved to browser, simulated as reviewed, and can then be exported as Markdown. It is not emailed, booked as revenue, or offered as a verified customer quote.
- Copilot route and Quotations handoff use the same shared source and pricing framework across interior and printing packs.

## Important definitions

1. Historic quotation: proposed price; not a direct cost or revenue record.
2. Accepted contract: signed price; not necessarily actual completed cost.
3. Completed direct cost: recorded labor, materials, subcontracts and other scope costs.
4. Current vendor price: explicitly verified with effective date; not inferred from old records.
5. Generated quote draft: suggested commercial terms subject to human review, customer-specific taxes and scope exclusions.

## Production workflow

Intake customer question and measurements → parse existing customer PDFs, Excel and SOPs → retrieve comparable completed projects with permissions → apply versioned cost-code mapping and verified current prices → flag missing items, scope differences and outdated references → calculate deterministic quotation → owner approval → produce signed customer-facing document → record win/loss and compare estimated against actual project costs.

## Open gaps

No real historical customer data; no current supplier feeds; no database-backed tenant permissions; no true LLM, RAG or live file parsing; no production approval; no PDF estimate export; no authorized LINE or email delivery. Current source records are generated fictional training data. Never claim real pricing accuracy from this preview.

## Acceptance principles

- A quote-only or cost-incomplete prior job cannot teach actual cost.
- Refuse when fewer than three suitably comparable cost-complete jobs exist.
- Refuse when cost lines or scopes cannot be reconciled.
- Require current material and labor verification before commercial pricing.
- Distinguish margin from markup; calculations remain reproducible.
- Changed scope or price inputs invalidate reviewed drafts.
- All supporting precedents link to readable sources.
- Proposals do not count as realized revenue.
- Human approval precedes any customer delivery.
- New industry packs reuse the same engine with their own units and cost codes.

See HISTORICAL_ESTIMATOR_QA.md for source-level tests.
