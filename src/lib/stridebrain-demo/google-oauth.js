import {createHash,randomBytes,createCipheriv,createDecipheriv} from "node:crypto";

export const GOOGLE_GMAIL_SEND_SCOPE="https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_CONNECTION_KEY="stridebrain:google:v2:connection";
export const DEFAULT_GOOGLE_REDIRECT_URI="https://demo.primestrideai.com/api/stridebrain-demo/google/callback";
const SUPABASE_TABLE="stridebrain_google_connections";
const ORG_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/;

const clean=(v,max)=>String(v??"").trim().slice(0,max);
const orgId=(value,env)=> {
 const candidate=clean(value||env.STRIDEBRAIN_DEMO_ORGANIZATION_ID,120);
 return ORG_ID.test(candidate)?candidate:null;
};
const redisConfig=env=>{
 const url=env.STRIDEBRAIN_DEMO_REDIS_REST_URL||"",token=env.STRIDEBRAIN_DEMO_REDIS_REST_TOKEN||"";
 return url.startsWith("https://")&&token?{kind:"redis",url:url.replace(/\/$/,""),token}:null;
};
const supabaseConfig=(env,organizationId)=>{
 const url=clean(env.STRIDEBRAIN_DEMO_SUPABASE_URL,500),key=String(env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"").trim();
 const organization=orgId(organizationId,env);
 return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&key&&organization?{kind:"supabase",url,key,organizationId:organization}:null;
};
const storageConfig=(env,organizationId)=>redisConfig(env)||supabaseConfig(env,organizationId);
const oauthConfig=(env,organizationId)=>{
 const clientId=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_ID||env.GOOGLE_OAUTH_CLIENT_ID,300);
 const clientSecret=clean(env.STRIDEBRAIN_GOOGLE_CLIENT_SECRET||env.GOOGLE_OAUTH_CLIENT_SECRET,500);
 const sender=clean(env.STRIDEBRAIN_GOOGLE_SENDER||"hello@primestrideai.com",180).toLowerCase();
 const operatorSecret=env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||"";
 const organization=orgId(organizationId,env);
 const storage=storageConfig(env,organization);
 if(!clientId||!clientSecret||!sender.includes("@")||operatorSecret.length<20||!storage||!organization)return null;
 return {clientId,clientSecret,sender,operatorSecret,storage,organizationId:organization};
};
const connectionKey=organizationId=>GOOGLE_CONNECTION_KEY+":"+organizationId;

async function redisPipeline(commands,{env,requestFn}){
 const cfg=redisConfig(env);if(!cfg)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const r=await requestFn(cfg.url+"/pipeline",{method:"POST",headers:{Authorization:"Bearer "+cfg.token,"Content-Type":"application/json"},body:JSON.stringify(commands)});
 if(!r.ok)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const data=await r.json();return Array.isArray(data)?data.map(x=>x?.result):[];
}
async function supabaseRead({env,requestFn,organizationId}){
 const cfg=supabaseConfig(env,organizationId);if(!cfg)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const q=new URL(cfg.url+"/rest/v1/"+SUPABASE_TABLE);
 q.searchParams.set("organization_id","eq."+cfg.organizationId);
 q.searchParams.set("select","provider,sender,scope,connected_at,encrypted_refresh_token");
 q.searchParams.set("limit","1");
 const r=await requestFn(q.toString(),{headers:{apikey:cfg.key,Authorization:"Bearer "+cfg.key,Accept:"application/json"},signal:AbortSignal.timeout(3000)});
 if(!r.ok)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const data=await r.json();const row=Array.isArray(data)?data[0]:null;
 return row?{provider:row.provider,sender:row.sender,scope:row.scope,connectedAt:row.connected_at,encryptedRefreshToken:row.encrypted_refresh_token}:null;
}
async function supabaseWrite(record,{env,requestFn,organizationId}){
 const cfg=supabaseConfig(env,organizationId);if(!cfg)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 const q=new URL(cfg.url+"/rest/v1/"+SUPABASE_TABLE);
 q.searchParams.set("on_conflict","organization_id");
 const body={organization_id:cfg.organizationId,provider:record.provider,sender:record.sender,scope:record.scope,connected_at:record.connectedAt,encrypted_refresh_token:record.encryptedRefreshToken,updated_at:new Date().toISOString()};
 const r=await requestFn(q.toString(),{method:"POST",headers:{apikey:cfg.key,Authorization:"Bearer "+cfg.key,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body),signal:AbortSignal.timeout(3000)});
 if(!r.ok)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
}
async function writeConnection(record,{env,requestFn,organizationId}){
 const cfg=storageConfig(env,organizationId);if(!cfg)throw Error("GOOGLE_CONNECTION_STORAGE_UNAVAILABLE");
 if(cfg.kind==="redis"){
  const organization=orgId(organizationId,env);if(!organization)throw Error("GOOGLE_ORGANIZATION_REQUIRED");
  await redisPipeline([["SET",connectionKey(organization),JSON.stringify(record)]],{env,requestFn});return;
 }
 await supabaseWrite(record,{env,requestFn,organizationId});
}

