import test from "node:test";
import assert from "node:assert/strict";
const {
 GOOGLE_GMAIL_SEND_SCOPE,DEFAULT_GOOGLE_REDIRECT_URI,googleRedirectUri,googleOAuthStatus,
 createGoogleOAuthState,verifyGoogleOAuthState,buildGoogleAuthorizationUrl,
 completeGoogleOAuth,readGoogleConnection,decryptGoogleRefreshToken
}=await import("../src/lib/stridebrain-demo/google-oauth.js");

const env={
 STRIDEBRAIN_GOOGLE_CLIENT_ID:"client-id.apps.googleusercontent.com",
 STRIDEBRAIN_GOOGLE_CLIENT_SECRET:"client-secret",
 STRIDEBRAIN_GOOGLE_SENDER:"hello@primestrideai.com",
 STRIDEBRAIN_DEMO_OPERATOR_SECRET:"operator-secret-at-least-twenty-characters",
 STRIDEBRAIN_DEMO_REDIS_REST_URL:"https://redis.example.com",
 STRIDEBRAIN_DEMO_REDIS_REST_TOKEN:"redis-token"
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
test("Google OAuth is staff-configured and uses the stable callback",()=>{
 assert.equal(googleOAuthStatus({env,role:"staff"}).configured,true);
 assert.equal(googleOAuthStatus({env,role:"guest"}).roleAllowed,false);
 assert.equal(googleRedirectUri(env),DEFAULT_GOOGLE_REDIRECT_URI);
 assert.equal(googleRedirectUri({...env,STRIDEBRAIN_GOOGLE_REDIRECT_URI:"http://bad.test/callback"}),DEFAULT_GOOGLE_REDIRECT_URI);
});
test("OAuth state is session-bound, signed and short-lived",()=>{
 const now=1761386400000,state=createGoogleOAuthState({sessionScope:scope,env,now,nonce:"nonce-123456789"});
 assert.equal(verifyGoogleOAuthState({state,sessionScope:scope,env,now:now+1000}),true);
 assert.equal(verifyGoogleOAuthState({state:state+"x",sessionScope:scope,env,now:now+1000}),false);
 assert.equal(verifyGoogleOAuthState({state,sessionScope:"111111111111111111111111",env,now:now+1000}),false);
 assert.equal(verifyGoogleOAuthState({state,sessionScope:scope,env,now:now+601000}),false);
});
test("authorization URL requests only Gmail send with offline refresh access",()=>{
 const state=createGoogleOAuthState({sessionScope:scope,env,now:1761386400000,nonce:"nonce-123456789"});
 const u=new URL(buildGoogleAuthorizationUrl({state,redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,env}));
 assert.equal(u.origin,"https://accounts.google.com");
 assert.equal(u.searchParams.get("scope"),GOOGLE_GMAIL_SEND_SCOPE);
 assert.equal(u.searchParams.get("access_type"),"offline");
 assert.equal(u.searchParams.get("prompt"),"consent");
 assert.equal(u.searchParams.get("login_hint"),"hello@primestrideai.com");
 assert.equal(u.searchParams.get("hd"),"primestrideai.com");
});
test("callback encrypts the refresh token before durable storage",async()=>{
 const store=new Map(),now=1761386400000,state=createGoogleOAuthState({sessionScope:scope,env,now,nonce:"nonce-123456789"});
 const requestFn=requestMock(store);
 const connected=await completeGoogleOAuth({code:"auth-code",state,sessionScope:scope,redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,env,requestFn,now});
 assert.equal(connected.sender,"hello@primestrideai.com");
 const raw=[...store.values()][0];
 assert.doesNotMatch(raw,/refresh-secret/);
 const record=await readGoogleConnection({env,requestFn});
 assert.equal(record.sender,"hello@primestrideai.com");
 assert.equal(decryptGoogleRefreshToken(record,{env}),"refresh-secret");
});
test("callback fails closed when Google does not return a refresh token",async()=>{
 const store=new Map(),now=1761386400000,state=createGoogleOAuthState({sessionScope:scope,env,now,nonce:"nonce-123456789"});
 await assert.rejects(()=>completeGoogleOAuth({code:"auth-code",state,sessionScope:scope,redirectUri:DEFAULT_GOOGLE_REDIRECT_URI,env,requestFn:requestMock(store,{refreshToken:null}),now}),/GOOGLE_OAUTH_REFRESH_TOKEN_MISSING/);
});
