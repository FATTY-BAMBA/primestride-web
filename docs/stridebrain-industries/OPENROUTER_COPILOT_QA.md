# OpenRouter / Multi-Model Copilot — QA Matrix (v0.6)

## Confirmed source-level tests
- [x] Shared allowlist of 5 model choices; 4 OpenRouter provider models and one optional direct OpenAI choice.
- [x] Unsupported model IDs and admin-disallowed model IDs are rejected.
- [x] Both Taiwan SME templates show the model menu with all five choices and the correct selected item.
- [x] Composer retains unsent text after model-menu rendering.
- [x] Both templates render exactly five business shortcuts and three industry-specific suggestions.
- [x] All ten primary shortcut prompts return meaningful deterministic sample answers with resolvable citations (zero marked-sent quotes on a sample date correctly returns zero rather than fabricating activity).
- [x] Mocked OpenRouter tool-call cycle executed for interior and printing, with required initial read-only function call and subsequent answer.
- [x] Unknown business-action tool name rejected; first-turn unsourced model answer refused.
- [x] Fabricated source IDs removed, real returned IDs validated against the selected industry's source corpus.
- [x] Read-only tools cannot mutate quotations, messages or work-order statuses.
- [x] OpenRouter key stays server-side. Provider/model selection sent only as a catalog ID.
- [x] Latest Vercel preview build completed successfully after the new route and model picker changes.

## Outstanding UI/browser validation
- [ ] Desktop and mobile visual review against the referenced chat UI: spacing, type, model-popup positioning and suggestion chips.
- [ ] Keyboard test: Tab into model trigger, open menu, arrow navigation, Enter select, Escape, Enter send, Shift+Enter line break.
- [ ] Switch from sample to authorized staff mode and compare selected model's actual response.
- [ ] Confirm question draft and focused model picker behave correctly on narrow screens.
- [ ] Verify source buttons open the correct evidence on desktop and mobile.
- [ ] Model switching during an existing conversation retains only bounded recent chat context, never private hidden provider reasoning.
- [ ] Provider error and disable branches display deterministic fallback clearly and do not charge provider after returning to sample mode.

## Provider/live system validation NOT YET DONE
- [ ] Provision private OPENROUTER_API_KEY and strong staff demo secret in protected preview only.
- [ ] Live tool-calling execution for each allowlisted OpenRouter model.
- [ ] Confirm function/tool-choice compatibility, reasoning token handling and provider routing.
- [ ] Test long Traditional Chinese prompts, hallucination/citation errors and prompt injection.
- [ ] Server-side rate limits, per-operator usage caps, spend monitoring and audit logs.
- [ ] Data-processing/privacy policies and regional routing assessments.
- [ ] Server-authenticated tenant accounts, org membership checks and role-scoped knowledge retrieval.

**All deployed preview business data remains synthetic. No actual customer records or outbound messages are accessed.**


## Browser UI QA page (not yet run in the user's browser)
Path: /stridebrain-demo/copilot-ui-qa.html. Contains 12 checks across interior and printing: quick chips, 5-model dropdown, selected-model draft preservation, follow-ups answer, no provider calls in sample mode, and new conversation. Requires a user to run the test in an authenticated preview browser. It does not require OpenRouter credentials or make model requests.
