import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {createGoogleOAuthTransaction} from "@/lib/stridebrain-demo/google-oauth-transaction";
import {buildGoogleAuthorizationUrl,googleOAuthStatus,googleRedirectUri} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";

export async function GET(request){
 const session=getSessionStatus(request.cookies);
 if(!session.active)return NextResponse.json({code:"GOOGLE_SESSION_REQUIRED"},{status:401});
 if(session.role!=="staff")return NextResponse.json({code:"GOOGLE_STAFF_ONLY"},{status:403});
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({code:"GOOGLE_ORIGIN_DENIED"},{status:403});

 const context=resolveRuntimeContext({session});
 if(!context.ok)return NextResponse.json({code:context.code},{status:503});

 const status=googleOAuthStatus({role:session.role});
 if(!status.configured)return NextResponse.json({code:"GOOGLE_OAUTH_UNAVAILABLE"},{status:503});

 const redirectUri=googleRedirectUri();
 const state=createGoogleOAuthTransaction({
  sessionScope:session.chatScope,
  organizationId:context.organizationId
 });
 return NextResponse.redirect(buildGoogleAuthorizationUrl({state,redirectUri,organizationId:context.organizationId}),303);
}
