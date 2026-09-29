# Payo AI V0 Product Requirements Document

**Status:** Build brief for GLM online  
**Product:** Payo AI  
**Version:** V0 prototype  
**Audience:** GLM implementation agent, product/design reviewers  
**Date:** 29 September 2026

## 1. Product decision

Payo AI is a workflow workspace for finance teams. It lets an analyst, operations manager, or risk team start with a finance template, connect a few clearly named steps, inspect what each step will do, and run the workflow with visible results and human review points.

The product should feel as easy and quiet as Microsoft Copilot Studio, while being built around the work finance teams actually repeat: reconciliation, position risk review, daily market monitoring, document extraction, and report preparation. Its mental model is **“n8n for finance, without the intimidating engineer interface.”**

This V0 is a high-fidelity product prototype, not a claim of a production financial platform. It uses clearly labelled sample data and simulated connections. It must not claim regulatory certification, live market data, actual execution, zero data retention, immutable audit records, or working third-party integrations unless those are genuinely implemented and verified later.

## 2. Problem

Finance work is often repeated, time-sensitive, and review-heavy. Current automation products usually create one of two bad experiences:

- General-purpose workflow builders are flexible but technical, connector-led, and visually noisy.
- AI-agent products hide the execution path behind chat or a black box.
- Enterprise agent platforms can be powerful but overwhelm a small finance team before they reach a useful first workflow.

Payo should make a team feel that a repeatable finance process can be made visible, checked, and improved without needing to be an engineer.

## 3. V0 goal and success condition

**Goal:** Let a first-time user open Payo, choose a credible finance template, understand the workflow in seconds, make one simple change, and run a convincing simulated example.

The primary demonstration journey is:

1. Open the landing page and understand Payo in one sentence.
2. Enter a workspace and select a template.
3. Edit a workflow through a focused visual builder.
4. Run it using sample data.
5. See each step complete, pause at a review gate where relevant, and inspect the final output.

The V0 succeeds if a user can complete that journey without an onboarding call, a prompt-engineering interface, or a wall of settings.

## 4. Target users

| User | Primary need | V0 behaviour |
| --- | --- | --- |
| Operations analyst | Reduce repeated checks and preparation work | Starts from a reconciliation or reporting template and reviews exceptions. |
| Portfolio/risk analyst | Understand daily exposures and movements quickly | Uses a position risk or market-movement template and reviews flagged items. |
| Finance manager | Make a recurring process reliable and visible | Inspects the flow, approval points, history, and output before sharing it. |
| Compliance/reviewer | Know what happened before an outcome is released | Sees the run timeline, sources, exceptions, and explicit approval state. |

Do not design V0 primarily for developers, prompt engineers, or system administrators.

## 5. Positioning and product principles

### Positioning

**Payo AI gives finance teams a clear way to build, run, and review repeatable financial workflows.**

### Principles

1. **Workflow first, AI second.** The core experience is a visible process with named inputs, checks, calculations, approvals, and outputs. AI should appear only as one type of step, never as the whole product identity.
2. **Templates create first value.** Do not start with a blank canvas or an empty chatbot. Start with useful finance workflows and plain-language explanations.
3. **Show the work.** A run must show what is happening at every step: queued, running, completed, needs review, or failed.
4. **Finance language, not developer language.** Prefer “Source file”, “Tolerance”, “Review exceptions”, and “Publish report” over “payload”, “node config”, “webhook”, or “API response”.
5. **Progressive disclosure.** Common settings are visible; advanced detail lives behind an explicit “Advanced” control.
6. **Human control is tangible.** A review gate is an actionable product state, not a paragraph about governance.
7. **No invented trust.** In V0, trust comes from clear boundaries, source labels, previewable steps, and sample-data labels—not unverified compliance statements.

## 6. Scope

### In scope for V0

- A public landing page.
- A signed-in-looking demo workspace; real authentication is not required.
- A template library with finance workflow templates.
- A visual workflow builder with a curated, small node library.
- Three complete interactive demo workflows using deterministic, local sample data.
- Simulated run playback, including a review decision for one workflow.
- Run history and a run-detail screen.
- A restrained desktop-first interface that remains usable on tablet widths.

### Explicitly out of scope for V0

