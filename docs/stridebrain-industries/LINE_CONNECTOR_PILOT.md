# StrideBrain LINE Connector — Controlled Pilot Runbook

**Status:** implementation-ready; credentials not yet configured  
**Scope:** invited StrideBrain pilot only  
**Production principle:** reuse the same organization, verified-contact, approval, idempotency, and audit model already proven with Gmail.

## Client-facing story

StrideBrain does not replace LINE.

The business keeps using its LINE Official Account. StrideBrain sits behind the channel:

1. a customer or supplier messages the LINE Official Account;
2. LINE sends a signed webhook event to StrideBrain;
3. StrideBrain verifies that the event genuinely came from LINE;
4. the contact's LINE user ID remains untrusted until a staff member links it to a verified business contact;
5. AI may summarize context and prepare a response;
6. a human reviews and approves;
7. StrideBrain sends one controlled LINE message;
8. the action is recorded in the same organization-scoped audit trail used by other channels.

## Pilot webhook

`https://line-webhook.primestrideai.com/api/stridebrain-demo/line/webhook`

The webhook:
- reads the original raw request body;
- validates `x-line-signature` with HMAC-SHA256 using the channel secret;
- rejects invalid signatures before processing;
- bounds request size and event count;
- deduplicates webhook events by `webhookEventId`;
- stores bounded event metadata server-side;
- creates a **pending** LINE identity when a user ID is first observed;
- never automatically assigns that identity to a customer or supplier.

## Pilot credentials

Configure these only in Vercel server environment:

- `STRIDEBRAIN_LINE_CHANNEL_ID`
- `STRIDEBRAIN_LINE_CHANNEL_SECRET`
- `STRIDEBRAIN_LINE_CHANNEL_ACCESS_TOKEN`

Do not put these values in browser code, screenshots, demo seed data, model prompts, chat messages, or public documentation.

## LINE account setup

1. Create or choose a LINE Official Account.
2. Enable Messaging API for the Official Account.
3. Use the LINE provider intended to own this account long-term; provider assignment has operational implications and should not be treated as disposable.
4. In LINE Developers Console, obtain the channel ID and channel secret.
5. Issue the chosen channel access token.
6. Configure the StrideBrain webhook URL above.
7. Enable webhook delivery.
8. Add the credentials to the canonical demo branch environment.
9. Deploy a fresh build from the current canonical branch HEAD.
10. In StrideBrain AI Team, run **Check connection** for LINE Official Account.
11. Send a test LINE message to the Official Account.
12. Confirm StrideBrain records the event and creates a pending LINE identity.
13. Explicitly verify/link the test identity.
14. Send one human-approved one-to-one push message.
15. Confirm provider receipt and durable audit event.

## Outbound policy

Pilot LINE sending is intentionally limited to:
- one verified LINE identity;
- one text message;
- explicit final human approval;
- no multicast;
- no narrowcast;
- no broadcast;
- deterministic retry key on the first request;
- durable StrideBrain idempotency/audit record.

The implementation uses LINE's retry-key mechanism for push messages to reduce duplicate delivery risk on network/API retries.

## Current production-transfer seam

Demo credentials are environment-backed for speed. Real client accounts should move LINE credentials to organization-owned encrypted connector storage without changing:
- webhook validation;
- verified-contact registry;
- AI proposal behavior;
- approval contract;
- push-message adapter;
- audit receipt model.

## Next client-ready extensions

- staff UI to approve/link pending LINE identities;
- conversation thread view;
- inbound message classification;
- AI draft generation from project/customer context;
- approved LINE reply/push from the same decision card used for email;
- connector credential rotation and revocation;
- message-retention controls;
- monitoring and support runbook.


## Public ingress protection

The LINE webhook uses the dedicated custom hostname `line-webhook.primestrideai.com`.

Vercel Authentication remains enabled for the normal demo. The webhook hostname has a Vercel alias protection override because LINE cannot authenticate to Vercel. Application middleware then fails closed:

- only `POST /api/stridebrain-demo/line/webhook` is permitted on that hostname;
- every other path returns 404;
- non-POST methods on the webhook path return 405;
- the webhook still requires a valid LINE `x-line-signature`.

This keeps the external webhook reachable without creating an alternate public copy of the demo.
