import {NextResponse} from "next/server";

const LINE_WEBHOOK_HOST="line-webhook.primestrideai.com";
const LINE_WEBHOOK_PATH="/api/stridebrain-demo/line/webhook";

export function middleware(request){
 const host=(request.headers.get("host")||"").split(":")[0].toLowerCase();
 if(host!==LINE_WEBHOOK_HOST)return NextResponse.next();
 if(request.nextUrl.pathname!==LINE_WEBHOOK_PATH){
  return new NextResponse("Not Found",{status:404,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
 if(request.method!=="POST"){
  return new NextResponse("Method Not Allowed",{status:405,headers:{"Allow":"POST","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
 return NextResponse.next();
}

export const config={matcher:"/:path*"};
