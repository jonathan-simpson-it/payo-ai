# Payo AI Design Philosophy

## Purpose

This document defines the interaction and visual rules for Payo AI. It translates the qualities that make the supplied Copilot Studio screenshots feel simple and usable into a finance-native product language.

The goal is not to copy Copilot Studio's colours, branding, or exact layout. The goal is to reproduce its discipline: show only the decision the user needs now, keep the workflow legible, and make every control feel deliberate.

Payo is a finance workflow builder. Its users may understand funds, positions, NAV, exposure, cashflow, and review processes, but they should not need to understand node graphs, payloads, APIs, model parameters, or prompt engineering.

## The design promise

**Payo makes a complex finance process feel like a short sequence of understandable decisions.**

Every screen should help the user answer one of these questions:

1. What am I building or reviewing?
2. What happens next?
3. What do I need to decide?
4. What evidence supports the result?
5. Is this ready to release?

If a visual element does not help answer one of these questions, remove it, defer it, or make it secondary.

## What makes the reference UI work

### 1. One clear working surface

The screenshots establish a strong relationship between three areas:

- a compact navigation or tool rail;
- a central working canvas;
- a contextual inspector for the selected item.

The user is never asked to understand the whole product before acting. The canvas shows the current workflow. The inspector explains the selected step. The surrounding interface stays quiet.

**Payo rule:** every major screen has one dominant working surface. Keep global navigation narrow. Open detailed settings contextually, beside or over the selected workflow step.

### 2. Progressive disclosure

The reference does not show every setting at once. It starts with a small set of choices and reveals detail when the user has made a relevant selection.

**Payo rule:** expose the smallest useful decision first. Put thresholds, mappings, advanced conditions, model choices, and connection details behind an explicit `Advanced` or `Details` action.

### 3. Plain-language options

The trigger screen uses a title, a short explanation, and a clear selected state. It does not ask the user to decode technical implementation terms.

**Payo rule:** every option must answer “what does this do?” in one short sentence. Use finance language and verbs:

- `Load NAV file` rather than `Input payload`
- `Compare valuations` rather than `Run transform`
- `Set tolerance` rather than `Configure threshold parameter`
- `Request review` rather than `Human-in-the-loop node`

Technical detail may exist in an advanced inspection view, never as the default vocabulary.

### 4. Selection is visible

The selected trigger and selected input are unmistakable. The UI uses a clear boundary, tonal shift, checkmark, or focus ring instead of making the user infer selection from a subtle colour change.

**Payo rule:** every selected template, step, tab, input type, row, and review decision has a visible selected state that remains accessible without relying on colour alone.

### 5. Small menus, strong grouping

The add-step surface groups actions into a manageable set. It provides search and a short list of meaningful categories rather than presenting a wall of unrelated controls.

**Payo rule:** organise the Payo step library around the user's work:

- `Inputs`
- `Finance checks`
- `Calculations`
- `AI-assisted drafts`
- `Review`
- `Outputs`

Use a compact search field only when the available list is long enough to justify it. Do not present a marketplace of connectors before the workflow is understood.

### 6. Contextual actions

The controls are close to the thing they affect. The selected step has its inspector. The workflow has its run action. The review exception has its decision controls.

**Payo rule:** do not make users navigate to a separate settings page to make a local workflow decision.

### 7. Clear modes

The reference separates build, activity, monitor, review, and publish states. A user can tell whether they are editing a workflow, inspecting a run, or preparing to release it.

**Payo rule:** each mode has a distinct but consistent header state:

- `Build` — edit the workflow
- `Test` — run sample data and inspect steps
- `Review` — resolve exceptions or approve output
- `Ready` — workflow has passed the current test state
- `History` — inspect prior runs and versions

Never mix editing controls and release controls without a visible mode boundary.

### 8. Status has meaning

The reference uses colour and labels for state, not decoration. A user can understand what is selected, active, completed, or awaiting attention.

**Payo rule:** every status must communicate a next action or a final state:

- `Draft` — can be edited
- `Testing` — sample run in progress
- `Needs review` — a person must decide
- `Complete` — run finished
- `Ready to publish` — review and test conditions met
- `Blocked` — a required input or decision is missing

Use green, amber, and red sparingly. Keep most of the interface neutral.

## Payo's visual language

### Workspace and public page are related, not identical

The public landing page should feel editorial and welcoming. The workspace should feel operational and precise. Both use the same type, spacing, icon, and status system.

