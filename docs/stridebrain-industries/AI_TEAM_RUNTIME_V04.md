# StrideBrain AI Team v0.4 — Model-Driven Specialists

## Scope
Project Coordinator and Quote & Margin Guardian now use the same Vercel AI SDK ToolLoopAgent planning path as Operations Assistant.

## Agent-specific read tools
Project Coordinator:
- list_priorities
- get_project
- get_source
- propose_followup (proposal-only)

Quote & Margin Guardian:
- review_quotations
- get_quote
- get_project
- get_source
- propose_followup (proposal-only)

## Safety boundary
- The model receives no execution tool.
- Each plan is limited to three proposals.
- Every proposal requires a valid project and evidence source.
- Quote Guardian proposals must target Q-* records.
- Browser runtime converts accepted proposals only to create_internal_task.
- Human approval remains required.
- External sending, record edits, quote approval, and payments remain blocked.

## UX
Both specialists reuse the decision-first AI Team experience. Quote Guardian proposals are rendered as internal review notes rather than outbound message drafts.

## Verification
Automated acceptance includes mock ToolLoopAgent runs for all three agents, invalid quote-record rejection, browser UI runs for all three model-driven agents, the full regression suite, production build, and browser journey. Automated tests use simulated/mock models and do not spend provider credits.
