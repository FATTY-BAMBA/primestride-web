import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../public/stridebrain-demo/app.js",import.meta.url),"utf8");
const view=readFileSync(new URL("../public/stridebrain-demo/views-primary.js",import.meta.url),"utf8");
const guest=readFileSync(new URL("../public/stridebrain-demo/guest-entry.js",import.meta.url),"utf8");
test("guest sessions are restored independently of staff session",()=>{
 assert.match(app,/copilotGuest=true;copilotMode="gpt"/);
 assert.ok(app.includes('copilotGuest?"/api/stridebrain-demo/copilot/guest-session"'));
 assert.match(app,/copilotGuest=false;copilotMode="gpt"/);
});
test("guest sign out and model labels never claim staff access",()=>{
 assert.match(view,/isGuest\?'Guest AI workspace':'Internal staff AI mode'/);
 assert.match(view,/isGuest\?"Leave guest session":"Sign out of staff AI"/);
});
test("guest onboarding does not put invitation into a URL",()=>{
 assert.match(guest,/JSON\.stringify\(\{inviteCode:code\}\)/);
 assert.doesNotMatch(guest,/location\.search|URLSearchParams|localStorage|sessionStorage/);
});
