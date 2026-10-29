import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {
 GOOGLE_GMAIL_SEND_SCOPE,DEFAULT_GOOGLE_REDIRECT_URI,googleRedirectUri,googleOAuthStatus,
 buildGoogleAuthorizationUrl,completeGoogleOAuth,readGoogleConnection,decryptGoogleRefreshToken
}=await import("../src/lib/stridebrain-demo/google-oauth.js");
const {
 createGoogleOAuthTransaction,verifyGoogleOAuthTransaction
}=await import("../src/lib/stridebrain-demo/google-oauth-transaction.js");

const organizationId="demo-org";
const env={
 STRIDEBRAIN_GOOGLE_CLIENT_ID:"client-id.apps.googleusercontent.com",
 STRIDEBRAIN_GOOGLE_CLIENT_SECRET:"client-secret",
 STRIDEBRAIN_GOOGLE_SENDER:"hello@primestrideai.com",
 STRIDEBRAIN_DEMO_OPERATOR_SECRET:"operator-secret-at-least-twenty-characters",
 STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.com",
 STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"redis-token",
 STRIDEBRAIN_DEMO_ORGANIZATION_ID:organizationId
};
const scope="abcdef0123456789abcdef01";
function requestMock(store,{refreshToken="refresh-secret"}={}){
 return async(url,options={})=>{
  if(url==="https://redis.example.com/pipeline"){
   const commands=JSON.parse(options.body),results=commands.map(cmd=>{
    const [op,key,...args]=cmd;
    if(op==="GET")return {result:store.get(key)??null};
    if(op==="SET"){store.set(key,args[0]);return {result:"OK"};}
    if(op==="DEL"){store.delete(key);return {result:1};}
    return {result:null};
   });
   return {ok:true,json:async()=>results};
  }
  if(url==="https://oauth2.googleapis.com/token"){
   const body=String(options.body);
   assert.match(body,/grant_type=authorization_code/);
   assert.match(body,/redirect_uri=https%3A%2F%2Fdemo.primestrideai.com%2Fapi%2Fstridebrain-demo%2Fgoogle%2Fcallback/);
   return {ok:true,json:async()=>({access_token:"access",expires_in:3600,refresh_token:refreshToken,scope:GOOGLE_GMAIL_SEND_SCOPE,token_type:"Bearer"})};
  }
  throw Error("unexpected "+url);
 };
}

test("Google OAuth is staff-configured, organization-scoped and uses the stable callback",()=>{
 const status=googleOAuthStatus({env,role:"staff",organizationId});
 assert.equal(status.configured,true);
 assert.equal(status.organizationId,organizationId);
 assert.equal(googleOAuthStatus({env,role:"guest",organizationId}).roleAllowed,false);
 assert.equal(googleRedirectUri(env),DEFAULT_GOOGLE_REDIRECT_URI);
 assert.equal(googleRedirectUri({...env,STRIDEBRAIN_GOOGLE_REDIRECT_URI:"http://bad.test/callback"}),DEFAULT_GOOGLE_REDIRECT_URI);
});

test("OAuth transaction is signed, short-lived and carries trusted organization context",()=>{
 const now=1761386400000;
 const state=createGoogleOAuthTransaction({sessionScope:scope,organizationId,env,now,nonce:"nonce-123456789"});
 assert.deepEqual(verifyGoogleOAuthTransaction({state,env,now:now+1000}),{
  sessionScope:scope,organizationId,expiresAt:Math.floor(now/1000)+600
 });
 assert.equal(verifyGoogleOAuthTransaction({state:state+"x",env,now:now+1000}),null);
 assert.equal(verifyGoogleOAuthTransaction({state,env,now:now+601000}),null);
});

test("authorization URL requests only Gmail send with offline refresh access",()=>{
 const state=createGoogleOAuthTransaction({sessionScope:scope,organizationId,env,now:1761386400000,nonce:"nonce-123456789"});
 const u=new URL(buildGoogleAuthorizationUrl({state,redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env}));
 assert.equal(u.origin,"https://accounts.google.com");
 assert.equal(u.searchParams.get("scope"),GOOGLE_GMAIL_SEND_SCOPE);
 assert.equal(u.searchParams.get("access_type"),"offline");
 assert.equal(u.searchParams.get("prompt"),"consent");
 assert.equal(u.searchParams.get("login_hint"),"hello@primestrideai.com");
 assert.equal(u.searchParams.get("hd"),"primestrideai.com");
});