The workspace may use a dark finance-terminal canvas where it improves concentration and makes workflow structure legible. The landing page should remain light unless testing shows a clear reason to use a dark surface.

Do not use darkness, neon, or terminal styling as a shortcut for “finance”. Finance credibility comes from hierarchy, numbers, source labels, review state, and calm control.

### Colour rules

Use a small semantic palette:

- `Canvas`: warm white, pale grey, or a near-black workspace surface
- `Text`: near-black or near-white depending on surface
- `Border`: quiet neutral with enough contrast to define structure
- `Primary`: one muted blue or deep teal
- `Complete`: restrained green
- `Needs review`: restrained amber
- `Exception`: restrained red
- `Brand detail`: the Payo character's orange, used sparingly

The Payo character may blink in the navigation, empty state, or a small preview. It must not turn every state into orange branding. The blink is a signature detail, not a status signal.

### Typography rules

- Use a modern sans-serif with excellent number legibility.
- Use sentence case for most labels.
- Use uppercase only for small section labels such as `TEMPLATES` or `REVIEW QUEUE`.
- Use tabular numerals for NAV, exposure, percentages, dates, and run durations.
- Keep headings short and concrete.
- Make primary action labels verbs: `Run test`, `Review exceptions`, `Publish workflow`.
- Avoid marketing language inside the workspace.

### Shape and surface rules

- Use flat surfaces and thin borders to define sections.
- Use small radii for controls and panels; do not turn every element into a pill.
- Reserve pills for compact status, category, or filter labels.
- Use a selected border or subtle surface change instead of glow or heavy shadow.
- Use shadows only to separate an overlay or inspector from the working canvas.
- Avoid stacked cards that all have the same radius, background, and shadow.

### Icon rules

- Use a consistent line icon family.
- Icons explain an action or category; they do not replace the label.
- Never use emoji as product icons.
- Use colour to distinguish categories only where the colour has a stable meaning.
- The Payo character is the only expressive visual mark and should remain small.

## The Payo workflow model

Payo should present a workflow as a readable sentence in steps:

**Input → Map → Calculate or check → Review → Output**

The user should be able to understand the entire path without opening every step.

### Step cards

Every step card contains:

- step number or sequence position;
- finance-facing action name;
- one-line purpose;
- source or key setting where useful;
- state when a run is active;
- a clear affordance for selecting or opening it.

Examples:

- `1. Load administrator NAV`
- `2. Map fund names`
- `3. Calculate variance · tolerance 0.50%`
- `4. Review material exceptions`
- `5. Create reconciliation summary`

### The selected step

Selecting a step opens one contextual inspector. The inspector must show:

1. What this step does.
2. What it receives.
3. The small set of settings most users need.
4. What it will produce.
5. An `Advanced` disclosure for extra detail.

The selected step remains visibly connected to its inspector. Avoid opening multiple competing inspectors.

### Add-step experience

The add-step menu is the Payo equivalent of the reference `Add` panel. It should open close to the insertion point and present a curated list.

Default categories:

- `Load data`
- `Map fields`
- `Calculate`
- `Check limit`
- `Draft summary`
- `Request review`
- `Create report`

For finance users, the common action should be visible immediately. A technical connector catalogue belongs in a later connection flow, after the user has selected the type of data or action required.

## Finance-native rules

### Source before output

Any important result must show its source or input context. A user should be able to see which sample file, period, portfolio, or rule produced a row or finding.

Use source language such as:

- `Sample administrator NAV`
- `Sample internal valuation`
- `Limit policy · 0.50% tolerance`
- `Market snapshot · 30 Sep 2026`

### Review before release

The review gate should feel like the natural next step in a finance process, not a generic approval popup.

Show:

- what was flagged;
- why it was flagged;
- the relevant values and threshold;
- who is expected to review it;
- what approving or returning will do next.

Use action labels such as `Approve summary`, `Return for review`, and `Open source row`.

### Deterministic work deserves visual priority

Calculations, tolerance checks, reconciliations, and limit comparisons should be presented as structured steps with explicit values. AI-assisted drafting should be visually labelled as a draft and should never look like the source of a definitive financial decision.

### Empty states are instructions

An empty workflow should tell the user what to do next:

`Choose a finance template to begin.`

An empty review queue should say:

`No sample exceptions are waiting for review.`

An empty connection state should say:

`No live connections are configured. This prototype uses sample inputs.`

