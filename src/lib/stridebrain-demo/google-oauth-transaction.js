import {createHmac,randomBytes,timingSafeEqual} from "node:crypto";

const TTL_SECONDS=10*60;
const SESSION_SCOPE=/^[a-f0-9]{24}$/;
const ORG_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/;

const b64=value=>Buffer.from(value).toString("base64url");
const unb64=value=>Buffer.from(value,"base64url").toString("utf8");

function secret(env=process.env){
 const value=String(env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||"");
 if(value.length<20)throw Error("GOOGLE_OAUTH_TRANSACTION_UNAVAILABLE");
 return value;
}
function mac(payload,env){
 return createHmac("sha256",secret(env))
  .update("stridebrain-google-oauth-transaction:v1:"+payload)
  .digest();
}

export function createGoogleOAuthTransaction({
 sessionScope,
 organizationId,
 env=process.env,
 now=Date.now(),
 nonce=randomBytes(18).toString("base64url")
}={}){
 if(!SESSION_SCOPE.test(String(sessionScope||""))||!ORG_ID.test(String(organizationId||"")))throw Error("GOOGLE_OAUTH_TRANSACTION_INVALID");
 const payload=b64(JSON.stringify({
  v:1,
  n:String(nonce).slice(0,80),
  e:Math.floor(now/1000)+TTL_SECONDS,
  s:sessionScope,
  o:organizationId
 }));
 return payload+"."+mac(payload,env).toString("base64url");
}

export function verifyGoogleOAuthTransaction({state,env=process.env,now=Date.now()}={}){
 if(typeof state!=="string")return null;
 const [payload,encodedMac,extra]=state.split(".");
 if(extra!==undefined||!payload||!encodedMac)return null;
 let given;
 try{given=Buffer.from(encodedMac,"base64url");}catch{return null;}
 let expected;
 try{expected=mac(payload,env);}catch{return null;}
 if(given.length!==expected.length||!timingSafeEqual(given,expected))return null;
 try{
  const parsed=JSON.parse(unb64(payload));
  const seconds=Math.floor(now/1000);
  if(parsed?.v!==1||typeof parsed.n!=="string"||parsed.n.length<8)return null;
  if(!Number.isInteger(parsed.e)||parsed.e<seconds||parsed.e>seconds+TTL_SECONDS)return null;
  if(!SESSION_SCOPE.test(parsed.s)||!ORG_ID.test(parsed.o))return null;
  return {sessionScope:parsed.s,organizationId:parsed.o,expiresAt:parsed.e};
 }catch{return null;}
}
