import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createSessionTransport,captureInvitation,createInvitationAttempt} from '../public/stridebrain-demo/session-client.js';
import {ready,signedOut,response,invitation} from './helpers/stridebrain-session-fixtures.mjs';
const source=readFileSync(new URL('../public/stridebrain-demo/guest-entry.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const tick=()=>new Promise(r=>setTimeout(r,5));
function setup(handler,hash=''){
 const handlers={},calls=[],redirects=[];
 const nodes={'invite-form':{addEventListener:(name,cb)=>handlers[name]=cb},code:{value:'',disabled:false},submit:{disabled:false},status:{textContent:'',classList:{toggle(){}}}};
 const location={hash,pathname:'/stridebrain-demo/guest.html',search:'',assign:url=>redirects.push(url)};
 const fetch=async(url,opts={})=>{calls.push({url,...opts});return handler(url,opts);};
 vm.runInNewContext(source,{document:{getElementById:id=>nodes[id]},window:{location,history:{state:null,replaceState(){location.hash='';}}},fetch,createSessionTransport,captureInvitation,createInvitationAttempt});
 return {nodes,handlers,calls,redirects,location};
}
test('disabled guest access stays at invitation entry',async()=>{const app=setup(()=>response({...signedOut,available:false}));await tick();assert.equal(app.nodes.submit.disabled,true);assert.equal(app.redirects.length,0);});
test('returning guest enters Copilot without another code',async()=>{const app=setup(()=>response(ready));await tick();assert.deepEqual(app.redirects,['/stridebrain-demo/index.html?industry=interior&view=copilot']);assert.equal(app.calls.length,1);});
test('valid code is POSTed once, then cookie is verified before redirect',async()=>{let accepted=false;const app=setup((url,o)=>{if(o.method==='POST'){accepted=true;return response({active:true});}return response(accepted?ready:signedOut);});await tick();app.nodes.code.value=invitation;await app.handlers.submit({preventDefault(){}});assert.equal(app.calls.filter(x=>x.method==='POST').length,1);assert.equal(app.calls.at(-1).url,'/api/stridebrain-demo/copilot/status');assert.equal(app.redirects.length,1);assert.equal(app.nodes.code.value,'');assert.equal(app.calls[1].credentials,'same-origin');});
test('accepted code without browser cookie does not redirect',async()=>{const app=setup((url,o)=>response(o.method==='POST'?{active:true}:signedOut));await tick();app.nodes.code.value=invitation;await app.handlers.submit({preventDefault(){}});assert.equal(app.redirects.length,0);assert.match(app.nodes.status.textContent,/Cookie/);});
test('invalid invitation remains at entry',async()=>{const app=setup((url,o)=>o.method==='POST'?response({code:'INVALID_INVITATION'},401):response(signedOut));await tick();app.nodes.code.value=invitation;await app.handlers.submit({preventDefault(){}});assert.equal(app.redirects.length,0);assert.match(app.nodes.status.textContent,/找不到/);});
test('fragment invitation uses the same exchange without exposing code in redirect',async()=>{const app=setup((url,o)=>response(o.method==='POST'?{active:true}:ready),'#invite='+invitation);await tick();assert.equal(app.location.hash,'');assert.equal(app.redirects.length,1);assert.ok(!app.redirects[0].includes(invitation));});
test('transient invitation failure retries without another typed code',async()=>{let attempt=0,accepted=false;const app=setup((url,o)=>{if(o.method==='POST'){if(++attempt===1)throw Error('offline');accepted=true;return response({active:true});}return response(accepted?ready:signedOut);});await tick();app.nodes.code.value=invitation;await app.handlers.submit({preventDefault(){}});assert.equal(app.nodes.code.value,'');assert.equal(app.redirects.length,0);await app.handlers.submit({preventDefault(){}});assert.equal(app.redirects.length,1);});
test('entry defaults to Traditional Chinese and retains English support',()=>{assert.match(source,/let language="zh-TW"/);assert.match(source,/applyLanguage\("zh-TW"\)/);assert.match(source,/en:\{/);});
