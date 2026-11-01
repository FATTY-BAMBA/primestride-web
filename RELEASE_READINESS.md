# StrideBrain release readiness

Status: design refinement in a draft review branch; not promoted to production. Updated 2026-10-11.

## October 11 refinement

- Place the benefit immediately below the product title and combine the alternate product name with the company endorsement.
- Rename the walkthrough CTA to “See an order in action” / “看看一筆訂單如何運作”.
- Increase source-chip, application-label, sample-metadata and answer text sizes and contrast.
- Use a stronger result panel and group answers with their expandable source. The customer-service example now exposes its existing lead-time source as well. After visual review, restore the original deep-plum hub finish, white title and lavender icon/subtitle while retaining the larger readable text.
- Keep the standalone knowledge hub and omit the illustrative SOPs, Pricing and Work records labels, plus the upper connector, as requested after reviewing the grouped-card exploration.
- At 480px and below, place application selectors in two centered rows instead of shrinking five labels into one row. Preserve readable touch targets and reduced-motion styles.
- This follow-up uses `feat/stridebrain-hero-readability`, based on `372544a`, because the previously reviewed refinement branch is now associated with the production project alias.

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
- The user-supplied Vercel share link unlocked the exact `d844d5d` preview. Desktop browser checks passed for the English and Chinese hero and language navigation at a 1363px viewport, with no document-level horizontal overflow.
- Exercised all five English hero applications, English source disclosures, all four order-walkthrough steps and reset. Job PS-0500 and its specifications persist across the walkthrough. The secondary CTA reaches `#demo`.
- Checked Chinese customer-service source expansion and the detailed quoting application. Native source controls and application buttons respond to Enter; the two explorers keep independent selections.
- Inspected deployed animation styles: connector signal runs once for 0.7s; result entry runs once for 0.35s. Application selections settle on the expected result. Reduced-motion behavior is code-reviewed, not browser-emulated.
- The Chinese consultation CTA reaches the form with StrideBrain preselected. No form was submitted.

## Preview limitations and release checks

- Preview access is resolved through the share link; no protection settings were changed. The available browser API has no viewport resizing or reduced-motion emulation, so tablet/phone visual and touch checks remain pending.
- Responsive code review confirms the single-column hero below 800px, centered 3+2 application layout below 480px, 44px minimum source controls, wrapping metadata, simplified mobile connectors and reduced-motion overrides. This is not a substitute for a rendered 320px/390px and tablet check.
- At those widths, check long English application labels, work-order stages, source expansion, result-height changes, persistent order brief and horizontal overflow. Test reduced-motion preference on a browser/device that can emulate it.
- Contact delivery remains untested; no submission was sent.
- Existing shared-footer Privacy Policy link is `#`; it still needs an approved destination.

## Deployment and rollback

The previous `feat/stridebrain-motion` head (`99defcc`) is associated with Vercel deployment `dpl_F5WDvDSpRMKi9HzMH7fkodTikcyL`, reported as production by the project response. To avoid an unintended live update, this refinement is isolated in `feat/stridebrain-product-refinement`, based on that head. Review the draft PR and confirm the intended release branch before merging. No production merge, promotion or settings change was performed. Retain the previous verified deployment for rollback.
