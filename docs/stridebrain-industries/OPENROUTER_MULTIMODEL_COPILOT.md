# StrideBrain v0.6 — OpenRouter Multi-Model Copilot & Business Prompt Shortcuts
Research / implementation spec · October 19, 2026

## Why this interaction exists
The Zack Kirk "Ironwood/VocalChat" reference used a minimal conversation landing screen, sidebar sections and quick prompt chips ("Today's numbers", "Quotes", "Follow-ups", "Parts & suppliers", "Financials"), plus an in-composer AI model dropdown. The approach is memorable because a business owner simply *asks* what they need. The video's invented financial figures are not evidence of genuine company integrations.

Our StrideBrain interpretation preserves the ease of entry, but ties each answer to source-linked, approval-governed business tools. The interface must remain a platform for multiple SMEs, not an isolated generic chatbot.

## User experience added in this milestone
- Conversation-first, centered Copilot landing design in PrimeStride's own navy/sage style; warm greeting for the fictional owner.
- Multi-line composer; Enter sends a question and Shift+Enter inserts a newline; a plus icon opens the existing Document Intelligence module (does not pretend to attach files to chat).
- Model selector inside the composer, floating upward with model maker, purpose, short description and selected-state checkmark.
- Menu supports keyboard Tab/Arrow navigation and Escape dismissal, and preserves a partially composed question when a model is selected.
- First-row prompt shortcuts:
  1. Today's numbers — dated illustrative operating snapshot, not live metrics
  2. Quotes — sample quote versions marked Sent and review details
  3. Follow-ups — approval-first priority list with owner and source records
  4. Materials & suppliers — explicit verification before customer promises
  5. Financials — weighted proposed margin, never recognized revenue or realized profit
- Second row contains three industry-specific realistic suggestions: renovation changes, history-based estimates and Taiwan renovation regulations; or artwork checks, new print estimates and production blockers.
- New conversation control clears local in-memory chat. No persistent private conversation storage is claimed.
- Selected model and sample/connected states are labeled separately; selecting a model does **not** claim that any provider connection is active.

## Verified OpenRouter model catalog
The staff-preview allowlist, not an arbitrary free-text model ID:

| Model selector | OpenRouter model ID | Provider |
|---|---|---|
| Claude Sonnet 5.5 | anthropic/claude-sonnet-5.5 | OpenRouter |
| GPT-6 Sol | openai/gpt-6-sol | OpenRouter |
| Gemini 3.1 Pro | google/gemini-3.1-pro-preview-customtools | OpenRouter |
| DeepSeek V4.1 Flash | deepseek/deepseek-v4.1-flash | OpenRouter |
| GPT-5.6 · Direct | openai-direct/gpt-5.6 | OpenAI API direct, optional |

The default preview model is Claude Sonnet 5.5. All four OpenRouter models had documented support for tools / tool_choice at implementation time (October 19, 2026). Availability, pricing, privacy, provider routing and feature support may change. The direct GPT model requires a separate configured OpenAI project and API access.

Original references:
- https://openrouter.ai/docs/guides/features/tool-calling
- https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request
- https://openrouter.ai/anthropic/claude-sonnet-5.5
- https://openrouter.ai/openai/gpt-6-sol
- https://openrouter.ai/google/gemini-3.1-pro-preview-customtools
- https://openrouter.ai/deepseek/deepseek-v4.1-flash

## Secure preview adapter
- Shared model allowlist defined in public/stridebrain-demo/model-catalog.js and imported by the server.
- OpenRouter transport at src/lib/stridebrain-demo/openrouter-runner.js calls **https://openrouter.ai/api/v1/chat/completions** from the Next.js server, never directly from browser code.
- Each OpenRouter request supplies read-only user-defined tools, a bounded conversation, server instructions and capped output tokens.
- The model requests a function call; the server validates it against the approved tool names and executes the read-only synthetic company-data tool; results return to the model for a sourced answer.
- Maximum three tool rounds, maximum three calls per round, total cap eight. No arbitrary JavaScript execution or customer-facing action functions.
- Model and route validation: unknown model rejected, optional admin allowlist enforced, origin restriction, staff operator authorization, request length constraints, server-only provider API keys.
- Any model-suggested source citation must be validated against the selected industry's original source corpus. Fabricated inline citation IDs are dropped.
- Tool answers and source IDs come from **fictional bundled demo companies** and cited public Taiwan industry references only. No browser-uploaded client documents or real tenant records are forwarded.
- If GPT/OpenRouter is disabled, unauthorized, unavailable, or fails its evidence requirements, the UI explicitly falls back to deterministic sample results.

## Configuration: PREVIEW ONLY, server-side environment variables
- STRIDEBRAIN_DEMO_GPT_ENABLED=true
- STRIDEBRAIN_DEMO_OPERATOR_SECRET=<private high-entropy staff token, 20+ characters>
- OPENROUTER_API_KEY=<secret OpenRouter provider key for allowed OpenRouter models>
- Optional OPENAI_API_KEY=<secret OpenAI key to enable direct GPT-5.6 model>
- Optional STRIDEBRAIN_DEMO_ALLOWED_MODELS=anthropic/claude-sonnet-5.5,deepseek/deepseek-v4.1-flash
- Optional STRIDEBRAIN_DEMO_OPENAI_MODEL=gpt-5.6

If no provider key is set and the feature remains disabled, the selector stays visible for product demonstration but does not make billable calls. The staff token in the browser is an *internal synthetic-preview gate* only, never a production company login. Do not put provider API keys in NEXT_PUBLIC_ variables or share them in chat.

## Customer accounts — future model policy
Individual customer organizations should have administrator-approved model options based on data processing terms, location, privacy, cost and tool compatibility. Each model should be associated with an entitlement, per-organization/token budget, usage history and limits. A model choice must not expand the user's document, quoting, contact or approval permissions. Tool security is independent of the model provider.

Future tasks: privacy/data-processing and ZDR review for each OpenRouter routing provider, per-org quotas, billing and monitoring, tenant-scoped RAG retrieval, signed company account sessions, credentials rotation, optional automatic model routing after quality evaluation, and localized Traditional Chinese settings.

## Current limitations
This is **not a publicly usable multi-model business agent**. Live OpenRouter/OpenAI requests were NOT executed in development because no private provider credentials or staff gate have been configured. Tests use mocked provider responses and synthetic company tools; visual browser/keyboard review remains to be completed. The model chooser and five business prompt chips are implemented in the static preview. No real company information or business action is connected.


## Direct chat preview and browser UI tests
Append &view=copilot to /stridebrain-demo/index.html?industry=interior (or printing) to open the conversation-first screen directly without changing the default Overview.
The browser QA page is /stridebrain-demo/copilot-ui-qa.html. It loads each sample industry in a same-origin iframe, verifies five quick actions and three contextual suggestions, checks model options and text preservation, runs a Follow-ups response, checks New conversation and ensures sample mode does not call a paid provider. A real authenticated-browser QA pass is still required.
