# Priority investigation and answer quality

Baseline: ed264f3c2a10451c1fd8aa489ec38c4d05c498c1.
Branch: feature/stridebrain-interiors-flagship-demo. Pilot origin unchanged: demo.primestrideai.com.

## Changes

- The previous list_priorities concatenated pending approvals before blocked tasks, then returned the first eight. The replacement scans all structured project, approval, work-order and document metadata records before selecting a project-diverse review shortlist.
- Selection uses recorded dates relative to the seed snapshot: overdue first, due within seven days next, then other unresolved work. Within those groups, earlier due dates, blocked status and reconciliation needs guide selection. IDs only stabilize display ties; equal evidence priority is returned explicitly. This is not a proven business-impact ranking and does not infer customer value or a critical path.
- Pending approvals are compared with referenced document statuses and related completed tasks before recommendations. Different lifecycle statuses are not automatically contradictions. Shared project/title/document does not prove a dependency. Only explicit same-project approval references are reported as recorded links.
- Priority questions and short related follow-ups receive a server-executed read-only review before either provider generates an answer. Ordinary requests retain their existing tool flow. The AI still generates the answer; the server does not insert a canned response.
- The shared response policy asks for three compact actions with reason, contact, next verification and inline evidence; short follow-ups use 2-4 sentences. Unrequested financial dashboards and repeated disclosures are discouraged. Length targets are prompting guidance, not a guarantee of model behavior.
- Source panels now contain only valid sources actually cited in the current response, in citation order. Unused retrieved and prior-turn-only sources are excluded. Uncited priority answers fail explicitly instead of being labelled evidence-grounded.

## Verification

Baseline: 131 regression tests passed. A new baseline reproduction failed because the old priority result had no complete work-order coverage.
Repaired suite: 159 tests passed, including 28 priority/evidence tests covering full coverage, order invariance, deadlines, ties, reconciliation, missing records, explicit versus inferred dependencies, both provider request payloads and simulated streaming.
Next.js build passed. Provider responses in automated tests are simulated; live natural-language output quality still requires checking on the deployed pilot.
No invitation, session, environment variable, model catalog, spending, quota or concurrency settings changed. No business data or source documents were edited. Existing session browser checks remain in CI.

## Deployed acceptance

On the same demo address, start a new conversation and ask for three priorities and then why the first one was selected. Check that the answer cites the actual deadline/blocker/status basis, acknowledges ties or missing impact data, does not infer an approval dependency, uses a compact response, and lists only sources it cited. Existing chat history is not rewritten.
