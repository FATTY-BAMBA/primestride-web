# StrideBrain Supabase preview foundation — 2026-10-20

## Provisioned isolation
- Supabase project: `stridebrain-demo-preview`
- Project ref: `mdldasphquwufxazelmk`
- Region: `ap-northeast-1` (Tokyo)
- Organization: FATTY-BAMBA's Org
- Initial database migration: `stridebrain_tenant_scoped_ai_quota_v1`
- Schema: `stridebrain` (separate from public schema)
- Seed organization slug: `stridebrain-demo-preview`, kind: `demo`

## Schema and API contracts
- `stridebrain.organizations(id,slug,name,kind,created_at)`: future tenant boundary; `kind` is `demo`, `internal`, or `customer`.
- `stridebrain.ai_quota_counters(organization_id,bucket_date,scope,subject_hash,used_count,updated_at)`: scoped UTC daily usage records.
- `stridebrain.reserve_ai_request(organization_id,subject_hash,session_limit,global_limit)`: PostgreSQL transaction-scoped advisory lock and atomic reservation of both session and organization-global daily request counts. Values 100/500 are application defaults, not hard-coded in the schema.
- RLS enabled on both tables; public, anon and authenticated roles have no direct schema/table/function privileges. The function is security-definer and MUST be exposed only through a controlled server-side database role with explicit EXECUTE privileges.
- A controlled test with temporary limits 2/3 correctly rejected the third request; the test transaction was rolled back.

## Promotion design
- Preserve one tenant-scoped data model for demo and real customers. Never use a demo-global business-data reader for actual client records.
- Keep separate Supabase projects per environment: preview, staging, production. Promote schema through reviewed migrations, NOT by copying demo data.
- Use verified identity + organization membership before any production action. Enforce organization scope in the backend, with RLS as defense in depth.
- Replace temporary signed staff credential with real user-bound subjects. Quotas then use a non-reversible pseudonymous subject hash and organization ID.
- Avoid storing user prompts, customer documents, secrets or raw personal identifiers in quota counters.
- Business tools stay read-only until explicit approval workflows with audit events are implemented.

## Not yet connected
The current Next.js preview route still uses the Redis-style optional quota adapter. The new Supabase database has NOT been connected to Vercel yet; do not enable `STRIDEBRAIN_DEMO_QUOTA_ENABLED=true` until the adapter is converted and tested.

Before activation: choose a server-side Supabase connection strategy, grant a least-privilege database role permission to call the function, store secrets in Preview only, add cost/concurrency controls, run failure and concurrency tests, and confirm 100/500 limits. Anonymous prospect AI access remains disabled.


## Vercel connection (prepared, not activated)
- New public-schema REST RPC `stridebrain_reserve_demo_quota` is callable by service_role only, and forwards to the tenant-scoped private function.
- Supabase RPC adapter `src/lib/stridebrain-demo/supabase-quota.js` is wired behind `STRIDEBRAIN_DEMO_QUOTA_BACKEND=supabase`.
- Configure these **Preview-only server** variables in Vercel: `STRIDEBRAIN_DEMO_QUOTA_BACKEND=supabase`, `STRIDEBRAIN_DEMO_SUPABASE_URL=https://mdldasphquwufxazelmk.supabase.co`, `STRIDEBRAIN_DEMO_ORGANIZATION_ID=35c78a0b-b0fa-4e31-bf96-7e56047e5c1c`, and `STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY` from the new preview project. Never use NEXT_PUBLIC_, paste the key in chat, or reuse production keys.
- **Do not enable** `STRIDEBRAIN_DEMO_QUOTA_ENABLED=true` until a real authenticated RPC test succeeds. This connection is currently code-complete but not live-verified.
- The current service-role key has broad rights and must remain server-only. Before real company accounts, replace with dedicated least-privilege access, authenticated organization membership, key rotation and comprehensive auditing.

## Preview environment correction — 2026-10-20
The four Supabase integration variables were initially applied to Vercel Production by mistake and subsequently retargeted to Preview only. Any deployment built before this correction must be rebuilt from the StrideBrain feature branch to receive the new Preview environment. Changing environment variable targets alone does not validate RPC access. Confirm live connectivity before enabling the quota enforcement switch.

## Preview quota activation (2026-10-20)
The StrideBrain feature-branch Preview environment now configures `STRIDEBRAIN_DEMO_QUOTA_ENABLED=true`, `STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS=100`, and `STRIDEBRAIN_DEMO_GLOBAL_DAILY_REQUESTS=500`. Confirm the next feature-branch build reaches READY before treating these settings as active. Connection probe and isolated reservation tests passed; six concurrent database requests at global limit three produced exactly three accepts and three rejections. Adapter failure paths are verified in mocked automated tests. Runtime provider spend ceilings, monetary budgeting, and public guest access remain separate release gates.
