import test from "node:test";
import assert from "node:assert/strict";
import {enforceDemoQuota} from "../src/lib/stridebrain-demo/demo-quota.js";
const identity="a".repeat(64);
const keys=["STRIDEBRAIN_DEMO_QUOTA_ENABLED","STRIDEBRAIN_DEMO_REDIS_REST_URL","STRIDEBRAIN_DEMO_REDIS_REST_TOKEN","STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS"];
function envSet(values){for(const key of keys){if(values[key]===undefined)delete process.env[key];else process.env[key]=values[key];}}
test("quota stays off by default for existing staff preview",async()=>{
 envSet({});
 assert.deepEqual(await enforceDemoQuota({sessionId:identity}),{ok:true,enabled:false});
});
test("enabled quota fails closed when backend is unconfigured",async()=>{
 envSet({STRIDEBRAIN_DEMO_QUOTA_ENABLED:"true"});
 assert.equal((await enforceDemoQuota({sessionId:identity})).code,"DEMO_QUOTA_UNAVAILABLE");
});
test("enabled quota rejects missing or malformed session identifier",async()=>{
 envSet({STRIDEBRAIN_DEMO_QUOTA_ENABLED:"true"});
 assert.equal((await enforceDemoQuota({sessionId:"incorrect"})).code,"DEMO_QUOTA_SESSION_INVALID");
});
test("atomic backend count enforces the daily ceiling",async()=>{
 envSet({STRIDEBRAIN_DEMO_QUOTA_ENABLED:"true",STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.org",STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"test-token",STRIDEBRAIN_DEMO_MAX_DAILY_REQUESTS:"2"});
 let observed;
 const requestFn=async(_url,opts)=>{observed=JSON.parse(opts.body);return {ok:true,json:async()=>[{result:2}]};};
 const allowed=await enforceDemoQuota({sessionId:identity,requestFn,now:Date.UTC(2026,9,20)});
 assert.equal(allowed.ok,true);
 assert.equal(allowed.remaining,0);
 assert.equal(observed[0][0],"EVAL");
 assert.match(observed[0][3],/2026-10-20/);
 const blocked=await enforceDemoQuota({sessionId:identity,requestFn:async()=>({ok:true,json:async()=>[{result:3}]})});
 assert.equal(blocked.code,"DEMO_QUOTA_EXCEEDED");
});
test("redis errors never permit a provider call",async()=>{
 envSet({STRIDEBRAIN_DEMO_QUOTA_ENABLED:"true",STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.org",STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"test-token"});
 const failed=await enforceDemoQuota({sessionId:identity,requestFn:async()=>{throw Error("network failed");}});
 assert.equal(failed.ok,false);
});
