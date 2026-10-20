/** Preview-only guest invite admission. Reject unknown IP before accepting a shared bucket. */
export function guestAttemptAddress(headers){
 const platform=headers.get("x-vercel-forwarded-for");
 const fallback=headers.get("x-forwarded-for");
 const source=platform||fallback||"";
 const candidate=source.split(",")[0]?.trim()||"";
 // Accept only IPv4 or IPv6 textual forms, never arbitrary forwarded user input.
 if(candidate.length<3||candidate.length>45||!(/^[0-9.]+$/.test(candidate)||/^[0-9a-fA-F:.]+$/.test(candidate)))return null;
 return candidate;
}
