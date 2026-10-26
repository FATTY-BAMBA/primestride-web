# StrideBrain v0.7 Strategy — Microsoft 365 Activation Readiness

## Goal
Make the first real Microsoft 365 pilot safe to activate without weakening the existing second-approval send flow.

## Readiness checks
- Configuration is complete.
- Redis idempotency is reachable.
- Entra client credentials can obtain a Microsoft Graph access token.
- A real send is considered proven only after Microsoft Graph has accepted at least one controlled test email.

## Important boundary
A successful token check does not prove Exchange RBAC send scope. The first controlled test send remains the only end-to-end proof of scoped sending.

## UX
The Connections panel shows:
- not configured
- configured but unverified
- credentials/idempotency ready for test
- test send proven
- last accepted test timestamp

No secret values are exposed.
