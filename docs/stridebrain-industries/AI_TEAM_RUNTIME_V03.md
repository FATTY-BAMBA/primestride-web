# StrideBrain AI Team Runtime v0.3 — model-driven planning

Branch: `feature/stridebrain-interiors-flagship-demo`.

## What changed

The Operations Assistant now uses a real Vercel AI SDK `ToolLoopAgent` for its planning phase. The model is routed through the existing approved OpenRouter model/session path and inherits the same guest/staff access, model allowlist, quota, budget and concurrency protections as Copilot.

Pinned runtime packages:
- `ai@7.0.153`
- `@ai-sdk/openai-compatible@3.0.78`
- `zod` as the explicit tool schema dependency

## Model tool loop

The model can call only bounded planning tools:
- `list_priorities`
- `get_project`
- `get_source`
- `propose_followup`

The first three are read-only StrideBrain tools. `propose_followup` only submits a proposal into request memory; it does not create a task or send a message.

The Operations Assistant is instructed to inspect evidence before proposing work and can prepare at most three proposals per run.

## Two safety gates

1. Server planner validation:
   - Valid project required.
   - At least one valid source required.
   - Proposal count and field lengths bounded.
   - No execution tools are exposed to the model.

2. Browser runtime validation:
   - Model proposals are normalized into StrideBrain's fixed `create_internal_task` action type.
   - Unknown projects or proposals without evidence are rejected.
   - Human approval is still required before the internal demo task is created.
   - External sending, business-record edits, quote approvals and payments remain blocked.

## UX

The Operations Assistant now displays an AI work trace showing which read tools completed before the proposal was prepared. The trace explicitly states that these steps only read data and prepared proposals.

Project Coordinator and Quote & Margin Guardian remain on the deterministic shared runtime in this release. They will migrate to the same model-planner adapter only after this first tool-loop path is accepted.

## Verification

- 231 unit/regression tests pass.
- AI SDK mock-model test proves the model calls read tools before proposing a follow-up.
- Runtime tests prove invalid model proposals are rejected and valid proposals remain approval-required.
- 28 Chromium journey checks pass with simulated provider responses.
- Browser journey proves the Operations Assistant sends a protected `agent-plan` request, renders the AI tool trace, requires approval, and creates only an internal Work Order after approval.
- Next.js production build compiles successfully.
- `git diff --check` is clean.

Automated tests do not make a paid live-provider call. Live provider acceptance remains a separate controlled demo check.
