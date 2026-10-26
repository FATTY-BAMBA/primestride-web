import {emailConnectorStatus,sendControlledEmail} from "./email-connector.js";

const PROVIDERS=Object.freeze({
 "microsoft365":Object.freeze({id:"microsoft365",label:"Microsoft 365",channel:"email",implemented:true}),
 "line":Object.freeze({id:"line",label:"LINE Official Account",channel:"line",implemented:false}),
 "google-workspace":Object.freeze({id:"google-workspace",label:"Google Workspace",channel:"email",implemented:false})
});
export function listMessageConnectors(){return Object.values(PROVIDERS);}
export function messageConnectorStatus({providerId,role,env=process.env}={}){
 const provider=PROVIDERS[providerId];if(!provider)return {providerId,known:false,configured:false,implemented:false};
 if(providerId==="microsoft365"){
  const email=emailConnectorStatus({env,role});
  return {...provider,known:true,configured:email.configured,enabled:email.enabled,roleAllowed:email.roleAllowed,sender:email.sender,limits:email.limits};
 }
 return {...provider,known:true,configured:false,enabled:false,roleAllowed:role==="staff",sender:null,
  limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}};
}
export function communicationConnectionsSnapshot({role,env=process.env,organizationId="demo-workspace"}={}){
 return {organizationId,storage:"pilot-env",connections:listMessageConnectors().map(p=>messageConnectorStatus({providerId:p.id,role,env}))};
}
export async function sendApprovedMessage({providerId,channel,sessionScope,input,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const provider=PROVIDERS[providerId];if(!provider)throw Error("MESSAGE_PROVIDER_UNKNOWN");
 if(provider.channel!==channel)throw Error("MESSAGE_CHANNEL_MISMATCH");
 if(!provider.implemented)throw Error("MESSAGE_PROVIDER_NOT_IMPLEMENTED");
 if(providerId==="microsoft365"&&channel==="email")return sendControlledEmail({sessionScope,input,env,requestFn,now});
 throw Error("MESSAGE_PROVIDER_NOT_IMPLEMENTED");
}
