import test from "node:test";
import assert from "node:assert/strict";
import {register} from 'node:module';
register('./helpers/stridebrain-json-loader.mjs',import.meta.url);
const {normaliseMessages}=await import("../src/lib/stridebrain-demo/copilot-runner.js");

test("retried questions collapse to one user turn",()=>{
 const q="松山靜宅會不會延期？";
 assert.deepEqual(normaliseMessages([{role:"user",content:q},{role:"user",content:q},{role:"user",content:q}]),[{role:"user",content:q}]);
});

test("a normal alternating conversation is unchanged",()=>{
 const msgs=[{role:"user",content:"a"},{role:"assistant",content:"b"},{role:"user",content:"c"}];
 assert.deepEqual(normaliseMessages(msgs),msgs);
});

test("history never starts with an assistant turn and keeps the latest of a run",()=>{
 assert.deepEqual(normaliseMessages([{role:"assistant",content:"x"},{role:"user",content:"old"},{role:"user",content:"new"}]),[{role:"user",content:"new"}]);
});
