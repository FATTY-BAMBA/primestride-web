import {createHmac} from "node:crypto";
import {NextResponse} from "next/server";
export const runtime="nodejs";export const dynamic="force-dynamic";

export async function GET(){
 const secret=String(process.env.STRIDEBRAIN_LINE_CHANNEL_SECRET||"").trim();
 const destination="U0123456789abcdef0123456789abcdef";
 if(secret.length<16)return NextResponse.json({ok:false,stage:"config",code:"LINE_SECRET_UNAVAILABLE"},{status:503});
 const rawBody=JSON.stringify({destination,events:[]});
 const signature=createHmac("sha256",secret).update(rawBody,"utf8").digest("base64");
 try{
  const response=await fetch("https://line-webhook.primestrideai.com/api/stridebrain-demo/line/webhook",{
   method:"POST",
   headers:{"Content-Type":"application/json","x-line-signature":signature},
   body:rawBody,
   cache:"no-store",
   redirect:"manual",
   signal:AbortSignal.timeout(10000)
  });
  const contentType=response.headers.get("content-type")||"";
  let code=null;
  if(contentType.includes("application/json")){
   try{const body=await response.json();code=body?.code||null;}catch{}
  }
  return NextResponse.json({
   ok:response.status===200,
   stage:"public-webhook",
   status:response.status,
   contentType:contentType.split(";")[0]||null,
   code,
   deploymentHeader:Boolean(response.headers.get("x-vercel-id"))
  },{status:200});
 }catch(error){
  return NextResponse.json({ok:false,stage:"network",code:String(error?.name||"FETCH_FAILED")},{status:200});
 }
}
