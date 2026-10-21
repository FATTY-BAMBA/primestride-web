import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("../public/stridebrain-demo/guest-entry.js",import.meta.url),"utf8");
function setup(initial){
 const handlers={},calls=[],messages=[];
 const nodes={
  "invite-form":{addEventListener:(name,cb)=>handlers[name]=cb},
  "code":{value:"",trim:null},
  "submit":{disabled:false},
  "status":{textContent:"",classList:{toggle:()=>{}}}
 };
 const document={getElementById:id=>nodes[id]};
 const redirects=[];
 const fetch=async(url,options={})=>{
  calls.push({url,method:options.method||"GET",credentials:options.credentials,body:options.body});
  const data=typeof initial==="function"?await initial(url,options):initial;
  return {ok:data.ok!==false,json:async()=>data.data||{}};
 };
 vm.runInNewContext(source,{document,fetch,window:{location:{assign:url=>redirects.push(url)}}});
 return {nodes,handlers,calls,redirects};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
test("disabled guest flag shows sample workspace path without login",async()=>{
 const app=setup({data:{active:false,available:false}});
 await tick();
 assert.equal(app.nodes.submit.disabled,true);
 assert.match(app.nodes.status.textContent,/sample workspace/);
 assert.equal(app.redirects.length,0);
});
test("returning guest is sent to Copilot without account signup",async()=>{
 const app=setup({data:{active:true,available:true}});
 await tick();
 assert.deepEqual(app.redirects,["/stridebrain-demo/index.html?industry=interior&view=copilot"]);
});
test("valid invitation exchanges code via POST body and redirects",async()=>{
 const app=setup((url,options)=>options.method==="POST"?{data:{active:true}}:{data:{active:false,available:true}});
 await tick();
 app.nodes.code.value="a".repeat(32);
 await app.handlers.submit({preventDefault(){}});
 assert.equal(app.calls.at(-1).method,"POST");
 assert.equal(app.calls.at(-1).credentials,"same-origin");
 assert.equal(JSON.parse(app.calls.at(-1).body).inviteCode,"a".repeat(32));
 assert.equal(app.redirects.length,1);
 assert.equal(app.nodes.code.value,"");
});
test("invalid invitation keeps guest on entry page",async()=>{
 const app=setup((url,options)=>options.method==="POST"?{ok:false,data:{code:"INVALID_INVITATION"}}:{data:{active:false,available:true}});
 await tick();
 app.nodes.code.value="x".repeat(30);
 await app.handlers.submit({preventDefault(){}});
 assert.equal(app.redirects.length,0);
 assert.match(app.nodes.status.textContent,/not recognized/);
});
