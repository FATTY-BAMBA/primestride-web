# StrideBrain AI Team v0.1

Branch: `feature/stridebrain-interiors-flagship-demo`.

## Product behavior

StrideBrain now includes an AI Team surface with an active Operations Assistant (營運特助). The assistant uses the same evidence-backed priority review as the workspace to prepare three follow-up actions. For each action it identifies the project, responsible contact, record evidence, a draft follow-up message, and a proposed internal task.

This release demonstrates the product loop: observe → investigate → prepare → human approval → execute → report back.

## Autonomy boundary

Automatic:
- Read bundled demo records and derived register evidence.
- Review priorities.
- Prepare follow-up recommendations and message drafts.
- Show evidence and an audit trail.

Human approval required:
- Create an internal demo follow-up work item.

Not enabled:
- Send email, LINE, or other external messages.
- Modify customer or supplier records.
- Approve quotations or business decisions.
- Payments or other financial transactions.

All actions remain browser-local demonstration state. Existing invitation, provider allowlist, quota, budget, and sign-out controls are unchanged.

## Evidence repair included

A source follow-up now skips citation-bearing project-clarification turns when locating the earlier evidence-bearing answer. This covers the live regression where a clarification message cited project records and displaced the original work-order evidence.

## Verification

- 223 unit/regression tests pass.
- 28 Chromium journey checks pass with simulated provider responses.
- The browser journey verifies the Operations Assistant prepares work, requires approval, creates an internal follow-up task, and exposes it in the normal Work Orders module without sending a message.
- Next.js production build compiles successfully.
- `git diff --check` is clean.

Live provider acceptance and future external action connectors remain separate release gates.
