import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
import {emailConnectorStatus} from "@/lib/stridebrain-demo/email-connector";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request){
 const session=getSessionStatus(request.cookies),status=emailConnectorStatus({role:session.role});
 return NextResponse.json({...status,activeSession:session.active===true},{headers:{"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie"}});
}
