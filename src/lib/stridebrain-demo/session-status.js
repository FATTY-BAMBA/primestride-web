import {createHash} from "node:crypto";
import {SESSION_COOKIE,isStaffSessionValid} from "./staff-session.js";
import {GUEST_COOKIE,guestEnabled,guestSessionIdentity,guestChatScope} from "./guest-session.js";
import {MODEL_CATALOG,DEFAULT_MODEL_ID,isModelAllowed} from "../../../public/stridebrain-demo/model-catalog.js";

/** Safe capability data only. Never return cookies, invite identities or secrets. */
export function allowedSessionModels(role,env=process.env){
 const guestModels=new Set((env.STRIDEBRAIN_DEMO_GUEST_ALLOWED_MODELS||"").split(",").map(s=>s.trim()).filter(Boolean));
 return MODEL_CATALOG.filter(item=>
  isModelAllowed(item.id,env.STRIDEBRAIN_DEMO_ALLOWED_MODELS||"")&&
  (role==="staff"||guestModels.has(item.id))&&
  !!(item.provider==="openrouter"?env.OPENROUTER_API_KEY:env.OPENAI_API_KEY)
 ).map(item=>item.id);
}
export function getSessionStatus(cookies,env=process.env){
 const staff=cookies.get(SESSION_COOKIE)?.value||"";
 const guest=cookies.get(GUEST_COOKIE)?.value||"";
 const staffValid=isStaffSessionValid(staff);
 const identity=guestSessionIdentity(guest);
 const available=env.STRIDEBRAIN_DEMO_GPT_ENABLED==="true"&&guestEnabled()&&allowedSessionModels("guest",env).length>0;
 if(!staffValid&&!identity)return {
  state:"signed_out",active:false,available,role:null,chatScope:null,allowedModelIds:[],defaultModelId:null,
  code:staff||guest?"SESSION_EXPIRED":"SESSION_REQUIRED"
 };
 // Same precedence as the chat route: a valid staff cookie wins over a guest cookie.
 const role=staffValid?"staff":"guest";
 const chatScope=staffValid?createHash("sha256").update("stridebrain-staff-chat:"+staff).digest("hex").slice(0,24):guestChatScope(identity);
 const allowedModelIds=allowedSessionModels(role,env);
 const ready=env.STRIDEBRAIN_DEMO_GPT_ENABLED==="true"&&allowedModelIds.length>0;
 return {state:ready?"ready":"unavailable",active:true,available,role,chatScope,allowedModelIds,
  defaultModelId:allowedModelIds.includes(DEFAULT_MODEL_ID)?DEFAULT_MODEL_ID:(allowedModelIds[0]||null),
  code:ready?null:"AI_UNAVAILABLE"};
}
