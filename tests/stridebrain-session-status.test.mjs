import test from 'node:test';
import assert from 'node:assert/strict';
import {getSessionStatus,allowedSessionModels} from '../src/lib/stridebrain-demo/session-status.js';
import {issueGuestSession,GUEST_COOKIE} from '../src/lib/stridebrain-demo/guest-session.js';
import {createStaffSession,SESSION_COOKIE,cookieSettings} from '../src/lib/stridebrain-demo/staff-session.js';
import {setupEnv,hash,jar,modelId} from './helpers/stridebrain-session-fixtures.mjs';
test.beforeEach(setupEnv);
test('no cookies cannot authorize AI',()=>{const s=getSessionStatus(jar({}));assert.equal(s.state,'signed_out');assert.equal(s.active,false);assert.deepEqual(s.allowedModelIds,[]);});
test('guest session carries identity and allowed models without credentials',()=>{const cookie=issueGuestSession(hash);const s=getSessionStatus(jar({[GUEST_COOKIE]:cookie}));assert.equal(s.state,'ready');assert.equal(s.role,'guest');assert.match(s.chatScope,/^[a-f0-9]{24}$/);assert.deepEqual(s.allowedModelIds,[modelId]);for(const secret of [cookie,hash,process.env.STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET,process.env.OPENROUTER_API_KEY])assert.ok(!JSON.stringify(s).includes(secret));});
test('revoked invitation invalidates existing guest session',()=>{const cookie=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES='';const s=getSessionStatus(jar({[GUEST_COOKIE]:cookie}));assert.equal(s.active,false);assert.equal(s.code,'SESSION_EXPIRED');});
test('expired invitation rejects existing session',()=>{const cookie=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_EXPIRATIONS=hash+':'+Math.floor(Date.now()/1000-1);assert.equal(getSessionStatus(jar({[GUEST_COOKIE]:cookie})).state,'signed_out');});
test('valid staff cookie takes precedence consistently with AI route',()=>{const s=getSessionStatus(jar({[SESSION_COOKIE]:createStaffSession(),[GUEST_COOKIE]:issueGuestSession(hash)}));assert.equal(s.role,'staff');assert.equal(s.active,true);});
test('disabled AI retains a valid session but does not enable chat',()=>{const cookie=issueGuestSession(hash);process.env.STRIDEBRAIN_DEMO_GPT_ENABLED='false';const s=getSessionStatus(jar({[GUEST_COOKIE]:cookie}));assert.equal(s.state,'unavailable');assert.equal(s.active,true);});
test('missing provider configuration does not revoke identity',()=>{const cookie=issueGuestSession(hash);process.env.OPENROUTER_API_KEY='';const s=getSessionStatus(jar({[GUEST_COOKIE]:cookie}));assert.equal(s.active,true);assert.equal(s.state,'unavailable');assert.deepEqual(s.allowedModelIds,[]);});
test('global and guest model restrictions intersect; no configured key means no model',()=>{process.env.STRIDEBRAIN_DEMO_ALLOWED_MODELS='openai/gpt-6-sol';assert.deepEqual(allowedSessionModels('guest'),[]);process.env.STRIDEBRAIN_DEMO_ALLOWED_MODELS='';assert.ok(!allowedSessionModels('staff').includes('openai-direct/gpt-5.6'));});

test('staff cookie is secure HttpOnly and OAuth-compatible on top-level callback redirects',()=>{assert.equal(cookieSettings.httpOnly,true);assert.equal(cookieSettings.secure,true);assert.equal(cookieSettings.sameSite,'lax');assert.equal(cookieSettings.path,'/api/stridebrain-demo');});
