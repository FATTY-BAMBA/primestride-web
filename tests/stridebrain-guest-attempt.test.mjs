import test from "node:test";
import assert from "node:assert/strict";
import {guestAttemptAddress} from "../src/lib/stridebrain-demo/guest-attempt.js";
const h=(props)=>new Headers(props);
test("admission picks platform forwarded address",()=>{assert.equal(guestAttemptAddress(h({"x-vercel-forwarded-for":"2001:db8::1","x-forwarded-for":"203.0.113.10"})),"2001:db8::1");});
test("admission accepts IPv4 and mapped IPv6",()=>{assert.equal(guestAttemptAddress(h({"x-forwarded-for":"203.0.113.42, 192.0.2.1"})),"203.0.113.42");assert.equal(guestAttemptAddress(h({"x-forwarded-for":"::ffff:192.0.2.1"})),"::ffff:192.0.2.1");});
test("admission fails closed when missing or malformed",()=>{assert.equal(guestAttemptAddress(h({})),null);assert.equal(guestAttemptAddress(h({"x-forwarded-for":"untrusted-user-value"})),null);});
