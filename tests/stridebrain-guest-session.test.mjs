import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {guestEnabled,inviteIdentity,issueGuestSession,guestSessionIdentity} from "../src/lib/stridebrain-demo/guest-session.js";
const code="stridebrain-demo-invitation-test-very-long";
const hash=createHash("sha256").update(code).digest("hex");
function setup(){process.env.STRIDEBRAIN_DEMO_GUEST_ENABLED="true";process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED="true";process.env.STRIDEBRAIN_DEMO_QUOTA_BACKEND="supabase";process.env.STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET="test-secret-not-for-production-32-characters";process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES=hash;process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_EXPIRATIONS=hash+":"+Math.floor(Date.now()/1000+3600);}
test("guest feature flag fails closed",()=>{setup();delete process.env.STRIDEBRAIN_DEMO_GUEST_ENABLED;assert.equal(guestEnabled(),false);assert.equal(inviteIdentity(code),null);});
test("guest invitation issues and verifies scoped signed session",()=>{setup();assert.equal(inviteIdentity(code),hash);const cookie=issueGuestSession(hash);assert.equal(guestSessionIdentity(cookie),hash);assert.equal(guestSessionIdentity(cookie+"0"),null);});
test("guest requires a valid invitation and enabled quota",()=>{setup();assert.equal(inviteIdentity("wrong"),null);process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED="false";assert.equal(guestSessionIdentity(issueAfterEnable()),null);function issueAfterEnable(){process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED="true";const value=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED="false";return value;}});
test("guest invitation revocation invalidates existing sessions",()=>{setup();const cookie=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES="";assert.equal(guestSessionIdentity(cookie),null);});

test("expired invitation rejects new entries and existing cookies",()=>{setup();const cookie=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_EXPIRATIONS=hash+":"+Math.floor(Date.now()/1000-10);assert.equal(inviteIdentity(code),null);assert.equal(guestSessionIdentity(cookie),null);});
