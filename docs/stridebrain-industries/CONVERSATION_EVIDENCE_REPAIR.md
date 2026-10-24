# Conversation continuity and evidence repair

Baseline: d354c67b5e5b2c3162c3e517e1c65314d76c75d5.
Target: feature/stridebrain-interiors-flagship-demo; existing demo.primestrideai.com.

## Scope
- Every turn receives a fresh server-read project/contact directory and revalidated conversation references. An answer based on that context no longer fails solely because the model returns no new tool call.
- Ambiguous singular project questions request a project selection. Prior assistant text guides lookup but is not treated as business evidence.
- Backend documents apply the same source-enrichment data as the browser. get_source reads the text shown in the evidence viewer.
- REG- sources are derived, inspectable snapshots of quotation, task, approval and project registers. They are not original supplier files. Quotation totals and computed gross profit can be inspected separately from associated supplier estimates.
- Validate supplied record identities, same-clause project associations and formatted amounts against cited source bodies. An unsupported draft gets at most one corrective generation, within a four-call and 45-second provider budget; unresolved issues fail safely. These checks are bounded safeguards, not complete semantic verification of every generated claim.
- Hold answer deltas until validation; progress messages remain visible. Preserve explicit list numbers across interrupted lists.

## Validation
192 unit/regression tests passed (162 baseline; 30 new tests), including both model adapters, four-turn simulated journeys, ambiguity, register/source parity, misidentified work orders, and correction behavior.
20 Chromium journey checks passed using simulated provider output, including opening exact quotation register values and the separate supplier source, existing invitation continuity, refresh, errors and sign-out.
Production build and static syntax checks are required before publishing the commit. No real provider was called during these tests. Deployed natural-language acceptance remains required.

## Unchanged boundaries
No invitation codes, secrets, environment variables, quotas, budget allowance, model catalog, company data, source-document bytes, or production branch changed. Only display-derived register sources were added; seed counts and original record values are preserved.

## Acceptance
On the existing demo address, use a new conversation. Ask for priorities; ask about 'this project' after multiple projects; choose one explicitly; ask for the figures' source and next contact. Confirm source links distinguish register values from document text and the final follow-up completes. Errors should retain the question rather than fabricate an answer.
