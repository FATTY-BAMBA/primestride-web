import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {communicationConnectionsSnapshot} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request){
 const session=getSessionStatus(request.cookies);
 return NextResponse.json({...communicationConnectionsSnapshot({role:session.role}),activeSession:session.active===true},
  {headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie"}});
}
