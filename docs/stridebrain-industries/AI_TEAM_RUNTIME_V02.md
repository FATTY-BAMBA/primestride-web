# StrideBrain AI Team Runtime v0.2

Branch: `feature/stridebrain-interiors-flagship-demo`.

## What changed

AI Team is no longer a one-off Operations Assistant implementation. Three runnable teammates now share one StrideBrain agent runtime:

- 營運特助 / Operations Assistant
- 專案協調員 / Project Coordinator
- 估價與毛利守門員 / Quote & Margin Guardian

The shared runtime owns agent identity, run state, evidence-linked prepared actions, approval policy, execution policy, generated internal tasks and audit entries.

## Shared execution policy

Automatic:
- Read current synthetic workspace records.
- Review structured evidence.
- Calculate deterministic business values already supported by StrideBrain.
- Prepare drafts and internal review notes.

Human approval required:
- Create an internal demo follow-up work item.

Blocked:
- Send external email, LINE or other messages.
- Modify customer, supplier or other business records.
- Approve quotations.
- Payments or financial transactions.
- Unregistered action kinds.

The runtime rejects blocked and unregistered actions even if an approval action is simulated.

## Specialist behavior

### Operations Assistant
Uses the shared priority review to prepare follow-ups for the current workspace shortlist.

### Project Coordinator
Uses recorded blockers and due dates to prepare coordination follow-ups. It does not infer unrecorded dependencies as fact.

### Quote & Margin Guardian
Uses recorded quotation price and direct cost to calculate reviewable gross-margin figures and prepare internal review tasks. It does not claim realized losses or causes.

## Model/runtime boundary

This release deliberately keeps the execution policy deterministic and provider-neutral. The existing Copilot model routing remains unchanged. Vercel AI SDK is not added as an unused dependency; a model-driven planner/tool-loop adapter should be introduced only when it owns real agent planning calls behind this same permission runtime.

## Verification

- 228 unit/regression tests pass.
- 28 Chromium journey checks pass with simulated provider responses.
- Browser journey runs all three teammates, approves an internal task, and confirms it appears in Work Orders.
- Next.js production build compiles successfully.
- `git diff --check` is clean.

No invitation, model allowlist, provider quota, spending cap or production-branch controls were changed.
