# StrideBrain client demo runbook — 5 minutes

**Purpose:** make a prospect understand the product in the first minute and feel the operating-model shift within five minutes.

**Demo thesis:**  
**Company knowledge → proactive AI teammate → human-controlled real action.**

This is the canonical client walkthrough for the current live StrideBrain build. Do not tour the sidebar or try to prove every feature.

## Preflight before the meeting

Use the canonical live build on `demo.primestrideai.com`.

1. Open the Interior Design / Horizon Atelier workspace in Traditional Chinese unless the client prefers English.
2. Confirm the invited/staff AI session is active and one approved model is available.
3. Start a fresh Copilot conversation.
4. Reset the industry demo if a previous rehearsal left completed AI Team work in browser state.
5. Open AI Team once and confirm Google Workspace is connected. If LINE will be used, confirm the intended contact has a verified LINE identity.
6. Confirm the single email address you will use for the controlled send is authorized.
7. Do not change models, connectors, credentials, or environment configuration during the meeting.

## The five-minute story

### 0:00–0:20 — Frame the problem

Start in **StrideBrain Copilot**.

Suggested spoken framing:

> Most business systems are good at storing information. The harder problem is knowing what matters now, who needs to act, and safely moving the work forward. StrideBrain is the operating layer between those three things.

Do not explain models, OpenRouter, Supabase, OAuth, webhooks, or architecture.

### 0:20–1:30 — WOW 1: “It understands the business”

Click the first Copilot shortcut:

**本週風險 / This week’s risks**

The prompt asks StrideBrain to find:
- recorded blockers;
- near-term due work or handoffs;
- pending approvals;
- source evidence for each.

Let the answer finish. Point to the project/record IDs and source citations.

Open **one** source.

Suggested transition:

> This is not a generic chatbot answer. It is reasoning over the company records and showing us what it used.

Do not spend time reading every result.

### 1:30–1:50 — Make the conceptual jump

Say:

> But if I need to know the right question to ask every morning, I am still doing the coordination work myself.

Open **AI Team → Project Coordinator**.

This is the transition from **assistant** to **operating teammate**.

### 1:50–3:10 — WOW 2: “It does not wait for me to ask”

Project Coordinator should show:

**See what could slip this week**

Start the review.

The finished Coordinator is designed to surface three different evidence-backed coordination signals when the records contain them:

1. **Recorded blocker**
2. **Near-term handoff / deadline**
3. **Approval / status check**

The record, title, recorded owner, due date, blocker and signal type come from deterministic workspace logic. The AI model may explain the issue and prepare wording, but it cannot replace those recorded facts.

After the review, the first decision is selected automatically and its prepared draft is already open.

Point to:

**Risk signal → Recorded owner → Next handoff → Evidence → Prepared draft**

Suggested framing:

> This is the difference between another chat window and an AI operating teammate. It has already reviewed the workspace, found the coordination risks, and prepared the next move.

Open one evidence source if needed, but do not inspect all three cards.

### 3:10–4:25 — WOW 3: “It can actually move work forward — safely”

Use the selected coordination item.

Preferred deterministic path:

**Prepare email → review → approve & send**

Enter the pre-approved demonstration recipient.

Before clicking send, say:

> Investigation and preparation can happen automatically. Anything external stops here and comes back to the employee for final approval.

Click **Approve & send**.

Show the provider-accepted receipt on the same work item.

If the selected contact has a verified LINE identity and LINE has already been preflighted, LINE can be used instead:

**Prepare LINE → review → approve & send → phone receives message → receipt**

Do not change LINE identity mapping during the client meeting unless identity linking itself is the subject of the demo.

### 4:25–4:45 — Prove the control model

Keep the receipt visible.

Point out:
- the AI did not send autonomously;
- the employee saw the exact outbound content;
- the action went through the connected business channel;
- the accepted action has a receipt/audit trail.

Suggested line:

> The point is not autonomous AI doing whatever it wants. The point is AI doing the investigation and preparation so your people only spend time where judgment or authority is actually required.

### 4:45–5:00 — Close with Now / Next / Direction

Do not open more product modules.

Say:

**NOW**  
Company knowledge + evidence-linked Copilot + proactive AI Team + human-controlled Gmail/LINE actions.

**NEXT**  
Connect each client’s real company records, users, permissions, rules and systems behind the same workflows.

**DIRECTION**  
One AI operating layer across the information, decisions and communication tools the company already uses.

Final line:

> We would not start by replacing your systems. We start with one painful operating loop, connect the information and people already involved, prove the outcome, and expand from there.

## What not to show in the five-minute version

Do not demo unless the prospect specifically asks:
- every sidebar module;
- Document Intelligence;
- Historical Estimator;
- Operational Checks;
- Quote & Margin Guardian;
- model-provider setup;
- Google OAuth setup;
- LINE webhook or identity internals;
- Supabase / Redis / Vercel;
- technical audit traces;
- configuration screens.

These remain useful depth for follow-up questions, not the primary story.

## Reliability / fallback rules

The demo must never fake success.

- **Live model planning unavailable:** Project Coordinator can complete its safe evidence-grounded coordination review from the same workspace records. Continue the workflow; do not give the client provider-debugging details.
- **Gmail send unavailable:** do not claim a send. Use the already-reviewed draft and switch to a preflighted LINE path only if that path is genuinely ready.
- **LINE unavailable or contact not verified:** use Gmail. Do not link a random contact to make the button appear.
- **External action unavailable:** finish with the human approval boundary and optionally create the internal follow-up task. State clearly that no external message was sent.
- **Copilot provider delay:** move to Project Coordinator rather than troubleshooting the provider in front of the client.

## Rehearsal acceptance

Before a client meeting, run the exact path end-to-end and confirm:

- first Copilot shortcut is **本週風險 / This week’s risks**;
- answer contains inspectable source evidence;
- Project Coordinator produces the three coordination signal types when supported by the fixture;
- selected Coordinator draft opens automatically;
- evidence links open correctly;
- Google Workspace status is connected;
- chosen controlled send path works;
- the real recipient/device receives the message;
- accepted receipt is visible;
- reset produces a clean repeatable starting state;
- no technical/provider error copy appears in the normal path.

## Core rule

The demo is not a separate fake application. It is the same StrideBrain product behavior running against synthetic tenant fixtures and controlled pilot integrations. The client story should therefore demonstrate the operating model we intend to carry into real tenant deployments, not disposable presentation tricks.
