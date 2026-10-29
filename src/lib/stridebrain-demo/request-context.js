import {createHash} from "node:crypto";
import {allowedSessionModels,getSessionStatus} from "./session-status.js";
import {resolveRuntimeContext} from "./runtime-context.js";
import {tokenMatches} from "./staff-session.js";
import {DEFAULT_MODEL_ID} from "../../../public/stridebrain-demo/model-catalog.js";

const operatorScope=value=>createHash("sha256").update("stridebrain-operator-context:"+String(value||"")).digest("hex").slice(0,24);

/**
 * Canonical server request context for StrideBrain.
 * Demo invitations/staff access are authentication adapters; authorization always
 * flows through runtime organization context so tenant auth can replace them later
 * without changing application services.
 */
export function resolveStrideBrainRequestContext({cookies,operatorToken="",env=process.env}={}){
 const base=getSessionStatus(cookies,env);
 let session=base;
 if(!base.active&&tokenMatches(operatorToken,env)){
  const allowedModelIds=allowedSessionModels("staff",env);
  const ready=env.STRIDEBRAIN_DEMO_GPT_ENABLED==="true"&&allowedModelIds.length>0;
  session={
   ...base,
   state:ready?"ready":"unavailable",
   active:true,
   available:ready,
   role:"staff",
   chatScope:operatorScope(operatorToken),
   allowedModelIds,
   defaultModelId:allowedModelIds.includes(DEFAULT_MODEL_ID)?DEFAULT_MODEL_ID:(allowedModelIds[0]||null),
   code:ready?null:"AI_UNAVAILABLE",
   authAdapter:"demo-operator-token"
  };
 }else if(base.active){
  session={...base,authAdapter:base.role==="guest"?"demo-invitation":"demo-staff-session"};
 }

 if(!session.active)return {ok:false,code:session.code||"SESSION_REQUIRED",session,runtime:null};

 const runtime=resolveRuntimeContext({session,env});
 if(!runtime.ok)return {ok:false,code:runtime.code,session,runtime};

 return {
  ok:true,
  code:null,
  session,
  runtime,
  organizationId:runtime.organizationId,
  role:session.role,
  dataClassification:runtime.dataClassification
 };
}
