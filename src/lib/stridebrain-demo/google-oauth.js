import {createHash,createHmac,randomBytes,createCipheriv,createDecipheriv,timingSafeEqual} from "node:crypto";

export const GOOGLE_GMAIL_SEND_SCOPE="https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_CONNECTION_KEY="stridebrain:google:v1:connection";
export const DEFAULT_GOOGLE_REDIRECT_URI="https://demo.primestrideai.com/api/stridebrain-demo/google/callback";
const STATE_TTL_SECONDS=600;

const clean=(v,max)=>String(v??"").trim().slice(0,max);
const redisConfig=env=>{
 const url=env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"",token=env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 return url.startsWith("https://")&&token?{url:url.replace(/\/$/,""),token}:null;
};
const oauthConfig=env=>{
 const clientId=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_ID,300),clientSecret=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_SECRET,500);
 const sender=clean(env.STRIDEBRAIN_GOOGLE_SENDER||"hello@primestrideai.com",180).toLowerCase();
 const operatorSecret=env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||"";
 const redis=redisConfig(env);
 if(!clientId||!clientSecret||!sender.includes("@")||operatorSecret.length<20||!redis)return null;
 return {clientId,clientSecret,sender,operatorSecret,redis};
};
async function redisPipeline(commands,{env,requestFn}){
 const cfg=redisConfig(env);if(!cfg)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const r=await requestFn(cfg.url+"/pipeline",{method:"POST",headers:{Authorization:"Bearer "+cfg.token,"Content-Type":"application/json"},body:JSON.stringify(commands)});
 if(!r.ok)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const data=await r.json();return Array.isArray(data)?data.map(x=>x?.result):[];
}
const b64url=value=>Buffer.from(value).toString("base64url");
const unb64url=value=>Buffer.from(value,"base64url").toString("utf8");
const stateKey=(secret,sessionScope)=>createHmac("sha256",secret).update("stridebrain-google-oauth-state:v1:"+sessionScope).digest();
export function createGoogleOAuthState({sessionScope,env=process.env,now=Date.now(),nonce=randomBytes(18).toString("base64url")}={}){
 const cfg=oauthConfig(env);if(!cfg||!/^[a-f0-9]{24}$/.test(sessionScope||""))throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const payload=b64url(JSON.stringify({n:String(nonce).slice(0,80),e:Math.floor(now/1000)+STATE_TTL_SECONDS}));
 const mac=createHmac("sha256",stateKey(cfg.operatorSecret,sessionScope)).update(payload).digest("base64url");
 return payload+"."+mac;
}
export function verifyGoogleOAuthState({state,sessionScope,env=process.env,now=Date.now()}={}){
 const cfg=oauthConfig(env);if(!cfg||typeof state!=="string"||!/^[a-f0-9]{24}$/.test(sessionScope||""))return false;
 const [payload,mac,extra]=state.split(".");if(extra!==undefined||!payload||!mac)return false;
 const expected=createHmac("sha256",stateKey(cfg.operatorSecret,sessionScope)).update(payload).digest();
 let given;try{given=Buffer.from(mac,"base64url");}catch{return false;}
 if(given.length!==expected.length||!timingSafeEqual(given,expected))return false;
 try{const parsed=JSON.parse(unb64url(payload));const nowSeconds=Math.floor(now/1000);return typeof parsed.n==="string"&&parsed.n.length>=8&&Number.isInteger(parsed.e)&&parsed.e>=nowSeconds&&parsed.e<=nowSeconds+STATE_TTL_SECONDS;}catch{return false;}
}
export function googleRedirectUri(env=process.env){
 const custom=clean(env.STRIDEBRAIN_GOOGLE_REDIRECT_URI,500);
 if(custom){try{const u=new URL(custom);if(u.protocol==="https:"&&u.pathname==="/api/stridebrain-demo/google/callback")return u.toString();}catch{}}
 return DEFAULT_GOOGLE_REDIRECT_URI;
}
export function googleOAuthStatus({env=process.env,role=null}={}){
 const cfg=oauthConfig(env);return {provider:"google-workspace",configured:Boolean(cfg),roleAllowed:role==="staff",sender:cfg?.sender||null,scope:GOOGLE_GMAIL_SEND_SCOPE};
}
export function buildGoogleAuthorizationUrl({state,redirectUri,env=process.env}={}){
 const cfg=oauthConfig(env);if(!cfg||!state||!redirectUri)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const u=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 u.searchParams.set("client_id",cfg.clientId);u.searchParams.set("redirect_uri",redirectUri);u.searchParams.set("response_type","code");
 u.searchParams.set("scope",GOOGLE_GMAIL_SEND_SCOPE);u.searchParams.set("access_type","offline");u.searchParams.set("include_granted_scopes","true");
 u.searchParams.set("prompt","consent");u.searchParams.set("state",state);u.searchParams.set("login_hint",cfg.sender);
 const domain=cfg.sender.split("@")[1];if(domain)u.searchParams.set("hd",domain);
 return u.toString();
}
async function exchangeCode({code,redirectUri,env,requestFn}){
 const cfg=oauthConfig(env);if(!cfg)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const body=new URLSearchParams({client_id:cfg.clientId,client_secret:cfg.clientSecret,code,grant_type:"authorization_code",redirect_uri:redirectUri});
 const r=await requestFn("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
 if(!r.ok)throw Error("GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED");
 const data=await r.json();if(!data?.refresh_token)throw Error("GOOGLE_OAUTH_REFRESH_TOKEN_MISSING");
 return data;
}
const encryptionKey=secret=>createHash("sha256").update("stridebrain-google-token:v1:"+secret).digest();
function encryptToken(token,secret){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",encryptionKey(secret),iv);
 const encrypted=Buffer.concat([cipher.update(token,"utf8"),cipher.final()]),tag=cipher.getAuthTag();
 return [iv.toString("base64url"),tag.toString("base64url"),encrypted.toString("base64url")].join(".");
}
export function decryptGoogleRefreshToken(record,{env=process.env}={}){
 const cfg=oauthConfig(env);if(!cfg||!record?.encryptedRefreshToken)throw Error("GOOGLE_CONNECTION_UNAVAILABLE");
 const [iv,tag,data,extra]=String(record.encryptedRefreshToken).split(".");if(extra!==undefined)throw Error("GOOGLE_CONNECTION_INVALID");
 try{const decipher=createDecipheriv("aes-256-gcm",encryptionKey(cfg.operatorSecret),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");}catch{throw Error("GOOGLE_CONNECTION_INVALID");}
}
export async function completeGoogleOAuth({code,state,sessionScope,redirectUri,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const cfg=oauthConfig(env);if(!cfg)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 if(!verifyGoogleOAuthState({state,sessionScope,env,now}))throw Error("GOOGLE_OAUTH_STATE_INVALID");
 const tokens=await exchangeCode({code:String(code||""),redirectUri,env,requestFn});
 const record={provider:"google-workspace",sender:cfg.sender,scope:GOOGLE_GMAIL_SEND_SCOPE,connectedAt:new Date(now).toISOString(),encryptedRefreshToken:encryptToken(tokens.refresh_token,cfg.operatorSecret)};
 await redisPipeline([["SET",GOOGLE_CONNECTION_KEY,JSON.stringify(record)]],{env,requestFn});
 return {provider:record.provider,sender:record.sender,scope:record.scope,connectedAt:record.connectedAt};
}
export async function readGoogleConnection({env=process.env,requestFn=fetch}={}){
 const cfg=oauthConfig(env);if(!cfg)return null;
 try{const raw=(await redisPipeline([["GET",GOOGLE_CONNECTION_KEY]],{env,requestFn}))[0];if(!raw)return null;const record=JSON.parse(raw);return record?.provider==="google-workspace"&&record?.sender===cfg.sender?record:null;}catch{return null;}
}
