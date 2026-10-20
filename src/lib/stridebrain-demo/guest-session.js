import {createHmac,createHash,randomBytes,timingSafeEqual} from "node:crypto";
export const GUEST_COOKIE="stridebrain_demo_guest";
const LIFETIME=24*3600;
const dig=value=>createHash("sha256").update(value).digest("hex");
function signingKey(){return process.env.STRIDEBRAIN_DEMO_GUEST_SESSION_SECRET||"";}
export function guestEnabled(){return process.env.STRIDEBRAIN_DEMO_GUEST_ENABLED==="true"&&signingKey().length>=32&&process.env.STRIDEBRAIN_DEMO_QUOTA_ENABLED==="true"&&process.env.STRIDEBRAIN_DEMO_QUOTA_BACKEND==="supabase";}
export function inviteIdentity(code){
 if(!guestEnabled()||typeof code!=="string"||code.length<24||code.length>256)return null;
 const allowed=(process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES||"").split(",").map(s=>s.trim().toLowerCase()).filter(s=>/^[a-f0-9]{64}$/.test(s));
 const hashed=dig(code);const candidate=Buffer.from(hashed,"hex");
 for(const known of allowed)if(timingSafeEqual(candidate,Buffer.from(known,"hex")))return hashed;
 return null;
}
function mac(payload){return createHmac("sha256",signingKey()).update("stridebrain-guest-v1:"+payload).digest("hex");}
export function issueGuestSession(identity,now=Date.now()){
 if(!guestEnabled()||!/^[a-f0-9]{64}$/.test(identity||""))throw Error("Guest access disabled");
 const expiry=Math.floor(now/1000)+LIFETIME;
 const payload=identity+"."+expiry+"."+randomBytes(16).toString("hex");
 return payload+"."+mac(payload);
}
export function guestSessionIdentity(value,now=Date.now()){
 if(!guestEnabled()||typeof value!=="string")return null;
 const parts=value.split(".");
 if(parts.length!==4)return null;
 const [identity,expiry,nonce,signature]=parts;
 if(!/^[a-f0-9]{64}$/.test(identity)||!/^[0-9]{10}$/.test(expiry)||!/^[a-f0-9]{32}$/.test(nonce)||!/^[a-f0-9]{64}$/.test(signature))return null;
 const seconds=Math.floor(now/1000),expires=Number(expiry);
 if(expires<=seconds||expires>seconds+LIFETIME)return null;
 if(!timingSafeEqual(Buffer.from(signature,"hex"),Buffer.from(mac(parts.slice(0,3).join(".")),"hex")))return null;
 // Disabling or deleting the invite hash immediately revokes all sessions.
 const invites=(process.env.STRIDEBRAIN_DEMO_GUEST_INVITE_HASHES||"").split(",").map(s=>s.trim().toLowerCase());
 return invites.includes(identity)?identity:null;
}
export const guestCookieOptions={httpOnly:true,secure:true,sameSite:"strict",path:"/api/stridebrain-demo",maxAge:LIFETIME};
