# StrideBrain prospect-demo release gate (2026-10-20)

## What is safe now
- Keep public fictional industry walkthroughs and deterministic sample answers available.
- Keep paid OpenRouter/OpenAI endpoint staff-only using the server-signed staff session.
- Keep API keys server-side and never accept a model ID outside the curated allowlist.
- Treat every figure, quote and historical job in the preview as synthetic.
- Never imply a model-generated draft approved, sent or changed a business record.

## Added request quota foundation
- Set `STRIDEBRAIN_DEMO_QUOTA_ENABLED=true` to enforce a distributed daily request quota before the AI provider is called.
- Requires a protected Upstash Redis REST-compatible endpoint:
  `STRIDEBRAIN_DEMO_REDIS_REST_URL` and `STRIDEBRAIN_DEMO_REDIS_REST_TOKEN`.
- `STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS` defaults to 100 (per staff session, allowed range 1–1000).
- `STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS` defaults to 500 (shared across staff sessions, allowed range 1–10000).
- A single Redis Lua operation reserves both allowances atomically; exhausted allowances reject before paid provider calls.
- The request counter uses server-side atomic Redis operations and expires after two days.
- Quota storage unavailable => reject before provider call (fail closed).
- The quota is **disabled by default**, so this commit does not interrupt the existing staff preview.
- Never place these variables in NEXT_PUBLIC_ browser configuration.

## Critical limitations
This is **not** production billing protection: limits are per signed demo credential rather than verified user/org account, with no authoritative provider spend ledger. Staff-session reissuance can rotate the counted identity; the shared daily request ceiling still applies. It does not enforce actual costs per token/model, distinct users, simultaneous requests, or a monetary spending cap. Do not offer public AI access on this basis alone.

Before enabling any anonymous prospect demo:
1. Add independently verified identity/session attribution and shared per-user + global ceilings.
2. Add concurrency limits, spend/token tracking, and provider-side credit ceilings.
3. Evaluate provider data-processing terms and protect any customer uploads.
4. Add an explicit public-demo feature gate, independent of internal staff access.
5. Run full browser and authorization tests, including malicious repeated requests and multiple instances.
6. Ensure demos cannot retrieve real tenant documents or access staff-only operator controls.
7. Establish deploy rollback, monitoring, consent/privacy notices and an incident response path.

## Regression automation
`.github/workflows/stridebrain-demo.yml` checks browser module syntax and runs the StrideBrain Node test suite on branch pushes/PRs. A successful build is not a substitute for browser acceptance or provider billing validation.
