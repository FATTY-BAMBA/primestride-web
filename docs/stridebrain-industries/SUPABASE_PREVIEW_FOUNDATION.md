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
