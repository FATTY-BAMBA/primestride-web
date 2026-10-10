# StrideBrain release readiness

Status: design refinement in a draft review branch; not promoted to production. Updated 2026-10-10.

## Candidate scope

- Replace the cropped moving arc with a compact company knowledge hub, five connected application selectors and an immediate sample result.
- Reuse the same sample job (PS-0500, 500 A3 posters) in the hero, detailed application explorer and four-step walkthrough.
- Give the data handover promise a prominent callout: clients supply their existing files; PrimeStride handles review, organization and setup.
- Use consistent SVG icons, selected states, source disclosures and short interaction motion. Motion finishes in under one second and respects reduced-motion preferences; there is no continuous animation or timer.
- Replace duplicate walkthrough navigation with persistent job specifications and the current step's purpose. Clarify sample pricing and channel options in Chinese and English.
- Preserve brand fonts, page structure, contact destinations and explicit sample-data boundaries. No backend messages, orders, integrations or new capabilities were added.

## Verified

- TypeScript check passed (`npx tsc --noEmit`).
- Production compilation, type/lint checks and generation of all 27 pages passed. This restricted environment requires an external memory-reporting compatibility shim because native `process.memoryUsage()` fails with `uv_resident_set_memory`; the shim is not application code and is not committed.
- `git diff --check` passed.
- React review: one local selection state per explorer, stable application keys, unique panel IDs, native disclosure controls, no effects/timers/listeners, no new dependencies.
- Accessible source controls and application selectors have visible focus styling; selectors retain `aria-pressed`, `aria-controls` and a polite result announcement.

## Preview limitations and release checks

- Exact-candidate browser verification remains pending. The cloud browser cannot reach this workspace's localhost, and the connected Vercel account is denied access to the `prime-stride-ai` deployment scope. No protection settings were changed.
- Verify Chinese and English at desktop, tablet and 320px/390px mobile widths. Check the five application labels, stable result height, source expansion, persistent order brief, keyboard operation, reduced motion and overflow.
- Walk through all five applications and all four order steps. The job specifications must remain unchanged; step navigation must not imply that an actual quote was approved or an order created.
- Check the contact CTA preselects StrideBrain. Contact delivery remains untested; no submission was sent.
- Existing shared-footer Privacy Policy link is `#`; it still needs an approved destination.

## Deployment and rollback

The previous `feat/stridebrain-motion` head (`99defcc`) is associated with Vercel deployment `dpl_F5WDvDSpRMKi9HzMH7fkodTikcyL`, reported as production by the project response. To avoid an unintended live update, this refinement is isolated in `feat/stridebrain-product-refinement`, based on that head. Review the draft PR and confirm the intended release branch before merging. No production merge, promotion or settings change was performed. Retain the previous verified deployment for rollback.
