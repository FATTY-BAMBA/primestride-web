import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("live StrideBrain release must retain AI Team navigation and implementation",()=>{
 const index=read("public/stridebrain-demo/index.html");
 const app=read("public/stridebrain-demo/app.js");
 const view=read("public/stridebrain-demo/views-ai-team.js");
 assert.match(index,/data-value="team"/,"AI Team navigation must remain in the live shell");
 assert.match(app,/view\.page="team"|value==="team"|setPage\(value\)/,"AI Team routing must remain reachable");
 assert.match(view,/CONNECTED CHANNELS|連線服務/,"AI Team connections surface must remain present");
});

test("live StrideBrain release must retain Google Workspace OAuth endpoints",()=>{
 for(const path of [
  "src/app/api/stridebrain-demo/google/connect/route.js",
  "src/app/api/stridebrain-demo/google/callback/route.js",
  "src/app/api/stridebrain-demo/google/status/route.js"
 ]) assert.equal(existsSync(path),true,path+" must exist");
 const connections=read("src/app/api/stridebrain-demo/connections/status/route.js");
 assert.match(connections,/googleConnectionStatus/,"main connection status must include Google OAuth state");
 assert.match(connections,/google-workspace/,"Google Workspace must be merged into the connection snapshot");
});

test("staff OAuth release contract remains callback-safe",()=>{
 const staff=read("src/lib/stridebrain-demo/staff-session.js");
 assert.match(staff,/sameSite:"lax"/,"staff cookie must survive top-level OAuth callback redirects");
 assert.match(staff,/httpOnly:true/);
 assert.match(staff,/secure:true/);
 const oauth=read("src/lib/stridebrain-demo/google-oauth.js");
 assert.match(oauth,/https:\/\/demo\.primestrideai\.com\/api\/stridebrain-demo\/google\/callback/);
 assert.match(oauth,/https:\/\/www\.googleapis\.com\/auth\/gmail\.send/);
});

test("live demo release workflow continues to gate the canonical branch",()=>{
 const workflow=read(".github/workflows/stridebrain-demo.yml");
 assert.match(workflow,/feature\/stridebrain-interiors-flagship-demo/);
 assert.match(workflow,/node --test tests\/stridebrain-\*\.test\.mjs/);
});

test("Vercel live-branch guard blocks incomplete or historical demo releases",()=>{
 const guard=read("scripts/sb-release-guard.sh");
 assert.match(guard,/LIVE_DEMO_RELEASE_POLICY\.md/);
 assert.match(guard,/data-value="team"/);
 assert.match(guard,/views-ai-team\.js/);
 assert.match(guard,/google\/connect\/route\.js/);
 assert.match(guard,/google\/callback\/route\.js/);
 assert.match(guard,/google\/status\/route\.js/);
 assert.match(guard,/googleConnectionStatus/);
 assert.match(guard,/sameSite:"lax"/);
 assert.match(guard,/exit 0/,"invalid release must tell Vercel to skip");
 assert.match(guard,/exit 1/,"valid release must tell Vercel to build");
});