## Audience rules

Payo serves two related audiences:

1. Finance professionals: investment and risk analysts, fund operations, and finance operations staff.
2. SMEs: business owners and finance staff who need dependable reporting and checks without a specialist automation team.

Do not force SME users to learn institutional finance terminology before they can understand the product. Provide a role-sensitive explanation of the same core pattern:

- analyst: `Check exposure against limits`
- fund operations: `Reconcile administrator and internal values`
- SME finance: `Prepare a cashflow update from the files you already use`

The workflow structure may be shared, while the labels, sample data, and first template differ.

## Landing-page rules

The landing page should show the product, not only describe it.

Required sequence:

1. Clear statement of what Payo does.
2. A working-looking finance UI preview.
3. Three audience roles with changing examples.
4. A feature demonstration with visible workflow or run states.
5. Short evidence or context section with source links.
6. Clear path into the workspace.

Each section should answer one question. Avoid repeating the same claim in different cards.

Use proof that is honestly labelled:

- `Simulated workflow`
- `Sample data`
- `AI-assisted draft`
- `Planned connection`

Do not use fictional client logos, live-market language, or unverified claims of regulatory approval, compliance, security, or savings.

## Interaction rules

### One obvious primary action

Every surface has one strongest action:

- landing page: `Explore the workspace`
- template card: `Use template`
- builder: `Run test`
- review: `Approve summary` or `Return for review`
- result: `Run again` or `Back to workflow`

Secondary actions must be quieter and placed consistently.

### Direct manipulation with safe fallbacks

Support drag-and-drop where it improves understanding, but every drag action needs an accessible alternative such as move up, move down, or an explicit menu.

### Calm feedback

Use small progress changes, checkmarks, borders, and status labels. Avoid celebration effects, loud toast stacks, or excessive motion. The user should feel in control of the run.

### Keyboard and focus

Every selectable step, tab, input type, table row, review decision, and primary action must have:

- keyboard access;
- visible focus;
- a selected state that does not depend on colour alone;
- a clear name for assistive technology.

## What Payo should never do

- Start the user with a blank technical canvas.
- Make chat the default way to build a workflow.
- Show every connector, setting, model, or branch at once.
- Hide the workflow path behind an AI-generated answer.
- Use orange, purple, or neon colour to signal generic “AI”.
- Use a mascot as a substitute for product clarity.
- Present sample data as live financial data.
- Make a draft look like an approved financial decision.
- Make the user leave the current workflow to understand a selected step.
- Use a warning, badge, or status colour without a clear meaning.

## Design tokens to start from

These are starting ranges rather than fixed brand values:

| Token                | Starting rule                                          |
| -------------------- | ------------------------------------------------------ |
| Page background      | `#F5F4F0` or an equivalent quiet neutral               |
| Workspace background | `#111315` or a quiet light neutral, chosen per surface |
| Primary text         | Near-black on light, near-white on dark                |
| Border               | 1px low-contrast neutral                               |
| Primary accent       | Muted blue or deep teal                                |
| Complete             | Muted green                                            |
| Needs review         | Muted amber                                            |
| Exception            | Muted red                                              |
| Brand mark           | Existing Payo orange, sparingly                        |
| Radius               | Small controls 6–10px; larger surfaces 10–14px         |
| Shadow               | Only for overlays and inspectors                       |

Do not treat these values as a reason to add decorative colour. Semantic meaning and hierarchy matter more than exact hex values.

## Review checklist

Before approving a Payo screen, ask:

### Clarity

- Can a first-time user say what this screen is for?
- Is the next action obvious?
- Are the labels written for a finance user rather than a developer?

### Focus

- Is there one dominant working surface?
- Does the selected object have one contextual inspector?
- Are advanced options hidden until needed?

### Trust

- Can the user see the source, threshold, or evidence behind the result?
- Is a human decision explicit wherever an output needs review?
- Are sample, simulated, draft, and planned states labelled?

### Finance fit

- Are numbers easy to scan and compare?
- Do status colours have operational meaning?
- Does the interface support both a finance professional and an SME user without becoming generic?

### Restraint

- Has any decorative element been added without helping a decision?
- Are cards, pills, shadows, colours, and animations being used sparingly?
- Is the Payo character still present but secondary to the work?

## One-sentence test

If a screen cannot be described as **“the place where a finance user makes one clear decision about one visible workflow”**, it needs to be simplified.
