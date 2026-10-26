import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {messageConnectorStatus} from "@/lib/stridebrain-demo/message-connectors";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request){
 const session=getSessionStatus(request.cookies),status=messageConnectorStatus({providerId:"microsoft365",role:session.role});
 return NextResponse.json({enabled:status.enabled===true,configured:status.configured===true,provider:status.configured?"microsoft-graph":null,
  sender:status.sender||null,roleAllowed:status.roleAllowed===true,limits:status.limits,activeSession:session.active===true},
  {headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie"}});
}
