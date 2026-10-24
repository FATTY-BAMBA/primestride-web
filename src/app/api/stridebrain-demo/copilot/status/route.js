import {NextResponse} from "next/server";
import {getSessionStatus} from "@/lib/stridebrain-demo/session-status";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request){
 const headers={"Cache-Control":"private, no-store, max-age=0",Vary:"Cookie","X-Content-Type-Options":"nosniff"};
 return NextResponse.json(getSessionStatus(request.cookies),{headers});
}
