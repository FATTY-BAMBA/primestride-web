# StrideBrain Google OAuth Callback v0.8

## Stable redirect URI
https://demo.primestrideai.com/api/stridebrain-demo/google/callback

## Pilot OAuth contract
- Google Workspace internal OAuth client.
- Scope: https://www.googleapis.com/auth/gmail.send only.
- Server-side web application flow.
- access_type=offline with prompt=consent to obtain a refresh token.
- OAuth state is signed, short-lived, and bound to the active StrideBrain staff session.
- Refresh tokens are AES-256-GCM encrypted before Redis storage.
- The model never receives OAuth credentials or refresh tokens.
- The callback fails closed until Google OAuth credentials and Redis are configured.

## Required server configuration
- STRIDEBRAIN_GOOGLE_CLIENT_ID
- STRIDEBRAIN_GOOGLE_CLIENT_SECRET
- STRIDEBRAIN_GOOGLE_SENDER=hello@primestrideai.com
- STRIDEBRAIN_DEMO_REDIS_REST_URL
- STRIDEBRAIN_DEMO_REDIS_REST_TOKEN
- existing STRIDEBRAIN_DEMO_OPERATOR_SECRET is purpose-separated for encryption/state signing.
