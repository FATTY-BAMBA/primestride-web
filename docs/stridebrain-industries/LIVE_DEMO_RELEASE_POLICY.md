# StrideBrain Live Demo Release Policy

## Canonical live branch
The only branch allowed to represent the live customer demo is:

`feature/stridebrain-interiors-flagship-demo`

Although its historical name says "feature", treat it as the **release/stable branch** until the Vercel domain is deliberately migrated to a renamed branch.

Live domain:
`https://demo.primestrideai.com`

Vercel project:
`primestride-web`

## Required release flow
1. Never develop directly on the live branch.
2. Create a short-lived branch for each change.
3. Open a PR into the live branch.
4. Require the full StrideBrain Demo Quality Gate to pass:
   - browser JavaScript syntax
   - all `tests/stridebrain-*.test.mjs`
   - Chromium invitation/session journey
5. Merge only after the PR commit has a READY Vercel preview.
6. Wait for Vercel to build the **merge commit** from the live branch.
7. Before assigning or confirming `demo.primestrideai.com`, verify:
   - deployment branch = canonical live branch
   - deployment SHA = current live-branch HEAD
   - deployment state = READY
8. Smoke-check:
   - AI Team exists in navigation
   - Connected Channels exists
   - Google Workspace status is available
   - guest invitation entry still works
   - staff mode still works

## Critical Vercel rule
**Do not use "Redeploy" on a historical deployment.**

A historical redeploy preserves that deployment's old Git SHA. Because the custom domain is branch-bound, an old redeployment can become the newest deployment for the branch and steal the live alias, making newer features such as AI Team appear to vanish.

When environment variables change, create a fresh deployment from the **current live branch HEAD**, never from an old deployment ID.

## Release-surface guard
`tests/stridebrain-release-surface.test.mjs` blocks releases that remove:
- AI Team navigation
- AI Team connections UI
- Google OAuth connect/callback/status routes
- Google status integration in the main connections endpoint
- OAuth-compatible staff cookie settings
- the canonical Google callback URI

## Rollback rule
Rollback only to a deployment whose Git SHA is known and documented as a complete StrideBrain release. Never roll back by choosing a deployment solely because it is older or previously "worked."

## Current principle
There is **one live branch**. Feature branches are disposable. The custom domain must always resolve to the latest tested commit from the live branch.