export function googleRedirectUri(env=process.env){
 const custom=clean(env.STRIDEBRAIN_GOOGLE_REDIRECT_URI,500);
 if(custom){try{const u=new URL(custom);if(u.protocol==="https:"&&u.pathname==="/api/stridebrain-demo/google/callback")return u.toString();}catch{}}
 return DEFAULT_GOOGLE_REDIRECT_URI;
}
export function googleOAuthStatus({env=process.env,role=null,organizationId}={}){
 const cfg=oauthConfig(env,organizationId);
 return {provider:"google-workspace",configured:Boolean(cfg),roleAllowed:role==="staff",sender:cfg?.sender||null,scope:GOOGLE_GMAIL_SEND_SCOPE,storage:cfg?.storage?.kind||null,organizationId:cfg?.organizationId||null};
}
export function buildGoogleAuthorizationUrl({state,redirectUri,organizationId,env=process.env}={}){
 const cfg=oauthConfig(env,organizationId);if(!cfg||!state||!redirectUri)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const u=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 u.searchParams.set("client_id",cfg.clientId);u.searchParams.set("redirect_uri",redirectUri);u.searchParams.set("response_type","code");
 u.searchParams.set("scope",GOOGLE_GMAIL_SEND_SCOPE);u.searchParams.set("access_type","offline");u.searchParams.set("include_granted_scopes","true");
 u.searchParams.set("prompt","consent");u.searchParams.set("state",state);u.searchParams.set("login_hint",cfg.sender);
 const domain=cfg.sender.split("@")[1];if(domain)u.searchParams.set("hd",domain);
 return u.toString();
}
async function exchangeCode({code,redirectUri,env,organizationId,requestFn}){
 const cfg=oauthConfig(env,organizationId);if(!cfg)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const body=new URLSearchParams({client_id:cfg.clientId,client_secret:cfg.clientSecret,code,grant_type:"authorization_code",redirect_uri:redirectUri});
 const r=await requestFn("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
 if(!r.ok)throw Error("GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED");
 const data=await r.json();if(!data?.refresh_token)throw Error("GOOGLE_OAUTH_REFRESH_TOKEN_MISSING");
 const granted=new Set(String(data.scope||"").split(/\s+/).filter(Boolean));
 if(data.scope&& !granted.has(GOOGLE_GMAIL_SEND_SCOPE))throw Error("GOOGLE_OAUTH_SCOPE_NOT_GRANTED");
 return data;
}
const encryptionKey=secret=>createHash("sha256").update("stridebrain-google-token:v1:"+secret).digest();
function encryptToken(token,secret){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",encryptionKey(secret),iv);
 const encrypted=Buffer.concat([cipher.update(token,"utf8"),cipher.final()]),tag=cipher.getAuthTag();
 return [iv.toString("base64url"),tag.toString("base64url"),encrypted.toString("base64url")].join(".");
}
export function decryptGoogleRefreshToken(record,{env=process.env,organizationId}={}){
 const cfg=oauthConfig(env,organizationId);if(!cfg||!record?.encryptedRefreshToken)throw Error("GOOGLE_CONNECTION_UNAVAILABLE");
 const [iv,tag,data,extra]=String(record.encryptedRefreshToken).split(".");if(extra!==undefined)throw Error("GOOGLE_CONNECTION_INVALID");
 try{const decipher=createDecipheriv("aes-256-gcm",encryptionKey(cfg.operatorSecret),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");}catch{throw Error("GOOGLE_CONNECTION_INVALID");}
}
export async function completeGoogleOAuth({code,redirectUri,organizationId,env=process.env,requestFn=fetch,now=Date.now()}={}){
 const cfg=oauthConfig(env,organizationId);if(!cfg)throw Error("GOOGLE_OAUTH_UNAVAILABLE");
 const tokens=await exchangeCode({code:String(code||""),redirectUri,organizationId:cfg.organizationId,env,requestFn});
 const record={provider:"google-workspace",sender:cfg.sender,scope:GOOGLE_GMAIL_SEND_SCOPE,connectedAt:new Date(now).toISOString(),encryptedRefreshToken:encryptToken(tokens.refresh_token,cfg.operatorSecret)};
 await writeConnection(record,{env,requestFn,organizationId:cfg.organizationId});
 return {provider:record.provider,sender:record.sender,scope:record.scope,connectedAt:record.connectedAt,organizationId:cfg.organizationId};
}
export async function readGoogleConnection({env=process.env,organizationId,requestFn=fetch}={}){
 const cfg=oauthConfig(env,organizationId);if(!cfg)return null;
 try{
  let record=null;
  if(cfg.storage.kind==="redis"){
   const raw=(await redisPipeline([["GET",connectionKey(cfg.organizationId)]],{env,requestFn}))[0];
   if(raw)record=JSON.parse(raw);
  }else record=await supabaseRead({env,requestFn,organizationId:cfg.organizationId});
  return record?.provider==="google-workspace"&&record?.sender===cfg.sender?record:null;
 }catch{return null;}
}
export async function googleConnectionStatus({env=process.env,role=null,organizationId,requestFn=fetch}={}){
 const base=googleOAuthStatus({env,role,organizationId});
 if(!base.configured||role!=="staff")return {...base,connected:false,connectedAt:null};
 const record=await readGoogleConnection({env,organizationId:base.organizationId,requestFn});
 return {...base,connected:Boolean(record),connectedAt:record?.connectedAt||null};
}