- Real brokerage, custodian, market-data, bank, CRM, email, or document-management integrations.
- Live market data, trade execution, regulatory filing, client communication, or real financial calculations used for a decision.
- User accounts, permissions, team management, billing, API keys, secrets, or multi-tenant security.
- File upload, OCR, persistent data storage, real audit immutability, or data-residency guarantees.
- Free-form agent creation, autonomous subagents, an embedded chat assistant, or model/provider settings.
- Mobile-first workflow editing.

## 7. Information architecture

### Public area

- Home
- Product
- Templates
- Security (future-facing only; no unsupported claims)
- Request access

### App area

- Overview
- Workflows
- Templates
- Runs
- Settings (display-only V0 stub or omit if it adds noise)

The app uses a narrow left navigation, a utility header, and one main working area. Avoid a second persistent sidebar unless a contextual inspector is open.

## 8. Landing page requirements

### Purpose

Make Payo feel like a serious financial workflow product before the user enters the demo. It should sell clarity and control, not generic “AI transformation.”

### Required sections

1. **Hero**
   - Eyebrow: `Payo AI`
   - Headline: `Finance workflows, made clear.`
   - Supporting copy: `Build repeatable reconciliations, risk checks and daily market briefings in a visual workspace your team can inspect.`
   - Primary CTA: `Explore the workspace`
   - Secondary CTA: `View templates`
   - A composed product screenshot/mockup showing a real workflow and a visible review state. Do not use a floating chatbot, robot illustration, neon gradient, or fake analytics collage.

2. **What Payo helps teams do**
   - Reconcile NAV data and investigate exceptions.
   - Review position risk against limits.
   - Turn the day’s market moves into a checked briefing.

3. **How it works**
   - Choose a finance template.
   - Adjust the workflow for your process.
   - Run it, review exceptions, and share the output.

4. **Templates preview**
   - Show three to six credible template cards, with a one-sentence outcome and the main data/source types.

5. **Control by design**
   - Use plain claims: `Every workflow has visible steps`, `Review before release`, `Inspect each run`.
   - Do not say “compliant”, “auditable”, “secure”, “zero-retention”, or “guaranteed” in V0 marketing copy.

6. **Final CTA**
   - `Explore the workspace`

## 9. Template library

The template library is the default first screen after entering the workspace. It should feel curated, not like an app marketplace.

### Template cards

Each card contains:

- category label
- workflow name
- one-line description of the outcome
- 3–5 concise step labels
- `Use template` action
- optional `Sample data` label

### V0 templates

| Template | Category | Outcome | Required V0 steps |
| --- | --- | --- | --- |
| NAV reconciliation | Operations | Compare administrator NAV with internal NAV and route material differences for review | Import sample valuations → map funds → calculate variance → flag tolerance breaches → review exceptions → create reconciliation summary |
| Position risk review | Risk | Identify positions that exceed a selected exposure or concentration threshold | Load sample positions → calculate exposure → compare with limits → flag breaches → analyst review → publish risk summary |
| Daily market movements | Research | Produce a concise morning brief from selected market moves and holdings context | Load sample market snapshot → identify notable moves → match holdings → draft briefing → editor review → export briefing |
| KYC document checklist | Operations | Identify missing items in a client onboarding checklist | Select checklist → compare sample documents → flag missing items → reviewer approval → create checklist summary |
| Monthly close pack | Finance | Assemble a close checklist and list outstanding items | Select close period → collect sample tasks → calculate completion → review blockers → create close summary |
| Client report preparation | Reporting | Prepare a reviewable draft package from account data | Select client → gather sample portfolio data → generate draft → compliance review → mark ready to send |

Only the first three templates need fully interactive, end-to-end detail in V0. The remaining cards can communicate the future library but should say `Coming soon` or open a non-executing preview.

## 10. Workflow builder

### Layout

- **Top bar:** workflow name, status (`Draft` / `Ready`), `Run workflow`, overflow menu.
- **Canvas:** spacious left-to-right flow; one clear path in V0. Avoid a dense free-form graph.
- **Step rail:** compact add-step control at the end of the workflow and a small curated step menu.
- **Inspector:** opens only when a step is selected; shows purpose, inputs, and simple settings.
- **Bottom status area:** last run and a concise result summary when available.

The builder should support drag-and-drop reordering and adding steps, but it must be robust if the implementation treats the canvas as an ordered sequence rather than a fully arbitrary graph. The experience matters more than technically supporting every possible branch.

### Step design

Steps are rectangular, calm, and information-dense enough to explain themselves. Use a subtle icon only where it improves scanning. Each step shows:

