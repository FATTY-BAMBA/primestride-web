# Evidence-led pilot consistency release

Baseline investigated: `53d7e97e29ca8f07069326d742301158cc875240`.
Integrated on top of concurrent terminology updates at `8bd6463d31af6c02c667314381f1745635957c48`; their operation-view changes are preserved.
Branch: `feature/stridebrain-interiors-flagship-demo`.
Pilot origin remains `https://demo.primestrideai.com`.

## Reliability repairs

A source question after a project clarification now retrieves the last evidence-bearing answer, rather than only inspecting the clarification itself. Reading previously supplied work-order evidence does not require choosing a new quotation project. A new, unselected quotation remains blocked; earlier quoted amounts can be explained only after their actual source has been read. The resolver is shared by the browser and server, and an explicit selected project is validated against the current industry records.

All valid inline citations are retained through selection, API output, rendering, and tab-session restoration. The source panel displays four items initially and expands the remainder without dropping references. Counts describe distinct cited documents and register records, not verified claims, retrieval volume, or time saved.

## One snapshot and one context

The overview and assistant now import the same priority-review implementation. The overview deliberately ranks original snapshot records, not browser-local approval/task simulations. A notice distinguishes local simulation changes when they exist. Identical snapshot/scope inputs produce identical suggested items; model-generated wording is not guaranteed identical.

The conversation side panel follows validated project context and the current answer's sources. It shows choices while selection is unresolved and no arbitrary project when chat is empty. Opening a citation shows that exact source. New conversations clear old focus. Contact and message-draft actions remain read-only questions; they neither approve work nor send messages.

## Evidence-led product experience

- The overview introduces the product as business questions, inspectable evidence, and next steps.
- Four optional role perspectives offer relevant prompts without changing permissions or requiring onboarding.
- A four-stage path links attention, projects, evidence, and responsible people.
- A commercial section compares actual recorded quotation revisions, costs, and calculated margins. It does not invent commercial alerts, claim realized losses, or infer a price-change cause. Comparable scope still needs review.
- Six primary navigation entries keep the remaining modules in expandable groups.
- Project cards expose blockers, pending decisions, and current quote status.
- Display-only translations use canonical Chinese project names, remove duplicate bilingual names, and improve task labels. Source originals and record IDs are unchanged. Model instructions request absolute snapshot dates, concise recommendations, and natural Traditional Chinese; wording remains subject to live-model review.

## Verification

Two new tests failed against the baseline: source inspection during unresolved clarification, and retention of more than twelve citations. The repaired full suite passes 218 tests (192 baseline, 2 preserved concurrent terminology tests, and 24 new consistency checks). The browser suite passes 27 checks, including optional role routing, shared priority IDs, twenty citations through refresh, selected-project handoff, and a mobile overview without horizontal overflow. Browser and provider-adapter tests use simulated provider responses, not a paid model call.

Build, browser-module syntax, diff whitespace, and exact committed-tree checks are release requirements. Existing invitation/session, model allowlist, read-only, quota, spending, and sign-out tests remain enabled.

## Limits and unchanged controls

No credentials, invitations, model catalog, quota or monetary limits, original company records, or production branch are changed. Local workflow simulations and uploaded files are still not synchronized into the server AI dataset. Evidence checks remain bounded safeguards, not full semantic verification. This release is not a claim of production readiness or measured productivity.

Deployed acceptance: on the existing origin, ask for priorities, ask about an ambiguous project, then ask about the earlier sources without selecting a project. The assistant should explain the available evidence or ask a useful clarification, not fail merely because a choice is pending. Then select a project and confirm the side panel and quote evidence follow it. Verify a fresh live provider answer before expanding the pilot.