test("callback completion encrypts refresh token in organization-scoped storage",async()=>{
 const store=new Map(),now=1761386400000,requestFn=requestMock(store);
 const connected=await completeGoogleOAuth({code:"auth-code",redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env,requestFn,now});
 assert.equal(connected.sender,"hello@primestrideai.com");
 assert.equal(connected.organizationId,organizationId);
 const entries=[...store.entries()];
 assert.equal(entries.length,1);
 assert.match(entries[0][0],/demo-org/);
 assert.doesNotMatch(entries[0][1],/refresh-secret/);
 const record=await readGoogleConnection({env,organizationId,requestFn});
 assert.equal(record.sender,"hello@primestrideai.com");
 assert.equal(decryptGoogleRefreshToken(record,{env,organizationId}),"refresh-secret");
});

test("callback fails closed when Google does not return a refresh token",async()=>{
 const store=new Map(),now=1761386400000;
 await assert.rejects(()=>completeGoogleOAuth({
  code:"auth-code",redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env,
  requestFn:requestMock(store,{refreshToken:null}),now
 }),/GOOGLE_OAUTH_REFRESH_TOKEN_MISSING/);
});

test("existing Google env names work with the demo Supabase backend",async()=>{
 const supabaseEnv={
  GOOGLE_OAUTH_CLIENT_ID:"client-id.apps.googleusercontent.com",
  GOOGLE_OAUTH_CLIENT_SECRET:"client-secret",
  STRIDEBRAIN_GOOGLE_SENDER:"hello@primestrideai.com",
  STRIDEBRAIN_DEMO_OPERATOR_SECRET:"operator-secret-at-least-twenty-characters",
  STRIDEBRAIN_DEMO_SUPABASE_URL:"https://demo-project.supabase.co",
  STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY:"server-secret",
  STRIDEBRAIN_DEMO_ORGANIZATION_ID:organizationId
 };
 assert.equal(googleOAuthStatus({env:supabaseEnv,role:"staff",organizationId}).configured,true);
 assert.equal(googleOAuthStatus({env:supabaseEnv,role:"staff",organizationId}).storage,"supabase");
 const row={value:null},now=1761386400000;
 const requestFn=async(url,options={})=>{
  if(url==="https://oauth2.googleapis.com/token")return {ok:true,json:async()=>({access_token:"access",expires_in:3600,refresh_token:"refresh-secret",scope:GOOGLE_GMAIL_SEND_SCOPE,token_type:"Bearer"})};
  if(String(url).startsWith("https://demo-project.supabase.co/rest/v1/stridebrain_google_connections")){
   if(options.method==="POST"){row.value=JSON.parse(options.body);return {ok:true,json:async()=>null};}
   return {ok:true,json:async()=>row.value?[{provider:row.value.provider,sender:row.value.sender,scope:row.value.scope,connected_at:row.value.connected_at,encrypted_refresh_token:row.value.encrypted_refresh_token}]:[]};
  }
  throw Error("unexpected "+url);
 };
 await completeGoogleOAuth({code:"auth-code",redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,organizationId,env:supabaseEnv,requestFn,now});
 assert.equal(row.value.organization_id,organizationId);
 assert.doesNotMatch(row.value.encrypted_refresh_token,/refresh-secret/);
 const record=await readGoogleConnection({env:supabaseEnv,organizationId,requestFn});
 assert.equal(record.sender,"hello@primestrideai.com");
 assert.equal(decryptGoogleRefreshToken(record,{env:supabaseEnv,organizationId}),"refresh-secret");
});

test("callback does not require the staff session cookie after a signed staff-authorized transaction exists",()=>{
 const callback=readFileSync("src/app/api/stridebrain-demo/google/callback/route.js","utf8");
 const connect=readFileSync("src/app/api/stridebrain-demo/google/connect/route.js","utf8");
 assert.doesNotMatch(callback,/getSessionStatus/);
 assert.match(callback,/verifyGoogleOAuthTransaction/);
 assert.match(callback,/organizationId:transaction\.organizationId/);
 assert.match(connect,/getSessionStatus/);
 assert.match(connect,/session\.role!=="staff"/);
 assert.match(connect,/createGoogleOAuthTransaction/);
 assert.match(connect,/organizationId:context\.organizationId/);
});

test("AI Team boot refreshes Google status after successful OAuth return",()=>{
 const app=readFileSync("public/stridebrain-demo/app.js","utf8");
 assert.match(app,/allowedInitialViews=new Set\(\["overview","copilot","team"\]\)/);
 assert.match(app,/googleReturned=params\.get\("google"\)==="connected"/);
 assert.match(app,/await refreshMessageConnections\(\)/);
 assert.match(app,/google\?\.connected===true/);
 assert.match(app,/cleanUrl\.searchParams\.delete\("google"\)/);
});