- step type
- short action label
- source or key setting where useful
- status only when a run is active

Do not use giant rounded cards, coloured halos, emoji icons, or a rainbow category system. A selected step can use a precise border and pale tinted background; status colour is reserved for status.

### V0 step types

| Step type | User-facing label | Example configuration |
| --- | --- | --- |
| Input | `Load data` | Select a sample file or sample data set |
| Transform | `Map fields` | Map administrator fund name to internal fund name |
| Calculation | `Calculate` | Set variance formula and tolerance |
| Check | `Check limit` | Select limit type and threshold |
| AI-assisted draft | `Draft summary` | Choose output format and focus areas; label as generated draft |
| Review gate | `Request review` | Choose reviewer role and required decision |
| Output | `Create report` | Select report title and destination label |

### Editing rules

- The default view shows only the 2–4 inputs required to understand or configure a step.
- Changes are immediately reflected in the canvas subtitle where practical.
- Advanced controls exist but are collapsed and use human labels.
- One obvious undo action is available after changing the workflow.
- “Ask AI to build this” is not part of the V0 builder. If a future natural-language entry point is shown, label it as a future concept rather than a functional primary flow.

## 11. Run experience

### Run panel

Selecting `Run workflow` opens a run panel or takes the user to the run-detail page. The run begins with a clear notice: `Using sample data for this demonstration.`

Steps animate through a restrained state sequence:

- `Queued`
- `Running`
- `Complete`
- `Needs review`
- `Blocked` or `Failed` only where helpful to demonstrate an exception

The active step receives a slim progress indicator. Completed steps receive a check state. Do not use celebratory confetti, chatbot prose, or over-animated loading effects.

### Review gate

The NAV reconciliation template must pause at `Review material variances` and show a concise exception table. The reviewer can choose:

- `Approve summary`
- `Return for review`

Approving continues to `Create reconciliation summary`; returning pauses the run with an understandable status. These actions are simulated and must be labelled accordingly.

### Results

The result screen includes:

- workflow name, run date/time, and overall status
- a vertical step timeline with duration text such as `Completed in 1.2s` only if clearly sample/simulated
- source labels: `Sample administrator NAV`, `Sample internal valuation`, etc.
- exceptions or findings table where relevant
- a final report preview, not a downloadable official document
- `Run again` and `Back to workflow` actions

## 12. Demo data and expected outputs

All displayed data must be fictional but plausible, visually marked `Sample data`.

### NAV reconciliation sample

Use 5–8 funds and a mix of matched, immaterial, and material variances. At least two material exceptions should create a meaningful review moment.

Suggested table columns: Fund, Administrator NAV, Internal NAV, Difference, Difference %, Tolerance, Status, Note.

### Position risk sample

Use 8–12 positions across several sectors or issuers. Flag two positions for concentration or exposure limit review. Suggested output: position, market value, portfolio weight, applicable limit, status, reviewer note.

### Daily market movements sample

Use a compact list of named indices, FX rates, rates, and holdings. Make one or two holdings-related movements notable enough to surface in the briefing. The output is a short structured morning brief with sections for `Market snapshot`, `Portfolio relevance`, and `Items to review`.

## 13. Visual and interaction direction

### Reference qualities to adopt

- Editorial restraint and deliberate whitespace from the supplied visual reference.
- Clear, short headings; practical subheadings; one primary action at a time.
- A product interface that looks operational and dependable rather than playful or futuristic.
- Copilot Studio’s sense of simplicity: no settings wall before first value.

### Visual system

- **Theme:** light, quiet, professional.
- **Base:** warm off-white or cool near-white background; near-black/navy text; soft grey dividers.
- **Accent:** one subdued finance-appropriate blue or deep teal, used sparingly for primary actions and selected state.
- **Status:** restrained green for completed, amber for needs review, red only for a genuine flagged exception, neutral grey for inactive.
- **Typography:** modern sans-serif with strong numeric legibility; use tabular figures in financial tables where available.
- **Borders:** thin and purposeful. Prefer flat sections and structural rules over card-heavy containers.
- **Corners:** small radius only where a contained control needs it. Avoid pervasive rounded rectangles.
- **Icons:** simple line icons; never emoji.
- **Motion:** subtle progress and state transitions under 250ms. Respect reduced-motion settings.

### Prohibited visual patterns

