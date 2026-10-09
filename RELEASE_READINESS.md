# StrideBrain release readiness

Status: release candidate; not approved for production. Updated 2026-10-09.

## Candidate scope

- Preserve the site's 1180px container, Bricolage Grotesque / IBM Plex Sans / Noto Sans TC fonts and purple palette.
- Use a continuously animated cropped arc, with a static knowledge caption and selectable application summaries.
- Show sample disclosure in the detailed explorer, without repeating “Illustrative workflow” on every hero selection. Examples remain sample data, not a live backend integration.
- Support reduced motion, a keyboard-accessible pause control, 44px selector/control targets, and pausing animation outside the viewport or in a hidden tab.
- Remove obsolete full-circle and earlier hero styles.

## Verified

- `npm run build`: compilation, type/lint checks and generation of all 27 pages passed. The restricted build environment required an external memory compatibility shim; that shim is not application code and is not committed.
- `git diff --check` passed.
- Public English page: application selection changes the selected summary; source disclosure expands; the walkthrough advances through customer response and quote review.
- Public-page interaction evidence applies to the older deployed revision, not this exact candidate.

## Required before release

- Authenticate to the Vercel candidate preview and verify the exact commit. Current preview requires sign-in; the connected account cannot access its project.
- Inspect English and Chinese at desktop, tablet and narrow mobile widths. Check arc/caption overlap, text wrapping, overflow, navigation and selector layout.
- Exercise keyboard navigation, motion pause/resume, OS reduced motion, background-tab return and offscreen return in the candidate. Check console errors and missing assets.
- Verify the contact CTA preselects StrideBrain. Confirm successful delivery and failure handling with an explicitly authorized test submission; no test contact message has been sent.
- Supply the actual approved Privacy Policy page or URL. The shared footer currently links to `#`; do not fabricate policy terms.
- Resolve the stacked PR sequence (#3 then #4), confirm mergeability and deployment checks against the intended release base, and repeat the smoke test after deployment.

## Deployment and rollback

No production deployment or merge was performed by this release pass. Keep the candidate in draft until the gates above are complete. Record the deployed commit and the previous production deployment before promotion so rollback can target the verified previous release.
