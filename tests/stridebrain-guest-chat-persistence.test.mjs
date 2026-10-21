import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../public/stridebrain-demo/app.js",import.meta.url),"utf8");
test("guest chat is tab-only and separated by industry",()=>{
 assert.match(source,/sessionStorage\.setItem\(guestChatKey\(pack\.id\)/);
 assert.match(source,/const GUEST_CHAT_PREFIX="stridebrain-guest-chat-v1:"/);
 assert.match(source,/guestChatScope/);
 assert.doesNotMatch(source,/localStorage\.setItem\(guestChatKey/);
});
test("guest messages restore after reload and industry changes",()=>{
 assert.match(source,/if\(copilotGuest\)restoreGuestChat\(\)/);
 assert.match(source,/copilotGuest=true;copilotMode="gpt";copilotConnected=false;restoreGuestChat\(\)/);
 assert.match(source,/async function loadIndustry\(id\)\{\s*saveGuestChat\(\)/);
});
test("new conversation persists clearing and guest signout deletes both stores",()=>{
 assert.match(source,/view\.chat=\[\];copilotDraft="";copilotModelMenuOpen=false;saveGuestChat\(\)/);
 assert.match(source,/if\(copilotGuest\)clearGuestChat\(\)/);
 assert.match(source,/key\?\.startsWith\(GUEST_CHAT_PREFIX\)/);
});
test("persist only bounded conversation content, not browser-uploaded files",()=>{
 const persistence=source.slice(source.indexOf("function saveGuestChat()"),source.indexOf("function restoreGuestChat()"));
 assert.match(persistence,/slice\(-12\)/);
 assert.match(persistence,/\.slice\(0,3800\)/);
 assert.doesNotMatch(persistence,/documentSession|operatorToken|apiKey|fileData/);
});

test("guest chat scope is required before storage or restoration",()=>{assert.match(source,/guestChatScope\|\|""/);assert.match(source,/guestChatScope=info.chatScope/);});
