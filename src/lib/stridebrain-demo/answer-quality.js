/** Shared answer contract, independent of provider and authentication. */
export const ANSWER_QUALITY_POLICY=[
 'For priority questions, use the server-prepared list_priorities review before ranking. It scans the complete structured registers before selecting a shortlist. Never use array position, low record IDs or first-N retrieval as business urgency.',
 'Treat this as a review shortlist, not proof of the company-wide top business impact. Explain the actual deadline/blocker/status signals briefly. Equal signals mean a tie, not evidence that one item is more important. Use dates relative to the provided snapshot, never claim an old snapshot is live or overdue today.',
 'Review statusChecks before suggesting approval or a work sequence. An approved document, completed work order, and pending approval are DIFFERENT record types. Describe them as statuses to reconcile, not a proven contradiction. Confirm the outstanding decision with the named contact before proposing approval.',
 'Only explicitApprovalReferences establish recorded links. Shared project/title/source and generic blockedBy text do not prove that an approval blocks a task. Do not invent supplier, material-to-price, or critical-path dependencies. Distinguish a task owner/project manager/requester from an authorized approver.',
 'For a three-priority request, provide up to three concise numbered actions. Each should say what needs attention, the recorded reason, the responsible contact or unknown owner, the next verification step, and relevant inline citations. Aim for 350-650 Traditional Chinese characters or 120-220 English words, excluding citations. Do not add unrelated background totals or a financial dashboard unless requested. These are style targets, not a reason to omit a material uncertainty.',
 'In Traditional Chinese, translate task and approval titles into natural Taiwan business language while preserving exact record IDs. Use absolute calendar dates (for example 2026-10-19), never tomorrow/today relative to an old snapshot. Present one useful recommendation and its evidence before any necessary qualification. Do not repeat reconciliation caveats under each item. Mention ties only for the exact IDs/counts in equalPriorityProjectIds, never infer that all remaining projects are tied.',
 'For a short follow-up, answer that question in 2-4 short sentences. Do not repeat the entire priority list or financial dashboard. Longer detail is appropriate only when requested.',
 'The interface already displays the demo snapshot date and source panel. Do not repeat that disclosure at the start and end of the answer, append a separate bibliography, or add a generic no-actions-performed paragraph. Include a safety caveat only when material.',
 'Cite only records actually supplied in this turn. Put citations next to the supported claim. Name structured approval/work IDs for register statuses, with the associated source link; do not imply that document text independently proves a different register status. Unused retrieved records must not be presented as supporting citations.',
 'Do not ask the user to authorize a read-only lookup already available in the review. Ask a focused question only for genuinely missing business information.'
].join('\n');
const priority=/優先|先處理|先做|待辦|受阻|卡住|需要關注|待審核|\bpriorit(?:y|ies|i[sz]e)\b|\burgent\b|\battention\b|what[^?]*(?:first|focus)/i;
const follow=/^(?:為什麼|為何|那|這|第一|先|why\b|what about\b|who\b|which first\b)/i;
export function needsPriorityReview(messages){
 const users=(Array.isArray(messages)?messages:[]).filter(x=>x?.role==='user'&&typeof x.content==='string');
 const latest=users.at(-1)?.content||'';
 return priority.test(latest)||(latest.length<=240&&follow.test(latest)&&users.slice(-4,-1).some(x=>priority.test(x.content)));
}
export function citedSourceIds(answer,available){
 const allowed=new Set(available),out=[];
 for(const match of String(answer).matchAll(/\[([A-Z][A-Z0-9-]{2,85})\]/g))if(allowed.has(match[1])&&!out.includes(match[1]))out.push(match[1]);
 return out;
}
export function verifiedAnswer(answer,sourceIds){
 const allowed=new Set(sourceIds);
 return String(answer).replace(/\[([A-Z][A-Z0-9-]{2,85})\]/g,(full,id)=>allowed.has(id)?full:'').slice(0,3800);
}
export function requirePriorityCitations(review,sourceIds){
 if(review?.items?.length&&review.sourceIds?.length&&!sourceIds.length)throw Object.assign(new Error('Priority answer did not cite supplied evidence.'),{copilotCode:'EVIDENCE_MISSING'});
}