- Purple/blue “AI glow” gradients, rainbow effects, floating orbs, robot illustrations, sparkles, and emojis.
- A default chat composer as the main interface.
- Excessive pills, badges, rounded cards, or dashboard widgets.
- Dense engineering-canvas affordances such as ports everywhere, raw JSON, code snippets, or connector configuration walls.
- Unsupported client, bank, regulator, data-provider, or certification logos.

## 14. Content rules

- Refer to generated text as a `draft` or `AI-assisted draft`, never as an authoritative recommendation.
- Refer to integration-like elements as `Sample source`, `Demo connection`, or `Planned connection` in V0.
- Never imply that outputs are investment advice, trade instructions, official reports, or regulatory decisions.
- Use UK English spelling: `organisation`, `analyse`, `customise`, `summarise`.
- Keep copy concise and finance-literate. Avoid “revolutionise”, “magic”, “supercharge”, “agentic”, and generic AI claims.

## 15. Functional acceptance criteria

### Landing and navigation

- A user can move from the landing-page CTA to the template library in one click.
- The landing page states what Payo does without relying on the phrase “AI agents”.
- The app navigation makes Workflows, Templates, and Runs discoverable at all times on desktop.

### Templates and builder

- A user can start the three complete workflows from their template cards.
- Each complete workflow opens with a comprehensible ordered sequence of 5–6 steps.
- Selecting a step opens an inspector with clear, editable sample settings.
- A user can change a tolerance, threshold, title, or output setting and see the change reflected before running.
- A user can reorder at least one eligible step through drag-and-drop or a clear alternate control.

### Runs and review

- A run visibly progresses step by step rather than jumping directly to a result.
- The NAV reconciliation run pauses at a review decision.
- Approval and return actions create visibly different simulated outcomes.
- The completed result shows traceable sample sources, findings, and final output preview.
- A runs list displays at least three sample historical runs with draft/review/completed status.

### Quality

- No primary task requires technical vocabulary or a chat prompt.
- The interface has no broken states at desktop width 1440px and tablet width 1024px.
- Tables remain readable without horizontal clipping at 1024px.
- Buttons, tabs, and selected states are keyboard-focusable with visible focus treatment.
- Every V0 simulation or sample dataset is visibly labelled.

## 16. Build instructions for GLM online

Build a polished interactive front-end prototype, not a static landing-page mockup.

- Use the existing repository only as a workspace; do not assume its current UI or code is the product direction.
- Prioritise believable interactions and local mock state over backend integrations.
- Keep all demo data in local static fixtures and do not call external data APIs.
- Use a desktop-first responsive layout.
- Include a compact README or in-app `About this demo` note stating that the workflows, data, connections, and approvals are simulated.
- Do not add authentication, payments, external OAuth, file upload, or real execution.
- Do not make an external website look like a live connected service.
- Do not use placeholder lorem ipsum; use the supplied product copy and finance-specific sample labels.

## 17. Suggested screen set

1. Landing page
2. Template library
3. Workflow builder: NAV reconciliation
4. Workflow builder: position risk review
5. Workflow builder: daily market movements
6. NAV reconciliation run in progress / needs-review state
7. NAV reconciliation completed result
8. Runs list

This is a product-quality V0, not eight separately designed marketing pages. Reuse the same shell, interaction patterns, and visual system.

## 18. V1 directions to defer

Only after V0 is validated should the team decide whether to add:

- authenticated workspaces and roles
- real connector architecture and credential management
- document intake and structured extraction
- calculation service with validation and test records
- workflow versioning, real approval routing, and auditable event records
- tenant data-handling controls and legal/compliance review
- additional finance templates and regulated-market integrations
- a natural-language workflow drafting assistant, placed behind templates rather than replacing them

## 19. Open product questions for the next decision

These are deliberately not assumed in V0:

1. Which finance segment is the first paid customer: asset managers, family offices, fund administrators, corporate finance teams, or another group?
2. Which real data source is the first connector worth building after the prototype: custodian/admin files, Excel, Bloomberg/market data, Outlook, or a portfolio-management system?
3. What actions, if any, should Payo ever be allowed to complete without a human approval?
4. What data-retention and deployment model can the product honestly support after legal and technical validation?

## 20. Source handling note

This brief uses the supplied pitch, Zero-Trace draft, and competitor notes as research inputs. It preserves the valuable product ideas—finance-native templates, transparent steps, deterministic calculations, progressive disclosure, and human review—but does not treat unverified business, regulatory, security, performance, pricing, or integration claims in those documents as V0 requirements or facts.
