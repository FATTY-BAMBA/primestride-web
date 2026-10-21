import {NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {tokenMatches,createStaffSession,isStaffSessionValid,cookieSettings,SESSION_COOKIE} from "@/lib/stridebrain-demo/staff-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
function reply(data,status=200){return NextResponse.json(data,{status,headers});}
function validOrigin(request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin;}
export async function GET(request){
 if(process.env.STRIDEBRAIN_DEMO_GPT_ENABLED!=="true")return reply({active:false});
 const cookie=request.cookies.get(SESSION_COOKIE)?.value||"";
 const active=isStaffSessionValid(cookie);
 return reply({active,chatScope:active?createHash("sha256").update("stridebrain-staff-chat:"+cookie).digest("hex").slice(0,24):null});
}
export async function POST(request){
 if(!validOrigin(request))return reply({error:"Invalid origin"},403);
 if(process.env.STRIDEBRAIN_DEMO_GPT_ENABLED!=="true")return reply({error:"Staff AI is not enabled"},503);
 if(Number(request.headers.get("content-length")||0)>2048)return reply({error:"Invalid request"},413);
 let token="";
 try{const raw=await request.text();if(raw.length>2048)throw Error();token=JSON.parse(raw)?.token||"";}catch{return reply({error:"Invalid request"},400);}
 if(!tokenMatches(token))return reply({error:"Staff access could not be verified"},401);
 const response=reply({active:true});
 response.cookies.set(SESSION_COOKIE,createStaffSession(),cookieSettings);
 return response;
}
export async function DELETE(request){
 if(!validOrigin(request))return reply({error:"Invalid origin"},403);
 const response=reply({active:false});
 response.cookies.set(SESSION_COOKIE,"",{...cookieSettings,maxAge:0});
 return response;
}
