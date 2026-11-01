import {NextResponse} from "next/server";

const LINE_WEBHOOK_HOST="line-webhook.primestrideai.com";
const LINE_WEBHOOK_PATH="/api/stridebrain-demo/line/webhook";

// demo.primestrideai.com is the StrideBrain host only. The marketing website lives on
// primestrideai.com, so any website page requested here is sent to the StrideBrain entry.
const DEMO_HOST="demo.primestrideai.com";
const DEMO_ENTRY="/stridebrain-demo/guest.html";
const DEMO_PASSTHROUGH=["/stridebrain-demo","/stridebrain-interiors","/api/","/_next/","/visuals/"];

function isDemoAsset(pathname){
 if(DEMO_PASSTHROUGH.some(prefix=>pathname===prefix||pathname.startsWith(prefix.endsWith("/")?prefix:prefix+"/")))return true;
 const last=pathname.split("/").pop()||"";
 return last.includes(".");
}

export function middleware(request){
 const host=(request.headers.get("host")||"").split(":")[0].toLowerCase();
 if(host===DEMO_HOST){
  if(isDemoAsset(request.nextUrl.pathname))return NextResponse.next();
  const target=request.nextUrl.clone();
  target.pathname=DEMO_ENTRY; // query string (e.g. invitation codes) is kept
  return NextResponse.redirect(target,{status:307,headers:{"Cache-Control":"no-store"}});
 }
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
