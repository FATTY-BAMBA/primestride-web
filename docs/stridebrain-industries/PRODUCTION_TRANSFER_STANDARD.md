# StrideBrain Production Transfer Standard

**Status:** Governing engineering standard  
**Applies to:** all customer-facing StrideBrain demo, pilot, and future tenant work  
**Does not apply to:** PrimeStride internal opportunity/research systems

## Product principle

The demo is a **production-shaped pilot**, not a disposable prototype.

A demo feature should be implemented as the same capability we expect to run for a real customer, with fictional data, constrained permissions, and pilot-scale infrastructure substituted at the boundaries. Moving from Horizon Atelier / Clearprint Studio to a paying client should primarily mean:

- create a real organization and memberships;
- replace demo fixtures with tenant repositories and document storage;
- configure tenant-specific rules and integrations;
- move feature flags from demo defaults to customer settings;
- enable production observability, backup, retention, and support controls.

It should **not** require rewriting the UI, AI orchestration, domain rules, approval model, connector contracts, or release process.

## Four readiness levels

### L0 — Prototype
Useful for internal exploration only.

May use hard-coded state, local-only persistence, fake integrations, incomplete error handling, or vertical-specific logic.

**Not allowed on the controlled customer demo branch.**

### L1 — Demo-safe
Safe for invited demonstration with fictional data.

Required:
- synthetic/public data clearly labeled;
- no real customer secrets in browser code;
- external actions disabled or explicit staff-only controlled tests;
- bounded AI usage and fail-closed errors;
- release tests and browser acceptance;
- no claim that demo state equals production security.

### L2 — Pilot-ready
Can be used with a small controlled real-business pilot.

Required in addition to L1:
- trusted user identity;
- organization context derived server-side;
- membership/role authorization on every tenant request;
- durable tenant-scoped persistence;
- encrypted tenant connector credentials;
- server-side action authorization and approval;
- immutable or append-only audit events for external/business-changing actions;
- backup/recovery, retention, incident and offboarding procedures;
- monitoring for auth, integration, AI and action failures.

### L3 — Client-ready
Suitable for repeatable onboarding of paying customers.

Required in addition to L2:
- multi-tenant isolation tested for read/write/export/retrieval/action paths;
- tenant onboarding and offboarding workflows;
- tenant-specific connector lifecycle and credential rotation;
- document ingestion/versioning/provenance;
- migration strategy and compatibility policy;
- role + assignment + financial-sensitivity authorization;
- production SLOs, error reporting and support runbooks;
- data export/deletion/retention controls;
- security review and penetration testing of critical paths;
- measured pilot acceptance and rollback procedures.

## Architecture rule: demo data is a tenant fixture

Horizon Atelier and Clearprint Studio are **fixtures**, not alternate product implementations.

The same application layers should serve demo and real tenants:

1. **Experience layer** — shared UI, bilingual rendering, workflow views.
2. **Domain layer** — projects/jobs, quotes, costs, work orders, approvals, contacts, evidence.
3. **Application services** — quoting, approval gates, AI planning, messaging, document workflows.
4. **Tenant/auth layer** — trusted user identity, organization membership, role/assignment policy.
5. **Repository layer** — demo fixtures today; tenant database/object storage tomorrow.
6. **Integration layer** — Google, Microsoft, LINE, accounting/ERP adapters behind server contracts.
7. **Audit/observability layer** — actions, connector events, model/tool runs, errors and release health.

A feature is considered transferable only when the demo-specific data source can be replaced without changing layers 1–3.

## Non-negotiable engineering rules

### 1. Server-derived tenant identity
Never authorize from an organization ID supplied only by the browser, URL, local storage, model output, or tool arguments.

For production tenants, the server must derive:
`user -> active membership -> organization -> role/assignment policy`.

### 2. Organization scope everywhere
Every tenant-private row, file, document chunk, connector credential, audit event and external action must carry an organization scope.

Cross-tenant joins must be impossible or explicitly privileged.

### 3. Demo fixtures never masquerade as customer data
Use the existing classifications:
- `PUBLIC_REFERENCE`
- `DEMO_SYNTHETIC`
- `TENANT_PRIVATE`
- `TENANT_RESTRICTED`
- `TENANT_APPROVED`

The UI and AI context must preserve provenance and classification.

### 4. Business rules are deterministic code
Margins, taxes, quote math, approval thresholds, recipient allowlists and workflow gates belong in typed/tested business logic.

The model may explain or recommend; it must not invent authoritative commercial calculations.

### 5. AI is permission-aware
AI retrieval and tools inherit the user's tenant, role, assignment and sensitivity boundaries before retrieval or action.

