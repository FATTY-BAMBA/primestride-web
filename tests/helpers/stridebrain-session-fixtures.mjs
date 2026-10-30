import {createHash} from 'node:crypto';
export const modelId='anthropic/claude-sonnet-5.5';
export const scope='a'.repeat(24);
export const ready={state:'ready',active:true,available:true,role:'guest',chatScope:scope,allowedModelIds:[modelId],defaultModelId:modelId,code:null};
export const signedOut={state:'signed_out',active:false,available:true,role:null,chatScope:null,allowedModelIds:[],defaultModelId:null};
export const invitation='synthetic-test-invitation-not-a-real-pilot-code';
export const hash=createHash('sha256').update(invitation).digest('hex');
export function setupEnv(){Object.assign(process.env,{
 STRIDEBRAIN_DEMO_GPT_ENABLED:'true',STRIDEBRAIN_DEMO_GUEST_ENABLED:'true',
 STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET:'test-only-guest-signing-key-at-least-32-characters',
 STRIDEBRAIN_DEMO_OPERATOR_SECRET:'test-only-staff-access-code-not-for-production',
 STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES:hash,
 STRIDEBRAIN_DEMO_GUEST_INVITE_EXPIRATIONS:hash+':'+Math.floor(Date.now()/1000+3600),
 STRIDEBRAIN_DEMO_GUEST_ALLOWED_MODELS:modelId,STRIDEBRAIN_DEMO_ALLOWED_MODELS:'',
 STRIDEBRAIN_DEMO_QUOTA_ENABLED:'true',STRIDEBRAIN_DEMO_QUOTA_BACKEND:'supabase',
 STRIDEBRAIN_DEMO_BUDGET_ENABLED:'true',STRIDEBRAIN_DEMO_CONCURRENCY_ENABLED:'true',
 OPENROUTER_API_KEY:'synthetic-test-provider-key',OPENAI_API_KEY:''
 });}
export const jar=values=>({get:name=>values[name]?{value:values[name]}:undefined});
export const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
