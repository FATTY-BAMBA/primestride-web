# StrideBrain Copilot — Internal GPT Demo QA Checklist

## Source-level / mock tool tests run (not a live provider call)
- [x] Both sector seeds load as distinct synthetic data scopes.
- [x] Read-only tools give reproducible project, quotation, priority and supplier records.
- [x] Weighted draft-margin and quote activity derive from stored seed values (no real-time claims).
- [x] Strict tool JSON schemas have required fields and no extra parameters.
- [x] Mock model asks to call get_project; tool result is returned; model answer is accepted only after bounded tool round.
- [x] Fabricated citation IDs in model text are stripped; returned clickable source IDs are validated against the selected industry.
- [x] Model requests use store=false; ordinary API data-retention terms still apply.
- [x] Two sectors remain distinct and hard-coded demo tools do not read browser-uploaded documents.
- [x] Staff Copilot has a disabled-by-default model mode and explicitly labeled deterministic fallback.
- [x] Vercel Next.js build succeeded after resolving the strict TypeScript route variant.

## Manual tests outstanding
- [ ] Staff operator token and OpenAI API key configured only in protected preview environment.
- [ ] Live OpenAI function-calling response from the preview endpoint.
- [ ] Follow-up memory: ask "Which project?" and "And what about its margin?"
- [ ] Verified citations and correct navigation for a Traditional Chinese query.
- [ ] Live refusal on unsupported facts and attempted quote/approval modifications.
- [ ] No upload bytes, confidential client text or API credentials in browser network/logs.
- [ ] CORS and authorization failure paths, input size limits, cost monitoring and throttling.
- [ ] Mobile, keyboard, accessible role and screen-reader QA.
- [ ] Adversarial prompt injection and incorrect source instructions.
- [ ] Server-side org membership permissions and secure API rate limits (NOT implemented).

## Security limitation
The operator token is a temporary *internal synthetic preview* gate, not production authentication. No actual customer data may be connected to this endpoint before the per-organization security architecture is operational.
