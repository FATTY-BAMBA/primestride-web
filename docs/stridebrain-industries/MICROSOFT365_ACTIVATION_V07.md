# StrideBrain Microsoft 365 Activation v0.7

## What changed
Microsoft 365 now has an explicit staff-only readiness check before the first controlled live send.

Readiness stages:
- configuration complete
- Redis idempotency reachable
- Entra client credentials can obtain a Graph token
- first controlled send proven

## Important truth boundary
The readiness check does not claim Exchange RBAC send scope is proven. Token acquisition only proves Entra authentication. The final send-scope checkpoint becomes proven only after Microsoft Graph returns 202 Accepted for a controlled test email.

## Health endpoint
POST /api/stridebrain-demo/connections/health
- protected session required
- staff-only
- same-origin
- provider-neutral
- exposes no credentials

## UI
The AI Team Connections panel can show:
- Not configured
- Configured · not verified
- Credentials & idempotency ready
- Test send proven
- Last accepted send timestamp

Guests cannot trigger connector health probes.

## Verification
- 248 unit/regression tests passed.
- 28 Chromium journey checks passed.
- Production build compiled successfully.
- Static-asset integrity guard passed.
- Health tests distinguish credential readiness from proven controlled send.
