# AI Team v0.4 Strategy — Specialist Model Planning

## User outcome
A business owner can delegate project coordination or quotation/margin review to a specialist AI teammate and receive a small, evidence-backed set of decisions instead of a generic summary.

## Acceptance criteria
- Project Coordinator is model-driven and must start from recorded priority/project context.
- Quote & Margin Guardian is model-driven and must start from recorded quotation review.
- Each specialist may inspect only read-only StrideBrain tools.
- Each specialist can prepare at most three proposals.
- Every proposal must reference a valid project and at least one valid source.
- Quote proposals must identify a recorded Q-* quotation and use calculated/review language, not realized profit/loss claims.
- The model receives no execution tool.
- Browser runtime normalizes every accepted proposal to create_internal_task.
- Human approval remains required.
- External message sending, business record edits, quote approval, and payments remain blocked.
- UI uses the same decision experience already validated for Operations Assistant.

## UX critic checklist
- Specialist card clearly shows v0.4 and current status.
- A run produces the same compact decision-first hierarchy.
- Tool trace names are human-readable and collapsed by default.
- Quote review cards read as internal review work, not customer messages.
- Right-side inspector follows the selected decision.

## Non-goals
- No email/LINE sending.
- No autonomous quote changes.
- No payments.
- No scheduled or durable background execution in this release.
