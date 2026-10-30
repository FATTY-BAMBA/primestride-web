# StrideBrain Development Agent Protocol

This protocol separates product development into distinct review roles so implementation, design critique, verification and release approval are not collapsed into one pass.

## 1. Product Strategist

Purpose:
- Define the user outcome, not just the feature.
- Set acceptance criteria before implementation.
- Protect the product thesis: evidence-backed AI coworkers that prepare and complete bounded work.

Required output:
- User problem.
- Intended interaction.
- Success criteria.
- Explicit non-goals and safety boundaries.

## 2. Builder

Purpose:
- Implement the smallest coherent version of the agreed experience.
- Reuse shared runtime and UI primitives before adding one-off logic.
- Preserve evidence, permission and approval contracts.

Builder may not self-approve a release.

Required output:
- Code changes.
- Focused regression coverage.
- Build result.
- Known limitations.

## 3. UX Critic

Purpose:
- Review the experience as a business user, not as the developer who built it.
- Check information hierarchy, copy, spacing, affordances, state transitions, responsiveness and cognitive load.
- Prefer outcomes and decisions over technical internals.

Review questions:
- Can a first-time user tell what happened in five seconds?
- Is the primary next action obvious?
- Are technical details hidden until needed?
- Does the selected state visibly match the context panel?
- Does the interface explain what the AI did, what it did not do, and what needs approval?
- Are Taiwan Traditional Chinese labels natural and consistent?

Required output:
- Keep / change / remove list.
- Screenshot-specific observations.
- Prioritized polish recommendations.

## 4. QA / Safety Verifier

Purpose:
- Challenge the implementation independently.
- Test happy path, stale state, invalid inputs, permission boundaries, evidence/source integrity, mobile behavior and regressions.
- Confirm blocked actions remain blocked even when UI events are simulated.

Required output:
- Unit/regression results.
- Browser journey results.
- Safety/permission checks.
- Reproduction details for failures.

## 5. Release Gate

Purpose:
- Release only the exact tested tree.
- Verify no concurrent branch movement.
- Confirm CI, deployment state and stable alias before calling a release ready.

Required checks:
- git diff --check
- production build
- full regression suite
- browser journey
- exact Git tree/blob verification when publishing through connectors
- GitHub static/unit gate
- GitHub browser gate
- Vercel READY
- stable demo alias points to the release commit

## Working rule

A feature is not "done" when the Builder finishes. It is done only after:
Strategist acceptance criteria -> Builder implementation -> UX Critic review -> QA/Verifier pass -> Release Gate.

For fast iterations, the roles can be executed sequentially in one working session, but their judgments must stay separate. Future automation may run these as separate model/agent processes, but this document is the source of truth for their responsibilities.
