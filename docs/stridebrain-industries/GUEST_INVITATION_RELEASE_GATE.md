# StrideBrain restricted guest demo (implementation staged)
The backend supports opt-in invited guest sessions without sharing staff operator credentials. **Do not enable guest access for prospects yet**; this is infrastructure, not customer authentication.
Guest sessions are signed HttpOnly SameSite=Strict 24-hour cookies. Invite codes are only compared to allowlisted SHA-256 hashes stored server-side. Invitations can be revoked by removing their hashes. Quotas share one daily session identity per invitation (not per browser), which avoids browser-cookie rotation bypassing limits. Guest models have an independent allowlist.
Required Preview-only server settings before staged QA:
- `STRIDEBRAIN_DEMO_GUEST_ENABLED=true` (currently **unset**, remains disabled)
- `STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET` (independent random secret, at least 32 characters)
- `STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES` (comma-separated SHA-256 digests of unique long invitation codes; never commit plaintext codes)
- `STRIDEBRAIN_DEMO_GUEST_ALLOWED_MODELS` (explicit comma-separated approved model catalog identifiers; empty means no guest models)
- Existing Supabase quota enabled and OpenRouter provider ready.
Guest invitation exchange: POST `/api/stridebrain-demo/copilot/guest-session` same-origin JSON body `{"inviteCode":"..."}`. GET verifies current guest cookie; DELETE clears the cookie. Copilot POST allows valid guest cookies, but denies models outside the guest allowlist. Invitations should be distributed out-of-band and never placed in URL query strings.
Remaining production gates: model concurrency and monetary budget caps, user/organization roles, guest UX onboarding, rate-limit invitation attempts at the edge, invite expiration and admin lifecycle, tenant isolation, security review and end-to-end browser acceptance. No public sign-up or unrestricted paid AI access.
