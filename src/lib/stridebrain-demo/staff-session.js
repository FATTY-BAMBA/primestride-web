import {createHmac,createHash,timingSafeEqual} from "node:crypto";
export const SESSION_COOKIE="stridebrain_demo_staff";
const TTL_SECONDS=7*24*60*60;
function key(){return process.env.STRIDEBRAIN_DEMO_OPERATOR_SECRET||"";}
export function tokenMatches(given){
 const expected=key();
 if(typeof given!=="string"||given.length<20||expected.length<20)return false;
 return timingSafeEqual(createHash("sha256").update(given).digest(),createHash("sha256").update(expected).digest());
}
function signature(payload){return createHmac("sha256",key()).update("stridebrain-demo-v1:"+payload).digest("hex");}
export function createStaffSession(){
 if(key().length<20)throw Error("Demo staff access is not configured");
 const payload=String(Math.floor(Date.now()/1000)+TTL_SECONDS);
 return payload+"."+signature(payload);
}
export function isStaffSessionValid(value){
 if(typeof value!=="string"||key().length<20)return false;
 const [expiry,mac,extra]=value.split(".");
 if(extra!==undefined||!/^[0-9]{10}$/.test(expiry||"")||!/^[a-f0-9]{64}$/.test(mac||""))return false;
 const end=Number(expiry),now=Math.floor(Date.now()/1000);
 if(end<now||end>now+TTL_SECONDS)return false;
 return timingSafeEqual(Buffer.from(mac,"hex"),Buffer.from(signature(expiry),"hex"));
}
// Lax is required so the signed HttpOnly staff cookie is sent on Google's top-level OAuth redirect back.
export const cookieSettings={httpOnly:true,secure:true,sameSite:"lax",path:"/api/stridebrain-demo",maxAge:TTL_SECONDS};
