#!/bin/sh
# Vercel Ignored Build Step contract:
# exit 0 = skip this deployment; exit 1 = continue building.
# This script is intentionally inverted for that API.

bad=0

[ -f docs/stridebrain-industries/LIVE_DEMO_RELEASE_POLICY.md ] || bad=1
[ -f public/stridebrain-demo/views-ai-team.js ] || bad=1
[ -f src/app/api/stridebrain-demo/google/connect/route.js ] || bad=1
[ -f src/app/api/stridebrain-demo/google/callback/route.js ] || bad=1
[ -f src/app/api/stridebrain-demo/google/status/route.js ] || bad=1

grep -q 'data-value="team"' public/stridebrain-demo/index.html || bad=1
grep -q 'googleConnectionStatus' src/app/api/stridebrain-demo/connections/status/route.js || bad=1
grep -q 'sameSite:"lax"' src/lib/stridebrain-demo/staff-session.js || bad=1

if [ "$bad" -ne 0 ]; then
  echo "StrideBrain release surface incomplete; skipping Vercel deployment."
  exit 0
fi

# Release surface is intact. Non-zero tells Vercel to continue the build.
exit 1
