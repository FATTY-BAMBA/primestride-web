import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {copilotErrorMessage} from '../../public/stridebrain-demo/copilot-errors.js';
import {createSessionTransport} from '../../public/stridebrain-demo/session-client.js';
import {modelId,ready,response} from './stridebrain-session-fixtures.mjs';
const source=readFileSync(new URL('../../public/stridebrain-demo/app.js',import.meta.url),'utf8');
const ask=source.slice(source.indexOf('async function ask(question){'),source.indexOf('function openSource(id){'));
const restoration=source.slice(source.indexOf('function applySessionStatus(info){'),source.indexOf('// Session verification begins immediately'));
const persistence=source.slice(source.indexOf('const GUEST_CHAT_PREFIX='),source.indexOf('function save(){'));
export function makeApp(fetchImpl=async()=>response(ready)){
 const storage=new Map(),calls=[],renders=[];
 const c=vm.createContext({
  console,URLSearchParams,setTimeout,clearTimeout,AbortController,
  copilotMode:'checking',copilotAccess:{state:'checking',allowedModelIds:[]},copilotBusy:false,copilotConnected:false,copilotRunId:0,
  copilotGuest:false,guestChatScope:null,copilotDraft:'',copilotModelMenuOpen:false,selectedModelId:modelId,DEFAULT_MODEL_ID:modelId,interfaceLocale:'zh-TW',
  sessionRefreshRun:0,sessionRefreshPromise:null,invitationAttempt:null,pack:{id:'interior'},model:{document:()=>true},view:{chat:[],page:'copilot'},
  sessionStorage:{get length(){return storage.size;},key:i=>[...storage.keys()][i],getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  render(){renders.push(c.copilotAccess.state);},toast(){},e:s=>String(s),gptAnswerCard:r=>r.answer,copilotErrorMessage,
  window:{scrollTo(){}},document:{body:{scrollHeight:0}},
  fetch:async(url,opts)=>{calls.push({url,...opts});return fetchImpl(url,opts);}
 });
 c.sessionTransport=createSessionTransport(c.fetch,30);
 vm.runInContext(persistence+'\n'+restoration+'\n'+ask,c);
 return {c,storage,calls,renders};
}
