# StrideBrain Taiwan Customer Demo — product experience and specialist-agent delivery

## Product objective
Win a controlled five-person demo pilot with an intuitive zh-TW-first interface that shows how StrideBrain helps owners make decisions faster, protect margins, and prevent operational mistakes. Preserve honest Demo data labeling and no-signup entry. Do not represent simulated operations as real client actions.

## Three high-impact demo experiences (priority order)

### 1. AI 每日營運晨報 / Daily Operations Brief
First screen: today's **sample snapshot**, three prioritized issues, owner, source links, and next action. Distinguish dated demonstration records from live events. Provide two industry variants.
- Interior: pending owner approval, drawing dependencies, site blockers, changed cost.
- Printing: preflight blockers, proof approvals, press scheduling, print job deadlines.
- Acceptance: source-linked item cards, inspectable records, explicit uncertainty, no fabricated deadlines or status updates.

### 2. AI 報價與毛利守門員 / Quote & Margin Guardian
A guided quotation path: pick a sample job, compare verified sample historical cost basis, show explicit margin assumptions, flag missing cost categories, simulate revisions, and prepare a human-review draft.
- Acceptance: recomputable cost/margin numbers, cost provenance, no invented vendor prices, no external transmission, TWD pre-tax/inclusive labels.

### 3. AI 異常與風險雷達 / Operational Risk Radar
Make real discrepancies in the sample records visible as decision cards.
- Example: APR-1008 vs DOC-1028 differing approval status; display both facts only after deterministic source comparison verifies them.
- Acceptance: mismatch IDs, conflicting fields, status, likely consequence as *inference*, human verification step; do not invent actual customer impact.

## zh-TW-first quality gate
- Language switch accessible at onboarding and in workspace, persistent while staying in the same browser tab. Default zh-TW for pilot, English fallback.
- Translate all customer-facing navigation, Copilot controls, status, model guidance, data tables, approvals, source cards, empty states and errors; preserve IDs and source provenance.
- Native Taiwanese SME language: 報價單、毛利率、未稅／含稅、工程變更、業主確認、工單、打樣、印前檢查、交期; TWD NT$.
- Test 390px iPhone layouts plus desktop for both industries; avoid truncation of Chinese labels.
- Explicitly distinguish interface locale from model output locale; do not let English source text override the selected response language.

## Specialist-agent workflow to establish (not yet operational)
Each feature goes through five distinct reviews, with artifacts attached to the PR:
1. **Product strategist:** business owner pain point, demonstrable value, success metric and grounded example.
2. **Taiwan UX/localization reviewer:** zh-TW strings, touch/mobile usability and bilingual fallback.
3. **Workflow/domain reviewer:** quotation/approval/calculation rules, sector terminology, human approval, traceable evidence.
4. **Implementation agent:** small PR commits, domain adapters, tests, monitoring and rollback.
5. **Independent QA/security agent:** regression suite, visual browser run, tenant boundaries, provider spend and adversarial cases.
Ship only when each gate is demonstrated in CI/browser evidence. Do not present role names as proof autonomous agents have run.

## Existing pieces we should reuse
Read-only AI tool registry, two sector packs, historical quote bridge, reference citations, Supabase quota/budget/concurrency guards, bilingual AI-language directive, guest code exchange, and safe session conversation continuity.

## Phasing
P0: complete zh-TW interface dictionary and saved locale, initial Taiwan-specific guided landing, source-linked daily brief.
P1: visual risk radar and quotation/margin guardian walkthrough with deterministic source checks.
P2: independent multi-role QA gates and five-person demo feedback.
P3: verified customer accounts, tenant-specific storage, permissions, real company document ingestion; do not merge pilot data into real tenant data.

## Known blockers
No full Chinese interface yet. Existing conversations choose language mainly by question text, not a persisted interface preference. Guest pilot uses one shared Supabase organization, and the budget reservation is not audited actual provider billing. Demo invites must not be expanded publicly before provider spend/billing and security review.
