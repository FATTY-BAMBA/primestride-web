# StrideBrain — Private Business Accounts vs Public Demo Catalog
Architecture Decision ADR-004 · 2026-10-18 · Design only, not yet implemented

## Product identity
StrideBrain is ONE SME operations platform. Industry packs define terminology, workflow, cost structures and default knowledge—not access to company information.

A sales-demo visitor can explore fictional interior-design and print businesses and switch between synthetic examples. A real business user can enter only companies in which their verified identity has an authorized active membership. No company is identified by email-domain guesswork.

## Separation of modes

| Capability | Public demo | Customer organization |
|---|---|---|
| Company switcher | All fictional demo packs | Only authorized active memberships |
| Data | Public references and clearly fictional business records | Company-owned documents and verified records |
| Persistence | Local browser or disposable isolated sandbox | Durable authenticated database plus document storage |
| AI retrieval | Fictional + curated public sources | Org-scoped and role-filtered tenant knowledge |
| Quoting | Synthetic calculations, simulated approvals | Verified actual cost data; authenticated approval rights |
| Outbound messages | Never sent | Authorized configured channel, explicit review and audit |
| Integrations | None | Tenant-specific permissioned credentials; server-side only |
| Data improvement | Curated public rules and local feedback | Human-reviewed company-specific versions; private by default |

## Entities
- users: identities from trusted provider (e.g. Clerk, SSO); minimal profile
- organizations: business account, industry pack, locale, settings
- organization_memberships: organization ID, user subject, role, active status, invite audit
- teams and assignments: restrict project, supplier, financial scope
- business objects: project / print job / production order / purchase order / client engagement
- customer and vendor master records; source documents and versions
- document chunks and embeddings, each carrying organization and document version
- quote and quote line, cost record, pricebook, approved price and validity dates
- tasks/work orders, approvals, activity and immutable audit events
- channel connectors and credential references (encrypted secrets never in browser).

## Tenant security principles
1. Server derives user identity and validates organization membership for every request.
2. Organization ID in URL, client request, model tool call or local storage is never sufficient authorization.
3. Every tenant-specific row and object-storage file is scoped by organization ID.
4. Restrict joins through composite organization-specific foreign keys, not bare IDs.
5. Use PostgreSQL row-level security as defense in depth plus independent server permission checks.
6. Retrieval-augmented search must filter organization and role BEFORE ranking or disclosing any chunk.
7. Cross-tenant analytics and AI training are disabled by default. No confidential knowledge shared to other companies.
8. Citation links and export/download endpoints verify permissions just as normal queries do.
9. Reviewer authorization, quote sending, payment or contract actions require server-side approval and audit.
10. Invitation acceptance, team moves, external subcontractors and offboarding must be tested for leakage.

## Suggested roles
Owner: organization settings, staff invitations, commercial approvals and finance.
Manager: assigned operations and delegated approvals.
Estimator: internal cost access and draft quotations, but not automatic self-approval.
Designer / prepress: relevant documents, designs, proofs, project status; sensitive margins restricted.
Operations: assigned work, status updates and approved instructions.
Viewer: approved read-only scope.
External contractor: only explicitly assigned project/task documents.

Roles alone are insufficient for real customers; decisions also depend on project assignment, financial sensitivity and approval thresholds.

## Data classifications
PUBLIC_REFERENCE: external laws/authoritative guidance/publisher examples with source URL and review date. Shared if permitted.
DEMO_SYNTHETIC: fabricated records limited to the public preview; never stored as real company history.
TENANT_PRIVATE: business files, customers, supplier terms, contracts, work records.
TENANT_RESTRICTED: sensitive prices, margins, personal data, trade secrets.
TENANT_APPROVED: authorized company rules and approved document revisions (still private).

## Account onboarding
Verified business owner registers an organization; selects an industry pack; configures company rules; invites staff by membership; imports PDF/Excel/SOP; reviews sources and prices; activates approved modules; performs controlled pilot, then optionally connects approved LINE/ERP/accounting integrations.

For a single person belonging to multiple organizations, company switching only lists memberships and ALL backend operations enforce the selected authorized organization.

## Privacy and compliance
Taiwan Personal Data Protection Act governs purpose-limited and lawful collection, processing, use and data-subject rights. Consult current legal counsel on actual data and contract obligations:
https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021

Explicitly plan data-owner rights, export/deletion, access revocation, retention, audit, processing region disclosures, breach response, backups and incident handling.

## Expansion packs — future, not yet implemented
Manufacturing: production orders, BOM, routing, capacity, quality and material movement.
Trading: sales/purchase orders, supplier terms, warehouse inventory, landed costs and lead times.
Professional services: engagement scopes, deliverables, timesheets, milestone billing, approvals.
All use the same core services but distinct industry-specific data and acceptance tests.

## Status
This is an architectural decision draft. No real company login, private tenant database or enterprise access controls have been deployed. Current user-facing examples remain public and synthetic. Do not market demo browser persistence as production account security.
