import {NextResponse} from "next/server";
import {createHmac} from "node:crypto";
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
 const base=process.env.STRIDEBRAIN_DEMO_SUPABASE_URL||"";
 const secret=process.env.STRIDEBRAIN_DEMO_SUPABASE_SECRET_KEY||"";
 const signing=process.env.STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||!secret||signing.length<32)return reply({active:false,code:"INVITE_GATE_UNAVAILABLE"},503);
 const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
 const attemptKey=createHmac("sha256",signing).update("invite-gate:"+forwarded).digest("hex");
 try{
  const gate=await fetch(base+"/rest/v1/rpc/stridebrain_guest_invite_gate",{method:"POST",headers:{"apikey":secret,Authorization:"Bearer "+secret,"Content-Type":"application/json"},body:JSON.stringify({p_subject_hash:attemptKey,p_limit:6}),cache:"no-store",signal:AbortSignal.timeout(3000)});
  if(!gate.ok)return reply({active:false,code:"INVITE_GATE_UNAVAILABLE"},503);
  if(await gate.json()!==true)return reply({active:false,code:"INVITE_RATE_LIMITED"},429);
 }catch{return reply({active:false,code:"INVITE_GATE_UNAVAILABLE"},503);}
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
