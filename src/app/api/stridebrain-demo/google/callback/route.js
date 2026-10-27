import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {completeGoogleOAuth,googleRedirectUri} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const page=(title,text,status=200)=>new NextResponse('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font-family:system-ui;max-width:680px;margin:80px auto;padding:0 24px;color:#17352c}main{border:1px solid #d9e6e0;border-radius:16px;padding:28px;background:#fbfdfc}h1{font-size:22px}p{line-height:1.6;color:#52685f}a{color:#187658;font-weight:700}</style><main><h1>'+title+'</h1><p>'+text+'</p><a href="/stridebrain-demo/index.html?industry=interior&view=team">Return to StrideBrain AI Team</a></main>',{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store, max-age=0"}});
export async function GET(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active||session.role!=="staff")return page("Connection not authorized","Open this callback from an active StrideBrain staff session.",403);
 const url=new URL(request.url),error=url.searchParams.get("error");if(error)return page("Google connection cancelled","Google did not grant the requested Gmail send permission.",400);
 const code=url.searchParams.get("code"),state=url.searchParams.get("state");if(!code||!state)return page("Google connection incomplete","The OAuth callback did not contain the required authorization response.",400);
 try{
  const redirectUri=googleRedirectUri();
  const connected=await completeGoogleOAuth({code,state,sessionScope:session.chatScope,redirectUri});
  return page("Google Workspace connected","StrideBrain securely stored an encrypted offline connection for "+connected.sender+". You can return to AI Team and continue the controlled email setup.");
 }catch(error){return page("Google connection failed","StrideBrain did not save the connection ("+String(error?.message||"GOOGLE_OAUTH_FAILED")+").",502);}
}
