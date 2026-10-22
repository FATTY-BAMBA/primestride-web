# StrideBrain session continuity repair

Baseline: `d312f2e4a106231b456957b2aa54b1d581db5d69`.
Branch: `feature/stridebrain-interiors-flagship-demo`.
Pilot origin: `https://demo.primestrideai.com`.
Pilot entry: `/stridebrain-demo/guest.html`; workspace: `/stridebrain-demo/index.html?industry=interior&view=copilot`.

## Release contract

One invitation exchange creates the protected session used by chat. A returning guest must not enter a second code inside the workspace. Keep the entire invitation, redirect, workspace, and API journey on the pilot origin. Deployment-specific Vercel URLs are internal diagnostics, not replacement pilot links. Cookies stay HttpOnly, Secure, SameSite=Strict, host-only, and scoped to `/api/stridebrain-demo`.

The workspace has explicit `checking`, `ready`, `error`, `signed_out`, and `unavailable` states. It cannot submit AI questions while access is unresolved. HTTP errors, invalid responses, and network timeouts are recoverable connection errors, not proof of a signed-out user. No automatic `exampleAnswer()` fallback remains in the AI request flow. Drafts stay available when verification or a model request fails. The sample-data overview remains browseable independently of AI.

A shared status endpoint returns safe capability metadata: role, chat storage scope, permitted configured model IDs, and availability. It uses existing server validators and the same staff-before-guest precedence as the chat API. It does not return credentials or invitation identities. Invitation entry and fragment-link activation use one bounded transport and verify the cookie after POST success before opening chat. Transient invitation retries retain the code in memory only for up to five minutes, never in persistent storage, query strings, or referrers.

Model selection is limited to the server-returned guest allowlist. This UI filter is not authorization; existing server-side model, quota, spending, concurrency, invitation-expiry, and read-only controls remain authoritative and unchanged.

Each chat request sends the selected `zh-TW` or `en` locale. The API validates it and passes it to both runners. An explicit language instruction takes precedence; otherwise the UI locale governs short follow-ups. Provider details are mapped to friendly bilingual recovery messages.

## Automated verification

Run the normal suite:

```sh
node --test tests/stridebrain-*.test.mjs
for file in public/stridebrain-demo/*.js; do node --check "$file"; done
npm ci
npm run build
```

Run the browser session gate with an isolated dependency:

```sh
npm install --prefix /tmp/sb-browser --no-audit --no-fund playwright@1.51.1
/tmp/sb-browser/node_modules/.bin/playwright install --with-deps chromium
STRIDEBRAIN_PLAYWRIGHT_MODULE=/tmp/sb-browser/node_modules/playwright/index.mjs node tests/stridebrain-session.browser.mjs
```

The browser gate serves the actual static UI over local HTTPS, uses the actual signed-cookie/session policy functions with synthetic credentials, and simulates the final AI response. It tests one-code entry, cookie retention, stream rendering, source controls, refresh, language handoff, model filtering, slow verification, network/503/malformed responses, provider errors, expiry, sign-out, invitation links, and unauthenticated visitors. It makes no paid provider request and is not a substitute for deployed acceptance.

The pre-change suite had 88 passing tests but missed the startup fallback defect. A new reproduction failed on the baseline (a canned answer was returned before verification). The repaired unit/regression suite is expected to pass 131 tests. The browser gate is expected to pass 18 checks. Record actual run output with each release, not just expected counts.

## Deployed acceptance still required

- Verify the deployed commit on the existing pilot origin, without changing the production website.
- Verify that an invited browser can reach the pilot domain. Hosting-level protection and application invitations are separate; do not silently disable hosting protection to make an automated test pass.
- With an existing authorized pilot session, verify `/copilot/status` is `ready`, then submit a new Traditional Chinese question.
- Confirm a genuine provider result, selected permitted model, valid source IDs, and a meaningful follow-up. Do not treat a build, model selector, stubbed response, or environment-variable presence as proof of live AI.
- Refresh and navigate between modules/industries without a second invitation. Test explicit English output and a short Chinese follow-up.
- Verify expired/revoked invitations, request caps, spending limits, sign-out, and temporary provider failures remain safe. Do not expand the 3–5-person pilot until acceptance passes.

No provider key, real invitation code, staff secret, or production environment file belongs in this report or the test artifacts.
