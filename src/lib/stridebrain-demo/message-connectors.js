import {emailConnectorStatus,emailConnectorHealth,sendControlledEmail} from "./email-connector.js";
import {googleOAuthStatus,googleConnectionStatus} from "./google-oauth.js";
import {gmailConnectorStatus,sendControlledGmail} from "./gmail-connector.js";
import {lineConnectorStatus,lineConnectorHealth,sendControlledLinePush} from "./line-connector.js";

const PROVIDERS=Object.freeze({
 "microsoft365":Object.freeze({id:"microsoft365",label:"Microsoft 365",channel:"email",implemented:true}),
 "line":Object.freeze({id:"line",label:"LINE Official Account",channel:"line",implemented:true}),
 "google-workspace":Object.freeze({id:"google-workspace",label:"Google Workspace",channel:"email",implemented:true})
});
export function listMessageConnectors(){return Object.values(PROVIDERS);}
export function messageConnectorStatus({providerId,role,env=process.env,organizationId}={}){
 const provider=PROVIDERS[providerId];if(!provider)return {providerId,known:false,configured:false,implemented:false};
 if(providerId==="microsoft365"){
  const email=emailConnectorStatus({env,role});
  return {...provider,known:true,configured:email.configured,enabled:email.enabled,roleAllowed:email.roleAllowed,sender:email.sender,limits:email.limits};
 }
 if(providerId==="google-workspace"){
  const google=googleOAuthStatus({env,role,organizationId});
  return {...provider,known:true,configured:google.configured,enabled:google.configured,roleAllowed:google.roleAllowed,sender:google.sender,
   limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}};
 }
 if(providerId==="line"){
  const line=lineConnectorStatus({env,role,organizationId});
  return {...provider,known:true,configured:line.configured,enabled:line.configured,roleAllowed:line.roleAllowed,sender:line.sender,
   webhookUrl:line.webhookUrl,limits:line.limits};
 }
 return {...provider,known:true,configured:false,enabled:false,roleAllowed:role==="staff",sender:null,
  limits:{singleRecipient:true,attachments:false,bcc:false,bulk:false,requiresApproval:true}};
}
export function communicationConnectionsSnapshot({role,env=process.env,organizationId}={}){
 const org=String(organizationId??"").trim();
 if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(org))throw Error("ORGANIZATION_CONTEXT_REQUIRED");
 return {organizationId:org,storage:"pilot-env",connections:listMessageConnectors().map(p=>messageConnectorStatus({providerId:p.id,role,env,organizationId:org}))};
}
export async function checkMessageConnectorHealth({providerId,role,organizationId,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const provider=PROVIDERS[providerId];if(!provider)return {providerId,known:false,implemented:false,ready:false};
 if(!provider.implemented)return {...provider,known:true,configured:false,ready:false,checks:{implementation:{ok:false}}};
 if(providerId==="microsoft365"){
  const health=await emailConnectorHealth({env,role,requestFn,now});
  return {...provider,known:true,...health};
 }
 if(providerId==="google-workspace"){
  const health=await gmailConnectorStatus({env,role,organizationId,requestFn});
  return {...provider,known:true,configured:health.configured,connected:health.connected,ready:health.connected===true,
   sender:health.sender,roleAllowed:health.roleAllowed,connectionState:health.connectionState,
   checks:{configuration:{ok:health.configured},connection:{ok:health.connected===true}}};
 }
 if(providerId==="line"){
  const health=await lineConnectorHealth({env,role,organizationId,requestFn});
  return {...provider,known:true,...health};
 }
 return {...provider,known:true,configured:false,ready:false};
}
export async function sendApprovedMessage({providerId,channel,organizationId,sessionScope,input,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const provider=PROVIDERS[providerId];if(!provider)throw Error("MESSAGE_PROVIDER_UNKNOWN");
 if(provider.channel!==channel)throw Error("MESSAGE_CHANNEL_MISMATCH");
 if(!provider.implemented)throw Error("MESSAGE_PROVIDER_NOT_IMPLEMENTED");
 if(providerId==="microsoft365"&&channel==="email")return sendControlledEmail({sessionScope,input,env,requestFn,now});
 if(providerId==="google-workspace"&&channel==="email")return sendControlledGmail({organizationId,input,env,requestFn,now});
 if(providerId==="line"&&channel==="line")return sendControlledLinePush({organizationId,input,env,requestFn,now});
 throw Error("MESSAGE_PROVIDER_NOT_IMPLEMENTED");
}
