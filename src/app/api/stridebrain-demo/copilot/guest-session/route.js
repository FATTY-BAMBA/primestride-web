import {NextResponse} from "next/server";
import {guestEnabled,inviteIdentity,issueGuestSession,guestSessionIdentity,GUEST_COOKIE,guestCookieOptions} from "@/lib/stridebrain-demo/guest-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const reply=(data,status=200)=>NextResponse.json(data,{status,headers});
export async function GET(request){
 return reply({active:guestSessionIdentity(request.cookies.get(GUEST_COOKIE)?.value||"")!==null,available:guestEnabled()});
}
export async function POST(request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return reply({active:false,code:"ORIGIN_DENIED"},403);
 if(!guestEnabled())return reply({active:false,code:"GUEST_ACCESS_DISABLED"},503);
 if(Number(request.headers.get("content-length")||0)>1024)return reply({active:false,code:"INVALID_REQUEST"},413);
 let code;
 try{const raw=await request.text();if(raw.length>1024)throw Error();code=JSON.parse(raw)?.inviteCode;}catch{return reply({active:false,code:"INVALID_REQUEST"},400);}
 const identity=inviteIdentity(code);
 if(!identity)return reply({active:false,code:"INVALID_INVITATION"},401);
 const response=reply({active:true});
 response.cookies.set(GUEST_COOKIE,issueGuestSession(identity),guestCookieOptions);
 return response;
}
export async function DELETE(request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)return reply({code:"ORIGIN_DENIED"},403);
 const response=reply({active:false});response.cookies.set(GUEST_COOKIE,"",{...guestCookieOptions,maxAge:0});return response;
}
