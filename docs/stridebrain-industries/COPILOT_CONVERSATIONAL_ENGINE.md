# StrideBrain Copilot — GPT Conversational Operating Layer (v0.5 draft)

## Reference-video interaction pattern
The referenced Zack Kirk demonstration presented a familiar conversational interface connected conceptually to business data, quote counts, margins, supplier information and follow-up priorities. Staff could ask natural questions and saw concise tables, action suggestions and follow-up scripts. A WhatsApp/Jarvis-style entry was also shown. The creator explicitly acknowledged that the financial demonstration results were invented. This is not evidence the creator deployed genuine permission-aware integrations.

**Product goal:** Keep that low-friction conversational UX, but ensure StrideBrain's business claims come from source-linked tools and deterministic business rules—not model improvisation.

## Implemented (isolated draft branch, internal synthetic demo only)
1. Source-backed server tool registry under src/lib/stridebrain-demo/copilot-tools.js.
2. Read-only functions: operations_snapshot, search_projects, get_project, get_quote, list_priorities, search_company_knowledge, get_suppliers, find_historical_jobs, industry_guidance.
3. Company data is bundled fictional JSON, distinct from the curated Taiwan public-reference corpus; no user uploads or company tenants are queried.
4. A bounded OpenAI Responses API tool loop under copilot-runner.js. Strict schemas, no arbitrary function execution, a maximum of three tool rounds, tool outputs returned for the model's final answer.
5. Server-only OpenAI API key, model configured through STRIDEBRAIN_DEMO_OPENAI_MODEL; store=false requested. This **does not imply zero data retention** by itself.
6. A disabled-by-default server route /api/stridebrain-demo/copilot, with server-side enable flag and independent operator access token. The API rejects cross-origin requests, oversized messages, invalid industries and missing authorization.
7. Optional **staff preview** in the Copilot screen. Operator enters a separate internal-demo access token (NEVER an OpenAI API key), held only in page memory. A model response is rendered as escaped text with verified demo source IDs, not trusted HTML.
8. The browser sends only the bounded chat transcript and selected fictional industry to the server. It does not send PDF/Excel files, imported cost records, or local company documents.
9. Clear deterministic fallback with warning if the protected model endpoint is disabled or unavailable; no fake “GPT connected” badge.
10. A few reference-video-style questions also work in offline deterministic mode: dated sent quote count, weighted proposed quote margin and prioritized owner follow-ups.
11. GPT model response can suggest navigation across modules but cannot create/approve/send work via the server. All tool implementations are read-only.
12. Traditional Chinese SME vocabulary has a small hand-authored synonym dictionary for better source retrieval; production search needs semantic indexing and tested bilingual retrieval.

## Demo configuration (preview environment ONLY)
Set these environment variables in an authorized preview deployment's server-side environment, NOT in NEXT_PUBLIC variables:

- STRIDEBRAIN_DEMO_GPT_ENABLED=true
- STRIDEBRAIN_DEMO_OPERATOR_SECRET=<unique secret with at least 20 characters; preferably 32+ cryptographically random bytes>
- OPENAI_API_KEY=<securely stored provider API key>
- STRIDEBRAIN_DEMO_OPENAI_MODEL=gpt-5.6 (optional, must be available in the selected API project)

Until configured, the route returns a deliberate disabled response and the deterministic sample remains available. Nothing is turned on automatically by merging code or deploying a preview.

The staff operator token is only a temporary gate on synthetic demo functionality. It is **not a customer authentication system**, user-role authorization, billable public SaaS route or rate-limiting strategy. Deploy behind additional team protection, rotate credentials, monitor spend and rate limits, and never provide the operator token to random demo visitors.

## Key conversational demo questions
- "How many quotes were marked sent in our fictional snapshot?"
- "What's the weighted target gross margin across our current draft quotes?"
- "What needs my attention first today?"
- "Who should I follow up with first, and what should I ask them?"
- "Find the Songshan residence documents and explain what's still unapproved."
- "How much is its latest proposed quotation? What are the cost sources?"
- "What about the supplier delivery risk?"
- "Which similar completed jobs could help price the next project?"
- "What rules should we check before releasing the renovation change?"
- "For the print studio, what needs checking before the 500 A3 posters go to press?"
- "Can you draft a Chinese response for a customer?" (draft recommendation only; no send)

Follow-up questions should work from recent conversation history in GPT staff mode. In sample mode, supported patterns have deterministic answers; it is not a general conversational language model.

## Critical correctness distinctions
- Quotes marked "Sent" on the fictional snapshot date are **not** real customer emails and are not current live activity.
- Gross margin computed from *latest proposed quotes* is not realized project profitability.
- Historical costs in the seeded demos are completely fictional; a quote-only old record is not proof of actual direct costs.
- Public Taiwan authority/publisher references provide cited domain guidance but cannot decide a real company's compliance, contract, stock or permit status.
- The model has NO direct authority to approve a quote, issue work instructions, send LINE/WhatsApp/email, or alter a project.
- All citations from tools are validated against the selected synthetic corpus before they become clickable.
- Customer data must never be pooled across organizations; the production platform must use authenticated, role-scoped tools at query time.

## Production conversion (not completed)
Replace shared operator token with verified identity and organization membership; move to private tenant-scoped SQL/object storage; apply approval policy and dedicated action tools, event audit and rate limits. Add source-aware RAG with permission filtering, PDF/XLSX ingestion pipeline, conversation persistence policy, evaluation datasets, per-tenant billing/cost controls, and authorized LINE/other channel integration.

Privacy review must cover external AI processing, storage/retention, consent and Taiwan personal-data requirements. store=false in an API call is not an enterprise data-governance substitute.

## Current testing and limitations
Tool registry and mock GPT tool-response loop validated in source-level V8 tests; Vercel latest JS-route preview builds. **Live model inference has NOT been tested** because no server configuration/key has been supplied. No formal model accuracy evaluations or cross-tenant security test has been performed.

Relevant OpenAI references:
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/conversation-state
- https://developers.openai.com/api/docs/guides/safety-best-practices
- https://platform.openai.com/docs/api-reference/authentication
