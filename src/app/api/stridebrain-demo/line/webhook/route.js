import {NextResponse} from "next/server";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {processLineWebhook,lineConnectorStatus} from "@/lib/stridebrain-demo/line-connector";
export const runtime="nodejs";export const dynamic="force-dynamic";

const json=(status,body)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});

export async function POST(request){
 const context=resolveRuntimeContext({session:{active:false,role:null}});
 if(!context.ok)return json(503,{code:context.code});
 const status=lineConnectorStatus({role:"staff",organizationId:context.organizationId});
 if(!status.configured)return json(503,{code:"LINE_CONNECTOR_UNAVAILABLE"});

 const signature=request.headers.get("x-line-signature")||"";
 let rawBody;
 try{rawBody=await request.text();}catch{return json(400,{code:"LINE_WEBHOOK_BODY_INVALID"});}
 if(rawBody.length>512000)return json(413,{code:"LINE_WEBHOOK_TOO_LARGE"});

 try{
  const result=await processLineWebhook({rawBody,signature,organizationId:context.organizationId});
  return json(200,{ok:true,...result});
 }catch(error){
  const code=String(error?.message||"LINE_WEBHOOK_FAILED");
  const http=code.includes("SIGNATURE")?401:code.includes("INVALID")?400:503;
  return json(http,{code});
 }
}
