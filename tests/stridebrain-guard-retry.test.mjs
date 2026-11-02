import test from "node:test";
import assert from "node:assert/strict";
import {guardFetch} from "../src/lib/stridebrain-demo/supabase-retry.js";

test("guard RPC retries once after a timeout and returns the second answer",async()=>{
 let calls=0;
 const response=await guardFetch(async()=>{calls++;if(calls===1)throw Error("timeout");return {ok:true,status:200};},"https://x.supabase.co/rest/v1/rpc/a",{method:"POST"});
 assert.equal(calls,2);assert.equal(response.status,200);
});

test("guard RPC retries a 5xx once, then stays fail-closed",async()=>{
 let calls=0;
 const response=await guardFetch(async()=>{calls++;return {ok:false,status:503};},"https://x.supabase.co/rest/v1/rpc/a",{method:"POST"});
 assert.equal(calls,2);assert.equal(response.ok,false);
 await assert.rejects(guardFetch(async()=>{throw Error("down");},"https://x.supabase.co/rest/v1/rpc/a",{}));
});

test("guard RPC does not retry a definitive answer",async()=>{
 let calls=0;
 await guardFetch(async()=>{calls++;return {ok:false,status:403};},"https://x.supabase.co/rest/v1/rpc/a",{});
 assert.equal(calls,1);
});
