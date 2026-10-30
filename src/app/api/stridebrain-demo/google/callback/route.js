import {NextResponse} from "next/server";
import {verifyGoogleOAuthTransaction} from "@/lib/stridebrain-demo/google-oauth-transaction";
import {completeGoogleOAuth,googleRedirectUri} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";

const headers={"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store, max-age=0","Referrer-Policy":"no-referrer"};
const page=(title,text,status=200)=>new NextResponse('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font-family:system-ui;max-width:680px;margin:80px auto;padding:0 24px;color:#17352c}main{border:1px solid #d9e6e0;border-radius:16px;padding:28px;background:#fbfdfc}h1{font-size:22px}p{line-height:1.6;color:#52685f}a{color:#187658;font-weight:700}</style><main><h1>'+title+'</h1><p>'+text+'</p><a href="/stridebrain-demo/index.html?industry=interior&view=team&staff=1">Return to StrideBrain AI Team</a></main>',{status,headers});

export async function GET(request){
 const url=new URL(request.url);
 const state=url.searchParams.get("state");
 const transaction=verifyGoogleOAuthTransaction({state});
 if(!transaction)return page("Connection expired or invalid","This Google connection request was not recognized or has expired. Return to StrideBrain AI Team and start the connection again.",403);

 const error=url.searchParams.get("error");
 if(error)return page("Google connection cancelled","Google did not grant the requested Gmail send permission.",400);

 const code=url.searchParams.get("code");
 if(!code)return page("Google connection incomplete","The OAuth callback did not contain the required authorization response.",400);

 try{
  const redirectUri=googleRedirectUri();
  await completeGoogleOAuth({code,redirectUri,organizationId:transaction.organizationId});
  const destination=new URL("/stridebrain-demo/index.html",request.url);
  destination.searchParams.set("industry","interior");
  destination.searchParams.set("view","team");
  destination.searchParams.set("staff","1");
  destination.searchParams.set("google","connected");
  return NextResponse.redirect(destination,303);
 }catch(error){
  return page("Google connection failed","StrideBrain did not save the connection ("+String(error?.message||"GOOGLE_OAUTH_FAILED")+").",502);
 }
}