A model never receives broader data and then gets asked to "ignore" what it should not see.

### 6. External actions are explicit
Email, LINE, quote sending, contract changes, payments and business-record writes require authenticated server authorization.

Default posture:
- read/analyze: automatic when authorized;
- draft/propose: automatic when authorized;
- internal task creation: explicit approval;
- external send / financial / contractual action: explicit final approval and audit.

### 7. Integrations are tenant resources
Connector credentials are server-side, encrypted, revocable and owned by an organization.

Demo-wide environment credentials are acceptable only at L1 and must sit behind the same adapter contract intended for tenant credentials.

### 8. No secret-bearing browser state
Provider credentials, encryption keys, refresh tokens, service-role keys and privileged membership information never enter public JavaScript, HTML, localStorage or model prompts.

### 9. Durable auditability
Every consequential action should be reconstructable:
who, organization, role, source evidence, proposal, approval, connector, timestamp, result, error/receipt.

### 10. Releases are controlled
The canonical live branch, release-surface guard, quality gate and tested Vercel merge deployment are mandatory.

Historical redeploys are not a release mechanism.

## Definition of done for every new feature

A feature is not complete because the screen works.

Every feature PR must answer:

1. **Tenant boundary:** what organization owns the data/action?
2. **Authorization:** who may read, propose, approve and execute?
3. **Data classification:** demo, public, private, restricted or approved?
4. **Persistence:** what is the production repository contract?
5. **Audit:** what event proves what happened?
6. **Failure mode:** does it fail closed without corrupting state or faking success?
7. **Integration lifecycle:** how are credentials connected, rotated and revoked?
8. **AI boundary:** what data/tools can the model see and why?
9. **Migration path:** what changes when a real client replaces the fixture?
10. **Tests:** unit, tenant isolation, authorization, browser journey and release-surface coverage.

If these cannot be answered, the feature remains L0/L1 and must be labeled accordingly.

## Current capability assessment

| Area | Current state | Transfer target |
|---|---|---|
| Shared multi-industry UI | Strong L1 | Keep; move company selection to authorized memberships |
| Industry packs | Strong L1 | Tenant-configurable defaults, not tenant identity |
| Evidence-linked Copilot | Strong L1 | Org/role-filtered retrieval + durable citations |
| AI Team proposals | Strong L1 | Durable tenant tasks + audited approval events |
| Quote/margin logic | L1/L2-shaped | Real pricebooks, supplier validity, taxes, approval policy |
| Google Workspace OAuth | L2-shaped connector | Per-org connector table/credential service + lifecycle |
| Microsoft Graph connector | L2-shaped controlled adapter | Per-org credentials + recipient policy + audit repository |
| Guest invitations | L1 | Replace with customer identity/membership onboarding |
| Staff access code | L1 | Replace with real identity + privileged membership |
| Demo fixtures/browser state | L1 | Repository interfaces backed by tenant DB/object storage |
| Supabase quota/guard infrastructure | L1/L2-shaped | Tenant quotas, observability and billing controls |
| Release process | L2-shaped | Preserve for client releases; add environment promotion/SLOs |

## Priority migration sequence

### P0 — Preserve while building
- one canonical live release branch;
- release-surface and browser gates;
- evidence/provenance behavior;
- approval-before-action contract;
- server-only connector credentials;
- bilingual behavior and usability.

### P1 — Establish the production seam
- one server-side runtime/organization context abstraction;
- repository interfaces for projects, documents, quotes, work orders and approvals;
- connector registry keyed by trusted organization context;
- audit-event contract shared by all external/business-changing actions;
- remove new hard-coded `demo-workspace` ownership from server services.

### P2 — Real tenant foundation
- trusted authentication provider;
- organizations + memberships + assignments;
- PostgreSQL RLS plus server authorization;
- tenant object storage/document versions;
- connector credential store;
- audit log and admin lifecycle.

### P3 — Controlled real-business pilot
- import one real customer's documents;
- validate mapping with human review;
- connect one approved outbound channel;
- measure baseline and post-pilot operational outcomes;
- security/retention/offboarding acceptance.

### P4 — Repeatable client onboarding
- onboarding wizard/admin;
- tenant-specific feature flags and rules;
- export/deletion/retention;
- connector rotation/revocation;
- production monitoring, SLOs, support and incident runbooks.

## Rule for future decisions

When choosing between a fast demo-only patch and a slightly more structured implementation that can survive tenantization, choose the transferable implementation unless it materially delays a necessary safety fix.

The demo may use fictional data. The architecture should not be fictional.
