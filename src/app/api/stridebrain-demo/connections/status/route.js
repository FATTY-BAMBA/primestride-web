import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {communicationConnectionsSnapshot} from "@/lib/stridebrain-demo/message-connectors";
import {googleConnectionStatus} from "@/lib/stridebrain-demo/google-oauth";
export const runtime="nodejs";export const dynamic="force-dynamic";

export async function GET(request){
 const session=getSessionStatus(request.cookies);
 const snapshot=communicationConnectionsSnapshot({role:session.role});
 if(session.active===true&&session.role==="staff"){
  const google=await googleConnectionStatus({role:"staff"});
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
 return NextResponse.json({...snapshot,activeSession:session.active===true},
  {headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"}});
}
