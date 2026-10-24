# Controlled 3–5-person pilot — bilingual usability release gate

**Status:** INTERNAL PILOT ONLY — not authorized for public customer distribution.

## Access boundary
- Use only existing, individually assigned invitation codes on `https://demo.primestrideai.com/stridebrain-demo/guest.html`.
- Guest mode remains feature-branch Preview scoped and must pass server-side invitation validation, expiry, request quota, budget reservation, and concurrency gate.
- Do not enable public, code-free Copilot, invite more than the current four testers, or publish the invitation code on the public StrideBrain product page.
- Invites configured on 2026-10-21 expire 2026-10-28 23:59 Asia/Taipei. **Do not extend without explicit approval.**
- Demo data only; no real client uploads, outbound messages, supplier orders or production approvals.

## Mandatory acceptance matrix
Run all tasks with **interior** and **printing**, **繁中** and **EN**, and both **desktop (>=1280px)** and **mobile (390px)**: 8 combinations, including guest-entry verification. Collect screenshots and user-visible failures.

1. **Guest access:** fresh code enters workspace, expired/invalid codes fail closed, sign-out ends guest session, no code appears in URL or browser storage. Confirm session after reload.
2. **No endless spinner:** initial industry loads, Copilot opens, language persists across refresh and industry switch, timeout presents retry/error on failure.
3. **Copilot:** shortcut labels, suggested prompts, follow-ups, model menu descriptions, guest footer, error and confirmation messages follow language setting. Chinese prompt produces Taiwan Traditional Chinese answer; English mode stays usable.
4. **Owner overview:** daily priorities, blocked-work explanation, source citations, and project/approval navigation function with consistent language; never claim simulated issue caused a verified loss.
5. **Risk Radar:** blocked item grouping, supporting IDs, and missing-evidence flags are grounded; clicking a result opens the correct project.
6. **Quote Guardian:** sample gross margin and tax calculations recalculate correctly; sample historical cost coverage warnings appear only with >=3 eligible observations covering >=60% of comparable completed projects. Preserve sources and human approval boundaries.
7. **Evidence and documents:** inspect source detail, close modal, download sample where available; no misleading link to a document absent from the current workspace; quote-only history excluded.
8. **Accessibility and mobile:** readable text >=14px for essential controls, no clipped CTAs/table actions, no horizontal page overflow at 390px, touch targets usable, language selector keyboard-accessible.
9. **Fallbacks:** no module syntax errors, network errors result in actionable messages, no uncaught exception blocking navigation.

## Release decision
**PASS:** all eight combinations complete core journey, zero P0/P1 failures, no English-only high-visibility controls in 繁中 mode, trustworthy sourcing and calculations verified. Requires real-browser visual evidence, not CI alone.

**BLOCK:** login hangs, AI access bypass, missing/misleading evidence, quote-calculation error, page unusable on mobile, untranslated key action confusing users.

**Known pending manual checks:** independent screenshot review; session + Copilot real provider smoke on the branded domain; mobile and printing workflows. Do not mark PASS based solely on source inspection.

## Pilot feedback (after gate passes)
Measure independent walkthrough completion, time-to-first-useful-insight, biggest point of confusion, and whether each tester can explain a concrete business use case. Do not infer product-market fit from successful login.
