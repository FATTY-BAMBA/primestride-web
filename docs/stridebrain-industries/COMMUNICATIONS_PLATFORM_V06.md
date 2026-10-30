# StrideBrain Communications Platform v0.6

## What changed
Microsoft 365 email is now one adapter behind a provider-neutral Message Connector Registry.

Registered connectors:
- Microsoft 365 / email — implemented
- LINE Official Account / LINE — registered, not implemented
- Google Workspace / email — registered, not implemented

## Shared contract
Every provider uses the same concepts:
- connection status / capabilities
- human-approved CommunicationAction
- provider adapter
- provider receipt
- audit state

The generic send endpoint accepts provider + channel and fails closed for unknown, mismatched or unimplemented providers.

## Pilot connection storage
The current demo remains environment-backed. The generic status response exposes an organization/workspace identifier and no secrets. Production multi-tenant credential storage is intentionally deferred until a persistent encrypted organization-connection store is introduced.

## Contact identities
A contact-channel registry is now derived from synthetic workspace names, but all external email and LINE identities default to unlinked/null. StrideBrain does not infer or invent external identities from names.

## Compatibility
The existing v0.5 email status/send endpoints remain available as compatibility wrappers over the generic Microsoft 365 adapter.

## UX
AI Team includes a collapsed Connections surface showing:
- Microsoft 365 readiness
- LINE Official Account as the next Taiwan-first adapter
- Google Workspace as planned
- verified/unlinked contact identity count

## Verification
- 245 unit/regression tests passed.
- 28 Chromium journey checks passed.
- Production build compiled successfully.
- Generic connector tests cover Microsoft delegation, unimplemented providers, channel mismatch, secret-free status and non-invented contact identities.
