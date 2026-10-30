# AI Team v0.5 Strategy — Controlled Email Connector

## User outcome
A staff user can turn an AI-prepared follow-up into a real email without giving the model direct send authority.

## Acceptance criteria
- Microsoft Graph is the first provider; connector interface remains provider-neutral.
- Staff-only by default.
- Fixed configured sender.
- Exactly one recipient, from an explicit allowlist.
- No BCC, attachments or bulk send.
- Final To / Subject / Body preview is editable before send.
- Explicit "Approve & send" click immediately precedes the network send.
- Durable Redis-backed idempotency blocks duplicate sends for the same AI decision.
- Graph 202 is recorded as accepted, never delivered.
- Missing Graph or Redis configuration fails closed.
- The model has no send tool.

## Non-goals
- No automatic sending.
- No guest sending.
- No delivery/open tracking.
- No attachments.
- No reply/thread management yet.
