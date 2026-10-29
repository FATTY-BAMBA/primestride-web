import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {resolveRuntimeContext} from "@/lib/stridebrain-demo/runtime-context";
import {communicationConnectionsSnapshot} from "@/lib/stridebrain-demo/message-connectors";
import {googleConnectionStatus} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";

export async function GET(request){
 const session=getSessionStatus(request.cookies);
 const context=resolveRuntimeContext({session});
 if(!context.ok){
  return NextResponse.json({code:context.code},{status:503,headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
 }
 const snapshot=communicationConnectionsSnapshot({role:session.role,organizationId:context.organizationId});
 if(session.active===true&&session.role==="staff"){
  const google=await googleConnectionStatus({role:"staff",organizationId:context.organizationId});
  snapshot.connections=snapshot.connections.map(conn=>conn.id==="google-workspace"?{
   ...conn,
   implemented:true,
   configured:google.configured===true,
   connected:google.connected===true,
   roleAllowed:google.roleAllowed===true,
   sender:google.sender||null,
   scope:google.scope||null,
   storage:google.storage||null,
   connectedAt:google.connectedAt||null
  }:conn);
 }
 return NextResponse.json({...snapshot,activeSession:session.active===true,runtimeMode:context.mode,dataClassification:context.dataClassification},
  {headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
}
