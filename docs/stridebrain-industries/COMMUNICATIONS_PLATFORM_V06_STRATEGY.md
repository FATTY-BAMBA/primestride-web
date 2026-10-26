# StrideBrain v0.6 Strategy — Communications Platform

## User outcome
Businesses connect the channels they already use while every AI coworker follows one approval, identity, receipt and audit contract.

## Architecture
AI teammate -> CommunicationAction -> Message Connector Registry -> Provider Adapter -> Provider Receipt.

Provider adapters:
- Microsoft 365 / Microsoft Graph (implemented)
- LINE Official Account (registered, not implemented yet)
- Google Workspace / Gmail (registered, not implemented yet)

## Acceptance criteria
- Existing Microsoft email behavior moves behind a provider-neutral Message Connector interface.
- Existing v0.5 email endpoints remain compatibility wrappers.
- New generic connection-status endpoint returns no secrets.
- New generic message-send endpoint supports approved email through Microsoft 365 and fails closed for unavailable providers.
- Connection status is organization/workspace scoped conceptually; the pilot store remains environment-backed and is explicitly labeled as such.
- Contact-channel identities exist as a separate model and default to unlinked when no verified identity exists.
- No synthetic email or LINE identity is invented from a person's name.
- UI exposes a compact Connections surface showing Microsoft 365, LINE Official Account and Google Workspace readiness.
- Current second-approval email UX remains unchanged.
- Model still has no external send tool.

## Non-goals
- No LINE sending yet.
- No Gmail sending yet.
- No production tenant credential database in this release.
- No automatic channel selection yet.
