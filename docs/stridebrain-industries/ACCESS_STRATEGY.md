# StrideBrain access strategy — 2026-10-21

## Prospect demos: no account registration
Offer an invitation-only, no-signup experience. A prospect enters a unique access code and receives a short-lived, signed browser session. They explore a preconfigured sample workspace with demo data. They do not create an email/password login, and must not receive staff operator credentials.

The demo may be explored without the AI connection; guest paid AI remains disabled until the invitation, usage, provider-spend and browser acceptance gates are passed. Use one clear invitation prompt and one small “Demo data” disclosure rather than repeated prototype warnings.

## Real company pilots: verified accounts required
When a prospect elects to pilot StrideBrain with company data, create a verified organization and invite named staff members through Supabase Auth. Enforce organization membership, per-role authorization, tenant-scoped data access, auditable operations, and explicit connection approval. Never automatically promote an anonymous guest session to real company access.

## Journey
1. Prospect receives an out-of-band access code (no code in URL).
2. Code is exchanged for a time-limited guest cookie under rate limits; no personal signup.
3. Guest explores sample interior-design or printing workflows and, once enabled, approved guest AI models.
4. Guest may request a pilot with PrimeStride separately.
5. A pilot administrator provisions a verified company organization and invites staff. No demo records are treated as actual client history.

The pilot account and sample guest access use separate identity and authorization paths. Current guest access remains off; do not interpret the landing page as public AI signup.
